aa.db.srcs = new Map();
// cache
aa.db.srcs.set('cash','/cash.js');

// indexedDB
aa.db.srcs.set('idb','/db/idb.js');
aa.db.idb = new Worker(aa.db.srcs.get('idb'));

// Track pending requests
aa.db.pending = new Map(); // request_id -> {resolve, reject, timeout}
aa.db.request_id = 0;

// Set up persistent message handlers
// aa.db.cash.onmessage = e => aa.db.handle_response('cash', e);
aa.db.idb.onmessage = e => aa.db.handle_response('idb', e);

// shared worker
// aa.db.worker.sdb = '/db/sdb.js';
// aa.db.sdb = new SharedWorker(aa.db.worker.sdb).port;


// web cache navigation for offline use
if ('serviceWorker' in navigator)
{
    navigator.serviceWorker
    .register(aa.db.srcs.get('cash'),{scope:'/'});
};


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
// options.strict: on final timeout reject instead of resolving null, so the
// caller can tell "db never answered" apart from "no record" (both falsy
// otherwise). Used by aa.mod.load to avoid overwriting stored state with
// defaults after a slow/contended db open.
aa.db.ops = async(worker, ops, options={}) =>
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

  // one retry before giving up — most timeouts are transient (db-open
  // contention, redstore wasm init) and clear on a second attempt
  const attempt = (retries) => new Promise((resolve, reject) =>
  {
    const request_id = ++aa.db.request_id;

    const timeout = setTimeout(() =>
    {
      aa.db.pending.delete(request_id);
      if (retries > 0)
      {
        console.warn(`db.ops: request ${request_id} timed out, retrying`);
        attempt(retries - 1).then(resolve, reject);
        return;
      }
      console.warn(`db.ops: request ${request_id} timed out`);
      if (options.strict) reject(new Error('db.ops timeout'));
      else resolve(null); // legacy contract: timeout resolves to null
    }, 6666);

    aa.db.pending.set(request_id, {resolve, reject, timeout});

    // Send message with request_id
    worker.postMessage({request_id, ops});
  });

  return attempt(1);
};

aa.resets.push(
    async()=>
    {
      await caches.delete('cash');
      aa.log('db cash: clear');
      let databases = await indexedDB.databases();
      for (const db of databases) indexedDB.deleteDatabase(db.name);
      aa.log('indexedDB: clear');
    }
  );


// shared db
// aa.db.sdb.addEventListener('message',e=>
// {
//   console.log('sdb',e.data)
// });

// aa.db.sdb.start();



// wen loaded
// window.addEventListener('load',aa.db.load);