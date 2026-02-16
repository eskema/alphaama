/*

alphaama
mod    o
options using localStorage key:value

*/


const o =
{
  name:'options',
  about:'manage options',
  def:
  {
    id:'o',
    ls:
    {
      'cash': 'on',
      'ns': '.', // used as the prefix for actions
      'pagination': '100', // number of root events displayed
      'pow': '0', // proof of work difficulty
      'reaction': '\uD83E\uDD18', // '🤘' default reaction emoji
      'theme': 'dark', // 'light'
      'score': '11', // user score needed for loading media
      'ext_image': 'gif heic jpeg jpg png webp',
      'ext_video': 'mp4 webm', // fuck mov
      'ext_audio': '3ga aac aiff flac m4a mp3 ogg wav',
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
  butts:
  {
    mod:[]
  },
  used:true
};

// options actions
o.defaults =
{
  cash:
  {
    options:['on','off'],
    exe:s=>
    {
      // aa.log('reload page for cache options to take effect')
    },
    fx:s=> aa.fx.pick_other(s,o.defaults.cash.options),
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
    fx:s=> aa.fx.pick_other(s,o.defaults.theme.options)
  }
};


// add key as value
o.add =(s='')=>
{
  const as = s.split(',').map(i=>i.trim());
  if (as.length)
  {
    for (const i of as)
    {
      let [key,newValue] = i.split(aa.regex.fw);
      if (key && newValue)
      {
        let oldValue = localStorage[key];
        localStorage[key] = newValue;
        aa.mod.ui(o,key);
        o.on_upd({key,newValue,oldValue})
      }
    }
  }
};


// remove option (if not default)
o.del =(s='')=>
{
  let mod = o;
  const id = mod.def.id;
  const log = localStorage.ns+' '+id+' rm';

  let items = aa.fx.splitr(s,',');
  for (const item of items)
  {
    let keys = aa.fx.splitr(i);

    const key = keys.shift();

    if (!key || !localStorage[key])
    {
      aa.log(`${log} key not found`);
      continue;
    }

    if (Object.hasOwn(mod.def,key))
    {
      aa.log(`${log} key cannot be deleted`);
      continue;
    }

    localStorage.removeItem(key);

    let l_id = id+'_'+key;
    let l = aa.el.get(l_id);
    if (l)
    {
      l.remove();
      aa.el.delete(l_id)
    }
    aa.log(`${log} ${key}`);
  }
};


// on load
o.load =async()=>
{
  const mod = o;
  const id = mod.def.id;
  // ensure default options are set
  for (const k in mod.def.ls)
  {
    if (!localStorage[k]) localStorage[k] = mod.def.ls[k];
  }

  aa.actions.push(
    {
      action:[id,'add'],
      required:['<key>','<value>'],
      description:'add key:value to options',
      exe:mod.add
    },
    {
      action:[id,'reset'],
      optional:['<key>'],
      description:'reset all or just a single option',
      exe:mod.reset
    },
    {
      action:[id,'del'],
      optional:['<key>'],
      description:'delete option',
      exe:mod.del
    },
  );
  mod.o = {id:id,ls:localStorage};

  if (mod.o.ls.team)
  {
    mod.o.ls.theme = mod.o.ls.team;
    o.del('team');
  }

  // expose allowed extensions as getter on aa
  Object.defineProperty(aa,'allowed_extensions',{get:o.allowed_extensions});

  // detect when changes happen on other tabs
  window.onstorage = o.on_storage;
  // load mod
  await aa.mod.load(mod);
  aa.mod.mk(mod);
};


o.on_storage =async ev=>
{
  let con = `options changed in another tab: ${ev.key} ${ev.newValue}`;
  let log = make('p',{con});
  let clk =e=>
  {
    aa.mod.ui(o,ev.key);
    let mom = e.target.parentElement;
    e.target.remove();
    mom.append(aa.mk.butt_action(o.def.id+' add '+ev.key+' '+ev.oldValue,'undo'))
  };
  con = 'apply on this tab';
  let apply_butt = make('button',{cla:'butt plug',con,clk});
  if (ev.oldValue?.length) log.append(' ',apply_butt);
  aa.log(log);
};


o.on_upd =async ev=>
{
  let log = make('p',{con:ev.key+' '+ev.newValue});
  let undo_butt = aa.mk.butt_action(o.def.id+' add '+ev.key+' '+ev.oldValue,'undo');
  if (ev.oldValue?.length) log.append(' ',undo_butt);
  log = aa.log(log);
  return log
};


// makes a mod option item, to use with aa.mod.mk()
o.mk =(k,v)=>
{
  const id = o.def.id;
  const l = make('li',{cla:'item'});
  let s = id+' add '+k+' '+v;
  if (k in o.defaults)
  {
    let dis = o.defaults[k];
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
  aa.el.set(id+'_'+k,l);
  return l
};


// reset one, multiple or all values
o.reset =(s='')=>
{
  if (s)
  {
    for (const i of s.split(','))
    {
      let a = i.trim().split(' ');
      const v = a[0];
      if (o.def.ls[v])
      {
        localStorage[v] = o.def.ls[v];
        aa.mod.ui(o,k);
      }
      else localStorage.removeItem(v);
    }
  }
  else if (window.confirm('reset all options?'))
  {
    localStorage.clear();
    for (const k in o.def.ls) localStorage[k] = o.def.ls[k];
    aa.mod.ui(o);
  }
};


// save and update ui
o.save =()=>
{
  o.o = {id:'o',ls:localStorage};
  aa.mod.mk(o);
};


// allowed media extensions from options
o.allowed_extensions =()=>
{
  return {
    image: localStorage.ext_image.split(' '),
    video: localStorage.ext_video.split(' '),
    audio: localStorage.ext_audio.split(' '),
  }
};


export default o;
