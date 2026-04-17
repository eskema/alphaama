// m/ratchet test bench
// runs in isolation — no alphaama init, no relays
// uses RATCHET (from /dep/ratchet.js) and NostrTools (from /dep/nostr-tools.js)

const log_el = document.getElementById('log');
const ctrl_el = document.getElementById('controls');

const log =(msg, cla='')=>
{
  let line = document.createElement('div');
  if (cla) line.className = cla;
  line.textContent = msg;
  log_el.appendChild(line);
  log_el.scrollTop = log_el.scrollHeight;
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

// in-memory mock transport — replaces relay
// shared bus: every "publish" fans out to every "subscribe" callback that matches the filter
const make_mock_relay =()=>
{
  const subs = []; // {filter, on_event}
  const seen = new Set(); // dedupe by event id
  return {
    publish(event)
    {
      if (seen.has(event.id)) return Promise.resolve(event);
      seen.add(event.id);
      // deliver synchronously to all matching subs
      for (let s of subs)
      {
        if (filter_matches(s.filter, event))
        {
          try { s.on_event(event) }
          catch(e) { console.error('sub callback threw', e) }
        }
      }
      return Promise.resolve(event);
    },
    subscribe(filter, on_event)
    {
      const sub = {filter, on_event};
      subs.push(sub);
      return ()=> { let i = subs.indexOf(sub); if (i >= 0) subs.splice(i, 1); };
    },
    fetch(filter)
    {
      return Promise.resolve([]); // not used in v1 tests
    },
    stats()
    {
      return {subs: subs.length, seen: seen.size};
    },
  };
};

// minimal nostr filter matcher (kinds + authors + #p only — enough for ratchet)
const filter_matches =(filter, event)=>
{
  if (filter.kinds && !filter.kinds.includes(event.kind)) return false;
  if (filter.authors && !filter.authors.includes(event.pubkey)) return false;
  if (filter.ids && !filter.ids.includes(event.id)) return false;
  for (let key in filter)
  {
    if (key[0] !== '#') continue;
    let tag_name = key.slice(1);
    let wanted = filter[key];
    let found = event.tags.some(t => t[0] === tag_name && wanted.includes(t[1]));
    if (!found) return false;
  }
  return true;
};

// build a NostrSubscribe callback bound to a mock relay
const mk_sub =relay=> (filter, on_event)=> relay.subscribe(filter, on_event);

// ----- tests -----

const tests = {};

// scenario: alice and bob bootstrap a session via shared init params, exchange messages
tests.basic_send_recv =async()=>
{
  head('test: basic_send_recv');

  const relay = make_mock_relay();
  const sub = mk_sub(relay);

  // out-of-band handshake material — in real usage Invite handles this
  const alice_eph = NostrTools.generateSecretKey();
  const bob_eph   = NostrTools.generateSecretKey();
  const alice_eph_pub = NostrTools.getPublicKey(alice_eph);
  const bob_eph_pub   = NostrTools.getPublicKey(bob_eph);
  const shared_secret = crypto.getRandomValues(new Uint8Array(32));

  info('alice eph pub: ' + alice_eph_pub.slice(0, 16) + '…');
  info('bob   eph pub: ' + bob_eph_pub.slice(0, 16)   + '…');

  // alice initiates
  const alice_session = RATCHET.Session.init(
    sub,
    bob_eph_pub,        // their ephemeral pubkey
    alice_eph,          // our ephemeral privkey
    true,               // isInitiator
    shared_secret,
    'alice'
  );

  // bob responds
  const bob_session = RATCHET.Session.init(
    sub,
    alice_eph_pub,
    bob_eph,
    false,
    shared_secret,
    'bob'
  );

  // bob listens
  let bob_received = [];
  bob_session.onEvent((rumor, outer)=>
  {
    bob_received.push({rumor, outer});
  });

  // alice sends
  const {event: outer1, innerEvent: rumor1} = alice_session.send('hello bob');
  info('alice → outer kind: ' + outer1.kind + ' size: ' + JSON.stringify(outer1).length + 'b');
  info('alice → rumor kind: ' + rumor1.kind + ' content: ' + JSON.stringify(rumor1.content));

  await relay.publish(outer1);

  // give microtasks a chance
  await new Promise(r => setTimeout(r, 0));

  assert(bob_received.length === 1, 'bob received 1 message');
  assert(bob_received[0].rumor.content === 'hello bob', 'rumor content matches');
  assert(bob_received[0].outer.kind === RATCHET.MESSAGE_EVENT_KIND, 'outer is kind ' + RATCHET.MESSAGE_EVENT_KIND);

  // bob replies
  let alice_received = [];
  alice_session.onEvent((rumor, outer)=>
  {
    alice_received.push({rumor, outer});
  });

  const {event: outer2, innerEvent: rumor2} = bob_session.send('hi alice');
  info('bob → outer kind: ' + outer2.kind);
  await relay.publish(outer2);
  await new Promise(r => setTimeout(r, 0));

  assert(alice_received.length === 1, 'alice received 1 reply');
  assert(alice_received[0].rumor.content === 'hi alice', 'reply content matches');

  alice_session.close();
  bob_session.close();
  ok('basic_send_recv passed (' + relay.stats().seen + ' events on the wire)');
};

// scenario: dump the actual wire format of a kind 1060 event
tests.wire_inspect =async()=>
{
  head('test: wire_inspect');

  const relay = make_mock_relay();
  const sub = mk_sub(relay);
  const alice_eph = NostrTools.generateSecretKey();
  const bob_eph   = NostrTools.generateSecretKey();
  const shared = crypto.getRandomValues(new Uint8Array(32));

  const alice = RATCHET.Session.init(sub, NostrTools.getPublicKey(bob_eph),   alice_eph, true,  shared, 'alice');
  const bob   = RATCHET.Session.init(sub, NostrTools.getPublicKey(alice_eph), bob_eph,   false, shared, 'bob');

  const {event} = alice.send('inspect me');

  info('--- raw outer event ---');
  log(JSON.stringify(event, null, 2));

  assert(event.kind === 1060, 'kind === 1060 (MESSAGE_EVENT_KIND)');
  assert(typeof event.pubkey === 'string' && event.pubkey.length === 64, 'pubkey is 64 hex chars');
  assert(typeof event.sig === 'string' && event.sig.length === 128, 'sig is 128 hex chars');
  assert(typeof event.content === 'string' && event.content.length > 0, 'content is non-empty (encrypted)');
  assert(Array.isArray(event.tags), 'tags is array');

  const header_tag = event.tags.find(t => t[0] === 'header');
  assert(header_tag !== undefined, 'has [header, ...] tag');
  assert(typeof header_tag[1] === 'string' && header_tag[1].length > 0, 'header tag value non-empty (encrypted)');

  // confirm signer pubkey is NOT alice's eph keypair (it should be the ratchet's "current" key,
  // which on the very first send is alice's ephemeral handshake key)
  info('signer pubkey: ' + event.pubkey.slice(0, 16) + '…');

  alice.close();
  bob.close();
  ok('wire_inspect passed');
};

// scenario: 10-message ping-pong, exercise DH ratchet steps
tests.multi_step_ratchet =async()=>
{
  head('test: multi_step_ratchet');

  const relay = make_mock_relay();
  const sub = mk_sub(relay);
  const alice_eph = NostrTools.generateSecretKey();
  const bob_eph   = NostrTools.generateSecretKey();
  const shared = crypto.getRandomValues(new Uint8Array(32));

  const alice = RATCHET.Session.init(sub, NostrTools.getPublicKey(bob_eph),   alice_eph, true,  shared, 'alice');
  const bob   = RATCHET.Session.init(sub, NostrTools.getPublicKey(alice_eph), bob_eph,   false, shared, 'bob');

  let alice_inbox = [];
  let bob_inbox = [];
  alice.onEvent(r => alice_inbox.push(r.content));
  bob.onEvent(r => bob_inbox.push(r.content));

  for (let i = 0; i < 10; i++)
  {
    let from_alice = alice.send('a' + i);
    await relay.publish(from_alice.event);
    await new Promise(r => setTimeout(r, 0));
    let from_bob = bob.send('b' + i);
    await relay.publish(from_bob.event);
    await new Promise(r => setTimeout(r, 0));
  }

  assert(bob_inbox.length === 10,   'bob received 10 messages');
  assert(alice_inbox.length === 10, 'alice received 10 messages');
  assert(bob_inbox[0]  === 'a0', 'bob first  = a0');
  assert(bob_inbox[9]  === 'a9', 'bob last   = a9');
  assert(alice_inbox[0] === 'b0', 'alice first = b0');
  assert(alice_inbox[9] === 'b9', 'alice last  = b9');

  alice.close();
  bob.close();
  ok('multi_step_ratchet passed (' + relay.stats().seen + ' events)');
};

// scenario: messages arrive out of order
tests.out_of_order =async()=>
{
  head('test: out_of_order');

  const relay = make_mock_relay();
  const sub = mk_sub(relay);
  const alice_eph = NostrTools.generateSecretKey();
  const bob_eph   = NostrTools.generateSecretKey();
  const shared = crypto.getRandomValues(new Uint8Array(32));

  const alice = RATCHET.Session.init(sub, NostrTools.getPublicKey(bob_eph),   alice_eph, true,  shared, 'alice');
  const bob   = RATCHET.Session.init(sub, NostrTools.getPublicKey(alice_eph), bob_eph,   false, shared, 'bob');

  let bob_inbox = [];
  bob.onEvent(r => bob_inbox.push(r.content));

  // alice sends 3 messages BEFORE bob has subscribed-properly path is fine,
  // but here we simulate out-of-order DELIVERY
  let m1 = alice.send('one').event;
  let m2 = alice.send('two').event;
  let m3 = alice.send('three').event;

  // deliver in order [3, 1, 2]
  await relay.publish(m3);
  await new Promise(r => setTimeout(r, 0));
  await relay.publish(m1);
  await new Promise(r => setTimeout(r, 0));
  await relay.publish(m2);
  await new Promise(r => setTimeout(r, 0));

  assert(bob_inbox.length === 3, 'bob received all 3 (got ' + bob_inbox.length + ')');
  assert(bob_inbox.includes('one'),   'bob has "one"');
  assert(bob_inbox.includes('two'),   'bob has "two"');
  assert(bob_inbox.includes('three'), 'bob has "three"');

  alice.close();
  bob.close();
  ok('out_of_order passed');
};

// run all
const run_all =async()=>
{
  log_el.textContent = '';
  let pass = 0, fail = 0;
  for (let name in tests)
  {
    try { await tests[name](); pass++; }
    catch(e) { fail++; err('FAIL ' + name + ': ' + (e.message || e)); console.error(e); }
  }
  head('=== ' + pass + ' passed, ' + fail + ' failed ===');
};

// build buttons
const mk_button =(label, fn)=>
{
  let b = document.createElement('button');
  b.textContent = label;
  b.onclick = async()=>
  {
    log_el.textContent = '';
    try { await fn(); }
    catch(e) { err((e && e.message) || e); console.error(e); }
  };
  ctrl_el.appendChild(b);
  return b;
};

mk_button('run all',          run_all);
for (let name in tests) mk_button(name, tests[name]);

// auto-run on load
window.addEventListener('load', ()=>
{
  info('RATCHET version exports: ' + Object.keys(RATCHET).length);
  info('MESSAGE_EVENT_KIND = ' + RATCHET.MESSAGE_EVENT_KIND);
  info('INVITE_EVENT_KIND = '  + RATCHET.INVITE_EVENT_KIND);
  info('CHAT_MESSAGE_KIND = '  + RATCHET.CHAT_MESSAGE_KIND);
  info('click "run all" to start');
});
