const indexed_db = {ops:{}};

indexed_db.ops.clear =async(db,o)=>
{
  for (const store of o.stores)
  {
    console.log(store);
    const odb = db.transaction(store,'readwrite').objectStore(store);
    const store_clear = odb.clear();
    store_clear.onsuccess =e=> postMessage('db '+o.store+' cleared');
  }
};

indexed_db.ops.put =async(db,o)=>
{ // o = {store:'',a:[]}
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
  for (const item of o.a) odb.put(item)
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

indexed_db.ops.dex =async(db,o)=>
{ 
  const odb = db.transaction(o.store).objectStore(o.store).index(o.index);
  const a = [];
  let done = 0;
  for (const item of o.a)
  {
    odb.get(item).onsuccess=e=>
    {
      a.push(e.target.result); 
      done++; 
      if (done === o.a.length) postMessage(a);
    };
  }
};

indexed_db.ops.dex_all =async(db,o)=>
{
  console.log(o);
  const odb = db.transaction(o.store).objectStore(o.store);
  const idx = odb.index(o.index);
  let done = 0;
  const a = [];
  
  idx.openCursor(o.key).onsuccess=e=>
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

indexed_db.ops.req =async(db,o)=>
{
  console.log(o);

  let kr, krs = [];
  if (o.since) krs.push(IDBKeyRange.lowerBound(o.since));
  if (o.kinds) krs.push(IDBKeyRange.bound(o.kinds));
  const odb = db.transaction('events').objectStore('events');
  const idx = odb.index('created_at');
  // {kinds:[1,7],since:1}
  // const idx = odb.index('since');
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

const a_set =(a,dis)=>
{
  let b;
  for (const k of dis)
  {
    if (!a.includes(k)) 
    {
      a.push(k);
      b = true;
    }
  }
  return b
};

const merge =(dis,dat)=>
{
  let merged,sets = ['seen','subs','clas'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) 
    { 
      dis[set] = [];
      merged=true; 
    } 
    if (!dat.hasOwnProperty(set)) dat[set] = [];
    if (a_set(dis[set],dat[set])) merged=true;
  }
  return merged
}; 

indexed_db.ops.upd =async(db,o)=>
{
  const odb = db.transaction(o.store,'readwrite').objectStore(o.store);
  for (const item of o.a)
  {
    odb.openCursor(item.event.id).onsuccess=e=>
    {
      const cursor = e.target.result; 
      if (cursor) 
      { 
        // console.log('db cursor');
        const og = cursor.value;
        if (merge(og,item)) cursor.update(item);
      }
      else odb.put(item)
    }
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

  // db.deleteObjectStore('events');
  if (!db.objectStoreNames.contains('events'))
  {
    db.createObjectStore('events',{keyPath:'event.id'});
  }
  st = tx.objectStore('events');
  if (!st.indexNames.contains('pubkey')) st.createIndex('pubkey','event.pubkey');
  if (!st.indexNames.contains('kind')) st.createIndex('kind','event.kind');
  // st.deleteIndex('created_at');
  if (!st.indexNames.contains('created_at')) st.createIndex('created_at','event.created_at');
  
  if (!db.objectStoreNames.contains('authors'))
  {
    db.createObjectStore('authors',{keyPath:'xpub'});
  }
  st = tx.objectStore('authors');
  if (!st.indexNames.contains('npub')) st.createIndex('npub','npub');
  if (!st.indexNames.contains('updated')) st.createIndex('updated','updated');
  if (!st.indexNames.contains('sets')) st.createIndex('sets','sets');
  if (!st.indexNames.contains('name')) st.createIndex('name','metadata.name');
  if (!st.indexNames.contains('nip05')) st.createIndex('nip05','metadata.nip05');
  if (!st.indexNames.contains('bff')) st.createIndex('bff','extradata.bff');
};
indexed_db.err =e=>{ console.log('db error',e) };
indexed_db.ok =(db,o)=> 
{
  const total = Object.keys(o).length;
  let done = 0;
  for (const k in o)
  {
    try { indexed_db.ops[k](db,o[k]).then(()=>{done++}) }
    catch (err) {console.log(err);done++}
    if (done === total) setTimeout(db.close,200)
  }
}
onmessage =m=> 
{ 
  // console.log('db onmessage',m.data);
  const db = indexedDB.open("alphaama", 13);
  db.onerror = indexed_db.err;
  db.onupgradeneeded = indexed_db.upg;
  db.onsuccess =e=> indexed_db.ok(e.target.result,m.data);  
}