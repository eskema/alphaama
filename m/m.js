/*

alphaama
mod    m
direct messages (NIP-17)

*/

aa.m =
{
  name:'m',
  about:'direct messages (NIP-17)',
  def:{id:'m'},
  convos: new Map(),
  chain: new Map(),
  chain_wrap: new Map(),
  scripts:
  [
    '/m/mk.js',
    '/m/clk.js',
    '/m/view.js',
  ],
  styles:
  [
    '/m/m.css',
  ],
};


aa.m.load =async()=>
{
  let mod = aa.m;

  // load saved state from IDB stuff store
  mod.o = await aa.db.ops('idb', {get:{store:'stuff',key:mod.def.id}});
  if (!mod.o) mod.o = {id: mod.def.id};
  if (!mod.o.convos) mod.o.convos = {};
  if (!mod.o.pending) mod.o.pending = [];
  if (!mod.o.seen) mod.o.seen = {};

  mod.pending = new Map();
  mod.decrypt_q = new Map();
  mod.decrypt_active = new Set();

  mod.l = make('div',{cla:'m_panel expanded'});
  mod.list_el = make('div',{cla:'m_list'});
  mod.view_el = make('div',{cla:'m_view'});
  mod.l.append(mod.list_el, mod.view_el);

  mod.pending_item = aa.mk.m_pending_item();
  mod.list_el.prepend(mod.pending_item);

  aa.view.clears.push(aa.m.view_clear);
  aa.mod.help_setup(mod);

  aa.actions.push(
  {
    action:[mod.def.id,'get'],
    optional:['<days>'],
    description:'subscribe to DMs from relays',
    exe: aa.m.sub
  },
  {
    action:[mod.def.id,'new'],
    required:['<npub|pubkey>'],
    description:'start a conversation',
    exe: aa.m.new_convo
  },
  {
    action:[mod.def.id,'decrypt'],
    required:['<id>'],
    description:'decrypt gift wrap',
    exe: id=> aa.m.unwrap_by_id(id)
  });

  if (localStorage.m_get === 'on')
    aa.mod.ready('u:pubkey', ()=> aa.mod.ready('r:manager', aa.m.sub));

  aa.mod.ready('u:pubkey', aa.m.restore);
};


// create own relay subscription for kind 1059 tagged to user
aa.m.sub =s=>
{
  if (!aa.u.p?.pubkey) return;
  aa.m.restore();
  let id = 'm';
  let filter = {kinds:[1059],'#p':[aa.u.p.pubkey]};

  // parse optional days argument
  let days = parseInt(s);
  if (days > 0)
    filter.since = aa.now - (days * 86400);
  else if (s !== 'all')
    filter.since = aa.now - (7 * 86400);

  let relays = aa.m.relays();
  if (!relays.length) relays = aa.r.r;

  aa.r.on_sub.set(id, aa.m.on_event);
  aa.r.send_req({request:['REQ',id,filter], relays});
};


// incoming event from own subscription
aa.m.on_event =async dat=>
{
  let id = dat.event.id;
  if (aa.m.chain_wrap.has(id)) return;
  if (aa.m.pending.has(id)) return;

  // try cache first (no popup)
  let cached = await aa.u.decrypt_cache.get(id);
  if (cached)
  {
    let parsed = aa.pj(cached);
    if (parsed)
    {
      let rumor = parsed.rumor || parsed;
      let seal = parsed.seal;
      aa.m.show(rumor, dat, seal);
      return
    }
  }

  // skip previously failed decrypts
  if (await aa.u.decrypt_cache.is_fail(id)) return;

  // auto-decrypt or stash as pending
  if (localStorage.m_decrypt === 'on')
    aa.m.decrypt_add(dat);
  else
    aa.m.pending_add(dat);
};


// queue a gift wrap for decryption (debounced)
aa.m.decrypt_add =dat=>
{
  let id = dat.event.id;
  if (aa.m.decrypt_q.has(id)) return;
  aa.m.decrypt_q.set(id,dat);
  debt.add(aa.m.decrypt_run,420,'m_decrypt_q');
};


// process decrypt queue sequentially
aa.m.decrypt_run =async()=>
{
  let batch = [...aa.m.decrypt_q.values()];
  aa.m.decrypt_q.clear();
  for (let dat of batch)
  {
    let ok = await aa.m.unwrap(dat);
    if (!ok) await aa.u.decrypt_cache.fail(dat.event.id);
  }
};


