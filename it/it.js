// it dep art ment
const it ={};

// useful regex
it.regx = 
{
  get an() {return /^[A-Z_0-9]+$/i},
  get nostr() { return /((nostr:)[A-Z0-9]*)\b/gi},
  get url(){ return /https?:\/\/([a-zA-Z0-9\.\-]+\.[a-zA-Z]+)([\p{L}\p{N}\p{M}&\.-\/\?=#\-@%\+_,:!~\/\*]*)/gu},
  get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi},
  get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi},
};

// sorting functions to use in .sort()
it.sort_by =
{
  text_asc(a,b){return a.textContent.toLowerCase() > b.textContent.toLowerCase() ? 1 : -1},
  text_desc(a,b){return a.textContent.toLowerCase() < b.textContent.toLowerCase() ? 1 : -1},
  // switch (s)
  // {
  //   case 'text_asc': return (a,b)=> a.textContent.toLowerCase() > b.textContent.toLowerCase() ? 1 : -1;
  //   case 'text_desc': return (a,b)=> a.textContent.toLowerCase() < b.textContent.toLowerCase() ? 1 : -1;
  //   case 'desc': return (a,b)=> b[1] - a[1] ? 1 : -1;
  //   case 'rand': return ()=> 0.5 - Math.random();
  //   case 'asc': 
  //   default: return (a,b)=>a[1] - b[1] ? 1 : -1;
  // }
};

// scroll with delay
it.scroll =(l,options={})=> setTimeout(()=>{l.scrollIntoView(options)},50);

// timeout
// delays function if not called again before for some time
it.to =(f,t,s)=>
{
  if (!it.todo) it.todo = {};
  if (it.todo.hasOwnProperty(s)) clearTimeout(it.todo[s]);
  it.todo[s] = setTimeout(f,t);
};

// prevent screen from going to sleep if tab is active
it.wl = {wakelock:null,get haz_wakelock(){return 'wakeLock' in navigator}};
it.wl.lock =async()=>
{
  if (!it.wl.haz_wakelock) return;
  try 
  {
    it.wl.wakelock = await navigator.wakeLock.request();
    const m =()=>{console.log('wake state locked:',!it.wl.wakelock.released)};
    it.wl.wakelock.addEventListener('release',m);
    m();
  } 
  catch(er){ console.error('failed to lock wake state:', er.message) }
};
it.wl.release =()=>
{
  if (it.wl.wakelock) it.wl.wakelock.release();
  it.wl.wakelock = null;
};
// setTimeout(it.wl.release, 5000);