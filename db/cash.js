/*

alphaama
cash
// cache service worker

*/

const cash = {id:'cash'};


// add items to cache
cash.add =async(keys=[])=>
{
  const cache = await caches.open(cash.id);
  cache.addAll(keys);
  postMessage(true);
};


// cash add all with options
cash.all =async(keys=[])=>
{
  const cache = await caches.open(cash.id);
  for (const key of keys)
  {
    const request = new Request(key,{mode:'no-cors'});
    try
    {
      let response = await cash.grab(request);
      // let response = await fetch(request);
      if (response?.ok) await cache.put(request,new Response(response.clone()))
    }
    catch{}
  }
  postMessage(true);
};


// delete key from cache or clear all
cash.clear =async key=>
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
  postMessage(true);
};


// enable navigationPreload
cash.enable =async()=>
{
  if (registration.navigationPreload)
    await registration.navigationPreload.enable()
};


// if we have the request cached, serve that,
// if not, then fetch, cache and serve it
cash.flow =async e=>
{
  console.log('cash');
  const cache = await caches.open(cash.id);
  let response = await cache.match(e.request);
  if (response) return response;
  
  response = await e.preloadResponse;
  if (response && response.ok)
  {
    cache.put(e.request,response.clone());
    return response
  }
  try
  {
    response = await fetch(e.request);
    cache.put(e.request,response.clone());
    return response
  }
  catch (error)
  {
    response = await cache.match('/');
    if (response) return response;
    return new Response('wut?',{status:408,headers:{'Content-Type':'text/plain'}});
  }
};


// fetch
cash.grab =async request=>
{
  return new Promise(async(resolve,reject)=>
  {
    let response;
    try
    {
      response = await fetch(request);
      if (response?.ok) resolve(response.clone())
    }
    catch { reject(response) }
  })
};


cash.in =async array=>
{
  let [key,response,options] = array;
  if (!key || !response) return;
  if (!options) options = {};
  // {
  //   headers:{'Content-Type':'application/json'}
  // };
  let result = await cash.put(new Request(key), 
    new Response(response,options));
  postMessage(result);
};


// get from cache
cash.out =async a=> 
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
  postMessage(results);
};


cash.put =async(key,response)=>
{
  if (typeof key === 'object' 
  && key.url?.startsWith('chrome')) return;

  const cache = await caches.open(cash.id);
  await cache.put(key,response);
};


onactivate =e=>
{
  e.waitUntil(cash.enable)
};


oninstall =e=>
{
  e.waitUntil(async()=>
  {
    await cash.add(['/','/index.html'])
    // const cache = await caches.open(cash.id);
    // await cache.addAll(['/','/index.html']);
  })
};


onmessage =e=>
{
  for (const key in e.data)
    if (Object.hasOwn(cash,key))
      cash[key](e.data[key])
};


addEventListener('fetch',e=>{e.respondWith(cash.flow(e))});