/*

alphaama
mod    d
double ratchet (forward-secret direct messages)

vendored from nostr-double-ratchet (mmalmi). v1 ships upstream wire format:
  kind 1060 outer + encrypted "header" tag, kind 30078 invites, kind 1059 invite responses.
v2 will swap event construction for a 1059-shaped variant per the alphaama design notes.

loaded as part of aa.mods.

*/

aa.d =
{
  name: 'd',
  about: 'double ratchet (forward-secret DMs)',
  def: {id:'d'},
  scripts:
  [
    '/dep/ratchet.js',
    '/d/mk.js',
    '/d/view.js',
  ],
  styles:
  [
    '/d/d.css',
  ],
};


aa.d.load =async()=>
{
  let mod = aa.d;

  if (typeof RATCHET === 'undefined') { aa.log('[d] RATCHET dep missing'); return; }

  // load persistent state from IDB stuff store via standard mod.o pattern
  await aa.mod.load(mod);

  if (!mod.o) mod.o = {};
  mod.o.id = mod.def.id;

  if (!mod.o.device_id) mod.o.device_id = (RATCHET.generateDeviceId
    ? RATCHET.generateDeviceId()
    : NostrTools.utils.bytesToHex(NostrTools.generateSecretKey()).slice(0, 16));
  if (!mod.o.invites)          mod.o.invites          = {};  // shared_secret -> {serialized, url, created_at, revoked_at?, accepted_by?}
  if (!mod.o.sessions)         mod.o.sessions         = {};  // peer_pubkey -> {name, state, history, opened_at, closed_at?}
  if (!mod.o.pending_sessions) mod.o.pending_sessions = {};  // peer_pubkey -> {state, label, invite_secret, ts}
  if (!mod.o.log)              mod.o.log              = [];  // append-only audit log: {ts, type, ...}
  if (!mod.o.invite_seen)      mod.o.invite_seen      = {};  // shared_secret -> {event_id: ts} — invite responses already processed
  if (!mod.o.seen)             mod.o.seen             = {};  // peer -> ts (last read timestamp per session)

  // runtime maps — Session instances are not serializable, only their state is
  mod.live =
  {
    sessions: new Map(),  // peer -> {session, name, history}
    unsub:    new Map(),  // peer -> session.onEvent unsub
    invites:  new Map(),  // shared_secret -> {invite, listen_unsub, url, created_at}
    pending:  new Map(),  // peer -> {session, label, invite_secret} — accepted but not yet adopted
  };

  // build the panel element (mod.l) — defined in d/mk.js
  mod.l = aa.d.mk.panel();

  // view system integration
  aa.view.clears.push(aa.d.view_clear);

  // restore only after initial u setup is done (q.stuff finalize or on_load_sub
  // scheduling) — otherwise d.restore competes with the startup fetch pipeline
  aa.mod.ready('u:ready', ()=>
  {
    aa.mod.ready('r:manager', aa.d.restore);
  });

  // beforeunload flush — don't lose ratchet state on tab close
  window.addEventListener('beforeunload', ()=>
  {
    try { aa.d.save_now(); } catch(e) {}
  });

  // ----- CLI actions -----
  // helper: find a peer pubkey from a hex prefix (errors if zero or ambiguous)
  let find_peer =prefix=>
  {
    if (!prefix) throw new Error('peer pubkey or prefix required');
    let matches = [...aa.d.live.sessions.keys()].filter(k => k.startsWith(prefix));
    if (matches.length === 0) throw new Error('no peer matching ' + prefix.slice(0,12));
    if (matches.length > 1)   throw new Error('ambiguous prefix ' + prefix + ' — ' + matches.length + ' matches');
    return matches[0];
  };

  aa.actions.push(
  {
    action: ['d','invite'],
    description: 'create a double-ratchet invite (returns the URL)',
    exe: async()=>
    {
      let r = await aa.d.invite_create();
      return r.url;
    },
  });

  aa.actions.push(
  {
    action: ['d','join'],
    required: ['<invite_url>'],
    description: 'join a double-ratchet session via an invite URL',
    exe: async url =>
    {
      url = (url || '').trim();
      if (!url) return 'usage: d join <invite_url>';
      let r = await aa.d.invite_accept(url);
      return 'joined, session opened with ' + r.session.state.theirNextNostrPublicKey?.slice(0,12);
    },
  });

  aa.actions.push(
  {
    action: ['d','send'],
    required: ['<peer>','<text>'],
    description: 'send a message to a peer through their ratchet session',
    exe: async args =>
    {
      let [prefix, ...rest] = (args || '').split(/\s+/);
      let text = rest.join(' ');
      if (!prefix || !text) return 'usage: d send <peer> <text>';
      let peer = find_peer(prefix);
      let r = await aa.d.send(peer, text);
      return r ? 'sent ' + r.event.id.slice(0,12) : 'send failed';
    },
  });

  aa.actions.push(
  {
    action: ['d','export'],
    required: ['<peer>'],
    description: 'export encrypted history for peer — the other side pastes it after their `d import ` prefill',
    exe: async prefix =>
    {
      let peer = find_peer((prefix || '').trim());
      let cyphertext = await aa.d.export_history(peer);
      // prefix with OUR identity pubkey: from the other side's POV that IS the
      // peer arg for `d import` (their session is keyed by us, not by `peer`)
      let me = aa.u?.p?.pubkey;
      return me ? me + ' ' + cyphertext : cyphertext;
    },
  });

  aa.actions.push(
  {
    action: ['d','import'],
    required: ['<peer>','<cyphertext>'],
    description: 'import encrypted history blob into a local peer session',
    exe: async args =>
    {
      let s = (args || '').trim();
      // first whitespace separates peer prefix from cyphertext
      let space = s.search(/\s/);
      if (space < 0) return 'usage: d import <peer> <cyphertext>';
      let prefix = s.slice(0, space);
      let cyphertext = s.slice(space + 1).trim();
      let peer = find_peer(prefix);
      let r = await aa.d.import_history(peer, cyphertext);
      return 'merged ' + r.added + ' / ' + r.total + ' items';
    },
  });


  aa.actions.push(
  {
    action: ['d','adopt'],
    required: ['<peer>'],
    description: 'adopt a pending session (shows confirm if an active session already exists)',
    exe: prefix =>
    {
      // find_peer only searches live sessions — for pending we need to check live.pending too
      let p = (prefix || '').trim();
      let matches = [...aa.d.live.pending.keys()].filter(k => k.startsWith(p));
      if (matches.length === 0) return 'no pending session matching ' + p;
      if (matches.length > 1)   return 'ambiguous prefix — ' + matches.length + ' matches';
      aa.d.adopt_pending(matches[0]);
      return 'adopting ' + matches[0].slice(0,12) + '…';
    },
  });

  aa.actions.push(
  {
    action: ['d','dismiss'],
    required: ['<peer>'],
    description: 'dismiss a pending session without adopting',
    exe: prefix =>
    {
      let p = (prefix || '').trim();
      let matches = [...aa.d.live.pending.keys()].filter(k => k.startsWith(p));
      if (matches.length === 0) return 'no pending session matching ' + p;
      if (matches.length > 1)   return 'ambiguous prefix — ' + matches.length + ' matches';
      aa.d.dismiss_pending(matches[0]);
      return 'dismissed ' + matches[0].slice(0,12);
    },
  });

  aa.actions.push(
  {
    action: ['d','close'],
    required: ['<peer>'],
    description: 'close a session (keeps the persistent record, marks closed_at)',
    exe: prefix =>
    {
      let peer = find_peer((prefix || '').trim());
      let ok = aa.d.close(peer);
      return ok ? 'closed ' + peer.slice(0,12) : 'no live session';
    },
  });

  aa.actions.push(
  {
    action: ['d','revoke'],
    required: ['<secret_prefix | all>'],
    description: 'revoke an invite (stops listening, wipes crypto material). "all" revokes every waiting invite.',
    exe: prefix =>
    {
      let p = (prefix || '').trim();
      if (p === 'all')
      {
        let keys = [...aa.d.live.invites.keys()];
        if (!keys.length) return 'no active invites';
        for (let k of keys) aa.d.invite_revoke(k);
        return 'revoked ' + keys.length + ' invite(s)';
      }
      let matches = [...aa.d.live.invites.keys()].filter(k => k.startsWith(p));
      if (matches.length === 0) return 'no invite matching ' + p;
      if (matches.length > 1)   return 'ambiguous prefix — ' + matches.length + ' matches';
      aa.d.invite_revoke(matches[0]);
      return 'revoked ' + matches[0].slice(0,12);
    },
  });

  aa.actions.push(
  {
    action: ['d','status'],
    description: 'print dr module status',
    exe: ()=> aa.d.status(),
  });

  setTimeout(()=> aa.log(`[d] loaded — device ${mod.o.device_id.slice(0,8)}…`), 420);
};


