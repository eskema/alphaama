function to_get(ids, pubkeys) 
{
   let get_pubkeys = session.get_pubkeys ? JSON.parse(session.get_pubkeys) : [];
   let get_ids = session.get_ids ? JSON.parse(session.get_ids) : [];
   
   pubkeys = get_pubkeys.concat(pubkeys);
   let u_pubkeys = [...new Set(pubkeys)];
//   console.log(u_pubkeys);
   session.get_pubkeys = JSON.stringify(u_pubkeys);
   
   ids = get_ids.concat(ids);
   let u_ids = [...new Set(ids)];
//   console.log(u_ids);
   session.get_ids = JSON.stringify(u_ids);
}

function get_em() 
{
   
   let req = ["REQ", "aa-get"];
   
   let pubkeys = session.get_pubkeys ? JSON.parse(session.get_pubkeys) : [];
   let ids = session.get_ids ? JSON.parse(session.get_ids) : [];
      
   if (pubkeys.length > 0) 
   {
      req.push({'kinds': [0], 'authors':pubkeys})
      session.get_pubkeys = [];
   }

   if (ids.length > 0) 
   {
      req.push({'ids':ids})
      session.get_ids = [];
   }
   
   if (ids.length > 0 || pubkeys.length > 0) 
   {
      req = JSON.stringify(req);
      
      Object.entries(relays).forEach(([url, can]) => 
      {
         if (can.read && can.ws && can.ws.readyState === 1) 
         {
            can.ws.send(req);
         }
      });
   }   
}

function childcare(tags) 
{
   const ereply = Number.isInteger(tags.ereply) ? tags.tags[tags.ereply][1] : false;
   const eroot = Number.isInteger(tags.eroot) ? tags.tags[tags.eroot][1] : false;
   const preply = Number.isInteger(tags.preply) ? tags.tags[tags.preply][1] : false;
   const proot = Number.isInteger(tags.proot) ? tags.tags[tags.proot][1] : false;
   
   const l = tags.nav.closest('.event');
   
   let root = false, reply = false;
   
   const ids = [], pubkeys = [];
   
   if (eroot && tags.eroot !== tags.ereply)
   Number.isInteger(tags.eroot)
   {
      root = document.getElementById(eroot);
      if (!root && session[eroot]) 
      {
         root = kind1(JSON.parse(session[eroot]))
      } else 
      {
         ids.push(eroot);
         if (proot 
         && preply 
         && proot !== preply 
         && !your[proot]) 
         {
            pubkeys.push(proot);
         }
      }      
   }

   if (session[ereply]) 
   {
      reply = process(JSON.parse(session[ereply]), 'childcare');
   } 
   else 
   {
      ids.push(ereply);
      if (preply && !your[preply]) pubkeys.push(preply);
   }
   
   if (ids.length > 0 || pubkeys.length > 0) to_get(ids, pubkeys);
}