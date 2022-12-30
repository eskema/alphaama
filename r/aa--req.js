function to_get(events) 
{     
//   if (events.p)
//   {
//      pubkeys.push(...events.p);
//      pubkeys = [...new Set(pubkeys.filter(k=>is_hex(k)))];
//      let p_to_get = [];
//      pubkeys.forEach((p)=> 
//      {
//         if (!attempts[p]) attempts[p] = 0;
//         attempts[p]++;
//         
//         if (attempts[p] < 22 && !aa.p[p]) p_to_get.push(p)
//      });
//      pubkeys = JSON.stringify(p_to_get);
//   } 
//   
//   if (events.e) {
//      let ids = get_ids.concat(events.e);
//      let unique_ids = [...new Set(ids.filter(k=>is_hex(k)))];
//      let e_to_get = [];
//      unique_ids.forEach((id)=> 
//      {
//         let attempts = parseInt(sessionStorage[id] ? sessionStorage[id] : '0');
//         attempts++;
//         sessionStorage[id] = attempts;
//         
//         if (attempts < 22 && !document.getElementById('e-'+id)) e_to_get.push(id)
//      });
//      localStorage.get_ids = JSON.stringify(e_to_get);
//   }
}

function fetch_missing(relay_url) 
{  
   const events = { e: [], p: [] }     
   document.querySelectorAll('[data-reply]').forEach((l)=>
   {
      let reply = document.getElementById('e-'+l.dataset.reply);
      if (reply) lies(reply,l);
      else 
      {
         let attempts = parseInt(l.dataset.fetched ? l.dataset.fetched : '0');
         if (attempts < 22) 
         {
            attempts++;
            l.dataset.fetched = attempts;
            const o = JSON.parse(l.dataset.o);
//            let root = get_root(o.tags);
            
//            if (root 
//            && !document.getElementById('e-'+root[1])
//            && !hose[root[1]]) events.e.push(root[1]);
            
            let reply = get_reply(o.tags);
            if (reply 
            && !document.getElementById('e-'+reply[1])
            ) events.e.push(reply[1]);
            
            let t = get_tags(o.tags);
            if (t.p) 
            {
               t.p.forEach((p)=>{if (is_hex(p) && !aa.p[p]) events.p.push(p)})
            }
         }
      }
   });
   
   if (events.e) 
   {
      events.e = [...new Set(events.e)];
      if (events.p) events.p = [...new Set(events.p)];
      
      
//      document.getElementById('a').dataset.status = '... ' + events.e.length + 'e & ' + events.p.length + ' p';
//      delete document.getElementById('a').dataset.status;
      
      let req = ["REQ", "aa-get"];
               
      if (events.p) 
      {
         let pubs = chunkn(events.p, 444);
         pubs.forEach((chunk)=>{req.push({'kinds': [0], 'authors':chunk}) });
      }
      
      let ids = chunkn(events.e, 444);
      ids.forEach((chunk)=>{req.push({'ids':chunk}) });

      let 
         rekt,
         rekt_url = aa.rekt[relay_url];
      if (rekt_url) rekt = aa.rekt[relay_url][req[1]];
      else aa.rekt[relay_url] = {};

      if (req.length > 2 && JSON.stringify(req) !== JSON.stringify(rekt)) 
      {
         console.log(rekt, req)
         console.log('fetching ' + events.e.length + ' e & ' + events.p.length + ' p from ' + relay_url);
         aa.rekt[relay_url][req[1]] = req;
//         console.log(aa.rekt);
//            console.log(req)
         re.postMessage(['req', [req, relay_url]]);
      }
   }
}

function fetch_some() 
{
   const 
      events = { e: [], p: [] }, 
      orphans = document.querySelectorAll('[data-reply]');      
   
   Array.from(orphans).forEach((l)=>
   {
      let reply = document.getElementById('e-'+l.dataset.reply);
      if (reply)
      {
         lies(reply,l);
      }
      else {
         let attempts = parseInt(l.dataset.fetched ? l.dataset.fetched : '0');
         if (attempts < 22) 
         {
            attempts++;
            l.dataset.fetched = attempts;
            
            let root = get_root(JSON.parse(l.dataset.o).tags);
            if (root 
            && !document.getElementById('e-'+root[1])
            && !hose[root[1]]) events.e.push(root[1]);
            
            let reply = get_reply(JSON.parse(l.dataset.o).tags);
            if (reply 
            && !document.getElementById('e-'+reply[1])
            && !hose[reply[1]]) events.e.push(reply[1]);
            
            let t = get_tags(JSON.parse(l.dataset.o).tags);
            if (t.p) 
            {
               t.p.forEach((p)=>{if (is_hex(p) && !localStorage[p]) events.p.push(p)})
            }
         }
      }
   });
   
   if (events.e) 
   {
      events.e = [...new Set(events.e)];
      
      if (events.p) 
      {
         events.p = [...new Set(events.p)];
      } 
   } 
  
   to_get(events);
}

