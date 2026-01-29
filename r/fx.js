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
  return fx_id_a(
  {
    kind:event.kind,
    pubkey:event.pubkey,
    identifier:event.tags.find(t=>t[0]==='d')[1],
  })
};


const fx_id_a =o=>
{
  if (!o.kind || typeof o.kind !== 'number') return;
  if (!o.pubkey || !is_key(o.pubkey)) return;
  if (!o.identifier || typeof o.identifier !== 'string') return;
  return `${o.kind}:${o.pubkey}:${o.identifier}`;
};


// make request filter from addressable string
const fx_id_af =string=>
{
  let [kind,pubkey,identifier] = fx_split_ida(string);
  return {
    kinds:[parseInt(kind)],
    authors:[pubkey],
    '#d':[identifier]
  }
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