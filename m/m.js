/*

alphaama
mod    m
mints

*/
aa.m = 
{
  def:{id:'m',ls:{}},
};


// add mints
aa.m.add =s=>{ aa.mod_servers_add(aa.m,s) };


// on load
aa.m.load =()=>
{
  aa.actions.push(
    {
      action:[aa.m.def.id,'add'],
      required:['url'], 
      optional:['set'], 
      description:'add or replace mints',
      exe:aa.m.add
    },
    {
      action:[aa.m.def.id,'rm'],
      required:['url'], 
      description:'remove relay',
      exe:aa.m.rm
    },
    {
      action:[aa.m.def.id,'setrm'],
      required:['url','set'],
      description:'remove set from relays',
      exe:s=>aa.mod_setrm(aa.m,s)
    },
  );
  aa.mod_load(aa.m).then(mod=>
  {
    aa.mk.mod(mod);
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+','add');
    mod.l.insertBefore(add_butt,document.getElementById(mod.def.id));
  });
}


// make m mod item
aa.m.mk =(k,v) =>
{
  const l = aa.mk.server(k,v);
  if (l)
  {
    l.id = aa.m.def.id+'_'+aa.fx.an(k);
    aa.mod_servers_butts(aa.m,l,v)
    return l
  }
  else return false
};


// remove mint(s)
aa.m.rm =s=>
{  
  const work =a=>
  {
    const url = aa.is.url(a.shift().trim())?.href;
    if (url && aa.m.o.ls[url])
    {
      delete aa.m.o.ls[url];
      document.getElementById(aa.m.def.id+'_'+aa.fx.an(url)).remove();
    }
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.m);
};


window.addEventListener('load',aa.m.load);