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

async function fetch_some() 
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

async function load_new() 
{
//   requestAnimationFrame(()=> 
//   {
//      
//	});
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

async function get_em() 
{
   load_new();
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
         else fetch_some(); 
      }
   }   
}

function sub_root(id)
{
   if (session.sub_root && session.sub_root === id) 
   {
      let tried = session.tried ? JSON.parse(session.tried) : [];
      tried.push(id);
   }
   else 
   {  
      console.log('sub-root ' + id);    
      session.sub_root = id;
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
   if (session.sub_p && session.sub_p === pubkey) 
   {
      let tried = session.tried ? JSON.parse(session.tried) : [];
      tried.push(id);
   }
   else 
   {  
      console.log('sub-p ' + pubkey);    
      session.sub_p = pubkey;
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