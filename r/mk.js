// make relay list
aa.mk.k10002 =(s='')=>
{
  let log = aa.r.def.id+' ls: ';
  const err = (er)=>{aa.log(log+er)};

  let ls = aa.r.o.ls;
  let relay_list = [];
  let a = s ? s.split(',') : Object.keys(ls);
  
  for (const k of a)
  { 
    let read, write;
    const tag = [k];
    if (ls[k].sets.includes('read')) read = true;
    if (ls[k].sets.includes('write')) write = true;
    if (read || write)
    {
      if (read && !write) tag.push('read');
      if (!read && write) tag.push('write');
      relay_list.push(tag.join(' '))
    }
  }

  const relays = [];
  for (const r of relay_list) 
  {
    let relay = r.trim().split(' ');
    relay.unshift('r');
    relays.push(relay);
  }
  if (relays.length)
  {
    aa.dialog(
    {
      title:'new relay list',
      l:aa.mk.tag_list(relays),
      no:{exe:()=>{}},
      yes:{exe:()=>
      {
        const event = aa.e.normalise({kind:10002,tags:relays});
        aa.e.finalize(event);
      }}
    });
  }
};

aa.actions.push(
  {
    action:['mk','10002'],
    optional:['<url set1 set2>,<url>'],
    description:'create a relay list (kind-10002)',
    exe:aa.mk.k10002
  },
);