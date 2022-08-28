

function newpub(k) 
{   
   const 
      knd0 = document.getElementById('kind-0'),
      l = document.createElement('li'),
      pubkey = document.createElement('p'),
      metadata = document.createElement('header'),
      dms = document.createElement('ul'),
      interactions = document.createElement('ul'),
      follows = document.createElement('ul');
   
   l.id = 'p-' + k;
   l.classList.add('fren');    
   
   pubkey.classList.add('pubkey');
   pubkey.textContent = k;
   
   metadata.classList.add('metadata');
   // I'm thinking maybe merge dms and interactions in a single list
   dms.classList.add('dms', 'section');
   dms.setAttribute('data-label', 'dms');
   interactions.classList.add('interactions', 'section');
   interactions.setAttribute('data-label', 'interactions');
   follows.classList.add('follows', 'section');
   follows.setAttribute('data-label', 'follows');
   
   stylek([k], l);
   
   l.append(pubkey, metadata, dms, interactions, follows);
   
   knd0.append(l);      
   l.addEventListener('click', clickFren, false);
   over(l);
   
   return l
}

function newid(o) 
{
   const l = document.createElement('li');
   l.classList.add('event');
   
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
      l.classList.add('p-'+ o.pubkey);
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
   
   if (o.kind && o.kind !== false) 
   {
      l.setAttribute('data-kind', o.kind);
   }
   
   if (o.tags && o.tags !== false) {
      h.append(ash(o.tags, l).nav);
   }
   
   if (o.content && o.content !== false) {
      const content = document.createElement('article');
      content.classList.add('content');
      content.textContent = o.content;
      l.append(content);
   }
   
   if (o.sig && o.sig !== false) {
      const sig = document.createElement('p');
      sig.classList.add('sig');
      l.append(sig);
   }

   over(l);
   return l
}

function build_relays(rels, l) 
{
   let rr = false;
   
   if (rels[0] === '{') 
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
         
         r.innerHTML = '';
         
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
   const l = document.createElement('dl');
   l.classList.add('raw');
   let content = '';
   Object.entries(o).forEach(([key, value]) =>
   {
      content += '<dt class="raw-' + key + '">' + key + '</dt>';
      
      let v = value;
      if (key === 'tags' || key === 'seen') {
         v = '<ul>';
         value.forEach(function(val) 
         {
            v += '<li>' + val + '</li>';
         });
         v += '</ul>';
      }
      
      content += '<dd class="raw-' + key + '">' + v + '</dd>';
   });
   l.innerHTML = content;
   
   return l;
}

function kind0(o) 
{ // NIP-01 set_metadata
   
//   let fren = document.getElementById('p-' + o.pubkey);
//   if (!fren) fren = newpub(o.pubkey);
   const 
      old_dat = your[o.pubkey] ? JSON.parse(your[o.pubkey]) : false,
      dat = JSON.parse(o.content);
   
   if (old_dat && old_dat.id === o.id) { return dat } 
   else 
   {
      dat.id = o.id;
      your[o.pubkey] = JSON.stringify(dat);
      update_k(o.pubkey);
   }
   
   let new_content = dat.name + ' new metadata!';
   if (old_dat.length > 0 !== dat) 
   {
      if (old_dat.name !== dat.name) 
      {
         new_content += '\n new name: ' + dat.name;
      }
      if (old_dat.picture !== dat.picture) 
      {
         new_content += '\n new picture: ' + dat.picture;
      }
      if (old_dat.about !== dat.about) 
      {
         new_content += '\n new about: ' + dat.about;
      }
      if (old_dat.nip05 !== dat.nip05)
      {
         new_content += '\n new nip05: ' + dat.nip05;
      }
   }
   
   o.content = new_content;
   let l = newid(o);
   knd1.append(l); 
   ordered(knd1, false);
   
   return l
}

