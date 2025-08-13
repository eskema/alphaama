// process note by kind if available, otherwise default
aa.e.note_by_kind =dat=>
{
  let kind = dat.event.kind;
  // k>=1000  && k<=9999 : regular
  // k>=10000 && k<=19999 || k===0 || k===3: replaceable
  // k>=20000 && k<=29999 : ephemeral
  // k>=30000 && k<=39999 : replaceable_parameterized
  let type = aa.fx.kind_type(dat.event.kind); 
  if (Object.hasOwn(aa.kinds,kind)) return aa.kinds[kind](dat);
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
  let note = aa.mk.note(dat);

  let d_tag = dat.event.tags.filter(t=>t[0] === 'd')[0];
  if (d_tag?.length > 1) 
  {
    let ds = d_tag[1];
    let id_a = [dat.event.kind,dat.event.pubkey,ds].join(':');
    note.dataset.d = ds;
    note.dataset.id_a = id_a;
    let og = document.querySelector(`[data-id_a="${id_a}"]`);
    let versions = og?.querySelector('.versions');
    if (versions) 
    {
      if (og.dataset.created_at < dat.event.created_at)
      {
        aa.e.append_as_rep(note,og.parentElement);
        note.append(versions);
        versions.append(og);
      }
      else aa.e.append_as_rep(note,versions);
    }
    else 
    {
      let details = aa.mk.details('versions',false,true);
      details.classList.add('versions');
      note.append(details);
      aa.e.append_as_root(note);
    }
  }
  return note
};


// event template for user metadata 
aa.kinds[0] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  aa.p.get(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      if (aa.temp.miss?.p?.has(dat.event.pubkey)) 
        aa.temp.miss.p.delete(dat.event.pubkey);

      let metadata = aa.parse.j(dat.event.content);
      if (metadata)
      {
        p.metadata = metadata;
        aa.p.save(p);
        aa.p.links_upd(p);
        if (aa.fx.is_u(dat.event.pubkey) 
        && aa.u) aa.u.upd_u_u();
      }
    }
  });
  
  return note
};


// plain note
aa.kinds[1] =dat=>
{
  let note = aa.mk.note(dat);
  aa.fx.authors_load_from_tags(dat.event.tags);
  aa.e.append_to(dat,note,aa.fx.tag_reply(dat.event.tags));
  return note
};


// event template for follow list / contacts with legacy relay object
aa.kinds[3] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  aa.p.get(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      aa.p.process_k3_tags(dat.event);
      aa.p.save(p)
    }
  });
  return note
};


// event template for event deletion requests
aa.kinds[5] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('tiny');
  return note
};


// repost of kind-1 note
aa.kinds[6] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny'); // 'is_new',
  let tag_reply = aa.fx.tag_e_last(dat.event.tags);
  if (tag_reply?.length)
  {    
    let repost_id = tag_reply[1];
    aa.e.get(repost_id)
    .then(dat_repost=>
    {
      if (dat_repost) 
      {
        aa.e.print_q(dat_repost);
        return
      }

      let event = aa.parse.j(dat.event.content);
      dat_repost = aa.mk.dat({event,subs:['k6']})
      aa.fx.verify_event(event).then(()=>
      {
        aa.e.print_q(dat_repost);
      })
    });
    aa.e.append_check(dat,note,tag_reply);
  }
  else aa.e.append_as_root(note);
  aa.fx.authors_load_from_tags(dat.event.tags);
  return note
};


// reaction
aa.kinds[7] =dat=>
{
  let note = aa.mk.note(dat);
  aa.fx.authors_load_from_tags(dat.event.tags);
  note.classList.add('tiny');

  let tag_reply = aa.fx.tag_e_last(dat.event.tags);
  if (!tag_reply) tag_reply = aa.fx.tag_reply(dat.event.tags);
  aa.e.append_to(dat,note,tag_reply);
  
  return note
};


// image template
aa.kinds[20] =dat=>
{
  aa.fx.authors_load_from_tags(dat.event.tags);
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// video template
aa.kinds[1063] = aa.kinds[20];


// repost of generic note
aa.kinds[16] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny'); // 'is_new',
  aa.e.append_check(dat,note,aa.fx.tag_reply(dat.event.tags));
  aa.fx.authors_load_from_tags(dat.event.tags);
  return note
};


// generic comment
aa.kinds[1111] =dat=>
{
  let note = aa.mk.note(dat);
  aa.fx.authors_load_from_tags(dat.event.tags);
  aa.e.append_check(dat,note,aa.fx.tag_comment_reply(dat.event.tags));
  return note
};

aa.kinds[11] = aa.kinds[1111];


// zap template
aa.kinds[9735] = aa.kinds[1];


// highlight template
aa.kinds[9802] = aa.kinds[20];


// event template for relay list
aa.kinds[10002] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  aa.p.get(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      let relays = {};
      let sets = ['k10002'];
      let tags = dat.event.tags.filter(i=>i[0]==='r');
      for (const tag of tags)
      {
        let [type,url,permission] = tag;
        url = aa.fx.url(url)?.href;
        if (!url) continue;
        
        let relay = relays[url] = {sets};
        if (permission === 'read') 
          aa.fx.a_add(relay.sets,['read']);
        else if (permission === 'write') 
          aa.fx.a_add(relay.sets,['write']);
        else aa.fx.a_add(relay.sets,['read','write']);
        // if (aa.fx.is_u(dat.event.pubkey)) aa.fx.a_add(relay.sets,['auth']);
      }
      // let relays = aa.r.from_tags(dat.event.tags,['k10002']);
      aa.p.relays_add(relays,p);
      if (aa.fx.is_u(dat.event.pubkey)) aa.r.add_from_o(relays);
      aa.p.save(p);
    }
  });
  
  return note
};


// long-form template
aa.kinds[30023] =dat=>
{
  let note = aa.e.note_pre(dat);
  aa.fx.authors_load_from_tags(dat.event.tags);
  return note
};


// video
aa.kinds[34235] =dat=>
{
  let note = aa.e.note_pre(dat);
  aa.fx.authors_load_from_tags(dat.event.tags);
  return note
};