// update the section button badge with session + pending counts
// count unread messages for a peer (messages with ts > seen[peer])
aa.d.unread =peer=>
{
  let entry = aa.d.live?.sessions.get(peer);
  if (!entry) return 0;
  let seen_ts = aa.d.o.seen?.[peer] || 0;
  return entry.history.filter(h => h.dir === 'in' && (h.ts || 0) > seen_ts).length;
};

// total unread across all sessions
aa.d.unread_total =()=>
{
  let total = 0;
  for (let [peer] of (aa.d.live?.sessions || []))
    total += aa.d.unread(peer);
  return total;
};

// mark a session as read up to now
aa.d.mark_read =peer=>
{
  let entry = aa.d.live?.sessions.get(peer);
  if (!entry) return;
  let latest = 0;
  for (let h of entry.history)
  {
    if ((h.ts || 0) > latest) latest = h.ts;
  }
  if (latest) aa.d.o.seen[peer] = latest;
  aa.d.save();
  aa.d.count_upd();
  aa.bus.emit('d:mark_read', {peer});
};

// update section button badge — shows total sessions + unread stash
aa.d.count_upd =()=>
{
  let butt = aa.el.get('butt_section_d');
  if (!butt) return;
  let sessions = aa.d.live?.sessions.size || 0;
  let pending = aa.d.live?.pending.size || 0;
  let count = sessions + pending;
  let unread = aa.d.unread_total() + pending;
  fastdom.mutate(()=>
  {
    if (count) butt.dataset.count = count;
    else delete butt.dataset.count;
    if (unread) butt.dataset.stashed = unread;
    else delete butt.dataset.stashed;
  });
};


