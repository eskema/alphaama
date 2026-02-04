/*

alphaama
fun stuff

*/


// checks if array includes items
// adds them if not and returns if anything was added
aa.fx.a_add =(a,items_to_add)=>
{
  const existing = new Set(a);  // O(n) once instead of O(n²)
  let b = 0;
  for (const item of items_to_add)
  {
    if (!existing.has(item))  // O(1) lookup instead of O(n)
    {
      a.push(item);
      existing.add(item);  // Keep Set in sync for subsequent checks
      b = 1;
    }
  }
  return b
};


// returns filtered array
aa.fx.a_rm =(a,items_to_rm)=>
{
  const to_remove = new Set(items_to_rm);  // O(n) once
  return a.filter(i => !to_remove.has(i))  // O(1) lookup, single pass
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
  const seen = new Map();
  const result = [];

  for (const item of a)
  {
    const key = JSON.stringify(item);  // Stringify once for lookup key
    if (!seen.has(key))
    {
      seen.set(key, true);
      result.push(item);  // Use original item - no parse needed!
    }
  }

  return result
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


// convert string to base64
aa.fx.base64 =string=>
{
  const bytes = new TextEncoder().encode(string);
  string = Array.from(bytes, b=> String.fromCodePoint(b))
    .join('');
  return btoa(string)
};


// SHA256 from blob
aa.fx.blob_sha256 =async blob=>
{
  const buffer = await blob.arrayBuffer();
  const hash_buffer = await crypto.subtle.digest('SHA-256',buffer);
  return Array.from(new Uint8Array(hash_buffer))
    .map(b=> b.toString(16).padStart(2,'0')).join('')
};


// splits array into chunks of n items
// returns array of chunks
aa.fx.chunks =(a,n)=>
{
  const chunks = [];
  for (let i = 0; i < a.length; i += n) chunks.push(a.slice(i,i+n));
  return chunks;
};


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
aa.fx.count_upd =(element,pos=true)=>
{
  if (!element) return;
  fastdom.mutate(()=>
  {
    if (!element.dataset.count) element.dataset.count = 0;
    if (pos) element.dataset.count++;
    else element.dataset.count--
  })
};


// countdown to something in intervals
aa.fx.countdown =async(con,total,n)=>
{
  return new Promise(resolve=>
  {
    let interval;
    const done =dis=>{clearInterval(interval);resolve(dis)};
    let times = 0;
    let counter = make('span',{con:total,cla:'counter'});
    let l = make('p',{con,cla:'countdown'});
    l.append(' ',counter,'…',' ',make('button',
    {
      cla:'butt no',
      con:'abort',
      clk:e=>
      {
        done(false);
        fastdom.mutate(()=>
        {
          e.target.remove();
          l.append('aborted!')
        });
      }
    }));
    aa.log(l);
    
    const count_down =()=>
    {
      times++;
      fastdom.mutate(()=>{counter.textContent = total - times});
      if (times === total) done(true);
    };
    interval = setInterval(count_down,n);
  })
};


// decodes nip19 (bech32)
aa.fx.decode =string=> 
{
  let decoded;
  try
  { 
    decoded = NostrTools.nip19
      .decode(string.toLowerCase()).data 
  }
  catch (er) { console.error('aa.fx.decode',string,er) }
  return decoded
};


// decrypt nip4/44
aa.fx.decrypt =async(s='')=>
{
  let [text,pubkey] = s.split(aa.regex.fw);
  if (text) text = text.trim();
  if (!pubkey) pubkey = aa.u.p.pubkey;
  if (aa.fx.is_nip4(text)) return await window.nostr.nip04.decrypt(pubkey,text);
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
  a = aa.pj(a);
  if (!a)
  {
    aa.log(event.id+' decrypt parse failed');
    return
  }
  return a
};


// await a delay
aa.fx.delay =ms=> new Promise(resolve=> setTimeout(resolve,ms));


// batched storage manager to prevent jank from synchronous writes
aa.fx.storage = (() => {
  const pending = new Map();
  let scheduled = false;

  const flush = () => {
    for (const [key, value] of pending) {
      if (value === null) {
        delete sessionStorage[key];
      } else {
        sessionStorage[key] = value;
      }
    }
    pending.clear();
    scheduled = false;
  };

  return {
    // Schedule a write (batched until next frame)
    set: (key, value) => {
      pending.set(key, value);
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    },

    // Immediate write (use sparingly)
    setImmediate: (key, value) => {
      sessionStorage[key] = value;
    },

    // Get (checks pending writes first, then storage)
    get: (key) => {
      if (pending.has(key)) return pending.get(key);
      return sessionStorage[key];
    },

    // Force flush now (useful before navigation)
    flush: () => {
      if (scheduled) flush();
    }
  };
})();


// for selector in element do
aa.fx.do_all =(selector,callback,element)=>
{
  if (!element) element = document;
  let items = element?.querySelectorAll(selector);
  if (items?.length) for (const item of items) callback(item)
};


// encodes to bech32 (nip19)
aa.fx.encode =(s,data)=>
{
  let encoded;
  try {encoded = NostrTools.nip19[s+'Encode'](data)}
  catch (er) {console.error('aa.fx.encode',s,data,er)};
  return encoded
};


// encrypt
aa.fx.encrypt44 =async(text,pubkey)=>
{
  if (!pubkey) pubkey = aa.u.p.pubkey;
  if (window.nostr) 
    return await window.nostr.nip44.encrypt(pubkey,text)
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
  if (xsec && !aa.fx.is_key(xsec))
  {
    aa.log('fx keypair: invalid key provided');
    return false
  }

  let secret, public, nsec;
  if (!xsec?.length)
  {
    secret = NostrTools.generateSecretKey();
    xsec = NostrTools.utils.bytesToHex(secret)
  }
  else secret = NostrTools.utils.hexToBytes(xsec);
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


// is hexadecimal
aa.fx.is_hex =string=> aa.regex.hex.test(string);


// is a valid nostr key
aa.fx.is_key =string=>
{
  return aa.fx.is_hex(string) 
  && string.length === 64
};


// is nip4 cyphertext
aa.fx.is_nip4 =string=> 
{
  const len = string.length;
  if (len < 28) return false;
  return string[len - 28] == '?' 
      && string[len - 27] == 'i'
      && string[len - 26] == 'v'
      && string[len - 25] == '='
};


// returns wether or not a given level is trusted
aa.fx.is_trusted =number=>
{
  let trust_needed;
  try { trust_needed = parseInt(localStorage.score) } 
  catch { console.error('!trust',localStorage.score) }
  if (Number.isInteger(trust_needed) 
  && number >= trust_needed) return true;
  return
};


// convert a value from a range a_min/a_max into another range b_min/b_max
aa.fx.linear_convert =(val,a_max,b_max,a_min,b_min)=>
{
  if (!a_min) a_min = 0;
  if (!b_min) b_min = 0;
  return ((val-a_min)/(a_max-a_min))*(b_max-b_min)+b_min;
};


aa.fx.parse =(content,is_trusted)=>
{
  let items = 
  [
    {id:'url', regex:aa.regex.url, exe:aa.parse.url},
    {id:'nostr', regex:aa.regex.nostr, exe:aa.parse.nostr},
    {id:'hashtag', regex:aa.regex.hashtag, exe:aa.parse.hashtag},
  ];

  return parse_all({ content, items, is_trusted })
};


// return single or plural string
aa.fx.plural =(n,s)=> n === 1 ? s : s+'s';


// qr code
aa.fx.qr =s=>
{
  let qr = aa.mk.qr(s.trim());
  aa.log('fx qr: ');
  aa.log(s);
  aa.log(qr);
};


// random string
aa.fx.rands =(length=6,sample)=>
{
  const chars = sample
  || 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  for (let i=0; i<length; i++)
  {
    const index = Math.floor(Math.random() * chars.length);
    result += chars.charAt(index);
  }
  return result;
};


// fetch file from path, append text to object and return text
aa.fx.readme =async(path,o={})=>
{
  if (!Object.hasOwn(o,'readme'))
  {
    let response;
    try 
    { 
      response = await fetch(path) 
    }
    catch {}
    if (!response) return;
    let text = await response.text();
    if (text) o.readme = text;
  }
  return o.readme
};


// scroll with delay
aa.fx.scroll =async(l,options={})=>
{
  if (l) l.scrollIntoView(options)
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


aa.fx.scrolled =element=>
{
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
};


// shorten string to only <start>…<end>
aa.fx.short_key =(key,len=6,separator='…')=>
{
  return `${key.slice(0,len)}${separator}${key.slice(-len)}`
};


// sorts element children
aa.fx.sort_l =(l,by)=>
{
  let a = [...l.children].sort(aa.fx.sorts[by]);
  for (const node of a) l.append(node)
};


// trim split and trim more
// returns array
aa.fx.splitr =(string,at=' ')=>
{
  let array = string.trim().split(at).map(item=>item.trim());
  if (array.length === 1 && array[0] === '') return [];
  return array
};


// split at given index
aa.fx.split_at =(a,i=0)=> [a.slice(0,i),a.slice(i)];


// splits string, given '"quoted text" and something else'
// returns ['quoted text','and something else']
aa.fx.split_str =(s='')=>
{
  if (s.startsWith('"" ')) return ['',s.slice(3)];
  else if (s.startsWith('""')) return ['',s.slice(2)];
  let dis = s?.match(aa.regex.str);
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
  let relay = aa.fx.seen(x);
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
  let relay = aa.fx.seen(x);
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
aa.fx.time_upd =element=>
{
  const timestamp = parseInt(element.textContent);
  const date = aa.fx.time_to_date(timestamp);
  fastdom.mutate(()=>
  {
    element.dataset.elapsed = aa.fx.time_elapsed(date);
  })
};




// timeout with delay if called again before for some time
// aa.fx.to =async(f,t,s)=>
// {
//   if (!aa.temp.todo) aa.temp.todo = {};
//   if (Object.hasOwn(aa.temp.todo,s)) clearTimeout(aa.temp.todo[s]);
//   aa.temp.todo[s] = setTimeout(()=>
//   {
//     delete aa.temp.todo[s];
//     f(s);
//   },t);
// };


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
    if (tag) url = aa.fx.url(aa.fx.a_o(tag).url)?.href;
  }
  else url = aa.fx.url(tag[1])?.href;
  return url
};


// (1,'unit') => 1unit
// (21,'unit') => 21units
aa.fx.units =(amount,unit='sat')=>
{
  return `${amount}${aa.fx.plural(amount,unit)}`
}


// converts string to URL
aa.fx.url =string=>
{
  if (!string) return false;
  let url;
  try { url = new URL(string) }
  catch { return false }
  if (!url.hostname.length) return false;
  return url
};


// converts string to URL and returns it or false
aa.fx.is_valid_relay =(url)=>
{
  let protocol_whitelist = [
    'ws:','wss:'];
  if (!url
  || !url.hostname.length
  || url.hostname.includes('.local')
  || url.hostname.includes('127.0.')
  || url.pathname.includes('://')
  || url.href.includes(',')
  || !protocol_whitelist.includes(url.protocol)
  ) return false;
  else return url?.href
};

// verify event object
aa.fx.verify_event =async o=>
{
  let verified;
  try {verified = NostrTools.verifyEvent(o)}
  catch (er){aa.log('unable to verify:' +JSON.stringify(o))};
  return verified
};


// verify request filter object
aa.fx.verify_req_filter =o=>
{
  if (!o 
  || typeof o !== 'object'
  || o.constructor !== Object
  || !Object.keys(o).length) return;
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
          if (v.some(val=>!aa.fx.is_hex(val))) return;
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


window.addEventListener('load',aa.fx.load);