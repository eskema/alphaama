const missing = {}; 

function newpub(k) 
{   
   const 
      knd0 = document.getElementById('kind-0'),
      l = document.createElement('li'),
      pubkey = document.createElement('p'),
      metadata = document.createElement('header');
   
   l.id = 'p-' + k;
   l.classList.add('fren');    
   
   pubkey.classList.add('pubkey');
   pubkey.textContent = k;
   
   metadata.classList.add('metadata');
   
   let close_btn = document.createElement('button');
   close_btn.classList.add('close');
   close_btn.textContent = 'x';
   stylek([k], l);
   
   l.append(pubkey, metadata, close_btn); 
   
   knd0.append(l);      
   l.addEventListener('click', clickFren, false);
   
   return l
}

function trust(pubkey) 
{
   const
      bff = localStorage.follows,
      ff = localStorage.ff;
   
   let trust = pubkey === options.k ? 'yo'
   : bff && bff.search(pubkey) !== -1 ? 'bf'
   : ff && ff.search(pubkey) !== -1 ? 'ff'
   : 'mf';

   let trusted;
   switch (trust) {
      case 'yo':
      case 'bf':
      case 'ff':
         trusted = true;
         break;
   }
   
   return [trust,trusted]
}

function newid(o) 
{
   const l = document.createElement('li');
   l.classList.add('event', 'new');
   
   const h = document.createElement('p');
   h.classList.add('heading');
   
   l.append(h);
      
   if (o.id && o.id !== false) 
   {
      l.id = 'e-'+o.id;
      
      const h_id = taglink(['e',o.id], '');
      h.append(h_id)
   }
   
   
   if (o.pubkey && o.pubkey !== false) 
   {
      l.dataset.p = o.pubkey;
      let trusts = trust(o.pubkey);
      l.dataset.who = trusts[0];
      if (trusts[1]) l.classList.add('trusted')
      h.prepend(taglink(['p', o.pubkey], ''));
   }
   
   if (o.id && o.id !== false && o.pubkey && o.pubkey !== false) {
      stylek([o.pubkey, o.id], l);
   }
   
   if (o.created_at && o.created_at !== false) 
   {
      l.dataset.stamp = o.created_at;
      let created_at = make_time(o.created_at);
      l.append(created_at);
      update_time(created_at);
   }
   if (o.kind === 0 || o.kind && o.kind !== false) 
   {
      l.setAttribute('data-kind', o.kind);
   }
   
   if (o.tags && o.tags !== false) {
      h.append(ash(o.tags));
   }
   
   if (o.content && o.content !== false) {
      const content = document.createElement('article');
      content.classList.add('content');
      const p = document.createElement('p');
      if (o.tags) p.textContent = merely_mentions(o.content, o.tags);
      else p.textContent = o.content;
      
      content.append(p);
      l.append(content);
   }
   
   if (o.sig && o.sig !== false) {
      const sig = document.createElement('p');
      sig.classList.add('sig');
      l.append(sig);
   }
   
   if (o.seen) 
   {
      l.dataset.seen = JSON.stringify(o.seen)
      delete o.seen;
   }
   
   if (o.mia) 
   {
      l.classList.add('mia');
      delete o.mia;
   }
   
   l.dataset.o = JSON.stringify(o);
   
   let replies = document.createElement('ul');
   replies.classList.add('replies');
   l.append(replies);
   
   return l
}

function build_relays(rels, l) 
{
   let rr;
   rels.trim();
   if (rels.startsWith('{') && rels.endsWith('}')) 
   {
      try { rr = JSON.parse(rels) } 
      catch (error) { console.log('no relays found')}
      
      if (rr) 
      {
         let r = l.querySelector('.relays');
         
         if (!r) 
         {
            r = make_section('relays');
            l.append(r);
         }
         
         r.textContent = '';
         
         Object.entries(rr).forEach(([key, value]) => 
         {
            const 
               li = document.createElement('li'),
               a = document.createElement('a');
               
            li.classList.add('section-item');
            a.classList.add('relay');
            a.textContent = key.substr(6);
            a.dataset.read = value.read ? 'r' : '-';
            a.dataset.write = value.write ? 'w' : '-';
            li.append(a);
            r.append(li);
         });
      }
   }
}

function raw_event(o) 
{
   const dl = document.createElement('dl');
   dl.classList.add('raw');
   Object.entries(o).forEach(([key, value]) =>
   {
      const dt = document.createElement('dt');
      dt.classList.add('raw-' + key);
      dt.textContent = key;
      
      let v = value;
      if (key === 'tags' || key === 'seen') 
      {
         v = document.createElement('ul');
         value.forEach((val)=>
         {
            const li = document.createElement('li');
            if (typeof val === 'object') val = val.join(', ');
            li.textContent = val;
            v.append(li);
         });         
      }
      
      const dd = document.createElement('dd');
      dd.classList.add('raw-' + key);
      dd.append(v); 
      dl.append(dt,dd);
      
   });
   
   return dl;
}