// ----- persistence -----
//
// rule: never overwrite or delete from mod.o. live entries are MERGED in;
// closed/revoked entries are kept with a marker. mod.o.log is append-only.
// this lets you reconstruct any past state by walking the log.

aa.d.save_now =async()=>
{
  let mod = aa.d;

  // MERGE live sessions into mod.o.sessions (don't wipe — closed sessions survive)
  for (let [peer, e] of mod.live.sessions)
  {
    try
    {
      let prev = mod.o.sessions[peer];
      mod.o.sessions[peer] =
      {
        name: e.name,
        state: RATCHET.serializeSessionState(e.session.state),
        history: e.history,
        opened_at: prev?.opened_at ?? Date.now(),
        // closed_at intentionally not set when live
      };
    }
    catch(er) { aa.log(`[d] failed to serialize session ${peer.slice(0,8)}: ${er.message}`); }
  }

  // MERGE live invites into mod.o.invites — preserve accepted_by, fulfilled_at, etc.
  for (let [secret, e] of mod.live.invites)
  {
    try
    {
      let prev = mod.o.invites[secret] || {};
      mod.o.invites[secret] = Object.assign(prev,
      {
        serialized: e.invite.serialize(),
        url: e.url,
        created_at: e.created_at,
      });
    }
    catch(er) { aa.log(`[d] failed to serialize invite: ${er.message}`); }
  }

  await aa.mod.save(mod);
};

// fire-and-forget eager save. NO debounce — ratchet state must persist after
// every step because losing intermediate state breaks future decryption.
aa.d.save =()=>
{
  aa.d.save_now().catch(e =>
  {
    console.error('[d] save failed', e);
    aa.log('[d] save failed: ' + (e.message || e));
  });
};


// ----- append-only audit log -----
// every state-changing operation pushes one entry. used for reconstruction +
// debugging. never modify or remove entries; the log is the ground truth.
aa.d._log =(type, payload={})=>
{
  if (!aa.d.o.log) aa.d.o.log = [];
  aa.d.o.log.push(Object.assign({ts: Date.now(), type}, payload));
};


// ----- nip-44 wrappers -----
// upstream wants (plaintext, pubkey) → ciphertext; alphaama uses (pubkey, text)
aa.d.encryptor =async(plaintext, pubkey)=> aa.signer.nip44.encrypt(pubkey, plaintext);
aa.d.decryptor =async(ciphertext, pubkey)=> aa.signer.nip44.decrypt(pubkey, ciphertext);


// ----- transport: bind to aa.r -----

// generic subscribe factory used by Session instances (kind 1060 messages)
aa.d.subscribe_factory =()=>
{
  return (filter, on_event)=>
  {
    let sub_id = 'dr_' + Math.random().toString(36).slice(2, 10);
    let relays = aa.r?.w || [];
    if (!relays.length) aa.log('[d] no write relays — sub will be empty');
    aa.r.on_sub.set(sub_id, dat =>
    {
      try { on_event(dat.event); }
      catch(e) { console.error('[d] sub callback', e); }
    });
    aa.r.send_req({relays, request:['REQ', sub_id, filter]});
    return ()=>
    {
      aa.r.on_sub.delete(sub_id);
      // TODO: send relay-side CLOSE
    };
  };
};

// invite-specific subscribe factory used by Invite.listen (kind 1059 invite responses)
//
// solves two problems on reload:
//
// 1. wasted work: every reload, upstream re-fetches the same invite responses
//    from relays and re-runs the bootstrap (signer-roundtrip nip44 decrypt + new
//    Session + DH ratchet step). adopt_session then discards the duplicate.
//    fix: persist the event ids we've already forwarded to upstream, drop them
//    on subsequent listens before they reach upstream.
//
// 2. cross-module noise: kind 1059 with #p:[me] is also m/m.js's NIP-17 sub
//    filter, so m receives every dr invite response and tries to NIP-17-unwrap
//    it. the inner content is dr's session-bootstrap blob, NOT a kind-13 seal,
//    so m fails. by stamping each invite response into the shared decrypt_cache
//    as `fail`, m's on_event check at m.js:129 skips it forever after.
aa.d.subscribe_factory_for_invite =secret=>
{
  return (filter, on_event)=>
  {
    let sub_id = 'dr_inv_' + Math.random().toString(36).slice(2, 10);
    let relays = aa.r?.w || [];
    if (!relays.length) aa.log('[d] no write relays — invite sub will be empty');

    if (!aa.d.o.invite_seen) aa.d.o.invite_seen = {};
    if (!aa.d.o.invite_seen[secret]) aa.d.o.invite_seen[secret] = {};

    aa.r.on_sub.set(sub_id, async dat =>
    {
      let id = dat.event.id;
      let seen = aa.d.o.invite_seen[secret];
      if (seen[id]) return;  // already routed to upstream — drop

      // tell m/m.js to leave this kind 1059 alone permanently
      try { await aa.u.decrypt_cache.fail(id); }
      catch(e) {}

      // AWAIT upstream's async callback (NIP-07 decrypt + session bootstrap).
      // without await, async errors vanish as unhandled rejections and the
      // pending stash silently never happens — which is why the user only
      // saw the pending after a reload.
      try
      {
        await on_event(dat.event);
        // only mark as seen AFTER upstream succeeded — if it failed, we
        // want to retry on the next delivery or on reload
        seen[id] = Date.now();
        aa.d.save();
      }
      catch(e)
      {
        aa.log('[d] invite response processing failed: ' + (e.message || e));
        console.error('[d] invite sub callback', e);
      }
    });
    aa.r.send_req({relays, request:['REQ', sub_id, filter]});
    return ()=>
    {
      aa.r.on_sub.delete(sub_id);
    };
  };
};

