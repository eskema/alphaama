/*

alphaama
mod    dm
direct messages (NIP-17)

*/

aa.dm =
{
  name:'dm',
  about:'direct messages (NIP-17)',
  def:{id:'dm'},
  convos: new Map(),
  chain: new Map(),
  chain_wrap: new Map(),
  scripts:
  [
    '/dm/mk.js',
    '/dm/clk.js',
    '/dm/view.js',
  ],
  styles:
  [
    '/dm/dm.css',
  ],
};


aa.dm.load =async()=>
{
  let mod = aa.dm;

  // load saved state from IDB stuff store
  mod.o = await aa.db.ops('idb', {get:{store:'stuff',key:mod.def.id}});
  if (!mod.o) mod.o = {id: mod.def.id};
  if (!mod.o.convos) mod.o.convos = {};

  mod.pending = new Map();
  mod.decrypt_q = new Map();
  mod.decrypt_active = new Set();

  mod.l = make('div',{cla:'dm_panel'});
  mod.list_el = make('div',{cla:'dm_list'});
  mod.view_el = make('div',{cla:'dm_view'});
  mod.l.append(mod.list_el, mod.view_el);

  aa.view.clears.push(aa.dm.view_clear);
  aa.mod.help_setup(mod);

  aa.actions.push(
  {
    action:[mod.def.id,'get'],
    optional:['<days>'],
    description:'subscribe to DMs from relays',
    exe: aa.dm.sub
  },
  {
    action:[mod.def.id,'new'],
    required:['<npub|pubkey>'],
    description:'start a conversation',
    exe: aa.dm.new_convo
  },
  {
    action:[mod.def.id,'decrypt'],
    required:['<id>'],
    description:'decrypt gift wrap',
    exe: id=> aa.dm.unwrap_by_id(id)
  });

  if (localStorage.dm_get === 'on')
    aa.mod.ready('u:pubkey', aa.dm.sub);
};


// create own relay subscription for kind 1059 tagged to user
aa.dm.sub =s=>
{
  if (!aa.u.p?.pubkey) return;
  aa.dm.restore();
  let id = 'dm';
  let filter = {kinds:[1059],'#p':[aa.u.p.pubkey]};

  // parse optional days argument
  let days = parseInt(s);
  if (days > 0)
    filter.since = aa.now - (days * 86400);
  else if (s !== 'all')
    filter.since = aa.now - (7 * 86400);

  let relays = aa.dm.relays();
  if (!relays.length) relays = aa.r.r;

  aa.r.on_sub.set(id, aa.dm.on_event);
  aa.r.send_req({request:['REQ',id,filter], relays});
};


// incoming event from own subscription
aa.dm.on_event =async dat=>
{
  let id = dat.event.id;
  if (aa.dm.chain_wrap.has(id)) return;
  if (aa.dm.pending.has(id)) return;

  // try cache first (no popup)
  let cached = await aa.u.decrypt_cache.get(id);
  if (cached)
  {
    let parsed = aa.pj(cached);
    if (parsed)
    {
      let rumor = parsed.rumor || parsed;
      let seal = parsed.seal;
      aa.dm.show(rumor, dat, seal);
      return
    }
  }

  // auto-decrypt or stash as pending
  if (localStorage.dm_decrypt === 'on')
    aa.dm.decrypt_add(dat);
  else
    aa.dm.pending_add(dat);
};


// queue a gift wrap for decryption (debounced)
aa.dm.decrypt_add =dat=>
{
  let id = dat.event.id;
  if (aa.dm.decrypt_q.has(id)) return;
  aa.dm.decrypt_q.set(id,dat);
  debt.add(aa.dm.decrypt_run,420,'dm_decrypt_q');
};


// process decrypt queue sequentially
aa.dm.decrypt_run =async()=>
{
  let batch = [...aa.dm.decrypt_q.values()];
  aa.dm.decrypt_q.clear();
  for (let dat of batch)
  {
    let ok = await aa.dm.unwrap(dat);
    if (!ok) await aa.u.decrypt_cache.fail(dat.event.id);
  }
};


// add gift wrap to pending (no decrypt)
aa.dm.pending_add =dat=>
{
  aa.dm.pending.set(dat.event.id, dat);
  aa.dm.pending_upd();
};


