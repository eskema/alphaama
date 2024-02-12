const it =
{
  todo:{},
};

it.to =(f,t,s)=>
{
  clearTimeout(it.todo[s]);
  it.todo[s] = setTimeout(f,t);
};

it.clk ={};

it.clk.a =e=>
{
  e.preventDefault();
  let dis = e.target.getAttribute('href');
  if (dis.startsWith('#')) dis = dis.slice(1);
  v_u.state(dis);
};

it.clk.expanded =e=>
{
  e.stopPropagation();
  let mom = document.getElementById(e.target.dataset.controls) ?? e.target;
  if (mom) 
  {
    mom.classList.toggle('expanded');
    v_u.scroll(mom,{behavior:'smooth'})
  }
};

it.clk.clkd =l=>
{
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};

it.s ={};

it.s.rigged =()=>
{
  try {return window.self !== window.top} 
  catch(er) {return true}
};

it.s.trusted =trust=>
{
  const trust_needed = parseInt(localStorage.trust);
  if (trust && trust_needed && trust >= trust_needed) return true;
  return false
};

it.s.one =s=>
{
  let a = s.split(' ');
  let seg = a[0];
  try { seg = [...new Intl.Segmenter().segment(a[0])] } 
  catch (error) { console.log('no Intl.Segmenter(), use a better browser')};
  if (seg.length === 1) return true;
  else return false
};

it.s.url =s=>
{
  let url;
  try{ url = new URL(s) } 
  catch(er){ console.log('not url '+s) };
  return url
};

it.s.media =s=>
{
  let url = it.s.url(s); 
  if (!url) return false;
  
  const src = url.origin + url.pathname;
  const low = src.toLowerCase();
  const is_img = ['jpg','jpeg','gif','webp','png'];
  const is_av = ['mp3','mp4','mov','webm'];
  const check_ext =extensions=>
  {
    for (const ext of extensions)
    {
      if (low.endsWith('.'+ext)
      || (url.searchParams.has('format') && url.searchParams.get('format') === ext)) 
      return true
    }
    return false
  };
   
  return check_ext(is_img) ? ['img',url] : check_ext(is_av) ? ['av',url] : ['link',url]
};

it.s.tag =(i,v,a)=> a[i] && a[i] === v; //index value in array
it.s.an =s=> /^[A-Z_0-9]+$/i.test(s); //alphanumeric and underscore
it.s.x =s=> /^[A-F0-9]+$/i.test(s); //hexadecimal
it.s.key =x=> it.s.x(x) && x.length === 64; //valid nostr key

it.tag ={};
it.tag.marked =(s,a)=> a[3] && a[3] === s; 
it.tag.e =a=> it.s.tag(0,'e',a) && it.s.x(a[1]);
it.tag.p =a=> it.s.tag(0,'p',a) && it.s.x(a[1]);
it.tag.root =a=> it.tag.e(a) && it.tag.marked('root',a);
it.tag.reply =a=> it.tag.e(a) && it.tag.marked('reply',a);

it.fx ={};

it.fx.an =s=>
{
  s = s.replace(/[^a-z0-9]/gi,'_').toLowerCase();
  while (s.includes('__')) { s = s.replace('__','_') }
  if (s.startsWith('_')) s = s.slice(1);
  if (s.endsWith('_')) s = s.slice(0,-1);
  return s
};

it.loop =(job,s,done)=>
{
  const a = s.split(',').map(v=>v.trim());
  if (a.length)
  {
    for (const task of a) job(task.split(' '));
    done();
  }
};

it.loopita =(a,if_1,if_2)=>
{
  const b = [];
  const times = a.length
  for (let i=0;i<times;i++) 
  {
    if (if_1(a[i]))
    {
      if (if_2(a[i])) return a[i];
      b.push(a[i])
    }
  }
  return b
};

it.fx.tail =(a,l,i=1)=>
{
  if (a.length > i) l.dataset.tail = a.slice(i).join(', ');
};

