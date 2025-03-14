// load alphaama
aa.load({
  // override defaults
  // styles:[], tools:[], mods:[],
}).then(e=>
{
  window.addEventListener('load',e=>
  {
    // run with defaults
    aa.run();
    on_loaded()
  });
});

const on_loaded =()=>
{
  if (!aa.required(aa.mods.map(i=>i.id)))
  {
    setTimeout(on_loaded,10);
    return
  }

  if (aa.p?.l) aa.mk.section('p',false,aa.p.l);
  if (aa.e?.l) 
  {
    let e_section = aa.mk.section('e',false,aa.e.l);
    // setTimeout(()=>{
      e_section.append(aa.mk.pagination())
    // },10);
  }

  let p = aa.u?.p;
  if (p)
  {
    aa.mk.profile(p);
    if (p.events.k3?.length) aa.p.load_profiles(p.follows);
  }

  setTimeout(()=>
  {
    if (sessionStorage.q_run) 
    {
      let run = `q run ${sessionStorage.q_run}`;
      // setTimeout(()=>{
        aa.log(aa.mk.butt_action(run))
      // },100);
    }
    if (sessionStorage.q_out) 
    {
      let out = `q out ${sessionStorage.q_out}`;
      // setTimeout(()=>{
        aa.log(aa.mk.butt_action(out))
      // },200);
    }
  },200);

  fetch('/README.adoc').then(dis=>dis?.text()).then(text=>
  {
    if (!text) return;
    let article = aa.mk.l('article',
    {
      cla:'content parsed',
      app:aa.parse.content(text,aa.is.trusted(4))
    });

    let title = text.slice(0,text.indexOf('\n'));
    if (title.startsWith('=') || title.startsWith('#')) 
      title = title.slice(1).trim();
    
    let details = aa.mk.details(title,article);
    details.id = 'aa_read_me';
    aa.view.l?.prepend(details); 
  });

  // aa.u.worker = new Worker('/local/worker.js');
  // aa.u.worker.onmessage =e=>{console.log(e.data)}

};