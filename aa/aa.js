/*

alphaama
A<3   aa

*/


// a version to change
const aa_version = 73;
// a
const aa = 
{
  name:'alphaama',
  aka:'A<3',
  about:'just .aa nostr fucking client',
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
      // '/dep/fastdom-promised.js?v=1.0.4',
      // '/dep/fastdom-strict.js?v=1.0.4',
      // '/dep/math.js?v=14.0.1',
      '/dep/nostr-tools.js?v=2.15.0',
      '/dep/qrcode.js',
      '/dep/store.js',
      // '/dep/webtorrent.min.js',
      // '/dep/hls.js?v=1',
      // '/dep/blurhash.js?v=10000',
    ],
    extensions:
    {
      img:['gif','heic','jpeg','jpg','png','webp'],
      video:['mp4','webm'], // fuck mov 
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
      // {id:'w',src:'/w/w.js?v='+aa_version,requires:['q']},
    ],
    tools:
    [
      '/aa/mod.js?v='+aa_version,
      '/aa/view.js?v='+aa_version,
      '/db/db.js?v='+aa_version,
      '/aa/clk.js?v='+aa_version,
      '/aa/fx.js?v='+aa_version,
      '/aa/log.js?v='+aa_version,
      '/aa/mk.js?v='+aa_version,
      '/aa/parse.js?v='+aa_version,
      '/aa/wakelock.js?v='+aa_version,
      '/av/av.js?v='+aa_version,
    ],
    styles:
    [
      '/aa/aa.css?v='+aa_version,
      '/aa/list.css?v='+aa_version,
      '/aa/mod.css?v='+aa_version,
      '/aa/log.css?v='+aa_version,
      '/aa/view.css?v='+aa_version,
      '/aa/dialog.css?v='+aa_version,
    ],
  },
  el:new Map(),
  fx:{},
  mk:{},
  get now(){ return Math.floor(Date.now()/1000) },
  parse:{},
  state:{},
  temp:{},
  // dev:true
  get dev(){ return sessionStorage.hasOwnProperty('dev') }
};