// add gift wrap to pending (no decrypt)
aa.m.pending_add =dat=>
{
  let id = dat.event.id;
  aa.m.pending.set(id, dat);
  if (!aa.m.o.pending.includes(id))
  {
    aa.m.o.pending.push(id);
    debt.add(aa.m.save_pending, 2100, 'm_save_pending');
  }
  if (aa.m.active === '_pending')
  {
    let list = aa.m.view_el.querySelector('.m_pending_list');
    if (list)
    {
      let el = aa.mk.m_pending_wrap(id, dat);
      fastdom.mutate(()=>{ list.append(el) });
    }
  }
  aa.m.pending_upd();
};


// update pending convo item in list
aa.m.pending_upd =()=>
{
  let count = aa.m.pending.size;
  if (!aa.m.pending_item) return;
  fastdom.mutate(()=>
  {
    let c = aa.m.pending_item.querySelector('.m_convo_unread');
    if (c)
    {
      c.textContent = count;
      if (count) c.classList.remove('hidden');
      else c.classList.add('hidden');
    }
  });
  debt.add(aa.m.count_upd, 100, 'm_count');
};


// decrypt N pending gift wraps
aa.m.decrypt_pending =async n=>
{
  let batch = [...aa.m.pending.entries()].slice(0, n);
  let changed;
  for (let [id, dat] of batch)
  {
    aa.m.pending.delete(id);
    let ok = await aa.m.unwrap(dat);
    if (!ok)
    {
      aa.log('decrypt fail: '+id.slice(0,12));
      await aa.u.decrypt_cache.fail(id);
    }
    let idx = aa.m.o.pending.indexOf(id);
    if (idx !== -1) { aa.m.o.pending.splice(idx, 1); changed = true }
    let el = aa.m.view_el.querySelector('.m_pending_wrap[data-id="'+id+'"]');
    if (el) fastdom.mutate(()=>{ el.remove() });
  }
  if (changed) aa.m.save_pending();
  aa.m.pending_upd();
};


// open pending view in right panel
aa.m.open_pending =()=>
{
  aa.m.active = '_pending';

  let header = aa.mk.m_pending_header();
  let list = make('div',{cla:'m_pending_list'});

  for (let [id, dat] of aa.m.pending)
  {
    list.append(aa.mk.m_pending_wrap(id, dat));
  }

  fastdom.mutate(()=>
  {
    aa.m.view_el.textContent = '';
    aa.m.view_el.append(header, list);

    let prev = aa.m.list_el.querySelector('.m_convo_item.active');
    if (prev) prev.classList.remove('active');
    if (aa.m.pending_item) aa.m.pending_item.classList.add('active');
  });
};


// unwrap gift wrap (kind 1059) -> seal (kind 13) -> rumor (kind 14)
aa.m.unwrap =async dat=>
{
  let wrap = dat.event;

  let cached = await aa.u.decrypt_cache.get(wrap.id);
  if (cached)
  {
    let parsed = aa.pj(cached);
    if (parsed)
    {
      let rumor = parsed.rumor || parsed;
      let seal = parsed.seal;
      aa.m.show(rumor,dat,seal);
      return true
    }
  }
  if (await aa.u.decrypt_cache.is_fail(wrap.id))
  {
    aa.log('unwrap: previously failed '+wrap.id.slice(0,12));
    return false
  }
  if (!aa.signer.available()) return false;
  if (aa.m.decrypt_active.has(wrap.id)) return false;
  aa.m.decrypt_active.add(wrap.id);

  try
  {
    // layer 1: decrypt gift wrap -> seal
    let seal_json;
    try { seal_json = await aa.signer.nip44.decrypt(wrap.pubkey,wrap.content) }
    catch(er)
    {
      aa.log('unwrap: decrypt wrap failed '+wrap.id.slice(0,12));
      return false
    }
    if (!seal_json)
    {
      aa.log('unwrap: empty seal '+wrap.id.slice(0,12));
      return false
    }

    let seal = aa.pj(seal_json);
    if (!seal || seal.kind !== 13)
    {
      aa.log('unwrap: invalid seal '+wrap.id.slice(0,12));
      return false
    }
    if (!await aa.fx.verify_event(seal))
    {
      aa.log('unwrap: seal verify failed '+wrap.id.slice(0,12));
      return false
    }

    // layer 2: decrypt seal -> rumor
    let rumor_json;
    try { rumor_json = await aa.signer.nip44.decrypt(seal.pubkey,seal.content) }
    catch(er) { rumor_json = null }

    let rumor = rumor_json ? aa.pj(rumor_json) : null;

    // self-copy ECDH fix: seal.pubkey = user -> need counterparty key
    if ((!rumor || rumor.pubkey !== seal.pubkey) && aa.u.is_u(seal.pubkey))
    {
      for (const [key] of aa.m.convos)
      {
        if (key.length !== 64) continue;
        try
        {
          let attempt = await aa.signer.nip44.decrypt(key,seal.content);
          if (!attempt) continue;
          let test = aa.pj(attempt);
          if (test?.pubkey === seal.pubkey)
          {
            rumor_json = attempt;
            rumor = test;
            break
          }
        }
        catch(er) { continue }
      }
    }

    if (!rumor || rumor.pubkey !== seal.pubkey)
    {
      aa.log('unwrap: rumor decrypt failed '+wrap.id.slice(0,12));
      return false
    }

    await aa.u.decrypt_cache.add(wrap.id,JSON.stringify({rumor,seal}),seal.pubkey);
    aa.m.show(rumor,dat,seal);
    return true
  }
  finally { aa.m.decrypt_active.delete(wrap.id) }
};


