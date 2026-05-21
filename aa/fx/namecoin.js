/*

alphaama
fx: namecoin .bit nip-05 resolver

resolves name@something.bit -> nostr pubkey + relays via ElectrumX,
following ifa-0001 Domain Name Object (DNO).

drop-in shape match for NostrTools.nip05.queryProfile:
returns {pubkey, relays?} or null.

wire format: ElectrumX v1.4.1 over wss, blockchain.name.show / name_show.
supports the three nostr value shapes per ifa-0001:
  - {"nostr": "<hex64>"}                                  // single key
  - {"nostr": {"pubkey": "<hex64>", "relays": [...]}}     // single id
  - {"nostr": {"names": {"<local>": "<hex64>", ...}}}     // names map
plus shallow `import` walking (one hop) for d/<name> -> id/<name>.

server set mirrors amethyst's DEFAULT_ELECTRUMX_SERVERS browser-WSS subset.
bare-IP entries from amethyst are skipped (browser WSS needs SAN-matched cert).
the testls.space TLS entry is the only one without a pinned trust store on
amethyst's side; the others are pinned-cert and only happen to be reachable
because public CAs cover them too. when N3 (TLSA TOFU pinning) lands the
pinned ones can be hardened here too.

*/


// browser-WSS ElectrumX servers (parity with amethyst, minus bare-IP rows)
aa.fx.namecoin_servers =
[
  'wss://electrumx.testls.space:50004',
  'wss://nmc2.bitcoins.sk:57004',
  'wss://relay.testls.bit:50004',
  'wss://electrum.nmc.ethicnology.com:50004',
];


// small per-page cache: name -> {ts, val}
// split TTL: positive results live 5 min, negatives 30 s so one bad
// lookup doesn't poison a name for the full window.
aa.fx.namecoin_cache = new Map();
aa.fx.namecoin_ttl = 5 * 60 * 1000;
aa.fx.namecoin_ttl_negative = 30 * 1000;


// is this a .bit nip-05? (cheap pre-check, callers branch on it)
aa.fx.is_bit_nip05 =s=>
{
  if (!s || typeof s !== 'string') return false;
  let host = s.includes('@') ? s.split('@')[1] : s;
  if (!host) return false;
  host = host.trim().toLowerCase().replace(/\.$/,'');
  return host.endsWith('.bit')
};


// nip-05-shape resolver. s is "<local>@<host>.bit" or "<host>.bit"
aa.fx.nip05_namecoin =async s=>
{
  if (!s || typeof s !== 'string') return null;
  s = s.trim().toLowerCase();

  // must end in .bit (allow trailing dot just in case)
  let host_part = s.includes('@') ? s.split('@')[1] : s;
  if (!host_part) return null;
  host_part = host_part.replace(/\.$/,'');
  if (!host_part.endsWith('.bit')) return null;

  let local = s.includes('@') ? s.split('@')[0] : '_';
  if (!local) local = '_';

  // first label of the host is the namecoin name; sub-labels walk into map
  let labels = host_part.slice(0, -('.bit'.length)).split('.').filter(Boolean);
  if (!labels.length) return null;
  let name = labels.pop();
  // remaining sub-labels (closest to .bit first) become map descent steps
  let map_path = labels.reverse();

  // try d/<name> then id/<name> (per ifa-0001 namespaces)
  for (const ns of ['d','id'])
  {
    let key = `${ns}/${name}`;
    let val = await aa.fx.namecoin_resolve(key);
    if (!val) continue;

    // descend through any sub-labels via `map`
    for (const step of map_path)
    {
      if (val && typeof val === 'object' && val.map && val.map[step])
      {
        val = val.map[step];
        continue
      }
      val = null;
      break
    }
    if (!val) continue;

    // shallow one-hop `import` per ifa-0001 (avoid full walk to keep tight)
    if (val.import && !val.nostr)
    {
      let target = Array.isArray(val.import) ? val.import[0] : val.import;
      if (typeof target === 'string')
      {
        let imp = await aa.fx.namecoin_resolve(target);
        if (imp && typeof imp === 'object') val = {...imp, ...val};
      }
    }

    let n = val.nostr;
    if (!n) continue;

    // three shapes
    if (typeof n === 'string' && aa.fx.is_key(n))
      return {pubkey:n, relays:[]};
    if (typeof n === 'object' && typeof n.pubkey === 'string' && aa.fx.is_key(n.pubkey))
      return {pubkey:n.pubkey, relays:Array.isArray(n.relays) ? n.relays : []};
    if (typeof n === 'object' && n.names && typeof n.names === 'object')
    {
      let pk = n.names[local];
      if (typeof pk === 'string' && aa.fx.is_key(pk))
        return {pubkey:pk, relays:Array.isArray(n.relays) ? n.relays : []};
    }
  }
  return null
};