// update pending convo item in list
aa.dm.pending_upd =()=>
{
  let count = aa.dm.pending.size;
  if (!count && aa.dm.pending_item)
  {
    fastdom.mutate(()=>{ aa.dm.pending_item.remove() });
    aa.dm.pending_item = null;
    if (aa.dm.active === '_pending') aa.dm.view_clear();
    return
  }
  if (count && !aa.dm.pending_item)
  {
    aa.dm.pending_item = aa.mk.dm_pending_item();
    fastdom.mutate(()=>{ aa.dm.list_el.prepend(aa.dm.pending_item) });
  }
  if (aa.dm.pending_item)
  {
    fastdom.mutate(()=>
    {
      let c = aa.dm.pending_item.querySelector('.dm_convo_unread');
      if (c) { c.textContent = count; c.classList.remove('hidden') }
    });
  }
  debt.add(aa.dm.count_upd, 100, 'dm_count');
};


// decrypt N pending gift wraps
aa.dm.decrypt_pending =async n=>
{
  let batch = [...aa.dm.pending.entries()].slice(0, n);
  for (let [id, dat] of batch)
  {
    aa.dm.pending.delete(id);
    let ok = await aa.dm.unwrap(dat);
    if (!ok) await aa.u.decrypt_cache.fail(id);
    let el = aa.dm.view_el.querySelector('.dm_pending_wrap[data-id="'+id+'"]');
    if (el) fastdom.mutate(()=>{ el.remove() });
  }
  aa.dm.pending_upd();
};


// open pending view in right panel
aa.dm.open_pending =()=>
{
  aa.dm.active = '_pending';

  let header = aa.mk.dm_pending_header();
  let list = make('div',{cla:'dm_pending_list'});

  for (let [id, dat] of aa.dm.pending)
  {
    list.append(aa.mk.dm_pending_wrap(id, dat));
  }

  fastdom.mutate(()=>
  {
    aa.dm.view_el.textContent = '';
    aa.dm.view_el.append(header, list);

    let prev = aa.dm.list_el.querySelector('.dm_convo_item.active');
    if (prev) prev.classList.remove('active');
    if (aa.dm.pending_item) aa.dm.pending_item.classList.add('active');
  });
};


// unwrap gift wrap (kind 1059) -> seal (kind 13) -> rumor (kind 14)
aa.dm.unwrap =async dat=>
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
      aa.dm.show(rumor,dat,seal);
      return true
    }
  }
  if (await aa.u.decrypt_cache.is_fail(wrap.id)) return false;
  if (!aa.signer.available()) return false;
  if (aa.dm.decrypt_active.has(wrap.id)) return false;
  aa.dm.decrypt_active.add(wrap.id);

  try
  {
    // layer 1: decrypt gift wrap -> seal
    let seal_json;
    try { seal_json = await aa.signer.nip44.decrypt(wrap.pubkey,wrap.content) }
    catch(er) { return false }
    if (!seal_json) return false;

    let seal = aa.pj(seal_json);
    if (!seal || seal.kind !== 13) return false;
    if (!await aa.fx.verify_event(seal)) return false;

    // layer 2: decrypt seal -> rumor
    let rumor_json;
    try { rumor_json = await aa.signer.nip44.decrypt(seal.pubkey,seal.content) }
    catch(er) { rumor_json = null }

    let rumor = rumor_json ? aa.pj(rumor_json) : null;

    // self-copy ECDH fix: seal.pubkey = user -> need counterparty key
    if ((!rumor || rumor.pubkey !== seal.pubkey) && aa.u.is_u(seal.pubkey))
    {
      for (const [key] of aa.dm.convos)
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

    if (!rumor || rumor.pubkey !== seal.pubkey) return false;

    await aa.u.decrypt_cache.add(wrap.id,JSON.stringify({rumor,seal}),seal.pubkey);
    aa.dm.show(rumor,dat,seal);
    return true
  }
  finally { aa.dm.decrypt_active.delete(wrap.id) }
};


// unwrap by event id (CLI action)
aa.dm.unwrap_by_id =async id=>
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
  return aa.dm.unwrap(dat)
};


