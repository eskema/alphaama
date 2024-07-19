/*

alphaama
fx stuff

*/


// checks if array includes items
// adds them if not and returns if anything was added
aa.fx.a_add =(a,items_to_add)=>
{
  let b = 0;
  for (const item of items_to_add) if (!a.includes(item)){a.push(item);b=1}
  return b
};


// returns filtered array
aa.fx.a_rm =(a,items_to_rm)=>
{
  for (const item of items_to_rm) if (a.includes(item)) a=a.filter(i=>i!==item);
  return a
};


// converts string to alphanumeric, 
// replaces everything else with underscore
// to be used as valid element ids
aa.fx.an =s=>
{
  s = s+'';
  s = s.replace(/[^a-z_0-9]/gi,'_').toLowerCase();
  while (s.includes('__')) { s = s.replace('__','_') }
  if (s.startsWith('_')) s = s.slice(1);
  if (s.endsWith('_')) s = s.slice(0,-1);
  return s
};


// adds css color in rgb to element from hex string
// and also sets luma
aa.fx.color =async(x,l)=> 
{ 
  const rgb = aa.fx.to_rgb(aa.fx.leading_zero_rm(x));
  l.style.setProperty('--c',rgb);
  l.dataset.luma = aa.fx.luma(rgb);
};


// counts items from selector and sets result on element dataset
aa.fx.data_count =async(l,s)=>
{
  const n = document.querySelectorAll(s).length;
  if (!n) l.removeAttribute('data-count');
  else l.dataset.count = n;
};


// add items to a dataset
aa.fx.dataset_add =async(l,s,items)=>
{
  let a = l.dataset[s] ? l.dataset[s].trim().split(' ') : [];
  if (aa.fx.a_add(a,items)) l.dataset[s] = a.join(' ');
};


// decodes nip19 (bech32)
aa.fx.decode =s=> 
{
  let decoded;
  try { decoded = NostrTools.nip19.decode(s).data }
  catch (er) { console.error('aa.fx.decode',s,er) };
  return decoded
};


// encodes to bech32 (nip19)
aa.fx.encode =(s,x)=>
{
  let encoded;
  try
  {
    switch (s) 
    {
      case 'nid': encoded = NostrTools.nip19.noteEncode(x); break;
      case 'npub': encoded = NostrTools.nip19.npubEncode(x); break;
    }
  }
  catch (er) { console.error('aa.fx.encode',s,x,er) };
  return encoded
};


// expanded class, checks sessionStorage for saved value
aa.fx.expanded =(id,expanded,l)=>
{
  if (expanded)
  {
    if (sessionStorage.hasOwnProperty(id))
    {
      if (sessionStorage[id] === 'expanded') l.classList.add('expanded');
    }
    else l.classList.add('expanded');
  }
  else
  {
    if (sessionStorage.hasOwnProperty(id) && sessionStorage[id] === 'expanded')
    {
      l.classList.add('expanded');
    }
  }
};


// hash event
aa.fx.hash =o=> NostrTools.getEventHash(o);


// removes up to 5 leading zeroes from beginning of hexstring
// to be used as a hex color from pubkeys 
// but not too dark if pow/mined
aa.fx.leading_zero_rm =x=>
{
  try { return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/,(x0,x_x)=>x_x) } 
  catch(er) { return x }  
};


// splits a string and then 
// for each item, split and pass through function
// then a callback
aa.fx.loop =(job,s,done)=>
{
  const a = s.split(',');
  if (a.length)
  {
    for (const task of a) job(task.trim().split(' '));      
    if (done) done();
  }
};


// returns if color is dark or light 
aa.fx.luma =rgb=>
{
  const [r,g,b] = rgb.split(',');
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128 ? 'dark' : 'light';
};


