aa.db.e = {};

// returns events if already loaded or get them from database
aa.db.events =async ids=>
{
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
  let version = Object.values(aa.db.e)
    .filter(i=>i.id_a === id_a)
    .sort(aa.fx.sorts.ca_desc)[0];
  if (version) return version;
  
  let versions = await aa.db.ops('idb',{dex:{index:'id_a',store:'events',a:[id_a]}});
  if (versions.length) return version[0];
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
// default order is descending (newest),
// use the option 'asc' for ascending order (oldest)
aa.db.some =async s=>
{
  const a = s.split(' ');
  const n = a.shift();
  const d = a.shift();
  const some = 
  {
    n: n ? parseInt(n) : 1,
    direction: (d && d==='asc') ? 'next' : 'prev'
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
  // define which events are to be stored
  let is_allowed;
  let kinds = [0,3,10002,10019,17375];

  if (aa.is.u(dat.event.pubkey)) is_allowed = true;
  else if (aa.is.following(dat.event.pubkey))
  {
    if (kinds.includes(dat.event.kind)) is_allowed = true;
  }
  // else
  // {
  //   // 
  // }

  if (!is_allowed) return;
  
  aa.temp[q_id][dat.event.id] = dat;
  aa.fx.to(()=>
  {
    const q = Object.values(aa.temp[q_id]);
    aa.temp[q_id] = {};
    if (q.length) 
    {
      let chunks = aa.fx.chunks(q,420);
      let times = 0;
      for (const a of chunks)
      {
        setTimeout(()=>
        {
          aa.db.idb.postMessage({put:{store:'events',a}});
        },times * 50);
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
    optional:['asc'],
    description:'request a number of events from db',
    exe:aa.db.some
  },
  {
    action:['db','view'],
    required:['id'],
    description:'view event',
    exe:aa.view.state
  }
);