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
      'cash':'off',
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

// given a theme, returns the other one for quick input
aa.o.defaults =
{
  cash:
  {
    options:['on','off'],
    exe:s=>
    {
      // aa.log('reload page for cache options to take effect')
    },
    fx:s=> aa.fx.pick_other(s,aa.o.defaults.cash.options),
    pre:s=>
    {
      if (s === 'on') return window.confirm('turn cache on?');
      else return true
    }
  },
  theme:
  {
    options:['dark','light'],
    exe:s=>
    {
      if (aa.l.dataset.theme !== s) aa.l.dataset.theme = s;
    },
    fx:s=> aa.fx.pick_other(s,aa.o.defaults.theme.options)
  }
};


// add key as value
aa.o.add =(s='')=>
{
  const as = s.split(',');
  if (as.length)
  {
    for (const i of as)
    {
      let [key,newValue] = i.split(aa.fx.regex.fw);
      if (key && newValue)
      {
        let oldValue = localStorage[key];
        localStorage[key] = newValue;
        aa.mod.ui(aa.o,key);
        aa.o.on_storage({key,newValue,oldValue})
      }
    }
  }
};


// remove option (if not default)
aa.o.del =(s='')=>
{
  for (const i of s.split(',')) 
  {
    let a = i.trim().split(' ');
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
  }
};


// on load
aa.o.load =async()=>
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

  aa.mod.load(mod).then(aa.mod.mk).then(e=>
  {
    let add_butt = aa.mk.butt_action(`${id} add `,'add');
    fastdom.mutate(()=>
    {
      // mod.l.append(add_butt)
      mod.l.insertBefore(add_butt,mod.l.firstChild.nextSibling);
    })
  });
  // detect when changes happen on other tabs
  window.onstorage = aa.o.on_storage;
  // window.addEventListener('storage',e=> 
  // { 
  //   aa.log('o changed '+e.data); 
  // });
};


aa.o.on_storage =async o=>
{
  let log = aa.mk.l('p',{con:o.key+' '+o.newValue});
  if (o.oldValue?.length) log.append(' ',aa.mk.butt_action(aa.o.def.id+' add '+o.key+' '+o.oldValue,'undo'));
  aa.log(log);
};


// makes a mod option item, to use with aa.mod.mk()
aa.o.mk =(k,v)=>
{
  const id = aa.o.def.id;
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  let s = id+' add '+k+' '+v;
  if (k in aa.o.defaults)
  {
    let dis = aa.o.defaults[k];
    if ('options' in dis) 
    {
      l.dataset.after = dis.options.join()
      if (!dis.options.includes(v)) 
        v = dis.options[0];
    }
    if ('exe' in dis) dis.exe(v);
    if ('fx' in dis) s = id+' add '+k+' '+dis.fx(v);
  }
  l.append(aa.mk.item_action(k,v,s))
  return l
};


// reset one, multiple or all values
aa.o.reset =(s='')=>
{
  if (s)
  {
    // const as = s.split(',');
    // if (as.length)
    // {
      for (const i of s.split(',')) 
      {
        let a = i.trim().split(' ');
        const v = a[0];
        if (aa.o.def.ls[v])
        {
          localStorage[v] = aa.o.def.ls[v];
          aa.mod.ui(aa.o,k);
        }
        else localStorage.removeItem(v);
      }
    // }
    // aa.log(aa.mk.butt_action(aa.o.def.id+' reset '+s));
  }
  else if (window.confirm('reset all options?')) 
  {
    localStorage.clear();
    for (const k in aa.o.def.ls) localStorage[k] = aa.o.def.ls[k];
    aa.mod.ui(aa.o);
  }
};


// save and update ui
aa.o.save =()=>
{
  aa.o.o = {id:'o',ls:localStorage};
  aa.mod.mk(aa.o); 
};


aa.fx.pick_other =(s,a)=>
{
  return a.find(i=>i!==s)
};