function preptags(o) 
{
   let tags = [];
      
   const 
      es = [], 
      ps = [],
      mentions = [];
   
   let
      ereply = false,
      preply = false,
      eroot = false,
      proot = false;      
   
   if (o.tags.length > 0) {
      
      let mentionsIndexes = checkmentions(o.content);
   
      o.tags.forEach(function(ot, index) {
         
         let i = mentionsIndexes.find(ind => ind === index);
         if (i) {
            mentions.push(ot);
         } else 
         {
            switch (ot[0]) {
               case 'e': 
                  if (ot[3] && ot[3] === 'reply') 
                  {
                     ereply = ot[1];
                  } 
                  else if (ot[3] && ot[3] === 'root') 
                  {
                     eroot = ot[1];
                  } 
                  else 
                  {
                     es.push(ot);
                  }
                  break;
               case 'p': 
                  if (ot[3] && ot[3] === 'reply') 
                  {
                     preply = ot[1];
                  } 
                  else if (ot[3] && ot[3] === 'root') 
                  {
                     proot = ot[1];
                  } 
                  else 
                  {
                     ps.push(ot);
                  } 
                  break;
               default:
            }
         }
      });
   }
   
   if (!ereply) // old way, pre-nip10
   {
      if (es.length > 0) 
      {
         ereply = es[es.length - 1][1];
         if (es.length > 1) eroot = es[0][1];
      }
      
      if (ps.length > 0) 
      {
         preply = ps[ps.length - 1][1];
         if (ps.length > 1) proot = ps[0][1];
      }
   }
   
   if (eroot) 
   {
      tags.push(['e', eroot,'','root']);
   
   } 
   else if (ereply) 
   {
      tags.push(['e', ereply,'','root']);
   }
   
   tags.push(['e', o.id,'','reply']);
   
   if (proot) 
   {
      tags.push(['p', proot,'','root']);
   } 
   else 
   {
      if (preply) 
      {
         tags.push(['p', preply,'','root']);
      } 
      else 
      {
         if (ps.length > 0) tags.push(['p', ps[0][1],'','root']);
      }
   }
   
   if (o.pubkey !== options.k) tags.push(['p',o.pubkey,'','reply']);

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
   
   draft(a);
}

function draft(a) 
{
   const unsigned = ofa(a);
   unsigned.id = hash(a);
   your[unsigned.id] = JSON.stringify(unsigned);
   
   let draft = kind1(unsigned)
   
   draft.classList.add('draft');
   
   let actions = document.createElement('div');
   actions.classList.add('actions');
   
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
   if (window.nostr) 
   {
      window.nostr.signEvent(unsigned).then((signed) => 
      {
         post(signed);
         if (your[unsigned.id]) your.removeItem(your[unsigned.id]);
      });
   
   } else { console.log('you need nos2x to sign notes', unsigned.content) }
}

function follow(k) 
{
   const 
      now = Math.floor( ( new Date().getTime() ) / 1000 ), 
      tags = [],
      follows = JSON.parse(your.follows),
      rels = JSON.parse(your.options).r;
   
   follows.forEach(function(pubkey) 
   {
      tags.push(['p',pubkey]);
   });
      
   tags.push(['p',k]);
   
   const a = [ 
      0,//don't ask
      options.k,//pubkey
      now,//created_at
      3,//kind
      tags,//tags
      JSON.stringify(rels)//content
   ];
   
   const unsigned = ofa(a);
   unsigned.id = hash(a);
   console.log(unsigned);
   sign(unsigned);
}

function unfollow(k) 
{
   // 
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