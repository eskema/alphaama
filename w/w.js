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

  let a = s.trim().split(' ');
  let wid = aa.fx.an(a.shift().trim());
  if (!wid || wid === 'off') 
  {
    aa.log('invalid wid');
    return
  }
  if (!aa.w.o.ls[wid]) aa.w.o.ls[wid] = 
  {
    balance:0,
    unit:'sat',
    sets:[],    
  }
  aa.fx.a_add(aa.w.o.ls[wid].sets,a);
  aa.mod_ui(aa.w,wid,aa.w.o.ls[wid]);
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
      description:'rm wallnut',
      exe:aa.w.rm
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

window.addEventListener('load',aa.w.load);