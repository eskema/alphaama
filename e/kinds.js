// kinds that should load p-tagged profiles
aa.e.p_tag_kinds = new Set([1,7,11,14,16,20,1063,1111,9735,9802,30023,34235]);


// process note by kind if available, otherwise default
aa.e.note_by_kind =dat=>
{
  let kind = dat.event.kind;
  let type = aa.fx.kind_type(kind);

  // always ensure author profile exists, fetch if missing
  aa.p.author(dat.event.pubkey);
  aa.e.authors([['p',dat.event.pubkey]]);

  // load p-tagged profiles for selected kinds
  if (aa.e.p_tag_kinds.has(kind))
  {
    const p_tags = dat.event.tags.filter(aa.fx.is_tag_p);
    if (p_tags.length) aa.e.authors(p_tags);
  }

  if (Object.hasOwn(aa.e.kinds,kind)) return aa.e.kinds[kind](dat);
  switch (type)
  {
    case 'parameterized': return aa.e.note_pre(dat);
    default: return aa.e.note_regular(dat);
  }
};


// regular note
aa.e.note_regular =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// replaceable parameterized note
aa.e.note_pre =dat=>
{
  // console.log('pre',dat);
  // let note = aa.mk.note(dat);
  // if (!dat.id_a) return note;

  // let d_tag = aa.fx.tag_value()dat.event.tags.filter(t=>t[0] === 'd')[0];
  // if (d_tag?.length > 1) 
  // {
  //   let ds = d_tag[1];
  //   let id_a = [dat.event.kind,dat.event.pubkey,ds].join(':');
    // note.dataset.d = ds;
    // note.dataset.id_a = id_a;

  let og_dat = aa.em_a.get(dat.id_a);
  let og_l = aa.e.printed.get(og_dat.event.id);
  

  // if (og_dat?.event.id === dat.event.id) return;

  let note = aa.mk.note(dat);
  
  if (!og_l)
  {
    let versions_element = aa.mk.details('versions',false,true);
    versions_element.classList.add('versions');
    note.append(versions_element);
    aa.e.append_as_root(note);
    return note
  }

  // let og = aa.em_a.get(dat.id_a);
    
  // let og = document.querySelector(`[data-id_a="${id_a}"]`);
  let versions = og_l.querySelector('.versions');
  if (versions) 
  {
    if (og_l.dataset.created_at < dat.event.created_at)
    {
      let next = og_l.nextElementSibling;
      
      // aa.e.append_as_rep(note,og_l.parentElement);
      note.append(versions);
      versions.append(og_l);
      og_l.parentElement.insertBefore(note,next);
    }
    else
    {
      note.classList.add('reply','rendered');
      note.classList.remove('root','orphan','not_yet');
      versions.append(note);
    }
  }

  return note
};


// event template for user metadata 
aa.e.kinds[0] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  aa.p.author(dat.event.pubkey)
  .then(p=>
  {
    if (aa.p.events_newer(p,dat.event))
    {
      if (aa.temp.miss?.p?.has(dat.event.pubkey))
        aa.temp.miss.p.delete(dat.event.pubkey);

      let metadata = aa.pj(dat.event.content);
      if (metadata)
      {
        p.metadata = metadata;
        aa.p.save(p);
        aa.p.links_upd(p);
        if (aa.u.is_u(dat.event.pubkey)) aa.u.upd_u_u();
      }
    }
  });
  
  return note
};


// plain note
aa.e.kinds[1] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_to(dat,note,aa.fx.tag_reply(dat.event.tags));
  return note
};


// event template for follow list / contacts with legacy relay object
aa.e.kinds[3] =dat=>
{
  const note = aa.e.note_regular(dat);
  aa.p.author(dat.event.pubkey).then(p=>
  {
    if (aa.p.events_newer(p,dat.event))
    {
      setTimeout(()=>{aa.p.process_k3_tags(dat.event,p)},0)
    }
  });
  return note
};


// event template for event deletion requests
aa.e.kinds[5] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('tiny');
  // track deleted refs
  let refs = [];
  for (const tag of dat.event.tags)
  {
    if (tag[0] === 'e' && tag[1]) refs.push(tag[1]);
    if (tag[0] === 'a' && tag[1]) refs.push(tag[1]);
  }
  if (refs.length) aa.e.mark_deleted(refs);
  return note
};


