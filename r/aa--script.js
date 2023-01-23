const stuff = { behavior:'smooth', block: 'start'};

function not_interesting(l) 
{
   l.classList.remove('interesting');
   history.pushState('', document.title, location.pathname + location.search);
         
   const moms = document.querySelectorAll('.mom');
   moms.forEach((mom)=> { mom.classList.remove('mom') });
   
   document.body.classList.remove('has-interesting');
   sessionStorage.removeItem('interesting');
   document.getElementById('iot').placeholder = 'new post';

   return l
}

function is_interesting(l) 
{ 
   let interesting = document.getElementById('e-'+sessionStorage.interesting);
   if (interesting) not_interesting(interesting);
   update_time(l.querySelector('.created-at'));
   l.classList.add('interesting');   
   mom(l);
   document.body.classList.add('has-interesting');
   let l_id = l.id.substring(2);
   sessionStorage.interesting = l_id;   
   location.hash = '#' + l.id;
   document.getElementById('iot').placeholder = 'reply to ' + l.querySelector('.author').textContent;
   return l
}

function hotkeys(e) 
{
   if (sessionStorage.interesting && e.target !== iot) 
   {
      const l = document.getElementById('e-'+sessionStorage.interesting);
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
//   else if (id) to_get({e:[id]});
}

function select_p(k) 
{
   console.log('select', k);
   
   let l = document.getElementById('p-'+k);
   if (!l) l = newpub(k);
   
   if (aa.p[k] && aa.p[k].data)
   {
      
      update_fren(k)
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
//      else to_get({p:[k]});
//      sub_p(k);
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
               if (e.target.classList.contains('id')) view_source(e.target);
               else select_e(href.substr(3));
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
            let unsigned = JSON.parse(localStorage[event.id.substr(2)]);
            sign(unsigned);
         } 
         else if (e.target.classList.contains('cancel'))
         {
            let par = event.parentElement;
            if (event.classList.contains('interesting')) not_interesting(event);
            event.remove();
            if (!par.childNodes.length) par.closest('.event').classList.remove('has-replies');
         } 
         else if (e.target.classList.contains('edit'))
         {
            let content = event.querySelector('.content').textContent;
            switch (event.dataset.kind) {
               case "0":
                  content = '--smd ' + content;
                  break;
            }
            io(content);
            let par = event.parentElement;
            event.remove();
            if (!par.childNodes.length) par.closest('.event').classList.remove('has-replies');
            const iot = document.getElementById('iot');
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

function last_first(container, timestamp)
{
   let b = [...container.children].filter((c)=> timestamp > parseInt(c.dataset.stamp))[0];
   return b ? b : null
}

function insert_before(container, timestamp)
{
   let b = [...container.children].filter((c)=> timestamp < parseInt(c.dataset.stamp))[0];
   return b ? b : null
}

function lies(reply, l) 
{
   let replies = reply.querySelector('.replies');

   let l_stamp = parseInt(l.dataset.stamp);

   replies.insertBefore(l, insert_before(replies, l_stamp));

   l.removeAttribute('data-reply');
   reply.classList.add('has-replies', 'has-new');
   count_replies(l);
    
   
   if (l.dataset.p !== aa.k) 
   {
      let root = (reply.closest('.event.root') || ancestor(reply, 'event') );   
      if (root) 
      {
         if (l_stamp > parseInt(root.dataset.stamp)) 
         {
            root.dataset.stamp = l.dataset.stamp;
            let knd1 = document.getElementById('kind-1');
            knd1.insertBefore(root, last_first(knd1, l_stamp));
         }
      }  
   }
}

function view_source(l) 
{
   const event = l.closest('.event');
   event.classList.toggle('view-source');
   let source = child_from_class(event, 'source');
   if (!source)
   {
      source = raw_event(db[event.id.substr(2)]);
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

function show_fren() 
{
   
}

function update_metadata(contact) 
{
   const metadata = new DocumentFragment();
   Object.entries(contact.data).map(([key,value])=>
   {
      switch (key) 
      {
         case 'picture':
         case 'banner':
            if (options.media && contact.trust && contact.trust !== 'false') metadata.append(m_l('img',{cla:key,src:value}));
            else metadata.append(m_l('p',{cla:key,con:value}));
            break;
         default: 
            metadata.append(m_l('p',{cla:key,con:value}));
      }
      if (!value || value === '') metadata.lastChild.classList.add('empty');
      if (key === 'nip05') metadata.lastChild.dataset.verified = '?';
   });
   return metadata
}

function update_fren(k)
{
   let contact = aa.p[k];
   let l = document.getElementById('p-'+k);
//   if (!l) l = newpub(k);
   if (contact && contact.data) 
   {
//      cd = contact.data;
      const metadata = l.querySelector('.metadata');
      metadata.dataset.date = format_date(dt(contact.last_k0));
      metadata.textContent = '';
      metadata.append(update_metadata(contact));

      
      //      let follows = fren.querySelector('.follows');
   //      if (!follows) 
   //      { 
   //         follows = make_section('follows');
   //         fren.append(follows);
   //      }
      document.querySelectorAll('a[href="#p-'+k+'"]').forEach((a)=>{a_k(a,contact)})
   }
}