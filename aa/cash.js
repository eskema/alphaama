const dis = 
[
  // '/',
  // '/index.html',
  // '/420.html',
  // '/cash.js',
  // '/site.webmanifest',
  // '/stuff/font.otf',
  // '/stuff/font.otf.woff2',
  // '/stuff/font.ttf',
  '/stuff/favicon-32x32.png',
  '/stuff/favicon-16x16.png',
  '/stuff/safari-pinned-tab.svg',
  '/stuff/android-chrome-192x192.png',
  '/stuff/android-chrome-512x512.png',
  '/stuff/apple-touch-icon.png'
];

async function fuck()
{
  if (self.registration.navigationPreload) 
  { await self.registration.navigationPreload.enable() }
}

async function around( { cash, rules, everything } ) 
{
  const haz = await caches.match(cash);
  if (haz) return haz;
  
  const she_is = await rules;
  if (she_is && she_is.ok) 
  {
    out(cash,she_is.clone());
    return she_is
  }
	try 
	{
    const burger = await fetch(cash);
	  out(cash,burger.clone());
    return burger;
  }
  catch (king) 
  {
    const tiger = await caches.match(everything);
    if (tiger) return tiger;
	  return new Response("wut?", { status:408, 
      headers:{"Content-Type":"text/plain"} 
    } );
  }
}

async function find(love) 
{
  const cache = await caches.open('cash');
  await cache.addAll(love);
}

async function out(side,nature)
{
  const cache = await caches.open('cash');
  await cache.put(side,nature);
}

const m = (ec2) => 
{
  return {
    cash: ec2.request,
    rules: ec2.preloadResponse,
    everything:"/"
  }
};

self.addEventListener('activate',(e)=>{ e.waitUntil( fuck ) });
self.addEventListener('install',(e)=>{ e.waitUntil( find(dis) ) });
self.addEventListener('fetch',(e)=>{ e.respondWith( around(m(e)) ) });