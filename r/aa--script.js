const 
   iot = document.getElementById('iot'),
   knd1 = document.getElementById('kind-1'),
   stuff = { behavior:'smooth', block: 'start'};

function ash(tags, l) 
{
   const nav = document.createElement('nav');  
   nav.classList.add('tags');
   tags.forEach((ot, i)=> { nav.append(taglink(ot, '')) });   
   return nav
}

function not_interesting(l) 
{
   l.classList.remove('interesting');
   history.pushState('', document.title, location.pathname + location.search);
         
   const moms = document.querySelectorAll('.mom');
   moms.forEach((mom)=> { mom.classList.remove('mom') });
   
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

async function verifyNIP05(fren, dat, pubkey)
{ //https://<domain>/.well-known/nostr.json?name=<local-part>
   if (dat && dat.nip05) 
   {
      let parts = dat.nip05.trim().split('@');
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
            if (pubkey === jsondata.names[username])
            {
               const tit = fren.querySelector('.tit');
               if (tit) 
               {
                  tit.setAttribute('data-nip05', dat.nip05)
                  fren.classList.add('nip05');
                  if (dat.nip05.startsWith('_@')) tit.classList.add('root');
               }
            }
            else console.log('invalid nip05', jsondata.names[username])
         }
         
         if (username && domain) 
         {
            fetch(domain+'/.well-known/nostr.json')
            .then(response => 
            {
               console.log('response', response.ok);
               if (response.ok) return response.json()
            })
            .then(jsondata => checknip05(jsondata));
         }
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
         
   if (l) it = l.classList.contains('interesting') ? not_interesting(l) : is_interesting(l);
   
   if (it) { it.scrollIntoView(stuff) } 
   else if (id) to_get({e:[id]});
}

function select_p(k) 
{
   if (is_hex(k)) 
   {
      let dat;
      try {
         dat = JSON.parse(your[k])
      } catch (error) {
         console.log('no saved data')
      }
      
      if (dat) 
      {
         let l = document.getElementById('p-'+k);
         if (!l) l = newpub(k);
         update_fren(dat, k)
         let solo = document.querySelector('.fren.solo');
         function pk() 
         {
            l.classList.add('solo');      
            hide(k);
            location.hash = '#p-' + k;
            history.pushState('', '', location.origin + location.pathname + '#p-' + k + location.search);
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
         
         } else pk();
      }
      else to_get({p:[k]});
      sub_p(k);
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
            sign(unsigned);
         } 
         else if (e.target.classList.contains('cancel'))
         {
            let par = event.parentElement;
            event.remove();
            if (!par.childNodes.length) par.closest('.event').classList.remove('has-replies');
         } 
         else if (e.target.classList.contains('edit'))
         {
            let content = event.querySelector('.content').innerText;
            switch (event.dataset.kind) {
               case "0":
//                  let k0 = JSON.parse(your[option.k]);
//                  delete k0.id
                  content = '--smd ' + content;
                  break;
//               default:
//                  content = event.dataset.draft;
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
         if (event.classList.contains('interesting')) break;
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
            if (hide_btn) hide_btn.textContent =  some + (all > some ? '.' + all : '');
         }
      }
	}
}

function lies(reply, l) 
{
   let replies = reply.querySelector('.replies');

   requestAnimationFrame(()=> 
   {
		replies.append(l);
      l.removeAttribute('data-reply');
      reply.classList.add('has-replies');
      ordered(replies, true);
      count_replies(l);
      if (l.classList.contains('interesting')) is_interesting(l);
	});
    
   

   let root = ancestor(reply, 'event');
   if (parseInt(l.dataset.stamp) > parseInt(root.dataset.stamp)) 
   {
      root.dataset.stamp = l.dataset.stamp;
      let last = replies.querySelector('.last');
      if (last) last.classList.remove('last');
      l.classList.add('last');
   }
   
   requestAnimationFrame(()=> { ordered(knd1, false); });

}

function view_source(l) 
{
   const event = l.closest('.event');
   event.classList.toggle('view-source');
   let source = child_from_class(event, 'source');
   if (!source)
   {
      const o = JSON.parse(event.dataset.o);
      o.seen = JSON.parse(event.dataset.seen);
      source = raw_event(o);
      source.classList.add('source');
      event.append(source);
   }
}

function get_orphans(l)
{
   let orphans = document.querySelectorAll('[data-reply="'+l.id.substr(2)+'"]');
   if (orphans.length) 
   {
      orphans.forEach((orphan)=> 
      {
         try { lies(l,orphan) } 
         catch (error) { console.log(l,orphan) }
      })
   }
}

function update_fren(dat, k)
{
   let fren = document.getElementById('p-'+k);
   if (!fren) fren = newpub(k);

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
      name.textContent = dat.name;
	}
   
   if (options.media) 
   {
      if (dat.nip05) verifyNIP05(fren, dat, k);
            
      if (dat.picture && fren.classList.contains('known')) 
      {
         let picture = fren.querySelector('.picture');
         
         if (!picture) 
         {
            picture = document.createElement('img');
            picture.classList.add('picture');
            metadata.append(picture);
            fren.classList.add('has-picture');
         }
         
         picture.src = dat.picture;
         picture.setAttribute('loading', 'lazy');
         
         if (k === options.k) 
         { // gets main profile img
            const img = document.createElement('img');
            img.src = dat.picture;
            u.replaceChildren(img);
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
	   about.textContent = dat.about;
	}
   
   update_k(k);
}