// fetch and parse a single namecoin name. returns DNO value object or null.
aa.fx.namecoin_resolve =async key=>
{
  let now = Date.now();
  let hit = aa.fx.namecoin_cache.get(key);
  let ttl = (hit && hit.val) ? aa.fx.namecoin_ttl : aa.fx.namecoin_ttl_negative;
  if (hit && (now - hit.ts) < ttl) return hit.val;

  let val = null;
  for (const url of aa.fx.namecoin_servers)
  {
    try
    {
      let raw = await aa.fx.electrumx_name_show(url, key, 8000);
      if (raw == null) continue;
      let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === 'object')
      {
        val = parsed;
        break
      }
    }
    catch (er) { /* try next */ }
  }
  aa.fx.namecoin_cache.set(key, {ts:now, val});
  return val
};


// one-shot ElectrumX JSON-RPC blockchain.name.show over wss
// id-matched: ElectrumX may push unsolicited frames (server.banner,
// headers.subscribe notifications) BEFORE the response, so we filter on
// the outgoing request id and drop anything that doesn't match.
aa.fx.electrumx_name_show =(url, name, timeout_ms=8000)=> new Promise((resolve,reject)=>
{
  let ws;
  let done = false;
  // unique-ish per call; full collision avoidance isn't needed (one socket,
  // one outstanding request) but it's cheap insurance against any future reuse.
  let req_id = (Date.now() & 0x7fffffff) ^ ((Math.random() * 0x7fffffff) | 0);
  let to = setTimeout(()=>
  {
    if (done) return;
    done = true;
    try { ws && ws.close() } catch {}
    reject(new Error('timeout'))
  }, timeout_ms);
  try { ws = new WebSocket(url) }
  catch (er) { clearTimeout(to); return reject(er) }

  ws.onopen =()=>
  {
    let req = JSON.stringify({id:req_id, method:'blockchain.name.show', params:[name]});
    try { ws.send(req) }
    catch (er) { clearTimeout(to); done=true; reject(er) }
  };
  ws.onerror =er=>
  {
    if (done) return;
    done = true; clearTimeout(to);
    try { ws.close() } catch {}
    reject(er)
  };
  ws.onmessage =ev=>
  {
    if (done) return;
    let txt = typeof ev.data === 'string' ? ev.data : '';
    let msg;
    try { msg = JSON.parse(txt) }
    catch (er) { /* keep listening for a parseable frame until timeout */ return }
    // server-initiated push (notification): has `method`, no matching id.
    if (msg && typeof msg === 'object' && msg.method) return;
    // response must echo our id; anything else is a stray frame, ignore.
    if (!msg || msg.id !== req_id) return;
    // matched response — claim the slot.
    done = true; clearTimeout(to);
    try { ws.close() } catch {}
    if (msg.error) return reject(new Error(msg.error.message || 'rpc error'));
    // ElectrumX returns either the raw JSON value string or an object {name,value,...}
    let v = msg.result;
    if (v == null) return resolve(null);
    if (typeof v === 'object' && 'value' in v) return resolve(v.value);
    resolve(v)
  };
});


/*
sanity check (live, manual — comment block, no test runner in repo):

  // expects mstrofnone npub as hex
  await aa.fx.nip05_namecoin('m@testls.bit');
  // -> {pubkey:'43185edecb675892824b1a37a57f3e407fbde2eda7201a3829b8cf4ba7c5b4f0', relays:[...]}

  await aa.fx.nip05_namecoin('mstrofnone.bit');
  await aa.fx.nip05_namecoin('doesnotexist.bit');
  // -> null
*/
