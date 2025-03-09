/*

alphaama
A<3   aa   
v3

*/


const aa_version = 50;

const aa = 
{
  actions:[],
  db:{worker:{}},
  clears:[],
  clk:{},
  dependencies:
  [
    '/dep/asciidoctor.min.js?v=3.0.4',
    '/dep/bolt11.js',
    '/dep/cashuts.js?v=2.0.0',
    '/dep/fastdom.js?v=1.0.4',
    // '/dep/fastdom-strict.js?v=1.0.4',
    '/dep/math.js?v=14.0.1',
    '/dep/nostr-tools.js?v=2.10.4',
    '/dep/qrcode.js',
    // '/dep/webtorrent.min.js',
    // '/dep/hls.js?v=1',
    // '/dep/blurhash.js?v=10000',
  ],
  extensions:
  {
    img:['jpg','jpeg','gif','webp','png','heic'],
    av:['mp3','mp4','webm','m4a'],
  },
  fx:{},
  get:{},
  in_path:[],
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
    '/aa/clk.js?v='+aa_version,
    '/aa/is.js?v='+aa_version,
    '/aa/fx.js?v='+aa_version,
    '/aa/log.js?v='+aa_version,
    '/aa/mk.js?v='+aa_version,
    '/aa/mod.js?v='+aa_version,
    '/aa/parse.js?v='+aa_version,
    '/aa/wl.js?v='+aa_version,
    '/av/av.js?v='+aa_version,
    '/db/db.js?v='+aa_version,
  ],
  viewing:false,
  view:false,
  views:[],
};


// clear view
aa.clear =()=>
{
  if (aa.viewing)
  {
    const in_view = aa.in_view;
    if (in_view) 
    {
      in_view.classList.remove('in_view');
      if (in_view.classList.contains('note'))
      {
        if (aa.in_path?.length) for (const l of aa.in_path) aa.fx.path_rm(l);
      }
      delete aa.in_view;
    }
  }
  aa.viewing = false;
  if (aa.state.l) aa.state.l.textContent = '';
  aa.l.classList.remove('viewing','view_e','view_p') 
  for (const c of aa.clears) c();
};


// make element with options
aa.mk.l =(tag_name='div',o={})=>
{
  const l = document.createElement(tag_name);
  for (const k in o)
  {
    const v = o[k];
    switch (k)
    {
      case 'aft': l.dataset.after = v; break;
      case 'app': l.append(v); break;
      case 'bef': l.dataset.before = v; break;
      case 'cla': l.className = v; break;
      case 'clk': l.addEventListener('click',v); break;
      case 'con': l.textContent = v; break;
      case  'id': l.id = v; break;
      case 'lab': l.dataset.label = v; break;
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
    }
  }
  return l
};


