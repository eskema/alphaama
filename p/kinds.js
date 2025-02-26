// event template for user metadata 
aa.kinds[0] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  let x = dat.event.pubkey;
  aa.db.get_p(x).then(p=>
  {
    if (!p) p = aa.p.p(x);
    if (aa.p.events_newer(p,dat.event))
    {
      if (aa.miss.p[x]) delete aa.miss.p[x];
      let metadata = aa.parse.j(dat.event.content);
      if (metadata)
      {
        p.metadata = metadata;
        aa.p.save(p);
        aa.p.links_upd(p);
        if (aa.is.u(x) && aa.u) aa.u.upd_u_u();
      }
    }
  });
  
  return note
};


// event template for follow list / contacts with legacy relay object
aa.kinds[3] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  aa.db.get_p(dat.event.pubkey).then(p=>
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