aa.db.srcs = new Map();
// cache
aa.db.srcs.set('cash','/db/cash.js');
aa.db.cash = new Worker(aa.db.srcs.get('cash'));

// indexedDB
aa.db.srcs.set('idb','/db/idb.js');
aa.db.idb = new Worker(aa.db.srcs.get('idb'));

// shared worker
// aa.db.worker.sdb = '/db/sdb.js';
// aa.db.sdb = new SharedWorker(aa.db.worker.sdb).port;


// web cache navigation for offline use
if ('serviceWorker' in navigator)
{
  if (localStorage.cash === 'on')
  {
    navigator.serviceWorker
    .register(aa.db.srcs.get('cash'),{scope:'/'});
  }
  // else
  // {
  //   navigator.serviceWorker
  //   .getRegistrations()
  //   .then(
  //     async a=> 
  //     {
  //       if (a.length && localStorage.cash === 'off')
  //       {
  //         await aa.db.ops('cash',{clear:'ALL'});
  //         for (let r of a) r.unregister();
  //       }
  //     }
  //   )
  //   .catch(err=>{ console.log(err)});
  // }
};


// on load
// aa.db.load =()=>
// {
//   let mod = aa.db;
//   let id = 'db';

//   aa.actions.push(
//     {
//       action:[id,'count'],
//       required:['<store>'],
//       // optional:['key_range'],
//       description:'get a count of items in a given store. (events,authors,stuff)',
//       exe:mod.count
//     }
//   );
//   fetch('/db/README.adoc')
//   .then(dis=>dis?.text())
//   .then(text=>
//   { 
//     if (text) mod.readme = text;
//   });
// };


// count items in db store
aa.db.count =async(s='')=>
{
  let [store,key] = s.split(' ');
  return await aa.db.ops('idb',{count:{store,key}});
};


// pass operations to worker and await results
// kills the worker when finished
// aa.db.ops =async(worker_src,ops)=>
// {
//   return new Promise((resolve,reject)=>
//   {
//     const db = new Worker(aa.db.worker[worker_src]);
//     const abort = setTimeout(()=>{ db?.terminate(); resolve() },6666);
//     db.onmessage =e=> 
//     {
//       clearTimeout(abort);
//       setTimeout(()=>{db?.terminate()},10);
//       resolve(e.data);
//     }
//     db.postMessage(ops);
//   });
// };

// pass operations to worker and await results
// kills the worker when finished
// const db = new Worker(aa.db.worker[worker_src]);
aa.db.ops =async(worker,ops)=>
{
  if (typeof worker === 'string'
    && aa.db.srcs.has(worker)
  ) worker = new Worker(aa.db.srcs.get(worker));

  const term =()=>{ worker?.terminate() };

  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{ term(); resolve() }, 6666);

    worker.onmessage =e=>
    {
      clearTimeout(abort);
      setTimeout(term,21);
      resolve(e.data);
    }
    worker.postMessage(ops);
  });
};


// shared db
// aa.db.sdb.addEventListener('message',e=>
// {
//   console.log('sdb',e.data)
// });

// aa.db.sdb.start();



// wen loaded
// window.addEventListener('load',aa.db.load);