// unwrap by event id (CLI action)
aa.m.unwrap_by_id =async id=>
{
  if (!aa.fx.is_hex(id))
  {
    aa.log('invalid id');
    return
  }
  let dat = await aa.bus.request('e:get', id);
  if (!dat)
  {
    aa.log('event not found');
    return
  }
  if (dat.event.kind !== 1059)
  {
    aa.log('not a gift wrap');
    return
  }
  return aa.m.unwrap(dat)
};


// display decrypted message in conversation
aa.m.show =(rumor,wrap_dat,seal)=>
{
  if (!rumor.id) rumor.id = aa.fx.hash(rumor);

  // already shown
  if (aa.m.chain.has(rumor.id))
  {
    // just add this wrap to chain
    let entry = aa.m.chain.get(rumor.id);
    if (!entry.wrap_ids) entry.wrap_ids = [];
    if (!entry.wraps) entry.wraps = {};
    aa.fx.a_add(entry.wrap_ids,[wrap_dat.event.id]);
    entry.wraps[wrap_dat.event.id] = wrap_dat.event;
    aa.m.chain_wrap.set(wrap_dat.event.id,rumor.id);
    return
  }

  // determine counterparty
  let counterparty;
  if (aa.u.is_u(rumor.pubkey))
    counterparty = aa.fx.tag_value(rumor.tags,'p');
  else
    counterparty = rumor.pubkey;
  if (!counterparty) return;

  // track chain
  aa.m.chain.set(rumor.id, {rumor, seal, wrap_ids:[wrap_dat.event.id], wraps:{[wrap_dat.event.id]: wrap_dat.event}, counterparty});
  aa.m.chain_wrap.set(wrap_dat.event.id, rumor.id);

  // get or create convo
  let convo = aa.m.convo(counterparty);

  // create message DOM
  let msg = aa.mk.m_msg(rumor);
  let stamp = rumor.created_at || 0;

  // mark as new if newer than last seen
  if (stamp > aa.m.seen_ts(counterparty))
    msg.classList.add('m_new');

  let messages = convo.messages;
  let inserted = false;
  for (let i = messages.children.length - 1; i >= 0; i--)
  {
    let child = messages.children[i];
    if (parseInt(child.dataset.stamp) <= stamp)
    {
      child.after(msg);
      inserted = true;
      break
    }
  }
  if (!inserted) messages.prepend(msg);

  // update convo item
  aa.m.convo_upd(counterparty, rumor);

  // persist convo state
  if (!aa.m._restoring)
    debt.add(aa.m.save, 2100, 'm_save');
};


// get or create conversation
aa.m.convo =pubkey=>
{
  if (aa.m.convos.has(pubkey))
    return aa.m.convos.get(pubkey);

  let item = aa.mk.m_convo_item(pubkey);
  let messages = make('div',{cla:'m_messages'});
  let element = make('div',{cla:'m_convo_wrap', dat:{pubkey}});
  element.append(messages);

  let convo = {pubkey, item, messages, element, unread:0};
  aa.m.convos.set(pubkey, convo);

  fastdom.mutate(()=>{ aa.m.list_el.append(item) });

  aa.p.author(pubkey);

  return convo
};


// get last-seen timestamp for a conversation
aa.m.seen_ts =pubkey=> aa.m.o.seen[pubkey] || 0;


