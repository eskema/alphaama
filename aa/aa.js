/*

alphaama
A<3   aa   
v3

*/
const aa_version = 43;

const aa = 
{
  actions:[],
  db: 
  {
    e:{}, // memory events (dat)
    p:{}, // memory profiles (pro)
  },
  clear:[],
  clk:{},
  dependencies:
  [
    '/dep/cashu.js?v=1.2.1',
    '/dep/nostr-tools.js?v=2.10.3',
    '/dep/qrcode.js',
    // '/dep/nostr-tools.js?v=2.7.2',
    // '/dep/asciidoctor.min.js?v=3.0.4',
    // '/dep/hls.js?v=1',
    // '/dep/blurhash.js?v=10000',
  ],
  extensions:
  {
    img:['jpg','jpeg','gif','webp','png','heic'],
    av:['mp3','mp4','webm'],
  },
  fx:{},
  get:{},
  is:{},
  kinds:{},
  miss:{e:{},p:{},a:[]},
  mk:{},
  mods:
  [
    '/cli/cli.js?v='+aa_version,
    '/o/o.js?v='+aa_version,
    '/e/e.js?v='+aa_version,
    '/p/p.js?v='+aa_version,
    '/q/q.js?v='+aa_version,
    '/r/r.js?v='+aa_version,
    '/u/u.js?v='+aa_version,
    '/i/i.js?v='+aa_version,
    '/m/m.js?v='+aa_version,
    '/w/w.js?v='+aa_version,
  ],
  parse:{},
  state:{},
  styles:
  [
    '/aa/aa.css?v='+aa_version,
    '/aa/l.css?v='+aa_version,
  ],
  t:{ get now(){ return Math.floor(Date.now()/1000) }},
  temp:{print:{},refs:{},orphan:{}},
  tools:
  [
    '/aa/is.js?v='+aa_version,
    // '/aa/t.js?v='+aa_version,
    '/aa/fx.js?v='+aa_version,
    '/aa/mk.js?v='+aa_version,
    '/aa/clk.js?v='+aa_version,
    '/aa/parse.js?v='+aa_version,
    '/aa/db.js?v='+aa_version,
    '/aa/state.js?v='+aa_version,
  ],
  ui:
  {
    last_top: 0,
  },
  viewing:false,
  views:[],
};

aa.l = document.documentElement;

// web cache navigation for offline use
// if ('serviceWorker' in navigator && ) navigator.serviceWorker.register('/cash.js');


// parses string as action and executes it
aa.exe =async s=>
{
  let a = s.split(localStorage.ns+' ');
  // console.log(a);
  let output;
  for (const action of a)
  {
    if (!action.length) continue;
    let acts = action.split(' | ');
    for (const ac of acts)
    {
      let act;
      let cut;
      let cmd = ac.split(aa.regex.fw);
      let actions = aa.actions.filter(o=>o.action[0] === cmd[0]);
      if (actions.length > 1)
      {
        let sub_cmd = cmd[1].split(aa.regex.fw);
        let sub_actions = actions.filter(o=>o.action[1] === sub_cmd[0]);
        if (sub_actions.length)
        {
          act = sub_actions[0];
          cut = sub_cmd[1];
        }
      }
      else if (actions.length)
      {
        act = actions[0];
        if (actions[0].action.length > 1)
        {
          cut = cmd[1].split(aa.regex.fw)[1];
        }
        else 
        {
          cut = cmd[1];
        }
      }
      if (act && 'exe' in act) 
      {
        if (output) 
        {
          // if (typeof output !== 'string') 
          // {
          //   output = output.toString();
          // }
          output = await act.exe(cut+' '+output);
        }
        else output = await act.exe(cut);
      }
      // console.log(output);
    }
  }
};


// parses string as actions and executes them
// aa.exe2 =async s=>
// {
//   let a = s.split(localStorage.ns+' ');
//   console.log(a);
//   let output;
//   for (const action of a)
//   {
//     console.log()
//     if (!action.length) continue;
//     let act;
//     let cmd = action.split(aa.regex.fw);
//     let actions = aa.actions.filter(o=>o.action[0] === cmd[0]);
//     if (actions.length > 1)
//     {
//       let sub_cmd = cmd[1].split(aa.regex.fw);
//       let sub_actions = actions.filter(o=>o.action[1] === sub_cmd[0]);
//       if (sub_actions.length)
//       {
//         act = sub_actions[0];
//         cut = sub_cmd[1];
//       }
//     }
//     else if (actions.length)
//     {
//       act = actions[0];
//       cut = cmd[1];
//     }
//     if (act && 'exe' in act) 
//     {
//       if (output) output = await act.exe(cut+' '+output);
//       else output = await act.exe(cut);
//     }
//     console.log(output);
//   }
// };


