/*

alphaama
mod    o
options using localStorage key:value

*/


aa.o =
{
  def:
  {
    id:'o',
    ls:
    {
      'ns':'.aa', // used as the prefix for actions
      'pagination': '100', // number of root events displayed
      'reaction':'\uD83E\uDD18', // '🤘' default reaction emoji
      'team':'dark', // 'light'
      'trust':'11', // user score needed for loading media
      
    },
// todo
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
};


// on load
aa.o.load =()=>
{
  // ensure default options are set
  for (const k in aa.o.def.ls)
  {
    if (!localStorage[k]) localStorage[k] = aa.o.def.ls[k];
  }

  aa.actions.push(
    {
      action:[aa.o.def.id,'set'],
      required:['key','value'],
      description:'set option value',
      exe:aa.o.set
    },
    {
      action:[aa.o.def.id,'reset'],
      optional:['key'], 
      description:'reset all or just a single option',
      exe:aa.o.reset
    },
    {
      action:[aa.o.def.id,'rm'],
      optional:['key'], 
      description:'remove option',
      exe:aa.o.rm
    }
  );
  aa.o.o = {id:aa.o.def.id,ls:localStorage};
  aa.mod_load(aa.o).then(aa.mk.mod);
  window.addEventListener('storage',e=> { console.log('storage',e); });
};


// makes a mod option item, to use with aa.mk.mod()
aa.o.mk =(k,v)=>
{
  // update 
  switch (k)
  {
    case 'team': if (aa.l.dataset.team !== v) aa.l.dataset.team = v; break;
    // case 'pagination': 
    //   let style = aa.mk.l('style',
    //   {con:'.note:not(:nth-child(-n+'+k+')):not(.in_path){display:none;'});
    //   document.head.append(style);
    //   aa.l.dataset.pagination = localStorage.pagination;
    //   break;
  }
  const id = aa.o.def.id;
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  l.append(
    aa.mk.butt_action(id+' set '+k+' '+v,k,'key'),
    ' ',
    aa.mk.l('span',{cla:'val',con:v})
  );
  return l
};


// reset one, multiple or all values
aa.o.reset =s=>
{
  aa.cli.clear();
  s.trim();
  if (s)
  {
    const work =a=>
    {
      const v = a[0];
      if (aa.o.def.ls[v])
      {
        localStorage[v] = aa.o.def.ls[v];
        aa.mod_ui(aa.o,k,v);
      }
    }
    aa.fx.loop(work,s);
    aa.log(aa.mk.butt_action(aa.o.def.id+' reset '+s));
  } 
  else if (window.confirm('reset all options?')) 
  {
    localStorage.clear();
    for (const k in aa.o.def.ls) localStorage[k] = aa.o.def.ls[k];
  }
};


// remove option (if not default)
aa.o.rm =s=>
{
  aa.cli.clear();
  const work =a=>
  {
    const dis = localStorage.ns+' '+aa.o.def.id+' rm ';
    const k = a.shift().trim();
    if (k && localStorage[k])
    {
      if (!aa.o.def.hasOwnProperty(k))
      {
        localStorage.removeItem(k);
        document.getElementById(aa.o.def.id+'_'+k).remove();
        aa.log(dis+k);
      }
      else aa.log(dis+'key cannot be removed');
    }
    else aa.log(dis+'key not found');
  };
  aa.fx.loop(work,s)
};


// saves
aa.o.save =()=>
{
  aa.o.o = {id:'o',ls:localStorage};
  aa.mk.mod(aa.o); 
};


// set key as value
aa.o.set =s=>
{
  // aa.cli.fuck_off();
  aa.cli.clear();
  const work =a=>
  {
    let [k,v] = a;
    if (k && v)
    {
      let old_v = localStorage[k];
      localStorage[k] = v;
      aa.mod_ui(aa.o,k,v);
      let log = aa.mk.l('p',{con:aa.o.def.id+' set '+k+' '+v});
      let undo = aa.mk.butt_action(aa.o.def.id+' set '+k+' '+old_v,'undo');
      log.append(' ',undo);
      aa.log(log);
    }
  };
  aa.fx.loop(work,s)
};


window.addEventListener('load',aa.o.load);