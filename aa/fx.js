/*

alphaama
fun stuff

*/


// return array with items in both arrays
// and array with items that don't
aa.fx.a_ab =(a,b)=>
{
  let inc = [];
  let exc = [];
  for (const i of b)
  {
    if (a.includes(i)) inc.push(i);
    else exc.push(i)
  }
  return {inc,exc}
};


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
  for (const item of items_to_rm) 
    if (a.includes(item)) a=a.filter(i=>i!==item);
  return a
};


// object from array of strings
aa.fx.a_o =a=>
{
  const o = {};
  for (const i of a) 
  {
    const [k,v] = i.split(' ');
    if (k && v) o[k] = v;
  }
  return o
};

// array of unique arrays 
aa.fx.a_u =a=>
{
  let ar = [...new Set(a.map(i=>JSON.stringify(i)))];
  return ar.map(i=>JSON.parse(i))
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


// bytes to hex
aa.fx.bytes_to_x =a=>
{
  return Array.from(a,b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');
};


// splits array into chunks of n items
// returns array of chunks
aa.fx.chunks =(a,n)=>
{
  const chunks = [];
  for (let i = 0; i < a.length; i += n) chunks.push(a.slice(i,i+n));
  return chunks;
}


// adds css color in rgb to element from hex string
// and also sets luma
aa.fx.color =async(x,l)=> 
{
  const rgb = aa.fx.color_xrgb(aa.fx.color_hex(x));
  fastdom.mutate(()=>
  {
    l.style.setProperty('--c',rgb);
    l.dataset.luma = aa.fx.color_luma(rgb);
  });
};


// removes leading zeroes from beginning of hexstring
// to be used as a hex color from pubkeys 
// but not too dark if pow/mined
aa.fx.color_hex =x=>
{
  try { return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/,(x0,x_x)=>x_x) } 
  catch(er) { return x }  
};


// returns if color is dark or light 
aa.fx.color_luma =rgb=>
{
  const [r,g,b] = rgb.split(',');
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128 ? 'dark' : 'light';
};


// converts hex to rgb
aa.fx.color_xrgb =x=>
{
  return parseInt(x.slice(0,2),16)
    +','+parseInt(x.slice(2,4),16)
    +','+parseInt(x.slice(4,6),16)
};


// converts hsl to hex
aa.fx.color_hslx =(h,s,l)=>
{
  s /= 100;
  l /= 100;
  const k =n=> (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1,Math.min(k(n) - 3,9 - k(n),1));
  const rgb = [255 * f(0), 255 * f(8), 255 * f(4)];
  const to_x =x=>
  {
    const hex = x.toString(16);
    return hex.length===1?'0'+hex:hex;
  };
  return rgb.map(to_x).join('');
};


// count leading zeroes
aa.fx.clz =x=>
{
  let c = 0;
  for (let i = 0; i < x.length; i++) 
  {
    const n = parseInt(x[i],16);
    if (n === 0) c += 4;
    else 
    {
      c += Math.clz32(n) - 28;
      break
    }
  }
  return c
};


// update counter
aa.fx.count_upd =(l,pos=true)=>
{
  if (!l) return;
  fastdom.mutate(()=>
  {
    if (!l.dataset.count) l.dataset.count = 0;
    if (pos) l.dataset.count++;
    else l.dataset.count--
  })
};


// countdown to something in seconds
aa.fx.countdown =async(s,seconds)=>
{
  return new Promise(resolve=>
  {
    setTimeout(()=>
    {
      aa.log(`${s}: done!`);
      resolve(true)
    },seconds*1000);

    for (let i=0;i<seconds;i++)
    {
      let num = seconds - i;
      setTimeout(()=>{aa.log(`${s}${num}s...`)},i*1000)
    }
  })
};


// add items to a dataset
aa.fx.dataset_add =async(l,s,items)=>
{
  let a = l.dataset[s] ? l.dataset[s].trim().split(' ') : [];
  if (aa.fx.a_add(a,items)) l.dataset[s] = a.join(' ')
};


// decodes nip19 (bech32)
aa.fx.decode =s=> 
{
  let decoded;
  try { decoded = NostrTools.nip19.decode(s).data }
  catch (er) { console.error('aa.fx.decode',s,er) }
  return decoded
};


// decrypt nip4/44
aa.fx.decrypt =async(s='')=>
{
  let [text,pubkey] = s.split(aa.fx.regex.fw);
  if (text) text = text.trim();
  if (!pubkey) pubkey = aa.u.p.pubkey;
  if (aa.is.nip4(text)) return await window.nostr.nip04.decrypt(pubkey,text);
  else return await window.nostr.nip44.decrypt(pubkey,text)
};


// decript and parse
aa.fx.decrypt_parse =async event=>
{
  if (!window.nostr) 
  {
    aa.log('signer not found');
    return
  }
  let {pubkey,content} = event;
  let a = await window.nostr.nip44.decrypt(pubkey,content);
  if (!a)
  {
    aa.log(event.id+' decrypt failed');
    return
  }
  a = aa.parse.j(a);
  if (!a)
  {
    aa.log(event.id+' decrypt parse failed');
    return
  }
  return a
};


// encodes to bech32 (nip19)
aa.fx.encode =(s,x)=>
{
  let encoded;
  try {encoded = NostrTools.nip19[s+'Encode'](x)}
  catch (er) {console.error('aa.fx.encode',s,x,er)};
  return encoded
};


// encrypt
aa.fx.encrypt44 =async(text,pubkey)=>
{
  if (!pubkey) pubkey = aa.u.p.pubkey;
  if (window.nostr) return await window.nostr.nip44.encrypt(pubkey,text)
  else 
  {
    aa.log('you need a signer');
    return false
  }
};


aa.fx.format_bytes =(bytes,decimals=2)=>
{
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes','KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

  const i = Math.floor(Math.log(bytes)/Math.log(k))

  return `${parseFloat((bytes/Math.pow(k,i)).toFixed(dm))} ${sizes[i]}`
};


// hash event
aa.fx.hash =ish=> NostrTools.getEventHash(ish);


// generate keypair
aa.fx.keypair =(xsec='')=>
{
  if (xsec && !aa.is.key(xsec))
  {
    aa.log('fx keypair: invalid key provided');
    return false
  }

  let secret, public, nsec;
  if (!xsec?.length)
  {
    secret = NostrTools.generateSecretKey();
    xsec = aa.fx.bytes_to_x(secret)
  }
  else secret = aa.fx.x_to_bytes(xsec);
  if (secret)
  {
    public = NostrTools.getPublicKey(secret);
    nsec = NostrTools.nip19.nsecEncode(secret);
  }
  return [secret,public,xsec,nsec]
};


// return kind information
aa.fx.kind_type =kind=> 
{
  if (typeof kind === 'string') kind = parseInt(kind.trim());
  return NostrTools.kinds.classifyKind(kind);
}


aa.fx.kinds_type =kind=>
{
  if (typeof kind === 'string') kind = parseInt(kind.trim());
  let kinds = Object.entries(NostrTools.kinds);
  let result = kinds.filter(k=>typeof k[1]==='number'&&k[1]===kind).map(i=>i[0]);
  return result.length ? result[0] : 'unknown'
};


// returns items in a given set
aa.fx.in_set =(o,set,filter='off')=>
{
  let a = [];
  for (const k in o)
  {
    if (o[k].sets.includes(set))
    {
      if (!filter) a.push(k);
      else if (!o[k].sets.includes(filter)) a.push(k);
    }
  }
  return a
};


// return items in any set
aa.fx.in_sets =(o,sets,filter='off')=>
{
  let a = [];
  for (const set of sets) a.push(...aa.fx.in_set(o,set,filter));
  return [...new Set(a)]
};


// return items in all sets if not 'off'
aa.fx.in_sets_all =(o,sets)=>
{
  let a = [];
  
  for (const k in o)
  {
    let i = o[k];
    if (!i.sets.includes('off') && sets.every(set=>i.sets.includes(set))) a.push(k);
  }
  return [...new Set(a)]
};


// intersect
aa.fx.intersect =(o={},a=[],n=2)=>
{
  if (typeof n !== 'number') n = 1;
  let dis = {};
  let items = Object.entries(o).sort(aa.fx.sorts.len);
  for (const x of a)
  {
    let i=0;
    for (const item of items)
    {
      const [k,v] = item;
      if (v.includes(x))
      {
        if (!dis[k]) dis[k] = [];
        aa.fx.a_add(dis[k],[x]);
        i++;
        if (i>=n) break;
      }
    }
  }
  return dis
};


// convert a value from a range a_min/a_max into another range b_min/b_max
aa.fx.linear_convert =(val,a_max,b_max,a_min,b_min)=>
{
  if (!a_min) a_min = 0;
  if (!b_min) b_min = 0;
  return ((val-a_min)/(a_max-a_min))*(b_max-b_min)+b_min;
}


// on load
aa.fx.load =async()=>
{
  let id = 'fx';
  let mod = aa.fx;
  aa.actions.push(
    {
      action:[id,'qr'],
      required:['text'],
      description:'create qr code',
      exe:mod.qr
    },
    {
      action:[id,'decode'],
      required:['text'],
      description:'decode nip19 (bech32) to hex',
      exe:mod.decode
    },
    {
      action:[id,'decrypt'],
      required:['pubkey','text'],
      description:'decrypt cyphertext',
      exe:mod.decrypt
    },
    {
      action:[id,'kind'],
      required:['kind_number:n'],
      description:'what is kind',
      exe:mod.kinds_type
    },
    {
      action:[id,'keypair'],
      description:'generate a new keypair',
      exe:mod.keypair
    },
  )
};


// splits a string and then 
// for each item, split and pass through function
// then a callback
// aa.fx.loop =(job,s,done)=>
// {
//   const a = s.split(',');
//   if (a.length)
//   {
//     for (const task of a) job(task.trim().split(' '));
//     if (done) done();
//   }
// };


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


// return single or plural string
aa.fx.plural =(n,s)=> n === 1 ? s : s+'s';


// proof of work abort
aa.fx.pow_abort =(id)=>
{
  let m = aa.temp.mining[id]
  if (!m) return;

  m.ww.terminate();

  let log = document.getElementById('pow_log_'+id);

  let note = document.querySelector('.note[data-id="'+id+'"]');
  if (note) note.classList.remove('mining');

  if (m.ended)
  {
    let t = m.ended - m.start;
    log.textContent = `${m.started} -> done in ${t} ms`;
  }
  else 
  {
    log.textContent = 'pow aborted';
  }
  aa.log_read(log.parentElement);
};


// proof of work
aa.fx.pow =async(event,dif)=>
{
  return new Promise(resolve=>
  {
    if (!aa.temp.mining) aa.temp.mining = {};
    let start = Date.now(),ended;
    
    const m = aa.temp.mining[event.id] = 
    {
      ended:false,
      dif:dif,
      start:Date.now(),
      started:false,
      ww:new Worker('/pow.js'),
    };

    m.start_date = new Date(m.start);
    m.started = `mining pow (${dif}) started ${m.start_date}`;
    
    const log = aa.mk.l('p',{id:'pow_log_'+event.id,con:m.started});
    
    const kill =()=>
    {
      setTimeout(()=>{aa.fx.pow_abort(event.id)},200);
    };
    let butt_cancel = aa.mk.l('button',{con:'abort',cla:'butt no',clk:kill});
    log.append(butt_cancel);
    aa.log(log);

    m.ww.onmessage =message=>
    {
      aa.temp.mining[event.id].ended = Date.now();
      kill();
      resolve(message.data);
    };
    m.ww.postMessage({event:event,difficulty:dif});
  });
};


// qr code
aa.fx.qr =s=>
{
  let qr = aa.mk.qr(s.trim());
  aa.log('fx qr: ');
  aa.log(s);
  aa.log(qr);
};


aa.fx.random_s =(length)=> 
{
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array(length + 1).join('').split('').sort(()=>Math.random()-0.5).join('');
};


// reusable regex
aa.fx.regex =
{
  get an(){ return /^[A-Z_0-9]+$/i }, // alphanumeric
  get hashtag(){ return /(\B[#])[\w_-]+/g },
  get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi },
  get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi },
  get nostr(){ return /((nostr:)[A-Z0-9]{12,})\b/gi }, 
  get bech32(){ return /^[AC-HJ-NP-Z02-9]*/i }, //acdefghjklmnqprstuvwxyz987654320
  // get url(){ return /https?:\/\/([a-zA-Z0-9\.\-]+\.[a-zA-Z]+)([\p{L}\p{N}\p{M}&\.-\/\?=#\-@%\+_,:!~\/\*]*)/gu },
  get url(){ return /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g },
  get str(){ return /"([^"]+)"/ }, // text in quotes ""
  get fw(){ return /(?<=^\S+)\s/ }, // first word
};


// scroll with delay
aa.fx.scroll =async(l,options={})=>
{
  if (l) l.scrollIntoView(options)
}; 


// scroll stuff
// aa.fx.scrolled =async()=>
// {
//   if (!aa.temp.scroll) aa.temp.scroll = {top:0,dir:''};
//   const new_top = aa.l.scrollTop;
//   if (new_top > aa.temp.scroll.top) aa.temp.scroll.dir = 'down';
//   else if (new_top < aa.temp.scroll.top) aa.ui.scroll_direction = 'up';
//   aa.temp.scroll.top = new_top <= 0 ? 0 : new_top;
// };


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
  stamp_asc(a,b)
  {
    let a_val = parseInt(a.dataset.stamp);
    let b_val = parseInt(b.dataset.stamp);
    return a_val > b_val ? 1 : -1
  },
  stamp_desc(a,b)
  {
    let a_val = parseInt(a.dataset.stamp);
    let b_val = parseInt(b.dataset.stamp);
    return a_val < b_val ? 1 : -1
  },
  len(a,b){ return b[1].length > a[1].length ? 1 : -1 },
  len_desc(a,b){ return b[1].length > a[1].length ? -1 : 1 },
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


// split and trim
aa.fx.splitr =(string,at=' ')=>
{
  return string.trim().split(at).map(dis=>dis.trim())
};


// split at given index
aa.fx.split_at =(i,a)=> [a.slice(0,i),a.slice(i)];


// splits string, given '"quoted text" and something else'
// returns ['quoted text','and something else']
aa.fx.split_str =(s='')=>
{
  if (s.startsWith('"" ')) return ['',s.slice(3)];
  else if (s.startsWith('""')) return ['',s.slice(2)];
  let dis = s?.match(aa.fx.regex.str);
  if (dis && dis.length) return [dis[1],s.slice(dis.index+dis[0].length).trim()]
  return [s]
};


// split addressable id string
aa.fx.split_ida =ida=>
{
  let a = ida.split(':');
  let kind = a.shift();
  let pubkey = a.shift();
  let identifier = a.length > 1 ? a.join(':') : a[0];
  return [kind,pubkey,identifier]
};


// create a tag from event
aa.fx.tag_a =o=>
{
  let s = aa.fx.tag_value(o.tags,'d');
  let ida = `${o.kind}:${o.pubkey}:${s}`;
  let tag = ['a',ida];
  return tag
};


// create p tag from hex pubkey
aa.fx.tag_p =x=>
{
  let tag = [];
  tag.push('p',x);
  let p = aa.db.p[x];
  if (p)
  {
    let relay = aa.fx.in_sets_all(p.relays,['k10002','write']).sort((a,b)=>{})[0];
    if (relay) tag.push(relay);
    if (p.petname.length) 
    {
      if (tag.length === 2) tag.push('');
      tag.push(p.petname);
    }
  }
  return tag
};


// create e tag from hex id
aa.fx.tag_e =(x,mark=false)=>
{
  let tag = [];
  tag.push('e',x);
  let relay = aa.get.seen(x);
  if (relay) tag.push(relay);
  if (mark) 
  {
    if (tag.length===2) tag.push('');
    tag.push(mark);
  }
  
  return tag
};
// create q tag from hex id
aa.fx.tag_q =(x)=>
{
  let tag = [];
  tag.push('q',x);
  let relay = aa.get.seen(x);
  if (relay) tag.push(relay);
  return tag
};

aa.fx.tag_value =(a,s)=>
{
  let value,tag = a.find(i=>i[0]===s);
  if (tag && tag.length > 1) value = tag[1].trim();
  return value;
}


aa.fx.tags_add =(a,b)=>
{
  for (const i of b)
  {
    if (!a.some(t=>t[0] === i[0] && t[1] === i[1])) a.push(i)
  }
};


aa.fx.tags_values =(a,s)=>
{
  return a.filter(t=>t[0]===s).map(r=>r[1].trim())
};


// timestamp from string variable
aa.fx.time_convert =s=>
{
  if (s === 'now') return aa.now;
  if (!s.includes('_')) return parseInt(s);
  
  let t = s.slice(2);
  if (s.startsWith('d_')) 
  {
    try { return Date.parse(t) / 1000 } 
    catch (er) { return aa.now }
  }
  const d = new Date();
  switch (s[0])
  {
    case 'n': d.setDate(d.getDate() - t); break;
    case 'h': d.setHours(d.getHours() - t); break;
    case 'm': d.setMinutes(d.getMinutes() - t); break;
    case 'M': d.setMonth(d.getMonth() - t); break;
    case 'y': d.setYear(d.getFullYear() - t); break;
  }
  return Math.floor(d.getTime()/1000)
};


// for display
aa.fx.time_display =ts=> aa.fx.time_nice(new Date(ts*1000));
aa.fx.time_display_ext =ts=> aa.fx.time_display(ts)+' ~'+aa.fx.time_elapsed(new Date(ts*1000));


// time elapsed from date to string
aa.fx.time_elapsed =date=>
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


// nice format date to string
aa.fx.time_nice =d=>
{ 
  return d.getFullYear()
  +'/'+ (d.getMonth()+1+'').padStart(2,'0') 
  +'/'+ (d.getDate()  + '').padStart(2,'0') 
  +' '+ (d.getHours() + '').padStart(2,'0') 
  +':'+ (d.getMinutes()+'').padStart(2,'0') 
  +':'+ (d.getSeconds()+'').padStart(2,'0')
};


// timestamp to date
aa.fx.time_to_date =s=> new Date(s*1000);


// update time element
aa.fx.time_upd =l=>
{
  const timestamp = parseInt(l.textContent);
  const date = aa.fx.time_to_date(timestamp);
  l.dataset.elapsed = aa.fx.time_elapsed(date);
};


// timeout with delay if called again before for some time
aa.fx.to =async(f,t,s)=>
{
  if (!aa.temp.todo) aa.temp.todo = {};
  if (aa.temp.todo.hasOwnProperty(s)) clearTimeout(aa.temp.todo[s]);
  aa.temp.todo[s] = setTimeout(()=>{f(s)},t);
};


// truncate string to start and end 
// with given length and a separator in between (000…000)
aa.fx.trunk =(s,len=3,sep='…')=> s.slice(0,len)+sep+s.slice(-len);


aa.fx.url_from_tags =tags=>
{
  let url;
  let tag = tags.find(t=>t[0] === 'url');
  if (!tag || tag.length < 2)
  {
    tag = tags.find(t=>t[0] === 'imeta');
    if (tag) url = aa.is.url(aa.fx.a_o(tag).url)?.href;
  }
  else url = aa.is.url(tag[1])?.href;
  return url
};


// checks if string is valid url and then checks extension for media file types.
// returns false if no media found or array with extension,URL
aa.fx.src_type =url=>
{
  let dis = [url.href];
  if (aa.fx.src_ext(url,aa.def.extensions.img)) dis.push('img');
  if (aa.fx.src_ext(url,aa.def.extensions.audio)) dis.push('audio');
  if (aa.fx.src_ext(url,aa.def.extensions.video)) dis.push('video');
  return dis
};


aa.fx.src_ext =(url,extensions)=>
{
  const src = (url.origin + url.pathname).toLowerCase();
  for (const ext of extensions)
  {
    if (src.endsWith('.'+ext)
    || url.searchParams.get('format') === ext) return true
  }
  return false
};


// verify event object
aa.fx.verify_event =o=>
{
  let verified;
  try {verified = NostrTools.verifyEvent(o)}
  catch (er){aa.log('unable to verify:' +JSON.stringify(o))};
  return verified
};


// verify request filter object
aa.fx.verify_req_filter =o=>
{
  if (!aa.is.o(o)) return;
  if (!Object.keys(o).length) return;
  let ints = ['since','until','limit'];
  let hexs = ['ids','authors','#p','#e'];
  for (const k in o)
  {
    const v = o[k];
    
    if (ints.includes(k))
    {
      if (!Number.isInteger(v) || v === 0) return
    }
    else
    {
      if (!Array.isArray(v)) return;

      if (k==='kinds')
      {
        if (v.some(val=>!Number.isInteger(val))) return;
      }
      else
      {
        if (hexs.includes(k)) 
        {
          if (v.some(val=>!aa.is.x(val))) return;
        }
        else if (k.startsWith('#')) 
        {
          if (v.some(val=>typeof val!='string')) return;
        }
        else return
      }
    }
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


// bytes to hex
aa.fx.x_to_bytes =x=>
{
  if (x.length % 2 !== 0) return;
  const n = x.length / 2;
  const a = new Uint8Array(n);
  for (let i=0;i<n;i++) a[i] = parseInt(x.substr(i*2,2),16);
  return a
};


window.addEventListener('load',aa.fx.load);