it.fx.trunk =(s,sep='…',num=3)=> s.slice(0,num)+sep+s.slice(-num);

it.fx.to_rgb =x=>
{
  return parseInt(x.slice(0,2),16)
    +','+parseInt(x.slice(2,4),16)
    +','+parseInt(x.slice(4,6),16)
};

it.fx.luma =rgb=>
{
  const [r,g,b] = rgb.split(',');
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128 ? 'dark' : 'light';
};

it.fx.rm_leading_zero =x=>
{
  try{ return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/,(xx,x_x)=>x_x) } 
  catch(er){ return x }  
};

it.fx.color =(x,l)=> 
{ 
  const rgb = it.fx.to_rgb(it.fx.rm_leading_zero(x));
  l.style.setProperty('--c',rgb);
  l.dataset.luma = it.fx.luma(rgb);
};

it.fx.nid =x=> NostrTools.nip19.noteEncode(x);
it.fx.npub =x=> NostrTools.nip19.npubEncode(x);
it.fx.decode =x=> NostrTools.nip19.decode(x).data;
it.fx.hash =o=> NostrTools.getEventHash(o);
it.fx.verify =o=> NostrTools.verifyEvent(o);
it.fx.verify_filter =o=>
{
  // ids, authors, kinds, 
  for (const k in o)
  {
    if (k === 'since' 
    || k === 'until' 
    || k === 'limit')
    {
      if (!Number.isInteger(o[k]) || o[k] === 0) return false
    }
    else if (k === 'ids' 
    || k === 'authors' 
    || k === '#p'
    || k === '#e')
    {
      const v = o[k];
      if (Array.isArray(v))
      {
        for (const val of v)
        {
          if (!it.s.x(val)) return false
        }
      }
      else return false
    }
    else if (k.startsWith('#'))
    {
      const v = o[k];
      if (Array.isArray(v))
      {
        for (const val of v)
        {
          if (!typeof val === 'string') return false
        }
      }
      else return false
    }
    else if (k === 'kinds')
    {
      const v = o[k];
      if (Array.isArray(v))
      {
        for (const val of v)
        {
          if (!Number.isInteger(val)) return false
        }
      }
      else return false
    }
  }
  return true
};

it.fx.in_path =(l,k=false)=>
{
  for (;l&&l!==document;l=l.parentNode) 
  {
    if (l.classList.contains('note'))
    {
      l.classList.add('in_path');
      if (k) 
      {
        let a = l.dataset.path ? l.dataset.path.trim().split(' ') : [];
        it.a_set(a,[k]);
        l.dataset.path = a.join(' ');
      }
    }
  }
};

it.fx.rm_path =k=>
{
  let in_path = document.querySelectorAll('.in_path');
  if (in_path) for (const l of in_path)
  {
    let a = it.a_rm(l.dataset.path.trim().split(' '),[k]);
    if (a.length) l.dataset.path = a.join(' ');
    else l.classList.remove('in_path')
  }
};

it.get_tags_for_reply =(event)=>
{  
   const tags = [];
   const seen = it.get_seen(event.id);
   let root_tag = it.get_root_tag(event.tags);
   if (root_tag.length) 
   {
      // console.log(root_tag);
      if (!root_tag[2] || root_tag[2] === '')
      {
        root_tag[2] = seen;
      }
      if (!root_tag[3] || root_tag[3] !== 'root')
      {
        root_tag[3] = 'root';
      }
      tags.push(root_tag);
      tags.push(['e',event.id,seen,'reply']);
   }
   else tags.push(['e',event.id,seen,'root']);
   const pubkeys_to_add = [];
   const pubkeys = event.tags.filter(t=>it.tag.p(t) && t[1] !== aka.o.ls.xpub);
   
   for (const pub of pubkeys) pubkeys_to_add.push(pub)

   let unique = [...new Set(pubkeys)];
   if (event.pubkey !== aka.o.ls.xpub && !unique.some(t=>t[1] === event.pubkey)) unique.push(['p',event.pubkey])
   tags.push(...unique);

   return tags
};