aa.d.publish =async event=>
{
  let relays = aa.r?.w || [];
  if (!relays.length) { aa.log('[d] publish: no relays'); return false; }
  await aa.r.send_event({relays, event});
  return event;
};


// ----- session lifecycle -----

// wire a Session into our state Map and start receiving
// `history` is optional — passed during restore to rehydrate prior plaintext
// `opts.replace` — if true, close any existing live session for this peer first
//                  (use only on user-initiated paths like invite_accept and the
//                  fresh-invite-create listener; restore must NOT pass this)
//
// IMPORTANT: when `replace` is false (default) and a live session exists, the
// new one is DISCARDED. rationale: restore() reattaches invite listeners which
// could re-process old invite responses; if the wrapper-level seen-filter ever
// fails, we don't want a virgin (chain step 0) session to clobber an advanced
// live one. user-initiated paths bypass this with `replace: true`.
//
// HISTORY CARRY-OVER: if there's a previously-saved entry for this peer (closed
// or just unrestored), and no history was passed in, we copy its history into
// the new live entry. this preserves chat history across a close + re-handshake
// (or replace) flow without the user having to manually export/import.
aa.d.adopt_session =(peer, session, label, history=[], opts={})=>
{
  let mod = aa.d;
  if (mod.live.sessions.has(peer))
  {
    if (opts.replace)
    {
      aa.log(`[d] adopt_session: replacing existing live session for ${peer.slice(0,8)}…`);
      aa.d.close(peer);   // wipes state for FS, sets closed_at, leaves history in mod.o
    }
    else
    {
      aa.log(`[d] adopt_session: ${peer.slice(0,8)}… already has a live session, discarding new one (run \`dr close <peer>\` first to re-handshake)`);
      try { session.close(); } catch(e) {}
      return mod.live.sessions.get(peer);
    }
  }

  // recover history from a prior (closed) entry if the caller didn't pass any
  let prior = mod.o.sessions[peer];
  if (prior && (!history || history.length === 0) && prior.history?.length)
  {
    history = prior.history;
    let was_closed = prior.closed_at ? ' (was closed)' : '';
    aa.log(`[d] adopt_session: recovered ${history.length} history item(s) from prior entry for ${peer.slice(0,8)}${was_closed}`);
    history.push({dir:'sys', text:`session opened — ${history.length} messages from previous session`, ts: Date.now()});
  }
  // clear closed_at since this peer now has a fresh live session
  if (prior?.closed_at) delete prior.closed_at;

  // push a sys message marking the session start — only once (skip if history already has one)
  if (!history.some(h => h.dir === 'sys'))
    history.push({dir:'sys', text:'session started', ts: Date.now()});

  let entry = {session, name: label || peer.slice(0,8), history};
  mod.live.sessions.set(peer, entry);

  let unsub = session.onEvent(async(rumor, outer)=>
  {
    // store raw events for inspection (persisted in mod.o.events)
    if (!mod.o.events) mod.o.events = {};
    mod.o.events[rumor.id] = {rumor, outer, peer, ts: Date.now()};

    let ts = rumor.created_at*1000 || Date.now();
    let kind = rumor.kind;
    let item;

    // route by inner kind — only kind 14 is a chat message
    // other kinds from iris/upstream are state messages (typing, receipt, reaction, settings)
    if (kind === 14)
    {
      item = {dir:'in', text: rumor.content, ts, id: rumor.id, kind};
      entry.history.push(item);

      // notification for inbound messages (not from self)
      if (!aa.u.is_u(rumor.pubkey))
      {
        let p = aa.db.p[peer] || aa.p?.p(peer);
        let name = aa.p?.author_name(p) || peer.slice(0,12);
        let notif = make();
        notif.append(
          make('span', {con:'[d] '}),
          make('a', {con:name, ref:'#d_' + peer, clk:aa.clk.a}),
          make('span', {con:': ' + (rumor.content || '').slice(0, 80)}),
        );
        aa.log(notif);
      }
    }
    else
    {
      // non-chat kinds: typing (25), receipt (15), reaction (7), settings (10448), etc.
      let label = {25:'typing', 15:'receipt', 7:'reaction', 10448:'chat settings'}[kind] || 'kind ' + kind;
      let detail = rumor.content ? ': ' + (rumor.content || '').slice(0, 40) : '';
      item = {dir:'sys', text: label + detail, ts, id: rumor.id, kind};
      entry.history.push(item);
    }

    aa.d._log('message_in', {peer, id: rumor.id, ts, kind});
    aa.bus.emit('d:recv', {peer, item, rumor, outer});

    try { await aa.u.decrypt_cache.add(rumor.id, rumor.content, peer); }
    catch(e) {}

    aa.d.save();
  });
  mod.live.unsub.set(peer, unsub);

  aa.bus.emit('d:session_open', {peer, name: entry.name});
  aa.d.save();
  return entry;
};

