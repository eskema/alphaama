/*

alphaama
A<3   aa   
v3

*/
const aa_version = 44;

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
    '/dep/cashuts.js?v=2.0.0',
    '/dep/nostr-tools.js?v=2.10.3',
    '/dep/qrcode.js',
    '/dep/bolt11.js',
    // '/dep/webtorrent.min.js',
    '/dep/asciidoctor.min.js?v=3.0.4',
    // '/dep/hls.js?v=1',
    // '/dep/blurhash.js?v=10000',
    '/dep/math.js?v=14.0.1',
  ],
  extensions:
  {
    img:['jpg','jpeg','gif','webp','png','heic'],
    av:['mp3','mp4','webm','m4a'],
  },
  fx:{},
  get:{},
  is:{},
  kinds:{},
  misc:{},
  miss:{e:{},p:{},a:[]},
  mk:{},
  mods:
  [
    {id:'c',src:'/c/c.js?v='+aa_version,requires:[]},
    {id:'o',src:'/o/o.js?v='+aa_version,requires:['c']},
    {id:'r',src:'/r/r.js?v='+aa_version,requires:[]},
    {id:'e',src:'/e/e.js?v='+aa_version,requires:['o']},
    {id:'p',src:'/p/p.js?v='+aa_version,requires:[]},
    {id:'q',src:'/q/q.js?v='+aa_version,requires:['o','r']},
    {id:'u',src:'/u/u.js?v='+aa_version,requires:['o','p','e']},
    {id:'i',src:'/i/i.js?v='+aa_version,requires:['e','p']},
    {id:'w',src:'/w/w.js?v='+aa_version,requires:['r']},
  ],
  parse:{},
  state:{},
  styles:
  [
    '/aa/aa.css?v='+aa_version,
  ],
  t:{ get now(){ return Math.floor(Date.now()/1000) }},
  temp:{print:{},refs:{},orphan:{}},
  tools:
  [
    '/aa/fx.js?v='+aa_version,
    '/aa/mk.js?v='+aa_version,
    // '/aa/db.js?v='+aa_version,
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


// returns false or true if the string is an action
aa.is.act =s=>
{
  const ns = localStorage.ns;
  if (!ns) return false; 
  if (ns.startsWith(s) 
  || s.startsWith(ns+' ') 
  || s === ns
  ) return true;
  return false
};


// is alphanumeric and underscore
aa.is.an =s=> aa.regex.an.test(s);


// web cache worker
aa.db.cash = { get new(){ return new Worker('/cash.js')} };


// checks if element has no children and is empty, ignores trailing spaces
aa.is.empty =l=>
{
  if (!l) return true;
  const len = l.childNodes.length;
  if (!len) return true;
  else
  {
    if (l.firstChild.nodeType === 3)
    {
      const s = (l.textContent+'').trim();
      if (!s || s === ' ') return true;
    }
  }
  return false;
};


// adds a clicked class to show interaction
aa.clk.clkd =l=>
{
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};


// splits a string into paragraphs, then into lines and then into words 
// and process each part separately
aa.parse.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  let l = aa.mk.l('p',{cla:'paragraph'});
  const another_l =last_l=>
  {
    last_l.normalize();
    if (aa.is.empty(last_l)) last_l.remove();
    else 
    {
      df.append(last_l);
      l = aa.mk.l('p',{cla:'paragraph'});
    }
  };
  let paragraphs = s.split(/\n\s*\n/);
  if (paragraphs.length === 1) paragraphs = s.split(/\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;    
    
    const lines = paragraph.trim().split(/\n/);
    for (let li=0;li<lines.length;li++)
    {
      if (l.childNodes.length) l.append(aa.mk.l('br'));

      const words = lines[li].trim().split(' ');
      for (let i=0;i<words.length;i++)
      {
        let word = words[i].trim();
        if (!word.length) continue;

        if (aa.regex.url.test(word)) 
        {
          let dis_node = aa.parser('url',word,trusted);
          l.append(dis_node,' ');
        }
        else if (aa.regex.nostr.test(word)) 
        {
          let parsed = aa.parser('nostr',word);
          let quote = parsed.querySelector('blockquote');
          if (quote)
          {
            another_l(l); 
            df.append(quote)
          }
          else l.append(parsed);       
        }
        else if (aa.regex.hashtag.test(word)) 
        {
          let dis_node = aa.parser('hashtag',word);
          l.append(dis_node,' ');
        }
        else 
        {
          if (i === words.length-1) l.append(word);
          else l.append(word,' ');
        }
      }
    }
    another_l(l);
  }
  return df
};