it.get_reply_tag =tags=>
{
  const a = it.loopita(tags, it.tag.e, it.tag.reply);
  
  let is_array = Array.isArray(a[0]);
  if (a && !is_array) return a;
  if (is_array)
  {
    let l = a[a.length-1];
    if (it.tag.marked('mention',l)) return false;
    return l
  }
  return false
};

it.get_root_tag =tags=>
{
  const a = it.loopita(tags, it.tag.e, it.tag.root);
  
  let is_array = Array.isArray(a[0]);
  if (a && !is_array) return a;
  if (is_array)
  {
    let l = a[0];
    if (it.tag.marked('mention',l)) return false;
    return l
  }
  return false
};

it.get_seen =(x)=>
{
  const dat = aa.e[x];
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
};

it.tim ={};
it.tim.std =st=> new Date(st*1000);

it.tim.date =date_string=>
{
  try { return Date.parse(date_string) / 1000 } 
  catch (er) { return false }
};

it.tim.format =d=>
{ 
  return d.getFullYear()
  +'/'+ (d.getMonth()+1+'').padStart(2,'0') 
  +'/'+ (d.getDate()  + '').padStart(2,'0') 
  +' '+ (d.getHours() + '').padStart(2,'0') 
  +':'+ (d.getMinutes()+'').padStart(2,'0') 
  +':'+ (d.getSeconds()+'').padStart(2,'0')
};

it.tim.now =()=> Math.floor(Date.now() / 1000);

it.tim.ago =date=>
{
  const dis =i=> (Math.floor(i)+'').padStart(2,'0');
  const sec = Math.floor((new Date() - date) / 1000);
  let i = sec / 31536000;
  if (i > 1) return dis(i)+'Y';
  i = sec / 2592000;
  if (i > 1) return dis(i)+'M';   
  i = sec / 86400;
  if (i > 1) return dis(i)+'d';
  i = sec / 3600;
  if (i > 1) return dis(i)+'h';
  i = sec / 60;
  if (i > 1) return dis(i)+'m';
  return dis(sec)+'s';
};

it.tim.time =s=>
{
  if (s.startsWith('n_')) return it.tim.n(s.slice(2));
  if (s.startsWith('d_')) return it.tim.date(s.slice(2));
  if (s === 'now') return it.tim.now();    
  return parseInt(s)
};

it.tim.n =number=>
{
  const days = new Date();
  days.setDate(days.getDate() - number);
  return Math.floor(days.getTime()/1000)
};

it.tim.e =st=> it.tim.format(it.tim.std(st));

it.a_set =(a,dis)=>
{
  let b;
  if (Array.isArray(a) && Array.isArray(dis))
  {
    for (const k of dis)
    { 
      if (!a.includes(k)) 
      {
        a.push(k);
        b = true;
      }
    }
  }
  return b
};

it.a_dataset =(l,set,dis)=>
{
  let a = l.dataset[set] ? l.dataset[set].trim().split(' ') : [];
  it.a_set(a,dis);
  l.dataset[set] = a.join(' ');
};

it.a_rm =(a,dis)=>
{
  for (const s of dis) 
  { 
    if (a.includes(s)) a = a.filter((i)=>i!==s) 
  }
  return a
};

