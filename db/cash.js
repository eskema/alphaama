/*

alphaama
cash
// cache service worker

*/

const cash = 
{
  def:
  {
    id:'cash',
    ls:
    [
      '/site.webmanifest',
      '/stuff/420.html',
      '/stuff/font.otf',
      '/stuff/font.otf.woff2',
      '/stuff/favicon-32x32.png',
      '/stuff/favicon-16x16.png',
      '/stuff/safari-pinned-tab.svg',
      '/stuff/android-chrome-192x192.png',
      '/stuff/android-chrome-512x512.png',
      '/stuff/apple-touch-icon.png',
    ]
  }
};


addEventListener('fetch',e=>{e.respondWith(cash.flow(e))});


cash.add =async a=> 
{
  const cache = await caches.open(cash.def.id);
  await cache.addAll(a);
  postMessage(true);
};


cash.clear =async(key)=>
{
  const cache = await caches.open(cash.def.id);
  let results;
  if (key === 'ALL') results = await cache.matchAll();
  else results = await cache.matchAll(key);
  for (const key of results) await cache.delete(key);
  postMessage(true);
};


cash.del =async key=>
{
  const cache = await caches.open(cash.def.id);
  cache.delete(key)
};


// if we have the request cached, serve that,
// if not, then fetch, cache and serve it
cash.flow =async e=>
{
  let cache = await caches.open(cash.def.id);
  let res = await cache.match(e.request);
  if (res) return res;
  
  res = await e.preloadResponse;
  if (res && res.ok) 
  {
    cash.put(e.request,res.clone());
    return res
  }

  try 
	{
    res = await fetch(e.request);
	  cash.put(e.request,res.clone());
    return res
  }
  catch (er) 
  {
    res = await cache.match('/');
    if (res) return res;
    return new Response('wut?',{status:408,headers:{'Content-Type':'text/plain'}});
  }
};


cash.get =async a=> 
{
  const cache = await caches.open(cash.def.id);
  const results = [];
  if (!Array.isArray(a)) a = [a];
  for (const s of a)
  {
    let result;
    const res = await cache.match(s);
    if (res) 
    {
      let ct = res.headers.get('content-type');
      switch (ct)
      {
        case 'text/html':
          result = await res.text();break;
        case 'application/json':
          result = await res.json();break;
        default: result = await res.blob();
      }
    }
    if (result) results.push(result);
  }
  postMessage(results);
};


onactivate =e=>
{
  e.waitUntil(async()=>
  {
    if (registration.navigationPreload) 
      await registration.navigationPreload.enable()
  })
};


oninstall =e=>{e.waitUntil(cash.add(cash.def.ls))};


onmessage =e=>
{
  const ops = e.data;
  for (const k in ops) if (cash.hasOwnProperty(k)) cash[k](ops[k])
};


cash.put =async(k,res)=>
{
  if (typeof k === 'object' && k.url && k.url.startsWith('chrome')) return;
  const cache = await caches.open(cash.def.id);
  await cache.put(k,res);
};


cash.put_a =async(o)=>
{
  console.log('cash_put_a',);
  const cache = await caches.open(cash.def.id);
  for (const k in o) 
  {
    await cache.put(k,new Response(o[k],{headers:{'Content-Type':'application/json'}}));
  }
};