// expand 
aa.clk.expand =e=>
{
  if (e.hasOwnProperty('stopPropagation')) e.stopPropagation();
  let l = document.getElementById(e.target.dataset.controls) || e.target;
  if (!l) return;
  
  let block;
  requestAnimationFrame(e=>
  {
    if (l.classList.contains('expanded'))
    {
      l.classList.remove('expanded');
      sessionStorage[l.id] = '';
      block = 'center';
    }
    else
    {
      l.classList.add('expanded');
      sessionStorage[l.id] = 'expanded';
      block = 'start';
    }
    aa.fx.scroll(l,{behavior:'smooth',block:block});
  });
};


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


// checks if page is loading from iframe
aa.is.iframe =()=>
{
  try {return window.self !== window.top} 
  catch(er) {return true}
};


// pass operations to worker and 
aa.db.get =async(s,o)=>
{
  return new Promise(resolve=>
  {
    const db = aa.db[s].new;
    db.onmessage =e=> 
    {
      setTimeout(()=>{db.terminate()},200);
      resolve(e.data);
    }
    db.postMessage(o);
  });
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
    // console.log(manifest);
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
  {
    let script = aa.mk.l('script',{src:s});
    // script.setAttribute('cross-origin','');
    document.head.append(script);
  }
};


// indexeddb stuff
aa.db.idb = { get new(){ return new Worker('/aa/db_idb.js')} };


// parse JSON
aa.parse.j =son=>
{
  let o;
  son = son.trim();
  if (son.length > 2)
  {
    try { o = JSON.parse(son) }
    catch (er) 
    { 
      console.log('aa.parse.j',son); 
      console.error(er) 
    }
  }
  return o
};


// is a valid nostr key
aa.is.key =x=> aa.is.x(x) && x.length === 64; 


// wip
aa.clk.list_filter_input =e=>
{
  let ls = e.target.nextElementSibling;
  let lf = aa.mk.l('div',{cla:'lf'});
  let inp = aa.mk.l('input');
  lf.append(inp);
  inp.addEventListener('change',e=>
  {
    console.log(inp.value);
    console.log(ls.childElementCount);
  });
  e.target.parentElement.insertBefore(lf,e.target);
  e.target.remove();
  // lf.prepend(e.target);
};


// if no options found, load with defaults
aa.load =(o={})=>
{
  aa.head_meat();
  aa.styles_loaded = o.styles ? o.styles : aa.styles;
  aa.head_styles(aa.styles_loaded);
  aa.dependencies_loaded = o.dependencies ? o.dependencies : aa.dependencies;
  aa.head_scripts(aa.dependencies_loaded);
  aa.tools_loaded = o.tools ? o.tools : aa.tools;
  aa.head_scripts(aa.tools_loaded);
  aa.mods_loaded = o.mods ? o.mods : aa.mods;
  aa.head_scripts(aa.mods_loaded.map(i=>i.src));
  // for (const mod_o of aa.mods_loaded) aa.mod_scripts(mod_o);

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
    {
      action:['fx','math'],
      description:'math stuff',
      exe:aa.math
    },
  );

  fetch('/stuff/nostr_kinds.json')
  .then(dis=>dis.json()).then(kinds=> aa.k = kinds);  
};


// log stuff to l
aa.log =(s,l=false)=>
{
  const log = aa.mk.l('li',{cla:'l item is_new'});
  if (typeof s === 'string') s = aa.mk.l('p',{con:s});
  log.append(s);
  if (!l) l = aa.logs || document.getElementById('logs');
  if (l) 
  {
    l.append(log);
    log.addEventListener('click',aa.logs_read);
  }
  else console.log('log:',s);
  return log
};


// logs container element
aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});


// mark log as read
aa.log_read =async l=>
{
  l.classList.remove('is_new');
  l.classList.add('just_added');
  l.blur();
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
};


aa.math =(s='')=>
{
  return math.evaluate(s)
};


// load mod
aa.mod_load =async(mod)=>
{
  if (!mod.o) 
  {
    mod.o = await aa.db.idb.ops({get:{store:'stuff',key:mod.def.id}});
    if (!mod.o && mod.old_id) mod.o = await aa.mod_load_old(mod);
    if (!mod.o && mod.def) mod.o = mod.def;
  }
  if (mod.o && !mod.o.ls) mod.o.ls = {};
  return mod
};


