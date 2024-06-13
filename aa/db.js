// storage and database stuff

aa.db = 
{
  e:{},
  p:{},
  q:{},
  sn:'db'
};

// Web Cache
document.head.append(aa.mk.l('script',{src:'/aa/db_cache.js'}));
// IndexedDB
document.head.append(aa.mk.l('script',{src:'/aa/db_idb.js'}));


// aa.db.clear =async a=> aa.db.idb.clear(a);

// put in database

aa.db.put =async o=> aa.db.idb.put(o);


// get from database

aa.db.get =async o=> await aa.db.idb.ops(o);





// returns event if already loaded or get it from database

aa.db.get_e =async xid=>
{
  if (aa.db.e[xid]) return aa.db.e[xid];  
  let dat = await aa.db.idb.ops({get:{store:'events',key:xid}});
  if (dat) aa.db.e[xid] = dat;
  return dat
};


// 

aa.db.merge_e =dat=>
{
  const xid = dat.event.id;
  if (!aa.db.e[xid])
  {
    aa.db.e[xid] = dat;
    return dat;
  } 
  else 
  {
    const merged = aa.fx.merge(aa.db.e[xid],dat);
    if (merged) 
    {
      aa.db.e[xid] = merged;
      return merged
    }
    else return false
  }
};

aa.db.upd_e =async dat=>
{
  const id = 'upd_e';
  if (!aa.db.q[id]) aa.db.q[id] = {};
  let merged = aa.db.merge_e(dat);
  if (merged) aa.db.q[id][dat.event.id] = merged;

  aa.to(()=>
  {
    const q = Object.values(aa.db.q[id]);
    aa.db.q[id] = {};
    if (q.length) aa.db.idb.worker.postMessage({upd_e:{store:'events',a:q}});
  },2000,id);
};


aa.db.some =async s=>
{
  aa.cli.fuck_off();
  const a = s.trim().split(' ');
  const n = a.shift();
  const direction = a.shift();
  const db_op = {};
  db_op.n = n ? parseInt(n) : 1;
  db_op.direction = direction && direction === 'next' ? 'next' : 'prev';
  let o = {some:db_op};
  aa.log(localStorage.ns+' '+aa.db.sn+' some '+db_op.n);
  const db = aa.db.idb.new;
  db.onmessage=e=>
  {
    // console.log('aa.db.some',e.data);
    for (const dat of e.data) aa.e.print(dat);
    setTimeout(()=>{db.terminate()},200);
  }
  db.postMessage(o);
};

aa.db.view =s=>
{
  console.log(s);
  aa.cli.fuck_off();
  aa.state.view(s.trim());
};

window.addEventListener('load',()=>
{
  aa.actions.push(
    {
      action:[aa.db.sn,'some'],
      required:['number'],
      optional:['next'],
      description:'request n events from db',
      exe: aa.db.some
    },
    {
      action:[aa.db.sn,'view'],
      required:['id'],
      description:'load event',
      exe: aa.db.view
    }
  );
});


aa.db.mod_load =async mod=>
{
  console.log(mod);
  let mod_o = mod.o;

  if (!mod_o) 
  {
    mod_o = await aa.db.get({get:{store:'stuff',key:mod.def.id}});
    if (mod_o) mod.o = mod_o;
    else if (!mod_o && mod.old_id)
    {
      // in case the db key path changes, import to new key id
      // if old_id is found
      mod_o = await aa.db.get({get:{store:'stuff',key:mod.old_id}});
      if (mod_o)
      {
        mod_o.id = mod.def.id;
        mod.o = mod_o;
        aa.db.mod_save(mod);
      }
    }
    if (!mod_o && mod.def) mod.o = mod.def;
  }
  if (!mod.o.ls) mod.o.ls = {};
  return mod
};

aa.db.mod_save = async mod=>
{
  return new Promise(resolve=>
  {
    console.log(mod);
    if (mod && mod.o && mod.o.id)
    {
      aa.db.put({put:{store:'stuff',a:[mod.o]}});
    }
    resolve(mod)
  })  
};


// update ui options element

aa.db.mod_item_upd =(mod,k,v)=>
{
  let cur = document.getElementById(mod.def.id+'_'+k);
  let l = mod.hasOwnProperty('mk') ? mod.mk(k,v) : aa.mk.item(k,v);
  if (!cur) document.getElementById(mod.def.id).append(l);
  else cur.replaceWith(l);
};