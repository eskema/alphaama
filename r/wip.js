// relay worker
aa.r.worker = '/r/worker.js';


// relay workers working
aa.r.ww = new Map();


// instantiate relay worker
aa.r.w =async(url,o)=>
{
  let op = 'connect';
  url = aa.is.url(url)?.href;
  let rw = aa.r.ww.get(url);
  if (!rw)
  {
    rw = 
    {
      a:[],
      messages:[],
      worker:new Worker(aa.r.worker)
    };
    aa.r.ww.set(url,rw);
    if (Object.hasOwn(o,'a') && o.a.length) rw.a.push(...o.a);
    const exe =
    rw.worker.onmessage =e=>
    {
      let data = e.data;
      let origin = e.target;
      rw.messages.push(data);
      for (const process of rw.a) setTimeout(()=>
      {
        let [title,exe] = process;
        exe(data,origin);
      },0);
    };
    // if (Object.hasOwn('fun') && o.fun.length)
    // {
    //   for (const l of o.fun)
    //   {
    //     let listener = rw.worker.addEventListener('message',l[1]);
    //   }
    //   rw.push([l[0],rw.worker.addEventListener('message',l[1])])
    // }

    
    rw.worker.postMessage([[op,url]]);
  }
  return rw
};


// terminate relay worker
aa.r.wt =s=>
{
  let ww = aa.temp.workers.get(s);
  if (ww)
  {
    ww.worker.terminate();
    aa.temp.workers.delete(s)
  }
};