it.fx.merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let merged,sets = ['seen','subs','clas','refs'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set]=[]; merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (it.a_set(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false
};

it.fx.merge_datasets =(a,b,c)=>
{
  if (a.length) for (const set of a)
  {
    if (b.dataset[set])
    {
      let sets = c.dataset[set] ? c.dataset[set].trim().split(' ') : [];
      it.a_set(a,b.dataset[set].trim().split(' '));
      c.dataset[set] = sets.join(' ');
    }
  }
};

it.fx.a =a=>
{
  const type = a[0];
  const value = a[1];
  const l = it.mk.l('a',{cla:'tag_a_'+type,clk:it.clk.a});
  switch(type)
  {
    case 'e':
      let relay = a[2];
      const nid = it.fx.nid(value);
      l.textContent = nid;
      l.href = '#'+nid;
      if (relay) l.dataset.relay = relay;
      it.fx.tail(a,l,3);
      break;
    case 'p':
      relay = a[2];
      const petname = a[3];
      const npub = it.fx.npub(value);
      l.textContent = npub;
      l.href = '#'+npub;
      if (relay) l.dataset.relay = relay;
      if (petname) l.dataset.petname = petname;
      it.fx.tail(a,l,4);
      break;
    default:
      l.textContent = s;
      l.href = '#'+s;
      it.fx.tail(a,l,2);
  }
  return l
};

it.fx.vars =(s)=>
{
  let o = it.parse.j(s),options = {};  
  const aka_p = aa.p[aka.o.ls.xpub];
  if (!aka_p) 
  {
    v_u.log('no aka, so no vars in qe...');
    return [false,false];
  }
  if (o) for (const k in o) 
  {
    const v = o[k];
    switch (k)
    {
      case 'eose':
        options.eose = v;
        delete o[k];
        break;

      case 'since':
      case 'until':
        if (typeof v === 'string') o[k] = it.tim.time(v);
        break;
      
      default:
        if (typeof v === 'object') for (let i=0;i<v.length;i++)
        {
          const val = v[i];
          if (typeof val === 'string') 
          { 
            switch (val) 
            {
              case 'aka': 
                o[k][i] = aka_p.xpub; 
                break;

              case 'bff':
              case 'k3': 
                o[k] = o[k].filter((dis)=>dis!==val);
                o[k].push(...aka_p.extradata.bff);                    
                break;
            }
          }
        }
    }
  }
  if (!Object.keys(options).length) options = false
  return [o,options]
};

it.fx.sorts =(a,s)=>
{
  let ab = a;
  switch (s)
  {
    case 'desc': ab = a.sort((a,b)=> b[1] - a[1]);break;
    case 'asc': ab = a.sort((a,b)=> a[1] - b[1]);break;
    case 'rand': ab = a.sort(()=> 0.5 - Math.random());break;
  }
  return ab
};

it.fx.sort_relays_by_sets_len =(a,b)=>
{
  if (a[1].sets.length > b[1].sets.length) return -1;
  else return 1
};

it.tog =(s,l=false)=>
{
  let dis = l ? l : aa.l;
  dis.classList.toggle(s);
}

it.mk ={};
it.mk.l =(tag_name,o=false)=>
{
  const l = document.createElement(tag_name);
  if (o && typeof o === 'object') 
  {
    if (o.con) l.textContent = o.con;
    if (o.id)  l.id = o.id;
    if (o.cla) l.className = o.cla;
    if (o.bef) l.dataset.before = o.bef;
    if (o.aft) l.dataset.after = o.aft;
    if (o.ref) l.href = o.ref;
    if (o.src) l.src = o.src;
    if (o.tit) l.title = o.tit;
    if (o.app) l.append(o.app);
    if (o.clk) l.addEventListener('click',o.clk);
    if (o.nam) l.name = o.nam;
    if (o.val) l.value = o.val;
    if (o.pla) l.placeholder = o.pla;
  }
  return l
}; 

it.mk.mod =mod=>
{
  let o = {id:mod.o.id,ls:mod.o.ls};
  if (mod.hasOwnProperty('mk')) o.mk = mod.mk;
  mod.l = it.mk.ls(o);
  const u = document.getElementById('u');
  if (u) u.append(it.mk.details(mod.o.id,mod.l,1))
};

it.mk.link =(url,text=false,title=false)=>
{
  if (!text) text = url;
  let l = it.mk.l('a',{cla:'content_link',ref:url,con:text});
  if (title) l.title = title;
  l.rel = 'noreferrer noopener';
  l.target = '_blank';
  return l
};

it.p =xpub=>
{
  return {
    xpub:xpub,
    relay:'',
    petname:'',
    npub: it.fx.npub(xpub),
    trust:0,
    updated:0,
    verified:[], // [result,date]
    sets:[],
    rels:{},
    extradata:
    {
      bff:[],
      relays:[],
      followers:[],
      petnames:[],
      lists:[],
    },
    pastdata: //[[id,created_at],...]
    { 
      k0:[],
      k3:[],
      k10002:[],
    },
  }
};

it.mk.author =(xpub,p=false)=>
{
  if (!p) p = aa.p[xpub];
  if (!p) p = it.p(xpub);
  
  const pubkey = it.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+' \n '+xpub,
    ref:'#'+p.npub,
    clk:it.clk.a,
  });
  let name_s = p.metadata?.name ?? p.npub.slice(0,12);
  let name = it.mk.l('span',{cla:'name',con:name_s});
  let petname = p.petname.length ? p.petname : p.extradata.petnames.length ? p.extradata.petnames[0] : false;
  if (petname) name.dataset.petname = petname;
  
  pubkey.append(name);
  it.fx.color(p.xpub,pubkey);
  author.link(pubkey,p);
  return pubkey
};

