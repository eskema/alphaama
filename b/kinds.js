// blossom server list
aa.e.kinds[10063] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');

  aa.p.get(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p, dat.event))
    {
      let servers = [];
      let tags = dat.event.tags.filter(i=> i[0] === 'server');
      for (const tag of tags)
      {
        let url = aa.fx.url(tag[1])?.href;
        if (!url) continue;
        servers.push(url);
      }
      p.blossom = servers;

      if (aa.u.is_u(dat.event.pubkey) && aa.b?.o)
      {
        let changed;
        for (const url of servers)
        {
          if (!aa.b.o.ls[url])
          {
            aa.b.o.ls[url] = {url};
            changed = true;
          }
        }
        if (!aa.b.o.def && servers.length)
        {
          aa.b.o.def = servers[0];
          changed = true;
        }
        if (changed) aa.mod.save(aa.b);
      }
      aa.p.save(p);
    }
  });

  return note
};
