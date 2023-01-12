function get_seen(id)
{
   // gets the first relay that seen this id
//   const e = db[id];
   return db[id] && db[id].seen ? db[id].seen[0] : ''
//   return seen[id] && seen[id].seen ? seen[id].seen[0] : ''
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

function prep(content, mentions = false)
{
   let event = 
   {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: content,
      pubkey: aa.k
   };

   let reply_id = sessionStorage.interesting;
   if (reply_id)
   {
      let reply = document.getElementById('e-'+reply_id);
      if (reply && db[reply_id] && db[reply_id].o) event.tags = preptags(db[reply_id].o);
   } 
   const hashtags = parse_hashtags(content);
   if (hashtags.length) hashtags.forEach((t)=>{ event.tags.push(t) });
   
   if (mentions) 
   {
      // mentions.forEach(build_mention(mention))
   }

   
//   const unsigned = ofa(a);
   event.id = NostrTools.getEventHash(event); // await hash(JSON.stringify(a));
   localStorage[event.id] = JSON.stringify(event);
   event.draft = true;
   event.seen = [];
   kind1(event);
   
//   a = [ 
//      0,//magic
//      aa.k,//pubkey
//      created_at,//created_at
//      1,//kind
//      tags,//tags
//      content//content
//   ];
//   
//   draft(a, 1);
}

async function reaction(note)
{
//   console.log(note[0], note[1], note[2])
   let event = 
   {
      kind: 7,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: note[0],
      pubkey: aa.k
   };
      
   event.tags.push([ 'e', note[1], get_seen(note[1]) ]);
   event.tags.push([ 'p', note[2] ]);
   event.id = NostrTools.getEventHash(event);
   sign(event);
   delete aa.reaction
}



async function follow(k) 
{
   // pubkey,relay,petname;
   const parts = k.split(',');
   
   if (is_hex(parts[0])) 
   {   
      const 
         old = aa.k3[0],
         tags = old ? old.tags : [],
         content = old ? old.content : '';
   
      if (tags.filter(p => p[1] === parts[0]).length) 
      {
         console.log('you already follow this one')
      }
      else 
      {
         let event = 
         {
            kind: 3,
            created_at: Math.floor(Date.now() / 1000),
            tags: tags,
            content: content,
            pubkey: aa.k
         };
      
//         const p = ['p', ...parts];
//         parts.forEach((part)=>{p.push(part)})
      
         event.tags.push(['p', ...parts]);
         
//         const a = [ 
//            0,//don't ask
//            aa.k,//pubkey
//            now,//created_at
//            3,//kind
//            tags,//tags
//            content//content
//         ];
               
//         const unsigned = ofa(a);
         event.id = NostrTools.getEventHash(event);
         sign(event);
      }
   }
   else console.log('bad key ' + parts[0]);
}

async function unfollow(k) 
{
   const old = aa.k3[0];
   if (old) 
   {
//      tags = old.tags.filter(p => p[1] !== k); //.forEach((p)=>{ tags.push(p) })
      
      let event = 
      {
         kind: 3,
         created_at: Math.floor(Date.now() / 1000),
         tags: old.tags.filter(p => p[1] !== k),
         content: old.content,
         pubkey: aa.k
      };
//      
//      const a = [ 
//         0,//don't ask
//         aa.k,//pubkey
//         now,//created_at
//         3,//kind
//         tags,//tags
//         old.content//content
//      ];
            
      event.id = NostrTools.getEventHash(event);
      sign(event);
   }
   else console.log("you don't follow anyone :(");
}

function set_metadata(o) 
{
   let event = 
   {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify(o),
      pubkey: aa.k
   };
//      
//   event.tags.push([ 'e', note[1], get_seen(note[1]) ]);
//   event.tags.push([ 'p', note[2] ]);
//   const a = [ 
//      0,//magic
//      aa.k,//pubkey
//      created_at,//created_at
//      7,//kind
//      tags,//tags
//      note[0]//content
//   ];
   
//   const unsigned = ofa(a);
   event.id = NostrTools.getEventHash(event);
//   console.log(unsigned)
   sign(event);
   
//   //make array to get hashed:
//   const a = [ 
//      0,//don't ask
//      aa.k,//pubkey
//      Math.floor((new Date().getTime())/1000),//created_at
//      0,//kind
//      [],//tags
//      JSON.stringify(o)//content
//   ];
//   
//   draft(a, 0);
//   const unsigned = ofa(a);
//   unsigned.id = await hash(JSON.stringify(a));
//   sign(unsigned);
}

function sign(unsigned) 
{        
//   console.log(unsigned);
   if (window.nostr) 
   {
      window.nostr.signEvent(unsigned).then((signed) =>
      {
         broadcast(['EVENT', signed]); //post(signed);
         if (localStorage[unsigned.id]) localStorage.removeItem(localStorage[unsigned.id]);
      });
      
   } 
   else console.log('you need nos2x to sign notes', unsigned.content)
}
//
//function post(signed) 
//{
//   broadcast(['EVENT', signed])
//   r_mess(['bro', ['EVENT', signed]]);
//}