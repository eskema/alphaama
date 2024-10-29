/*

alphaama
mod    w
wallnuts
wallnut
wall_ut
wallut

*/

aa.w = 
{
  def:{id:'w',ls:{},mints:{}}
};


// add wallut
aa.w.add =s=>
{
  aa.cli.clear();
  let wid = aa.fx.an(s.trim());
  let invalid = !wid || aa.w.o.ls.hasOwnProperty(wid) || wid === 'off';
  if (invalid) 
  {
    aa.log('invalid wid: '+wid);
    return
  }

  aa.w.o.ls[wid] = 
  {
    balance:0,
    unit:'sat',
    mints:[],
    relays:[],
  }
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// make w mod item
aa.w.mk =(k,v)=>
{
  let l = aa.mk.item(k,v);
  l.id = aa.w.def.id+'_'+k;
  let details = l.querySelector('details');
  let action = `${aa.w.def.id} rm ${k}`;
  details.append(aa.mk.butt_action(action,'rm','rm'));
  
  let relays = [];
  for (const r of v.relays) relays.push(...aa.fx.in_set(aa.r.o.ls,r));
  l.querySelector('.item_relays').dataset.sets = relays;
  
  let mints = [];
  for (const m of v.mints) mints.push(...aa.fx.in_set(aa.m.o.ls,m));
  l.querySelector('.item_mints').dataset.sets = mints;

  return l
};


// on load
aa.w.load =()=>
{ 
  aa.actions.push(
    {
      action:['w','add'],
      required:['wid','mint'],
      optional:['mint'],
      description:'add wallnut',
      exe:aa.w.add
    },
    {
      action:['w','rm'],
      required:['wid'],
      description:'remove wallnut',
      exe:aa.w.rm
    },
    {
      action:['w','r'],
      required:['relset'],
      description:'set relays to wallnut',
      exe:aa.w.r
    },
    {
      action:['w','m'],
      required:['mintset'],
      description:'set mints to wallnut',
      exe:aa.w.m
    },
  );
  aa.mod_load(aa.w).then(mod=>
  {
    aa.mk.mod(mod);
    mod.l.append(aa.mk.butt_action(`${mod.def.id} add `,'+','add'));
  });
};


// remove wallut(s)
aa.w.rm =s=>
{
  aa.cli.clear();
  
  const work =a=>
  {
    let k = a.shift();
    if (aa.w.o.ls.hasOwnProperty(k)) 
    {
      delete aa.w.o.ls[k];
      document.getElementById(aa.w.def.id+'_'+aa.fx.an(k)).remove();
      aa.log(aa.w.def.id+' wallut removed: '+k);
    }
    else aa.log(aa.w.def.id+' '+k+' not found')
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.w);
};


// define mint sets to wallnut
aa.w.m =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].mints = a;
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// define relay sets to wallnut
aa.w.r =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].relays = a;
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};

window.addEventListener('load',aa.w.load);