// store using the INNER rumor id (deterministic, same on both sides) so that
// outbound from one side and inbound on the other dedupe correctly during import.
// outer kind-1060 ids are different per signer and would never match.
aa.d._record_sent =async(peer, text, rumor, outer)=>
{
  let mod = aa.d;
  let entry = mod.live.sessions.get(peer);
  if (!entry) return;
  let ts = (rumor.created_at * 1000) || Date.now();
  let item = {dir:'out', text, ts, id: rumor.id, kind: rumor.kind};
  entry.history.push(item);

  // store raw events for inspection (same as inbound)
  if (!mod.o.events) mod.o.events = {};
  mod.o.events[rumor.id] = {rumor, outer, peer, ts: Date.now()};

  try { await aa.u.decrypt_cache.add(rumor.id, text, peer); }
  catch(e) {}
  aa.d._log('message_out', {peer, id: rumor.id, ts});
  aa.bus.emit('d:sent', {peer, text, rumor});
  aa.d.save();
};

aa.d.send =async(peer, text)=>
{
  let entry = aa.d.live.sessions.get(peer);
  if (!entry) { aa.log(`[d] no session for ${peer.slice(0,8)}`); return false; }
  let {event, innerEvent} = entry.session.send(text);
  await aa.d.publish(event);
  await aa.d._record_sent(peer, text, innerEvent, event);
  return {event, innerEvent};
};

// close() removes the session from the live runtime AND wipes the cryptographic
// state from the persistent record to honor forward secrecy. history (plaintext)
// and metadata stay so the conversation is still inspectable / recoverable.
//
// after close, mod.o.sessions[peer] keeps {name, history, opened_at, closed_at}
// but state is null. restore() skips closed entries; if you re-handshake with
// the same peer, adopt_session lifts the history into the fresh session.
aa.d.close =peer=>
{
  let mod = aa.d;
  let entry = mod.live.sessions.get(peer);
  if (!entry) return false;
  try { entry.session.close(); } catch(e) {}
  let u = mod.live.unsub.get(peer);
  if (u) try { u(); } catch(e) {}
  mod.live.sessions.delete(peer);
  mod.live.unsub.delete(peer);
  if (mod.o.sessions[peer])
  {
    mod.o.sessions[peer].closed_at = Date.now();
    mod.o.sessions[peer].state = null;  // wipe ratchet keys for forward secrecy
  }
  aa.d._log('session_close', {peer});
  aa.d.save();
  aa.bus.emit('d:session_close', {peer});
  return true;
};


// ----- view system -----

// open a dr view: 'invites', 'pending', or a peer pubkey
aa.d.view_open =key=>
{
  aa.d.active = key;
  aa.l.classList.add('view_d');

  // tell the panel to select + render
  if (aa.d.chat) aa.d.chat.select(key);
  aa.bus.emit('d:view_open', {key});

  // mark read when opening a session
  if (key !== 'invites' && key !== 'pending' && aa.d.live.sessions.has(key))
    aa.d.mark_read(key);

  // swap CLI default action to send when a session is selected
  if (key !== 'invites' && key !== 'pending' && aa.d.live.sessions.has(key))
  {
    if (!aa.d._prev_action) aa.d._prev_action = aa.cli?.def?.action;
    aa.bus.emit('cli:set_default',
    {
      action: ['d','send'],
      description: 'send ratchet DM',
      exe: s =>
      {
        // draft mode: stash content, let the panel render it with send/cancel
        aa.d._draft = {peer: key, text: s};
        aa.bus.emit('d:draft', {peer: key, text: s});
        aa.bus.emit('cli:dismiss');
      }
    });
    if (aa.cli?.t) aa.cli.t.dataset.note_type = 'kind-1060 ratchet message';
  }
};

// clear dr view state — called by aa.view.clears on navigation
aa.d.view_clear =()=>
{
  if (!aa.d.active) return;
  aa.d.active = null;
  aa.l.classList.remove('view_d');

  // clear the panel selection + view
  if (aa.d.chat) aa.d.chat.deselect();
  aa.d.count_upd();

  // navigate away if still on a d_ view
  if (aa.view.active && String(aa.view.active).startsWith('d_'))
    aa.view.state('');

  // restore previous CLI default action
  if (aa.d._prev_action)
  {
    aa.bus.emit('cli:set_default', aa.d._prev_action);
    aa.d._prev_action = null;
  }
  if (aa.cli?.t) delete aa.cli.t.dataset.note_type;
};


// ----- invites -----

// stash an incoming session as "pending" so it appears in the UI for the user
// to explicitly act on. used by invite_create's listener (alice's side) — the
// acceptance arrives asynchronously and alice should see it before it's adopted.
aa.d._stash_pending =(peer, session, label, secret)=>
{
  let mod = aa.d;
  mod.live.pending.set(peer, {session, label, invite_secret: secret});
  mod.o.pending_sessions[peer] =
  {
    state: RATCHET.serializeSessionState(session.state),
    label,
    invite_secret: secret,
    ts: Date.now(),
  };
  aa.log(`[d] invite accepted by ${peer.slice(0,8)} — pending (click adopt or run \`dr adopt ${peer.slice(0,8)}\`)`);
  aa.d._log('pending_stash', {peer});
  aa.bus.emit('d:pending_session', {peer, label});
  aa.d.save();
};

