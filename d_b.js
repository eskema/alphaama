aa.db = {exe:{},sn:'db'};

aa.idb = new Worker('idb.js');
aa.idb.onmessage=e=>
{
  const o = e.data;
  console.log('idb message',o);
  const exes = [];

  for (const k in o)
  {
    if (aa.db.exe.hasOwnProperty(k))
    {
      it.a_set(exes,[k]);
      aa.db.exe[k](o[k]);
    } 
  }
  if (exes.length) exes.map(k=>delete aa.db.exe[k]);
};

aa.db.clear = async a=>
{
  return new Promise(resolve=>
  {
    const db = new Worker('idb.js');
    db.onmessage=e=>
    {
      // console.log('aa.db.get',o,e.data);
      setTimeout(()=>{db.terminate()},200);
      resolve(e.data);
    }
    const o = {clear:{stores:a}};
    db.postMessage(o);
  });
};

aa.db.get =async o=>
{
  console.log('aa.db.get',o);
  return new Promise(resolve=>
  {
    const db = new Worker('idb.js');
    db.onmessage=e=>
    {
      // console.log('aa.db.get',o,e.data);
      setTimeout(()=>{db.terminate()},200);
      resolve(e.data);
    }
    db.postMessage(o);
  });
};

aa.db.get_p =async xpub=>
{
  if (aa.p[xpub]) return aa.p[xpub];
  return new Promise(resolve=>
  {
    const o = {get:{store:'authors',key:xpub}};
    const db = new Worker('idb.js');
    db.onmessage=e=>
    {
      // console.log('aa.db.get_p',xpub);
      let p = e.data;
      if (p) aa.p[xpub] = p;
      setTimeout(()=>{db.terminate()},200);
      resolve(p);
    }
    db.postMessage(o);
  });
};

aa.db.get_e =async xid=>
{
  if (aa.e[xid]) return aa.e[xid];  
  return new Promise(resolve=>
  {
    const o = {get:{store:'events',key:xid}};
    const db = new Worker('idb.js');
    db.onmessage=e=>
    {
      // console.log('aa.db.get_e',xid);
      let dat = e.data;
      if (dat)
      {
        aa.e[xid] = dat;
        if (!aa.e[xid]) aa.e[xid] = dat;
        // else 
        // {
        //   let merged = aa.merge_e(dat);
        //   if (merged) aa.db.upd(merged);
        // }
      } 

      setTimeout(()=>{db.terminate()},200);
      resolve(dat);
    }
    db.postMessage(o);
  });
};

aa.db.put =async o=> aa.idb.postMessage(o);

aa.merge_e =dat=>
{
  const xid = dat.event.id;
  if (!aa.e[xid])
  {
    aa.e[xid] = dat;
    return dat;
  } 
  else 
  {
    const merged = it.fx.merge(aa.e[xid],dat);
    if (merged) 
    {
      aa.e[xid] = merged;
      return merged
    }
    else return false
  }
};

aa.db.upd =async dat=>
{
  if (!aa.q.upd) aa.q.upd = {};
  let merged = aa.merge_e(dat);
  if (merged) aa.q.upd[dat.event.id] = merged;

  it.to(()=>
  {
    const q = Object.values(aa.q.upd);
    aa.q.upd = {};
    if (q.length) aa.idb.postMessage({upd:{store:'events',a:q}});
  },2000,'db_upd');
};

// aa.db.req =s=>
// {
//   let filter = 
//   aa.db.get({req:it.fx.vars('{"since":"n_2"}')}).then(a=>a.forEach(dat=>aa.print(dat)))
// };

aa.db.some =async s=>
{
  cli.fuck_off();
  const a = s.trim().split(' ');
  const n = a.shift();
  const direction = a.shift();
  const db_op = {};
  db_op.n = n ? parseInt(n) : 1;
  db_op.direction = direction && direction === 'next' ? 'next' : 'prev';
  let o = {some:db_op};
  v_u.log(localStorage.ns+' '+aa.db.sn+' some '+db_op.n);
  const db = new Worker('idb.js');
  db.onmessage=e=>
  {
    // console.log('aa.db.some',e.data);
    for (const dat of e.data) aa.print(dat);
    setTimeout(()=>{db.terminate()},200);
  }
  db.postMessage(o);
};

aa.db.view =s=>
{
  console.log(s);
  cli.fuck_off();
  v_u.state(s.trim());
};

// cache - currently not used anywhere, soon™
aa.db.cash = {};
aa.db.cash.get =async(store,key)=>
{
  const cash = await caches.open(store);
  const match = await cash.match(key);
  if (match) return await match.json();
  else return false;
};

aa.db.cash.getall =async(store,keys)=>
{
  const cash = await caches.open(store);
  const match = await cash.matchAll(keys);
  if (match) return await match.json();
  else return false;
};

aa.db.cash.put =async(store,key,o)=>
{
  const cash = await caches.open(store);
  const h = {headers:{'content-type':'application/json'}};
  cash.put(key,new Response(JSON.stringify(o),h))
};

aa.db.cash.page =async(store,key)=>
{
  const cash = await caches.open(store);
  cash.put(key,new Response(aa.l.outerHTML))
};

aa.db.cash.rm =async(store,key)=>
{
  const cash = await caches.open(store);
  cash.delete(key)
};

aa.db.cash.hole =async(store,f)=>
{
  const cash = await caches.open(store);
  const taxes = await cash.keys();
  // const txs = taxes.sort(() => 0.5 - Math.random());
  const txs = taxes.reverse();
  txs.forEach((request,index)=>
  { f({i:index,r:request,s:cash}) });
};

aa.db.cash.some =(n=0)=>
{
  v_u.log('db some '+n);
  async function cb(dc) // {i:index,r:request,s:cash}
  {
    if (!n || !dc.i || dc.i <= n)
    {
      let yield = await dc.s.match(dc.r.url);
      let diff = await yield.json();
      aa.to_print(diff);
    }
  } 
  aa.db.cash.hole('e',cb);
  cli.fuck_off();
};

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