// open a dialog
aa.dialog =async o=>
{
  const dialog = aa.mk.dialog();
  if (!dialog || dialog.open) return false;
  if (o.title) dialog.title = o.title;
  if (o.hasOwnProperty('l')) dialog.append(o.l);
  
  const dialog_options = aa.mk.l('p',{id:'dialog_options'});
  
  const dialog_no = aa.mk.l('button',
  {
    con:o.no.title ?? 'cancel',
    cla:'butt cancel',
    clk:e=>{ o.no.exe(); dialog.close()}
  });
  dialog_no.setAttribute('autofocus',true);
  
  const dialog_yes = aa.mk.l('button',
  {
    con:o.yes.title ?? 'confirm',
    cla:'butt confirm',
    clk:e=>{ o.yes.exe(); dialog.close()}
  });

  dialog_options.append(dialog_no,dialog_yes);
  dialog.append(dialog_options);
  dialog.showModal();
  if (o.scroll) dialog.scrollTop = dialog.scrollHeight;
};


// make element with options
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
      case 'lab': l.dataset.label = v; break;
      case 'ref': l.href = v; break;
      case 'rel': l.rel = v; break;
      case 'src': l.src = v; break;
      case 'tit': l.setAttribute('title',v); break;
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


// add stylesheet
aa.styleshit =s=>
{ 
  document.head.append(aa.mk.l('link',{rel:'stylesheet',ref:s})) 
};


