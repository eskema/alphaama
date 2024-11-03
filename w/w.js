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
  def:{id:'w',ls:{}},
  requires:['r','m'],
};


// add wallut
aa.w.add =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = aa.fx.an(a.shift());
  let invalid = !wid || aa.w.o.ls.hasOwnProperty(wid) || wid === 'off';
  if (invalid) 
  {
    aa.log('invalid wid: '+wid);
    return
  }
  const w = aa.w.o.ls[wid] = 
  {
    balance:0,
    unit:'sat',
    mints:[],
    relays:[],
  }

  if (a.length)
  {
    let pubkey = a.shift().trim();
    if (aa.is.key(pubkey)) w.pubkey = pubkey;
  }

  if (a.length) w.unit = a.shift().trim();

  if (a.length) w.mints.push(a.shift().trim());
  if (a.length) w.relays.push(a.shift().trim());
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// make w mod item
aa.w.mk =(k,v)=>
{
  let l = aa.mk.item(k,v);
  let id = aa.w.def.id;
  l.id = id+'_'+k;
  // const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  // l.append(
  //   aa.mk.butt_action(id+' set '+k+' '+v,k,'key'),
  //   ' ',
  //   aa.mk.item_v(k,v)
  // );

  let details = l.querySelector('details');
  details.append(aa.mk.butt_action(`${id} rm ${k}`,'rm','rm'));
  
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
  let mod = aa.w;
  let id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['wid'],
      optional:['pubkey','unit','mintset','relset'],
      description:'add wallnut',
      exe:mod.add
    },
    {
      action:[id,'del'],
      required:['wid'],
      description:'delete wallnut',
      exe:mod.del
    },
    {
      action:[id,'pubkey'],
      required:['wid','hex_pubkey'],
      description:'set pubkey to wallnut',
      exe:mod.pubkey
    },
    {
      action:[id,'unit'],
      required:['wid','unit'],
      description:'set unit to wallnut',
      exe:mod.unit
    },
    {
      action:[id,'relays'],
      required:['wid','relset'],
      optional:['relset'],
      description:'set relay sets to wallnut',
      exe:mod.relays
    },
    {
      action:[id,'mints'],
      required:['wid','mintset'],
      optional:['mintset'],
      description:'set mint sets to wallnut',
      exe:mod.mints
    },
    {
      action:[id,'upd'],
      required:['wid'],
      description:'create kind-10019',
      exe:mod.upd
    },
  );
  aa.mod_load(mod).then(mod.start);
};

aa.w.start =mod=>
{
  if (aa.mods_required(mod)) 
  {
    aa.mk.mod(mod);
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+','add');
    mod.l.insertBefore(add_butt,document.getElementById(mod.def.id));
  }
  else setTimeout(()=>{aa.w.start(mod)}, 200);
};


// remove wallut(s)
aa.w.del =s=>
{
  aa.cli.clear();
  
  const work =a=>
  {
    let k = a.shift();
    if (aa.w.o.ls.hasOwnProperty(k)) 
    {
      delete aa.w.o.ls[k];

      document.getElementById(aa.w.def.id+'_'+aa.fx.an(k)).remove();
      aa.log(aa.w.def.id+' wallut deleted: '+k);
    }
    else aa.log(aa.w.def.id+' '+k+' not found')
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.w);
};


// define mint sets to wallnut
aa.w.mints =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].mints = a;
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// define relay sets to wallnut
aa.w.relays =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].relays = a;
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// define unit of wallnut
aa.w.unit =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].unit = a.shift();
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// update kind-10019 
aa.w.upd =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.log('w '+wid);
};


// event template for wallnut
aa.kinds[10019] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.new_replaceable(p,dat.event))
    {
      
      // let relays = aa.r.from_tags(dat.event.tags,['k10002']);
      // aa.p.relays_add(relays,p);
      // if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
      // aa.p.save(p);
    }
    // let profile = document.getElementById(p.npub);
    // if (!profile) profile = aa.p.profile(p);
  });
  //const o = {mints:[],relays:[],pubkeys:[]};
  //for (const m of dat.event.tags.filter(t=>t[0]==='mint')) o.mints.push(m.slice(1).join(' '));
  //for (const m of dat.event.tags.filter(t=>t[0]==='relay')) o.relays.push(m.slice(1).join(' '))
  //for (const m of dat.event.tags.filter(t=>t[0]==='p')) o.pubkeys.push(m.slice(1).join(' '))
  // o.mints = dat.event.tags.filter(t=>t[0]==='mint').slice(1).join(' ');
  // o.relays = dat.event.tags.filter(t=>t[0]==='relay').slice(1).join(' ');
  // o.pubkeys = dat.event.tags.filter(t=>t[0]==='p').slice(1).join();
  
  // aa.parse.content_o(o,note);
  note.querySelector('.content').textContent = 'nutsack';
  let tags = note.querySelector('.tags_wrapper');
  tags.setAttribute('open','');
  
  return note
};


window.addEventListener('load',aa.w.load);