it.mk.details =(summary,l=false,open=false)=>
{  
  const details = it.mk.l('details');
  const summary_l = it.mk.l('summary',{con:summary});
  details.append(summary_l);
  if (l)
  {
    details.append(l);
    if (l.classList.contains('empty')) details.classList.add('empty');
    else if (l.classList.contains('list')) 
    summary_l.dataset.after = l.childNodes.length;
  }
  if (open) details.open = true;
  return details
};

it.mk.ls =o=>
{
  const l = o.l ? o.l : it.mk.l('ul',{cla:'list'});
  l.textContent = '';
  if (o.id) l.id = o.id;
  if (o.cla) l.classList.add(...o.cla.split(' '));
  if (o.ls && Object.keys(o.ls).length) 
  {
    let a = Object.entries(o.ls);
    if (o.sort) it.fx.sorts(a,o.sort);
    for (let i=0;i<a.length;i++)
    {
      const [k,v] = a[i];
      l.append( o.hasOwnProperty('mk') ? o.mk(k,v) : it.mk.item(k,v));
    }
  }
  else l.classList.add('empty');
  return l
};

it.mk.item =(k,v,tagname='li')=>
{
  let l = it.mk.l(tagname,{cla:'item item_'+k});

  if (Array.isArray(v)) 
  {
    l.append
    (
      it.mk.l('span',{cla:'key',con:k}),
      it.mk.l('span',{cla:'val',con:v.join(', ')})
    )
  }
  else if (typeof v==='object')
  {
    l.append(it.mk.details(k,it.mk.ls({ls:v})));
  }
  else 
  {
    l.append
    (
      it.mk.l('span',{cla:'key',con:k}),
      it.mk.l('span',{cla:'val',con:v})
    )
  }
  return l
};

it.mk.time =timestamp=>
{
  const d = it.tim.std(timestamp);
  const l = it.mk.l('time',
  {
    cla:'created_at',
    tit:it.tim.ago(d),
    con:it.tim.format(d)+' '+timestamp,
    clk:e=> e.target.title = it.tim.ago(it.tim.std(e.target.dataset.timestamp))
  });   
  
  l.dataset.timestamp = timestamp;
  l.setAttribute('datetime', d.toISOString());
  return l
};

it.mk.butt =l=>
{
  const id = l.id;
  const butt = it.mk.l('button',
  {
    con:id,
    cla:'butt',
    id:'butt_'+id,
    clk:it.clk.expanded
  });
  butt.dataset.controls = id
  return butt
};

it.butt_count =async(id,cla)=>
{
  let butt = document.getElementById('butt_'+id);
  if (butt) 
  {
    const total = document.querySelectorAll(cla).length;
    butt.dataset.count = total;
    if (!total) butt.removeAttribute('data-count');
  }
};

