/*

alphaama
A<3   aa

*/


// a version to change
const aa_version = 78;
// a
const aa = 
{
  name:'alphaama',
  aka:'A<3',
  about:'just .aa nostr fucking client',
  actions:[],
  db:{},
  clears:[],
  clk:{},
  def:
  {
    id:'aa',
  },
  l: document.documentElement,
  bod: document.body,
  deps:
  [
    '/dep/fastdom.js?v=1.0.4',
    '/dep/nostr-tools.js?v=2.15.0',
    '/dep/store.js',
    '/dep/qrcode.js',
    // '/dep/asciidoctor.min.js?v=3.0.4',
    // '/dep/bolt11.js',
    // '/dep/cashuts.js?v=2.0.0',
    // '/dep/fastdom-promised.js?v=1.0.4',
    // '/dep/fastdom-strict.js?v=1.0.4',
    // '/dep/math.js?v=14.0.1',
    // '/dep/webtorrent.min.js',
    // '/dep/hls.js?v=1',
    // '/dep/blurhash.js?v=10000',
    '/scripts/make.js',
    '/scripts/debt.js',
    '/scripts/sift.js',
    '/scripts/parse.js',
  ],
  mods:
  [
    ['cli','/cli/cli.js'],
    ['o','/o/o.js'],
    ['p','/p/p.js'],
    ['e','/e/e.js'],
    ['r','/r/r.js'],
    ['q','/q/q.js'],
    ['u','/u/u.js'],
    // ['w','/w/w.js'],
  ],
  scripts:
  [

    '/aa/mk.js',
    '/aa/mod.js',
    '/aa/view.js',
    '/db/db.js',
    '/aa/clk.js',
    '/aa/fx.js',
    '/aa/log.js',
    '/aa/wakelock.js',
    '/av/av.js',
  ],
  styles:
  [
    '/aa/list.css',
    '/aa/mod.css',
    '/aa/log.css',
    '/aa/view.css',
    '/aa/side.css',
    '/aa/dialog.css',
  ],
  el:new Map(),
  fx:{},
  mk:{},
  get now(){ return Math.floor(Date.now()/1000) },
  parse:{},
  state:{},
  temp:{},
  // dev:true
  // get dev(){ return sessionStorage.hasOwnProperty('dev') }
  // regex:
  // {
  //   get an(){ return /^[A-Z_0-9]+$/i },
  //   get hashtag(){ return /(\B[#])[\w_-]+/g },
  //   get hex(){ return /^[A-F0-9]+$/i },
  //   get paragraph(){ return /\n/ },
  //   get paragraphs(){ return /\n\s*\n/ },
  //   //get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi },
  //   //get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi },
  //   get nostr(){ return /((nostr:)[A-Z0-9]{12,})\b/gi }, 
  //   get bech32(){ return /^[AC-HJ-NP-Z02-9]*/i },
  //   get url(){ return /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g },
  //   get str(){ return /"([^"]+)"/ }, // text in quotes ""
  //   get fw(){ return /(?<=^\S+)\s/ }, // first word
  // },
  resets:[]
};


// append mod scripts when required mods have been loaded
aa.add_mods =async(mods,target)=>
{
  if (!target) target = aa;
  await aa.add_scripts(mods.map(i=>i[1]));
  for (const id of mods.map(i=>i[0]))
  {
    if (!Object.hasOwn(target,id)) continue;
    
    let mod = target[id];

    if (Object.hasOwn(mod,'styles'))
      aa.add_styles(mod.styles);

    if (Object.hasOwn(mod,'scripts'))
      await aa.add_scripts(mod.scripts);

    if (Object.hasOwn(mod,'load'))
      await mod.load();
    mod.loaded = true;
  }
};


// head scripts
aa.add_scripts =async array=>
{
  return new Promise(resolve=>
  {
    let done = 0;
    for (let src of array) 
    {
      src = `${src}?v=${aa_version}`;
      let element = document.createElement('script');
      element.src = src;
      element.toggleAttribute('defer');

      // let element = make('script',{src});
      element.addEventListener('load',e=>
      {
        if (done===array.length-1) resolve(true);
        done++
      });
      document.head.append(element);
    }
  })
};


// base elements
aa.add_stuff =no_page=>
{
  aa.mk.manifest();
  aa.el.set('caralho',make('a',
  {
    id: 'caralho',
    ref: '/',
    con: aa.aka,
    tit: 'vai pró caralho',
    clk: e=>
    {
      e.preventDefault();
      aa.view.clear();
      aa.view.force({view:''});
    },
  }));

  aa.el.set('state', make('h1',
  {
    cla: 'aa_state',
    con: 'dickbutt',
    dat: { pathname: location.pathname }
  }));

  aa.el.set('header', make('header',
  {
    cla:'aa_header',
    app:[aa.el.get('caralho'), aa.el.get('state')]
  }));

  aa.el.set('view', make('main',{id:'view'}));
  aa.el.set('side', aa.mk.section({
    id:'side',
    name:'a_a',
    // element:aa.mod_l,
    tagname:'aside'
  }));

  aa.el.set('dialog',aa.mk.dialog());
};


// head styles
aa.add_styles =async array=>
{
  document.head.append(...array.map(path=>
  {
    let element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = `${path}?v=${aa_version}`;
    return element
  }))
};


// if no options found, load with defaults
aa.load =async(options={})=>
{
  let {
    styles,
    deps,
    scripts,
    mods,
    page,
  } = options;
  
  deps = deps || aa.deps;
  styles = styles || aa.styles;
  scripts = scripts || aa.scripts;
  mods = mods || aa.mods;
  
  aa.add_styles(styles);

  aa.framed = window.self !== window.top;

  let regex_module = await import('./regex.js');
  aa.regex = regex_module.default;

  await aa.add_scripts(deps);
  await aa.add_scripts(scripts);
  aa.add_stuff(page);
  await aa.add_mods(mods);
  // window.addEventListener('beforeunload',aa.unload);
};


// JSON.parse wrapper
aa.pj =(string='')=>
{
  let json;
  string = string.trim();
  if (string.length > 2)
  {
    try { json = JSON.parse(string) }
    catch(er){ console.log('aa.pj:',string,er) }
  }
  return json
};


// default page layout
aa.mk.page =(o={})=>
{
  let elements = new DocumentFragment();
  let side = aa.el.get('side');
  side.append(aa.mod_l);
  elements.append
  (
    aa.el.get('header'),
    aa.el.get('view'),
    aa.el.get('cli'),
    aa.el.get('side'),
    aa.el.get('dialog')
  );
  let classes = ['aa'];
  if (aa.framed) classes.push('framed');
  fastdom.mutate(()=>
  {
    aa.l.classList.add(...classes);
    aa.bod.prepend(elements);
  });
  
  aa.cli.on_collapse.push(aa.logs_read);
  
  aa.log(aa.mk.status(),0,0);

  setTimeout(aa.view.pop,100);
};




// before unload event
aa.unload =e=>
{
  e.preventDefault();
  e.returnValue = ''
};