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
    on_loaded();
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

  let p_section;
  if (aa.p?.l) 
    p_section = aa.mk.section({id:'p',element:aa.p.l,filter:true});
  
  let e_section;
  if (aa.e?.l) 
  {
    e_section = aa.mk.section({id:'e',element:aa.e.l,filter:true});
    e_section.append(aa.mk.pagination());
  }

  if (aa.view.l) 
  {
    fastdom.mutate(()=>{aa.view.l.append(p_section,' ',e_section)});

    let p = aa.u?.p;
    if (p)
    {
      aa.mk.profile(p);
      if (p.follows.length) aa.p.load_profiles(p.follows);
    }

    let readme = await aa.fx.readme('/README.adoc');
    if (readme) 
      fastdom.mutate(()=>{aa.view.l.prepend(aa.mk.doc(readme))});
  }

  aa.q.last_butts();
};