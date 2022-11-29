function get_seen(id)
{
   // gets the first relay that seen this id
   const e = session[id] ? JSON.parse(session[id]) : false;
   return e && e.seen ? e.seen[0] : ''
}

function filter_mentions(o) 
{
   // separate mentions from tags unless they're root or reply
   const 
      tags = [], 
      mentions = [];
      
   let mentions_indexes = checkmentions(o.content);
   for (let i = 0; i < o.tags.length; i++) 
   {
      if (mentions_indexes.find(mi => mi === i))
      {
         mentions.push(o.tags[i])
         if(o.tags[i][0] === 'e' 
         && o.tags[i][3] 
         && o.tags[i][3] == ('root' || 'reply')) tags.push(o.tags[i]);
      }
      else tags.push(o.tags[i])
   }
   return [mentions, tags]
}

function get_root(tags) 
{
   // get the marked root event
   const events = [];
   for (let i = 0; i < tags.length; i++) 
   {
      if (tags[i][0] === 'e')
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
      if (tags[i][0] === 'e')
      {
         if (tags[i][3] && tags[i][3] === 'reply') return tags[i];
         events.push(tags[i])
      }
   }
   return events.length ? events[events.length-1] : false
}

function preptags(o) 
{  
   const 
      [mentions, filtered_tags] = filter_mentions(o), 
      tags = [];
      
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
      if (p[1] !== options.k) pubkeys.push(['p',p[1]])
   });
   let unique = [...new Set(pubkeys)];
   if (o.pubkey !== options.k && !unique.includes(o.pubkey)) unique.push(['p',o.pubkey])
   tags.push(...unique);

   return tags
}

function prep(note)
{
   const 
      now = Math.floor( ( new Date().getTime() ) / 1000 ),
      tags = session.interesting ? preptags(JSON.parse(session[session.interesting])) : [],
      a = [ 
         0,//id
         options.k,//pubkey
         now,//created_at
         1,//kind
         tags,//tags
         note//content
      ];
   
   const hashtags = parse_hashtags(note);
   if (hashtags.length) hashtags.forEach((t)=>{ a[4].push(t) });
   draft(a, 1);
}

function reaction(note)
{
   let reply, seen = '';
   try 
   {
      reply = JSON.parse(session[note[1]]);
      seen = reply.seen[0];
//      delete reply.seen;
//      post(reply);
   }
   catch (error) {
      console.log('somethin not seen')
   }
   
   let tags = [];
   tags.push( [ 'e', note[1],  seen] );
   if (note[2] !== options.k) tags.push( [ 'p', note[2] ] );
   const a = [ 
      0,//magic
      options.k,//pubkey
      Math.floor( ( new Date().getTime() ) / 1000 ),//created_at
      7,//kind
      tags,//tags
      note[0]//content
   ];
   
   const unsigned = ofa(a);
   unsigned.id = hash(a);
   sign(unsigned);
   your.removeItem('reaction')
   
}

function draft(a, kind) 
{
   const unsigned = ofa(a);
   unsigned.id = hash(a);
   your[unsigned.id] = JSON.stringify(unsigned);
   
   let draft;
   console.log(a[3]);
   switch (kind) {
      case 0: draft = kind0(unsigned); break;
      default: draft = kind1(unsigned); break;
   }
   
   draft.dataset.o = unsigned.id;
   draft.dataset.draft = unsigned.content;
   draft.classList.add('draft');
   
   let actions = document.createElement('div');
   actions.classList.add('actions-draft');
   
   let post_btn = document.createElement('button');
   post_btn.classList.add('post');
   post_btn.textContent = 'post';
   actions.append(post_btn);
   
   let edit_btn = document.createElement('button');
   edit_btn.classList.add('edit');
   edit_btn.textContent = 'edit';
   actions.append(edit_btn);
   
   let cancel_btn = document.createElement('button');
   cancel_btn.classList.add('cancel');
   cancel_btn.textContent = 'cancel';
   actions.append(cancel_btn);
   
   draft.append(actions);
}

function sign(unsigned) 
{        
//   console.log(unsigned);
   if (window.nostr) 
   {
      window.nostr.signEvent(unsigned).then((signed) =>
      {
         post(signed);
         if (your[unsigned.id]) your.removeItem(your[unsigned.id]);
      });
      
   } 
   else console.log('you need nos2x to sign notes', unsigned.content)
}

function follow(k) 
{
   const 
      now = Math.floor( ( new Date().getTime() ) / 1000 ), 
      old = your.k3 ? JSON.parse(your.k3) : false,
      tags = old ? old.tags : [],
      content = old ? old.content : '',
      parts = k.split(',');
   
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
         options.k,//pubkey
         now,//created_at
         3,//kind
         tags,//tags
         content//content
      ];
      
//      console.log(old)
      
      const unsigned = ofa(a);
      unsigned.id = hash(a);
      console.log(unsigned);
      sign(unsigned);
   }
   
}

function unfollow(k) 
{
   const 
      now = Math.floor( ( new Date().getTime() ) / 1000 ), 
      old = your.k3 ? JSON.parse(your.k3) : false;
   
   if (old) 
   {
      tags = old.tags.filter(p => p[1] !== k); //.forEach((p)=>{ tags.push(p) })
         
      const a = [ 
         0,//don't ask
         options.k,//pubkey
         now,//created_at
         3,//kind
         tags,//tags
         old.content//content
      ];
      
//      console.log(old)
      
      const unsigned = ofa(a);
      unsigned.id = hash(a);
      console.log(unsigned);
      sign(unsigned); 
   }
   else 
   {
      console.log("you don't follow anyone :(");
   }
   

}

function set_metadata(o) 
{
   //make array to get hashed:
   const a = [ 
      0,//don't ask
      options.k,//pubkey
      Math.floor((new Date().getTime())/1000),//created_at
      0,//kind
      [],//tags
      JSON.stringify(o)//content
   ];
   
   draft(a, 0);
//   const unsigned = ofa(a);
//   unsigned.id = hash(a);
//   console.log(unsigned);
//   sign(unsigned);
}

function post(signed) 
{ 
   let post_it = ["EVENT"];
   post_it.push(signed);
   post_it = JSON.stringify(post_it);
   
   Object.entries(relays).forEach(([url, can]) => 
   {
      if (can.write && can.ws && can.ws.readyState === 1) {
         can.ws.send(post_it);
      }
   });
}