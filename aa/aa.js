/*

alphaama
A<3   aa

*/


// a version to change
const aa_version = 55;
// a
const aa = 
{
  actions:[],
  db:{worker:{}},
  clears:[],
  clk:{},
  dependencies:
  [
    // '/dep/asciidoctor.min.js?v=3.0.4',
    '/dep/bolt11.js',
    '/dep/cashuts.js?v=2.0.0',
    '/dep/fastdom.js?v=1.0.4',
    // '/dep/fastdom-strict.js?v=1.0.4',
    // '/dep/math.js?v=14.0.1',
    '/dep/nostr-tools.js?v=2.10.4',
    '/dep/qrcode.js',
    // '/dep/webtorrent.min.js',
    // '/dep/hls.js?v=1',
    // '/dep/blurhash.js?v=10000',
  ],
  el:new Map(),
  extensions:
  {
    img:['gif','heic','jpeg','jpg','png','webp'],
    video:['mp4','webm'],
    audio:['3ga','aac','aiff','flac','m4a','mp3','ogg','wav']
  },
  fx:{},
  get:{},
  is:{},
  kinds:{},
  miss:{e:{},p:{},a:{}},
  mk:{},
  mods:
  [
    {id:'cli',src:'/c/c.js?v='+aa_version,requires:[]},
    {id:'o',src:'/o/o.js?v='+aa_version,requires:['cli']},
    {id:'p',src:'/p/p.js?v='+aa_version,requires:['o']},
    {id:'e',src:'/e/e.js?v='+aa_version,requires:['p']},
    {id:'r',src:'/r/r.js?v='+aa_version,requires:['e']},
    {id:'q',src:'/q/q.js?v='+aa_version,requires:['r']},
    {id:'i',src:'/i/i.js?v='+aa_version,requires:['e']},
    {id:'u',src:'/u/u.js?v='+aa_version,requires:['r']},
    {id:'w',src:'/w/w.js?v='+aa_version,requires:['q']},
  ],
  get now(){ return Math.floor(Date.now()/1000) },
  parse:{},
  state:{},
  styles:
  [
    '/aa/aa.css?v='+aa_version,
  ],
  temp:{},
  tools:
  [
    '/aa/view.js?v='+aa_version,
    '/db/db.js?v='+aa_version,
    '/aa/clk.js?v='+aa_version,
    '/aa/is.js?v='+aa_version,
    '/aa/fx.js?v='+aa_version,
    '/aa/log.js?v='+aa_version,
    '/aa/mk.js?v='+aa_version,
    '/aa/mod.js?v='+aa_version,
    '/aa/parse.js?v='+aa_version,
    '/aa/wl.js?v='+aa_version,
    '/av/av.js?v='+aa_version,
    
  ],
  view:
  {
    active:false,
    l:false,
    ls:{},
    in_path:[],
  },
  // dev:true
  get dev(){ return Object.hasOwn(sessionStorage,'dev')}
};


// toggle aa.dev on current tab
aa.dev_set =force=>
{
  if (force !== undefined)
  {
    if (force) sessionStorage.dev = true;
    else sessionStorage.removeItem(dev);
  }
  else
  {
    if (aa.dev) sessionStorage.removeItem(dev);
    else sessionStorage.dev = true
  }
  
  aa.log(`aa.dev = ${aa.dev}`);
};

aa.help =(s="")=>
{
  if (s?.length)
  {
    if (!Object.hasOwn(aa,s))
    {
      aa.log('cannot help :/ '+s)
      return
    }
    aa[s].help()
  }
  else
  {
    aa.log('help yourself')
  }
};


// make element with options
aa.mk.l =(tag_name='div',o={})=>
{
  const l = document.createElement(tag_name);
  for (const k in o)
  {
    const v = o[k];
    if (!v) continue;
    switch (k)
    {
      case 'app':
        if (Array.isArray(v)) l.append(...v);
        else l.append(v); 
        break;
      case 'cla': l.className = v; break;
      case 'clk': l.addEventListener('click',v); break;
      case 'con': l.textContent = v; break;
      case 'dat': for(const i in v) l.dataset[i] = v[i]; break;
      case  'id': l.id = v; break;
      case 'nam': l.name = v; break;
      case 'pla': l.placeholder = v; break;
      case 'ref': l.href = v; break;
      case 'rel': l.rel = v; break;
      case 'siz': l.sizes = v; break;
      case 'src': l.src = v; break;
      case 'tab': l.tabIndex = v; break;
      case 'tit': l.title = v; break;
      case 'typ': l.type = v; break;
      case 'val': l.value = v; break;
      // case 'for': l.setAttribute('for',v); break;
      default: console.log(o)
    }
  }
  return l
};


