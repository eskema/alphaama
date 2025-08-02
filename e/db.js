aa.em = new Map();
aa.em_a = new Map();


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


// define which events are to be stored
aa.db.event_is_allowed =dat=>
{
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

  return is_allowed
};


// update event on database
aa.db.upd_e =async dat=>
{
  // aa.db.save_event(dat.event);
  // const q_id = 'upd_e';
  // if (!aa.temp[q_id]) aa.temp[q_id] = {};

  // if (!aa.db.event_is_allowed(dat)) return;
  
  // aa.temp[q_id][dat.event.id] = dat;
  // aa.fx.to(()=>
  // {
  //   const q = Object.values(aa.temp[q_id]);
  //   aa.temp[q_id] = {};
  //   if (q.length) 
  //   {
  //     aa.db.save_event()
  //     // let chunks = aa.fx.chunks(q,420);
  //     // let times = 0;
  //     // for (const a of chunks)
  //     // {
  //     //   setTimeout(()=>
  //     //   {
  //     //     aa.db.idb.postMessage({put:{store:'events',a}});
  //     //   },times * 200);
  //     //   times++;
  //     // }
  //   }
  // },4444,q_id);
};


// db actions
aa.actions.push(
  {
    action:['db','some'],
    required:['<number>'],
    optional:['asc'],
    description:'request a number of events from db',
    exe:aa.db.some
  }
);