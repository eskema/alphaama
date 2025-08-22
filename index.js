// load alphaama
aa.load({
  // override defaults
  // styles:[], tools:[], mods:[],
}).then(e=>
{
  window.addEventListener('load',()=>
  {
    // build page layout elements
    aa.mk.page();
    on_loaded()
  })
});

// page script
const on_loaded =async()=>
{
  // make sure all mods have loaded properly
  if (!aa.required(aa.def.mods.map(i=>i.id)))
  {
    // console.log('not_loaded');
    setTimeout(on_loaded,11);
    return
  }

  if (aa.p?.l) aa.mk.section('p',0,aa.p.l,1);
  if (aa.e?.l) 
  {
    let e_section = aa.mk.section('e',0,aa.e.l,1);
    fastdom.mutate(()=>{e_section.append(aa.mk.pagination())});
  }

  let p = aa.u?.p;
  if (p)
  {
    aa.mk.profile(p);
    if (p.follows.length) aa.p.load_profiles(p.follows);
  }

  let readme = await aa.readme_setup('/README.adoc');
  if (readme) aa.view.l?.prepend(aa.mk.doc(readme));

  aa.q.last_butts();
};