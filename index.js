// load alphaama
aa.load({
  // override defaults
  // styles:[], tools:[], mods:[],
}).then(e=>
{
  console.log('aa.load.then');
  window.addEventListener('load',e=>
  {
    // run with defaults
    console.log('onload before run');
    aa.run();
    console.log('onload after run, before on_loaded');
    on_loaded()
    console.log('onload after on_loaded');
  });
});

const on_loaded =()=>
{
  if (!aa.is.mods_loaded(aa.mods.map(i=>i.id)))
  {
    setTimeout(on_loaded,10);
    return
  }

  if (aa.p?.l) aa.mk.section('p',false,aa.p.l);
  if (aa.e?.l) 
  {
    let e_section = aa.mk.section('e',false,aa.e.l);
    setTimeout(()=>{e_section.append(aa.mk.pagination())},200);
  }

  let p = aa.u?.p;
  if (p)
  {
    aa.p.profile(p);
    if (p.events.k3?.length) aa.p.load_profiles(p.follows);
  }

  setTimeout(()=>
  {
    if (sessionStorage.q_run) 
    {
      let run = `q run ${sessionStorage.q_run}`;
      setTimeout(()=>{aa.log(aa.mk.butt_action(run))},200);
    }
    if (sessionStorage.q_out) 
    {
      let out = `q out ${sessionStorage.q_out}`;
      setTimeout(()=>{aa.log(aa.mk.butt_action(out))},600);
    }
  },600);

  fetch('/README.adoc').then(dis=>dis?.text())
  .then(text=>
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
    aa.view?.prepend(details);
  });
};