// head meta elements
aa.head_meat =async()=>
{
  document.head.append(aa.mk.l('link',{rel:'manifest',ref:'/site.webmanifest'}));
  fetch('/site.webmanifest')
  .then(dis=>dis.json()).then(manifest=>
  {
    console.log(manifest);
    
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


// head styles
aa.head_styles =async styles=>
{
  for (const s of styles)
  document.head.append(aa.mk.l('link',{rel:'stylesheet',ref:s}));
};


// head scripts
aa.head_scripts =async scripts=>
{
  for (const s of scripts) 
  document.head.append(aa.mk.l('script',{src:s}));
};


// if no options found, load with defaults
aa.load =(o={})=>
{
  aa.head_meat();
  aa.styles_loaded = o.styles ? o.styles : aa.styles;
  aa.dependencies_loaded = o.dependencies ? o.dependencies : aa.dependencies;
  aa.tools_loaded = o.tools ? o.tools : aa.tools;
  aa.mods_loaded = o.mods ? o.mods : aa.mods;
  aa.head_styles(aa.styles_loaded);
  aa.head_scripts(aa.dependencies_loaded);
  aa.head_scripts(aa.tools_loaded);
  
  aa.head_scripts(aa.mods_loaded);

  aa.actions.push(
    {
      action:['zzz'],
      description:'resets everything',
      exe:aa.reset
    },
    {
      action:['l','l'],
      required:['text'],
      description:'log text to logs',
      exe:aa.log
    },
    {
      action:['l','x'],
      description:'clear logs',
      exe:aa.logs_clear
    },
  );
};


// log stuff
aa.log =async(s,l=false)=>
{
  const log = aa.mk.l('li',{cla:'l item is_new'});
  if (typeof s === 'string') s = aa.mk.l('p',{con:s});
  log.append(s);
  if (!l) l = aa.logs || document.getElementById('logs');
  if (l) 
  {
    l.append(log);
    log.addEventListener('click',aa.logs_read);
    // log.scrollIntoView();
  }
  else console.log('log:',s)
};


// logs container element
aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});
// mark log as read
aa.log_read =async l=>
{
  l.classList.remove('is_new');
  l.classList.add('just_added');
};
// mark logs as read
aa.logs_read =async e=>
{
  let ls = [];
  if (e) 
  {
    let dis = e.target?.classList.contains('is_new') ? e.target 
    : e.target.closest('.l.is_new');
    if (dis) ls.push(dis);
    e.stopPropagation();
  }
  else ls = aa.logs.querySelectorAll('.l.is_new');
  if (ls.length) for (const l of ls) aa.log_read(l);
};
// mark logs as read
aa.logs_clear =async s=>
{
  let ls = document.querySelectorAll('#l .l:not(.mod)');
  for (const l of ls) l.remove();
  aa.cli.clear();
};


// tries to delete everything saved locally 
// and then reload clean
aa.reset =()=>
{
  aa.log('shh... go to sleep now.');
  aa.db.cash.ops({clear:'ALL'});
  aa.db.idb.ops({clear:{stores:['stuff','authors','events']}})
  .then(()=>
  {
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(()=>{location.href = location.origin},1000)
  });
};




// if no options found, run with defaults
aa.run =(o={})=>
{
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  const main = aa.mk.l('main',{id:'view'});
  document.body.prepend(main);
  if (aa.is.rigged()) aa.l.classList.add('rigged');
  aa.wl.lock();
  aa.log((aa.is.online() ? 'on' : 'off') + 'line at '+location.origin);
  aa.u.check_signer();
  let u_u = aa.mk.l('aside',{id:'u_u',app:aa.mk.butt_expand('u_u','a_a')});
  u_u.append(aa.mod_l);
  document.body.insertBefore(
    u_u,
    document.body.lastChild
  );
  
  
  // aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  setTimeout(aa.logs_read,420);
  // window.addEventListener('scroll',aa.fx.scrolled);
};


// add server item with sets to mod
aa.mod_servers_add =(mod,s)=>
{   
  const work =a=>
  {
    let url_string = a.shift().trim();
    const url = aa.is.url(url_string)?.href;
    if (url)
    {
      if (!mod.o.ls[url]) mod.o.ls[url] = {sets:[]};
      aa.fx.a_add(mod.o.ls[url].sets,a);
      aa.mod_ui(mod,url);
    }
  };
  aa.fx.loop(work,s);
  aa.mod_save(mod);
};


// append buttons to server item
aa.mod_servers_butts =(mod,l,o)=>
{
  let url = l.querySelector('.url').innerText;
  l.append(' ',aa.mk.butt_action(mod.def.id+' rm '+url,'rm','rm'));
  
  let sets = aa.mk.l('span',{cla:'sets'});
  if (o.sets && o.sets.length)
  {    
    for (const set of o.sets)
    {
      sets.append(aa.mk.butt_action(mod.def.id+' setrm '+url+' '+set,set),' ')
    }
  }
  l.append(' ',sets,' ',aa.mk.butt_action(mod.def.id+' add '+url+' off','+','add'));
};


// remove set from server
aa.mod_setrm =(mod,s)=>
{
  aa.cli.clear();
  const work =a=>
  {
    let url_string = a.shift().trim();
    const url = aa.is.url(url_string)?.href;
    const server = mod.o.ls[url];
    if (!server) return;
    server.sets = aa.fx.a_rm(server.sets,a);
    aa.mod_ui(mod,url);
  };
  aa.fx.loop(work,s);
  aa.mod_save(mod)
};


// load mod
aa.mod_load =async mod=>
{
  // console.log(mod);
  let mod_o = mod.o;

  if (!mod_o) 
  {
    mod_o = await aa.db.idb.ops({get:{store:'stuff',key:mod.def.id}});
    if (mod_o) mod.o = mod_o;
    else if (!mod_o && mod.old_id) mod_o = await aa.mod_load_old(mod);
    if (!mod_o && mod.def) mod.o = mod.def;
  }
  if (!mod.o.ls) mod.o.ls = {};
  return mod
};


// in case the db key path changes, import to new key id
// if old_id is found
aa.mod_load_old =async mod=>
{
  let mod_o = await aa.db.idb.ops({get:{store:'stuff',key:mod.old_id}});
  if (mod_o)
  {
    mod_o.id = mod.def.id;
    mod.o = mod_o;
    aa.mod_save(mod);
  }
  return mod_o
};


// checks if required mod has loaded
aa.mods_required =mod=>
{
  // console.log(mod.requires);
  for (const id of mod.requires)
  {
    if (!aa[id]?.o) return false
  }
  return true;
};


// save mod
aa.mod_save = async mod=>
{
  return new Promise(resolve=>
  {
    // console.log(mod);
    if (mod && mod.o && mod.o.id)
    {
      aa.db.idb.worker.postMessage({put:{store:'stuff',a:[mod.o]}});
    }
    resolve(mod)
  })  
};


// update mod item element
aa.mod_ui =(mod,k)=>
{
  let v = mod.o.ls[k];
  let cur = document.getElementById(mod.def.id+'_'+aa.fx.an(k));
  let l = mod.hasOwnProperty('mk') ? mod.mk(k,v) : aa.mk.item(k,v);
  let mod_l = document.getElementById(mod.def.id);
  if (!cur) mod_l.append(l);
  else cur.replaceWith(l);
  if (mod_l.classList.contains('empty'))
  {
    mod_l.classList.remove('empty');
    mod_l.parentElement.classList.remove('empty');
  } 
};


// reusable regex
aa.regex = 
{
  get an(){ return /^[A-Z_0-9]+$/i},
  get hashtag(){ return /(\B[#])[\w+-]*/g},
  get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi},
  get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi},
  get nostr(){ return /((nostr:)[A-Z0-9]{12,})\b/gi}, 
  get bech32(){ return /^[AC-HJ-NP-Z02-9]*/i}, //acdefghjklmnqprstuvwxyz987654320
  get url(){ return /https?:\/\/([a-zA-Z0-9\.\-]+\.[a-zA-Z]+)([\p{L}\p{N}\p{M}&\.-\/\?=#\-@%\+_,:!~\/\*]*)/gu},
  get str(){ return /"([^"]+)"/ },
  get fw(){ return /(?<=^\S+)\s/}
};


// timestamp to date
aa.t.to_date =s=> new Date(s*1000);


// timestamp from date string
aa.t.d =s=>
{
  try { return Date.parse(s) / 1000 } 
  catch (er) { return false }
};


// timestamp from n days ago 
aa.t.n =days=>
{
  const d = new Date();
  d.setDate(d.getDate() - days);
  return Math.floor(d.getTime()/1000)
};


// nice format date to string
aa.t.nice =d=>
{ 
  return d.getFullYear()
  +'/'+ (d.getMonth()+1+'').padStart(2,'0') 
  +'/'+ (d.getDate()  + '').padStart(2,'0') 
  +' '+ (d.getHours() + '').padStart(2,'0') 
  +':'+ (d.getMinutes()+'').padStart(2,'0') 
  +':'+ (d.getSeconds()+'').padStart(2,'0')
};


// time elapsed from date to string
aa.t.elapsed =date=>
{
  const seconds_ago = Math.floor((new Date() - date) / 1000);
  const pad =t=> (Math.floor(t)+'').padStart(2,'0');  
  let t = seconds_ago / 31536000; // years
  if (t > 1) return pad(t)+'Y'; 
  t = seconds_ago / 2592000; // months
  if (t > 1) return pad(t)+'M'; 
  t = seconds_ago / 86400; // days
  if (t > 1) return pad(t)+'d'; 
  t = seconds_ago / 3600; // hours
  if (t > 1) return pad(t)+'h'; 
  t = seconds_ago / 60; // minutes
  if (t > 1) return pad(t)+'m'; 
  return pad(seconds_ago)+'s'; // seconds
};


// timestamp from string variable
aa.t.convert =s=>
{
  if (s === 'now') return aa.t.now; 
  if (s.startsWith('n_')) return aa.t.n(s.slice(2));
  if (s.startsWith('d_')) return aa.t.d(s.slice(2));  
  return parseInt(s)
};


// for display
aa.t.display =timestamp=> aa.t.nice(aa.t.to_date(timestamp));
aa.t.display_ext =ts=>aa.t.display(ts)+' ~'+aa.t.elapsed(aa.t.to_date(ts));


// timeout with delay if called again before for some time
aa.to =async(f,t,s)=>
{
  if (!aa.todo) aa.todo = {};
  if (aa.todo.hasOwnProperty(s)) clearTimeout(aa.todo[s]);
  aa.todo[s] = setTimeout(()=>{f(s)},t);
};


// wakelock
aa.wl = {wakelock:null,get haz_wakelock(){return 'wakeLock' in navigator}};


// prevent screen from going to sleep if tab is active
aa.wl.lock =async()=>
{
  if (!aa.wl.haz_wakelock) return;
  try 
  {
    aa.wl.wakelock = await navigator.wakeLock.request();
    const m =()=>{console.log('wake state locked:',!aa.wl.wakelock.released)};
    aa.wl.wakelock.addEventListener('release',m);
    m();
  } 
  catch(er){ console.error('failed to lock wake state:', er.message) }
};


// release screen from locked state
aa.wl.release =()=>
{
  if (aa.wl.wakelock) aa.wl.wakelock.release();
  aa.wl.wakelock = null;
};