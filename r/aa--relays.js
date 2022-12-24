function close(e) 
{   
   let url = e.target.url.substr(0, e.target.url.length - 1);
   
   let relay = relays[url];
   let cc = relay.cc ? relay.cc : [];

   const fails = cc.unshift(e.timeStamp);

   relays[url].cc = cc;   
   // reconnect if somewhat stable
   if (fails < 8 || cc[1] && cc[0] - cc[1] > 99999) 
   {  
      setTimeout(()=>{connect(url, true)}, 200)
   } 
}


function errors(response) 
{
    if (!response.ok) throw Error(response.statusText);
    return response
}

function connect(url, reconnect) 
{
   /* 
   request
   {
     "ids": <a list of event ids or prefixes>,
     "authors": <a list of pubkeys or prefixes, the pubkey of an event must be one of these>,
     "kinds": <a list of a kind numbers>,
     "#e": <a list of event ids that are referenced in an "e" tag>,
     "#p": <a list of pubkeys that are referenced in a "p" tag>,
     "since": <a timestamp, events must be newer than this to pass>,
     "until": <a timestamp, events must be older than this to pass>,
     "limit": <maximum number of events to be returned in the initial query>
   }
   */
   
   if (!url.endsWith('.onion')) 
   {
      
   
      let r = new WebSocket(url);
    
      r.addEventListener('open', function(e) 
      {      
         let relay = relays[e.target.url.substr(0, e.target.url.length - 1)];
         relay.ws = e.target; // for easy access later
         relay.cc = []; // closed connection history
         if (!options.t) options.t = x_days(options.days);
         if (relay.read) 
         {
            const 
               req = ['REQ', 'aa-open'],
               feed_filter = {kinds:[1,7]},
               profiles_filter = {},
               interactions_filter = {};
               
            feed_filter.since = reconnect ? options.t : x_days(options.days);
            
            if (options.k) 
            {
               interactions_filter['#p'] = [options.k];
               interactions_filter.since = reconnect ? options.t : x_days(options.days);
   
               let subs = your.follows ? JSON.parse(your.follows) : [];
               if (options.k) subs.push(options.k);
               if (subs.length > 0) 
               {
                  profiles_filter.kinds = [0,3];
                  profiles_filter.authors = subs;
                  
                  feed_filter.authors = subs;
                  if (reconnect) profiles_filter.since = options.t;               
               }
               req.push(profiles_filter);
               req.push(interactions_filter);
            } 
            
            req.push(feed_filter);
            e.target.send(JSON.stringify(req));
         }
      }); 
      
      r.addEventListener('message', message);
      r.addEventListener('close', close);
   
   }
}

const messages = [];

function message(e) 
{
   messages.push({data: e.data, origin:e.origin});
}

function process_message(e) 
{
      const 
      parsed = JSON.parse(e.data),
      type = parsed[0], // the message type
      dis = parsed[1], // the request id
      dat = parsed[2]; // the event data
   
   if (type !== 'EVENT') 
   {
      switch (type) 
      {   
         case 'EOSE': // end of stored events
            if (dis === 'aa-sub-root' || dis === 'aa-sub-p') relays[e.origin].ws.send(["CLOSE", dis]);
         case 'NOTICE': // information from relays
         default: 
            console.log(type, dis, e.origin)         
      }
   }
   
   if (type === 'EVENT' && dis && dat) 
   {      
      if (hose[dat.id]) hose[dat.id].seen.push(e.origin);
      else 
      {
         dat.seen = [e.origin];
         hose[dat.id] = dat
      }      
   }
}
