// now
const now =()=> Math.floor(Date.now()/1000);

// converts string to URL and returns it or false
const is_valid_url =(s='')=>
{
  if (!s) return;
  let url;
  try { url = new URL(s) }
  catch(er) { console.trace(s); return }
  
  let protocol_whitelist = [
    // 'http:','https:',
    'ws:','wss:'];

  if (!url.hostname.length
  || url.hostname.includes('.local')
  || url.hostname.includes('127.0.')
  || url.pathname.includes('://')
  || !protocol_whitelist.includes(url.protocol)
  ) return;
  else return url?.href
};


const fx_id_ae =event=>
{
  // missing d tag defaults to empty string (addressable event "default" instance)
  let d_tag = event.tags.find(t=>t[0]==='d');
  let identifier = d_tag && typeof d_tag[1] === 'string' ? d_tag[1] : '';
  return fx_id_a(
  {
    kind:event.kind,
    pubkey:event.pubkey,
    identifier,
  })
};


const fx_id_a =o=>
{
  if (typeof o.kind !== 'number' || Number.isNaN(o.kind)) return;
  if (!o.pubkey || !is_key(o.pubkey)) return;
  // identifier may be the empty string ("default" instance of an addressable event)
  if (typeof o.identifier !== 'string') return;
  return `${o.kind}:${o.pubkey}:${o.identifier}`;
};


// make request filter from addressable string
// empty identifier → #d:[""] so we match only the default instance
const fx_id_af =string=>
{
  let [kind,pubkey,identifier] = fx_split_ida(string);
  let filter = {
    kinds:[parseInt(kind)],
    authors:[pubkey],
  };
  if (typeof identifier === 'string') filter['#d'] = [identifier];
  return filter
};


const fx_split_ida =ida=>
{
  let a = ida.split(':');
  let kind = a.shift();
  let pubkey = a.shift();
  let identifier = a.length > 1 ? a.join(':') : a[0];
  return [kind,pubkey,identifier]
};



// is hexadecimal
const is_x =s=> /^[A-F0-9]+$/i.test(s);


// is a valid nostr key
const is_key =x=> is_x(x) && x.length === 64;


// Fisher-Yates shuffle, returns a new array
const shuffle =a=>
{
  let b = [...a];
  for (let i = b.length - 1; i > 0; i--)
  {
    let j = Math.floor(Math.random() * (i + 1));
    [b[i],b[j]] = [b[j],b[i]];
  }
  return b
};