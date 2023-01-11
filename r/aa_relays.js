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
   
   console.log('demanding', stuff[0]);
   rr.filter((can)=> can.read && can.ws && can.ws.readyState === 1)
   .map((can)=> 
   { 
      if (!can.reqs) can.reqs = {};
      can.reqs[stuff[0][1]] = [];
      console.log('demanded from', can.ws.url); 
      can.ws.send(JSON.stringify(stuff[0])) 
   })
}

function broadcast(shit)
{
   console.log('broadcasting', shit);
   Object.values(relays).filter((can)=> can.write && can.ws && can.ws.readyState === 1)
   .map((can)=> 
   {
      console.log('broadcasted to', can.ws.url);
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
   const subs = [aa.k, ...aa.bff];
   const since = x_days(options.days);
   const wen = resume && aa.t ? aa.t > since ? aa.t : since : since;
   // profiles and contacts from your you and your follows
   request_filters.push({authors: subs, kinds:[0,3]});
   // notes and reactions from your you and your follows
   request_filters.push({authors: subs, kinds:[1,7], since: wen});
   // replies to your posts
   request_filters.push({'#p': [aa.k], kinds:[1,7], since: wen});
   
   return request_filters
}

function open(e) 
{
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
   else console.log('connected to write only ' + e.target.url)
}

function retry(e) 
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
//   if (relays[url].reqs) delete relay[url].reqs;
   if (!relays[url].cc) relays[url].cc = [];
   
   let connected;
   relays[url].ws = new WebSocket(url);
   relays[url].ws.addEventListener('open', open); 
   relays[url].ws.addEventListener('message', messag);
   relays[url].ws.addEventListener('close', retry);
}

//function r_process(dis,dat,origin) 
//{
//   dat.seen = [origin];
//   let r = origin + '/';
//   if (relays[r].reqs[dis]) relays[r].reqs[dis].push(dat);
//   else pre_process(['EVENT',origin,[dis,dat]]);
//   
//   if(!seen[origin][dis][dat.id].seen.includes(origin)) seen[dis][dat.id].seen.push(origin);
//   
//   if (eose[origin] 
//   && eose[origin].includes(dis)
//   ) 
//
//}

//function eose_handler(dis, origin) 
//{
//   const sorted = relays[origin + '/'].reqs[dis]
//   .sort((a,b)=>{a.created_at - b.created_at});
//   
//   pre_process(['EOSE', origin, [dis,sorted]])
//   delete relays[origin + '/'].reqs[dis];
//   
//}

function pr(event_data) 
{
   const o = event_data.o;
   if (o) 
   {
      if (!aa.t || aa.t < o.created_at) aa.t = o.created_at;
      
      switch (o.kind) 
      {
         case 0: kind0(o); break;
         case 1: kind1(o); break;
         case 2: kind1(o); break;
         case 3: kind3(o); break;
         case 7: kind1(o);break;
               // defolt(o); break; 
      }
   }
   else console.log('no ' + event_data)
}

//function message(e)
//{
//   let mess;
//   try { mess = JSON.parse(e.data) }
//   catch (err) { console.log('invalid event from ' + e.origin, e)}
//   if (mess) 
//   {
//      const 
//         m = mess[0], // the message type
//         dis = mess[1], // the EVENT request id or NOTICE message
//         dat = mess[2]; // the EVENT message
//      
//      switch (m)
//      {
//         case 'EVENT':
//            r_process(dis,dat,e.origin);
//            break;
//         case 'EOSE': // end of stored events
//            eose_handler(dis, e.origin);
//            console.log(e);
//            break;
//         case 'OK': // post received by relay
//         case 'NOTICE': // information from relays
//         default: pre_process([m, dis, e.origin]);
//      }
//   }
//}


//demand([m_req(req_id, filters), url])

//function m_req(req_id, filters) 
//{
//   const req = ['REQ', req_id, ...filters];
//   
//   reqs[dis]['aa-open'] = [JSON.stringify(req)];
//   
//   r_mess(['req', [req, dis]]);
//   
//   console.log(dis, req);
//   document.getElementById('a').textContent = 'REQ aa-open ' + dis;
//}


function event_messag(e) 
{
   if (!db[e.data[2].id]) 
   {
      db_new_id(e.data[2].id, e) 
   }
   else if (!db[e.data[2].id].seen.includes(e.origin)) 
   {
      db[e.data[2].id].seen.push(e.origin)
   }
   const incoming = relays[e.origin].reqs[e.data[1]];
   if (!incoming) 
   {
      pr(db[e.data[2].id]);
      fetch_missing(e.origin);
   }
   else relays[e.origin].reqs[e.data[1]].push(e.data[2].id);
}

function eose_messag(e) 
{
   const ids = [...new Set(relays[e.origin].reqs[e.data[1]])];
   console.log(e.data[0], e.data[1] + ' ' + e.origin + ' ' + ids.length);
   ids.forEach((id)=> { pr(db[id]) });
   delete relays[e.origin].reqs[e.data[1]];
   fetch_missing(e.origin);
}

function notice_messag(e) 
{
   console.log(e.data[0],e)
}

function ok_messag(e) 
{
   // ["OK", <event_id>, <true|false>, <message>]
   console.log(e.data[0],e)
}

function auth_messag(e) 
{
   // ["OK", <event_id>, <true|false>, <message>]
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

//function r_mess(age) 
//{
//   switch (age[0]) 
//   {
//      case 'rel': add_relaytion(age[1]); break;
//      case 'req': demand(age[1]); break;
//      case 'bro': broadcast(age[1]); break;
//   }
//}

//onmessage = yo => 
//{
//   console.log(yo)
//   switch (yo.data[0]) 
//   {
//      case 'pub': k = yo.data[1]; break;
//      case 'rel': add_relaytion(yo.data[1]); break;
//      case 'req': demand(yo.data[1]); break;
//      case 'bro': broadcast(yo.data[1]); break;
//   }
//}