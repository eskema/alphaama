/*

alphaama
A<3   aa   
v3

*/
const aa_version = 48;

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
    '/dep/nostr-tools_2_10_4.js',
    // '/dep/nostr-tools.js?v=2.10.4',
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
  miss:{e:{},p:{},a:{}},
  mk:{},
  mods:
  [
    {id:'cli',src:'/c/c.js?v='+aa_version,requires:[]},
    {id:'o',src:'/o/o.js?v='+aa_version,requires:['cli']},
    {id:'p',src:'/p/p.js?v='+aa_version,requires:['o']},
    {id:'e',src:'/e/e.js?v='+aa_version,requires:['o']},
    {id:'r',src:'/r/r.js?v='+aa_version,requires:['p','e']},
    {id:'q',src:'/q/q.js?v='+aa_version,requires:['r']},
    {id:'i',src:'/i/i.js?v='+aa_version,requires:['p','e']},
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
  temp:{print:{},refs:{},orphan:{}},
  tools:
  [
    
    '/aa/fx.js?v='+aa_version,
    // '/aa/mk.js?v='+aa_version,
    '/av/av.js?v='+aa_version,
    // '/aa/db.js?v='+aa_version,
    // '/aa/state.js?v='+aa_version,
  ],
  ui:
  {
    last_top: 0,
  },
  viewing:false,
  view:false,
  views:[],
};



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
aa.is.an =s=> aa.fx.regex.an.test(s);


// make button
aa.mk.butt =sa=> 
{
  let con,cla,clk;
  if (Array.isArray(sa))
  {
    con = sa[0];
    if (sa[1]) 
    {
      cla = sa[1];
      if (sa[2]) clk = sa[2];
      else clk = cla;
    }
    else clk = cla = con;      
  }
  else clk = cla = con = sa;
  return aa.mk.l('button',{con:con,cla:'butt '+cla,clk:aa.clk[clk]});
};


// button that toggles the class 'expanded'
aa.mk.butt_expand =(id,con=false)=>
{
  const butt = aa.mk.l('button',
  {
    con:con||id,
    cla:'butt',
    id:'butt_'+id,
    clk:aa.clk.expand
  });
  butt.dataset.controls = id
  return butt
};


// make event wrapper object
aa.mk.dat =(o={})=>
{
  const dat ={};
  dat.event = o.event ?? {};
  dat.seen = o.seen ?? [];
  dat.subs = o.subs ?? [];
  dat.clas = o.clas ?? [];
  dat.refs = o.refs ?? [];
  return dat
};

// web cache worker
aa.db.cash = { get new(){ return new Worker('/cash.js')} };


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

        if (aa.fx.regex.url.test(word)) 
        {
          let dis_node = aa.parser('url',word,trusted);
          l.append(dis_node,' ');
        }
        else if (aa.fx.regex.nostr.test(word)) 
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
        else if (aa.fx.regex.hashtag.test(word)) 
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


// count items in db store
aa.db.count =async(s='')=>await aa.db.get('idb',{count:{store:s,key:''}});


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


