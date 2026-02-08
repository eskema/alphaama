// make relay list
aa.mk.k10002 =(string='')=>
{
  let relays = string 
  ? aa.fx.splitr(string,',')
  : Object.keys(aa.r.o.ls);
  
  let tags = relays.map(i=>
  {
    let url = aa.fx.url(i)?.href;
    if (!url)
    {
      aa.log(`invalid url in relay list: ${i}`);
      return
    }
    if (!aa.r.o.ls[url]) aa.r.add(`${url} read write`);

    const tag = ['r',url];
    
    let read = aa.r.o.ls[url].sets.includes('read');
    let write = aa.r.o.ls[url].sets.includes('write');
    
    if (read || write)
    {
      if (read && !write) tag.push('read');
      if (!read && write) tag.push('write');
      return tag
    }
    return tag
  })

  if (tags.length)
  {
    const event = aa.fx.normalise_event({kind:10002,tags});
    aa.mk.confirm(
    {
      title:'new relay list',
      l:aa.mk.tag_list(tags),
      no:{exe:()=>{}},
      yes:{exe:()=>{ aa.bus.emit('e:finalize', event) }}
    });
  }
};

aa.actions.push(
  {
    action:['mk','10002'],
    required:['<url,url>'],
    description:'create a relay list (kind-10002), permissions come from global settings for that relay',
    exe:aa.mk.k10002
  },
);