it.mk.section =(id,expanded=false)=>
{
  const section = it.mk.l('section',{id:id});
  const butt = it.mk.butt(section);
  if (expanded) section.classList.add('expanded');
  section.append(butt)
  return section
};

it.mk.input =(type,name,value,placeholder)=>
{
  const input = it.mk.l('input',{cla:'ee_input'});
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  return input
};

it.note_editor =o=>
{
  const e_e = it.mk.l('ul',{id:'e_e'}); 
  for (const k in o)
  {
    const li = it.mk.l('li',{cla:'ee_'+k});
    li.dataset.label = k;
    // if (k==='id'||k==='pubkey')
    // {
    //   li.append(it.mk.input('text',k,o[k],''))
    // }
    if (k==='kind'||k==='created_at')
    {
      li.append(it.mk.input('number',k,o[k],''));
      if (k==='created_at') li.append('now');
    }
    else if (k==='content')
    {
      const content = it.mk.l('textarea',{id:'content'});
      content.name = 'content';
      content.placeholder = 'whatever the fuck u want';
      content.contentEditable = true;
      content.value = o.content;
      li.append(content); 
    }
    else if (k==='tags')
    {
      const tags = it.mk.l('ol',{cla:'ee_tags'});
      tags.start = 0;
      li.append(tags);
      if (o.tags.length)
      {
        for (let i=0;i<o.tags.length;i++)
        {
          const tag_li = it.mk.l('li',{cla:'ee_tag'});
          tag_li.append(it.mk.input('text','ee_tag_'+i,''));
          tags.append(tag_li);
        }     
      }
      li.append(it.mk.add_input())
    }
    e_e.append(li);
  }
  return e_e
};

it.mk.add_input =()=>
{
  const button = it.mk.l('button',{cla:'ee_add_tag',con:'add',clk:e=>
  {
    const l = e.target.previousSibling;
    const input = it.mk.input('ee_tag_'+l.length,'','');
    l.append(input);
  }})
  return button
}

it.confirm =o=>
{
  const dialog = document.getElementById('dialog');
  const dialog_close =()=>
  {
    dialog.close();
    dialog.textContent = '';
  };
  const dialog_stuff = it.mk.l('header',{cla:'dialog_stuff'});
  if (o.description) dialog.dataset.label=o.description;
  const dialog_cancel = it.mk.l('button',
  {
    con:'cancel',
    cla:'butt cancel',
    clk:e=>
    {
      dialog_close();
      if (o.hasOwnProperty('no')) o.no();
    }
  });
  const dialog_confirm = it.mk.l('button',
  {
    con:'confirm',
    cla:'butt confirm',
    clk:e=>
    {
      dialog_close();
      if (o.hasOwnProperty('yes')) o.yes();
    }
  });
  dialog_stuff.append(dialog_cancel,dialog_confirm);
  dialog.append(o.l,dialog_stuff);
  dialog.showModal();
  if (o.scroll) dialog.scrollTop = dialog.scrollHeight;
};

