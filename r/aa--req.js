function fetch_missing(relay_url) 
{  
   console.log('fetch missing', relay_url);
   let events = { e: [], p: [] }     
   document.querySelectorAll('[data-reply]').forEach((l)=>
   {
      let reply = document.getElementById('e-'+l.dataset.reply);
      if (reply) lies(reply,l);
      else 
      {
         if (!relay_url) 
         {
            delete l.dataset.not_seen
         }
         else 
         {
            let not_seen = l.dataset.not_seen ? JSON.parse(l.dataset.not_seen) : [];
            if (!not_seen.includes(relay_url)) 
            {
               not_seen.push(relay_url);
               l.dataset.not_seen = JSON.stringify(not_seen);
               const o = db[l.dataset.x].o;
   
               let t = get_ep_tags(o.tags);
               if (t.p) t.p.forEach((p)=>{if (!aa.p[p] || !aa.p[p].data) events.p.push(p)});
               if (!aa.p[o.pubkey] || !aa.p[o.pubkey].data) events.p.push(o.pubkey);
               if (t.e) t.e.forEach((e)=>{if (!db[e] || !db[e].o) events.e.push(e)});
            }
         }

      }
   });
   
   let req = ["REQ", "aa-get"];
   
   if (events.e) 
   {
      events.e = [...new Set(events.e)];
      chunkn(events.e, 444).forEach((chunk)=>{req.push({'ids':chunk}) });
   }
   
   if (events.p) 
   {
      events.p = [...new Set(events.p)];
      chunkn(events.p, 444).forEach((chunk)=>{req.push({'kinds': [0], 'authors':chunk}) });
   }

   if (req.length > 2)
   {
      const 
         last_req = relays[relay_url].get, 
         s_req = JSON.stringify(req);
      
      if (!last_req || last_req !== s_req)
      {
         relays[relay_url].get = s_req;
//         r_mess(['req', [req, relay_url]]);
         demand([req, relay_url]);
      }
   }
//   else document.getElementById('a').textContent = 'whatever the fuck you want';
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

function get_ep_tags(tags) 
{
   const events = { e: [], p: [] };
   
   tags.forEach((tag)=> 
   { 
      if ((tag[0] === 'e' || tag[0] === 'p') && is_hex(tag[1])) 
      {
         events[tag[0]].push(tag[1]);
      }
   });
   
   if (!events.e.length) delete events.e;
   if (!events.p.length) delete events.p;
   
   return events
}