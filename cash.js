/*

alphaama
    cash
cache service worker

*/

const cash = 
{
  def:
  {
    id:'cash',
    ls:
    [
      '/',
      '/index.html',
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
      '/aa/aa.js'
    ]
  }
};


// if we have the request cached, serve that,
// if not, then fetch, cache and serve it

cash.flow =async e=>
{
  let res = await caches.match(e.request);
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
    res = await caches.match('/');
    if (res) return res;
    return new Response('wut?',{status:408,headers:{'Content-Type':'text/plain'}});
  }
};

addEventListener('fetch',e=>{e.respondWith(cash.flow(e))});

// cache ops

cash.get =async a=> 
{
  const cache = await caches.open(cash.def.id);
  const results = await cache.matchAll(a);
  postMessage(results);
};

cash.add =async a=> 
{
  const cache = await caches.open(cash.def.id);
  await cache.addAll(a);
};

cash.put =async(k,res)=>
{
  if (typeof k === 'object' && k.url && k.url.startsWith('chrome')) return;
  const cache = await caches.open(cash.def.id);
  await cache.put(k,res);
};

cash.rm =async key=>
{
  const cache = await caches.open(cash.def.id);
  cache.delete(key)
};

cash.clear =async()=>
{
  const cache = await caches.open(cash.def.id);
  const results = await cache.matchAll([]);
  for (const res of results) cash.rm(res);
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