function load_new() 
{
   document.querySelectorAll('.new.event').forEach((e)=>{e.classList.remove('new')});  
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

function hoes(e) 
{
   const oes = Object.values(hose);
   oes.forEach((ho)=> { process(ho) });
   if (oes.length) document.getElementById('a').dataset.mess = oes.length;
   else delete document.getElementById('a').dataset.mess
}

function get_em() 
{
//   load_new();
   const hoe = Object.values(hose);
   if (hoe.length) 
   {
      document.getElementById('a').dataset.status = 'fetching... ' + hoe.length;
      
      hoe.forEach((ho)=>
      {
         process(ho)
         .then(()=>{delete hose[ho.id];})
      });   
   } 
   else 
   {
      delete document.getElementById('a').dataset.status;
      let req = ["REQ", "aa-get"];
      
      if (pubkeys.length) 
      {
         let pubs = chunkn(pubkeys, 444);
         pubs.forEach((chunk)=>{req.push({'kinds': [0], 'authors':chunk}) });
         localStorage.get_pubkeys = '[]';
      }
   
      if (ids.length) 
      {
         let idds = chunkn(ids, 444);
         idds.forEach((chunk)=>{req.push({'ids':chunk}) });
         localStorage.get_ids = '[]';
      }
      
      if (ids.length || pubkeys.length) 
      {
         req = JSON.stringify(req);
         let last_req = sessionStorage.req_get;
         if (req !== last_req) 
         {
            sessionStorage.req_get = req;
            console.log('fetching ' + ids.length + ' ids & ' + pubkeys.length + ' authors');
            Object.entries(relays).forEach(([url, can]) => 
            {
               if (can.read && can.ws && can.ws.readyState === 1) can.ws.send(req);
            });
         }
      }
      else 
      {
         if (messages.length) 
         {
            messages.forEach(process_message)
            messages.splice(0,messages.length)
         } 
//         else fetch_some(); 
      }
   }   
}

function sub_root(id)
{
   if (sessionStorage.sub_root && sessionStorage.sub_root === id) 
   {
      let tried = sessionStorage.tried ? JSON.parse(sessionStorage.tried) : [];
      tried.push(id);
   }
   else 
   {  
      console.log('sub-root ' + id);    
      sessionStorage.sub_root = id;
      let req = ["REQ", "aa-sub-root", { ids:[id] } ];
      req = JSON.stringify(req);
      Object.entries(relays).forEach(([url, can]) => 
      {
         if (can.read && can.ws && can.ws.readyState === 1) can.ws.send(req);
      });
   }  
}

function sub_p(pubkey)
{
   if (sessionStorage.sub_p && sessionStorage.sub_p === pubkey) 
   {
      let tried = sessionStorage.tried ? JSON.parse(sessionStorage.tried) : [];
      tried.push(id);
   }
   else 
   {  
      console.log('sub-p ' + pubkey);    
      sessionStorage.sub_p = pubkey;
      let req = ["REQ", "aa-sub-p", { authors:[pubkey], kinds:[1], limit: 10 } ];
      req = JSON.stringify(req);
      Object.entries(relays).forEach(([url, can]) => 
      {
         if (can.read && can.ws && can.ws.readyState === 1) can.ws.send(req);
      });
   }  
}

function get_tags(tags) 
{
   const events = { e: [], p: [] };
   
   tags.forEach((tag)=> 
   { 
      if ((tag[0] === 'e' || tag[0] === 'p') && is_hex(tag[1])) events[tag[0]].push(tag[1]) 
   });
   
   if (!events.e.length) delete events.e;
   if (!events.p.length) delete events.p;
   
   return events
}