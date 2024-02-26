const o_p =
{
  def:
  {
    'ns':'.aa', // used as the prefix for actions
    'reaction':'\uD83E\uDD18', // '🤘' default reaction emoji
    'team':'dark', // 'light'
    'trust':'11', // user score needed for loading media

    //     'nav_keys':
//     {
//       'parent':'j',
//       'next':'k',
//       'child':'l',
//       'previous':'i',
//       'top':'h',
//       'bottom':'b',
//       'fetch':'f',
//       'replies':'\\',
//       'exit':'Escape'
//     }
  },
  sn:'o',
};

aa.actions.push(
  {
    action:[o_p.sn,'set'],
    required:['key','value'],
    description:'set option value',
    exe:o_p.set
  },
  {
    action:[o_p.sn,'reset'],
    optional:['key'], 
    description:'reset all or just a single option',
    exe:o_p.reset
  },
  {
    action:[o_p.sn,'rm'],
    optional:['key'], 
    description:'remove option',
    exe:o_p.rm
  }
);

o_p.load =(reset=false)=>
{
  for (const k in o_p.def)
  {
    if (reset||!localStorage[k]) localStorage[k] = o_p.def[k];
  }
  o_p.save();
};

// window.addEventListener('storage',()=>
// {
//   console.log('storage');
//   it.to(()=>{o_p.load()},200,'storage');
// });

o_p.save =()=>
{
  o_p.o = {id:'o_p',ls:localStorage};
  it.mk.mod(o_p);
};

o_p.set =s=>
{
  let [k,v] = s.trim().split(' ');
  if (k && v)
  {
    localStorage[k] = v;
    o_p.save();
    v_u.log(localStorage.ns+' o set '+k+' to '+v);
    cli.fuck_off();
  }
};

o_p.reset =s=>
{
  s.trim();
  if (s && o_p.def[s]) localStorage[s] = o_p.def[s];
  else if (window.confirm('reset all options?')) o_p.load(true);
};

o_p.rm =s=>
{
  const dis = localStorage.ns+' op rm: ';
  let k = s.trim();
  if (k && localStorage[k])
  {
    if (!o_p.def.hasOwnProperty(k))
    {
      localStorage.removeItem(k);
      o_p.load();
      v_u.log(dis+k);
    }
    else v_u.log(dis+'key cannot be removed');
  }
  else v_u.log(dis+'key not found');
};

o_p.mk =(k,v) =>
{
  switch (k)
  {
    case 'team':
      aa.l.dataset.theme = v;
      break;
  }
  let sn = o_p.sn;
  const l = it.mk.l('li',{id:'o_'+k,cla:'item o'});
  l.append(
    it.mk.l('button',{cla:'key',con:k,clk:e=>
    {
      cli.t.value = localStorage.ns+' '+sn+' set '+k+' '+v;
      cli.foc();
    }}),
    it.mk.l('span',{cla:'val',con:v})
  );
  return l
};
