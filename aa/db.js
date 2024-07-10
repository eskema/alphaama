/*

alphaama
database stuff

*/


// web cache navigation for offline use
// if ('serviceWorker' in navigator) navigator.serviceWorker.register('/cash.js');

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

// web cache worker
aa.db.cash = { get new(){ return new Worker('/cash.js')} };
// worker for operations without response
aa.db.cash.worker = aa.db.cash.new;
// perform cache operations and return results
aa.db.cash.ops =async o=> await aa.db.get('cash',o);
// {
  // return new Promise(resolve=>
  // {
  //   const cash = aa.db.cash.new;
  //   cash.onmessage =e=> 
  //   {
  //     setTimeout(()=>{cash.terminate()},200);
  //     resolve(e.data);
  //   }
  //   cash.postMessage(o);
  // });
// };


// indexeddb stuff
aa.db.idb = { get new(){ return new Worker('/aa/db_idb.js')} };
// worker for operations without response
aa.db.idb.worker = aa.db.idb.new;
// perform indexeddb operations and return results
aa.db.idb.ops =async o=> await aa.db.get('idb',o);
// {
//   return new Promise(resolve=>
//   {
//     const idb = aa.db.idb.new;
//     idb.onmessage=e=>
//     {
//       setTimeout(()=>{idb.terminate()},200);
//       resolve(e.data);
//     }
//     idb.postMessage(o);
//   });
// };