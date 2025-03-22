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
    e_section.append(aa.mk.pagination())
  }

  let p = aa.u?.p;
  if (p)
  {
    aa.mk.profile(p);
    if (p.events.k3?.length) aa.p.load_profiles(p.follows);
  }

  fetch('/README.adoc').then(dis=>dis?.text())
  .then(text=>{aa.view.l?.prepend(aa.mk.doc(text))});

  if (sessionStorage.q_run)
    aa.log(aa.mk.butt_action(`q run ${sessionStorage.q_run}`))
  
  if (sessionStorage.q_out)
    aa.log(aa.mk.butt_action(`q out ${sessionStorage.q_out}`))

};