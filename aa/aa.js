/*

alphaama
A<3   aa

*/


// a version to change
const aa_version = 74;
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
      '/dep/fastdom.js?v=1.0.4',
      '/dep/nostr-tools.js?v=2.15.0',
      '/dep/store.js',
      
      // '/dep/deps.js', // bundled dependencies 
      // '/dep/asciidoctor.min.js?v=3.0.4',
      // '/dep/bolt11.js',
      '/dep/cashuts.js?v=2.0.0',

      
      // '/dep/fastdom-promised.js?v=1.0.4',
      // '/dep/fastdom-strict.js?v=1.0.4',
      // '/dep/math.js?v=14.0.1',
      
      '/dep/qrcode.js',
      
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
    scripts:
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
      '/aa/list.css?v='+aa_version,
      '/aa/mod.css?v='+aa_version,
      '/aa/log.css?v='+aa_version,
      '/aa/view.css?v='+aa_version,
      '/aa/side.css?v='+aa_version,
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
  // get dev(){ return sessionStorage.hasOwnProperty('dev') }
};


// head styles
aa.add_styles =async a=>
{
  let rel = 'stylesheet';
  for (const ref of a) document.head.append(aa.mk.l('link',{rel,ref}));
};


// toggle aa.dev on current tab
// aa.dev_set =force=>
// {
//   if (force !== undefined)
//   {
//     if (force) sessionStorage.dev = true;
//     else sessionStorage.removeItem(dev);
//   }
//   else
//   {
//     if (aa.dev) sessionStorage.removeItem(dev);
//     else sessionStorage.dev = true
//   }
//   aa.log(`aa.dev = ${aa.dev}`);
// };


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
      case 'sty': element.style = value; break;
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
  let {
    styles,
    l,
    bod,
    dep,
    mods,
    scripts,
    no_page,
  } = o;
  // setup document
  aa.add_styles(styles || aa.def.styles);
  aa.framed = window.self !== window.top;
  
  aa.l = l || document.documentElement;
  aa.bod = bod || document.body;

  aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});

  let dependencies = dep || aa.def.dependencies;
  scripts = scripts || aa.def.scripts;
  
  await aa.add_scripts([...dependencies,...scripts]);
  
  // extend fastdom
  // aa.fastdom = fastdom.extend(fastdomPromised);
  
  aa.view.l = aa.mk.l('main',{id:'view'});
  aa.mk.manifest();
  aa.mk.dialog();
  aa.mk.side();

  await aa.mods_load(mods || aa.def.mods);

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
  if (!no_page) aa.mk.page();
  window.addEventListener('beforeunload',aa.unload);
  return true
};










// append mod scripts when required mods have been loaded
// aa.mods_load =async mods=>
// {
//   aa.temp.mods_after_load = [];
//   let styles = [];
//   for (const mod of mods)
//   {
//     if (aa.required(mod.requires))
//     {
//       await aa.add_scripts([mod.src]);
//       let id = mod.id;
//       if (Object.hasOwn(aa,id) && Object.hasOwn(aa[id],'load'))
//       {
//         let dis_mod = aa[id];
//         await dis_mod.load();
//         dis_mod.loaded = true;
//         if (dis_mod.styles) styles.push(...dis_mod.styles);
//       }
//     }
//     console.log(mod);
//   }
//   console.log('yo');
//   while (aa.temp.mods_after_load.length)
//   {
//     let after_load = aa.temp.mods_after_load.shift();
//     setTimeout(after_load,0)
//   }
//   delete aa.temp.mods_after_load;
//   aa.add_styles(styles);
// };

aa.mods_load =async mods=>
{
  aa.temp.mods_after_load = [];
  
  for (const mod of mods) await aa.mod_load(mod);
  
  while (aa.temp.mods_after_load.length)
  {
    let after_load = aa.temp.mods_after_load.shift();
    setTimeout(after_load,0)
  }
  delete aa.temp.mods_after_load;
};

aa.mod_load =async mod=>
{
  return new Promise(async resolve=>
  {
    let id = mod.id;
    await aa.add_scripts([mod.src]);
    if (Object.hasOwn(aa,id))
    {
      let dis_mod = aa[id];
      if (Object.hasOwn(dis_mod,'styles'))
        aa.add_styles(dis_mod.styles);
      if (Object.hasOwn(dis_mod,'scripts'))
        await aa.add_scripts(dis_mod.scripts);
      if (Object.hasOwn(dis_mod,'load'))
        await dis_mod.load();
      dis_mod.loaded = true;
    }
    resolve(true)
  })
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
// aa.required =mods=>
// {
//   for (const id of mods) 
//     if (!Object.hasOwn(aa,id) || !aa[id].loaded) return false
//   return true
// };


// default page layout
aa.mk.page =(o={})=>
{
  let elements = new DocumentFragment();
  elements.append
  (
    aa.mk.header(),
    aa.view.l,
    aa.cli.l,
    aa.el.get('side'),
    aa.el.get('dialog')
  );
  
  aa.bod.prepend(elements);
  aa.cli.on_collapse.push(aa.logs_read);
  
  if (aa.framed)
    fastdom.mutate(()=>{aa.l.classList.add('framed')});
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


// before unload event
aa.unload =e=>
{
  e.preventDefault();
  e.returnValue = ''
};