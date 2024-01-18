aa.db = {exe:{}};

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
    console.log('aa.db.get_p',xpub);
    const o = {get:{store:'authors',key:xpub}};
    const db = new Worker('idb.js');
    db.onmessage=e=>
    {
      // console.log('aa.db.get_p',xpub);
      let p = e.data;
      aa.p[xpub] = p ?? author.p(xpub);
      setTimeout(()=>{db.terminate()},200);
      resolve(aa.p[xpub]);
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
      if (dat) aa.e[xid] = dat;
      setTimeout(()=>{db.terminate()},200);
      resolve(dat);
    }
    db.postMessage(o);
  });
};

aa.db.put =async o=>
{
  // console.log(o);
  aa.idb.postMessage(o);
};

aa.db.upd =async dat=>
{
  const xid = dat.event.id;
  if (!aa.q.upd) aa.q.upd = {};
  if (!aa.q.upd[xid]) aa.q.upd[xid] = [];
  aa.q.upd[xid].push(dat);

  it.to(()=>
  {
    let q = Object.entries(aa.q.upd);
    aa.q.upd = {};
    let keys = [];
    let values = [];
    
    q.forEach(([k,v])=>
    {
      keys.push(k);
      if (v.length > 1)
      {
        let og = v.shift();
        for (const o of v) it.fx.merge(og,o);
        values.push(og);
      }
      else values.push(v[0]);
    });

    const dis = {upd:{store:'events',a:values}};
    aa.idb.postMessage(dis);
    // aa.db.put();
    // console.log(values);
  },500,'db_upd');
}

// aa.db.req =s=>
// {
//   let filter = 
//   aa.db.get({req:it.fx.vars('{"since":"n_2"}')}).then(a=>a.forEach(dat=>aa.print(dat)))
// };

aa.db.some =async s=>
{
  const [n,direction] = s.trim().split(' ');
  const db_op = {};
  db_op.n = n ? parseInt(n) : 1;
  db_op.direction = direction && direction === 'next' ? 'next' : 'prev';
  let o = {some:db_op};

  const db = new Worker('idb.js');
  db.onmessage=e=>
  {
    console.log('aa.db.some',e.data);
    for (const dat of e.data) aa.print(dat);
    setTimeout(()=>{db.terminate()},200);
  }
  db.postMessage(o);
};

aa.ct.db =
{
  'some':
  {
    required:['number'],
    optional:['next'],
    description:'request n events from db',
    exe: aa.db.some
  },
  // 'req':
  // {
  //   required:['filter'],
  //   description:'request events from db from filter',
  //   exe: aa.db.req
  // },
};

// cache - currently not used anywhere
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