// media observer for lazy cache fetching
aa.lazy_god = new IntersectionObserver(a=>
{
  for (const b of a)
  {
    if (b.isIntersecting) 
    {
      let l = b.target;
      fastdom.mutate(()=>
      {
        if (l.dataset.src) l.src = l.dataset.src;
        l.classList.add('quick_fox');
        l.classList.remove('lazy_dog');
      });
      aa.lazy_god.unobserve(l);
    }
  }
},{root:null,threshold:.1});


// if no options found, load with defaults
aa.load =async(o={})=>
{
  // setup document
  aa.l = document.documentElement;
  aa.bod = document.body;
  aa.mk.styles(o.styles || aa.styles);
  aa.framed = window.self !== window.top;
  if (aa.framed) aa.l.classList.add('framed');
  let dependencies = o.dependencies || aa.dependencies;
  let tools = o.tools || aa.tools;
  let mods = o.mods || aa.mods;
  
  await aa.mk.scripts([...dependencies,...tools]);
  
  aa.mk.manifest();
  aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});
  aa.view.l = aa.mk.l('main',{id:'view'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  
  aa.mods_load(mods);

  aa.actions.push(
    {
      action:['help'],
      optional:['stuff'],
      description:'logs some help',
      exe:aa.help
    },
    {
      action:['zzz'],
      description:'resets everything',
      exe:aa.reset
    },
    {
      action:['o','dev'],
      description:'toggle dev for this tab',
      exe:aa.dev_set
    },
    // {
    //   action:['fx','math'],
    //   description:'do math with strings',
    //   exe:(s='')=> math.evaluate(s)
    // },
  );

  fetch('/stuff/nostr_kinds.json').then(dis=>dis.json())
  .then(kinds=>aa.k=kinds);

  // aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  
  let id = 'dialog';
  aa.dialog = aa.mk.l(id,{id});
  aa.dialog.addEventListener('close',e=>
  {
    aa.dialog.removeAttribute('title');
    aa.dialog.textContent = '';
  });
  return true
};


// log stuff
aa.log =(con='',l=false,is_new=true)=>
{
  const cla = 'l item'+(is_new?' is_new':'');
  const clk = aa.logs_read;
  const app = typeof con==='string'?aa.mk.l('p',{con}):con;
  const log = aa.mk.l('li',{cla,clk,app});
  
  if (!l) l = aa.logs;
  if (l) fastdom.mutate(()=>{l.append(log)});
  else console.log('log:',con);
  return log
};


// append mod scripts when required mods have been loaded
aa.mods_load =async mods=>
{
  for (const o of mods)
  {
    if (aa.required(o.requires))
    {
      await aa.mk.scripts([o.src]);
      if (Object.hasOwn(aa,o.id) 
      && Object.hasOwn(aa[o.id],'load')) 
        await aa[o.id].load();
      aa[o.id].loaded = true;
    }
  }
};


// tries to delete everything saved locally 
// and then reload clean
aa.reset =async()=>
{
  aa.log('reset initiated');
  await aa.db.ops('cash',{clear:'ALL'});
  aa.log('db cash: clear');
  await aa.db.ops('idb',{clear:{stores:['stuff','authors','events']}});
  aa.log('db idb: clear');
  sessionStorage.clear();
  aa.log('sessionStorage: clear');
  localStorage.clear();
  aa.log('localStorage: clear');
  aa.log('shh... go to sleep now.');
  setTimeout(()=>{location.href = location.origin},1000)
};


// checks if required mods already loaded
aa.required =mods=>
{
  for (const id of mods) 
    if (!Object.hasOwn(aa,id) || !aa[id].loaded) return false
  return true
};


// if no options found, run with defaults
aa.run =(o={})=>
{
  // fastdom.mutate(()=>
  // {
    aa.bod.prepend(aa.mk.header(),aa.view.l);
    aa.bod.insertBefore(aa.dialog,aa.bod.lastChild.previousSibling);
    // aa.bod.insertBefore(aa.side,aa.dialog);
  // });
  let onoff = navigator.onLine?'on':'off';
  let online = `${onoff}line at ${location.origin}`;
  aa.log(online,false,false);
  setTimeout(aa.view.pop,100);
};


// head scripts
aa.mk.scripts =async a=>
{
  return new Promise(resolve=>
  {
    let n = 0;
    for (const src of a) 
    {
      let l = aa.mk.l('script',{src});
      l.addEventListener('load',e=>
      {
        if (n===a.length-1) resolve(true);n++
      });
      document.head.append(l);
    }
  })
};


// head styles
aa.mk.styles =async a=>
{
  let rel = 'stylesheet';
  for (const ref of a) document.head.append(aa.mk.l('link',{rel,ref}));
};