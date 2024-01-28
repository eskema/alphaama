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
  }
};

o_p.load =(reset=false)=>
{
  for (const k in o_p.def)
  {
    if (reset||!localStorage[k]) localStorage[k] = o_p.def[k];
  }

  let l = it.mk.ls({id:'o_p',ls:localStorage,mk:o_p.mk});
  if (document.getElementById(l.id)) document.getElementById(l.id).replaceWith(l);
  else document.getElementById('u').append(it.mk.details('o_p',l,1));
  
  v_u.log('o_p '+localStorage.length);
};

o_p.set =s=>
{
  let [k,v] = s.trim().split(' ');
  if (k && v)
  {
    localStorage[k] = v;
    o_p.load();
    v_u.log(localStorage.ns+' op set '+k+' to '+v);
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
  const dis = '.aa op rm: ';
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

o_p.mk =(k,v)=>
{
  switch (k)
  {
    case 'team':
      aa.l.dataset.theme = v;
      break;
  }
  let l = it.mk.item(k,v);
  return l
};

aa.ct.op =
{
  'set':
  {
    required:['key','value'],
    description:'set option value',
    exe:o_p.set
  },
  'reset':
  {
    optional:['key'], 
    description:'reset all or just a single option',
    exe:o_p.reset
  },
  'rm':
  {
    optional:['key'], 
    description:'remove option',
    exe:o_p.rm
  }
};