// adopt a pending session — called when the user explicitly acts from the UI or CLI.
// if a live session already exists for the same peer → confirm dialog.
aa.d.adopt_pending =peer=>
{
  let mod = aa.d;
  let pending = mod.live.pending.get(peer);
  if (!pending) throw new Error('no pending session for ' + peer.slice(0,8));

  let do_adopt =()=>
  {
    aa.d.adopt_session(peer, pending.session, pending.label, [], {replace: true});
    mod.live.pending.delete(peer);
    delete mod.o.pending_sessions[peer];

    // auto-fulfill the invite that produced this session — stop listener, keep metadata
    if (pending.invite_secret)
    {
      let inv_live = mod.live.invites.get(pending.invite_secret);
      if (inv_live) { try { inv_live.listen_unsub?.(); } catch(e) {} }
      mod.live.invites.delete(pending.invite_secret);
      let inv_saved = mod.o.invites[pending.invite_secret];
      if (inv_saved)
      {
        inv_saved.fulfilled_at = Date.now();
        inv_saved.serialized = null;  // wipe for FS
      }
    }

    aa.d._log('pending_adopt', {peer});
    aa.d.save();
    aa.bus.emit('d:pending_adopted', {peer});
  };

  let existing = mod.live.sessions.get(peer);
  if (!existing)
  {
    do_adopt();
    return;
  }

  // existing session — ask before replacing
  let stale = false;
  for (let [, inv] of Object.entries(mod.o.invites || {}))
  {
    if (inv.accepted_by?.includes(peer)) { stale = true; break; }
  }

  let hist = existing.history.length;
  let stale_warn = stale ? '\nthis peer already accepted a prior invite — possible stale re-acceptance.' : '';
  let body = make('p', {con:`peer ${peer.slice(0,12)}… already has a live session (${hist} message${hist!==1?'s':''}).${stale_warn}\n\nreplace with the new session? (old ratchet state wiped for forward secrecy, chat history preserved)`});

  aa.mk.confirm(
  {
    title: 'replace existing session?',
    l: body,
    no:
    {
      title: 'keep current',
      exe: ()=>
      {
        // discard the pending session
        try { pending.session.close(); } catch(e) {}
        mod.live.pending.delete(peer);
        delete mod.o.pending_sessions[peer];
        aa.d.save();
        aa.log(`[d] kept existing session for ${peer.slice(0,8)}, discarded pending`);
      }
    },
    yes:
    {
      title: 'replace',
      exe: do_adopt,
    },
  });
};

// dismiss a pending session without adopting
aa.d.dismiss_pending =peer=>
{
  let mod = aa.d;
  let pending = mod.live.pending.get(peer);
  if (!pending) return false;
  try { pending.session.close(); } catch(e) {}
  mod.live.pending.delete(peer);
  delete mod.o.pending_sessions[peer];
  aa.d._log('pending_dismiss', {peer});
  aa.d.save();
  aa.bus.emit('d:pending_dismissed', {peer});
  return true;
};

// track that a peer has accepted a specific invite (for stale-detection on re-listen)
aa.d._track_invite_accept =(secret, peer)=>
{
  let inv = aa.d.o.invites[secret];
  if (!inv) return;
  if (!inv.accepted_by) inv.accepted_by = [];
  if (!inv.accepted_by.includes(peer)) inv.accepted_by.push(peer);
  aa.d.save();
};


// ALICE: create + publish a kind 30078 invite, listen for accepts
aa.d.invite_create =async()=>
{
  let mod = aa.d;
  let identity = aa.u?.p?.pubkey;
  if (!identity) throw new Error('not logged in');

  let invite = RATCHET.Invite.createNew(identity, mod.o.device_id);
  let unsigned = invite.getEvent();
  let signed = await aa.bus.request('e:sign', unsigned);
  if (!signed) throw new Error('signing invite failed');
  await aa.d.publish(signed);

  let url = invite.getUrl(window.location.origin + '/');
  let secret = invite.sharedSecret;
  let listen_unsub = invite.listen(aa.d.decryptor, aa.d.subscribe_factory_for_invite(secret), (session, peer)=>
  {
    aa.d._track_invite_accept(secret, peer);
    aa.d._stash_pending(peer, session, 'peer ' + peer.slice(0,8), secret);
  });
  mod.live.invites.set(secret,
  {
    invite, listen_unsub, url, created_at: Date.now(),
  });

  aa.log('[d] invite created');
  aa.d._log('invite_create', {});  // don't log secret or url — they contain crypto material
  aa.bus.emit('d:invite_created', {invite, url});
  aa.d.save();
  return {invite, url, event: signed};
};

// BOB: accept an invite (URL or kind-30078 event)
aa.d.invite_accept =async input=>
{
  let identity = aa.u?.p?.pubkey;
  if (!identity) throw new Error('not logged in');

  let invite;
  if (typeof input === 'string') invite = RATCHET.Invite.fromUrl(input);
  else if (input?.kind === RATCHET.INVITE_EVENT_KIND) invite = RATCHET.Invite.fromEvent(input);
  else throw new Error('accept: pass URL or kind 30078 event');

  let sub = aa.d.subscribe_factory();
  let {session, event} = await invite.accept(sub, identity, aa.d.encryptor);
  if (!event) throw new Error('invite.accept returned no event');
  await aa.d.publish(event);

  // user-initiated accept — adopt directly (replace if existing)
  aa.d.adopt_session(invite.inviter, session, 'inviter ' + invite.inviter.slice(0,8), [], {replace: true});
  aa.d._log('invite_accept', {peer: invite.inviter});
  aa.log(`[d] accepted invite from ${invite.inviter.slice(0,8)}`);
  return {session, event};
};