// in case the db key path changes
// load mod from old_id
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



// checks if required mods have loaded
aa.is.mods_loaded =a=>
{
  for (const id of a) if (!aa[id]?.o) return false
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


// append mod head scripts when required mods have been loaded
aa.mod_scripts =o=>
{
  if (aa.is.mods_loaded(o.requires)) 
  {
    let script = aa.mk.l('script',{src:o.src});
    script.onload =()=>
    {
      if (aa.hasOwnProperty(o.id)
      && aa[o.id].hasOwnProperty('load')) aa[o.id].load()
    };
    // script.setAttribute('cross-origin','');
    document.head.append(script);
    // aa.head_scripts(o.srcs);
    // aa[o.id].load();
  }
  else 
  {
    if (!o.attempts) o.attempts = 1;
    else o.attempts++;
    if (o.attempts < 20) setTimeout(()=>{aa.mod_scripts(o)},10 * o.attempts);
    else aa.log('could not load mod '+o.id)
  }
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
  l.append(' ',aa.mk.butt_action(mod.def.id+' del '+url,'del','del'));
  
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


// checks if string is only one character long
aa.is.one =s=>
{
  let a = s.split(' ');
  let seg = a[0];
  try { seg = [...new Intl.Segmenter().segment(a[0])] } 
  catch (error) { console.log('no Intl.Segmenter(), use a better browser')};
  if (seg.length === 1) return true;
  else return false
};


// perform cache operations and return results
aa.db.cash.ops =async o=> await aa.db.get('cash',o);


// perform indexeddb operations and return results
aa.db.idb.ops =async o=> await aa.db.get('idb',o);


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
  if (aa.is.iframe()) aa.l.classList.add('rigged');
  aa.wl.lock();
  aa.log((navigator.onLine ? 'on' : 'off') + 'line at '+location.origin);
  
  let u_u = aa.mk.l('aside',{id:'u_u',app:aa.mk.butt_expand('u_u','a_a')});
  u_u.append(aa.mod_l);
  document.body.insertBefore(u_u,document.body.lastChild);
  aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  setTimeout(aa.logs_read,420);
};


// wrapper for aa.parse functions
aa.parser =(parse_id,s,trust,regex_id)=>
{
  const df = new DocumentFragment();
  if (!regex_id) regex_id = parse_id;
  const matches = [...s.matchAll(aa.regex[regex_id])];
  let index = 0;
  for (const match of matches) 
  {
    df.append(match.input.slice(index,match.index));
    let parsed = aa.parse[parse_id](match,trust);
    let childs = parsed.childNodes.length;
    if (childs > 2) index = match.index + match.input.length;
    else index = match.index + match[0].length;
    df.append(parsed);
  }
  if (index < s.length) df.append(s.slice(index));
  return df
};


// reusable regex
aa.regex = 
{
  get an(){ return /^[A-Z_0-9]+$/i }, // alphanumeric
  get hashtag(){ return /(\B[#])[\w+-]*/g },
  get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi },
  get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi },
  get nostr(){ return /((nostr:)[A-Z0-9]{12,})\b/gi }, 
  get bech32(){ return /^[AC-HJ-NP-Z02-9]*/i }, //acdefghjklmnqprstuvwxyz987654320
  get url(){ return /https?:\/\/([a-zA-Z0-9\.\-]+\.[a-zA-Z]+)([\p{L}\p{N}\p{M}&\.-\/\?=#\-@%\+_,:!~\/\*]*)/gu },
  get str(){ return /"([^"]+)"/ }, // text in quotes ""
  get fw(){ return /(?<=^\S+)\s/ }, // first word
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


// converts string to URL and returns it or false
aa.is.url =s=>
{
  let url;
  try { url = new URL(s) } catch(er) {}
  return url
};


// parse url as link or media given trust
aa.parse.url =(match,tru)=>
{
  let l;
  const type = aa.fx.url_type(match[0]);
  if (tru && type[0] === 'img') l = aa.mk.img(type[1].href);
  else if (tru && type[0] === 'av') l = aa.mk.av(type[1].href);
  else if (type) l = aa.mk.link(type[1].href);
  return l
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


// cache worker for operations without response
aa.db.cash.worker = aa.db.cash.new;


// indexedDB worker for operations without response
aa.db.idb.worker = aa.db.idb.new;


// is hexadecimal
aa.is.x =s=> /^[A-F0-9]+$/i.test(s); 