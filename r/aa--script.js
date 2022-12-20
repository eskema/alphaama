const 
   idea = document.getElementById('a'), 
   iot = document.getElementById('iot'),
   knd1 = document.getElementById('kind-1'),
   aside = document.getElementById('as'),
   u = document.getElementById('u'),
   stuff = { behavior:'smooth', block: 'start'};

function ash(tags, l) 
{
   const nav = document.createElement('nav');
//   let note = { 
//      'e': [], // list of event ids
//      'p': [], // list of pubkeys
//      'nonce': [], // pow
//      'hashtags': [], // #
//      'custom': [], // else
//      'ereply': false,
//      'preply': false,
//      'eroot': false,
//      'proot': false,
//      'tags': tags,
//      'nav': nav
//   };   
   
   nav.classList.add('tags');
   
   tags.forEach(function(ot, i) 
   {
      nav.append(taglink(ot, ''));
   });
   
//   let nodes = nav.childNodes;
//   
//   if (tags.length > 0) 
//   {
//      
//      
//      if (note.e.length > 0) 
//      {
//         note.ereply = tags.findIndex(el => el[1] === note.e[note.e.length - 1]);
//         note.eroot = tags.findIndex(el => el[1] === note.e[0]);
//         l.setAttribute('data-reply', 'e-' + note.e[note.e.length - 1]);
//      }
            
//      if (note.p.length > 0) 
//      {
//         note.preply = tags.findIndex(el => el[1] === note.p[note.p.length - 1]);
//         note.proot = tags.findIndex(el => el[1] === note.p[0]);
//      }
//      
//      if (note.nonce.length > 0) 
//      {
//         let nonce = l.dataset.nonce;
//         l.setAttribute('data-nonce', note.nonce[0]);
//      }
      
//      nodes.forEach(function(li, i) 
//      {
//         if (i === note.eroot) li.classList.add('tag-e-root');
//         if (i === note.proot) li.classList.add('tag-p-root');
//         if (i === note.ereply) li.classList.add('tag-e-reply');
//         if (i === note.preply) li.classList.add('tag-p-reply');
//      });
//   }
   
   return nav
}

function not_interesting(l) 
{
   l.classList.remove('interesting');
   history.pushState('', document.title, location.pathname + location.search);
         
   const moms = document.querySelectorAll('.mom');
   moms.forEach(function(mom) { mom.classList.remove('mom') });
   
   document.body.classList.remove('has-interesting');
   session.removeItem('interesting');
   iot.placeholder = 'new post';
   session.removeItem('reaction');
   
   return l
}

function is_interesting(l) 
{ 
   let interesting = document.getElementById('e-'+session.interesting);
   if (interesting) not_interesting(interesting);
   update_time(l.querySelector('.created-at'));
   l.classList.add('interesting');   
   mom(l);
   document.body.classList.add('has-interesting');
   
   let l_id = l.id.substring(2);
   session.interesting = l_id;   
   location.hash = '#' + l.id;
   iot.placeholder = 'reply to ' + l.querySelector('.author').textContent;
   session.removeItem('reaction');
//   if (l.dataset.reply) get_tags(JSON.parse(l.dataset.o).tags);

//   if (l.dataset.reply) 
//   {
//      sub_root(get_root(JSON.parse(l.dataset.o).tags)[1]);
//   }
//   else 
//   {
//      sub_root(l_id);
//   }

//   get_orphans(l);
   return l
}

function hotkeys(e) 
{
   if (session.interesting && e.target !== iot) 
   {
      const l = document.getElementById('e-'+session.interesting);
      let c, next;
      switch (e.key) 
      {
         case 'k':
            // next
            next = l.nextElementSibling;
            break;
         case 'i':
            // previous
            next = l.previousElementSibling;
            break;
         case 'j':
            // parent
            if (l.classList.contains('reply')) next = l.parentElement.closest('.event');
            break;
         case 'l':
            // child
            if (!l.classList.contains('replies-hidden')) next = l.querySelector('.event');
            break;
         case 'h':
            // top
            c = l.parentElement.firstElementChild;
            if (c !== l) next = c;
            break;
         case 'b':
            // bottom
            c = l.parentElement.lastElementChild;
            if (c !== l) next = c;
            break;
         case 'f':
            // fetch
//            console.log(l.id.substr(2));
            sub_root(l.id.substr(3));
            break;
         case '\\':
            // toggle replies
            hide_replies(l);
            break;
         case 'Escape':
            // out of selection
            next = l;
            break;
      }
      if (next) select_e(next)
   }
}

