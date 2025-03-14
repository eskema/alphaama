aa.db.e = {};

// returns events if already loaded or get them from database
aa.db.events =async ids=>
{
  // return await aa.db.get_pa(a)
  const events = [];
  const a = [];
  for (const x of ids) 
  {
    if (!aa.db.e[x]) a.push(x);
    else events.push(aa.db.e[x])
  }
  if (a.length)
  {
    let store = 'events'
    let stored = await aa.db.ops('idb',{get_a:{store,a}});
    for (const i of stored) aa.db.e[i.event.id] = i;
    events.push(...stored);
  }
  return events
};


// returns event if already loaded or get it from database
aa.db.get_a =async id_a=>
{
  const store = 'events';
  const [kind,pubkey,identifier] = id_a.split(':');
  let key;
  try 
  {
    let p = await aa.db.get_p(pubkey);
    key = p.events['k'+kind][identifier][0][0]
  } 
  catch(er) {}

  if (key)
  {
    if (aa.db.e[key]) return aa.db.e[key];
    return aa.db.e[key] = await aa.db.ops('idb',{get:{store,key}});
  }
  return false
};


// returns event if already loaded or get it from database
aa.db.get_e =async xid=>
{
  if (aa.db.e[xid]) return aa.db.e[xid];  
  let dat = await aa.db.ops('idb',{get:{store:'events',key:xid}});
  if (dat) aa.db.e[xid] = dat;
  return dat
};


// get n events from database
// default direction: newest
// other direction: oldest
aa.db.some =async s=>
{
  const a = s.split(' ');
  const n = a.shift();
  const d = a.shift();
  const some = 
  {
    n:n?parseInt(n):1,
    direction:d&&d==='oldest'?'next':'prev'
  };
  const events = await aa.db.ops('idb',{some});
  for (const dat of events) aa.e.to_printer(dat); 
  return `${localStorage.ns} db some ${some.n}`;
};


// update event on database
aa.db.upd_e =async dat=>
{
  const q_id = 'upd_e';
  if (!aa.temp[q_id]) aa.temp[q_id] = {};
  aa.temp[q_id][dat.event.id] = dat;
  
  aa.fx.to(()=>
  {
    const q = Object.values(aa.temp[q_id]);
    aa.temp[q_id] = {};
    if (q.length) 
    {
      let chunks = aa.fx.chunks(q,4444);
      let times = 0;
      for (const chunk of chunks)
      {
        setTimeout(()=>
        {
          aa.db.idb.postMessage({put:{store:'events',a:chunk}});
        },times * 100);
        times++;
      }
    }
  },500,q_id);
};


// db actions
aa.actions.push(
  {
    action:['db','some'],
    required:['number'],
    optional:['oldest'],
    description:'request n events from db',
    exe:aa.db.some
  },
  {
    action:['db','view'],
    required:['id'],
    description:'view event',
    exe:aa.view.state
  }
);