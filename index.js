// load alphaama
aa.load({
  // override defaults
  // styles:[], scripts:[], mods:[], 
}).then(e=>whateverthefuckyouwant());

const build_page =async()=>
{
  aa.el.get('side')?.append(aa.mod_l);
  aa.bus.on('cli:collapse',aa.logs_read);
  aa.log(aa.mk.status(),{is_new:false, first:true});
  
  let p_section;
  if (aa.p?.l) 
    p_section = aa.mk.section({id:'p',element:aa.p.l,filter:true});
  
  let e_section;
  if (aa.e?.l) e_section = aa.mk.section_e();

  let view = aa.el.get('view');
  if (view)
  {
    let elements = make();
    let p = aa.u?.p;
    if (p)
    {
      aa.mk.profile(p);
      if (p.follows.length)
        aa.p.load_profiles(p.follows);
    }

    let readme = await aa.fx.readme('/README.adoc');
    if (readme) elements.append(aa.mk.doc(readme),' ');
    elements.append(p_section,' ',e_section);
    fastdom.mutate(()=>
    {
      view.append(elements)
    });
  }

  aa.q?.last_butts();

  // gate — nothing that logs, fetches or restores state may run before
  // "online at" and last_butts are in place. modules hook their background
  // work off aa.mod.ready('page:ready', ...) so the log header is always
  // the first thing the user sees.
  aa.mod.fire_ready('page:ready');
};

const whateverthefuckyouwant =async()=>
{
  aa.mk.page();
  await build_page();
};