// make details element
aa.mk.details =(s,l=false,open=false)=>
{ 
  const details = aa.mk.l('details');
  if (open) details.open = true;
  const summary = aa.mk.l('summary',{con:s});
  details.append(summary);
  if (!l) return details;
  details.append(l);
  // let is_empty = l.classList.contains('empty'); 
  // if (is_empty) details.classList.add('empty');
  if (open) details.open = true;
  else if (l.classList.contains('list')) summary.dataset.after = l.childNodes.length;
  return details;
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


// get the dialog element or create it if not found
aa.mk.dialog =()=>
{
  let dialog = document.getElementById('dialog');
  if (!dialog) 
  {
    dialog = aa.mk.l('dialog',{id:'dialog'});
    document.body.insertBefore(dialog,document.body.lastChild.previousSibling);
    dialog.addEventListener('close',e=>
    {
      dialog.removeAttribute('title');
      dialog.textContent = '';
    });
  }
  return dialog
};


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


// checks if page is loading from iframe
aa.is.iframe =()=>
{
  try {return window.self !== window.top} 
  catch(er) {return true}
};


// make generic image
aa.mk.img =(src)=>
{
  const l = aa.mk.l('img',{cla:'content-img',src:src});
  l.loading = 'lazy';
  l.addEventListener('click',e=>{aa.mk.img_modal(src)});
  return l
};


// show image in modal on click
aa.mk.img_modal =(src,cla=false)=>
{
  const dialog = aa.mk.dialog();
  const img = aa.mk.l('img',
  {
    cla:'modal-img contained'+(cla?' '+cla:''),
    src:src,
    clk:e=>{dialog.close()}
  });
  dialog.append(
    aa.mk.l('button',
    {
      con:'full',
      cla:'butt modal',
      clk:e=>
      {
        let text = e.target.textContent;
        e.target.textContent = e.target.textContent === 'full' 
        ? 'contained' 
        : 'full';
        img.classList.toggle('contained')
      }
    }),
    img
  );
  dialog.showModal();
};


// make generic list item from key : value
aa.mk.item =(k='',v,tag_name='li')=>
{
  let l = aa.mk.l(tag_name,{cla:'item item_'+k});
  if (Array.isArray(v))  
  {
    if (typeof v[0]!=='object')
    {
      if (k) l.append(aa.mk.l('span',{cla:'key',con:k}),' ');
      l.append(aa.mk.l('span',{cla:'val',con:v.join(', ')}));
    }
    else 
    {
      let list = aa.mk.ls({});
      if (v.length) list.classList.remove('empty');
      for (let i=0;i<v.length;i++) 
      {
        list.append(aa.mk.item(''+i,v[i]));
      }
      l.append(aa.mk.details(k,list));
    }
  }
  else if (v && typeof v==='object') 
  {
    l.append(aa.mk.details(k,aa.mk.ls({ls:v})))
  }
  else 
  {
    if (v === null) v = 'null';
    if (k) l.append(aa.mk.l('span',{cla:'key',con:k}),' ');
    l.append(aa.mk.l('span',{cla:'val',con:v}));
  }
  return l
};


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


// make a regular link
aa.mk.link =(url,text=false,title=false)=>
{
  let l;
  if (!text) text = url;
  if (aa.is.url(url))
  {
    l = aa.mk.l('a',{cla:'content_link',ref:url,con:text});
    l.rel = 'noreferrer noopener';
    l.target = '_blank';
  }
  else l = aa.mk.l('span',{cla:'content_link',con:text});
  if (title) l.title = title;
  
  return l
};


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
  aa.tools_loaded = o.tools ? o.tools : aa.tools;
  aa.head_scripts([...aa.dependencies_loaded,...aa.tools_loaded]);
  
  aa.l = document.documentElement;
  aa.view = aa.mk.l('main',{id:'view'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  aa.mod_loaded = o.mods ? o.mods : aa.mods;
  for (const mod_o of aa.mod_loaded) aa.mod_scripts(mod_o);

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
    {
      action:['db','count'],
      required:['store'],
      optional:['key_range'],
      exe:aa.db.count
    }
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
    aa.fx.scroll(log);
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


// make list element from object
aa.mk.ls =o=>
{
  // o = 
  // { 
  //   id:string,
  //   cla:string,
  //   l:element,
  //   ls:object,
  //   sort:string,
  //   mk:function 
  // }

  let l = o.l;
  if (!l)
  {
    l = aa.mk.l('ul',{cla:'list'});
    if (o.id) l.id = o.id;
    if (o.cla) l.classList.add(...o.cla.split(' '));
  }
  l.textContent = '';
  
  if (o.ls) 
  {
    let keys = Object.keys(o.ls);
    if (keys?.length)
    {
      if (o.sort) keys = keys.sort(aa.fx.sorts[o.sort]);
      for (const k of keys)
      {
        const v = o.ls[k];
        l.append( o.hasOwnProperty('mk') ? o.mk(k,v) : aa.mk.item(k,v));
      }
    }
  }
  else l.classList.add('empty');
  return l
};


aa.math =(s='')=>
{
  return math.evaluate(s)
};


// make mod
aa.mk.mod =mod=>
{
  let o = {id:mod.def.id,ls:mod.o.ls,sort:'a'};
  if (mod.hasOwnProperty('mk')) o.mk = mod.mk;
  let mod_l = aa.mk.details(mod.def.id,aa.mk.ls(o));
  mod_l.classList.add('mod');
  if (mod.l) 
  {
    mod.l.replaceWith(mod_l);
    mod.l = mod_l;
  }
  else 
  {
    mod.l = mod_l;
    if (aa.mod_l) 
    {
      const last = [...aa.mod_l.children]
      .filter(i=> o.id < i.querySelector('summary').textContent)[0];
      aa.mod_l.insertBefore(mod_l,last);
    }
    else aa.log(mod_l)
  }
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
aa.is.mod_loaded =required=>
{
  for (const id of required) if (!aa.hasOwnProperty(id)) return false
  return true
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
  // console.log(o);
  if (aa.is.mod_loaded(o.requires))
  {
    let script = aa.mk.l('script',{src:o.src});
    document.head.append(script);
    script.addEventListener('load',e=>
    {
      if (aa.hasOwnProperty(o.id)
      && aa[o.id].hasOwnProperty('load')) aa[o.id].load()
    });
  }
  else 
  {
    if (!o.attempts) o.attempts = 1;
    else o.attempts++;
    if (o.attempts < 420) setTimeout(()=>{aa.mod_scripts(o)},o.attempts);
    else aa.log('could not load mod '+o.id)
  }
};


// add server item with sets to mod
aa.mod_servers_add =(mod,s='',cla='server')=>
{
  const as = s.split(',');
  const valid = [];
  const invalid = [];
  const off = [];
  let len = as.length;
  if (len)
  {
    let pa = aa.mk.l('p');
    let details = aa.mk.details(`${len} ${aa.fx.plural(len,cla)}`,pa);
    let haz;
    for (const i of as) 
    {
      let a = i.trim().split(' ');
      let url_string = a.shift().trim();
      const url = aa.is.url(url_string)?.href;
      if (url)
      {
        if (!mod.o.ls[url]) mod.o.ls[url] = {sets:[]};
        let updd = aa.fx.a_add(mod.o.ls[url].sets,a);
        let sets = aa.r.o.ls[url].sets.join(' ');
        if (updd)
        {
          haz = true;
          aa.mod_ui(mod,url);
          aa.fx.a_add(valid,[url]);
          let text = `\nadded: ${url} ${sets}`;
          if (a.includes('off')) 
          {
            aa.fx.a_add(off,[url]);
            text = `\noff: ${url} ${sets}`;
          }
          pa.append(text)
        }
      }
      else 
      {
        haz = true;
        aa.fx.a_add(invalid,[url]);
        pa.append(`\ninvalid: ${url}`)
      }
    }
    if (haz) aa.log(details);
  }
  aa.mod_save(mod);
  return [valid,invalid,off]
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
  const as = s.split(',');
  if (as.length)
  {
    for (const i of as) 
    {
      let a = i.trim().split(' ');
      let url_string = a.shift().trim();
      const url = aa.is.url(url_string)?.href;
      const server = mod.o.ls[url];
      if (!server) return;
      server.sets = aa.fx.a_rm(server.sets,a);
      aa.mod_ui(mod,url);
    }
  }

  // const work =a=>
  // {
  //   let url_string = a.shift().trim();
  //   const url = aa.is.url(url_string)?.href;
  //   const server = mod.o.ls[url];
  //   if (!server) return;
  //   server.sets = aa.fx.a_rm(server.sets,a);
  //   aa.mod_ui(mod,url);
  // };
  // aa.fx.loop(work,s);
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


// log a notice
aa.mk.notice =o=>
{
// o =
// {
//   title:'',
//   description:'',
//   butts:
//   {
//    no:{title:'',exe:()=>{}},
//    yes:{title:'',exe:()=>{}},
//   }
// }

  let l = aa.mk.l('div',{cla:'notice'});
  if (o.hasOwnProperty('id')) 
  {
    l.id = o.id;
  }
  if (o.hasOwnProperty('title')) 
  {
    l.append(aa.mk.l('p',{cla:'title',con:o.title}));
  }
  if (o.hasOwnProperty('description')) 
  {
    l.append(aa.mk.l('p',{cla:'description',con:o.description}));
  }
  for (const b in o.butts)
  {
    let bt = o.butts[b];
    l.append(aa.mk.l('button',{con:bt.title,cla:'butt '+b,clk:bt.exe}));
  }
  return l
};


// make a nostr link
aa.mk.nostr_link =(s='',con=false)=>
{
  const a = aa.mk.l('a',
  {
    cla:'nostr_link',
    con:con||s.slice(0,12),
    ref:'#'+s,
    // clk:aa.clk.a
  });
  setTimeout(()=>{
    a.addEventListener('click',aa.clk.a)
  },200);

  if (!s) 
  {
    a.removeAttribute('href');
    a.classList.add('empty');
  }
  return a
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


// wrapper for aa.parse functions
aa.parser =(parse_id,s,trust,regex_id)=>
{
  const df = new DocumentFragment();
  if (!regex_id) regex_id = parse_id;
  const matches = [...s.matchAll(aa.fx.regex[regex_id])];
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


// qr code
aa.mk.qr =s=>
{
  let l = aa.mk.l('div',{cla:'qrcode'});
  aa.temp.qr = new QRCode(l,
  {
    text:s.trim(),
    width: 512,
    height: 512,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  let img = l.querySelector('img');
  img.classList.add('qr');
  img.addEventListener('click',e=>{aa.mk.img_modal(img.src,'qr')});
  return img
};


// reusable regex
aa.fx.regex = 
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
  document.body.prepend(aa.mk.header(),aa.view);
  let u_u = aa.mk.l('aside',{id:'u_u',app:aa.mk.butt_expand('u_u','a_a')});
  u_u.append(aa.mod_l);
  document.body.insertBefore(u_u,document.body.lastChild.previousSibling);

  if (aa.is.iframe()) aa.l.classList.add('rigged');
  aa.wl.lock();
  aa.log((navigator.onLine ? 'on' : 'off') + 'line at '+location.origin);
  aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  setTimeout(aa.state.pop,100);
  setTimeout(aa.logs_read,420);
};


// make section element
aa.mk.section =(id,expanded=false,l=false)=>
{
  const section = aa.mk.l('section',{id:id});
  if (expanded) section.classList.add('expanded');
  const section_header = aa.mk.l('header');
  section_header.append(aa.mk.butt_expand(id));
  section.append(section_header);
  aa.view.append(section);
  if (l) section.append(l);
  return section
};


// make server item
aa.mk.server =(k,v)=>
{
  k = aa.is.url(k);
  if (!k) return false;

  const l = aa.mk.l('li',{cla:'item server'});
  const url_l = aa.mk.l('p',{cla:'url'});
  url_l.append(
    aa.mk.l('span',{cla:'protocol',con:k.protocol+'//'}),
    aa.mk.l('span',{cla:'host',con:k.host}),
    aa.mk.l('span',{cla:'pathname',con:k.pathname}),
    aa.mk.l('span',{cla:'hashsearch',con:k.hash+k.search})
  ); 
  l.append(url_l); 
  if (v.sets && v.sets.length) l.dataset.sets = v.sets;   
  return l
};


// sorting functions to use in .sort()
aa.fx.sorts =
{
  a(a,b){ return a.localeCompare(b)},
  d(a,b){ return b.localeCompare(a)},
  asc(a,b){ return a[1] - b[1] ? 1 : -1 },
  desc(a,b){ return b[1] - a[1] ? 1 : -1 },
  i_asc(a,b)
  {
    let a_val = parseInt(a.querySelector('.val').textContent);
    let b_val = parseInt(b.querySelector('.val').textContent);
    return a_val > b_val ? 1 : -1
  },
  i_desc(a,b)
  {
    let a_val = parseInt(a.querySelector('.val').textContent);
    let b_val = parseInt(b.querySelector('.val').textContent);
    return a_val < b_val ? 1 : -1
  },
  rand(){ return ()=> 0.5 - Math.random() },
  sets(a,b)
  {
    return a[1].sets.length < b[1].sets.length ? 1 : -1
  },
  text_asc(a,b)
  {
    let a_val = a.textContent.toLowerCase();
    let b_val = b.textContent.toLowerCase();
    return a_val > b_val ? 1 : -1
  },
  text_desc(a,b)
  {
    let a_val = a.textContent.toLowerCase();
    let b_val = b.textContent.toLowerCase();
    return a_val < b_val ? 1 : -1
  },
  ca_asc(a,b)
  {
    let a_val = a.event.created_at;
    let b_val = b.event.created_at;
    return a_val > b_val ? 1 : -1
  },
  ca_desc(a,b)
  {
    let a_val = a.event.created_at;
    let b_val = b.event.created_at;
    return a_val < b_val ? 1 : -1
  },
  len(a,b){ return b[1].length > a[1].length ? 1 : -1 },
  len_desc(a,b){ return b[1].length > a[1].length ? -1 : 1 },
};


// add stylesheet
aa.mk.styleshit =s=>
{
  let l = aa.mk.l('link',{rel:'stylesheet',ref:s});
  document.head.append(l);
  return l
};


// converts string to URL and returns it or false
aa.is.url =s=>
{
  let url;
  try {url = new URL(s)}catch(er){}
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



// internal links
aa.clk.a =e=>
{
  e.preventDefault();
  let dis = e.target.getAttribute('href');
  if (dis==='/') dis = '';
  aa.state.view(dis);
};


// clear view
aa.state.clear =()=>
{
  if (aa.viewing)
  {
    const in_view = aa.l.querySelector('.in_view');
    if (in_view) 
    {
      in_view.classList.remove('in_view');
      if (in_view.classList.contains('note'))
      {
        const in_path = aa.l.querySelectorAll('.in_path');
        if (in_path) for (const l of in_path) l.classList.remove('in_path');
      }
    }
  }
  if (aa.state.l) aa.state.l.textContent = '';
  aa.l.classList.remove('viewing','view_e','view_p');
  aa.viewing = false;
  for (const c of aa.clear) c();
};


// on load
aa.mk.header =e=>
{
  const header = aa.mk.l('header',{id:'header'});
  const caralho =  aa.mk.l('a',
  {
    id:'caralho',
    ref:'/',
    con:'A<3',
    tit:'vai pró caralho',
    clk:aa.clk.a
  });
  const state = aa.mk.l('h1',{id:'state',con:'dickbutt'});
  state.dataset.pathname = location.pathname;
  aa.state.l = state;
  header.append(caralho,state);
  return header
};


// pop state into view
aa.state.pop =()=>
{
  let hash = location.hash;
  let search = location.search;
  if (hash.length) [hash,search] = location.hash.split('?');
  if (!search) search = '';
  let no_state = !history.state || !history.state.hasOwnProperty('view')
  || history.state === '';
  if (no_state) aa.state.view(hash,search);
  else 
  {
    aa.state.clear();
    const state = history.state.view;
    if (state.length) 
    {
      document.title = 'A<3 '+state;
      aa.state.resolve(state,search);  
    }
    else document.title = 'alphaama';
    if (aa.state.l) aa.state.l.textContent = state;
  }
};


// replace state
aa.state.replace =s=>
{
  const dis = history.state;
  dis.view = s;
  const hash_is_h = dis.view.length ? dis.view : '';
  const path = location.origin+location.pathname+hash_is_h;
  history.replaceState(dis,'',path);
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
      setTimeout(()=>{aa.views[v](s)},100);
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
    state = {view:view,last:last};

  }
  else 
  {
    last = history.state.last;
    state = {view:last,last:view};
    // history.pushState(dis,'',path);
    // aa.state.pop()
  }
  history.pushState(state,'',location.origin+location.pathname+state.view);
  aa.state.pop();
  // history.back();
};

window.addEventListener('popstate',aa.state.pop);
// window.addEventListener('load',aa.state.load);