function kind1(o) 
{ // NIP1 text_note
   
   let l = document.getElementById('e-'+o.id);
   
   if (!l) 
   { 
      if (!l) l = newid(o);
      else l.classList.remove('blank');
      
      const tags = ash(o.tags, l);

      let heading = child_from_class(l, 'heading');
      let old_tags = heading.querySelector('.tags');
      if (old_tags) old_tags.remove();
      heading.append(tags.nav); 
      
      let created_at = child_from_class(l, 'created-at');
      update_time(created_at);

      const 
         oc = document.createTextNode(o.content),
         ocd = oc.wholeText,
         odc = document.createElement('p');
      
      odc.innerHTML = ai(ocd, o.tags);

      let content = child_from_class(l, 'content');
      if (!content) {
         content = document.createElement('article');
         content.classList.add('content');
         l.append(content);
      }
      content.innerHTML = ''; 
      content.append(odc);
      
      let media = content.querySelector('img, video, audio, iframe');
      if (media) 
      { 
         content.classList.add('has-media');
         let videos = content.querySelectorAll('video');
         if (videos) videos.forEach(rap);
      }
      
      let replyid = false;
      if (tags.ereply !== false) 
      {
         l.classList.add('reply');
         // if it's a reply, check if we already have it
         replyid = o.tags[tags.ereply][1];
//         rootid = o.tags[tags.eroot][1];
         let reply = document.getElementById('e-'+ replyid);
   
         if (reply) lies(reply, l);
         else childcare(tags);
      } 
      else 
      {
         l.classList.add('root');
         knd1.append(l); 
         ordered(knd1, false);
      }   

      get_orphans(o.id, l);
      
      //Notifications (WIP)
//      if (tags.p.length 
//      && tags.p.includes(options.k)
//      && o.pubkey !== options.k) notifica(o);
   
   } 
   
   return l
}

function kind2(o) 
{// Recommend Relay (NIP1)
   kind1(o);
}

function kind3(o) 
{ // Contacts (NIP2) (& relays until new dedicated relay NIP)
   if (o.pubkey === options.k) 
   {
      options.r = JSON.parse(o.content);
      your.options = JSON.stringify(options);
      your.follows = JSON.stringify(o.tags);
   }
   
   let fren = document.getElementById('p-' + o.pubkey);
   if (!fren) fren = newpub(o.pubkey);   
   if (o.tags.length > 0) 
   {
      let follows = fren.querySelector('.follows');
      follows.innerHTML = '';
      let subscriptions = o.pubkey === options.k ? [] : false;
      o.tags.forEach(function(ot) 
      { 
         if (subscriptions) subscriptions.push(ot[1]);
//         pubcrawl.push(ot[1]);
         const 
            f = document.createElement('li'),
            a = taglink(['p', ot[1]], '');
         
         f.classList.add('follow', 'section-item', 'p-'+ot[1]);
         f.append(a);
         stylek([ot[1]], f);
         follows.append(f);
      });

      build_relays(o.content, fren);
      
      if (subscriptions) your.follows = JSON.stringify(subscriptions);
   }
   
   return fren
}

function kind4(o) 
{ // Encrypted Direct Message (NIP4)
   let m = false;
   let own = o.tags[0][1] !== options.k;
   let ek =  own ? o.tags[0][1] : o.pubkey;

   let fren = document.getElementById('p-' + ek);
   if (!fren) fren = newpub(ek);  
  
   let dms = fren.querySelector('.dms');
   if (dms) 
   {
      let 
         l = document.createElement('li'),
         pubkey = document.createElement('p'),
         content = document.createElement('p'),
         eventDate = new Date(o.created_at*1000),
         stored = your[o.id];
         
      l.classList.add('dm', 'section-item');
      if (own) l.classList.add('own');
            
      pubkey.classList.add('l-pubkey');
      pubkey.textContent = pretty(o.pubkey) + ' / ~' + timeSince(eventDate);
      
      content.classList.add('l-content');
      content.textContent = '/* --encrypted-- */';

      if (stored) {
         content.textContent = stored;
      } else {
         // enabling this will open a dialog box for every message sent and received 
         // if nos2x permission is not set forever... 
         
//         if (window.nostr) 
//         {
//            window.nostr.nip04.decrypt(ek, o.content)
//            .then(decrypted => 
//            {
//               content.textContent = your[o.id] = decrypted;
//            })
//         }
      }
      
      l.append(pubkey, content);
      dms.append(l);
      m = l;
   }
   
   return m
}

