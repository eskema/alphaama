// load alphaama
aa.load({
  // override defaults
  // styles:[], scripts:[], mods:[], 
}).then(e=>{whateverthefuckyouwant()});
const whateverthefuckyouwant =async()=>
{
  console.log('on_loaded');

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
    let elements = new DocumentFragment();
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
      aa.view.l.append(elements)
    });
  }

  aa.q?.last_butts();
};