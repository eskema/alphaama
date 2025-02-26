// web cache worker
aa.db.cash = { get new(){ return new Worker('/cash.js')} };

// perform cache operations and return results
aa.db.cash.ops =async o=> await aa.db.get('cash',o);


// count items in db store
aa.db.count =async(s='')=>await aa.db.get('idb',{count:{store:s,key:''}});


// pass operations to worker and 
aa.db.get =async(s,o)=>
{
  return new Promise(resolve=>
  {
    const db = aa.db[s].new;
    db.onmessage =e=> 
    {
      setTimeout(()=>{db.terminate()},200);
      resolve(e.data);
    }
    db.postMessage(o);
  });
};


// indexeddb stuff
aa.db.idb = { get new(){ return new Worker('/aa/db_idb.js')} };


// perform indexeddb operations and return results
aa.db.idb.ops =async o=> await aa.db.get('idb',o);


// cache worker for operations without response
aa.db.cash.worker = aa.db.cash.new;


// indexedDB worker for operations without response
aa.db.idb.worker = aa.db.idb.new;


