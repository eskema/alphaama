/*

alphaama
A<3   aa

*/


// a version to change
const aa_version = 67;
// a
const aa = 
{
  name:'alphaama',
  aka:'A<3',
  desc:'just .aa nostr fucking client',
  actions:[],
  db:{worker:{}},
  clears:[],
  clk:{},
  def:
  {
    id:'aa',
    dependencies:
    [
      // '/dep/deps.js', // bundled dependencies 
      // '/dep/asciidoctor.min.js?v=3.0.4',
      '/dep/bolt11.js',
      '/dep/cashuts.js?v=2.0.0',

      '/dep/fastdom.js?v=1.0.4',
      // '/dep/fastdom-strict.js?v=1.0.4',
      // '/dep/math.js?v=14.0.1',
      '/dep/nostr-tools.js?v=2.15.0',
      '/dep/qrcode.js',
      // '/dep/webtorrent.min.js',
      // '/dep/hls.js?v=1',
      // '/dep/blurhash.js?v=10000',
    ],
    extensions:
    {
      img:['gif','heic','jpeg','jpg','png','webp'],
      video:['mp4','webm'],
      audio:['3ga','aac','aiff','flac','m4a','mp3','ogg','wav']
    },
    mods:
    [
      {id:'cli',src:'/cli/cli.js?v='+aa_version,requires:[]},
      {id:'o',src:'/o/o.js?v='+aa_version,requires:['cli']},
      {id:'p',src:'/p/p.js?v='+aa_version,requires:['o']},
      {id:'e',src:'/e/e.js?v='+aa_version,requires:['p']},
      {id:'r',src:'/r/r.js?v='+aa_version,requires:['e']},
      {id:'q',src:'/q/q.js?v='+aa_version,requires:['r']},
      {id:'i',src:'/i/i.js?v='+aa_version,requires:['e']},
      {id:'u',src:'/u/u.js?v='+aa_version,requires:['r']},
      {id:'w',src:'/w/w.js?v='+aa_version,requires:['q']},
    ],
    tools:
    [
      '/aa/mod.js?v='+aa_version,
      '/aa/view.js?v='+aa_version,
      '/db/db.js?v='+aa_version,
      '/aa/clk.js?v='+aa_version,
      '/aa/is.js?v='+aa_version,
      '/aa/fx.js?v='+aa_version,
      '/aa/log.js?v='+aa_version,
      '/aa/mk.js?v='+aa_version,
      '/aa/parse.js?v='+aa_version,
      '/aa/wl.js?v='+aa_version,
      '/av/av.js?v='+aa_version,
    ],
    styles:['/aa/aa.css?v='+aa_version],
  },
  el:new Map(),
  fx:{},
  get:{},
  is:{},
  kinds:{},
  miss:{e:{},p:{},a:{}},
  mk:{},
  nfc(){alert('yo')},
  get now(){ return Math.floor(Date.now()/1000) },
  parse:{},
  state:{},
  temp:{},
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
      aa.lazy_god.unobserve(l);
      fastdom.mutate(()=>
      {
        if (l.dataset.src) l.src = l.dataset.src;
        l.classList.add('quick_fox');
        l.classList.remove('lazy_dog');
      });
    }
  }
},{root:null,threshold:.1});


// if no options found, load with defaults
aa.load =async(o={})=>
{
  // setup document
  aa.l = document.documentElement;
  aa.bod = document.body;
  aa.mk.styles(o.styles || aa.def.styles);
  aa.framed = window.self !== window.top;
  if (aa.framed) aa.l.classList.add('framed');
  let dependencies = o.dependencies || aa.def.dependencies;
  let tools = o.tools || aa.def.tools;
  let mods = o.mods || aa.def.mods;
  
  await aa.mk.scripts([...dependencies,...tools]);
  
  aa.mk.manifest();
  aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});
  aa.view.l = aa.mk.l('main',{id:'view'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  
  aa.mods_load(mods);

  aa.actions.push(
    {
      action:['help','aa'],
      description:'alphaama help',
      exe:()=>{aa.mk.help()}
    },
    {
      action:['help','db'],
      description:'database help',
      exe:()=>{aa.mk.help('db')}
    },
    {
      action:['db','help'],
      description:'database help',
      exe:()=>{aa.mk.help('db')}
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
  dialog = aa.mk.l(id,{id});
  dialog.addEventListener('close',e=>
  {
    dialog.removeAttribute('title');
    const mod_l = dialog.querySelector('.mod');
    if (mod_l)
    {
      if (mod_l.dataset.was==='closed') mod_l.toggleAttribute('open',false);
      aa.mod.append(mod_l);
    }
    
    dialog.textContent = '';
  });
  aa.el.set('dialog',dialog);

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
  aa.temp.mods_after_load = [];
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
  while (aa.temp.mods_after_load.length)
  {
    let dis = aa.temp.mods_after_load.shift();
    setTimeout(dis,0)
  }
  delete aa.temp.mods_after_load;
};


// fetch file from path, append text to object and return text
aa.readme_setup =async(path,o={})=>
{
  if (!Object.hasOwn(o,'readme'))
  {
    let response;
    try 
    { 
      response = await fetch(path) 
    }
    catch {}
    if (!response) return;

    let text = await response.text();
    if (text) o.readme = text;
  }
  return o.readme
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
aa.mk.page =(o={})=>
{
  let df = new DocumentFragment();
  df.append(aa.mk.header(),aa.view.l,aa.cli.l,aa.el.get('dialog'));
  aa.bod.prepend(df);

  let onoff = navigator.onLine?'on':'off';
  let con = `${onoff}line at ${location.origin} since `;
  let app = aa.mk.time(aa.now);
  aa.log(aa.mk.l('p',{con,app}),0,0);
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