function kind0(o) 
{ // NIP-01 set_metadata
   const 
      old_dat = localStorage[o.pubkey] ? JSON.parse(localStorage[o.pubkey]) : false,
      dat = typeof o.content === 'object' ? o.content : JSON.parse(o.content);
//      if (old_dat && !old_dat.created_at) old_dat.created_at = 1;
   if (!old_dat || (old_dat.created_at <  o.created_at))
   {
      dat.id = o.id
      dat.created_at = o.created_at;
      dat.level = 
      localStorage[o.pubkey] = JSON.stringify(dat);
      update_fren(dat, o.pubkey);
   }
}

function kind1(o) 
{ // NIP1 text_note
   
   let l = document.getElementById('e-'+o.id);   
   if (l) 
   {
      if (l.classList.contains('draft')) 
      {
         l.classList.remove('draft');
         let actions_draft = child_from_class(l, 'actions-draft');
         actions_draft.remove()
      }
      else 
      {
         if (l.dataset.seen) 
         {
            const seen = JSON.parse(l.dataset.seen);
            l.dataset.seen = JSON.stringify([...new Set(seen.concat(o.seen))]);
         }
      }
   }
   else 
   { 
      l = newid(o);      
      let created_at = child_from_class(l, 'created-at');
      update_time(created_at);
      
      
      
      if (o.kind === 1) 
      {
         if (options.media && l.classList.contains('trusted')) parse_content(l);
         l.insertBefore(make_actions(), l.querySelector('.replies'));
      }

      let 
         reply_id,
         reply_tag = get_reply(o.tags);
         
      if (reply_tag) reply_id = reply_tag[1];
      if (reply_id) 
      {
         l.classList.add('reply');
         l.setAttribute('data-reply', reply_id);
         let reply = document.getElementById('e-'+ reply_id);
         if (reply) lies(reply, l);
         else 
         {
            let root_id, root_tag = get_root(o.tags);
            if (root_tag) root_id = root_tag[1];
            if (root_id !== reply_id) 
            {
               reply = document.getElementById('e-'+ reply_id);
               if (reply) lies(reply, l);
               l.setAttribute('data-reply', reply_id);
            }
            else 
            {
               requestAnimationFrame(()=> 
               {
                  knd1.append(l);
                  ordered(knd1, false);
               });
            }
         }
      } 
      else 
      {
         l.classList.add('root');
         requestAnimationFrame(()=> 
         {
            if (!document.getElementById('e-'+o.id)) knd1.append(l); 
            ordered(knd1, false);
      	});
      }
      
      if (o.id === session.sub_root) 
      {
         is_interesting(l);
         session.removeItem('sub_root');
      }
      
      get_orphans(l);
      
      if (o.draft) 
      {
         delete o.draft;
         l.dataset.o = JSON.stringify(o);
         l.dataset.draft = o.content;
         l.classList.add('draft');
         
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
         
         l.append(actions);
      }
   } 
}

function kind2(o) 
{// Recommend Relay (NIP1)
   kind1(o);
}

function kind3(o) 
{ // Contacts (NIP2) (& relays until new dedicated relay NIP)
   let your_follows = your.follows ? JSON.parse(your.follows) : [];
   if (o.pubkey === options.k) 
   {
      options.r = JSON.parse(o.content);
      your.options = JSON.stringify(options);
      your.k3 = JSON.stringify(o);
   } 
   
   let fren = document.getElementById('p-' + o.pubkey);
   if (!fren) fren = newpub(o.pubkey);   
   if (o.tags.length > 0) 
   {
      let follows = fren.querySelector('.follows');
      if (!follows) 
      { 
         follows = make_section('follows');
         fren.append(follows);
      }
      else follows.textContent = '';
      
      const ff = your.ff ? JSON.parse(your.ff) : [];
      let subscriptions = o.pubkey === options.k ? [] : false;
      o.tags.forEach((ot)=>
      {
         if (is_hex(ot[1])) 
         {
            if (subscriptions) subscriptions.push(ot[1]);
            if (subscriptions 
            || your_follows.includes(o.pubkey)) ff.push(ot[1]);
         
            const 
               f = document.createElement('li'),
               a = taglink(['p', ot[1]], '');
            
            f.classList.add('follow', 'section-item', 'p-'+ot[1]);
            f.append(a);
            stylek([ot[1]], f);
            follows.append(f);
         }
      });

      build_relays(o.content, fren);
      
      if (subscriptions) your.follows = JSON.stringify(subscriptions);
      
      if (subscriptions 
      || your_follows.includes(o.pubkey)) 
      {
         your.ff = JSON.stringify([...new Set(ff.filter(pub => is_hex(pub)))]);
      }
   }   
}

async function process(dat) 
{
   let dis = dat.dis;
   delete dat.dis;
   switch (dat.kind) 
   {
       case 0: kind0(dat); break;
       case 1: kind1(dat); break;
       case 2: kind1(dat); break;
       case 3: kind3(dat); break;
       case 7: kind1(dat); break;
   }
}