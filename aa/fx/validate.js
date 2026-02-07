/*

alphaama
fx: validation & checks

*/


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