// invite_revoke stops the listener AND wipes the serialized invite blob (which
// contains the inviter's ephemeral private key) for forward secrecy. metadata
// stays so the audit trail is preserved. restore() skips revoked entries.
aa.d.invite_revoke =shared_secret=>
{
  let mod = aa.d;
  let entry = mod.live.invites.get(shared_secret);
  if (!entry) return false;
  try { entry.listen_unsub?.(); } catch(e) {}
  mod.live.invites.delete(shared_secret);
  if (mod.o.invites[shared_secret])
  {
    mod.o.invites[shared_secret].revoked_at = Date.now();
    mod.o.invites[shared_secret].serialized = null;  // wipe ephemeral private key
  }
  aa.d._log('invite_revoke', {});  // don't log the secret either
  aa.d.save();
  aa.bus.emit('d:invite_revoked', {shared_secret});
  return true;
};


// ----- history export / import (out-of-band recovery) -----
//
// only path for syncing history between sides. the over-the-wire ratchet sync
// path was removed because the only time you actually NEED to sync is when the
// ratchet is broken — and in that state the wire path can't deliver anyway.
//
// flow:
//   on the side with full history:    .d export <peer>  → nip44 cyphertext in the log
//   copy that cyphertext, switch tabs
//   on the side missing history:      .d import <peer> <cyphertext>
//
// items are stored from the SENDER's perspective (their dir/text/ts/id). on
// merge the receiver flips dir (sender's "out" = receiver's "in", and vice versa).

aa.d.export_history =async peer=>
{
  let entry = aa.d.live.sessions.get(peer);
  if (!entry) throw new Error('no session for ' + peer.slice(0,8));

  // strip recovered + sys items — only export actual messages
  let items = entry.history
    .filter(h => !h.recovered && h.dir !== 'sys')
    .map(h => ({dir: h.dir, text: h.text, ts: h.ts, id: h.id, kind: h.kind || 14}));

  let payload =
  {
    type: 'dr-history-sync',
    v: 1,
    sent_at: Date.now(),
    sender_perspective: true,
    items,
  };
  return await aa.signer.nip44.encrypt(peer, JSON.stringify(payload));
};

aa.d.import_history =async(peer, cyphertext)=>
{
  let json;
  try { json = await aa.signer.nip44.decrypt(peer, cyphertext) }
  catch(e) { throw new Error('decrypt failed: ' + e.message) }
  let payload;
  try { payload = JSON.parse(json) }
  catch(e) { throw new Error('invalid JSON: ' + e.message) }
  if (!payload || payload.type !== 'dr-history-sync') throw new Error('not a dr history sync payload');
  let added = await aa.d.merge_history(peer, payload, {source:'import'});
  return {added, total: payload.items?.length || 0};
};

// dedupe a peer's history by (dir, text, |ts diff| <= 1s) signature.
// useful for cleaning up duplicates from imports made before the rumor-id fix,
// where outbound and inbound items had mismatched id schemes.
aa.d.dedupe_history =peer=>
{
  let entry = aa.d.live.sessions.get(peer);
  if (!entry) throw new Error('no session for ' + peer.slice(0,8));
  let before = entry.history.length;

  // sort by ts to make near-duplicates adjacent
  entry.history.sort((a, b) => (a.ts || 0) - (b.ts || 0));

  // walk and keep first occurrence of each {dir, text} within a 1s window;
  // also fall back to id match if both have ids
  let kept = [];
  let seen_ids = new Set();
  for (let item of entry.history)
  {
    if (item.id && seen_ids.has(item.id)) continue;
    let dup = kept.find(k =>
      k.dir === item.dir &&
      k.text === item.text &&
      Math.abs((k.ts || 0) - (item.ts || 0)) <= 1000
    );
    if (dup)
    {
      // prefer the non-recovered one + keep its id if it has one
      if (item.recovered === false && dup.recovered)
      {
        Object.assign(dup, item);
      }
      continue;
    }
    if (item.id) seen_ids.add(item.id);
    kept.push(item);
  }

  entry.history = kept;
  if (aa.d.o.sessions[peer]) aa.d.o.sessions[peer].history = kept;
  let removed = before - kept.length;
  aa.log(`[d] deduped ${entry.name}: removed ${removed} duplicate(s) (${before} → ${kept.length})`);
  aa.d._log('history_dedupe', {peer, removed});
  aa.d.save();
  aa.bus.emit('d:history_merged', {peer, added: 0});  // reuse the merge event so the panel refreshes
  return removed;
};

