// aa.fx.namecoin test bench
// runs in isolation: no relays, no live ElectrumX.
// mocks window.WebSocket to replay server-initiated push frames (server.banner,
// headers.subscribe) BEFORE the real response, then asserts the resolver
// returns the parsed value instead of null.

const log_el = document.getElementById('log');

const log =(msg, cla='')=>
{
  let line = document.createElement('div');
  if (cla) line.className = cla;
  line.textContent = msg;
  log_el.appendChild(line);
};

const head =msg=> log(msg, 'head');
const ok   =msg=> log('  ok  ' + msg, 'ok');
const err  =msg=> log('  ERR ' + msg, 'err');
const info =msg=> log('  -   ' + msg, 'info');

const assert =(cond, msg)=>
{
  if (cond) ok(msg);
  else { err(msg); throw new Error('assertion failed: ' + msg); }
};


// mock WebSocket: takes a `script` describing what frames to deliver and
// when, plus when to ack the outgoing send.
function make_mock_ws_class(script)
{
  return class MockWS
  {
    constructor(url)
    {
      this.url = url;
      this.readyState = 0;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.onclose = null;
      // open async to mimic real ws
      queueMicrotask(()=>
      {
        this.readyState = 1;
        this.onopen && this.onopen({});
      });
    }
    send(data)
    {
      let req;
      try { req = JSON.parse(data) } catch { req = null }
      // hand outgoing frame + this MockWS to the script
      script.on_send && script.on_send(req, this);
    }
    close() { this.readyState = 3; this.onclose && this.onclose({}) }
  };
}


// helper: deliver a frame on next microtask
function push(ws, obj)
{
  queueMicrotask(()=>
  {
    if (ws.readyState !== 1) return;
    ws.onmessage && ws.onmessage({data: JSON.stringify(obj)});
  });
}


// --- swap WebSocket -------------------------------------------------
const real_ws = window.WebSocket;
function with_mock(script, fn)
{
  window.WebSocket = make_mock_ws_class(script);
  return Promise.resolve(fn()).finally(()=> { window.WebSocket = real_ws });
}


