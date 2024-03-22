// fix stuff

it.fx ={};


// checks if array includes items
// adds them if not and returns if anything was added

it.fx.a_add =(a,items_to_add)=>
{
  let b = 0;
  for (const item of items_to_add) if (!a.includes(item)){a.push(item);b=1}
  return b
};


// returns filtered array

it.fx.a_rm =(a,items_to_rm)=>
{
  for (const item of items_to_rm) if (a.includes(item)) a=a.filter(i=>i!==item);
  return a
};


// converts string to alphanumeric, 
// replaces everything else with underscore
// to be used as valid element ids

it.fx.an =s=>
{
  s = s.replace(/[^a-z_0-9]/gi,'_').toLowerCase();
  while (s.includes('__')) { s = s.replace('__','_') }
  if (s.startsWith('_')) s = s.slice(1);
  if (s.endsWith('_')) s = s.slice(0,-1);
  return s
};


// adds css color in rgb to element from hex string
// and also sets luma

it.fx.color =async(x,l)=> 
{ 
  const rgb = it.fx.to_rgb(it.fx.leading_zero_rm(x));
  l.style.setProperty('--c',rgb);
  l.dataset.luma = it.fx.luma(rgb);
};


// counts items from selector and sets result on element dataset

it.fx.data_count =async(l,s)=>
{
  const cunt = document.querySelectorAll(s).length;
  if (!cunt) l.removeAttribute('data-count');
  else l.dataset.count = cunt;
};


// add items to a dataset

it.fx.dataset_add =async(l,s,items)=>
{
  let a = l.dataset[s] ? l.dataset[s].trim().split(' ') : [];
  if (it.fx.a_add(a,items)) l.dataset[s] = a.join(' ');
};


// decodes nip19 (bech32)
// requires NostrTools

it.fx.decode =s=> 
{
  let decoded;
  try { decoded = NostrTools.nip19.decode(s).data }
  catch (er) { console.error('it.fx.decode',s,er) };
  return decoded
};


// encodes to bech32 (nip19)
// requires NostrTools

it.fx.encode =(s,x)=>
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
  catch (er) { console.error('it.fx.encode',s,x,er) };
  return encoded
};


// hash event
// requires NostrTools

it.fx.hash =o=> NostrTools.getEventHash(o);


// removes up to 5 leading zeroes from beginning of hexstring
// to be used as a hex color from pubkeys 
// but not too dark if pow/mined

it.fx.leading_zero_rm =x=>
{
  try { return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/,(x0,x_x)=>x_x) } 
  catch(er) { return x }  
};


// splits a string and then 
// for each item, split and pass through function
// then a callback

it.fx.loop =(job,s,done)=>
{
  const a = s.split(',');
  if (a.length)
  {
    for (const task of a) job(task.trim().split(' '));
    done();
  }
};


// returns if color is dark or light 

it.fx.luma =rgb=>
{
  const [r,g,b] = rgb.split(',');
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128 ? 'dark' : 'light';
};


// merge two dat objects

it.fx.merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let merged,sets = ['seen','subs','clas','refs'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set]=[]; merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (it.fx.a_add(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false
};


// merge datasets from one element to another

it.fx.merge_datasets =(a,l_1,l_2)=>
{
  if (a.length) for (const set of a)
  {
    if (l_1.dataset[set])
    {
      let sets = l_2.dataset[set] ? l_2.dataset[set].trim().split(' ') : [];
      it.fx.a_add(a,l_1.dataset[set].trim().split(' '));
      l_2.dataset[set] = sets.join(' ');
    }
  }
};


// adds classes to notes up the parent tree starting from element
// if a string is given, it will be added to a dataset array 

it.fx.path =(l,s=false)=>
{
  for (;l&&l!==document;l=l.parentNode) 
  {
    if (l.classList.contains('note'))
    {
      l.classList.add('in_path');
      if (s) 
      {
        let a = l.dataset.path ? l.dataset.path.trim().split(' ') : [];
        it.fx.a_add(a,[s]);
        l.dataset.path = a.join(' ');
      }
    }
  }
};


// removes path class and dataset from element

it.fx.path_remove =l=>
{
  l.classList.remove('in_path');
  l.removeAttribute('data-path');
};


// removes path dataset from element and class if empty dataset 

it.fx.path_rm =s=>
{
  let in_path = document.querySelectorAll('.in_path');
  if (in_path) for (const l of in_path)
  {
    if (s && l.dataset.path)
    {
      let a = it.fx.a_rm(l.dataset.path.trim().split(' '),[s]);
      if (a.length) l.dataset.path = a.join(' ');
      else it.fx.path_remove(l);
    }
    else it.fx.path_remove(l);
  }
};


// sorts array by order, defaults to ascending

it.fx.sort_by =(a,by)=>
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

it.fx.sort_l =(l,by)=>
{
  let a = [...l.children].sort(it.sort_by[by]);
  for (const node of a) l.append(node)
};


it.fx.tag ={};

// create p tag from hex pubkey

it.fx.tag.p =(x)=>
{
  let tag = [];
  tag.push('p',x);
  if (aa.p[x])
  {
    tag.push(aa.p[x].relay);
    if (aa.p[x].petname.length) tag.push(aa.p[x].petname);
  }
  return tag
};


// create e tag from hex id

it.fx.tag.e =(x,mark)=>
{
  let tag = [];
  tag.push('e',x);
  tag.push(it.get.seen(x));
  if (mark) tag.push(mark);
  return tag
};


// converts hex to rgb

it.fx.to_rgb =x=>
{
  return parseInt(x.slice(0,2),16)
    +','+parseInt(x.slice(2,4),16)
    +','+parseInt(x.slice(4,6),16)
};


// truncate string to start and end 
// with given length and a separator in between (000…000)

it.fx.trunk =(s,len=3,sep='…')=> s.slice(0,len)+sep+s.slice(-len);


// verify event object
// requires NostrTools

it.fx.verify_event =o=> 
{
  let verified;
  try { verified = NostrTools.verifyEvent(o) }
  catch (er) { console.log('unable to verify',o) };
  return verified
};


// verify request filter object

it.fx.verify_req_filter =o=>
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
      { for (const val of v) if (!it.s.x(val)) return false }
      else return false
    }
    else if (k.startsWith('#'))
    {
      if (Array.isArray(v)) 
      { for (const val of v) if (!typeof val==='string') return false }
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