function verifyNIP05(fren, frend, pubkey)
{ //https://<domain>/.well-known/nostr.json?name=<local-part>
   let parts = frend.nip05.split('@');
   if (parts.length === 2) 
   {
      const 
         username = parts[0],
         domain = 'https://'+parts[1];
         
      const same = new URL(domain);
      if (domain !== same.origin)
      {
         console.log('invalid nip05: domain !== origin', domain);
         domain = false;
      }
      
      function checknip05(jsondata) 
      {
         console.log(jsondata);
         
         if (pubkey === jsondata.names[username])
         {
            const tit = fren.querySelector('.tit');
            if (tit) 
            {
               tit.setAttribute('data-nip05', frend.nip05)
               fren.classList.add('nip05');
               
               if (frend.nip05.startsWith('_@')) tit.classList.add('root');
            }
            // relays
            // jsondata.relays[pubkey]
         }
      }
      
      if (username && domain) 
      {
         fetch(domain+'/.well-known/nostr.json')
         .then(response => 
         {
   //         const res = response.ok;
            console.log('response',response.ok);
            if (response.ok) return response.json()
         })
         .then(jsondata => checknip05(jsondata));
      }
   }
}

function select_e(l) 
{ // opens / close an article on event
  // l is an element, but if it's a string, we search for an element with that id
   
   let it, id = false;
   if (typeof l === 'string') 
   {
      id = l;
      l = document.getElementById('e-'+id);
   }
      
   const interesting = document.querySelector('.interesting'); // selected element
   
   if (l) it = l.classList.contains('interesting') ? not_interesting(l) : is_interesting(l);
   
   if (it) { it.scrollIntoView(stuff) } 
   else if (id) 
   { 
      //to_get({e:[id]}) 
   }
}

function select_p(k) 
{
   let dat = your[k] ? JSON.parse(your[k]) : false;
   
   if (!dat) 
   {
      to_get({p:[k]});
   
   } else 
   {
      let l = document.getElementById('p-' + k);
      if (!l) l = newpub(k);
      update_fren(dat, k)
      
      let solo = document.querySelector('.fren.solo');
      
      function pk() 
      {
         if (l) l.classList.add('solo');      
         hide(k);
         location.hash = '#p-' + k;
         history.pushState('', '', location.origin + location.pathname + location.hash + location.search);
         document.body.classList.add('p-k');
         
         let interesting = document.querySelector('.interesting');
         if (interesting) interesting = not_interesting(interesting);
      }
      
      if (solo) 
      {
         solo.classList.remove('solo');
         let active = solo.querySelector('.active');
         if (active) active.classList.remove('active');
         unhide();
         history.pushState('', '', location.pathname);
         document.body.classList.remove('p-k');
         if (solo !== l) pk();
      
      } else { pk() }
   }
}

function clickFren(e) 
{
   let fren = e.target.closest('.fren');
   if (e.target.classList.contains('section')) {
      if (e.target.classList.contains('active')) {
         e.target.classList.remove('active');
      } else {
         let active = fren.querySelector('.active');
         if (active) {
            active.classList.remove('active');
         }
         e.target.classList.add('active');
      }      
   } else {
   switch (e.target.tagName) {
      case 'A':
         if (e.target.classList.contains('interaction-link')) 
         {
            if (e.target.parentElement.classList.contains('unread')) {
               toggle_inbox_state(e.target.parentElement);
            }
            
            select_e(e.target.getAttribute('href').substr(3));
            break;
         }
         if (e.target.classList.contains('author'))
         {
            select_p(e.target.getAttribute('href').substr(3));
         }
      case 'P':
      case 'HEADER':
      case 'H2':
      case 'UL':
      case 'SPAN':
         break;
      case 'BUTTON':
         if (e.target.parentElement.classList.contains('interaction')) 
         {
            toggle_inbox_state(e.target.parentElement);
            break;
         }
         else if (e.target.classList.contains('close')) {
            select_p(fren.id.substr(2)); 
         }
      case 'LI':
         if (e.target !== fren) {
            break;
         }
      default:
         select_p(fren.id.substr(2));            
   }
   }
}