// --- tests ----------------------------------------------------------
async function run()
{
  // strip cached entries between tests
  const reset_cache =()=> aa.fx.namecoin_cache.clear();

  // single server, deterministic
  aa.fx.namecoin_servers = ['wss://mock-electrumx.invalid:50004'];

  const fake_value =
  {
    nostr:
    {
      pubkey: '43185edecb675892824b1a37a57f3e407fbde2eda7201a3829b8cf4ba7c5b4f0',
      relays: ['wss://relay.example']
    }
  };
  const fake_value_str = JSON.stringify(fake_value);


  // ---------- test 1: server-initiated push BEFORE response ----------
  head('test 1: server.banner push arrives before the response');
  reset_cache();
  await with_mock(
    {
      on_send: (req, ws)=>
      {
        // 1) unsolicited server.banner push — no id, has method
        push(ws, {jsonrpc:'2.0', method:'server.banner', params:['hello from mock']});
        // 2) unsolicited headers.subscribe notification — no id, has method
        push(ws, {jsonrpc:'2.0', method:'blockchain.headers.subscribe', params:[{height:999}]});
        // 3) real response — echoes the outgoing id
        push(ws, {jsonrpc:'2.0', id:req.id, result:{name:req.params[0], value: fake_value_str}});
      }
    },
    async ()=>
    {
      let v = await aa.fx.electrumx_name_show('wss://mock-electrumx.invalid:50004', 'd/m', 4000);
      assert(typeof v === 'string', 'electrumx_name_show returned a string');
      let parsed = JSON.parse(v);
      assert(parsed && parsed.nostr && parsed.nostr.pubkey === fake_value.nostr.pubkey,
        'returned value carries the expected nostr pubkey');
    }
  );


  // ---------- test 2: pre-fix simulation — frame WITHOUT id ----------
  // confirms the new id-match keeps listening past a stray frame and
  // does not resolve(null). (the old code would have resolved null here.)
  head('test 2: stray frame with no id is dropped, real response wins');
  reset_cache();
  await with_mock(
    {
      on_send: (req, ws)=>
      {
        // stray frame: looks responsey but missing id
        push(ws, {jsonrpc:'2.0', result:null});
        // real response after
        push(ws, {jsonrpc:'2.0', id:req.id, result:{name:req.params[0], value: fake_value_str}});
      }
    },
    async ()=>
    {
      let v = await aa.fx.electrumx_name_show('wss://mock-electrumx.invalid:50004', 'd/m', 4000);
      assert(v != null, 'did not resolve to null on stray frame');
      let parsed = JSON.parse(v);
      assert(parsed.nostr.pubkey === fake_value.nostr.pubkey, 'real response value reached caller');
    }
  );


  // ---------- test 3: mismatched id is dropped ---------------------
  head('test 3: frame with wrong id is dropped, real response wins');
  reset_cache();
  await with_mock(
    {
      on_send: (req, ws)=>
      {
        push(ws, {jsonrpc:'2.0', id: (req.id ^ 0xdeadbeef), result:'wrong-response'});
        push(ws, {jsonrpc:'2.0', id: req.id,                result:{value: fake_value_str}});
      }
    },
    async ()=>
    {
      let v = await aa.fx.electrumx_name_show('wss://mock-electrumx.invalid:50004', 'd/m', 4000);
      assert(v === fake_value_str, 'returned the correct (matching-id) frame');
    }
  );


  // ---------- test 4: rpc error propagates -------------------------
  head('test 4: matching-id error frame rejects');
  reset_cache();
  let rejected = false;
  await with_mock(
    {
      on_send: (req, ws)=>
      {
        push(ws, {jsonrpc:'2.0', method:'server.banner', params:['x']});
        push(ws, {jsonrpc:'2.0', id:req.id, error:{code:-32600, message:'bad name'}});
      }
    },
    async ()=>
    {
      try { await aa.fx.electrumx_name_show('wss://mock-electrumx.invalid:50004', 'd/m', 4000) }
      catch (er) { rejected = /bad name/.test(er.message); }
      assert(rejected, 'rpc error message surfaced via reject');
    }
  );


  // ---------- test 5: only pushes -> times out ---------------------
  head('test 5: only server-initiated frames -> timeout (no false resolve)');
  reset_cache();
  let timed_out = false;
  await with_mock(
    {
      on_send: (req, ws)=>
      {
        push(ws, {jsonrpc:'2.0', method:'server.banner', params:['x']});
        push(ws, {jsonrpc:'2.0', method:'blockchain.headers.subscribe', params:[{height:1}]});
        // no real response intentionally
      }
    },
    async ()=>
    {
      try { await aa.fx.electrumx_name_show('wss://mock-electrumx.invalid:50004', 'd/m', 250) }
      catch (er) { timed_out = /timeout/.test(er.message); }
      assert(timed_out, 'pure-push scenario rejected with timeout');
    }
  );


  // ---------- test 6: negative-cache TTL is short ------------------
  head('test 6: null result is cached with the short negative TTL');
  reset_cache();
  // populate a null entry directly
  aa.fx.namecoin_cache.set('d/missing', {ts: Date.now() - 60 * 1000, val: null});
  // 60s ago is past the 30s negative TTL → cache miss expected
  await with_mock(
    {
      on_send: (req, ws)=>
      {
        push(ws, {jsonrpc:'2.0', id:req.id, result:{value: fake_value_str}});
      }
    },
    async ()=>
    {
      let v = await aa.fx.namecoin_resolve('d/missing');
      assert(v && v.nostr && v.nostr.pubkey === fake_value.nostr.pubkey,
        'expired negative cache re-queried and got the live value');
    }
  );

  // and: positive entries still honour the 5-min TTL
  aa.fx.namecoin_cache.set('d/cached', {ts: Date.now() - 60 * 1000, val: {nostr:{pubkey:'a'.repeat(64)}}});
  let cached = await aa.fx.namecoin_resolve('d/cached');
  assert(cached && cached.nostr.pubkey === 'a'.repeat(64), 'positive cache served from memory after 60s');


  head('all tests passed');
}

run().catch(er=>
{
  err('run threw: ' + (er && er.message || er));
});