// head styles
aa.add_styles =async a=>
{
  let rel = 'stylesheet';
  for (const ref of a) document.head.append(aa.mk.l('link',{rel,ref}));
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
aa.mk.l =(tag_name='div',options={})=>
{
  const element = document.createElement(tag_name);
  for (const key in options)
  {
    const value = options[key];
    if (!value) continue;
    switch (key)
    {
      case 'app':
        if (Array.isArray(value)) 
          element.append(...value);
        else element.append(value); 
        break;
      case 'att': 
        if (Array.isArray(value))
          for (const i of value)
            element.toggleAttribute(i);
        else element.toggleAttribute(value);
        break;
      case 'cla': element.className = value; break;
      case 'clk': element.addEventListener('click',value); break;
      case 'con': element.textContent = value; break;
      case 'dat': 
        for (const i in value)
          if (value[i]||value[i]===0) 
            element.dataset[i] = value[i]; 
        break;
      case  'id': element.id = value; break;
      case 'nam': element.name = value; break;
      case 'pla': element.placeholder = value; break;
      case 'ref': element.href = value; break;
      case 'rel': element.rel = value; break;
      case 'siz': element.sizes = value; break;
      case 'src': element.src = value; break;
      case 'tab': element.tabIndex = value; break;
      case 'tit': element.title = value; break;
      case 'typ': element.type = value; break;
      case 'val': element.value = value; break;
      default: console.log('aa.mk.l: invalid key ',key,value)
    }
  }
  return element
};


// media observer for lazy cache fetching
// aa.lazy_god = new IntersectionObserver(a=>
// {
//   for (const b of a)
//   {
//     if (b.isIntersecting) 
//     {
//       let l = b.target;
//       aa.lazy_god.unobserve(l);
//       fastdom.mutate(()=>
//       {
//         if (l.dataset.src) l.src = l.dataset.src;
//         l.classList.add('quick_fox');
//         l.classList.remove('lazy_dog');
//       });
//     }
//   }
// },{root:null,threshold:.1});


// if no options found, load with defaults
aa.load =async(o={})=>
{
  // setup document
  aa.add_styles(o.styles || aa.def.styles);
  aa.framed = window.self !== window.top;
  
  aa.l = o.l || document.documentElement;
  aa.bod = document.body || o.bod;
  
  let dependencies = o.dependencies || aa.def.dependencies;
  let tools = o.tools || aa.def.tools;
  
  
  await aa.add_scripts([...dependencies,...tools]);
  // extend fastdom
  // aa.fastdom = fastdom.extend(fastdomPromised);
  aa.mk.manifest();
  aa.mk.dialog();
  aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});
  aa.view.l = aa.mk.l('main',{id:'view'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  
  let mods = o.mods || aa.def.mods;
  aa.mods_load(mods);

  aa.actions.push(
    {
      action:['help','aa'],
      description:'alphaama help',
      exe:()=>{aa.mk.help()}
    },
    // {
    //   action:['help','db'],
    //   description:'database help',
    //   exe:()=>{aa.mk.help('db')}
    // },
    // {
    //   action:['db','help'],
    //   description:'database help',
    //   exe:()=>{aa.mk.help('db')}
    // },
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

  // aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  
  

  setTimeout(()=>{aa.cli.on_collapse.push(aa.logs_read)},200);
  
  
  window.addEventListener('beforeunload',aa.unload);
  // window.onbeforeunload = aa.unload;

  if (aa.framed)
    fastdom.mutate(()=>{aa.l.classList.add('framed')});

  return true
};


// log stuff
aa.log =(con='',container=false,is_new=true)=>
{
  const cla = 'log item'+(is_new?' is_new':'');
  const clk =e=>
  {
    e.stopPropagation();
    aa.log_read(e.target)
  };
  const app = typeof con==='string'?aa.mk.l('p',{con}):con;
  const log = aa.mk.l('li',{cla,clk,app});
  
  if (!container) container = aa.logs;
  if (container) fastdom.mutate(()=>{container.append(log)});
  else console.log('log:',con);
  return log
};


// mark log as read
aa.log_read =async element=>
{
  if (!element) return;
  if (!element.classList.contains('is_new'))
  element = element.closest('.is_new');
  if (!element) return;

  fastdom.measure(()=>
  {
    element.blur();
  });
  fastdom.mutate(()=>
  {
    element.classList.remove('is_new');
    element.classList.add('is_recent');
  })
};


// append mod scripts when required mods have been loaded
aa.mods_load =async mods=>
{
  aa.temp.mods_after_load = [];
  for (const mod of mods)
  {
    if (aa.required(mod.requires))
    {
      await aa.add_scripts([mod.src]);
      let id = mod.id;
      if (Object.hasOwn(aa,id)
      && Object.hasOwn(aa[id],'load')) 
        await aa[id].load();
      
      aa[id].loaded = true;
    }
  }
  while (aa.temp.mods_after_load.length)
  {
    let after_load = aa.temp.mods_after_load.shift();
    setTimeout(after_load,0)
  }
  delete aa.temp.mods_after_load;
};


// reusable regex
aa.regex =
{
  get an(){ return /^[A-Z_0-9]+$/i },
  get hashtag(){ return /(\B[#])[\w_-]+/g },
  get hex(){ return /^[A-F0-9]+$/i },
  //get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi },
  //get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi },
  get nostr(){ return /((nostr:)[A-Z0-9]{12,})\b/gi }, 
  get bech32(){ return /^[AC-HJ-NP-Z02-9]*/i },
  get url(){ return /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g },
  get str(){ return /"([^"]+)"/ }, // text in quotes ""
  get fw(){ return /(?<=^\S+)\s/ }, // first word
};


// tries to delete everything saved locally 
// and then reload clean
aa.reset =async()=>
{
  aa.log('reset initiated');
  await aa.db.ops('cash',{clear:'ALL'});
  aa.log('db cash: clear');
  let databases = await indexedDB.databases();
  for (const db of databases) indexedDB.deleteDatabase(db.name);
  aa.log('indexedDB: clear')
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


// default page layout
aa.mk.page =(o={})=>
{
  let df = new DocumentFragment();
  df.append(
    aa.mk.header(),
    aa.view.l,
    aa.cli.l,
    aa.el.get('dialog')
  );
  aa.bod.prepend(df);  
  aa.log(aa.mk.status(),0,0);
  setTimeout(aa.view.pop,100);
};


// head scripts
aa.add_scripts =async array=>
{
  return new Promise(resolve=>
  {
    let done = 0;
    for (const src of array) 
    {
      let element = aa.mk.l('script',{src});
      element.addEventListener('load',e=>
      {
        if (done===array.length-1) resolve(true);
        done++
      });
      document.head.append(element);
    }
  })
};


aa.mk.status =force=>
{
  let status = aa.el.get('status');
  if (!force && status) return status;

  let on_off = navigator.onLine ? 'on' : 'off';
  status = aa.mk.l('p',
  {
    con: `${on_off}line at ${location.origin} since `,
    app: aa.mk.time(aa.now)
  });
  aa.el.set('status',status)
  return status 
};





// before unload event
aa.unload =e=>
{
  e.preventDefault();
  e.returnValue = ''
  // return true
  // if (sessionStorage.hasOwnProperty('reload'))
  // {
  //   sessionStorage.removeItem('reload');
  //   e.returnValue = '';
  //   return ''
  // }
  // e.preventDefault();
  // if (window.confirm('reload?')) return true
};