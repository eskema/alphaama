// load alphaama
aa.load({
  // override defaults
  // styles:[], scripts:[], mods:[], 
}).then(e=>whateverthefuckyouwant());

const build_page =async()=>
{
  aa.el.get('side')?.append(aa.mod_l);
  aa.cli.on_collapse.push(aa.logs_read);
  aa.log(aa.mk.status(),0,0);
  
  let p_section;
  if (aa.p?.l) 
    p_section = aa.mk.section({id:'p',element:aa.p.l,filter:true});
  
  let e_section;
  if (aa.e?.l) 
  {
    e_section = aa.mk.section(
    {
      id: 'e',
      element: aa.e.l,
      map: aa.e.printed,
      filter: true,
      filter_by: i=> i.classList.contains('root'),
      order: 'desc',
      max: parseInt(localStorage.pagination),
      sort_by: i=> i.dataset.stamp,
    });
  }
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
};

const whateverthefuckyouwant =async()=>
{
  aa.mk.page();
  await build_page();
};
