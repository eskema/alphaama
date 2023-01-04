const missing = {}; 

//const in_view = new window.IntersectionObserver(([entry]) => 
//{
//   if (entry.isIntersecting) 
//   {
//      let l = entry.target;
//      
//      if (l.classList.contains('trusted')) parse_content(l);
//      l.classList.add('loaded');
//      console.log('in_view', entry)
//      in_view.unobserve(l);
//      return
//   }
//  console.log('!in_view', entry.id)
//}, 
//{
//   root: null,
//   threshold: 0.1, // set offset 0.1 means trigger if atleast 10% of element in viewport
//});

function newpub(k) 
{   
   const 
      knd0 = document.getElementById('kind-0'),
      l = document.createElement('li'),
      pubkey = document.createElement('p'),
      metadata = document.createElement('header');
   
   l.id = 'p-' + k;
   l.classList.add('fren');
   let trusts = trust(k);
   if (trusts[1]) l.classList.add('trusted');
   
   pubkey.classList.add('pubkey');
   pubkey.textContent = k;
   
   metadata.classList.add('metadata');
   
   let close_btn = document.createElement('button');
   close_btn.classList.add('close');
   close_btn.textContent = 'x';
   stylek(k, l);
   
   l.append(pubkey, metadata, close_btn); 
   
   knd0.append(l);      
   l.addEventListener('click', clickFren, false);
   
   return l
}

function trust(pubkey) 
{  
   let trust = pubkey === aa.k ? 'yo'
   : aa.bff && aa.bff.includes(pubkey) ? 'bf'
   : aa.ff && aa.ff.includes(pubkey) ? 'ff'
   : 'mf';

   let trusted = false;
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
   l.id = 'e-'+o.id;
   
   const h = document.createElement('p');
   h.classList.add('heading');
   const h_id = tag_link(['e',o.id], '');
   h_id.classList.add('id');
   h.append(h_id)
   
   l.append(h);
      
      l.dataset.p = o.pubkey;
      
      let trusts = trust(o.pubkey);
      l.dataset.who = trusts[0];
      if (trusts[1]) l.classList.add('trusted');
      const h_author = tag_link(['p', o.pubkey]);
      h_author.classList.add('author');
      h.prepend(h_author);
   
//   if (o.id && o.id !== false && o.pubkey && o.pubkey !== false) {
      stylek(o.pubkey, l);
//   }
   
//   if (o.created_at && o.created_at !== false) 
//   {
      l.dataset.stamp = o.created_at;
      let created_at = make_time(o.created_at);
      l.append(created_at);
      update_time(created_at);
//   }
//   if (o.kind === 0 || o.kind && o.kind !== false) 
//   {
      l.setAttribute('data-kind', o.kind);
//   }
   
//   if (o.content && o.content !== false) {
      const content = document.createElement('article');
      content.classList.add('content');
      const p = document.createElement('p');
      p.textContent = merely_mentions(o.content,o.tags);
      content.append(p);
      l.append(content);
//   }
      
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
            if (typeof val === 'object' && val.length) val = val.join(', ');
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
      old_dat = aa.p[o.pubkey],
      dat = typeof o.content === 'object' ? o.content : JSON.parse(o.content);
//      if (old_dat && !old_dat.created_at) old_dat.created_at = 1;
   if (!old_dat || (old_dat.created_at < o.created_at))
   {
      dat.created_at = o.created_at;
      aa.p[o.pubkey] = dat;
      localStorage.aa = JSON.stringify(aa);
      update_fren(dat, o.pubkey);
   }
   if (o.pubkey === aa.k && !aa.k0.find((e)=> e.id === o.id)) aa.k0.unshift(o);
   
   if (location.hash.length 
   && location.hash.startsWith('#p-'+o.pubkey)
   ) 
   { 
      select_p(o.pubkey); console.log(o.pubkey)
   }
}

function kind1(o) 
{ // NIP1 text_note
   
   let l = document.getElementById('e-'+o.id);   
   if (l 
   && l.classList.contains('draft')) 
   {
      l.classList.remove('draft');
      let actions_draft = child_from_class(l, 'actions-draft');
      actions_draft.remove()
   }
   else if (!l)
   { 
      l = newid(o);      
      let created_at = child_from_class(l, 'created-at');
      update_time(created_at);

      if (o.kind === 1) 
      {
         if (l.classList.contains('trusted')) parse_content(l);
         l.insertBefore(make_actions(), l.querySelector('.replies'));
      }

      let 
         reply_id,
         reply_tag = get_reply(o.tags),
         append_as_root = false;
         
      if (reply_tag) reply_id = reply_tag[1];
      if (reply_id) 
      {
         l.classList.add('reply');
         l.setAttribute('data-reply', reply_id);
         let reply = document.getElementById('e-'+ reply_id);
         if (reply) lies(reply, l);
         else append_as_root = true;
      } 
      else 
      {
         l.classList.add('root');
         append_as_root = true
      }
      
      if (append_as_root) 
      {
         let insert_b =  null, stamp = parseInt(l.dataset.stamp);
         [...knd1.children].forEach((rep)=>
         {
            if (!insert_b && stamp > parseInt(rep.dataset.stamp)) insert_b = rep;
         });
         knd1.insertBefore(l, insert_b);
      }
      
      if (o.id === sessionStorage.sub_root 
      || (location.hash.length && location.hash.startsWith('#e-'+o.id))
      ) 
      {
         is_interesting(l);
         sessionStorage.removeItem('sub_root');
      }
      
      get_orphans(l);
      
      if (o.draft) 
      {
         delete o.draft;
//         l.dataset.o = JSON.stringify(o);
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
//      if (o.kind === 1) 
//      {
//         in_view.observe(l);
//         l.insertBefore(make_actions(), l.querySelector('.replies'));
//      }
   } 
}

function kind2(o) 
{// Recommend Relay (NIP1)
   kind1(o);
}

function kind3(o) 
{ // Contacts (NIP2) (& relays until new dedicated relay NIP)
   const you = o.pubkey === aa.k;
   if (you) 
   {
      if (!aa.k3.find((e)=> e.id === o.id)) aa.k3.unshift(o);
      let rels;
      try { rels = JSON.parse(o.content) } 
      catch (error) { console.log('no relays found in your kind-3') }
      if (rels) 
      {
         options.r = rels
         localStorage.options = JSON.stringify(options);
      }      
      
   } 
   
//   let fren = document.getElementById('p-' + o.pubkey);
//   if (!fren) fren = newpub(o.pubkey);   
   if (o.tags.length > 0) 
   {
//      let follows = fren.querySelector('.follows');
//      if (!follows) 
//      { 
//         follows = make_section('follows');
//         fren.append(follows);
//      }
      let pubs = [];
      o.tags.forEach((ot)=>
      {
         if (is_hex(ot[1])) 
         {
            if (you) pubs.push(ot[1]);
            if (aa.bff.includes(o.pubkey) 
            && !aa.ff.includes(ot[1])
            ) aa.ff.push(ot[1]);
         
//            const 
//               f = document.createElement('li'),
//               a = tag_link(ot);
//            
//            f.classList.add('follow', 'section-item', 'p-'+ot[1]);
//            f.append(a);
//            stylek(ot[1], f);
//            follows.append(f);
         }
      });

//      build_relays(o.content, fren);
      
      if (you)
      { 
         aa.bff = pubs;
      }
      
      if (you || aa.bff.includes(o.pubkey)) localStorage.aa = JSON.stringify(aa);      
      
      if (aa.bff.includes(o.pubkey)) 
      {
         aa.ff = [...new Set(aa.ff)];
      }
   }   
   
}