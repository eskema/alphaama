const indexed_db = 
{
  ops:{},
  chunks:4444
};


indexed_db.ops.stores =async(db,o)=>
{
  // console.log(db.objectStoreNames);
  postMessage(db.objectStoreNames);
};


indexed_db.ops.clear =async(db,o)=>
{
  let times = 0;
  for (const store of o.stores)
  {
    const odb = db.transaction(store,'readwrite').objectStore(store);
    const store_clear = odb.clear();
    store_clear.onsuccess =e=> 
    {
      times++;
      if (times === o.stores.length) postMessage('db '+o.store+' cleared');
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


indexed_db.ops.dex =async(db,o)=>
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
      if (done === o.a.length) postMessage(a);
    };
  }
};


indexed_db.ops.dex_all =async(db,o)=>
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
    else postMessage(a)
  }
};


indexed_db.ops.get =async(db,o)=>
{ // o = {store:'',key:'id'}
  const odb = db.transaction(o.store).objectStore(o.store);
  odb.get(o.key).onsuccess=e=> postMessage(e.target.result);
};


indexed_db.ops.get_a =async(db,o)=>
{ // o = {store:'',a:[]}
  const odb = db.transaction(o.store).objectStore(o.store);
  const a = [];
  let done = 0;
  for (const item of o.a)
  {
    odb.get(item).onsuccess=e=>
    {
      done++;
      let result = e.target.result
      if (result) a.push(result);
      if (done === o.a.length) postMessage(a);
    }
  }
};


indexed_db.ops.get_all =async(db,store)=>
{
  const odb = db.transaction(store).objectStore(store);
  odb.getAll().onsuccess=e=> postMessage(e.target.result);
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


indexed_db.ok =(db,o)=> 
{
  const total = Object.keys(o).length;
  let done = 0;
  for (const k in o)
  {
    try { indexed_db.ops[k](db,o[k]).then(()=>{done++}) }
    catch (er) {console.error(er);done++}
    if (done === total) setTimeout(db.close,200)
  }
}


onmessage =m=> 
{
  // console.log('db onmessage',m.data);
  const db = indexedDB.open("alphaama", 16);
  db.onerror =e=>{ console.log('db error',e)};
  db.onupgradeneeded = indexed_db.upg;
  db.onsuccess =e=> indexed_db.ok(e.target.result,m.data);  
}


indexed_db.ops.put =async(db,o)=>
{ // o = {store:'',a:[]}
  // const chunks = chunker(o.a,indexed_db.chunks);
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
  
  // for (const chunk of chunks) for (const item of chunk) odb.put(item)
  for (const item of o.a) odb.put(item)
};


indexed_db.ops.count =async(db,o)=>
{ // o = {store:'',key:''}
  const odb = db.transaction(o.store,'readonly').objectStore(o.store);
  // if (o.key) odb.count(IDBKeyRange.bound('startKey', 'endKey'));
  const count = odb.count();
  count.onsuccess =e=> postMessage(count.result);
};


indexed_db.ops.req =async(db,o)=>
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
    else postMessage(a)
  }
};

indexed_db.ops.some =async(db,o)=>
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
      else postMessage(a)
    }
    else postMessage(a)
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


indexed_db.ops.upd_e =async(db,o)=>
{
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
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
      else odb.put(item)
    }
  }
};


indexed_db.ops.upd_p =async(db,o)=>
{
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
  for (const item of o.a) 
  {
    odb.openCursor(item.pubkey).onsuccess=e=>
    {
      const cursor = e.target.result; 
      if (cursor) cursor.update(item);
      else odb.put(item)
    }
  }
};