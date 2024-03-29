function get_seen(id)
{
   // gets the first relay that seen this id
   return db[id] && db[id].seen ? db[id].seen[0] : ''
}

function get_root(tags) 
{
   // get the marked root event
   const e_tags = [];
   for (let i = 0; i < tags.length; i++) 
   {
      if (tags[i][0] === 'e' && is_hex(tags[i][1]))
      {
         if (tags[i][3] && tags[i][3] === 'root')
         {
            if (tags[i][2] === '') tags[i][2] = get_seen(tags[i][1]);
            return tags[i];
         }
         e_tags.push(tags[i])
      }
   }
   // if there's no marked root, 
   // check if there's events and use the first if not marked mention
   if (e_tags.length) 
   {
      if (e_tags[0][3] && e_tags[0][3] === 'mention') return false;
      
      const 
         e = e_tags[0],
         rel = e[2] && e[2] !== '' ? e[2] : get_seen(e[1]);
      return ['e', e[1], rel, 'root'];
   }
   return false
}

function get_reply(tags) 
{
   // get the marked reply event
   const e_tags = [];
   for (let i = 0; i < tags.length; i++) 
   {
      if (tags[i][0] === 'e' && is_hex(tags[i][1]))
      {
         if (tags[i][3] && tags[i][3] === 'reply') return tags[i];
         e_tags.push(tags[i])
      }
   }
   // if there's no marked reply, 
   // check if there's events and use the last if not a mention
   if (e_tags.length)
   {
      if (e_tags[e_tags.length-1][3] 
      && e_tags[e_tags.length-1][3] === 'mention') return false;
      
      return e_tags[e_tags.length-1]
   }
   return false
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
   if (o.pubkey !== aa.k && !unique.some((t)=>t[1] === o.pubkey)) unique.push(['p',o.pubkey])
   tags.push(...unique);

   return tags
}

function prep()
{
   compose.o.created_at = now();

   let reply_id = sessionStorage.interesting;
   if (reply_id)
   {
      let reply = document.getElementById('e-'+reply_id);
      if (reply && db[reply_id] && db[reply_id].o) event.tags = [...event.tags, ...preptags(db[reply_id].o)];
   }
   const hashtags = parse_hashtags(compose.o.content);
   if (hashtags.length) hashtags.forEach((t)=>{ compose.o.tags.push(t) });
   
//   if (mentions) 
//   {
      // mentions.forEach(build_mention(mention))
//   }
   
   compose.o.id = NostrTools.getEventHash(compose.o); // await hash(JSON.stringify(a));
   draft();
}

function draft() 
{

   if (compose) 
   {
      compose.o.created_at = now();
      compose.o.id = NostrTools.getEventHash(compose.o);
      compose.n = x_note(compose.o.id);
      drafts[compose.o.id] = compose;
      pr(compose);
      compose_clear();
   }
}

function reaction(event)
{  
   event.id = NostrTools.getEventHash(event);
   sign(event);
   
//   delete temp.reaction
//   document.getElementById('iot').blur();      
}

function finish_hi()
{
   compose.o.id = NostrTools.getEventHash(compose.o);
   sign(compose.o);
   compose_clear();
}



function follow(parts) 
{
   // pubkey,relay,petname
//   const parts = k.split(',');
   
   if (aa.k3[0] && is_hex(parts[0])) 
   {   
      let old = aa.k3[0];
      if (old.tags.filter(p => p[1] === parts[0]).length) 
      {
         console.log('you already follow this one')
      }
      else 
      {
         let event = 
         {
            kind: 3,
            created_at: now(),
            tags: [...old.tags, ['p', ...parts]],
            content: old.content,
            pubkey: aa.k
         };

         event.id = NostrTools.getEventHash(event);
//         console.log(event);
         sign(event);
      }
   }
   else console.log('bad key ' + parts[0]);
}

function unfollow(k) 
{
   const old = aa.k3[0];
   if (old) 
   {      
      let event = 
      {
         kind: 3,
         created_at: now(),
         tags: old.tags.filter(p => p[1] !== k),
         content: old.content,
         pubkey: aa.k
      };
            
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
      created_at: now(),
      tags: [],
      content: JSON.stringify(o),
      pubkey: aa.k
   };
   event.id = NostrTools.getEventHash(event);
   sign(event);
}

function add_new_relay(tag) 
{

}

function verify_relay_list(relay_list) 
{
//   relay_list.map((item)=>
//   {
//      let url = new URL(item[0]);
//      if (!url && (url.protocol === 'wss:' || url.protocol === 'ws:')
//      && item.length === 2
//      ) 
//      {
//         
//      }
//      if (item.length === 2
//      && item) {
//         
//      }
//   });
//   return true
}

function set_relays(relays_list) 
{ 
   
   console.log(relay_list)
//   let old = aa.k3[0];
//   if (old) 
//   {
//      console.log('you already follow this one')
//   }
//   else 
//   {
//      let event = 
//      {
//         kind: 3,
//         created_at: Math.floor(Date.now() / 1000),
//         tags: [...old.tags, ['p', ...parts]],
//         content: old.content,
//         pubkey: aa.k
//      };
//
//      event.id = NostrTools.getEventHash(event);
//      sign(event);
//   }


//   let event = 
//   {
//      kind: 10001,
//      created_at: Math.floor(Date.now() / 1000),
//      tags: relays_list,
//      content: '',
//      pubkey: aa.k
//   };  
//
//   event.id = NostrTools.getEventHash(event);
//   console.log(event)
//   sign(event);
}

function sign(unsigned) 
{        
//   console.log(unsigned);
   if (window.nostr) 
   {
      window.nostr.signEvent(unsigned).then((signed) =>
      {
         console.log(signed);
         broadcast(['EVENT', signed]); //post(signed);
         if (localStorage[unsigned.id]) localStorage.removeItem(localStorage[unsigned.id]);
//         compose = false;
      });
      
   } 
   else console.log('you need nos2x to sign notes', unsigned.content)
}