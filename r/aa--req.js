function to_get(events) 
{
   let get_pubkeys;
   try { get_pubkeys = JSON.parse(your.get_pubkeys) }
   catch (error) { get_pubkeys = []; console.log(your.get_pubkeys) }
   let get_ids;
   try { get_ids = JSON.parse(your.get_ids) }
   catch (error) { get_ids = []; console.log(your.get_ids) }
      
   if (events.p)
   {
      let pubkeys = get_pubkeys.concat(events.p);
      let unique_pubkeys = [...new Set(pubkeys.filter(k=>is_hex(k)))];
      let p_to_get = [];
      unique_pubkeys.forEach((p)=> 
      {
         let attempts = parseInt(sessionStorage[p] ? sessionStorage[p] : '0');
         attempts++;
         sessionStorage[p] = attempts;
         
         if (attempts < 22 && !localStorage[p]) p_to_get.push(p)
      });
      your.get_pubkeys = JSON.stringify(p_to_get);
   } 
   
   if (events.e) {
      let ids = get_ids.concat(events.e);
      let unique_ids = [...new Set(ids.filter(k=>is_hex(k)))];
      let e_to_get = [];
      unique_ids.forEach((id)=> 
      {
         let attempts = parseInt(sessionStorage[id] ? sessionStorage[id] : '0');
         attempts++;
         sessionStorage[id] = attempts;
         
         if (attempts < 22 && !document.getElementById('e-'+id)) e_to_get.push(id)
      });
      your.get_ids = JSON.stringify(e_to_get);
   }
}

async function fetch_one(id)
{
//   missing.firstChild
//   Object.entries(relays).forEach(([url, can]) => 
//   {
//      if (can.read && can.ws && can.ws.readyState === 1) 
//      {
//         can.ws.send(JSON.stringify(["REQ", "aa-fetch1", { ids:[id] } ]));
//      }
//   });
} 

async function fetch_some() 
{
   const 
      events = { e: [], p: [] }, 
      orphans = document.querySelectorAll('[data-reply]');
      
//   console.log(orphans); //.slice(0,23)
   
   Array.from(orphans).forEach((l)=>
   {
      let attempts = parseInt(l.dataset.fetched ? l.dataset.fetched : '0');
      attempts++;
      l.dataset.fetched = attempts;
      if (attempts < 22) 
      {
         let root = get_root(JSON.parse(l.dataset.o).tags);
         if (root) events.e.push(root[1]);
         
         let reply = get_reply(JSON.parse(l.dataset.o).tags);
         if (reply) events.e.push(reply[1]);
         
   //      if (t.e) events.e.push(...t.e);
         let t = get_tags(JSON.parse(l.dataset.o).tags);
   //      if (t.e) events.e.push(...t.e);
         if (t.p) 
         {
//            console.log('pew pew', t.p.length);
            t.p.forEach((p)=>{if (is_hex(p)) events.p.push(p)})
//            events.p.push(...); 
         }
      }

      

//      if (t.p) events.p.push(...t.p); 
   });
   if (events.e) 
   {
      events.e = [...new Set(events.e)];
      
      if (events.p) 
      {
         events.p = [...new Set(events.p)];
      } 
   } 
  
//   console.log(events);
   to_get(events);
//   console.log(events)
//   
//   const trendy_e = Math.max.apply(null, events.e);
//   const trendy_p = Math.max.apply(null, events.p);
//   events.e = 
//      console.log(events, trendy_e);
}

async function fetch_mias(id) 
{
   return new Promise(resolve=>
   {
      resolve()
   });
   const missing = mias.querySelectorAll('[data-reply="'+id+'"]');
   if (all.length) {
      
   }
}

async function load_new() 
{
   document.querySelectorAll('.new.event').forEach((event)=>{event.classList.remove('new')});
}

function chunkn(ar,is) 
{
    const res = [];
    for (let i = 0; i < ar.length; i += is) {
        const chunk = ar.slice(i, i + is);
        res.push(chunk);
    }
    return res;
}

function add_missing(k,at) 
{
   missing[k].push(...pubkeys);
}

