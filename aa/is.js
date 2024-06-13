// it's true or false, boolean stuff, also quantum

aa.is ={};


// alphanumeric and underscore

aa.is.an =s=> aa.regx.an.test(s);


// checks if element has no children and is empty, ignores trailing spaces

aa.is.empty =l=>
{
  if (!l) return true;
  const len = l.childNodes.length;
  if (!len) return true;
  const s = l.childNodes[0].textContent;
  if (len === 1 && (s === ' ' || s === '')) return true;
  return false;
};


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


// it's a valid nostr key

aa.is.key =x=> aa.is.x(x) && x.length === 64; 


// it's tag conditions

aa.is.tag ={};
aa.is.tag.e =a=> aa.is.tax(0,'e',a) && aa.is.x(a[1]);
aa.is.tag.p =a=> aa.is.tax(0,'p',a) && aa.is.x(a[1]);
aa.is.tag.q =a=> aa.is.tax(0,'q',a) && aa.is.x(a[1]);
aa.is.tag.marked =(s,a)=> a[3] && a[3] === s; 
aa.is.tag.root =a=> aa.is.tag.e(a) && aa.is.tag.marked('root',a);
aa.is.tag.reply =a=> aa.is.tag.e(a) && aa.is.tag.marked('reply',a);


// has index value in array

aa.is.tax =(i,v,a)=> a[i] && a[i] === v;


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


// checks if string is valid url and then checks extension for media file types.
// returns false if no media found or array with extension,URL

aa.is.url_type =s=>
{
  let url = aa.is.url(s); 
  if (!url) return false;
  const is_img = ['jpg','jpeg','gif','webp','png','heic'];
  const is_av = ['mp3','mp4','mov','webm'];
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
   
  return check_ext(is_img) ? ['img',url] 
  : check_ext(is_av) ? ['av',url] 
  : ['link',url]
};


// it's hexadecimal

aa.is.x =s=> /^[A-F0-9]+$/i.test(s); 