function defolt(o) 
{
   let 
      l = document.createElement('li'),
      content = '';
   
   l.classList.add('anykind', 'kind-'+o.kind);
   l.setAttribute('data-kind', o.kind);
   
   let l_id = document.createElement('h2');
   l_id.classList.add('l-id');
   l_id.textContent = o.id;
   stylek([o.id], l);
   
   let eventDate = new Date(o.created_at*1000);
      
   let l_pubkey = document.createElement('p');
   l_pubkey.classList.add('l-pubkey');
   l_pubkey.textContent = pretty(o.pubkey) + ' / ~' + timeSince(eventDate);
   
   let l_content =  document.createElement('p');
   l_content.classList.add('l-content');
   l_content.textContent = o.content;
   
   let l_tags =  document.createElement('p');
   l_tags.classList.add('l-tags');
   l_tags.textContent = o.tags;
   
   l.append(l_id,l_pubkey,l_content,l_tags);
   
   return l
}

function notifica(o) {
// old notifications, unused at the moment...
//   let inbox = your.inbox ? JSON.parse(your.inbox) : {};
//   if (!inbox[o.id]) inbox[o.id] = 'unread';
//   
//   let state = inbox[o.id], last;
//
//   your.inbox = JSON.stringify(inbox);
//      
//   switch (o.kind) 
//   {
//      case 4: last = kind4(o); break;
//      case 3: follows_you(o.pubkey); break;
//      default:
//         if (o.pubkey !== options.k) {
//            let selector = '#p-' + o.pubkey + ' .interactions';
//            let interactions = document.querySelector(selector);
//            if (!interactions) interactions = newpub(o.pubkey).querySelector(selector);
//            
//            let already = document.querySelector(selector + ' .e-'+o.id);
//            if (!already) {
//               if (o.kind === 1) 
//               {
//                  let follows = your.follows ? JSON.parse(your.follows) : false;
//                  if (follows && !follows.includes(o.pubkey)) last = kind1(o);
//               }
//               
//               let 
//                  l = document.createElement('li'),
//                  text = ' replied in ';
//               
//               l.classList.add('interaction', 'section-item', state, 'e-'+o.id);
//               l.setAttribute('data-kind', o.kind);
//               stylek([o.pubkey,o.id], l);
//               
//               let id = document.createElement('a');
//               id.classList.add('interaction-link');
//               
//               let target = o.id;
//               id.textContent = pretty(o.id);
//      
//               let mentions = checkmentions(o.content);
//               mentions.forEach(function(el) 
//               {
//                  if (o.tags[el][1] === options.k) {
//                     text = ' mentioned you in ';
//                  }
//               });
//               
//               if (o.kind === 7) 
//               {
//                  
//                  let ind = o.tags.findIndex(inde);
//                  
//                  function inde(x) {
//                    return x[0] === 'e';
//                  }
//                  
//                  target = o.tags[ind][1];
//                  text = " liked ";
//               }
//               
//               id.textContent = pretty(target);
//               id.href = '#e-' + target;
//               
//               let created_at = make_time(o.created_at);
//               
//               l.innerHTML = pretty(o.pubkey) 
//                  + text 
//                  + id.outerHTML 
//                  + created_at.outerHTML;
//               
//               let button_state = document.createElement('button');
//               button_state.classList.add('inbox-state');
//               button_state.dataset.id = o.id;
//               button_state.textContent = '[x]';
//               
//               l.append(button_state);
//               interactions.prepend(l);
//            }
//         }
//   }
   
   // using Web Notifications
   if ("Notification" in window) 
   {
      if (Notification.permission === "granted") 
      {
         const data = your[o.pubkey] ? JSON.parse(your[o.pubkey]) : false;
         let title = o.kind;
         let options = {
            'body': data.name ? data.name: o.pubkey,
            'icon': data.picture ? data.picture: 'https://alphaama.com/r/apple-touch-icon.png',
            'tag': o.id
         }
         
         const notification = new Notification(title, options);
         notification.onclick = function () 
         {
            window.parent.focus();
            notification.close();
            console.log(o.id);
            select_e(o.id);
         }
      } 
      else if (Notification.permission !== "denied") 
      {
         Notification.requestPermission().then((permission) => 
         {
            if (permission === "granted") {
               const notification = new Notification("Hi there!");
            }
         });
      }
   }   
}

function process(dat, dis) 
{
   let l;
   switch (dat.kind) 
   {
       case 0: l = kind0(dat); break;
       case 1: l = kind1(dat); break;
       case 2: l = kind2(dat); break;
       case 3: l = kind3(dat); break;
       case 4: l = kind4(dat); break;
       case 6: l = kind1(dat); break;
       case 7: l = kind1(dat); break;
      default: l = defolt(dat)
   }
   
   if (isElement(l)) l.dataset.req = dis;

   return l
}