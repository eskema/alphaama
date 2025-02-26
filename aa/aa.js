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
  temp:{},
  tools:
  [
    '/aa/clk.js?v='+aa_version,
    '/aa/is.js?v='+aa_version,
    '/aa/db.js?v='+aa_version,
    '/aa/fx.js?v='+aa_version,
    '/aa/mk.js?v='+aa_version,
    '/aa/mod.js?v='+aa_version,
    '/aa/wl.js?v='+aa_version,
    '/av/av.js?v='+aa_version,
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





// head scripts
aa.mk.scripts =async a=>
{
  for (const src of a) document.head.append(aa.mk.l('script',{src}));
};


// head styles
aa.mk.styles =async a=>
{
  let rel = 'stylesheet';
  for (const ref of a) document.head.append(aa.mk.l('link',{rel,ref}));
};


// append mod scripts when required mods have been loaded
aa.mk.mods =a=>
{
  for (const o of a)
  {
    if (aa.is.mods_loaded(o.requires))
    {
      let script = aa.mk.l('script',{src:o.src});
      document.head.append(script);
      script.addEventListener('load',e=>
      {
        if (aa.hasOwnProperty(o.id) && aa[o.id].hasOwnProperty('load')) 
          aa[o.id].load().then(()=>{aa[o.id].loaded = true})
      });
    }
    else 
    {
      if (!o.attempts) o.attempts = 1;
      else o.attempts++;
      if (o.attempts < 420) setTimeout(()=>{aa.mk.mods([o])},o.attempts);
      else aa.log('could not load mod '+o.id)
    }
  }
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


// if no options found, load with defaults
aa.load =async(o={})=>
{
  // setup document
  aa.l = document.documentElement;
  aa.mk.manifest();
  
  let styles = o.styles || aa.styles;
  
  let dependencies = o.dependencies || aa.dependencies;
  let tools = o.tools || aa.tools;
  let mods = o.mods || aa.mods;
  
  aa.mk.styles(styles);
  aa.mk.scripts([...dependencies,...tools]);
  
  aa.view = aa.mk.l('main',{id:'view'});
  aa.mod_l = aa.mk.l('div',{id:'mods'});
  aa.mk.mods(mods);

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
      action:['l','parse'],
      required:['stringified_object'],
      description:'parse stringified object as structured element',
      exe:aa.log_parse
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
  return true
};


// log stuff to l
aa.log =(s,l=false,is_new=true)=>
{
  let cla = 'l item'+(is_new?' is_new':'');
  const log = aa.mk.l('li',{cla,clk:aa.logs_read});
  if (typeof s === 'string') s = aa.mk.l('p',{con:s});
  log.append(s);
  if (!l) l = aa.logs || document.getElementById('logs');
  if (l) fastdom.mutate(()=>{l.append(log)});
  else console.log('log:',s);
  return log
};


// logs container element
aa.logs = aa.mk.l('ul',{id:'logs',cla:'list'});


aa.log_parse =(s='')=>
{
  aa.log(aa.mk.item('parse',aa.parse.j(s),'p'))
}


// mark log as read
aa.log_read =async l=>
{
  fastdom.measure(()=>
  {
    l.blur();
  });
  fastdom.mutate(()=>
  {
    l.classList.remove('is_new');
    l.classList.add('just_added');
  })
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


// do math with strings
aa.math =(s='')=>
{
  return math.evaluate(s)
};


// checks if required mods have loaded
aa.is.mods_loaded =required=>
{
  for (const id of required) 
    if (!aa.hasOwnProperty(id) || !aa[id].loaded) return false
  return true
};


// parse nip19 to render as mention or quote
aa.parse.nip19 =s=>
{
  let d = aa.fx.decode(s);
  if (!d) return s;
  let l;
  if (s.startsWith('npub1'))  l = aa.mk.p_link(d);
  else if (s.startsWith('nprofile1')) l = aa.mk.p_link(d.pubkey);
  else if (s.startsWith('note1')) l = aa.e.quote({"id":d});
  else if (s.startsWith('nevent1'))
  {
    if (d.id) 
    {
      d.s = s;
      l = aa.e.quote(d);
    }
    else l = aa.mk.l('span',{con:s+': '+JSON.stringify(d)})
  }
  else if (s.startsWith('naddr1'))
  {
    if (d.kind && d.pubkey && d.identifier)
    {
      d.s = s;
      d.id_a = `${d.kind}:${d.pubkey}:${d.identifier}`;
      l = aa.e.quote_a(d);
    }
    else l = aa.mk.l('span',{con:s+':'+JSON.stringify(d)})
  }
  else l = aa.mk.nostr_link(s);
  return l
};





// parse nostr:stuff
// use with aa.parser('nostr',s)
aa.parse.nostr =match=>
{
  let df = new DocumentFragment();
  df.append(match.input.slice(0,match.index)); 

  let matches = (match[0]).split('nostr:').join(' ').trim().split(' ');
  for (const m of matches)
  {
    let a = m.split('1');
    if (a[1])
    {
      let mm = a[1].match(aa.fx.regex.bech32);
      if (mm[0] && mm.index === 0)
      {
        let s = a[0] + '1' + mm[0];
        let decoded = aa.fx.decode(s);
        if (decoded)
        {
          df.append(aa.parse.nip19(s),' ');
          if (mm[0].length < mm.input.length)
          {
            df.append(mm.input.slice(mm[0].length),' ');
          }
        }
        else df.append(m,' ');
      }
    }
  }
  if (match[0].length < match.input.length)
  {
    df.append(match.input.slice(match[0].length),' ');
  }
  return df
};


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
  fastdom.mutate(()=>
  {
    document.body.insertBefore(u_u,document.body.lastChild.previousSibling);
  });

  if (aa.is.iframe()) aa.l.classList.add('rigged');
  
  aa.log((navigator.onLine ? 'on' : 'off') + 'line at '+location.origin);
  aa.asciidoc = Asciidoctor$$module$build$asciidoctor_browser();
  setTimeout(aa.state.pop,100);
  setTimeout(aa.logs_read,420);
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









// clear view
aa.state.clear =()=>
{
  if (aa.viewing)
  {
    const in_view = aa.l.querySelector('.in_view');
    if (in_view) 
    {
      // fastdom.mutate(()=>
      // {
        in_view.classList.remove('in_view');
        if (in_view.classList.contains('note'))
        {
          const in_path = aa.l.querySelectorAll('.in_path');
          if (in_path) for (const l of in_path) l.classList.remove('in_path');
        }
      // });
    }
  }
  // fastdom.mutate(()=>
  // {
    if (aa.state.l) aa.state.l.textContent = '';
    aa.l.classList.remove('viewing','view_e','view_p');
  // });

  aa.viewing = false;
  for (const c of aa.clears) c();
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
    // fastdom.mutate(()=>
    // {
      if (aa.state.l) aa.state.l.textContent = state;
    // })
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
    state = {view:view,last:last};
  }
  else 
  {
    last = history.state.last;
    state = {view:last,last:view};
  }
  history.pushState(state,'',location.origin+location.pathname+state.view);
  aa.state.pop();
};

window.addEventListener('popstate',aa.state.pop);