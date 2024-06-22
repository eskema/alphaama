// browser cache - currently not used anywhere, soon™

aa.db.cache = {};


// get cached key

aa.db.cache.get =async(store,key)=>
{
  const cash = await caches.open(store);
  return await cash.match(key);
};


// get cached key as JSON

aa.db.cache.get_j =async(store,key)=>
{
  const match = await aa.db.cache.get(store,key);
  return await match.json();
};


// get all cached as JSON

aa.db.cache.get_all =async(store,keys)=>
{
  const cash = await caches.open(store);
  const match = await cash.matchAll(keys);
  if (match) return await match.json();
  else return false;
};


// put key as JSON

aa.db.cache.put_j =async(store,key,j)=>
{
  const cash = await caches.open(store);
  cash.put(key,new Response(j,{headers:{'content-type':'application/json'}}))
};


// put key as html

aa.db.cache.put_l =async(store,key,l)=>
{
  const cash = await caches.open(store);
  cash.put(key,new Response(l.outerHTML))
};


// remove key from cache

aa.db.cache.rm =async(store,key)=>
{
  const cash = await caches.open(store);
  cash.delete(key)
};