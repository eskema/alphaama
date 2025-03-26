

// returns false or true if the string is an action
aa.is.act =s=>
{
  const ns = localStorage.ns;
  if (!ns) return false; 
  if (ns.startsWith(s) 
  || s.startsWith(ns+' ') 
  || s === ns
  ) return true;
  return false
};


// is alphanumeric and underscore
//aa.is.an =s=> aa.fx.regex.an.test(s);


// checks if element has no children and is empty, ignores trailing spaces
aa.is.empty =l=>
{
  if (!l) return true;
  const len = l.childNodes.length;
  if (!len) return true;
  else
  {
    if (l.firstChild.nodeType === 3)
    {
      const s = (l.textContent+'').trim();
      if (!s || s === ' ') return true;
    }
  }
  return false;
};


// true if you follow pubkey
aa.is.following =pubkey=>
{
  if (aa.u?.p?.follows?.includes(pubkey)) return true;
  return false
};


// checks if page is loading from iframe
aa.is.iframe =()=>
{
  try {return window.self !== window.top} 
  catch(er) {return true}
};


// is a valid nostr key
aa.is.key =x=> aa.is.x(x) && x.length === 64;


// checks if string is only one character long
aa.is.one =s=>
{
  let a = s.split(' ');
  let seg = a[0];
  try { seg = [...new Intl.Segmenter().segment(a[0])] } 
  catch (error) { console.log('no Intl.Segmenter(), use a better browser')};
  if (seg.length === 1) return true;
  else return false
};


// if hex key is your pubkey
aa.is.u =x=> aa.u?.o?.ls?.pubkey === x;


// converts string to URL and returns it or false
aa.is.url =s=>
{
  let url;
  try {url = new URL(s)}catch(er){}
  return url
};


// returns wether or not a given level is trusted
aa.is.trusted =trust=>
{
  let trust_needed;
  try { trust_needed = parseInt(localStorage.trust) } 
  catch (er) { console.error('!trust',localStorage.trust) }
  if (Number.isInteger(trust_needed) && trust >= trust_needed) return true;
  return false
};


// is hexadecimal
aa.is.x =s=> /^[A-F0-9]+$/i.test(s);