// relay worker
aa.r.worker = '/r/worker.js';


// relay workers working
aa.r.ww = new Map();


// instantiate relay worker
aa.r.w =async(url,fun)=>
{
  let op = 'connect';
  url = aa.is.url(url)?.href;
  let rw = aa.r.ww.get(url);
  if (!rw)
  {
    rw = 
    {
      messages:[],
      worker:new Worker(aa.r.worker)
    };
    aa.r.ww.set(url,rw);
    rw.worker.onmessage =e=>
    {
      console.log(e.data);
      rw.messages.push(e.data);
      if (fun) setTimeout(()=>{fun(e.data,e.target)},0);
    };
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