function clickEvent(e) 
{
   let event = e.target.closest('.event');
   switch (e.target.tagName) 
   {
      case 'FIGCAPTION':
      case 'VIDEO':
      case 'DIV':
      case 'UL':
      case 'DL':
      case 'DT':
      case 'DD':
         break;
      case 'SPAN':
         
         break;
      case 'A':
         let href = e.target.getAttribute('href');
         switch (href.substr(1, 1)) 
         {
            case 'e':
               e.preventDefault();
               if (e.target.classList.contains('id')) 
               {
                  if (e.target.classList.contains('mention')) {
                     select_e(href.substr(3));
                  }
                  else {
                     view_source(e.target);
                  }                  
               } else {
                  select_e(href.substr(3));
               }
               
               break;
            case 'p':
               e.preventDefault();
               select_p(href.substr(3));
               break;
         }
         break;
      case 'BUTTON':
         if (e.target.classList.contains('post')) 
         {
            let unsigned = JSON.parse(event.dataset.o);
//            delete unsigned.seen;
            sign(unsigned);
            
            // broadcast interacted post
//            if (session.interesting) 
//            { 
//               try 
//               {
//                  let reply = JSON.parse(session[session.interesting]);
//                  seen = reply.seen[0];
//                  delete reply.seen;
//                  post(reply);
//               }
//               catch (error) {
//                  console.log("broadcast wen't wrong")
//               }
//               
//               if (reply) post(reply);
//            }
         } 
         else if (e.target.classList.contains('cancel'))
         {
            let par = event.parentElement;
            event.remove();
            if (!par.childNodes.length) par.closest('.event').classList.remove('has-replies');
         } 
         else if (e.target.classList.contains('edit'))
         {
            let content;
            switch (event.dataset.kind) {
               case "0":
                  content = '--smd ' + JSON.parse(your[event.dataset.o]).content;
                  break;
               default:
                  content = event.dataset.draft;
            }
            iot.value = content;
            iot.parentElement.dataset.content = content;
            let par = event.parentElement;
            event.remove();
            if (!par.childNodes.length) par.closest('.event').classList.remove('has-replies');
            iot.focus();
            iot.setSelectionRange(iot.value.length,iot.value.length);
         }
         break;
      case 'P':
         if (event.classList.contains('interesting')) {
            break;
         } 
      case 'LI':
         if (e.target.tagName === 'LI'
         && event.classList.contains('interesting')
         && !e.target.classList.contains('interesting')) 
         {
            break;
         }
      default:
         e.preventDefault();
         select_e(event);
   }   
}

function count_replies(l) 
{
   for ( ; l && l !== document; l = l.parentNode ) 
   {
      if (l.classList.contains('event')) 
      {
         const replies = l.querySelector('.replies');
         if (replies) 
         {
            const some = replies.childNodes.length;
            const all = l.querySelectorAll('.event').length;
            const hide_btn = l.querySelector('.actions .hide-replies');
            hide_btn.textContent =  some + (all > some ? '.' + all : '');
         }
      }
	}
}

function lies(reply, l) 
{
   let replies = reply.querySelector('.replies');
      
//   if (!replies) 
//   {
//      replies = document.createElement('ul');
//      replies.classList.add('replies');
//      reply.append(replies); 
//   } 

   if (l.classList.contains('interesting')) 
   {
      is_interesting(l);
   }

   replies.append(l); 

//   console.log(replies.childNodes.length);
   count_replies(l);
   
   l.removeAttribute('data-reply');
   reply.classList.add('has-replies');
   ordered(replies, true);
   
   let root = ancestor(reply, 'event');
//   if (root !== reply) 
//   {
//      some = root.querySelector('.replies').childNodes.length;
//      all = root.querySelectorAll('.event').length;
//      hide_btn = root.querySelector('.actions .hide-replies');
//      hide_btn.textContent =  some + (all > some ? '.' + all : '');
//   }
   if (parseInt(l.dataset.stamp) > parseInt(root.dataset.stamp)) 
   {
      root.dataset.stamp = l.dataset.stamp;
      let last = replies.querySelector('.last');
      if (last) last.classList.remove('last');
      l.classList.add('last');
   }
   ordered(knd1, false);

}

