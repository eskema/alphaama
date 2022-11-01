function relaytion(ship) //ship is a websocket connection
{//translates status event to nostr event for a better future integration
/* 
   websocket readyState codes:
   0	CONNECTING	Socket has been created. The connection is not yet open.
   1	OPEN	      The connection is open and ready to communicate.
   2	CLOSING	   The connection is in the process of closing.
   3	CLOSED	   The connection is closed or couldn't be opened.*/
   
   const state = ship.readyState === 0 ? 'connecting' :
                  ship.readyState === 1 ? 'open' : 
                   ship.readyState === 2 ? 'closing' : 'closed';

   const event = [
      ship.url.substr(6, ship.url.length - 7 ).hexEncode(),//,//id
      ship.url.substr(6),//pubkey
      Math.floor( ( new Date().getTime() ) / 1000 ),//created_at
      "r",//kind
      "",//tags
      state//content
   ];
   
   console.log(event)
   
}

function close(e) 
{
   relaytion(e.target);
   
   let url = e.target.url.substr(0, e.target.url.length - 1);
   
   let relay = relays[url];
   let cc = relay.cc ? relay.cc : [];

   const fails = cc.unshift(e.timeStamp);

   relays[url].cc = cc;   
   // reconnect if somewhat stable
   if (fails < 4 || cc[1] && cc[0] - cc[1] > 99999) 
   {  
      const o = {};
      o.id         = 'r-' + e.timeStamp;
      o.pubkey     = ur(url);
      o.created_at = e.timeStamp;
      o.kind       = "r";
      o.tags       = [['history', cc[0]],['fails', fails]];
      o.content    = 'reconnecting...';
      connect(url, true)
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

   let r = new WebSocket(url);
 
   r.addEventListener('open', function(e) 
   {      
      let relay = relays[e.target.url.substr(0, e.target.url.length - 1)];
      relay.ws = e.target; // for easy access later
      relay.cc = []; // closed connection history
            
      if (relay.read) 
      {
         const 
            req = ['REQ', 'aa-open'],
            feed_filter = {},
            profiles_filter = {},
            interactions_filter = {};
            
         feed_filter.since = reconnect ? options.t : x_days(options.days);
         
         if (options.k) 
         {
            interactions_filter['#p'] = [options.k];
            interactions_filter.since = reconnect ? options.t : x_days(options.days);
//            if (options.t) 
//            {
//               interactions_filter.since = options.t
//            }
//            else
//            {
//               interactions_filter.limit = 100;
//            }

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
         else 
         {
            feed_filter.limit = 100;
         }
         
         req.push(feed_filter);
         e.target.send(JSON.stringify(req));
      }
      
      relaytion(e.target)
   }); 
   
   r.addEventListener('message', message);
   r.addEventListener('close', close);
}

function message(e) 
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
         case 'NOTICE': // information from relays
         case 'EOSE': // end of stored events
         default: 
            console.log(type, dis, e.origin)         
      }
   }
   
   if (dis && dat) 
   {//console.log(dis, dat, e.origin)      
      if (session[dat.id])
      {
         const current_dat = JSON.parse(session[dat.id]);
         let seen = current_dat.seen ? current_dat.seen : [];
         if (!seen.includes(e.origin)) seen.push(e.origin);
         session[dat.id] = JSON.stringify(current_dat);          
      } 
      else 
      {
         seen = [];
         seen.push(e.origin);
         dat.seen = seen;
         session[dat.id] = JSON.stringify(dat); 
                  
         if (!options.t 
         || options.t < dat.created_at) 
         {
            options.t = dat.created_at;
            your.options = JSON.stringify(options);
         }
      } 
      
      let l = document.getElementById('e-'+dat.id);
      
      if (!l) 
      {
         l = process(dat, dis);
      } 
      else 
      {
         if (l.classList.contains('draft')) 
         {
            l.classList.remove('draft');
            let actions_draft = child_from_class(l, 'actions-draft');
            actions_draft.remove()
         }
      }
   }
}