// display decrypted message in conversation
aa.dm.show =(rumor,wrap_dat,seal)=>
{
  if (!rumor.id) rumor.id = aa.fx.hash(rumor);

  // already shown
  if (aa.dm.chain.has(rumor.id))
  {
    // just add this wrap to chain
    let entry = aa.dm.chain.get(rumor.id);
    if (!entry.wrap_ids) entry.wrap_ids = [];
    aa.fx.a_add(entry.wrap_ids,[wrap_dat.event.id]);
    aa.dm.chain_wrap.set(wrap_dat.event.id,rumor.id);
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
  aa.dm.chain.set(rumor.id, {rumor, seal, wrap_ids:[wrap_dat.event.id], counterparty});
  aa.dm.chain_wrap.set(wrap_dat.event.id, rumor.id);

  // get or create convo
  let convo = aa.dm.convo(counterparty);

  // create message DOM
  let msg = aa.mk.dm_msg(rumor);
  let stamp = rumor.created_at || 0;

  // mark as new if newer than last seen
  if (stamp > aa.dm.seen_ts(counterparty))
    msg.classList.add('dm_new');

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
  aa.dm.convo_upd(counterparty, rumor);

  // persist convo state
  if (!aa.dm._restoring)
    debt.add(aa.dm.save, 2100, 'dm_save');
};


// get or create conversation
aa.dm.convo =pubkey=>
{
  if (aa.dm.convos.has(pubkey))
    return aa.dm.convos.get(pubkey);

  let item = aa.mk.dm_convo_item(pubkey);
  let messages = make('div',{cla:'dm_messages'});
  let element = make('div',{cla:'dm_convo_wrap', dat:{pubkey}});
  element.append(messages);

  let convo = {pubkey, item, messages, element, unread:0};
  aa.dm.convos.set(pubkey, convo);

  fastdom.mutate(()=>{ aa.dm.list_el.append(item) });

  aa.p.author(pubkey);

  return convo
};


// get last-seen timestamp for a conversation
aa.dm.seen_ts =pubkey=> parseInt(sessionStorage['dm_seen_'+pubkey]) || 0;


// update section button counts: convos / unread+pending
aa.dm.count_upd =()=>
{
  let butt = aa.el.get('butt_section_dm');
  if (!butt) return;
  let count = aa.dm.convos.size || Object.keys(aa.dm.o?.convos || {}).length;
  let pending = aa.dm.pending?.size || 0;
  let unread = pending;
  for (let [, convo] of aa.dm.convos)
  {
    if (convo.unread > 0) unread++;
  }
  fastdom.mutate(()=>
  {
    if (count) butt.dataset.count = count;
    else delete butt.dataset.count;
    if (unread) butt.dataset.stashed = unread;
    else delete butt.dataset.stashed;
  });
};


// update conversation list item after new message
aa.dm.convo_upd =(pubkey,rumor)=>
{
  let convo = aa.dm.convos.get(pubkey);
  if (!convo) return;

  let time = rumor.created_at || 0;
  let is_new = time > aa.dm.seen_ts(pubkey);
  let is_latest = time >= (convo.latest_stamp || 0);

  // only update preview/time/position for the latest message
  if (is_latest)
  {
    convo.latest_stamp = time;
    fastdom.mutate(()=>
    {
      let p_el = convo.item.querySelector('.dm_convo_preview');
      if (p_el) p_el.textContent = rumor.content?.slice(0,40) || '';
      let t_el = convo.item.querySelector('.dm_convo_time');
      if (t_el) t_el.textContent = aa.fx.time_elapsed(new Date(time * 1000));
      convo.item.dataset.stamp = time;

      // sort: insert before the first item with a lower stamp
      let placed = false;
      for (let sibling = convo.item.nextElementSibling; sibling; sibling = sibling.nextElementSibling)
      {
        if (sibling.classList.contains('dm_convo_item'))
        {
          let s = parseInt(sibling.dataset.stamp) || 0;
          if (time > s) { sibling.before(convo.item); placed = true; break }
        }
      }
      if (!placed)
      {
        for (let sibling = convo.item.previousElementSibling; sibling; sibling = sibling.previousElementSibling)
        {
          if (sibling.classList.contains('dm_convo_item'))
          {
            let s = parseInt(sibling.dataset.stamp) || 0;
            if (time <= s) { sibling.after(convo.item); placed = true; break }
          }
        }
      }
      if (!placed && convo.item.previousElementSibling)
        aa.dm.list_el.prepend(convo.item);
    });
  }

  fastdom.mutate(()=>
  {
    // unread count
    if (is_new && aa.dm.active !== pubkey)
    {
      convo.unread++;
      let u_el = convo.item.querySelector('.dm_convo_unread');
      if (u_el)
      {
        u_el.textContent = convo.unread;
        u_el.classList.remove('hidden');
      }
    }

    // update header count if convo is open
    if (aa.dm.active === pubkey)
    {
      let btn = aa.dm.view_el.querySelector('.dm_mark_read');
      if (btn) btn.textContent = convo.messages.children.length;
    }
  });

  debt.add(aa.dm.count_upd, 100, 'dm_count');
};


// mark conversation as read — toggle like replies header
aa.dm.mark_read =pubkey=>
{
  let convo = aa.dm.convos.get(pubkey);
  if (!convo) return;

  let new_msgs = convo.messages.querySelectorAll('.dm_new');

  if (new_msgs.length)
  {
    // has new messages: mark all read, hide read messages
    for (let el of new_msgs) el.classList.remove('dm_new');

    // store latest timestamp as seen
    let latest = 0;
    for (let i = convo.messages.children.length - 1; i >= 0; i--)
    {
      let s = parseInt(convo.messages.children[i].dataset.stamp);
      if (s > latest) { latest = s; break }
    }
    if (latest) sessionStorage['dm_seen_'+pubkey] = latest;

    fastdom.mutate(()=>{ aa.dm.view_el.classList.add('dm_read') });
  }
  else
  {
    // no new messages: toggle read/unread visibility
    fastdom.mutate(()=>{ aa.dm.view_el.classList.toggle('dm_read') });
  }

  convo.unread = 0;
  aa.dm.count_upd();
  fastdom.mutate(()=>
  {
    let u_el = convo.item.querySelector('.dm_convo_unread');
    if (u_el)
    {
      u_el.textContent = '0';
      u_el.classList.add('hidden');
    }
  });
};


// open conversation in right panel
aa.dm.open =pubkey=>
{
  let convo = aa.dm.convo(pubkey);
  aa.dm.active = pubkey;

  // store seen timestamp, reset unread + badge
  let latest = 0;
  for (let i = convo.messages.children.length - 1; i >= 0; i--)
  {
    let s = parseInt(convo.messages.children[i].dataset.stamp);
    if (s > latest) { latest = s; break }
  }
  if (latest) sessionStorage['dm_seen_'+pubkey] = latest;
  convo.unread = 0;
  aa.dm.count_upd();

  let header = aa.mk.dm_convo_header(pubkey);

  fastdom.mutate(()=>
  {
    aa.dm.view_el.textContent = '';
    aa.dm.view_el.classList.remove('dm_read');
    aa.dm.view_el.append(header, convo.messages);

    // mark active in list
    let prev = aa.dm.list_el.querySelector('.dm_convo_item.active');
    if (prev) prev.classList.remove('active');
    convo.item.classList.add('active');

    // clear unread badge
    let u_el = convo.item.querySelector('.dm_convo_unread');
    if (u_el)
    {
      u_el.textContent = '0';
      u_el.classList.add('hidden');
    }

    // remove new markers
    for (let el of convo.messages.querySelectorAll('.dm_new'))
      el.classList.remove('dm_new');

    // scroll to bottom
    convo.messages.scrollTop = convo.messages.scrollHeight;
  });

  // swap CLI default action to send DM
  if (!aa.dm._prev_action) aa.dm._prev_action = aa.cli.def.action;
  aa.bus.emit('cli:set_default',
  {
    action:['dm','send'],
    description:'send DM',
    exe: s =>
    {
      if (localStorage.dm_auto_send === 'on')
        aa.dm.clk.send_msg(s, pubkey);
      else
      {
        let draft = aa.mk.dm_draft(s, pubkey);
        let convo = aa.dm.convos.get(pubkey);
        if (convo) fastdom.mutate(()=>{ convo.messages.append(draft) });
      }
    }
  });
  if (aa.cli?.t) aa.cli.t.dataset.note_type = 'kind-14 direct message';
};


// seal rumor: strip sig, keep id, nip44 encrypt, sign as kind 13
aa.dm.seal =async(rumor,recipient)=>
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
    created_at:aa.dm.rand_ts(aa.now), tags:[]
  });
  return aa.bus.request('e:sign', event)
};


