// generic vars cheatsheet
// a = array
// b = bool
// e = event
// f = function
// i = index
// l = element
// m = message
// n = number
// o = object
// p = profile
// s = string
// t = time
// x = hex
//
// mk = create element
// clk = click
// 

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
  if (dis.startsWith('#')) dis = dis.substr(1);
  v_u.state(dis);
};

it.clk.clkd =l=>
{
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};

it.clk.expanded =e=>
{
  e.stopPropagation();
  // e.target.classList.toggle('expanded');
  let mom = document.getElementById(e.target.dataset.controls) ?? e.target;
  if (mom) 
  {
    mom.classList.toggle('expanded');
    v_u.scroll(mom,{behavior:'smooth'})
  }
};

it.s ={};

it.s.rigged =()=>
{
  try{ return window.self !== window.top } 
  catch(er){ return true }
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
  catch (error) { v_u.log('no Intl.Segmenter(), use a better browser')};
  if (a.length === 1 && seg.length === 1) return true;
  else return false
};

it.s.url =s=>
{
  let url;
  try{ url = new URL(s) } 
  catch(er){ v_u.log('not url '+s) };
  return url
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
  if (s.startsWith('_')) s = s.substring(1);
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
  for (let i=0;i<times; i++) 
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
  return parseInt(x.substring(0,2),16)
    +','+parseInt(x.substring(2,4),16)
    +','+parseInt(x.substring(4,6),16)
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
  if (s.startsWith('n_')) return it.tim.n(s.substring(2));
  if (s.startsWith('d_')) return it.tim.date(s.substring(2));
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
  for (const k of dis)
  { 
    if (!a.includes(k)) 
    {
      a.push(k);
      b = true;
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
  let merged,sets = ['seen','subs','clas'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set] = [];merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set] = [];
    if (it.a_set(dis[set],dat[set])) merged=true;
  }
  return merged
};

it.fx.merge_sets =(a,og,oh)=>
{
  // ['seen','subs']
  let b;
  for (const set of a)
  {
    if (!og.hasOwnProperty(set)) { og[set] = []; b=true } 
    if (!oh.hasOwnProperty(set)) oh[set] = [];
    if (it.a_set(og[set],oh[set])) b=true;
  }
  return b
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
      const relay = a[2];
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
  let o;
  try { o = JSON.parse(s) } catch (er) { console.log(er,s) }
  
  const aka_p = aa.p[aka.o.ls.xpub];
  if (!aka_p) return false;

  if (o) for (const k in o) 
  {
    const v = o[k];
    switch (k)
    {
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
  return o
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
  let le = l ? l : aa.l;
  le.classList.toggle(s);
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
  let l = it.mk.l('a',{cla:'content-link',ref:url,con:text});
  if (title) l.title = title;
  l.rel = 'noreferrer noopener';
  l.target = '_blank';
  return l
};

it.mk.author =async(xpub,p)=>
{
  if (!p) p = aa.p[xpub];
  if (!p) 
  {
    p = author.p(xpub); //await aa.db.get_p(xpub);
    author.load(xpub);
  }
  const pubkey = it.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+' \n '+xpub,
    ref:'#'+p.npub,
    clk:it.clk.a,
  });
  let name = p.metadata?.name ?? p.npub.substr(0,12);
  pubkey.append(it.mk.l('span',{con:name}));
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

it.mk.section =(id,expanded=false)=>
{
  const section = it.mk.l('section',{id:id});
  const butt = it.mk.butt(section);
  if (expanded) section.classList.add('expanded');
  section.append(butt)
  return section
};