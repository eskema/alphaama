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
      'pow':'0', // proof of work difficulty
      'reaction':'\uD83E\uDD18', // '🤘' default reaction emoji
      'theme':'dark', // 'light'
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


// add key as value
aa.o.add =s=>
{
  const work =a=>
  {
    let [k,v] = a;
    if (k && v)
    {
      let old_v = localStorage[k];
      localStorage[k] = v;
      aa.mod_ui(aa.o,k);
      let log = aa.mk.l('p',{con:aa.o.def.id+' add '+k+' '+v});
      let undo = aa.mk.butt_action(aa.o.def.id+' add '+k+' '+old_v,'undo');
      log.append(' ',undo);
      aa.log(log);
    }
  };
  aa.fx.loop(work,s);
};


// remove option (if not default)
aa.o.del =s=>
{
  const work =a=>
  {
    const id = aa.o.def.id;
    const dis = localStorage.ns+' '+id+' rm ';
    const k = a.shift().trim();
    if (k && localStorage[k])
    {
      if (!aa.o.def.hasOwnProperty(k))
      {
        localStorage.removeItem(k);
        let l = document.getElementById(id+'_'+k)
        if (l) l.remove();
        aa.log(dis+k);
      }
      else aa.log(dis+'key cannot be deleted');
    }
    else aa.log(dis+'key not found');
  };
  aa.fx.loop(work,s)
};


// on load
aa.o.load =()=>
{
  const mod = aa.o;
  const id = mod.def.id;
  // ensure default options are set
  for (const k in mod.def.ls)
  {
    if (!localStorage[k]) localStorage[k] = mod.def.ls[k];
  }

  aa.actions.push(
    {
      action:[id,'add'],
      required:['key','value'],
      description:'add key:value to options',
      exe:mod.add
    },
    {
      action:[id,'reset'],
      optional:['key'], 
      description:'reset all or just a single option',
      exe:mod.reset
    },
    {
      action:[id,'del'],
      optional:['key'], 
      description:'delete option',
      exe:mod.del
    }
  );
  mod.o = {id:id,ls:localStorage};

  if (mod.o.ls.team) 
  {
    mod.o.ls.theme = mod.o.ls.team;
    aa.o.del('team');
  }

  aa.mod_load(mod).then(aa.mk.mod).then(e=>
  {
    let add_butt = aa.mk.butt_action(`${id} set `,'+','set');
    mod.l.insertBefore(add_butt,document.getElementById(id));
  });
  // detect when changes happen on other tabs 
  window.addEventListener('storage',e=> { console.log('storage',e); });
};


// makes a mod option item, to use with aa.mk.mod()
aa.o.mk =(k,v)=>
{
  const id = aa.o.def.id;
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  // update 
  switch (k)
  {
    case 'theme':
      if (aa.l.dataset.theme !== v) aa.l.dataset.theme = v; 
      s = id+' add '+k+' '+aa.fx.theme(v);
      break;
    default:
      s = id+' add '+k+' '+v;
  }
  l.append(aa.mk.item_action(k,v,s))
  return l
};


// reset one, multiple or all values
aa.o.reset =s=>
{
  s.trim();
  if (s)
  {
    aa.fx.loop(a=>
    {
      const v = a[0];
      if (aa.o.def.ls[v])
      {
        localStorage[v] = aa.o.def.ls[v];
        aa.mod_ui(aa.o,k);
      }
    },s);
    aa.log(aa.mk.butt_action(aa.o.def.id+' reset '+s));
  } 
  else if (window.confirm('reset all options?')) 
  {
    localStorage.clear();
    for (const k in aa.o.def.ls) localStorage[k] = aa.o.def.ls[k];
  }
};


// saves
aa.o.save =()=>
{
  aa.o.o = {id:'o',ls:localStorage};
  aa.mk.mod(aa.o); 
};


// given a theme, returns the other one for quick input
aa.fx.theme =s=>
{
  if (s === 'dark') return 'light';
  else return 'dark'
};


// returns wether or not a given level is trusted
aa.is.trusted =trust=>
{
  let trust_needed;
  try { trust_needed = parseInt(localStorage.trust) } 
  catch (er) { console.error('!trust',localStorage.trust) }
  if (Number.isInteger(trust_needed) && trust >= trust_needed) return true;
  return false
};


window.addEventListener('load',aa.o.load);