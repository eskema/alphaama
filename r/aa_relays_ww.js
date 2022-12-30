let k, r;
const relays = {}, seen = {}, eose = {}, filters = {}, reqs = {};

function add_relaytion(ship) 
{
   let new_relays = [...Object.entries(ship)
   .filter(([url, can])=> can.read || can.write )];
   
   new_relays.map(([url, can])=>
   {
      let ur_l;
      try{ur_l = new URL(url) } catch (er) { console.log('bad relay url') }
      if (ur_l 
      && ur_l.protocol === 'wss:' 
      && (can.read || can.write)
      ) 
      {
         const relay = ur_l.origin + '/';
         relays[relay] = can;
         connect(relay);
      }
   });
}

function demand(stuff) // [stringified req, origin = false]
{
   if (stuff[1] && relays[stuff[1]]) rr = [relays[stuff[1]]];
   else rr = relays ? Object.values(relays) : [];
   
   rr.filter((can)=> can.read && can.ws && can.ws.readyState === 1)
   .map((can)=> { can.ws.send(JSON.stringify(stuff[0])) })
}

function broadcast(shit) // stringified
{
   Object.values(relays).filter((can)=> can.write && can.ws && can.ws.readyState === 1)
   .map((can)=> { can.ws.send(JSON.stringify(shit))})
}

function force_close()
{
   Object.values(relays).map((can)=>
   { if (can.ws){ can.fc = true; can.ws.close(); delete can.ws } })
}

function x_days(num) 
{
   const days = new Date();
   days.setDate(days.getDate() - num); // fetch from last x days
   return Math.floor(days.getTime()/1000)
}

function is_hex(str) 
{
  return /^[A-F0-9]+$/i.test(str)
}

function open(e) 
{
//   console.log(['OPEN',e.target.url,e.target.readyState]);
   postMessage(['OPEN',e.target.url,e.target.readyState]);
}

function retry(e) 
{
   if (!relays[e.target.url].fc) 
   {
      let cc = relays[e.target.url].cc;
      const fails = cc.unshift(e.timeStamp);
      // reconnect if somewhat stable
      if (fails < 69 || cc[1] && cc[0] - cc[1] > 99999) 
      {  
         setTimeout(()=>{ connect(e.target.url) }, 420 * fails)
      } 
   } else postMessage(['STATE',e.target.url,e.target.readyState]);
}

function connect(url) 
{  
   if (relays[url].fc) delete relay[url].fc;
   if (!relays[url].cc) relays[url].cc = [];
   relays[url].ws = new WebSocket(url);   
   relays[url].ws.addEventListener('open', open); 
   relays[url].ws.addEventListener('message', message);
   relays[url].ws.addEventListener('close', retry);
}

function anal_z(o) 
{
   return o
}

function pre_process(dis,dat,origin) 
{
   if (!seen[dis]) seen[dis] = {};
   if (!seen[dis][dat.id])
   { 
      dat.seen = [origin];
      seen[dis][dat.id] = dat;
   }
   if (eose[origin] && eose[origin].includes(dis)) postMessage(['EVENT',origin,[dis,dat]]);
   else if (!seen[dis][dat.id].seen.includes(origin)) seen[dis][dat.id].seen.push(origin);

}

function eose_handler(dis, origin) 
{
   if (!eose[origin]) eose[origin] = [];
   eose[origin].push(dis);
   
   const sorted = Object.values(seen[dis])
   .sort((a,b)=>{a.created_at - b.created_at});
   
   postMessage(['EOSE', origin, [dis,sorted]])
   
   if (dis === 'aa-sub-root' 
   || dis === 'aa-sub-p') relays[origin].ws.send(JSON.stringify['CLOSE', dis]);
}

function message(e)
{
   const [m, dis, dat] = JSON.parse(e.data);
//   origin = 
   // [0] the message type
   // [1] the EVENT request id or NOTICE message
   // [2] the EVENT message
   switch (m)
   {
      case 'EVENT':
         pre_process(dis,dat,e.origin);
         break;
      case 'EOSE': // end of stored events
         eose_handler(dis, e.origin);
         break;
      case 'OK': // post received by relay
      case 'NOTICE': // information from relays
      default: postMessage([m, dis, e.origin]);
   }
}

onmessage = yo => 
{
//   console.log(yo)
   switch (yo.data[0]) 
   {
      case 'pub': k = yo.data[1]; break;
      case 'rel': add_relaytion(yo.data[1]); break;
      case 'req': demand(yo.data[1]); break;
      case 'bro': broadcast(yo.data[1]); break;
   }
}