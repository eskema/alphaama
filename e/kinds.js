// process note by kind if available, otherwise default
aa.e.note_by_kind =dat=>
{
  let kind = dat.event.kind;
  // k>=1000  && k<=9999 : regular
  // k>=10000 && k<=19999 || k===0 || k===3: replaceable
  // k>=20000 && k<=29999 : ephemeral
  // k>=30000 && k<=39999 : replaceable_parameterized
  let type = aa.fx.kind_type(dat.event.kind); 
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
    else aa.e.append_as_rep(note,versions);
  }
  // else 
  // {
  //   let details = aa.mk.details('versions',false,true);
  //   details.classList.add('versions');
  //   note.append(details);
  //   aa.e.append_as_root(note);
  // }
  // }
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

      let metadata = aa.parse.j(dat.event.content);
      if (metadata)
      {
        p.metadata = metadata;
        aa.p.save(p);
        aa.p.links_upd(p);
        if (aa.fx.is_u(dat.event.pubkey)) aa.u.upd_u_u();
      }
    }
  });
  
  return note
};


// plain note
aa.e.kinds[1] =dat=>
{
  let note = aa.mk.note(dat);
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  aa.e.append_to(dat,note,aa.fx.tag_reply(dat.event.tags));
  return note
};


// event template for follow list / contacts with legacy relay object
aa.e.kinds[3] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
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

      let event = aa.parse.j(dat.event.content);
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
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  note.classList.add('tiny');

  let tag_reply = aa.fx.tag_e_last(dat.event.tags);
  if (!tag_reply) tag_reply = aa.fx.tag_reply(dat.event.tags);
  aa.e.append_to(dat,note,tag_reply);
  
  return note
};


// image template
aa.e.kinds[20] =dat=>
{
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// video template
aa.e.kinds[1063] = aa.e.kinds[20];


// repost of generic note
aa.e.kinds[16] =dat=>
{
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  let note = aa.mk.note(dat);
  note.classList.add('tiny'); // 'is_new',
  aa.e.append_check(dat,note,aa.fx.tag_reply(dat.event.tags));
  return note
};


// generic comment
aa.e.kinds[1111] =dat=>
{
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  let note = aa.mk.note(dat);
  aa.e.append_check(dat,note,aa.fx.tag_comment_reply(dat.event.tags));
  return note
};

aa.e.kinds[11] = aa.e.kinds[1111];


// zap template
aa.e.kinds[9735] = aa.e.kinds[1];


// highlight template
aa.e.kinds[9802] = aa.e.kinds[20];


// event template for relay list
aa.e.kinds[10002] =dat=>
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
aa.e.kinds[30023] =dat=>
{
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  let note = aa.e.note_pre(dat);
  return note
};


// video
aa.e.kinds[34235] =dat=>
{
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  let note = aa.e.note_pre(dat);
  return note
};