// if no options found, load with defaults
aa.load =async(o={})=>
{
  // setup document
  aa.l = document.documentElement;
  aa.mk.manifest();

  let styles = o.styles || aa.styles;
  aa.mk.styles(styles);
  let dependencies = o.dependencies || aa.dependencies;
  let tools = o.tools || aa.tools;
  let mods = o.mods || aa.mods;
  
  await aa.mk.scripts([...dependencies,...tools]);
  
  aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});
  aa.view = aa.mk.l('main',{id:'view'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  aa.mods_load(mods);

  // media observer for lazy cache fetching
  aa.lazy_dog = new IntersectionObserver(a=>
  {
    for (const b of a)
    {
      if (b.isIntersecting) 
      {
        let l = b.target;
        fastdom.mutate(()=>
        {
          if (l.dataset.src) l.src = l.dataset.src;
          l.classList.add('quick_fox')
        });
        aa.lazy_dog.unobserve(l);
      }
    }
  },{root:null,threshold:.1});

  aa.actions.push(
    {
      action:['zzz'],
      description:'resets everything',
      exe:aa.reset
    },
    {
      action:['fx','math'],
      description:'do math with strings',
      exe:(s='')=> math.evaluate(s)
    },
  );

  fetch('/stuff/nostr_kinds.json')
  .then(dis=>dis.json()).then(kinds=> aa.k = kinds);
  return true
};


// log stuff
aa.log =(con='',l=false,is_new=true)=>
{
  if (!l) l = aa.logs;

  let cla = 'l item'+(is_new?' is_new':'');
  let clk = aa.logs_read;
  const log = aa.mk.l('li',{cla,clk});
  if (typeof con === 'string') s = aa.mk.l('p',{con});
  log.append(con);
  
  if (l) fastdom.mutate(()=>{l.append(log)});
  else console.log('log:',con);
  return log
};


// get meta data from manifest
aa.mk.manifest =()=>
{
  document.head.append(aa.mk.l('link',{rel:'manifest',ref:'/site.webmanifest'}));
  fetch('/site.webmanifest').then(dis=>dis.json())
  .then(manifest=>
  {
    for (const icon of manifest.icons)
    {
      let link = aa.mk.l('link');
      if (icon.src.includes('apple-touch-icon'))
      {
        link.rel = 'apple-touch-icon';
        link.sizes = icon.sizes;
      }
      else if (icon.src.includes('safari-pinned-tab'))
      {
        link.rel = 'mask-icon';
        link.color = manifest.theme_color
      }
      else
      {
        link.rel = 'icon';
        if ('sizes' in icon) link.sizes = icon.sizes;
        if ('type' in icon) link.type = icon.type;
      }
      link.href = icon.src;
      document.head.append(link);
    }
  });
};


// append mod scripts when required mods have been loaded
aa.mods_load =a=>
{
  for (const o of a)
  {
    if (aa.is.mods_loaded(o.requires))
    {
      let l = aa.mk.l('script',{src:o.src});
      l.addEventListener('load',e=>
      {
        if (aa.hasOwnProperty(o.id) && aa[o.id].hasOwnProperty('load'))
          aa[o.id].load().then(()=>{aa[o.id].loaded = true})
      });
      document.head.append(l);
    }
    else
    {
      if (!o.attempts) o.attempts = 1;
      else o.attempts++;
      if (o.attempts < 420) setTimeout(()=>{aa.mods_load([o])},o.attempts);
      else aa.log('could not load mod '+o.id)
    }
  }
};


// checks if required mods have loaded
aa.is.mods_loaded =required=>
{
  for (const id of required) 
    if (!aa.hasOwnProperty(id) || !aa[id].loaded) return false
  return true
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


// if no options found, run with defaults
aa.run =(o={})=>
{
  fastdom.mutate(()=>
  {
    document.body.prepend(aa.mk.header(),aa.view);
    let u_u = aa.mk.l('aside',{id:'u_u',app:aa.mk.butt_expand('u_u','a_a')});
    u_u.append(aa.mod_l);
    document.body.insertBefore(u_u,document.body.lastChild.previousSibling);
    if (aa.is.iframe()) aa.l.classList.add('rigged');
  });

  aa.log((navigator.onLine ? 'on' : 'off') + 'line at '+location.origin);
  aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  setTimeout(aa.state.pop,100);
  setTimeout(aa.logs_read,420);

  aa.dialog = aa.mk.l('dialog',{id:'dialog'});
  document.body.insertBefore(aa.dialog,document.body.lastChild.previousSibling);
  aa.dialog.addEventListener('close',e=>
  {
    aa.dialog.removeAttribute('title');
    aa.dialog.textContent = '';
  });
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
        n++; if (n===a.length) resolve(true)
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


// pop state into view
aa.state.pop =()=>
{
  let hash = location.hash;
  let search = location.search;
  if(hash.length) [hash,search] = location.hash.split('?');
  if(!search) search = '';
  let no_state = !history.state || !history.state.hasOwnProperty('view')
  || history.state === '';
  if(no_state) aa.state.view(hash,search);
  else
  {
    aa.clear();
    const state = history.state.view;
    if (state.length) 
    {
      document.title = 'A<3 '+state;
      aa.state.resolve(state,search);  
    }
    else document.title = 'alphaama';
    fastdom.mutate(()=>{if(aa.state.l) aa.state.l.textContent = state;});
  }
};


// replace state
aa.state.replace =s=>
{
  history.state.view = s;
  const hash = s.length ? s : '';
  const path = location.origin+location.pathname+hash;
  history.replaceState(history.state,'',path);
};


// resolve state view
aa.state.resolve =(s,search)=>
{
  if (s.startsWith('#')) s = s.slice(1);
  let has_view = false;
  for (const v in aa.views)
  {
    if (s.startsWith(v)) 
    {
      has_view = true;
      setTimeout(()=>{aa.views[v](s)},200);
      break;
    }
  }
  if (!has_view) aa.log('no view for '+s);
};


// view state or go back if same state
aa.state.view =(s,search='')=>
{
  if (s?.length) s.trim();
  if (search?.length) search = s.length?'?'+search:search;
  let view = s+search;
  let state,last;
  if (!history.state || history.state.view !== view)
  {
    last = history.state?.view ?? '';
    state = {view,last};
    history.pushState(state,'',location.origin+location.pathname+view);
    aa.state.pop();
  }
  else if (history.length) history.back();
};

window.addEventListener('popstate',aa.state.pop);