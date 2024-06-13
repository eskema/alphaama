// it deep art mente

const it =
{
  l:document.documentElement,
  mk:{},
};







// confirm dialog

aa.confirm =async o=>
{
  const dialog = aa.get.dialog();
  if (!dialog || dialog.open) return false;

  if (o.title) dialog.title = o.title;
  
  if (o.hasOwnProperty('l')) dialog.append(o.l);
  
  const dialog_options = aa.mk.l('p',{id:'dialog_options'});
  const dialog_no = aa.mk.l('button',
  {
    con:o.no.title ?? 'cancel',
    cla:'butt cancel',
    clk:e=>{ o.no.exe(); dialog.close()}
  });
  dialog_no.setAttribute('autofocus',true);
  const dialog_yes = aa.mk.l('button',
  {
    con:o.yes.title ?? 'confirm',
    cla:'butt confirm',
    clk:e=>{ o.yes.exe(); dialog.close()}
  });
  dialog_options.append(dialog_no,dialog_yes);
  dialog.append(dialog_options);
  dialog.showModal();
  if (o.scroll) dialog.scrollTop = dialog.scrollHeight;
};





// log a notice

aa.notice =async o=>
{
  // o =
  // {
  //   title:'',
  //   description:'',
  //   no:{title:'',exe:()=>{}},
  //   yes:{title:'',exe:()=>{}},
  // }

  let l = aa.mk.l('div',{cla:'notice'});
  if (o.hasOwnProperty('title')) 
  {
    l.append(aa.mk.l('p',{cla:'title',con:o.title}));
  }
  if (o.hasOwnProperty('description')) 
  {
    l.append(aa.mk.l('p',{cla:'description',con:o.description}));
  }
  if (o.hasOwnProperty('no'))
  {
    l.append(aa.mk.l('button',{con:o.no.title,cla:'butt no',clk:o.no.exe}));
  } 
  if (o.hasOwnProperty('yes'))
  {
    l.append(aa.mk.l('button',{con:o.yes.title,cla:'butt yes',clk:o.yes.exe}));
  }
  aa.log(l);
};


// useful regex

aa.regx = 
{
  get an() {return /^[A-Z_0-9]+$/i},
  get hashtag(){ return /(\B[#])\w+/g},
  get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi},
  get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi},
  get nostr() { return /((nostr:)[A-Z0-9]*)\b/gi},
  get url(){ return /https?:\/\/([a-zA-Z0-9\.\-]+\.[a-zA-Z]+)([\p{L}\p{N}\p{M}&\.-\/\?=#\-@%\+_,:!~\/\*]*)/gu}, 
};





// stuff to run on load

aa.stuff =()=>
{
  if (aa.is.rigged()) aa.l.classList.add('rigged');
  aa.wl.lock();
  aa.fx.scrolled();
};


// timeout
// delays function if not called again before for some time

aa.to =(f,t,s)=>
{
  if (!aa.todo) aa.todo = {};
  if (aa.todo.hasOwnProperty(s)) clearTimeout(aa.todo[s]);
  aa.todo[s] = setTimeout(f,t);
};


// wakelock

aa.wl = {wakelock:null,get haz_wakelock(){return 'wakeLock' in navigator}};


// wakelock
// prevent screen from going to sleep if tab is active

aa.wl.lock =async()=>
{
  if (!aa.wl.haz_wakelock) return;
  try 
  {
    aa.wl.wakelock = await navigator.wakeLock.request();
    const m =()=>{console.log('wake state locked:',!aa.wl.wakelock.released)};
    aa.wl.wakelock.addEventListener('release',m);
    m();
  } 
  catch(er){ console.error('failed to lock wake state:', er.message) }
  // setTimeout(aa.wl.release, 5000);
};


// wakelock
// release screen from locked state

aa.wl.release =()=>
{
  if (aa.wl.wakelock) aa.wl.wakelock.release();
  aa.wl.wakelock = null;
};