// MERGE: apply a received history payload into the local session entry
// runs automatically when an inbound rumor matches HISTORY_SYNC_PREFIX,
// can also be called manually with a known payload object
aa.d.merge_history =async(peer, payload, source)=>
{
  let entry = aa.d.live.sessions.get(peer);
  if (!entry) { aa.log(`[d] merge: no session for ${peer.slice(0,8)}`); return 0; }
  if (!payload || payload.type !== 'dr-history-sync')
  {
    aa.log('[d] merge: bad payload');
    return 0;
  }

  let known_ids = new Set(entry.history.map(h => h.id).filter(Boolean));
  let added = 0;

  for (let item of payload.items || [])
  {
    if (item.id && known_ids.has(item.id)) continue;
    // flip dir: sender's "out" was them sending, which from our view is an inbound;
    //           sender's "in"  was them receiving, which from our view is an outbound
    let dir = payload.sender_perspective
      ? (item.dir === 'out' ? 'in' : 'out')
      : item.dir;
    entry.history.push(
    {
      dir,
      text: item.text,
      ts: item.ts,
      id: item.id,
      kind: item.kind || 14,
      recovered: true,
    });
    if (item.id) known_ids.add(item.id);
    added++;
  }

  // sort + dedupe so recovered items slot in correctly and duplicates from
  // mismatched id schemes (pre-fix data) are cleaned up automatically
  entry.history.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  aa.d.dedupe_history(peer);

  if (added) entry.history.push({dir:'sys', text:`imported ${added} message${added!==1?'s':''} from peer`, ts: Date.now()});
  aa.log(`[d] merged ${added} history item(s) from ${entry.name}`);
  aa.d._log('history_merge', {peer, added, source_id: source?.rumor?.id});
  aa.d.save();
  aa.bus.emit('d:history_merged', {peer, added});
  return added;
};


// ----- restore (called once after u:pubkey + r:manager are ready) -----

aa.d.restore =async()=>
{
  let mod = aa.d;
  let restored_sessions = 0, restored_invites = 0, skipped_closed = 0, skipped_revoked = 0;
  let yield_ui =()=> new Promise(r => setTimeout(r, 0));

  for (let [peer, saved] of Object.entries(mod.o.sessions || {}))
  {
    if (saved.closed_at) { skipped_closed++; continue; }
    try
    {
      let state = RATCHET.deserializeSessionState(saved.state);
      let sub = aa.d.subscribe_factory();
      let session = new RATCHET.Session(sub, state);
      aa.d.adopt_session(peer, session, saved.name, saved.history || []);
      restored_sessions++;
    }
    catch(e) { aa.log(`[d] restore session ${peer.slice(0,8)} failed: ${e.message}`); console.error(e); }
    await yield_ui();
  }

  for (let [secret, saved] of Object.entries(mod.o.invites || {}))
  {
    if (saved.revoked_at) { skipped_revoked++; continue; }
    try
    {
      let invite = RATCHET.Invite.deserialize(saved.serialized);
      let sub = aa.d.subscribe_factory_for_invite(secret);
      let listen_unsub = invite.listen(aa.d.decryptor, sub, (session, peer)=>
      {
        aa.d._track_invite_accept(secret, peer);
        aa.d._stash_pending(peer, session, 'peer ' + peer.slice(0,8), secret);
      });
      mod.live.invites.set(secret,
      {
        invite, listen_unsub, url: saved.url, created_at: saved.created_at,
      });
      restored_invites++;
    }
    catch(e) { aa.log(`[d] restore invite failed: ${e.message}`); console.error(e); }
    await yield_ui();
  }

  // restore pending sessions from mod.o (these survived a reload before user acted)
  let restored_pending = 0;
  for (let [peer, saved] of Object.entries(mod.o.pending_sessions || {}))
  {
    try
    {
      let state = RATCHET.deserializeSessionState(saved.state);
      let sub = aa.d.subscribe_factory();
      let session = new RATCHET.Session(sub, state);
      mod.live.pending.set(peer, {session, label: saved.label, invite_secret: saved.invite_secret});
      restored_pending++;
    }
    catch(e) { aa.log(`[d] restore pending ${peer.slice(0,8)} failed: ${e.message}`); console.error(e); }
    await yield_ui();
  }

  let skipped = (skipped_closed ? `, ${skipped_closed} closed skipped` : '') + (skipped_revoked ? `, ${skipped_revoked} revoked skipped` : '');
  let pending_msg = restored_pending ? `, ${restored_pending} pending` : '';
  aa.log(`[d] restored ${restored_sessions} session(s), ${restored_invites} invite(s)${pending_msg}${skipped}`);
  aa.d._log('restore', {sessions: restored_sessions, invites: restored_invites, pending: restored_pending, skipped_closed, skipped_revoked});
  aa.d._restored = true;
  aa.bus.emit('d:restored', {sessions: restored_sessions, invites: restored_invites, pending: restored_pending});
  aa.d.count_upd();

  // if the page loaded with a d_ view hash, re-trigger it now that state exists
  if (aa.view.active && String(aa.view.active).startsWith('d_'))
    aa.view.ls.d_(aa.view.active);
};


// ----- introspection -----

aa.d.status =()=>
{
  let mod = aa.d;
  let lines = [`[d] device ${mod.o.device_id.slice(0,8)}… · ${mod.live.sessions.size} session(s) · ${mod.live.invites.size} invite(s)`];
  for (let [peer, e] of mod.live.sessions)
  {
    let s = e.session.state || {};
    lines.push(`  ${peer.slice(0,16)}…  ${e.name}  (sent ${s.sendingChainMessageNumber ?? '?'}, recv ${s.receivingChainMessageNumber ?? '?'}, hist ${e.history.length})`);
  }
  return lines.join('\n');
};
