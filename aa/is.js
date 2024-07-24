/*

alphaama
boolish stuff

*/


// returns false or true if the string is an action
aa.is.act =s=>
{
  const ns = localStorage.ns;
  if (ns 
  && (ns.startsWith(s) || s.startsWith(ns+' ') || s === ns)
  ) return true;
  return false
};


// is alphanumeric and underscore
aa.is.an =s=> aa.regx.an.test(s);


// checks if element has no children and is empty, ignores trailing spaces
aa.is.empty =l=>
{
  if (!l) return true;
  const len = l.childNodes.length;
  if (!len) return true;
  const s = (l.textContent+'').trim();
  if (!s || s === ' ') return true;
  return false;
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

// checks if browser is connected
aa.is.online =()=> navigator.onLine;


// checks if page is loading from iframe
aa.is.rigged =()=>
{
  try {return window.self !== window.top} 
  catch(er) {return true}
};


// converts string to URL and returns it or false
aa.is.url =s=>
{
  let url;
  try { url = new URL(s) } catch(er) {}
  return url
};


// is tag conditions
aa.is.tag ={};
aa.is.tag.e =a=> a[0]==='e' && aa.is.x(a[1]);
aa.is.tag.p =a=> a[0]==='p' && aa.is.x(a[1]);
aa.is.tag.q =a=> a[0]==='q' && aa.is.x(a[1]);


// returns wether or not a given level is trusted
aa.is.trusted =trust=>
{
  let trust_needed;
  try { trust_needed = parseInt(localStorage.trust) } 
  catch (er) { console.error('!trust',localStorage.trust) }
  if (Number.isInteger(trust_needed) && trust >= trust_needed) return true;
  return false
};


// returns user trust
aa.is.trust_x =x=> aa.is.trusted(aa.db.p[x]?.trust ?? 0);


// is hexadecimal
aa.is.x =s=> /^[A-F0-9]+$/i.test(s); 