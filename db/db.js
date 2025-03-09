aa.db.worker.cash = '/db/cash.js';
aa.db.cash = new Worker(aa.db.worker.cash);
aa.db.worker.idb = '/db/idb.js';
aa.db.idb = new Worker(aa.db.worker.idb);

// web cache navigation for offline use
if ('serviceWorker' in navigator && localStorage.cash === 'on')
{
  navigator.serviceWorker.register(aa.db.worker.cash,{scope:'/'});
}
else
{
  navigator.serviceWorker.getRegistrations()
  .then(async a=> 
  {
    if (a.length && localStorage.cash === 'off')
    {
      await aa.db.ops('cash',{clear:'ALL'});
      for (let r of a) r.unregister();
    }
  })
  .catch(err=>{ console.log(err)});
}


aa.clear_cash =async()=>
{
  const cache = await caches.open('cash');
  const results = await cache.matchAll();
  for (const key of results) cache.delete(key);
};


// count items in db store
aa.db.count =async(s='')=>
{
  let [store,key] = s.split(' ');
  return await aa.db.ops('idb',{count:{store,key}});
};


// pass operations to worker and await results
// kills the worker when finished
aa.db.ops =async(s,o)=>
{
  return new Promise(resolve=>
  {
    const db = new Worker(aa.db.worker[s]);
    db.onmessage =e=> 
    {
      setTimeout(()=>{db.terminate()},8);
      resolve(e.data);
    }
    db.postMessage(o);
  });
};


aa.actions.push(
  {
    action:['db','count'],
    required:['store'],
    optional:['key_range'],
    description:'',
    exe:aa.db.count
  }
);