// update section button counts: convos / unread+pending
aa.m.count_upd =()=>
{
  let butt = aa.el.get('butt_section_m');
  if (!butt) return;
  let count = aa.m.convos.size || Object.keys(aa.m.o?.convos || {}).length;
  let pending = aa.m.pending?.size || 0;
  let unread = pending;
  for (let [, convo] of aa.m.convos)
  {
    if (convo.unread > 0) unread++;
  }
  fastdom.mutate(()=>
  {
    if (count || pending) butt.dataset.count = count || pending;
    else delete butt.dataset.count;
    if (unread) butt.dataset.stashed = unread;
    else delete butt.dataset.stashed;
  });
};


// update conversation list item after new message
aa.m.convo_upd =(pubkey,rumor)=>
{
  let convo = aa.m.convos.get(pubkey);
  if (!convo) return;

  let time = rumor.created_at || 0;
  let is_new = time > aa.m.seen_ts(pubkey);
  let is_latest = time >= (convo.latest_stamp || 0);

  // only update preview/time/position for the latest message
  if (is_latest)
  {
    convo.latest_stamp = time;
    fastdom.mutate(()=>
    {
      let p_el = convo.item.querySelector('.m_convo_preview');
      if (p_el) p_el.textContent = rumor.content?.slice(0,40) || '';
      let t_el = convo.item.querySelector('.m_convo_time');
      if (t_el) t_el.textContent = aa.fx.time_elapsed(new Date(time * 1000));
      convo.item.dataset.stamp = time;

      // sort: insert before the first item with a lower stamp
      let placed = false;
      for (let sibling = convo.item.nextElementSibling; sibling; sibling = sibling.nextElementSibling)
      {
        if (sibling.classList.contains('m_convo_item'))
        {
          let s = parseInt(sibling.dataset.stamp) || 0;
          if (time > s) { sibling.before(convo.item); placed = true; break }
        }
      }
      if (!placed)
      {
        for (let sibling = convo.item.previousElementSibling; sibling; sibling = sibling.previousElementSibling)
        {
          if (sibling.classList.contains('m_convo_item'))
          {
            let s = parseInt(sibling.dataset.stamp) || 0;
            if (time <= s) { sibling.after(convo.item); placed = true; break }
          }
        }
      }
      if (!placed && convo.item.previousElementSibling)
        aa.m.list_el.prepend(convo.item);
    });
  }

  fastdom.mutate(()=>
  {
    // unread count
    if (is_new && aa.m.active !== pubkey)
    {
      convo.unread++;
      let u_el = convo.item.querySelector('.m_convo_unread');
      if (u_el)
      {
        u_el.textContent = convo.unread;
        u_el.classList.remove('hidden');
      }
    }

    // update header count if convo is open
    if (aa.m.active === pubkey)
    {
      let btn = aa.m.view_el.querySelector('.m_mark_read');
      if (btn) btn.textContent = convo.messages.children.length;
    }
  });

  debt.add(aa.m.count_upd, 100, 'm_count');
};


// mark conversation as read — toggle like replies header
aa.m.mark_read =pubkey=>
{
  let convo = aa.m.convos.get(pubkey);
  if (!convo) return;

  let new_msgs = convo.messages.querySelectorAll('.m_new');

  if (new_msgs.length)
  {
    // has new messages: mark all read, hide read messages
    for (let el of new_msgs) el.classList.remove('m_new');

    // store latest timestamp as seen
    let latest = 0;
    for (let i = convo.messages.children.length - 1; i >= 0; i--)
    {
      let s = parseInt(convo.messages.children[i].dataset.stamp);
      if (s > latest) { latest = s; break }
    }
    if (latest)
    {
      aa.m.o.seen[pubkey] = latest;
      debt.add(aa.m.save_seen, 2100, 'm_save_seen');
    }

    fastdom.mutate(()=>{ aa.m.view_el.classList.add('m_read') });
  }
  else
  {
    // no new messages: toggle read/unread visibility
    fastdom.mutate(()=>{ aa.m.view_el.classList.toggle('m_read') });
  }

  convo.unread = 0;
  aa.m.count_upd();
  fastdom.mutate(()=>
  {
    let u_el = convo.item.querySelector('.m_convo_unread');
    if (u_el)
    {
      u_el.textContent = '0';
      u_el.classList.add('hidden');
    }
  });
};