function get_em() 
{
   load_new();

   if (Object.keys(hose).length) 
   {
      document.getElementById('a').dataset.status = 'fetching... ' + Object.keys(hose).length;
      
      //   const hoes = 
      Object.values(hose).slice(0, 666).forEach((ho)=>
      {
         process(ho)
         .then(()=>{delete hose[ho.id];})
      });   
   } 
   else 
   {
      delete document.getElementById('a').dataset.status;
            
      let pubkeys = your.get_pubkeys ? JSON.parse(your.get_pubkeys) : [];
      let ids = your.get_ids ? JSON.parse(your.get_ids) : [];
      
      let req = ["REQ", "aa-get"];
      
      if (pubkeys.length) 
      {
         let pubs = chunkn(pubkeys, 444);
         pubs.forEach((chunk)=>{req.push({'kinds': [0], 'authors':chunk}) });
         your.get_pubkeys = '[]';
      }
   
      if (ids.length) 
      {
         let idds = chunkn(ids, 444);
         idds.forEach((chunk)=>{req.push({'ids':chunk}) });
         your.get_ids = '[]';
      }
      
      if (ids.length || pubkeys.length) 
      {
         
         req = JSON.stringify(req);
         console.log('fetching ' + ids.length + ' ids & ' + pubkeys.length + ' authors');
         Object.entries(relays).forEach(([url, can]) => 
         {
            if (can.read && can.ws && can.ws.readyState === 1) 
            {
               can.ws.send(req);
            }
         });
      }
      else fetch_some();      
   }   
}

function sub_root(id)
{
   if (id) 
   {
      if (session.sub_root && session.sub_root === id) 
      {
         let tried = session.tried ? JSON.parse(session.tried) : [];
         tried.push(id);
//         fetch_one();
      }
      else 
      {      
         console.log('sub-root ' + id);
         session.sub_root = id;
//         let chunks = chunkn(JSON.parse(your.ff), 444);
         let req = ["REQ", "aa-sub-root", { ids:[id] } ];
//         chunks.forEach((chunk)=>
//         {
//            
//            req.push(
//            {
//               '#e':[id], 
//               'kinds':[1], 
//               'authors': chunk
//            })
//         });
   
   //      console.log(req);
         req = JSON.stringify(req);
   //      console.log(req)
         Object.entries(relays).forEach(([url, can]) => 
         {
            if (can.read && can.ws && can.ws.readyState === 1) 
            {
               can.ws.send(req);
            }
         });
      }
   }   
}

function get_tags(tags) 
{
   const events = { e: [], p: [] };
   
   tags.forEach((tag)=> 
   { 
      if (tag[0] === 'e' || tag[0] === 'p') events[tag[0]].push(tag[1]) 
   });
   
   if (!events.e.length) delete events.e;
   if (!events.p.length) delete events.p;
   
   return events
}

//function childcare(tags) 
//{
//   const ereply = Number.isInteger(tags.ereply) ? tags.tags[tags.ereply][1] : false;
//   const eroot = Number.isInteger(tags.eroot) ? tags.tags[tags.eroot][1] : false;
//   const preply = Number.isInteger(tags.preply) ? tags.tags[tags.preply][1] : false;
//   const proot = Number.isInteger(tags.proot) ? tags.tags[tags.proot][1] : false;
//   
//   const l = tags.nav.closest('.event');
//   
//   let 
//      root = get_root(tags), 
//      reply = get_reply(tags),
//      root_id, reply_id;
//   
//   if (root) root_id = root[1];
//   if (reply) reply_id = reply[1];
//   
//   
//   
//   const ids = [], pubkeys = [];
//   
//   if (eroot && tags.eroot !== tags.ereply)
//   Number.isInteger(tags.eroot)
//   {
//      root = document.getElementById(eroot);
//      if (!root && session[eroot]) 
//      {
//         root = kind1(JSON.parse(session[eroot]))
//      } else 
//      {
//         ids.push(eroot);
//         if (proot 
//         && preply 
//         && proot !== preply 
//         && !your[proot]) 
//         {
//            pubkeys.push(proot);
//         }
//      }      
//   }
//
//   if (session[ereply]) 
//   {
//      reply = process(JSON.parse(session[ereply]), 'childcare');
//   } 
//   else 
//   {
//      ids.push(ereply);
//      if (preply && !your[preply]) pubkeys.push(preply);
//   }
//   
//   if (ids.length > 0 || pubkeys.length > 0) to_get(ids, pubkeys);
//}