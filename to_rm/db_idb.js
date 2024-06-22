// aa.db indexedDB stuff

aa.db.idb = 
{
  get new(){ return new Worker('./aa/db_idb_worker.js')}
};


// instantiate a worker for putting stuff

aa.db.idb.worker = aa.db.idb.new;


// perform operations from database

aa.db.idb.ops =async o=>
{
  return new Promise(resolve=>
  {
    const db = aa.db.idb.new;
    db.onmessage=e=>
    {
      setTimeout(()=>{db.terminate()},200);
      resolve(e.data);
    }
    db.postMessage(o);
  });
};


// put in database (no response)

aa.db.idb.put =async o=> aa.db.idb.worker.postMessage(o);


// clear stores from database

// aa.db.idb.clear = async a=>
// {
//   return await aa.db.idb.ops({clear:{stores:a}});
// };