function view_source(l) 
{
   const event = l.closest('.event');
   event.classList.toggle('view-source');
   
   let source = child_from_class(event, 'source');
   if (!source) 
   {
      source = raw_event(JSON.parse(event.dataset.o));
      source.classList.add('source');
      event.append(source);
   }
}

function follows_you(k) 
{
   let fu = document.getElementById('fu');
   if (!fu) {
      fu = make_section('follows-u');
      fu.id = 'fu';

      let you = document.getElementById('p-' + options.k);
      if (!you) you = newpub(options.k);
      you.append(fu);
   }
   
   let followers = your.fu ? JSON.parse(your.fu) : [];
   if (!followers.find[k]) { 
      followers.push(k);
   }
   
   your.fu = JSON.stringify(followers);
   
   let already = fu.querySelector('.p-'+k);
   
   if (!already) 
   {
      let 
         l = document.createElement('li'),
         a = taglink(['p', k], '');
         
      l.classList.add('follow', 'section-item', 'p-'+k);
      stylek([k], l);
      l.append(a);
      fu.append(l);
   }   
}

function inbox() {
      
   let inbox = your.inbox ? JSON.parse(your.inbox) : {};      
      
   Object.entries(inbox).forEach(([id, state]) => 
   {       
      if (state === 'unread') 
      {
         let unread = session[id] ? JSON.parse(session[id]) : false;
         if (unread) notifica(unread);
      } 
   });
}

function get_orphans(l)
{
   let orphans = document.querySelectorAll('[data-reply="'+l.id.substr(2)+'"]');
   if (orphans.length) 
   {
      orphans.forEach((orphan)=> 
      {
         try 
         {
            lies(l,orphan)
         } 
         catch (error) {
            console.log(l,orphan)
         }
         
      })
   }
}

function update_fren(dat, k)
{
   let fren = document.getElementById('p-'+k);
   if (!fren) fren = newpub(k);
   
   fren.classList.add('bff'); // not sure if this is still used.. should be for your follows only
   const metadata = fren.querySelector('.metadata');

   if (dat.name) 
   {
      // iden.tit.y
      let tit = fren.querySelector('.tit'); 
      if (!tit) 
      {
         tit = document.createElement('h2');         
         tit.classList.add('tit');
         metadata.append(tit);
      } 
      
      let name = fren.querySelector('.name');
      if (!name) 
      {
         name = document.createElement('span');
         name.classList.add('name');
         tit.append(name);
      }

      name.innerText = dat.name;
	   
      if (dat.nip05 && options.media) verifyNIP05(fren, dat, k);
      
	}
   
   if (dat.picture) 
   {
      let picture = fren.querySelector('.picture');
      
      if (!picture) 
      {
         picture = document.createElement('img');
         picture.classList.add('picture');
         metadata.append(picture);
         fren.classList.add('has-picture');
      }

      let src = arParams(dat.picture);
      if (options.media) 
      {
         picture.setAttribute('src', src[0]);   
         picture.setAttribute('loading', 'lazy');
         
         if (src.length > 2) 
         { // there's parameters
            let srcl = src[2].get('logo'); // let c if it is a logo
            if (srcl) 
            { // it is
               // let's build it
               let logo = fren.querySelector('.logo');
               if (!logo) 
               {
                  logo = document.createElement('img');
                  logo.classList.add('logo');
                  logo.setAttribute('loading', 'lazy');
                  metadata.append(logo);
               }
               logo.setAttribute('src', decodeURIComponent(srcl));
            }
         }
         
         if (k === options.k) 
         { // gets main profile img
            u.style.backgroundImage = 'url('+dat.picture.split('?')[0]+')';
         }
      }
   }
   
	if (dat.about) 
	{
      let about = fren.querySelector('.about');
      if (!about) 
      {
         about = document.createElement('p');
         about.classList.add('about');
         metadata.append(about);
      }
	   about.innerText = dat.about;
	}
   
   update_k(k);
}