// repost of kind-1 note
aa.e.kinds[6] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny');
  let tag_reply = aa.fx.tag_e_last(dat.event.tags);
  if (tag_reply?.length)
  {
    let repost_id = tag_reply[1];
    aa.e.get(repost_id)
    .then(dat_repost=>
    {
      if (dat_repost?.event)
      {
        aa.e.print_q(dat_repost);
        return
      }

      let event = aa.pj(dat.event.content);
      if (event)
      {
        aa.fx.verify_event(event)
        .then(()=>
        {
          aa.e.print_q(aa.mk.dat({event,subs:['k6']}));
        })
      }
      aa.e.miss_set('e',repost_id);
      // else console.trace(dat);
    });
    aa.e.append_check(dat,note,tag_reply);
  }
  else aa.e.append_as_root(note);
  
  return note
};


// reaction
aa.e.kinds[7] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny');

  let tag_reply = aa.fx.tag_e_last(dat.event.tags);
  if (!tag_reply) tag_reply = aa.fx.tag_reply(dat.event.tags);
  aa.e.append_to(dat,note,tag_reply);
  
  return note
};


// image template
aa.e.kinds[20] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// file metadata (NIP-94)
aa.e.kinds[1063] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// repost of generic note
aa.e.kinds[16] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny'); // 'is_new',
  aa.e.append_check(dat,note,aa.fx.tag_reply(dat.event.tags));
  return note
};


// generic comment
aa.e.kinds[1111] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_to(dat,note,aa.fx.tag_comment_reply(dat.event.tags));
  return note
};

aa.e.kinds[11] = aa.e.kinds[1111];


// zap receipt
aa.e.kinds[9735] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny');

  let bolt11 = aa.fx.tag_value(dat.event.tags,'bolt11');
  let sats = NostrTools.nip57.getSatoshisAmountFromBolt11(bolt11);
  let desc = sats ? aa.pj(aa.fx.tag_value(dat.event.tags,'description')) : null;

  let tag_reply = aa.fx.tag_e_last(dat.event.tags);
  if (!tag_reply) tag_reply = aa.fx.tag_reply(dat.event.tags);
  aa.e.append_to(dat,note,tag_reply, sats ? parent=>
  {
    if (parent.dataset.zap_sats) parent.classList.add('zaps_total');
    parent.dataset.zap_sats = parseInt(parent.dataset.zap_sats || 0) + sats;

    let parent_dat = aa.em.get(parent.dataset.id);
    if (parent_dat)
    {
      if (!parent_dat.zaps) parent_dat.zaps = {};
      parent_dat.zaps[dat.event.id] = {amount:sats, pubkey:desc?.pubkey, id:dat.event.id};
    }
  } : undefined);

  return note
};


// highlight template
aa.e.kinds[9802] = aa.e.kinds[20];


// update profile relays and user relay sets from a relay list event
// sets: string or array of set names (e.g. 'k10002', ['k10050'])
aa.e.relay_list_upd =(p, dat, relays, sets)=>
{
  if (!Array.isArray(sets)) sets = [sets];
  let old = aa.fx.in_set(p.relays,sets[0],'');
  aa.p.relays_add(relays,p);
  for (const i of old)
  {
    if (!Object.hasOwn(relays,i))
    {
      p.relays[i].sets = aa.fx.a_rm(p.relays[i].sets,sets);
      if (!p.relays[i].sets.length) delete p.relays[i];
    }
  }
  if (aa.u.is_u(dat.event.pubkey))
  {
    aa.r.add_from_o(relays);
    let u_old = aa.fx.in_set(aa.r.o.ls,sets[0],'');
    for (const i of u_old)
    {
      if (!Object.hasOwn(relays,i))
      {
        aa.r.o.ls[i].sets = aa.fx.a_rm(aa.r.o.ls[i].sets,sets);
        aa.mod.ui(aa.r,i);
      }
    }
    aa.mod.save(aa.r);
  }
  aa.p.save(p);
};