// send DM: seal + wrap + broadcast
aa.dm.send =async(rumor,recipient)=>
{
  if (!aa.signer.available()) return aa.log('signer needed');
  if (!recipient) return aa.log('no recipient');

  let sender = aa.u.p.pubkey;

  let seal = await aa.dm.seal(rumor,recipient);
  if (!seal) return;

  if (!rumor.id) rumor.id = aa.fx.hash(rumor);

  // track chain
  let wrap_ids = [];
  aa.dm.chain.set(rumor.id, {rumor, seal, wrap_ids, counterparty:recipient});

  for (const pub of [recipient,sender])
  {
    let wrap = NostrTools.nip59.createWrap(seal,pub);
    let relays = aa.dm.dm_relays(pub);
    if (!relays.length) relays = aa.r.w;
    aa.r.send_event({event:wrap,relays});

    wrap_ids.push(wrap.id);
    aa.dm.chain_wrap.set(wrap.id, rumor.id);

    if (pub === sender)
      await aa.u.decrypt_cache.add(wrap.id,JSON.stringify({rumor,seal}),recipient);
  }

  debt.add(aa.dm.save, 2100, 'dm_save');
  return true
};


// randomise timestamp 0-48h into the past for privacy (NIP-59)
aa.dm.rand_ts =ts=> ts - Math.floor(Math.random() * 172800);


