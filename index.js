// load alphaama
aa.load({
  // override defaults
  // styles:[], scripts:[], mods:[], 
}).then(e=>whateverthefuckyouwant());

const build_page =async()=>
{
  aa.el.get('side')?.append(aa.mod_l);
  aa.bus.on('cli:collapse',aa.logs_read);
  aa.log(aa.mk.status(),{is_new:false});
  
  let p_section;
  if (aa.p?.l) 
    p_section = aa.mk.section({id:'p',element:aa.p.l,filter:true});
  
  let m_section;
  if (aa.m?.l) m_section = aa.mk.section_m();

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
    elements.append(p_section,' ',m_section,' ',e_section);
    fastdom.mutate(()=>
    {
      view.append(elements)
    });
  }

  aa.q?.last_butts();
};

const whateverthefuckyouwant =async()=>
{
  aa.mk.page();
  await build_page();
};