// open conversation in right panel
aa.m.open =pubkey=>
{
  let convo = aa.m.convo(pubkey);
  aa.m.active = pubkey;
  aa.l.classList.add('view_m');

  // store seen timestamp, reset unread + badge
  let latest = 0;
  for (let i = convo.messages.children.length - 1; i >= 0; i--)
  {
    let s = parseInt(convo.messages.children[i].dataset.stamp);
    if (s > latest) { latest = s; break }
  }
  if (latest)
  {
    aa.m.o.seen[pubkey] = latest;
    debt.add(aa.m.save_seen, 2100, 'm_save_seen');
  }
  convo.unread = 0;
  aa.m.count_upd();

  let header = aa.mk.m_convo_header(pubkey);

  fastdom.mutate(()=>
  {
    aa.m.view_el.textContent = '';
    aa.m.view_el.classList.remove('m_read');
    aa.m.view_el.append(header, convo.messages);

    // mark active in list
    let prev = aa.m.list_el.querySelector('.m_convo_item.active');
    if (prev) prev.classList.remove('active');
    convo.item.classList.add('active');

    // clear unread badge
    let u_el = convo.item.querySelector('.m_convo_unread');
    if (u_el)
    {
      u_el.textContent = '0';
      u_el.classList.add('hidden');
    }

    // remove new markers
    for (let el of convo.messages.querySelectorAll('.m_new'))
      el.classList.remove('m_new');

    // scroll to bottom
    convo.messages.scrollTop = convo.messages.scrollHeight;
  });

  // swap CLI default action to send DM
  if (!aa.m._prev_action) aa.m._prev_action = aa.cli.def.action;
  aa.bus.emit('cli:set_default',
  {
    action:['m','send'],
    description:'send DM',
    exe: s =>
    {
      if (localStorage.m_auto_send === 'on')
        aa.m.clk.send_msg(s, pubkey);
      else
      {
        let draft = aa.mk.m_draft(s, pubkey);
        let convo = aa.m.convos.get(pubkey);
        if (convo) fastdom.mutate(()=>{ convo.messages.append(draft) });
      }
      aa.bus.emit('cli:dismiss');
    }
  });
  if (aa.cli?.t) aa.cli.t.dataset.note_type = 'kind-14 direct message';
};


// seal rumor: strip sig, keep id, nip44 encrypt, sign as kind 13
aa.m.seal =async(rumor,recipient)=>
{
  let {sig:_,...clean} = rumor;
  let content;
  try { content = await aa.signer.nip44.encrypt(recipient,JSON.stringify(clean)) }
  catch(er) { aa.log('nip44 encrypt failed'); return false }
  if (typeof content !== 'string' || content.length < 100)
  {
    aa.log('nip44 encrypt: invalid result');
    return false
  }
  let event = aa.fx.normalise_event(
  {
    kind:13, content,
    created_at:aa.m.rand_ts(aa.now), tags:[]
  });
  return aa.bus.request('e:sign', event)
};


// send DM: seal + wrap + broadcast
aa.m.send =async(rumor,recipient)=>
{
  if (!aa.signer.available()) return aa.log('signer needed');
  if (!recipient) return aa.log('no recipient');

  let sender = aa.u.p.pubkey;

  let seal = await aa.m.seal(rumor,recipient);
  if (!seal) return;

  if (!rumor.id) rumor.id = aa.fx.hash(rumor);

  // track chain
  let wrap_ids = [];
  let wraps = {};
  aa.m.chain.set(rumor.id, {rumor, seal, wrap_ids, wraps, counterparty:recipient});

  for (const pub of [recipient,sender])
  {
    let wrap = NostrTools.nip59.createWrap(seal,pub);
    let relays = aa.m.dm_relays(pub);
    if (!relays.length) relays = aa.r.w;
    aa.r.send_event({event:wrap,relays});

    wrap_ids.push(wrap.id);
    wraps[wrap.id] = wrap;
    aa.m.chain_wrap.set(wrap.id, rumor.id);

    if (pub === sender)
      await aa.u.decrypt_cache.add(wrap.id,JSON.stringify({rumor,seal}),recipient);
  }

  debt.add(aa.m.save, 2100, 'm_save');
  return true
};


// randomise timestamp 0-48h into the past for privacy (NIP-59)
aa.m.rand_ts =ts=> ts - Math.floor(Math.random() * 172800);


// get DM relays for pubkey (kind 10050), fallback to read relays
aa.m.dm_relays =pubkey=>
{
  let p = aa.db.p[pubkey];
  if (!p?.relays) return [];
  let dm = aa.fx.in_set(p.relays,'k10050');
  return dm.length ? dm : aa.fx.in_set(p.relays,'read');
};


