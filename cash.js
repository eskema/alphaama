/*

alphaama
cash
// cache service worker

*/

const cash =
{
  id:'cash',
  dev: self.location.hostname === 'localhost'
    || self.location.hostname.startsWith('wip.'),
  max_age: 7 * 24 * 60 * 60 * 1000,
  max_size: 500 * 1024 * 1024,
};


// add items to cache
cash.add =async(keys=[], request_id)=>
{
  const cache = await caches.open(cash.id);
  cache.addAll(keys);
  postMessage({request_id, data: true});
};


// cash add all with options
cash.all =async(keys=[], request_id)=>
{
  const cache = await caches.open(cash.id);
  for (const key of keys)
  {
    const request = new Request(key,{mode:'no-cors'});
    try
    {
      let response = await cash.grab(request);
      // let response = await fetch(request);
      if (response) await cache.put(request, response.clone())
    }
    catch{}
  }
  postMessage({request_id, data: true});
};


// delete key from cache or clear all
cash.clear =async(key, request_id)=>
{
  const cache = await caches.open(cash.id);
  let results;
  if (key === 'ALL')
  {
    results = await cache.matchAll();
  }
  else if (Array.isArray(key))
  {
    results = [];
    for (const k of key)
    {
      const result = await cache.matchAll(k);
      results.push(...result)
    }
  }
  else results = await cache.matchAll(key);
  // console.log(results);
  for (const result of results) await cache.delete(result);
  postMessage({request_id, data: true});
};


// enable navigationPreload
cash.enable =async()=>
{
  if (registration.navigationPreload)
    await registration.navigationPreload.enable()
};


// should this response be cached?
cash.cacheable =response=>
{
  if (!response) return false;
  // opaque responses (cross-origin no-cors) have ok=false
  // and inaccessible headers — cache them anyway
  if (response.type === 'opaque') return true;
  if (!response.ok) return false;
  let type = response.headers.get('Content-Type') || '';
  return type.startsWith('image/')
};


// clone response with a fresh Date header (marks as recently used)
cash.touch =async(cache, request, response)=>
{
  // opaque responses can't be reconstructed (status=0 is invalid)
  if (response.type === 'opaque')
    return cache.put(request, response.clone());
  let headers = new Headers(response.headers);
  headers.set('Date', new Date().toUTCString());
  let fresh = new Response(await response.clone().blob(),
  {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  cache.put(request, fresh);
};


// if we have the request cached, serve that,
// if not, fetch and selectively cache
cash.flow =async e=>
{
  let is_app = new URL(e.request.url).origin === self.location.origin;
  if (is_app && cash.dev)
  {
    try { return await fetch(e.request) }
    catch { return Response.error() }
  }

  const cache = await caches.open(cash.id);
  let response = await cache.match(e.request);
  if (response)
  {
    cash.touch(cache, e.request, response);
    return response
  }

  response = await e.preloadResponse;
  if (!response)
  {
    try { response = await fetch(e.request) }
    catch { return Response.error() }
  }
  if (cash.cacheable(response))
    cache.put(e.request, response.clone());
  return response
};


// fetch
cash.grab =async request=>
{
  let response = await fetch(request);
  if (response?.ok || response?.type === 'opaque')
    return response.clone();
  return null
};


cash.in =async(array, request_id)=>
{
  let [key,response,options] = array;
  if (!key || !response) return;
  if (!options) options = {};
  // {
  //   headers:{'Content-Type':'application/json'}
  // };
  let result = await cash.put(new Request(key),
    new Response(response,options));
  postMessage({request_id, data: result});
};


// get from cache
cash.out =async(a, request_id)=>
{
  const cache = await caches.open(cash.id);
  const results = [];
  if (!Array.isArray(a)) a = [a];
  for (const item of a)
  {
    let result;
    const response = await cache.match(item);
    if (response)
    {
      let content_type = response.headers.get('Content-Type');
      switch (content_type)
      {
        case 'text/html':
          result = await response.text();
          break;
        case 'application/json':
          result = await response.json();
          break;
        default:
          result = await response.blob();
      }
    }
    if (result) results.push(result);
  }
  postMessage({request_id, data: results});
};


cash.put =async(key,response)=>
{
  if (typeof key === 'object' 
  && key.url?.startsWith('chrome')) return;

  const cache = await caches.open(cash.id);
  await cache.put(key,response);
};


// evict old/oversized entries
cash.evict =async()=>
{
  const cache = await caches.open(cash.id);
  const requests = await cache.keys();
  let total = 0;
  let entries = [];
  for (const req of requests)
  {
    const res = await cache.match(req);
    // opaque responses have no accessible headers — skip them
    if (res.type === 'opaque') continue;
    let date = new Date(res.headers.get('Date') || 0).getTime();
    let size = +(res.headers.get('Content-Length') || 0);
    entries.push({req, date, size});
    total += size;
  }
  entries.sort((a,b) => a.date - b.date);
  for (const e of entries)
  {
    if (Date.now() - e.date > cash.max_age || total > cash.max_size)
    {
      await cache.delete(e.req);
      total -= e.size;
    }
  }
};


onactivate =e=>
{
  e.waitUntil(
    cash.enable()
    .then(()=> cash.evict())
    .then(()=> self.clients.claim())
  )
};


oninstall =()=> self.skipWaiting();


onmessage =e=>
{
  const {request_id, ops} = e.data;
  for (const key in ops)
    if (Object.hasOwn(cash,key))
      cash[key](ops[key], request_id)
};


addEventListener('fetch',e=>{e.respondWith(cash.flow(e))});