// merge two dat objects
aa.fx.merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let merged,sets = ['seen','subs','clas','refs'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set]=[]; merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (aa.fx.a_add(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false
};


// merge datasets from one element to another
aa.fx.merge_datasets =(a,l_1,l_2)=>
{
  if (a.length) for (const set of a)
  {
    if (l_1.dataset[set])
    {
      let sets = l_2.dataset[set] ? l_2.dataset[set].trim().split(' ') : [];
      aa.fx.a_add(a,l_1.dataset[set].trim().split(' '));
      l_2.dataset[set] = sets.join(' ');
    }
  }
};


// adds classes to notes up the parent tree starting from element
// if a string is given, it will be added to a dataset array 
aa.fx.path =(l,s=false)=>
{
  for (;l&&l!==document;l=l.parentNode) 
  {
    if (l.classList.contains('note'))
    {
      l.classList.add('in_path');
      if (s) 
      {
        let a = l.dataset.path ? l.dataset.path.trim().split(' ') : [];
        aa.fx.a_add(a,[s]);
        l.dataset.path = a.join(' ');
      }
    }
  }
};


// removes path class and dataset from element
aa.fx.path_remove =l=>
{
  l.classList.remove('in_path');
  l.removeAttribute('data-path');
};


// removes path dataset from element and class if empty dataset 
aa.fx.path_rm =s=>
{
  let in_path = document.querySelectorAll('.in_path');
  if (in_path) for (const l of in_path)
  {
    if (s && l.dataset.path)
    {
      let a = aa.fx.a_rm(l.dataset.path.trim().split(' '),[s]);
      if (a.length) l.dataset.path = a.join(' ');
      else aa.fx.path_remove(l);
    }
    else aa.fx.path_remove(l);
  }
};


// scroll with delay
aa.fx.scroll =async(l,options={})=>
{
  setTimeout(()=>{ if (l) l.scrollIntoView(options) },50);
}; 


// scroll stuff
aa.fx.scrolled =()=>
{
  let last_top = 0;
  window.addEventListener('scroll',()=>
  {
    // save scroll direction (vertical)
    const new_top = aa.l.scrollTop;
    if (new_top > last_top) aa.fx.scroll_direction = 'down';
    else if (new_top < last_top) aa.fx.scroll_direction = 'up';
    last_top = new_top <= 0 ? 0 : new_top;
  });
};


// sorts array by order, defaults to ascending
aa.fx.sort_by =(a,by)=>
{
  switch (by)
  {
    case 'desc': return a.sort((a,b)=> b[1] - a[1]);
    case 'rand': return a.sort(()=> 0.5 - Math.random());
    case 'asc': 
    default: return a.sort((a,b)=> a[1] - b[1]);
  }
};


// sorts element children
aa.fx.sort_l =(l,by)=>
{
  let a = [...l.children].sort(aa.fx.sorts[by]);
  for (const node of a) l.append(node)
};


// sorting functions to use in .sort()
aa.fx.sorts =
{
  asc(a,b){return a[1] - b[1] ? 1 : -1},
  desc(a,b){return b[1] - a[1] ? 1 : -1},
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
  rand(){return ()=> 0.5 - Math.random()},
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
};


aa.fx.tag ={};
// create p tag from hex pubkey
aa.fx.tag.p =(x)=>
{
  let tag = [];
  tag.push('p',x);
  let p = aa.db.p[x];
  if (p)
  {
    if (p.relay.length) tag.push(p.relay);
    if (p.petname.length) 
    {
      if (!p.relay.length) tag.push('');
      tag.push(p.petname);
    }
  }
  return tag
};
// create e tag from hex id
aa.fx.tag.e =(x,mark=false)=>
{
  let tag = [];
  tag.push('e',x);
  let relay = aa.get.seen(x);
  if (relay) tag.push(relay);
  if (mark) 
  {
    if (!relay) tag.push('');
    tag.push(mark);
  }  
  return tag
};
// create q tag from hex id
aa.fx.tag.q =(x)=>
{
  let tag = [];
  tag.push('q',x);
  let relay = aa.get.seen(x);
  if (relay) tag.push(relay);
  return tag
};


// creates a link from tag array
aa.fx.tag_a =a=>
{
  const tail =(a,l,i=1)=>{if (a.length>i)l.dataset.tail=a.slice(i).join(', ')};
  const type = a[0];
  const value = a[1];
  let relay;
  const l = aa.mk.l('a',{cla:'tag_a_'+type,clk:aa.clk.a});
  switch(type)
  {
    case 'e':
      relay = a[2];
      const nid = aa.fx.encode('nid',value);
      l.textContent = nid;
      l.href = '#'+nid;
      if (relay) l.dataset.relay = relay;
      tail(a,l,3);
      break;
    case 'p':
      relay = a[2];
      const petname = a[3];
      const npub = aa.fx.encode('npub',value);
      l.textContent = npub;
      l.href = '#'+npub;
      if (relay) l.dataset.relay = relay;
      if (petname) l.dataset.petname = petname;
      tail(a,l,4);
      break;
    default:
      l.textContent = value;
      l.href = '#'+aa.fx.an(value);
      tail(a,l,2);
  }
  return l
};


// converts hex to rgb
aa.fx.to_rgb =x=>
{
  return parseInt(x.slice(0,2),16)
    +','+parseInt(x.slice(2,4),16)
    +','+parseInt(x.slice(4,6),16)
};


// truncate string to start and end 
// with given length and a separator in between (000…000)
aa.fx.trunk =(s,len=3,sep='…')=> s.slice(0,len)+sep+s.slice(-len);


// checks if string is valid url and then checks extension for media file types.
// returns false if no media found or array with extension,URL
aa.fx.url_type =s=>
{
  let url = aa.is.url(s); 
  if (!url) return false;
  const is_img = aa.extensions.img;
  const is_av = aa.extensions.av;
  const check_ext =extensions=>
  {
    const src = (url.origin + url.pathname).toLowerCase();
    for (const ext of extensions)
    {
      if (src.endsWith('.'+ext)
      || (url.searchParams.has('format') && url.searchParams.get('format') === ext)) 
      return true
    }
    return false
  };
   
  return check_ext(is_img)?['img',url]
  :check_ext(is_av)?['av',url] 
  :['link',url]
};


// verify event object
aa.fx.verify_event =o=> 
{
  let verified;
  try { verified = NostrTools.verifyEvent(o) }
  catch (er) { console.log('unable to verify',o) };
  return verified
};


// verify request filter object
aa.fx.verify_req_filter =o=>
{
  for (const k in o)
  {
    const v = o[k];
    if (k==='since'||k==='until'||k==='limit')
    {
      if (!Number.isInteger(v)||v===0) return false
    }
    else if (k==='ids'||k==='authors'||k==='#p'||k==='#e')
    {
      if (Array.isArray(v)) 
      { for (const val of v) if (!aa.is.x(val)) return false }
      else return false
    }
    else if (k.startsWith('#'))
    {
      if (Array.isArray(v)) 
      { for (const val of v) if (typeof val!=='string') return false }
      else return false
    }
    else if (k==='kinds')
    {
      if (Array.isArray(v)) 
      { for (const val of v) if (!Number.isInteger(val)) return false }
      else return false
    }
    else return false
  }
  return true
};


// verify multiple request filter objects
aa.fx.verify_req_filters =a=>
{
  for (const f of a)
  {
    if (!aa.fx.verify_req_filter(f)) return false;
  }
  return true
};