// get relays for own DM subscription
aa.m.relays =()=>
{
  if (!aa.u.p?.pubkey) return [];
  return aa.m.dm_relays(aa.u.p.pubkey);
};


// start a new conversation from CLI or button
aa.m.new_convo =s=>
{
  if (!s) return aa.log('m new <npub|pubkey>');
  let pubkey = s.startsWith('npub') ? aa.fx.decode(s) : s;
  if (!aa.fx.is_key(pubkey)) return aa.log('invalid pubkey');
  if (aa.u.is_u(pubkey)) return aa.log('cannot dm yourself');

  let npub = aa.fx.encode('npub',pubkey);
  aa.view.state('#m_'+npub);
};


// save convo wrap_ids to IDB (debounced via caller)
aa.m.save =()=>
{
  let convos = {};
  for (let [, entry] of aa.m.chain)
  {
    let cp = entry.counterparty;
    if (!cp || !entry.wrap_ids?.length) continue;
    if (!convos[cp]) convos[cp] = [];
    for (let wid of entry.wrap_ids)
    {
      if (!convos[cp].includes(wid))
        convos[cp].push(wid);
    }
  }
  aa.m.o.convos = convos;
  aa.mod.save_to(aa.m);
};


// persist pending wrap ids to IDB
aa.m.save_pending =()=> aa.mod.save_to(aa.m);

// persist seen timestamps to IDB
aa.m.save_seen =()=> aa.mod.save_to(aa.m);


// restore conversations from decrypt cache + pending wraps from event store
aa.m.restore =async()=>
{
  if (aa.m._restored) return;
  aa.m._restored = true;

  await new Promise(resolve => aa.mod.ready('r:manager', resolve));
  await aa.u.decrypt_cache.load();

  // restore decrypted conversations from cache
  let saved = aa.m.o.convos;
  if (saved)
  {
    aa.m._restoring = true;
    for (let pubkey in saved)
    {
      let wrap_ids = saved[pubkey];
      if (!wrap_ids?.length) continue;
      for (let wrap_id of wrap_ids)
      {
        let cached = aa.u.decrypt_cache._data.events[wrap_id]?.decrypted;
        if (!cached) continue;
        let parsed = aa.pj(cached);
        if (!parsed) continue;
        let rumor = parsed.rumor || parsed;
        let seal = parsed.seal;
        aa.m.show(rumor, {event:{id:wrap_id}}, seal);
      }
    }
    aa.m._restoring = false;
  }

  // restore pending gift wraps from event store
  let pending_ids = aa.m.o.pending?.filter(id => !aa.m.chain_wrap.has(id));
  if (!pending_ids?.length) return;

  let [, events] = await aa.r.get_events(pending_ids);
  if (!events?.length) return;

  for (let dat of events)
  {
    let id = dat.event.id;
    if (aa.m.chain_wrap.has(id)) continue;
    if (aa.m.pending.has(id)) continue;

    // try cache — may have been decrypted since last save
    let cached = await aa.u.decrypt_cache.get(id);
    if (cached)
    {
      let parsed = aa.pj(cached);
      if (parsed)
      {
        let rumor = parsed.rumor || parsed;
        let seal = parsed.seal;
        aa.m.show(rumor, dat, seal);
        let idx = aa.m.o.pending.indexOf(id);
        if (idx !== -1) aa.m.o.pending.splice(idx, 1);
        continue
      }
    }

    // still encrypted — add to pending
    aa.m.pending.set(id, dat);
  }

  // clean ids not found in db
  aa.m.o.pending = aa.m.o.pending.filter(id =>
    aa.m.pending.has(id) || aa.m.chain_wrap.has(id)
  );
  aa.m.save_pending();
  aa.m.pending_upd();
};


// clear m view state
aa.m.view_clear =()=>
{
  if (!aa.m.active) return;
  aa.m.active = null;
  aa.l.classList.remove('view_m');

  // navigate away if still the active view (direct call, not from view.clear chain)
  if (aa.view.active && String(aa.view.active).startsWith('m_'))
    aa.view.state('');

  // restore CLI default action and note type
  if (aa.m._prev_action)
  {
    aa.bus.emit('cli:set_default', aa.m._prev_action);
    aa.m._prev_action = null;
  }
  aa.e.cli_note_type();

  fastdom.mutate(()=>
  {
    aa.m.view_el.textContent = '';
    let prev = aa.m.list_el.querySelector('.m_convo_item.active');
    if (prev) prev.classList.remove('active');
  });
};
