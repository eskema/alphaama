aa.db.srcs = new Map();
// cache
aa.db.srcs.set('cash','/cash.js');
aa.db.cash = new Worker(aa.db.srcs.get('cash'));

// indexedDB
aa.db.srcs.set('idb','/db/idb.js');
aa.db.idb = new Worker(aa.db.srcs.get('idb'));

// Track pending requests
aa.db.pending = new Map(); // request_id -> {resolve, reject, timeout}
aa.db.request_id = 0;

// Set up persistent message handlers
aa.db.cash.onmessage = e => aa.db.handle_response('cash', e);
aa.db.idb.onmessage = e => aa.db.handle_response('idb', e);

// shared worker
// aa.db.worker.sdb = '/db/sdb.js';
// aa.db.sdb = new SharedWorker(aa.db.worker.sdb).port;


// web cache navigation for offline use
if ('serviceWorker' in navigator)
{
  // if (localStorage.cash === 'on')
  // {
    navigator.serviceWorker
    .register(aa.db.srcs.get('cash'),{scope:'/'});
  // }
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


// Handle responses from worker
aa.db.handle_response = (_worker_name, e) =>
{
  const {request_id, data, error} = e.data;

  const pending = aa.db.pending.get(request_id);
  if (!pending)
  {
    console.warn(`db: no pending request for ${request_id}`);
    return;
  }

  clearTimeout(pending.timeout);
  aa.db.pending.delete(request_id);

  if (error) pending.reject(error);
  else pending.resolve(data);
};


// count items in db store
aa.db.count =async(s='')=>
{
  let [store,key] = s.split(' ');
  return await aa.db.ops('idb',{count:{store,key}});
};


// Send operation to worker with request tracking
aa.db.ops = async(worker, ops) =>
{
  // Get the persistent worker
  if (typeof worker === 'string')
  {
    worker = aa.db[worker]; // Use persistent worker
  }

  if (!worker)
  {
    console.error('db.ops: invalid worker');
    return Promise.resolve(null);
  }

  // Generate unique request ID
  const request_id = ++aa.db.request_id;

  return new Promise((resolve, reject) =>
  {
    // Store pending request
    const timeout = setTimeout(() =>
    {
      aa.db.pending.delete(request_id);
      resolve(null); // Timeout resolves to null
      console.warn(`db.ops: request ${request_id} timed out`);
    }, 6666);

    aa.db.pending.set(request_id, {resolve, reject, timeout});

    // Send message with request_id
    worker.postMessage({request_id, ops});
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