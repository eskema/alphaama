// plain note
aa.kinds[1] =dat=>
{
  let note = aa.mk.note(dat);
  aa.p.from_tags(dat.event.tags);
  aa.e.append_to(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};


// repost of kind-1 note
aa.kinds[6] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny'); // 'is_new',
  let tag_reply = aa.get.tag_e_last(dat.event.tags);
  if (tag_reply && tag_reply.length)
  {    
    let repost_id = tag_reply[1];
    if (repost_id) 
    {
      aa.db.get_e(repost_id).then(dat_e=>
      {
        if (!dat_e)
        {
          let event = aa.parse.j(dat.event.content);
          
          if (event&& aa.fx.verify_event(event))
          {
            let subs = ['k6'];
            aa.r.dat(['',aa.mk.dat({event,subs})]);
          }
        }
        else aa.e.to_printer(dat_e);//aa.e.print(dat_e);
      });
    }
    aa.e.append_check(dat,note,tag_reply);
  }
  else aa.e.append_as_root(note);
  aa.p.from_tags(dat.event.tags);
  return note
};


// reaction
aa.kinds[7] =dat=>
{
  let note = aa.mk.note(dat);
  aa.p.from_tags(dat.event.tags);
  note.classList.add('tiny');

  // aa.parse.emojii(dat,note);

  let tag_reply = aa.get.tag_e_last(dat.event.tags);
  if (!tag_reply) tag_reply = aa.get.tag_reply(dat.event.tags);
  aa.e.append_to(dat,note,tag_reply);
  
  return note
};


// image template
aa.kinds[20] =dat=>
{
  aa.p.from_tags(dat.event.tags);
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// video template
aa.kinds[1063] =dat=>
{
  let note = aa.mk.note(dat);
  aa.p.from_tags(dat.event.tags);
  aa.e.append_as_root(note);
  return note
};


// repost of generic note
aa.kinds[16] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny'); // 'is_new',
  aa.e.append_check(dat,note,aa.get.tag_reply(dat.event.tags));
  aa.p.from_tags(dat.event.tags);
  return note
};


// zap template
aa.kinds[9735] = aa.kinds[1];


// highlight template
aa.kinds[9802] = aa.kinds[1];


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
      let sets = ['k10002','auth'];
      let tags = dat.event.tags.filter(i=>i[0]==='r');
      for (const tag of tags)
      {
        let [type,url,permission] = tag;
        url = aa.is.url(url)?.href;
        if (!url) continue;
        
        let relay = relays[url] = {sets};
        if (permission === 'read') 
          aa.fx.a_add(relay.sets,['read']);
        else if (permission === 'write') 
          aa.fx.a_add(relay.sets,['write']);
        else aa.fx.a_add(relay.sets,['read','write']);
      }
      // let relays = aa.r.from_tags(dat.event.tags,['k10002']);
      aa.p.relays_add(relays,p);
      if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
      aa.p.save(p);
    }
  });
  
  return note
};


// long-form template
aa.kinds[30023] =dat=>
{
  let note = aa.e.note_pre(dat);
  aa.p.from_tags(dat.event.tags);
  return note
};


// event template for relay data from monitor nip66
aa.kinds[30166] =dat=>
{
  const note = aa.e.note_pre(dat);
  note.classList.add('root');
  aa.parse.content_o(aa.parse.j(dat.event.content),note,'text_asc');
  return note
};


// video
aa.kinds[34235] =dat=>
{
  let note = aa.e.note_pre(dat);
  aa.p.from_tags(dat.event.tags);
  return note
};