it.regx = 
{
  get nostr() { return /((nostr:)[-A-Z0-9]*)\b/gi},
  get url(){ return /https?:\/\/([a-zA-Z0-9\.\-]+\.[a-zA-Z]+)([\p{L}\p{N}\p{M}&\.-\/\?=#\-@%\+_,:!~\/\*]*)/gu},
  get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi},
  get lnbc(){ return /((lnbc)[-A-Z0-9]*)\b/gi},
}

it.parse = {};

it.parse.hashtags =s=>
{
  const hashtags = [];
  const ma = s.match(/(\B[#])\w+/g);
  if (ma) for (const m of ma) hashtags.push(['t',m.slice(1).toLowerCase()])
  return hashtags
};

it.nip19_to_tag =s=>
{
  const tag = [];
  if (s.startsWith('npub')) 
  {
    const xpub = it.fx.decode(s);
    tag.push('p',xpub);
    if (aa.p[xpub].relay) tag.push(aa.p[xpub].relay);
    else tag.push('');
    if (aa.p[xpub].petname) tag.push(aa.p[xpub].petname);
  }
  else if (s.startsWith('note'))
  {
    const xid = it.fx.decode(s);
    tag.push('e',xid);
    let relay = it.get_seen(xid);
    if (seen.length) tag.push(relay)
    else tag.push('');
    tag.push('mention')
  }
  return tag
};

it.nip19_to_tags =a=>
{
  let tags = [];
  for (const s of a)
  {
    let tag = it.nip19_to_tag(s);
    if (tag.length) tags.push(tag);
  }
  return tags
};

it.parse.j =s=>
{
  let o;
  s = s.trim();
  if (s.length > 2)
  {
    try { o = JSON.parse(s)}
    catch (er) { console.log('it.parse.j',s,er)}
  }
  return o
};

it.parse.mentions =s=>
{
  const mentions = [];
  const matches = [...s.matchAll(it.regx.nostr)];
  for (const m of matches)
  {
    let tag = it.nip19_to_tag(m[0].slice(6));
    if (tag.length) mentions.push(tag);
  }
  return mentions
};

it.parse.url =s=>
{
  const dfrag = new DocumentFragment();
  const matches = [...s.matchAll(it.regx.url)];
  // console.log(matches);
  let last_i = 0;
  for (const m of matches)
  {
    dfrag.append(m.input.slice(last_i,m.index));
    last_i = m.index + m[0].length;
    const type = it.s.media(m[0]);
    let link;      
    switch (type[0]) 
    {        
      case 'img':
        link = it.mk.l('img',{cla:'content-img',src:type[1].href});
        link.loading = 'lazy';
        break;

      case 'av':
        link = av.mk(type[1].href);
        break;    
      
      default:
        if (type) link = it.mk.link(type[1].href);
    } 
    dfrag.append(link);
  }
  if (last_i < s.length) dfrag.append(s.slice(last_i));

  return dfrag
}

it.parse.nostr =s=>
{
  const dfrag = new DocumentFragment();
  const matches = [...s.matchAll(it.regx.nostr)];
  let last_i = 0
  for (const m of matches)
  {
    dfrag.append(m.input.slice(last_i,m.index));
    last_i = m.index + m[0].length;
    let dis = m[0].slice(6);
    let decoded;
    try { decoded = it.fx.decode(dis) }
    catch (er) { console.log(er,dis,s) }
    if (!decoded) dfrag.append(dis);
    else
    {
      let a;
      if (dis.startsWith('npub1')) a = it.mk.author(decoded);
      else a = it.mk.l('a',
      {
        cla:'nostr_link',
        con:dis.slice(0,12),
        ref:'#'+dis,clk:it.clk.a
      });
      dfrag.append(a);
    }    
  }
  if (last_i < s.length) dfrag.append(s.slice(last_i));

  return dfrag
};

it.parse.content_basic =o=>
{
  let content = it.mk.l('section',
  {
    cla:'content',
    app:it.mk.l('p',{cla:'paragraph',con:o.content})
  });
  return content
};

it.parse.content =o=>
{
  const content = it.mk.l('section',{cla:'content parsed'});
  const paragraphs = o.content.split(/\r?\n/);
  // console.log(paragraphs);
  for (const p of paragraphs)
  { 
    if (p.length)
    {
      const l = it.mk.l('p',{cla:'paragraph'});
      const words = p.trim().split(' ');
      // console.log(words);
      for (let i=0;i<words.length;i++)
      {
        words[i].trim();
        if (it.regx.url.test(words[i])) l.append(it.parse.url(words[i],trust),' ');
        else if (it.regx.nostr.test(words[i])) l.append(it.parse.nostr(words[i]),' ');
        else 
        {
          if (i === words.length-1) l.append(words[i]);
          else l.append(words[i],' ');
        }
      }
      l.normalize();  
      content.append(l)
    } 
  } 
  return content
};