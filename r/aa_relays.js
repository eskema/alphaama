// service workers are not good for relay subscriptions as I've learned they just die by themselves when they feel like it. switching this back to the main thread :/

const relays = {};

function add_relaytion(ships) 
{
   let new_relays = [...Object.entries(ships)
   .filter(([url, can])=> can.read || can.write )];
   
   new_relays.map(([url, can])=>
   {
      let ur_l;
      try{ur_l = new URL(url) } catch (er) { console.log('bad relay url') }
      if (ur_l && ur_l.protocol === 'wss:') 
      {
         const relay = ur_l.href;
         relays[relay] = can;
         connect(relay);
      }
   });
}

function demand(stuff) // [req, origin = false]
{
   let rr = stuff[1] && relays[stuff[1]] 
   ? [relays[stuff[1]]] 
   : relays 
      ? Object.values(relays) 
      : [];
   
   if (options.log.demand) console.log('demanding', stuff[0]);
   rr.filter((can)=> can.read && can.ws && can.ws.readyState === 1)
   .map((can)=> 
   { 
      if (!can.reqs) can.reqs = {};
      can.reqs[stuff[0][1]] = [];
      if (options.log.demand) console.log('req ' + stuff[0][1] + ' from', can.ws.url); 
      can.ws.send(JSON.stringify(stuff[0])) 
   })
}

function broadcast(shit)
{
   if (options.log.broadcast) console.log('broadcasting', shit);
   Object.values(relays).filter((can)=> can.write && can.ws && can.ws.readyState === 1)
   .map((can)=> 
   {
      if (options.log.broadcast) console.log('sent to', can.ws.url);
      can.ws.send(JSON.stringify(shit))
   })
}

function force_close()
{
   Object.values(relays).map((can)=>
   { if (can.ws){ can.fc = true; can.ws.close(); delete can.ws } })
}

function f_open(resume) 
{
   const request_filters = [];
   let bff = aa.p[aa.k].bff ? aa.p[aa.k].bff : [];
   const subs = [aa.k, ...bff];
   const since = x_days(options.days);
   const wen = resume && aa.t ? aa.t > since ? aa.t : since : since;
   // profiles and contacts from your you and your follows
   let profiles_filter = {authors: subs, kinds:[0,3,10002]};
   if (resume) profiles_filter.since = wen;
   request_filters.push(profiles_filter);
   // notes and reactions from your you and your follows
   request_filters.push({authors: subs, kinds:[1,2,7,40,42,30023], since: wen});
   // replies to your posts
   request_filters.push({'#p': [aa.k], kinds:[1,7], since: wen});
   
   return request_filters
}

function open(e) 
{
   if (options.log.open) console.log('connected to ' + e.target.url)
   if (relays[e.target.url].read) 
   {
      let resume = relays[e.target.url].open;
      if (!resume) 
      {
         resume = false;
         relays[e.target.url].open = 1
      }
      else relays[e.target.url].open++
      
      demand([['REQ', 'aa-open', ...f_open(resume)], e.target.url])
   }
   
}

async function retry(e) 
{
   if (!relays[e.target.url].fc) 
   {
      let cc = relays[e.target.url].cc;
      const fails = cc.unshift(e.timeStamp);
      // reconnect if somewhat stable
      if (fails < 10 || cc[1] && cc[0] - cc[1] > 99999) 
      {  
         setTimeout(()=>{ connect(e.target.url) }, 420 * fails)
      } 
   } else console.log(e.target.url + ' says no');
}

async function connect(url) 
{  
   if (relays[url].fc) delete relay[url].fc;
   if (!relays[url].cc) relays[url].cc = [];
   
   relays[url].ws = new WebSocket(url);
   relays[url].ws.addEventListener('open', open); 
   relays[url].ws.addEventListener('message', messag);
   relays[url].ws.addEventListener('close', retry);
}


function pr(event_data) 
{
   const o = event_data.o;
   if (event_data.draft) console.log(event_data);
   if (o) 
   {
      if (!aa.t || aa.t < o.created_at) aa.t = o.created_at;
      let contact = p_get(o.pubkey);
      
      switch (o.kind) 
      {
         case 0: kind0(event_data); break;
         case 1: kind1(event_data); break;
         case 2: kind1(event_data); break;
         case 3: kind3(event_data); break;
         case 7: kind1(event_data); break;
         case 40: kind1(event_data); break;
         case 42: kind1(event_data); break;
         case 10002: kind1(event_data); break;
         case 30023: kind1(event_data); break;
//         case 10001: kind10001(10001);break;
               // defolt(o); break; 
      }
   }
   else console.log('no ' + event_data)
}

function event_messag(e) 
{
   if (!db[e.data[2].id]) 
   {
      if (NostrTools.validateEvent(e.data[2]) && NostrTools.verifySignature(e.data[2])) db_new_id(e.data[2].id, e);
      else console.log('invalid event:', e);
   }
   else if (!db[e.data[2].id].seen.includes(e.origin)) 
   {
      db[e.data[2].id].seen.push(e.origin)
   }
   const incoming = relays[e.origin].reqs[e.data[1]];
   if (!incoming) 
   {
      if (db[e.data[2].id])
      {
         pr(db[e.data[2].id]);
         fetch_missing(e.origin);      
      }
   }
   else relays[e.origin].reqs[e.data[1]].push(e.data[2].id);
}

function eose_messag(e) 
{
   // ["EOSE", <sub_id>]
   const ids = [...new Set(relays[e.origin].reqs[e.data[1]])];
   if (options.log.eose) console.log(e.data[0], e.data[1] + ' ' + e.origin + ' ' + ids.length);
   ids.forEach((id)=> { pr(db[id]) });
   delete relays[e.origin].reqs[e.data[1]];
   fetch_missing(e.origin);
}

function notice_messag(e) 
{
   // ["NOTICE", <sub_id>, <message>]
   console.log(e.data[0],e)
}

function ok_messag(e) 
{
   // ["OK", <event_id>, <true|false>, <message>]
   console.log(e.data[0],e)
}

function auth_messag(e) 
{
   // ["AUTH", ?]
   console.log(e.data[0],e)
}

function messag(e)
{
   let data;
   try{data=JSON.parse(e.data)}
   catch(err){console.log('invalid data from '+e.origin,e.data)}
   if (data)
   {  
      const dat = {data:data, origin: e.target.url}
      switch (data[0])
      {
         case 'EVENT': event_messag(dat); // an event
            break;
         case 'EOSE': eose_messag(dat); // end of stored events
            break;
         case 'NOTICE': notice_messag(dat); // information from relays
            break;
         case 'OK': ok_messag(dat); // EVENT received by relay
            break;
         case 'AUTH': auth_messag(dat); // EVENT received by relay
            break;
         default: console.log('massage',dat);
      }
   }
}