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
    ss: {},
    ls:
    {
      'auto_decrypt': 'off',
      'cash': 'on',
      'ext_image': 'gif heic jpeg jpg png webp',
      'ext_video': 'mp4 webm', // fuck mov
      'ext_audio': '3ga aac aiff flac m4a mp3 ogg wav',
      'm_auto_send': 'off',
      'm_decrypt': 'off',
      'm_get': 'off',
      'ns': '.',
      'on_load_sub': '', // used as the prefix for actions
      'pagination': '100', // number of root events displayed
      'pow': '0', // proof of work difficulty
      'reaction': '\uD83E\uDD18', // '🤘' default reaction emoji
      'score': '11', // user score needed for loading media
      'theme': 'dark', // 'light'
      'wallnut': 'off', // cashu wallet
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
    mod:[[`o ss `,'ss']]
  },
  styles:['/o/o.css'],
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
  auto_decrypt:
  {
    options:['on','on_view','off'],
    fx:s=>aa.fx.cycle(s,o.defaults.auto_decrypt.options)
  },
  m_auto_send:
  {
    options:['on','off'],
    fx:s=> aa.fx.pick_other(s,o.defaults.m_auto_send.options)
  },
  m_decrypt:
  {
    options:['on','off'],
    fx:s=> aa.fx.pick_other(s,o.defaults.m_decrypt.options)
  },
  m_get:
  {
    options:['on','off'],
    fx:s=> aa.fx.pick_other(s,o.defaults.m_get.options)
  },
  theme:
  {
    options:['dark','light'],
    exe:s=>
    {
      if (aa.l.dataset.theme !== s) aa.l.dataset.theme = s;
    },
    fx:s=> aa.fx.pick_other(s,o.defaults.theme.options)
  },
  wallnut:
  {
    options:['on','off'],
    fx:s=> aa.fx.pick_other(s,o.defaults.wallnut.options)
  },
  dev:
  {
    options:['on','off'],
    fx:s=> aa.fx.pick_other(s,o.defaults.dev.options)
  },
};


// add key as value (localStorage)
o.add =(s='')=>
{
  const as = s.split(',').map(i=>i.trim());
  if (as.length)
  {
    for (const i of as)
    {
      let [key,newValue] = i.split(aa.regex.fw);
      if (!key) continue;
      newValue = newValue ?? '';
      // clear any session override for this key
      if (!Object.hasOwn(o.def.ss,key) && Object.hasOwn(o.ss,key))
      {
        delete o.ss[key];
        sessionStorage.removeItem(key);
        o.on_mk();
      }
      let oldValue = localStorage[key];
      localStorage[key] = newValue;
      aa.mod.ui(o,key);
      o.on_upd({key,newValue,oldValue})
    }
  }
};


// set session option — tab-scoped, overrides matching localStorage key via aa.o.o.ls proxy
o.ss_set =(s='')=>
{
  const as = s.split(',').map(i=>i.trim());
  for (const i of as)
  {
    let [key,newValue] = i.split(aa.regex.fw);
    if (!key) continue;
    newValue = newValue ?? '';
    let oldValue = o.ss[key];
    sessionStorage[key] = newValue;
    o.ss[key] = newValue;
    if (Object.hasOwn(o.def.ss,key))
    {
      aa.mod.ui(o,key);
    }
    else
    {
      o.on_mk();
    }
    o.on_upd({key,newValue,oldValue});
  }
};


// remove option (if not default)
o.del =(s='')=>
{
  let mod = o;
  const id = mod.def.id;
  const log = aa.cmd(id+' rm');

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
  // init session options — aa.o.ss mirrors sessionStorage for defined keys
  mod.ss = {};
  for (const k in mod.def.ss)
  {
    if (!sessionStorage[k]) sessionStorage[k] = mod.def.ss[k];
    mod.ss[k] = sessionStorage[k];
  }
  // restore ad-hoc session overrides (ls keys that were overridden via o.ss_set)
  for (const k in mod.def.ls)
  {
    if (k in sessionStorage && !Object.hasOwn(mod.ss,k))
      mod.ss[k] = sessionStorage[k];
  }

  aa.actions.push(
    {
      action:[id,'add'],
      required:['<key>','<value>'],
      description:'add key:value to options',
      exe:mod.add
    },
    {
      action:[id,'ss'],
      required:['<key>','<value>'],
      description:'set session (tab) option, overrides matching localStorage key',
      exe:mod.ss_set
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
  mod.o =
  {
    id,
    ls: new Proxy(localStorage,
    {
      get:(target,k)=> k in o.ss ? o.ss[k] : target[k],
      set:(target,k,v)=>{ target[k]=v; return true }
    })
  };

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


// called by aa.mod.mk after every panel rebuild — rebuilds the session section
// also called directly from o.ss_set for ad-hoc overrides; idempotent
o.on_mk =()=>
{
  // capture old elements before overwriting references
  const old_label = o.ss_label;
  const old_ul = o.ss_ul;
  const old_ls_label = o.ls_label;
  o.ls_label = make('p',{con:'local storage',cla:'mod_ls_label'});
  const new_ls_label = o.ls_label;

  o.ss_li = new Map();
  o.ss_label = make('p',{con:'session (tab)',cla:'mod_ss_label'});
  o.ss_ul = aa.mk.ls({});

  for (const k of Object.keys(o.def.ss).sort(aa.fx.sorts.a))
  {
    let l = o.mk(k);
    o.mod_li.set(k,l);
    o.ss_ul.append(l);
  }
  // ad-hoc session overrides (keys in o.ss but not in def.ss)
  const ad_hoc = Object.keys(o.ss).filter(k=>!Object.hasOwn(o.def.ss,k)).sort(aa.fx.sorts.a);
  for (const k of ad_hoc)
  {
    let l = o.mk(k,undefined,true);
    o.ss_li.set(k,l);
    o.ss_ul.append(l);
  }

  const new_label = o.ss_label;
  const new_ul = o.ss_ul;

  fastdom.mutate(()=>
  {
    old_label?.remove();
    old_ul?.remove();
    old_ls_label?.remove();
    o.mod_ul?.before(new_label, new_ul, new_ls_label);
  });

  // mark overridden LS items — retry each rAF until mod_li has them
  // abort if panel is rebuilt before we finish (new on_mk will take over)
  const mark_ul = o.mod_ul;
  const mark =()=>
  {
    if (o.mod_ul !== mark_ul) return;
    let pending = false;
    for (const k of ad_hoc)
    {
      let ls_item = o.mod_li.get(k);
      if (ls_item) ls_item.dataset.overridden = 'true';
      else pending = true;
    }
    if (pending) requestAnimationFrame(mark);
  };
  requestAnimationFrame(mark);
};


// makes a mod option item, to use with aa.mod.mk()
o.mk =(k,v,session=false)=>
{
  const id = o.def.id;
  const is_session = session || Object.hasOwn(o.def.ss,k);
  if (is_session) v = o.ss[k] ?? o.def.ss[k] ?? '';
  const l = make('li',{cla:'item'});
  if (is_session) l.dataset.session = 'true';
  let cmd = is_session ? id+' ss' : id+' add';
  let s = cmd+' '+k+' '+v;
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
    if ('fx' in dis) s = cmd+' '+k+' '+dis.fx(v);
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
