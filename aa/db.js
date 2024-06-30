// database stuff

// aa.db = 
// {
//   def:{id:'db'},
//   e:{}, // memory events (dat)
//   p:{}, // memory profiles (pro)
//   q:{},
// };


// web cache navigation for offline use

// if ('serviceWorker' in navigator) navigator.serviceWorker.register('/cash.js');


// web cache worker

aa.db.cash = 
{
  get new(){ return new Worker('/cash.js')}
};

// worker for operations without response

aa.db.cash.worker = aa.db.cash.new;


// perform cache operations and return results

aa.db.cash.ops =async o=>
{
  return new Promise(resolve=>
  {
    const cash = aa.db.cash.new;
    
    cash.onmessage =e=> 
    {
      setTimeout(()=>{cash.terminate()},200);
      resolve(e.data);
    }
    cash.postMessage(o);
  });
};


// indexeddb stuff

aa.db.idb = 
{
  get new(){ return new Worker('/aa/db_idb.js')}
};


// worker for operations without response

aa.db.idb.worker = aa.db.idb.new;


// perform indexeddb operations and return results

aa.db.idb.ops =async o=>
{
  return new Promise(resolve=>
  {
    const idb = aa.db.idb.new;
    idb.onmessage=e=>
    {
      setTimeout(()=>{idb.terminate()},200);
      resolve(e.data);
    }
    idb.postMessage(o);
  });
};