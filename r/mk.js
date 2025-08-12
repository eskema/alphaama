// make relay list
aa.mk.k10002 =(string='')=>
{
  let relays = string 
  ? aa.fx.splitr(string,',')
  : Object.keys(aa.r.o.ls);
  
  let tags = relays.map(url=>
  {
    const tag = ['r',url];
    
    let read = aa.r.o.ls[url].sets.includes('read');
    let write = aa.r.o.ls[url].sets.includes('write');
    
    if (read || write)
    {
      if (read && !write) tag.push('read');
      if (!read && write) tag.push('write');
      return tag
    }
    return
  })
  // for (const url of relays)
  // { 
  //   let read, write;
  //   const tag = [url];
  //   if (ls[url].sets.includes('read')) read = true;
  //   if (ls[url].sets.includes('write')) write = true;
  //   if (read || write)
  //   {
  //     if (read && !write) tag.push('read');
  //     if (!read && write) tag.push('write');
  //     relay_list.push(tag.join(' ').trim())
  //   }
  // }

  // const relays = [];

  if (tags.length)
  {
    const event = aa.e.normalise({kind:10002,tags});
    aa.mk.confirm(
    {
      title:'new relay list',
      l:aa.mk.tag_list(relays),
      no:{exe:()=>{}},
      yes:{exe:()=>{ aa.e.finalize(event) }}
    });
  }
};

aa.actions.push(
  {
    action:['mk','10002'],
    required:['<url>'],
    optional:['<url>'],
    description:'create a relay list (kind-10002)',
    exe:aa.mk.k10002
  },
);