// it's true or false, boolean stuff, also quantum
it.s ={};

// alphanumeric and underscore
it.s.an =s=> it.regx.an.test(s);

// checks if element has no children and is empty, ignores trailing spaces
it.s.empty =l=>
{
  if (!l) return true;
  const len = l.childNodes.length;
  if (!len) return true;
  const s = l.childNodes[0].textContent;
  if (len === 1 && (s === ' ' || s === '')) return true;
  return false;
};

// checks if string is only one character long
it.s.one =s=>
{
  let a = s.split(' ');
  let seg = a[0];
  try { seg = [...new Intl.Segmenter().segment(a[0])] } 
  catch (error) { console.log('no Intl.Segmenter(), use a better browser')};
  if (seg.length === 1) return true;
  else return false
};

// checks if page is loading from iframe
it.s.rigged =()=>
{
  try {return window.self !== window.top} 
  catch(er) {return true}
};

// converts string to URL and returns it or false
it.s.url =s=>
{
  let url;
  try { url = new URL(s) } 
  catch(er) {} // console.log('not url '+s)
  return url
};

// it's a valid nostr key
it.s.key =x=> it.s.x(x) && x.length === 64; 

// it's tag conditions
it.s.tag ={};
it.s.tag.e =a=> it.s.tax(0,'e',a) && it.s.x(a[1]);
it.s.tag.p =a=> it.s.tax(0,'p',a) && it.s.x(a[1]);
it.s.tag.q =a=> it.s.tax(0,'q',a) && it.s.x(a[1]);
it.s.tag.marked =(s,a)=> a[3] && a[3] === s; 
it.s.tag.root =a=> it.s.tag.e(a) && it.s.tag.marked('root',a);
it.s.tag.reply =a=> it.s.tag.e(a) && it.s.tag.marked('reply',a);

// has index value in array
it.s.tax =(i,v,a)=> a[i] && a[i] === v;

// returns wether or not a given level is trusted
it.s.trusted =trust=>
{
  let trust_needed;
  try { trust_needed = parseInt(localStorage.trust) } 
  catch (er) { console.error('!trust',localStorage.trust) }
  if (Number.isInteger(trust_needed) && trust >= trust_needed) return true;
  return false
};

// returns user trust
it.s.trust_x =x=> it.s.trusted(aa.p[x]?.trust ?? 0);

// checks if string is valid url and then checks extension for media file types.
// returns false if no media found or array with extension,URL
it.s.url_type =s=>
{
  let url = it.s.url(s); 
  if (!url) return false;
  
  const src = url.origin + url.pathname;
  const low = src.toLowerCase();
  const is_img = ['jpg','jpeg','gif','webp','png'];
  const is_av = ['mp3','mp4','mov','webm'];
  const check_ext =extensions=>
  {
    for (const ext of extensions)
    {
      if (low.endsWith('.'+ext)
      || (url.searchParams.has('format') && url.searchParams.get('format') === ext)) 
      return true
    }
    return false
  };
   
  return check_ext(is_img) ? ['img',url] : check_ext(is_av) ? ['av',url] : ['link',url]
};

// it's hexadecimal
it.s.x =s=> /^[A-F0-9]+$/i.test(s); 