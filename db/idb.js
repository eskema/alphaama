const indexed_db = 
{
  ops:{},
  chunks:4444
};


indexed_db.ops.stores =async(db,o,request_id)=>
{
  // console.log(db.objectStoreNames);
  postMessage({request_id, data: db.objectStoreNames});
};


indexed_db.ops.clear =async(db,o,request_id)=>
{
  let times = 0;
  for (const store of o.stores)
  {
    const odb = db.transaction(store,'readwrite').objectStore(store);
    const store_clear = odb.clear();
    store_clear.onsuccess =e=>
    {
      times++;
      if (times === o.stores.length) postMessage({request_id, data: 'db '+o.store+' cleared'});
    }
  }
};


// splits array into chunks of n items
// returns array of chunks
const chunker =(a,n)=>
{
  const chunks = [];
  for (let i = 0; i < a.length; i += n) chunks.push(a.slice(i,i+n));
  return chunks;
};


indexed_db.ops.dex =async(db,o,request_id)=>
{
  const dex = db.transaction(o.store)
  .objectStore(o.store)
  .index(o.index);

  const a = [];
  let done = 0;
  for (const item of o.a)
  {
    dex.get(item).onsuccess=e=>
    {
      const result = e.target.result;
      done++;
      if (done === o.a.length) postMessage({request_id, data: a});
    };
  }
};


indexed_db.ops.dex_all =async(db,o,request_id)=>
{
  const dex = db.transaction(o.store)
  .objectStore(o.store)
  .index(o.index);

  const a = [];
  dex.openCursor(o.key).onsuccess=e=>
  {
    const cursor = e.target.result;
    if (cursor)
    {
      a.push(cursor.value);
      cursor.continue();
    }
    else postMessage({request_id, data: a})
  }
};


// return all records from a store
indexed_db.ops.all =async(db,o,request_id)=>
{
  const odb = db.transaction(o.store)
  .objectStore(o.store);

  const a = [];
  odb.openCursor().onsuccess=e=>
  {
    const cursor = e.target.result;
    if (cursor)
    {
      a.push(cursor.value);
      cursor.continue();
    }
    else postMessage({request_id, data: a})
  }
};


indexed_db.ops.get =async(db,o,request_id)=>
{ // o = {store:'',key:'id'}
  const odb = db.transaction(o.store).objectStore(o.store);
  odb.get(o.key).onsuccess=e=> postMessage({request_id, data: e.target.result});
};


indexed_db.ops.get_a =async(db,o,request_id)=>
{ // o = {store:'',a:[]}
  const odb = db.transaction(o.store).objectStore(o.store);
  
  // Create promises for all get operations
  const promises = o.a.map(item => 
    new Promise((resolve, reject) => {
      const request = odb.get(item);
      request.onsuccess = e => resolve(e.target.result);
      request.onerror = () => resolve(null);  // Resolve with null on error
    })
  );
  
  // Wait for all to complete
  const results = await Promise.all(promises);
  
  // Filter out null results
  const a = results.filter(result => result && result !== null);
  
  postMessage({request_id, data: a});
};


indexed_db.ops.get_all =async(db,store,request_id)=>
{
  const odb = db.transaction(store).objectStore(store);
  odb.getAll().onsuccess=e=> postMessage({request_id, data: e.target.result});
};


indexed_db.ops.keys =async(db,store,request_id)=>
{
  const odb = db.transaction(store).objectStore(store);
  odb.getAllKeys().onsuccess=e=> postMessage({request_id, data: e.target.result});
};

const merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let sets = dat.entries.filter(i=>Array.isArray(i[1])).map(i=>i[0]);
  let merged;
  for (const set of sets)
  {
    if (!dis.hasOwnProperty(set)) {dis[set]=[];merged=true}
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (a_add(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false 
};


indexed_db.ok =(db,o,request_id)=>
{
  if (!o || typeof o !== 'object')
  {
    console.error('indexed_db.ok: invalid ops object', o);
    postMessage({request_id, error: 'Invalid ops object'});
    db.close();
    return;
  }

  const total = Object.keys(o).length;
  let done = 0;
  for (const k in o)
  {
    try { indexed_db.ops[k](db,o[k],request_id).then(()=>{done++}) }
    catch (er) {console.error(er);done++}
    if (done === total) setTimeout(db.close,200)
  }
}


onmessage =m=>
{
  const {request_id, ops} = m.data;

  if (!ops)
  {
    console.error('idb worker: ops is undefined', m.data);
    postMessage({request_id, error: 'Invalid message format: ops is undefined'});
    return;
  }

  const db = indexedDB.open("alphaama", 16);
  db.onerror =e=>
  {
    console.log('db error',e);
    postMessage({request_id, error: e.target.error?.message || 'Database error'});
  };
  db.onupgradeneeded = indexed_db.upg;
  db.onsuccess =e=> indexed_db.ok(e.target.result, ops, request_id);
}


indexed_db.ops.put =async(db,o,request_id)=>
{ // o = {store:'',a:[]}
  // const chunks = chunker(o.a,indexed_db.chunks);
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);

  let done = 0;
  const total = o.a.length;

  // for (const chunk of chunks) for (const item of chunk) odb.put(item)
  for (const item of o.a)
  {
    const put = odb.put(item);
    put.onerror =e=>{console.log(e.target.error,item)};
    put.onsuccess =()=>
    {
      done++;
      if (done === total) postMessage({request_id, data: true});
    };
  }

  if (total === 0) postMessage({request_id, data: true});
};


indexed_db.ops.count =async(db,o,request_id)=>
{ // o = {store:'',key:''}
  const odb = db.transaction(o.store,'readonly').objectStore(o.store);
  // if (o.key) odb.count(IDBKeyRange.bound('startKey', 'endKey'));
  const count = odb.count();
  count.onsuccess =e=> postMessage({request_id, data: count.result});
};


indexed_db.ops.req =async(db,o,request_id)=>
{
  console.log(o);

  let kr, krs = [];
  if (o.since) krs.push(IDBKeyRange.lowerBound(o.since));
  if (o.kinds) krs.push(IDBKeyRange.bound(o.kinds));
  const odb = db.transaction('events').objectStore('events');
  const idx = odb.index('created_at');
  let done = 0;
  const a = [];

  idx.openCursor(kr).onsuccess=e=>
  {
    const cursor = e.target.result;
    if (cursor)
    {
      done++;
      a.push(cursor.value);
      cursor.continue();
    }
    else postMessage({request_id, data: a})
  }
};

indexed_db.ops.some =async(db,o,request_id)=>
{
  const odb = db.transaction('events').objectStore('events');
  const idx = odb.index('created_at');
  const a = [];

  idx.openCursor(null,o.direction).onsuccess=e=>
  {
    const cursor = e.target.result;
    if (cursor)
    {
      a.push(cursor.value);
      if (a.length < o.n) cursor.continue();
      else postMessage({request_id, data: a})
    }
    else postMessage({request_id, data: a})
  }
};


indexed_db.upg =(e) => 
{
  const db = e.target.result;
  const tx = e.target.transaction;
  let st;

  if (!db.objectStoreNames.contains('stuff'))
  {
    db.createObjectStore('stuff',{keyPath:'id'});
  }

  if (!db.objectStoreNames.contains('events'))
  {
    db.createObjectStore('events',{keyPath:'event.id'});
  }
  st = tx.objectStore('events');
  if (!st.indexNames.contains('pubkey')) st.createIndex('pubkey','event.pubkey',{unique:false});
  if (!st.indexNames.contains('kind')) st.createIndex('kind','event.kind',{unique:false});
  if (!st.indexNames.contains('created_at')) st.createIndex('created_at','event.created_at',{unique:false});
  if (!st.indexNames.contains('refs')) st.createIndex('refs','refs',{unique:false,multiEntry:true});
  if (!st.indexNames.contains('id_a')) st.createIndex('id_a','id_a',{unique:false});
  // if (!st.indexNames.contains('tags')) st.createIndex('tags','event.tags',{unique:false,multiEntry:true});

  if (!db.objectStoreNames.contains('authors'))
  {
    db.createObjectStore('authors',{keyPath:'pubkey'});
  }
  st = tx.objectStore('authors');
  if (!st.indexNames.contains('npub')) st.createIndex('npub','npub');
  if (st.indexNames.contains('updated')) st.deleteIndex('updated');
  if (!st.indexNames.contains('name')) st.createIndex('name','metadata.name',{unique:false});
  if (!st.indexNames.contains('nip05')) st.createIndex('nip05','metadata.nip05',{unique:false});
  if (st.indexNames.contains('bff')) st.deleteIndex('bff');
};


indexed_db.ops.upd_e =async(db,o,request_id)=>
{
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
  let done = 0;
  const total = o.a.length;

  for (const item of o.a)
  {
    odb.openCursor(item.event.id).onsuccess=e=>
    {
      const cursor = e.target.result;
      if (cursor)
      {
        const merged = merge(cursor.value,item);
        if (merged) cursor.update(merged);
      }
      else odb.put(item);

      done++;
      if (done === total) postMessage({request_id, data: true});
    }
  }

  if (total === 0) postMessage({request_id, data: true});
};


indexed_db.ops.upd_p =async(db,o,request_id)=>
{
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
  let done = 0;
  const total = o.a.length;

  for (const item of o.a)
  {
    odb.openCursor(item.pubkey).onsuccess=e=>
    {
      const cursor = e.target.result;
      if (cursor) cursor.update(item);
      else odb.put(item);

      done++;
      if (done === total) postMessage({request_id, data: true});
    }
  }

  if (total === 0) postMessage({request_id, data: true});
};