const aa = 
{
  actions:[],
  clk:{},
  dependencies:
  [
    '/dep/nostr_tools_2.js?v=20000',
    '/dep/blurhash.js?v=10000',
  ],
  fx:{},
  get:{},
  is:{},
  l:document.documentElement,
  kinds:{},
  miss:{e:{},p:{}},
  mk:{},
  mods:
  [
    '/aa/cli.js',
    '/aa/o.js',
    '/aa/e.js',
    '/aa/p.js',
    '/aa/q.js',
    '/aa/r.js',
    '/aa/u.js',
    // '/aa/dex.js',
  ],
  temp:{},
  state:{},
  styles:['/styleshit.css'],
  t:{},
  tools:
  [
    '/aa/fun.js',
    '/aa/is.js',
    '/aa/t.js',
    '/aa/fx.js',
    '/aa/mk.js',
    '/aa/clk.js',
    '/aa/parse.js',
    '/aa/db.js',
    '/aa/state.js',
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
      case 'siz': l.sizes = v; break;
      case 'typ': l.type = v; break;
    }
  }
  return l
};

aa.head_meat =()=>
{
  // <link rel="apple-touch-icon" sizes="180x180" href="/stuff/apple-touch-icon.png">
  // <link rel="icon" type="image/png" sizes="32x32" href="/stuff/favicon-32x32.png">
  // <link rel="icon" type="image/png" sizes="16x16" href="/stuff/favicon-16x16.png">
  // <link rel="mask-icon" href="/stuff/safari-pinned-tab.svg" color="#171717">
  // <link rel="manifest" href="/site.webmanifest?v=1"></link>
};

aa.head_styles =styles=>
{
  for (const s of styles)
  document.head.append(aa.mk.l('link',{rel:'stylesheet',ref:s}));
};

aa.head_scripts =scripts=>
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
  aa.head_styles(aa.styles_loaded);
  aa.head_scripts(aa.dependencies_loaded);
  aa.head_scripts(aa.tools_loaded);
  aa.head_scripts(aa.mods_loaded);
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





// tries to delete everything saved locally 
// and then reload clean

aa.reset =()=>
{
  aa.log('shh... go to sleep now.');
  // aa.db.cash.ops.({clear:'ALL'));
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
  // aa.get.md('/README.md').then(md=>
  // {
  //   main.append(md);
  //   aa.log('running '+location.origin);  
  //   aa.u.check_signer();
  //   if (aa.o) aa.o.load();
  //   if (aa.e) aa.e.load();
  //   if (aa.p) aa.p.load();
  //   if (aa.q) aa.q.load();
  //   if (aa.r) aa.r.load();
  //   if (aa.u) aa.u.load();
  // });

  aa.log('running '+location.origin);  
  aa.u.check_signer();
  if (aa.o) aa.o.load();
  if (aa.e) aa.e.load();
  if (aa.p) aa.p.load();
  if (aa.q) aa.q.load();
  if (aa.r) aa.r.load();
  if (aa.u) aa.u.load();
  
  
};

aa.mod_load =async mod=>
{
  console.log(mod);
  let mod_o = mod.o;

  if (!mod_o) 
  {
    mod_o = await aa.db.idb.ops({get:{store:'stuff',key:mod.def.id}});
    if (mod_o) mod.o = mod_o;
    else if (!mod_o && mod.old_id)
    {
      // in case the db key path changes, import to new key id
      // if old_id is found
      mod_o = await aa.db.idb.ops({get:{store:'stuff',key:mod.old_id}});
      if (mod_o)
      {
        mod_o.id = mod.def.id;
        mod.o = mod_o;
        aa.mod_save(mod);
      }
    }
    if (!mod_o && mod.def) mod.o = mod.def;
  }
  if (!mod.o.ls) mod.o.ls = {};
  return mod
};

aa.mod_save = async mod=>
{
  return new Promise(resolve=>
  {
    console.log(mod);
    if (mod && mod.o && mod.o.id)
    {
      aa.db.idb.worker.postMessage({put:{store:'stuff',a:[mod.o]}});
    }
    resolve(mod)
  })  
};


// mod update item element

aa.mod_ui =(mod,k,v)=>
{
  let cur = document.getElementById(mod.def.id+'_'+aa.fx.an(k));
  let l = mod.hasOwnProperty('mk') ? mod.mk(k,v) : aa.mk.item(k,v);
  if (!cur) document.getElementById(mod.def.id).append(l);
  else cur.replaceWith(l);
};