function get_seen(id)
{
   // gets the first relay that seen this id
   const e = document.getElementById('e-'+id);
   return e && e.dataset.seen ? JSON.parse(e.dataset.seen)[0] : ''
}

//function filter_mentions(o) 
//{
//   // separate mentions from tags unless they're root or reply
//   const 
//      tags = [], 
//      mentions = [];
//      
//   let mentions_indexes = checkmentions(o.content);
//   for (let i = 0; i < o.tags.length; i++) 
//   {
//      if (mentions_indexes.find(mi => mi === i))
//      {
//         mentions.push(o.tags[i])
//         if(o.tags[i][0] === 'e' 
//         && o.tags[i][3] 
//         && o.tags[i][3] == ('root' || 'reply')) tags.push(o.tags[i]);
//      }
//      else tags.push(o.tags[i])
//   }
//   return [mentions, tags]
//}

function get_root(tags) 
{
   // get the marked root event
   const events = [];
   for (let i = 0; i < tags.length; i++) 
   {
      if (tags[i][0] === 'e' && is_hex(tags[i][1]))
      {
         if (tags[i][3] && tags[i][3] === 'root')
         {
            if (tags[i][2] === '') tags[i][2] = get_seen(tags[i][1]);
            return tags[i];
         }
         events.push(tags[i])
      }
   }
   // if there's no marked root, check if there's events and use the first
   if (events.length) 
   {
      const 
         e = events[0],
         rel = e[2] && e[2] !== '' ? e[2] : get_seen(e[1]);
      return ['e', e[1], rel, 'root'];
   }
   return false
}

function get_reply(tags) 
{
   const events = [];
   for (let i = 0; i < tags.length; i++) 
   {
      if (tags[i][0] === 'e' && is_hex(tags[i][1]))
      {
         if (tags[i][3] && tags[i][3] === 'reply') return tags[i];
         events.push(tags[i])
      }
   }
   
   if (events.length)
   {
      if (events[events.length-1][3] 
      && events[events.length-1][3] === 'mention') return false;
      
      return events[events.length-1]
   }
   else return false
   
}

function preptags(o) 
{  
   const tags = [];
   let root = get_root(o.tags);
   if (root) 
   {
      tags.push(root);
      tags.push(['e', o.id,get_seen(o.id),'reply']);
   }
   else tags.push(['e', o.id,get_seen(o.id),'root']);
   
   const pubkeys = [];
   o.tags.filter(t=>t[0]==='p').forEach((p)=>
   {
      if (p[1] !== aa.k && is_hex(p[1])) pubkeys.push(['p',p[1]])
   });
   let unique = [...new Set(pubkeys)];
   if (o.pubkey !== aa.k && !unique.includes(o.pubkey)) unique.push(['p',o.pubkey])
   tags.push(...unique);

   return tags
}

function prep(content)
{
   const created_at = Math.floor( ( new Date().getTime() ) / 1000 );
   let tags = [];
   let reply_id = sessionStorage.interesting;
   if (reply_id)
   {
      let reply = document.getElementById('e-'+reply_id);
      if (reply && seen[reply_id]) tags = preptags(seen[reply_id]);
   } 
   
   const hashtags = parse_hashtags(content);
   if (hashtags.length) hashtags.forEach((t)=>{ tags.push(t) });
   
   a = [ 
      0,//magic
      aa.k,//pubkey
      created_at,//created_at
      1,//kind
      tags,//tags
      content//content
   ];
   
   draft(a, 1);
}

function reaction(note)
{
//   console.log(note[0], note[1], note[2])
   let 
      created_at = Math.floor( ( new Date().getTime() ) / 1000 ),
      reply, 
      seen = get_seen(note[1]),
      tags = [];
      
   tags.push( [ 'e', note[1],  seen] );
   if (note[2] !== aa.k) tags.push( [ 'p', note[2] ] );
   const a = [ 
      0,//magic
      aa.k,//pubkey
      created_at,//created_at
      7,//kind
      tags,//tags
      note[0]//content
   ];
   
   const unsigned = ofa(a);
   unsigned.id = hash(a);
//   console.log(unsigned)
   sign(unsigned);
   delete aa.reaction
}

function draft(a, kind) 
{
   const unsigned = ofa(a);
   unsigned.id = hash(a);
   localStorage[unsigned.id] = JSON.stringify(unsigned);
   unsigned.draft = true;
   process(unsigned);
}

function sign(unsigned) 
{        
//   console.log(unsigned);
   if (window.nostr) 
   {
      window.nostr.signEvent(unsigned).then((signed) =>
      {
         post(signed);
         if (localStorage[unsigned.id]) localStorage.removeItem(localStorage[unsigned.id]);
      });
      
   } 
   else console.log('you need nos2x to sign notes', unsigned.content)
}

function follow(k) 
{
   // pubkey,relay,petname;
   const parts = k.split(',');
   
   
   if (is_hex(parts[0])) 
   {
      const 
         now = Math.floor( ( new Date().getTime() ) / 1000 ), 
         old = aa.k3[0],
         tags = old ? old.tags : [],
         content = old ? old.content : '';
   
      if (tags.filter(p => p[1] === parts[0]).length) 
      {
         console.log('you already follow this one')
      }
      else 
      {
         const p = ['p'];
         parts.forEach((part)=>{p.push(part)})
      
         tags.push(p);
         
         const a = [ 
            0,//don't ask
            aa.k,//pubkey
            now,//created_at
            3,//kind
            tags,//tags
            content//content
         ];
               
         const unsigned = ofa(a);
         unsigned.id = hash(a);
         sign(unsigned);
      }
   }
   else console.log('bad key ' + parts[0]);
}

function unfollow(k) 
{
   const 
      now = Math.floor( ( new Date().getTime() ) / 1000 ), 
      old = aa.k3[0];
   
   if (old) 
   {
      tags = old.tags.filter(p => p[1] !== k); //.forEach((p)=>{ tags.push(p) })
         
      const a = [ 
         0,//don't ask
         aa.k,//pubkey
         now,//created_at
         3,//kind
         tags,//tags
         old.content//content
      ];
            
      const unsigned = ofa(a);
      unsigned.id = hash(a);
      sign(unsigned); 
   }
   else console.log("you don't follow anyone :(");
}

function set_metadata(o) 
{
   //make array to get hashed:
   const a = [ 
      0,//don't ask
      aa.k,//pubkey
      Math.floor((new Date().getTime())/1000),//created_at
      0,//kind
      [],//tags
      JSON.stringify(o)//content
   ];
   
//   draft(a, 0);
   const unsigned = ofa(a);
   unsigned.id = hash(a);
   sign(unsigned);
}

function post(signed) 
{
   
   console.log('post', signed);
   re.postMessage(['bro', ['EVENT', signed]]);
//   Object.entries(relays).forEach(([url, can]) => 
//   {
//      if (can.write && can.ws && can.ws.readyState === 1) {
//         can.ws.send(JSON.stringify(["EVENT", signed]));
//      }
//   });
}