// relay list (kind-10002)
aa.e.kinds[10002] =dat=>
{
  const note = aa.e.note_regular(dat);
  aa.p.author(dat.event.pubkey).then(p=>
  {
    if (aa.p.events_newer(p,dat.event))
    {
      let relays = {};
      for (const tag of dat.event.tags.filter(i=>i[0]==='r'))
      {
        let [type,url,permission] = tag;
        url = aa.fx.url(url)?.href;
        if (!url) continue;
        let relay = relays[url] = {sets: ['k10002']};
        if (permission === 'read')
          aa.fx.a_add(relay.sets,['read']);
        else if (permission === 'write')
          aa.fx.a_add(relay.sets,['write']);
        else aa.fx.a_add(relay.sets,['read','write']);
      }
      aa.e.relay_list_upd(p,dat,relays,'k10002');
    }
  });
  return note
};


// generic simple relay list kind handler
// tag_name: tag to extract urls from ('r', 'relay', etc.)
// set_key: primary set name for this kind (e.g. 'k10050')
// u_sets: extra sets added when the event belongs to the logged-in user
aa.e.relay_list_kind =(dat, tag_name, set_key, u_sets=[])=>
{
  const note = aa.e.note_regular(dat);
  aa.p.author(dat.event.pubkey).then(p=>
  {
    if (aa.p.events_newer(p,dat.event))
    {
      let relays = {};
      let is_u = u_sets.length && aa.u.is_u(dat.event.pubkey);
      for (const t of dat.event.tags.filter(i=>i[0]===tag_name))
      {
        let url = aa.fx.url(t[1])?.href;
        if (!url) continue;
        let sets = [set_key];
        if (is_u) sets.push(...u_sets);
        relays[url] = {sets};
      }
      aa.e.relay_list_upd(p,dat,relays,set_key);
    }
  });
  return note
};


// DM relay list (NIP-17, kind-10050)
aa.e.kinds[10050] =dat=> aa.e.relay_list_kind(dat,'relay','k10050',['auth']);


// search relay list (NIP-51, kind-10007)
aa.e.kinds[10007] =dat=> aa.e.relay_list_kind(dat,'r','k10007',['search']);


// blocked relay list (NIP-51, kind-10006)
// for user's own event: adds 'off' set, terminating those connections
aa.e.kinds[10006] =dat=> aa.e.relay_list_kind(dat,'r','k10006',['off']);


// generic user-own list kind handler
// only fires for the logged-in user's event, after events_newer check
// on_newer(values) receives a Set of tag values (tag_name column)
aa.e.list_kind =(dat, tag_name, on_newer)=>
{
  const note = aa.e.note_regular(dat);
  if (!aa.u.is_u(dat.event.pubkey)) return note;
  aa.p.author(dat.event.pubkey).then(up=>
  {
    if (!aa.p.events_newer(up,dat.event)) return;
    on_newer(new Set(aa.fx.tags_values(dat.event.tags,tag_name)));
  });
  return note
};


// mute list (NIP-51, kind-10000)
// p.muted overrides score at point of use (is_trusted etc)
aa.e.kinds[10000] =dat=> aa.e.list_kind(dat,'p', muted=>
{
  for (const [pubkey, prof] of Object.entries(aa.db.p))
  {
    if (prof.muted && !muted.has(pubkey))
    {
      prof.muted = false;
      aa.p.save(prof);
    }
  }
  for (const pubkey of muted)
  {
    aa.p.author(pubkey).then(mp=>
    {
      if (mp.muted) return;
      mp.muted = true;
      aa.p.save(mp);
    });
  }
});


// encrypted DM (NIP-04)
aa.e.kinds[4] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// seal (NIP-17)
aa.e.kinds[13] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// chat message rumor (NIP-17)
aa.e.kinds[14] =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// gift wrap (NIP-17)
aa.e.kinds[1059] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('gift_wrap');
  aa.e.append_as_root(note);
  return note
};


// long-form template
aa.e.kinds[30023] =dat=>
{
  let note = aa.e.note_pre(dat);
  return note
};


// video
aa.e.kinds[34235] =dat=>
{
  let note = aa.e.note_pre(dat);
  return note
};


// spell (NIP-A7)
aa.e.kinds[777] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root');
  return note
};


