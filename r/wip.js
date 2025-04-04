// relay worker
aa.r.worker_src = '/r/worker.js';


// relay workers working
aa.r.lays = new Map();


// instantiate relay worker
aa.r.lay =async(url,o={})=>
{
  url = aa.is.url(url)?.href;
  let r = aa.r.lays.get(url);
  if (r) return r;
  r =
  {
    a:[aa.r.lay_m,aa.r.lay_switch],
    w:new Worker(aa.r.worker_src),
    s:new Map(),
    m:[],
  };
  r.w.url = url;
  aa.r.lays.set(url,r);
  if (Object.hasOwn(o,'a') && o.a.length) r.a.push(...o.a);
  r.w.onmessage =e=>
  {
    const mess =i=>{i.exe(r,e.data)};
    for (const i of r.a) setTimeout(mess(i),0)
  };
  r.w.postMessage([['connect',url]]);
  return r
};


//
aa.r.lay_m =
{
  name:'m',
  exe:(v,r)=>{r.m.push(v)}
};


//
aa.r.lay_switch =
{
  name:'switch',
  exe:(v,r)=>
  {
    switch(v[0])
    {
      case 'info':
      case 'connect':
      case 'sub':
      case 'event': //aa.mk.dat(v[1])
      case 'eose':
      case 'notice':
      default: console.log(v,r)
    }
  }
};


// terminate relay worker
aa.r.lay_term =s=>
{
  let relay = aa.r.lays.get(s);
  if (relay)
  {
    relay.w.terminate();
    aa.r.lays.delete(s)
  }
};