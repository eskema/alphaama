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

  let d_section;
  if (aa.d?.l) d_section = aa.mk.section(
  {
    id:'d', name:'d', element:aa.d.l,
    clk: e =>
    {
      let s = aa.el.get('section_d');
      let collapsing = s?.classList.contains('expanded');
      aa.clk.expand(e);
      if (collapsing && aa.d.active) aa.d.view_clear();
    }
  });
  if (d_section) d_section.firstElementChild.append(make('h2', {con:'double ratchet messages'}));

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
    elements.append(p_section,' ',d_section,' ',m_section,' ',e_section);
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
