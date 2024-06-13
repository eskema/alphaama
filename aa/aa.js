const aa = 
{
  actions:[],
  dependencies:
  [
    '/dep/nostr_tools_2.js?v=20000',
    '/dep/blurhash.js?v=10000',
  ],
  l:document.documentElement,
  kinds:{},
  miss:{e:{},p:{}},
  mk:{},
  mods:
  [
    '/aa/db.js',
    '/aa/o.js',
    '/aa/state.js',
    '/aa/cli.js',
    '/aa/e.js',
    '/aa/p.js',
    '/aa/q.js',
    '/aa/r.js',
    '/aa/u.js',
    '/aa/dex.js',
  ],
  temp:{},
  state:{},
  styles:['/styleshit.css'],
  tools:
  [
    '/aa/it.js',
    '/aa/is.js',
    '/aa/t.js',
    '/aa/fx.js',
    '/aa/mk.js',
    '/aa/get.js',
    '/aa/clk.js',
    '/aa/parse.js',
  ],
  viewing:false,
  views:[],

};


// make element

aa.mk.l =(tag_name,o=false)=>
{
  const l = document.createElement(tag_name);
  if (!o || typeof o !== 'object') return l;
  for (const k in o)
  {
    const v = o[k];
    switch (k)
    {
      case 'con': l.textContent = v; break;
      case 'id':  l.id = v; break;
      case 'cla': l.className = v; break;
      case 'bef': l.dataset.before = v; break;
      case 'aft': l.dataset.after = v; break;
      case 'ref': l.href = v; break;
      case 'rel': l.rel = v; break;
      case 'src': l.src = v; break;
      case 'tit': l.title = v; break;
      case 'app': l.append(v); break;
      case 'clk': l.addEventListener('click',v); break;
      case 'nam': l.name = v; break;
      case 'val': l.value = v; break;
      case 'pla': l.placeholder = v; break;
      case 'tab': l.tabIndex = v; break;
    }
  }
  return l
};

aa.head_def_styles =styles=>
{
  for (const s of styles)
  document.head.append(aa.mk.l('link',{rel:'stylesheet',ref:s}));
};

aa.head_def_scripts =scripts=>
{
  for (const s of scripts) document.head.append(aa.mk.l('script',{src:s}));
};


// on load

aa.load =(o={})=>
{
  aa.styles_loaded = o.styles ? o.styles : aa.styles;
  aa.dependencies_loaded = o.dependencies ? o.dependencies : aa.dependencies;
  aa.tools_loaded = o.tools ? o.tools : aa.tools;
  aa.mods_loaded = o.mods ? o.mods : aa.mods;
  aa.head_def_styles(aa.styles_loaded);
  aa.head_def_scripts(aa.dependencies_loaded);
  aa.head_def_scripts(aa.tools_loaded);
  aa.head_def_scripts(aa.mods_loaded);
};


// log stuff

aa.log =async(s,l=false)=>
{
  const log = aa.mk.l('li',{cla:'l item'});
  if (typeof s === 'string') s = aa.mk.l('p',{con:s});
  log.append(s);
  
  if (!l) l = document.getElementById('logs');
  if (l) l.append(log);
  else console.log('log:',s)
};


  // view
  
  // const main = aa.mk.l('main',{id:'view'});
  // document.body.insertBefore(main,document.body.lastChild);
  
  // const l = aa.mk.section('l',1,aa.mk.l('ul',{id:'logs',cla:'list'}));
  // l.append(aa.mk.l('ul',{id:'logs',cla:'list'}));
  // main.append(l);


// if (localStorage.cash === 'yes' && 'serviceWorker' in navigator)
// { aa.cash = navigator.serviceWorker.register('/cash.js') }





// tries to delete everything saved locally 
// and then reload clean

aa.reset =()=>
{
  aa.log('shh... go to sleep now.');
  aa.db.idb.ops({clear:{stores:['stuff','authors','events']}})
  .then(()=>
  {
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(()=>{location.reload()},1000)
  });
};
aa.actions.push(
{
  action:['zzz'],
  description:'resets everything',
  exe:aa.reset
});


// run 

aa.run =(o={})=>
{
  // do stuff
  const main = aa.mk.l('main',{id:'view'});
  document.body.prepend(main);
  if (aa.cli) aa.cli.load();
  aa.stuff();
  aa.log('running '+location.origin);  
  aa.u.check_signer();
  aa.get.md('/README.md').then(md=>
  {
    aa.log(md);
    
    if (aa.o) aa.o.load();
    if (aa.e) aa.e.load();
    if (aa.p) aa.p.load();
    if (aa.q) aa.q.load();
    if (aa.r) aa.r.load();
    if (aa.u) aa.u.load();
  });
};