// get DM relays for pubkey (kind 10050), fallback to read relays
aa.dm.dm_relays =pubkey=>
{
  let p = aa.db.p[pubkey];
  if (!p?.relays) return [];
  let dm = aa.fx.in_set(p.relays,'k10050');
  return dm.length ? dm : aa.fx.in_set(p.relays,'read');
};


// get relays for own DM subscription
aa.dm.relays =()=>
{
  if (!aa.u.p?.pubkey) return [];
  return aa.dm.dm_relays(aa.u.p.pubkey);
};


// start a new conversation from CLI or button
aa.dm.new_convo =s=>
{
  if (!s) return aa.log('dm new <npub|pubkey>');
  let pubkey = s.startsWith('npub') ? aa.fx.decode(s) : s;
  if (!aa.fx.is_key(pubkey)) return aa.log('invalid pubkey');
  if (aa.u.is_u(pubkey)) return aa.log('cannot dm yourself');

  let npub = aa.fx.encode('npub',pubkey);
  aa.view.state('#dm_'+npub);
};


// save convo wrap_ids to IDB (debounced via caller)
aa.dm.save =()=>
{
  let convos = {};
  for (let [, entry] of aa.dm.chain)
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
  aa.dm.o.convos = convos;
  aa.mod.save_to(aa.dm);
};


// restore conversations from decrypt cache
aa.dm.restore =async()=>
{
  if (aa.dm._restored) return;
  aa.dm._restored = true;

  let saved = aa.dm.o.convos;
  if (!saved) return;

  aa.dm._restoring = true;
  await aa.u.decrypt_cache.load();
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
      aa.dm.show(rumor, {event:{id:wrap_id}}, seal);
    }
  }
  aa.dm._restoring = false;
};


// clear dm view state
aa.dm.view_clear =()=>
{
  aa.dm.active = null;
  aa.l.classList.remove('view_dm');

  // restore CLI default action and note type
  if (aa.dm._prev_action)
  {
    aa.bus.emit('cli:set_default', aa.dm._prev_action);
    aa.dm._prev_action = null;
  }
  aa.e.cli_note_type();

  fastdom.mutate(()=>
  {
    aa.dm.view_el.textContent = '';
    let prev = aa.dm.list_el.querySelector('.dm_convo_item.active');
    if (prev) prev.classList.remove('active');
  });
};
