const 
   your = window.localStorage,
   session = window.sessionStorage,
   idea = document.getElementById('a'), 
   iot = document.getElementById('iot'),
   knd1 = document.getElementById('kind-1'),
   story = document.getElementById('story'),
   aside = document.getElementById('as'),
   u = document.getElementById('u'),
   stuff = { behavior:'smooth', block: 'start'},
   ws = [],
   ws_closed = {};


//let relays = your.r ? JSON.parse(your.r) : 
let relays = 
{
   "wss://nostr-pub.wellorder.net":{"read":true,"write":true},
   "wss://nostr-relay.wlvs.space":{"read":true,"write":true},
   "wss://nostr-relay.untethr.me":{"read":true,"write":true},
   "wss://relay.damus.io":{"read":true,"write":true}
};

session.removeItem('interesting');

let defaults = 
{
   'media': false
}

if (!your.options) your.options = JSON.stringify(defaults);
let options = JSON.parse(your.options);
console.log('options:', options);

function pause(video) 
{ 
   video.pause();
   video.classList.remove('playin');
}

function play(video) 
{
   let playin = document.querySelector('.playin');
   if (playin) 
   {
      pause(playin);
      playin.classList.remove('playin');
   } 
   video.classList.add('started','playin');
   video.play();
}
	        
function vip(e) 
{ // o cão do Marinho
   if (e.target.paused) { play(e.target) }
   else { pause(e.target) }
}

function rewind(e) 
{
   const 
      container = e.target.parentElement,
      video = container.querySelector('video');
   video.currentTime = 0;
}

function player(src, poster)
{  
   const 
      rapper = document.createElement('figure'),
      video = document.createElement('video'),
      controls = document.createElement('figcaption'),
      url = document.createElement('span'),
      progress = document.createElement('progress');

   let postr = poster ? poster : '';
   if (postr) video.setAttribute('poster', postr);
   
   video.classList.add('content-video');
   video.setAttribute('loop', '');
   video.setAttribute('playsinline', '');
   video.setAttribute('preload', 'metadata');  
   video.setAttribute('src', src); 
   
   rapper.classList.add('yo');
      
   url.classList.add('vhs'); 
   url.innerHTML = src;
   
   progress.innerHTML = '0% played';
   progress.setAttribute('min', 0);
   progress.setAttribute('max', 100);
   progress.setAttribute('value', 0);
   
   controls.append(url, progress); 

   rapper.prepend(video); 
   rapper.append(controls);
   
   return rapper
}

function rap(video)
{
   let controls = video.nextSibling;
   let progress = controls.querySelector('progress');
   
   video.addEventListener('click', vip, false);
   controls.addEventListener('click', rewind, false);
   
   video.addEventListener('timeupdate', function(e) 
   {
      const percentage = Math.floor((100 / this.duration) * this.currentTime);
      
      controls.dataset.elapsed = Math.ceil(this.currentTime);
      controls.dataset.remains = Math.round(this.duration - this.currentTime);
      controls.dataset.duration = Math.floor(this.duration);
      
      progress.value = percentage;
      progress.style.width = percentage + '%';
      progress.innerHTML = percentage + '%';
      
   });
   
   video.addEventListener('loadedmetadata', function(e) 
   {
      controls.dataset.duration = Math.ceil(video.duration);
   
   }, false);
   
   over(video); 
   over(controls);
}

function yt(url) 
{ // fuck youtube but here it is anyway
   return '<figure class="yt"><iframe src="https://www.youtube.com/embed/'+url.searchParams.get('v') + '" title="yt" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>'
}

function tog(e,l) 
{ // toggle classes
   e.preventDefault();
   const tog = l.getAttribute('data-tog');
   if (tog) 
   {
      document.body.classList.toggle(tog);
      e.target.classList.toggle('active');
   } 			
}

function taglink(tag, clas) 
{ // make tags clickable
   const a = document.createElement('a');
   
   a.classList.add('tag');
   
   if (clas !== '') a.classList.add(clas);
   
   if (tag && tag[1]) 
   {
      a.classList.add('tag-'+tag[0]);
      switch (tag[0]) 
      {
         case 'e':
         case 'p':
            a.title = tag[1];
            a.textContent = pretty(tag[1]);
            a.href = '#' + tag[0] + '-' + tag[1];
            if (tag[2]) a.setAttribute('data-relay', tag[2]);
            if (tag[3]) a.setAttribute('data-type', tag[0] +'-'+tag[3]);
            stylek([tag[1]], a); 
            break;
            
         case 'hashtag':
//            a.href = '#' + tag[1];
         default:
            a.textContent = tag[1];
      }
   }
   
   return a
}

function ash(tags, l) 
{
   const 
      nav = document.createElement('nav'),
      note = { 
         'e': [], // list of event ids
         'p': [], // list of pubkeys
         'nonce': [], // pow
         'hashtags': [], // #
         'custom': [], // else
         'ereply': false,
         'preply': false,
         'eroot': false,
         'proot': false,
         'nav': nav
      };
   
   nav.classList.add('tags');
   
   let nodes = nav.childNodes;
   
   if (tags.length > 0) 
   {
      tags.forEach(function(ot, i) 
      {
         let notekey = note[ot[0]];
         if (!notekey) notekey = note.custom;
         notekey.push(ot[1]);
         nav.append(taglink(ot, ''));
      });
      
      if (note.e.length > 0) 
      {
         note.ereply = tags.findIndex(el => el[1] === note.e[note.e.length - 1]);
         note.eroot = tags.findIndex(el => el[1] === note.e[0]);
         l.setAttribute('data-reply', 'e-' + note.e[note.e.length - 1]);
      }
            
      if (note.p.length > 0) 
      {
         note.preply = tags.findIndex(el => el[1] === note.p[note.p.length - 1]);
         note.proot = tags.findIndex(el => el[1] === note.p[0]);
      }
      
      if (note.nonce.length > 0) 
      {
         let nonce = l.dataset.nonce;
         l.setAttribute('data-nonce', note.nonce[0]);
      }
      
      nodes.forEach(function(li, i) 
      {
         if (i === note.eroot) li.classList.add('tag-e-root');
         if (i === note.proot) li.classList.add('tag-p-root');
         if (i === note.ereply) li.classList.add('tag-e-reply');
         if (i === note.preply) li.classList.add('tag-p-reply');
      });
   }
   
   return note
}


function mom(l) 
{ // parent events from reply to root
   for ( ; l && l !== document; l = l.parentNode ) 
   {
      if (l.classList.contains('event')) l.classList.add('mom')
	}
}

function log(text) 
{
   console.log(text);
//   const notice = document.createElement('li');
//   notice.textContent = text;
//   story.append(notice);
}

function orient(l) 
{ // rotates an element towards another, unused at the moment
   if (l) 
   {
      const to = document.querySelector('.was-interesting');
      
      if (to) 
      {
         const 
            rect = l.getBoundingClientRect(),
            center = window.getComputedStyle(l).transformOrigin,
            centers = center.split(" "),
            lx = rect.left + parseInt(centers[0]) - window.pageXOffset,
            ly = rect.top  + parseInt(centers[1]) - window.pageYOffset;
         const 
            torect = to.getBoundingClientRect(),
            tox = torect.left - window.pageXOffset,
            toy = torect.top - window.pageYOffset;
         const 
            radians = Math.atan2(tox - lx, toy - ly),
            degree = (radians * (180 / Math.PI) * -1) + 180;
         
         l.style.transform = "rotate("+degree+"deg)";
      
      } else { l.style.transform = "rotate(0)" }
   }
}

function not_interesting(l) 
{
   l.classList.remove('interesting');
   history.pushState('', document.title, location.pathname + location.search);
         
   const moms = document.querySelectorAll('.mom');
   moms.forEach(function(mom) { mom.classList.remove('mom') });
   
   document.body.classList.remove('k-e');
   session.removeItem('interesting');
   iot.placeholder = 'new post';
   
   return l
}

function is_interesting(l) 
{ 
   let interesting = document.getElementById('e-'+session.interesting);
   if (interesting) not_interesting(interesting);
   
   l.classList.add('interesting');   
   mom(l);
   document.body.classList.add('k-e');
   session.interesting = l.id.substring(2);   
   location.hash = '#' + l.id;
   iot.placeholder = 'reply to ' + l.querySelector('.author').textContent;
   
   return l
}


function scrollin(scrollp, l) 
{
   const h = l.scrollHeight - window.innerHeight;
   
   if (scrollp > 100) 
   {
      l.classList.add('scroll');
      if (scrollp > h - 100) l.classList.add('scrolled');
   
   } else  {  l.classList.remove('scroll') }
   
   if (scrollp < h - 150) l.classList.remove('scrolled');
   
}

let lscroll = 0, ticking = false;

window.addEventListener('scroll', function(e) 
{
   lscroll = window.scrollY;
   
   if (!ticking) 
   {
      window.requestAnimationFrame(function() 
      {
         scrollin(lscroll, document.body);
         ticking = false;
      });
      ticking = true;
   }
}, false);

function is(e)
{  // input handler event
   const 
      n = document.createTextNode(e.target.value.trim()), // 
      v = n.wholeText,
      a = v.split(' ');
   
   let 
      l,
      c = v.substr(-1);
   
   if (e.key === 'Enter') {
      // get the value of input and make it safer
      l = document.createElement('li'); // input history item
      l.append(n); // append input to history item
      
      console.log(v);

      // commands switch
      switch (a[0]) 
      {
         case '--h': // help
            l.dataset.tip = '" try dis tips fren:\n'
            +"{\n"
            +" --h : more halp soon™... \n"
            +" --bbbb : boom biddy bye bye \n"
            +" --d : toggle frens \n"
            +" --media : toggle autoloading media files \n"
            +" --read : make all interactions read again \n"
            // +" --e + space + event_id // load event \n"
            +" --k pubkey : login \n"
            // +" --p + space + pubkey // check profile \n"
            +"}";
            break;
         case '--bbbb': // boom biddy bye bye, 
            // destroys everything, 
            // or at least tries to..
            bbbb();
            break;
         case '--d': // toggle frens
            document.body.classList.toggle('ffs'); 
            break;
         case '--media':
            options.media = !options.media; 
            your.options = JSON.stringify(options);
            console.log('options:', options);
            break;
         case '--k':
            if (a[1]) {
               bbbb();
               your.k = a[1];
               start();
            }
         case '--read':
            let unread = document.querySelectorAll('.unread');
            if (unread.length > 0) unread.forEach(toggle_state);
            break;
         default: 
            prep(v)
      }
      iot.value = '';
   }
}

function more(e) 
{
   e.preventDefault();
   e.target.focus({ preventScroll: true });
   document.body.classList.add('mode-input');
}

function less(e) 
{
   document.body.classList.remove('mode-input');
   story.scrollTop = story.scrollHeight;
}

function arParams(str) 
{   
   const ar = str.split('?');
   if (ar[1]) {
      const params = new URLSearchParams(ar[1]);
      if (params) {
         ar.push(params);
      }
   }
   return ar
}

function replacer(url) 
{
   const 
      src = arParams(url),
      match = src[0],
      matchlow = match.toLowerCase();
   
   let rep = '';
   
   if (options.media) 
   {
      if ( matchlow.endsWith('.jpg') 
      || matchlow.endsWith('.jpeg') 
      || matchlow.endsWith('.png')
      || matchlow.endsWith('.gif')
      || matchlow.endsWith('.svg')) 
      { // images
         rep += '<img src="' + url + '" class="content-img" loading="lazy">';
         
      } else if ( matchlow.endsWith('.mp4'))
      { // videos
         let poster = false;
         if (src.length > 2 && src[2].get('poster')) poster = decodeURIComponent(src[2].get('poster'));
         
         rep += player(url, poster).outerHTML;
         
      } else { // regular links
         
         let ur = new URL(url);
         let domain = ur.hostname.split('.').reverse().splice(0,2).reverse().join('.');
         if (domain === 'youtube.com') { rep += yt(ur) } 
         else 
         {
            rep += '<a href="' + url 
            + '" class="content-link" target="_blank" rel="nofollow">' 
            + url + '</a>';
         }
   	}
   } else {
      rep += '<a href="' + url 
         + '" class="content-link" target="_blank" rel="nofollow">' 
         + url + '</a>';
   }
   return rep
}

function rgb(hex) 
{
   return parseInt(hex.substr(0, 2), 16)
   + ',' +parseInt(hex.substr(2, 2), 16)
   + ',' +parseInt(hex.substr(4, 2), 16)
}

function hex(k, separator) {
   // returns new 6 char hex from first 3 and last characters
   // used for item classes, color, etc
   const sep = separator ? separator : '';
   return k.substr(0, 3) + sep + k.substr(-3)
}

function pretty(k) 
{
   const bff = JSON.parse(your.getItem(k));
   let str = bff && bff.name ? bff.name : hex(k, '…');
   return str
}

function checkmentions(text) 
{
   const mentions = [];
   function mentionIndexes(l) 
   {
      const i = l.substr(2, l.length - 3)
      mentions.push(parseInt(i))
   }
   const matches = text.match(/\B#\[(\d+)\]\B/g);
   if (matches) matches.forEach(mentionIndexes);
      
   return mentions
}

function mentions(text, tags) 
{
   function nip8(_, index) 
   {
      return taglink(tags[index], 'mention').outerHTML;
   }
   
   return text.replace(/\B#\[(\d+)\]\B/g, nip8)
}

function ai(content, tags) 
{
   //URLs starting with http://, https://, or ftp://
   let patternA = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
   let re = content.replace(patternA, replacer);
   
   //URLs starting with www. (without // before it, or it'd re-link the ones done above)
   let patternB = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
   re = re.replace(patternB, replacer);
   
   re = mentions(re, tags);
   return re
}



function over(l) 
{
   // replacement for default :hover, 
   // to "better" handle touch devices
   
   // e.pointerType === 'mouse, pen, touch'
   
   // over functions

   function pointerenter(e) 
   {
      if (e.pointerType !== 'touch') 
      {
         if (l.classList.contains('event')) 
         {
            let oldtarget = e.target.closest('.event.over');
            if (oldtarget) oldtarget.classList.add('more-over');
            
            let newtarget = e.target.closest('.event');
            newtarget.classList.add('over');
            newtarget.classList.remove('more-over');
         
         } else 
         {
            e.target.classList.add('over');
            e.target.parentElement.classList.add('is-over')
         }
      
      } else { e.target.removeEventListener('pointerenter', pointerenter) }
   }
   
   function pointerleave(e) 
   {
      if (e.pointerType !== 'touch') 
      {
//         e.target.closest('.event').classList.add('over');
         if (l.classList.contains('event')) 
         {
            let target = e.target.closest('.event');
            if (target) 
            {
               target.classList.remove('over', 'more-over');
               let targetP = target.parentElement.closest('.event')
               if (targetP) 
               {
                  targetP.classList.remove('more-over');
               }
            }
         } else 
         {
            e.target.classList.remove('over');
            e.target.parentElement.classList.remove('is-over')
         }
      
      } else { e.target.removeEventListener('pointerleave', pointerleave) }
   }
   
   function touchstart(e) 
   {
   //   console.log('touch', e.target);
      e.target.classList.add('over');
      e.target.parentElement.classList.add('is-over');
   }
   
   function touchend(e) 
   {
      e.target.classList.remove('over');
      e.target.parentElement.classList.remove('is-over');
   }

   // not a touch, kinda
   if (l) {
      l.addEventListener('pointerenter', pointerenter, false);
      l.addEventListener('pointerleave', pointerleave, false);
      // touch
      l.addEventListener('touchstart', touchstart, false);   
      l.addEventListener('touchend', touchend, false);
   }
   
}

function verifyNIP05(fren, frend, pubkey)
{ //https://<domain>/.well-known/nostr.json?name=<local-part>
   const parts = frend.nip05.split('@');
   
   function checknip05(jsondata) 
   {
      if (pubkey === jsondata.names[parts[0]])
      {
         const name = fren.querySelector('.name');
         if (name) 
         {
            name.setAttribute('data-nip05', frend.nip05)
            fren.classList.add('nip05');
            
            if (frend.nip05.startsWith('_@')) name.classList.add('root');
         }
      }
   }
   
   if (parts.length > 1) 
   {
      fetch('https://'+parts[1]+'/.well-known/nostr.json?name='+parts[0])
      .then(response => { return response.json()})
      .then(jsondata => checknip05(jsondata));
   }
}

function timeSince(date) 
{
   let 
     seconds = Math.floor((new Date() - date) / 1000),
     interval = seconds / 31536000;
   
   if (interval > 1) return Math.floor(interval) + "Y";
   
   interval = seconds / 2592000;
   if (interval > 1) return Math.floor(interval) + "M";
   
   interval = seconds / 86400;
   if (interval > 1) return Math.floor(interval) + "d";
   
   interval = seconds / 3600;
   if (interval > 1) return Math.floor(interval) + "h";
   
   interval = seconds / 60;
   if (interval > 1) return Math.floor(interval) + "m";
   
   return Math.floor(seconds) + "s";
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
   
   let now = new Date();
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

function stylek(keys, l) 
{
   let style = '';
   keys.forEach(function(el, index) 
   {
      let c = '--';
      for (var i = 0; i < index + 1; i++) {
         c += 'c';
      }
      style += c + ':' + rgb(el.substr(0, 6)) + ';'
   })
   
   l.setAttribute('style', style)
}

function hide(k) 
{
   const notk = document.querySelectorAll('.event:not(.p-'+k+')');
   if (notk) { notk.forEach(function(l) { l.classList.add('hidden') })}
   document.body.scrollIntoView(stuff);
}

function unhide() 
{
   const hidden = document.querySelectorAll('.hidden');
   if (hidden) { hidden.forEach(function(l) { l.classList.remove('hidden') })}
   document.body.scrollIntoView(stuff);
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
   else if (id) { get_event(id) }
}

function select_p(k) 
{
   let dat = your[k] ? JSON.parse(your[k]) : false;
   
   if (!dat) 
   {
      get_pubkey(k);
   
   } else 
   {
      let l = document.getElementById('p-' + k);
      if (!l.classList.contains('bff')) 
      {
         update_fren(dat, k)
      } 
      
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
               toggle_state(e.target.parentElement);
            }
            
            select_e(e.target.getAttribute('href').substr(3));
            break;
         }
         if (e.target.classList.contains('follow-link'))
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
            toggle_state(e.target.parentElement);
            break;
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
         if (e.target.classList.contains('id')) {
            view_source(e.target);
         }
         break;
      case 'A':
         let href = e.target.getAttribute('href');
         switch (href.substr(1, 1)) 
         {
            case 'e':
               e.preventDefault();
               select_e(href.substr(3));
               break;
            case 'p':
               e.preventDefault();
               select_p(href.substr(3));
               break;
         }
         break;
      case 'BUTTON':
         view_source(e.target);
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
   const l = document.createElement('li'),
      p = document.createElement('p'),
      content = document.createElement('article');
      
   
   l.id = 'e-'+o.id;
   l.classList.add('event');
   l.classList.add('p-'+ o.pubkey);
   l.setAttribute('data-kind', o.kind);
   stylek([o.pubkey, o.id], l);
   
   p.classList.add('heading');
   p.innerHTML = '<span class="id">' + pretty(o.id) + '</span>';
   
   l.dataset.stamp = o.created_at;
   let created_at = make_time(o.created_at);
   
   content.classList.add('content');
//   const button = document.createElement('button');
//   button.classList.add('view-source');
//   button.textContent = '{:}';
//   l.append();
   
   over(l);

   l.append(p, created_at, content);
   
   return l
}

function lies(reply, l) 
{
   let replies = reply.querySelector('.replies');
   if (!replies) 
   {
      replies = document.createElement('ul');
      replies.classList.add('replies');
      reply.append(replies); 
   } 
   
   replies.append(l); 
   ordered(replies);

}



function raw_event(o) 
{
   l = document.createElement('dl');
   l.classList.add('raw');
   let content = '';
   Object.entries(o).forEach(([key, value]) =>
   {
      content += '<dt class="raw-' + key + '">' + key + '</dt>';
      
      let v = value;
      if (key === 'tags') {
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

function view_source(l) 
{
   let event = l.closest('.event');
   
   event.classList.toggle('view-source');
   
   let source, 
   childs = event.children;
   
   for (let i = 0; i < childs.length; i++) 
   {
     if (childs[i].classList.contains('source')) source = childs[i];
   }
   
   if (!source) {
      source = raw_event(JSON.parse(session[event.id.substr(2)]));
      source.classList.add('source');
      event.append(source);
   }
}

function follows_you(k) 
{
   let fu = document.getElementById('fu');
   if (!fu) {
      fu = document.createElement('ul');
      fu.id = 'fu';
      fu.classList.add('follows-u', 'section');
      fu.setAttribute('data-label', 'follows-u');
      let you = document.getElementById('p-' + your.k);
      if (!you) you = newpub(your.k);
      you.append(fu);
   }
   
   let followers = your.fu ? JSON.parse(your.fu) : [];
   if (!followers.find[k]) { 
      followers.push(k);
   }
   
   your.fu = JSON.stringify(followers);
   
   let already = fu.querySelector('.p-'+k);
   
   if (!already) {
      let l = document.createElement('li');
      l.classList.add('follow', 'section-item', 'p-'+k);
      stylek([k], l);
      
      let a = document.createElement('a');
      a.classList.add('follow-link', 'author');
      a.href = '#p-' + k;
      a.textContent = pretty(k);
      
      l.append(a);
      fu.append(l);
   }
   
   
}

function toggle_state(l) 
{
   let button_state = l.querySelector('button');
   let id = button_state.dataset.id;
   let inbox = JSON.parse(your.inbox);
   let state = inbox[id];
   let newstate = state === 'unread' ? 'read' : 'unread';

   inbox[id] = newstate;
   l.classList.remove(state);
   l.classList.add(newstate);
   your.inbox = JSON.stringify(inbox);
}

function make_time(timestamp) 
{
   let d = new Date(timestamp*1000);
   let l = document.createElement('time');
   
   l.classList.add('created-at');
   l.setAttribute('datetime', d.toISOString());
   l.setAttribute('data-timestamp', timestamp);
   l.title = d.toUTCString();
   l.textContent = timeSince(d);
   
   return l
}

function notifica(o) {
   
   
         
   let inbox = your.inbox ? JSON.parse(your.inbox) : {};
   if (!inbox[o.id]) inbox[o.id] = 'unread';
   
   let state = inbox[o.id];

   your.inbox = JSON.stringify(inbox);
      
   switch (o.kind) 
   {
//      case 1:
      case 4: kind4(o); break;
      case 3: follows_you(o.pubkey); break;
      default:
         
         let selector = '#p-' + o.pubkey + ' .interactions';
         let interactions = document.querySelector(selector);
         if (!interactions) interactions = newpub(o.pubkey).querySelector(selector);
         
         let already = document.querySelector(selector + ' .e-'+o.id);
         if (!already) {
            if (o.kind === 1) 
            {
               let follows = your.follows ? JSON.parse(your.follows) : false;
               if (follows && !follows.includes(o.pubkey))
               {
                  kind1(o)
               }
            }
            
            let 
               l = document.createElement('li'),
               text = ' replied in ';
            
            l.classList.add('interaction', 'section-item', state, 'e-'+o.id);
            l.setAttribute('data-kind', o.kind);
            stylek([o.pubkey,o.id], l);
            
            let id = document.createElement('a');
            id.classList.add('interaction-link');
            
            let target = o.id;
            id.textContent = pretty(o.id);
   
            let mentions = checkmentions(o.content);
            mentions.forEach(function(el) 
            {
               if (o.tags[el][1] === your.k) {
                  text = ' mentioned you in ';
               }
            });
            
            if (o.kind === 7) 
            {
               
               let ind = o.tags.findIndex(inde);
               
               function inde(x) {
                 return x[0] === 'e';
               }
               
               target = o.tags[ind][1];
               text = " liked ";
            }
            
            id.textContent = pretty(target);
            id.href = '#e-' + target;
            
            let created_at = make_time(o.created_at);
            
            l.innerHTML = pretty(o.pubkey) 
               + text 
               + id.outerHTML 
               + created_at.outerHTML;
            
            let button_state = document.createElement('button');
            button_state.classList.add('inbox-state');
            button_state.dataset.id = o.id;
            button_state.textContent = '[x]';
            
            l.append(button_state);
            interactions.prepend(l);
         }
         
         
   }
}

function get_orphans(id, l)
{
   let replies = document.querySelectorAll('[data-reply="e-'+id+'"]');
   if (replies && replies.length > 0) 
   {
      replies.forEach(function(reply) 
      {
         if (reply.classList.contains('orphan')) 
         {
            lies(l, reply);
            reply.classList.remove('orphan');
         }
      });
   }
}

function anykind(o) 
{
//   let 
//      anyknd = document.getElementById('anykind'),
//      l = defolt(o);
//      
//      anyknd.prepend(l);
   console.log(defolt(o));
}

function kind0(o) 
{ // NIP-01 set_metadata
   
   const dat = JSON.parse(o.content);
   dat.id = o.id;
   your[o.pubkey] = JSON.stringify(dat);

   update_fren(dat, o.pubkey);

}

function update_fren(dat, k)
{
   let fren = document.getElementById('p-'+k);
   if (!fren) fren = newpub(k);
   
   fren.classList.add('bff');
   const metadata = fren.querySelector('.metadata');

   if (dat.name) 
   {
      let name = fren.querySelector('.name');
      let petname = fren.querySelector('.petname');
      if (!name) 
      {
         name = document.createElement('h2');         
         name.classList.add('name');
         petname = document.createElement('span');
         petname.classList.add('petname');
         name.append(petname);
         metadata.append(name);
      }
	   
      petname.innerHTML = dat.name;
	   
      if (dat.nip05) verifyNIP05(fren, dat, k);
      
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
         
         if (k === your.k) 
         { // gets main profile img
            u.setAttribute('style', 'background-image: url('+dat.picture.split('?')[0]+')');
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
	   about.innerHTML = ai(dat.about);
	}
   
   update_k(k);
}

function update_k(k) 
{
   // see if there are already posts from pubkey and updates info
   let dat = your[k] ? JSON.parse(your[k]) : false;
   const existing = document.querySelectorAll('.p-' + k);
   existing.forEach(function(l) 
   {
      const author = l.querySelector('.author');
      if (dat && dat.picture && options.media) 
      {
         author.style = 'background-image: url('+arParams(dat.picture)[0]+')';
         author.classList.add('has-picture');
      }
      if (dat && dat.name) author.textContent = dat.name;
   });
}

function ordered(room) 
{
   [...room.children]
   .sort( (a,b) => a.dataset.stamp < b.dataset.stamp ? 1 : -1 )
   .forEach(node => room.appendChild(node));
}


function kind1(o) 
{ // NIP--1 text_note
   let 
      l = document.getElementById('e-'+o.id),
      fren = document.getElementById('p-' + o.pubkey),
      tags;
   
   if (!l ) 
   { 
      l = newid(o);
         
      if (!fren) fren = newpub(o.pubkey);
      
      const 
         heading = l.querySelector('.heading'),
         content = l.querySelector('.content');
   
      tags = ash(o.tags, l);
      
      heading.append(tags.nav);
      
      let replyid = false, rootid = false;
      if (tags.ereply !== false) 
      {
         // if it's a reply, check if we already have it
         replyid = o.tags[tags.ereply][1];
         let reply = document.getElementById('e-'+ replyid);
   
         if (reply) 
         { // we have the reply event
            lies(reply, l);
            replyid = false;
         
         } else 
         { // no reply, check for root event so at least it nests in the right thread
            
            l.classList.add('orphan');
            
            rootid = o.tags[tags.eroot][1];
            let root = document.getElementById('e-'+ rootid);
            
            if (root) { lies(root, l) } 
            else { knd1.prepend(l), ordered(knd1) }
         }
   
      } else { knd1.prepend(l), ordered(knd1) }   
      
      
      
      get_orphans(o.id, l);
      
      
      const dat = JSON.parse(your.getItem(o.pubkey));
      
      
      
      let author = document.createElement('a');
      author.classList.add('author');
      author.rel = 'author';
      author.href = '#p-' + o.pubkey;
      stylek([o.pubkey], author);
      author.textContent = dat && dat.name ? dat.name : pretty(o.pubkey);
      
      if (options.media && dat && dat.picture) 
      {          
         author.style = 'background-image: url('+dat.picture+')';
         author.classList.add('has-picture');
      }
      
      if (!dat) l.classList.add('new');
      
      heading.prepend(author);
      
      const 
         oc = document.createTextNode(o.content),
         ocd = oc.wholeText,
         odc = document.createElement('p');
      
      odc.innerHTML = ai(ocd, o.tags);
   
      content.append(odc);
      
      let media = content.querySelector('img, video, audio, iframe');
      if (media) 
      { 
         content.classList.add('has-media');
         let videos = content.querySelectorAll('video');
         if (videos) videos.forEach(rap);
      }
      const knd0 = document.getElementById('kind-0');
      knd0.prepend(fren);
      
      if (replyid && session[replyid]) kind1(JSON.parse(session[replyid]));
   
   } 
}


let pubcrawl = [], counts = {};
function crawl()
{ // make a list of all your follows and their follows and count them
   pubcrawl.forEach(function(pub) 
   {
      if (counts[pub]) {
         counts[pub] = counts[pub] + 1;
      } else {
         counts[pub] = 1;
      }
   
   });
   
   let sortable = [];
   for (var pub in counts) {
      sortable.push([pub, counts[pub]]);
   }

   sortable.sort(function(a, b) {
      return a[1] - b[1];
   });
   
   return sortable;
}

function kind3(o) 
{ // NIP-02 Contact List and Petnames (& relays)
   if (o.pubkey === your.k) your.r = o.content;
   
   let fren = document.getElementById('p-' + o.pubkey);
   if (!fren) fren = newpub(o.pubkey);   
   
   if (o.tags.length > 0) 
   {
      let follows = fren.querySelector('.follows');
      follows.innerHTML = '';
      let subscriptions = o.pubkey === your.k ? [] : false;
      o.tags.forEach(function(ot) 
      { 
         if (subscriptions) subscriptions.push(ot[1]);
         pubcrawl.push(ot[1]);
         
         const 
            f = document.createElement('li'),
            a = document.createElement('a');
         
         f.classList.add('follow', 'section-item');
         
         a.setAttribute('href', '#p-' + ot[1]);
         a.classList.add('follow-link');
         a.textContent = pretty(ot[1]);
         
         f.append(a);
         stylek([ot[1]], f);
         follows.append(f);
      });

      build_relays(o.content, fren);
      
      if (subscriptions) 
      {
         your.follows = JSON.stringify(subscriptions);
         
         ws.forEach(function(r) {
            if (r.readyState === 1) {
               yourfollows(r);
            }
         });
         
      }                                    
   }
}



function kind4(o) 
{ // NIP-04: Encrypted Direct Message
   let own = o.tags[0][1] !== your.k;
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
   }
}



function bbbb()
{// boom biddy bye bye
 // tries to forget everything
   your.clear(); // localStorage
   session.clear(); // SessionStorage
   document.getElementById('kind-0').innerHTML = ''; // contacts
   document.getElementById('kind-1').innerHTML = ''; // timeline
   story.innerHTML = ''; // input history
   iot.placeholder = 'boom biddy bye bye'; // so you know what happened
   u.setAttribute('src', u.dataset.src);
   document.body.classList.remove('ffs', 'has-k', 'k-e', 'k-p');
}

/* request

{
  "ids": <a list of event ids or prefixes>,
  "authors": <a list of pubkeys or prefixes, the pubkey of an event must be one of these>,
  "kinds": <a list of a kind numbers>,
  "#e": <a list of event ids that are referenced in an "e" tag>,
  "#p": <a list of pubkeys that are referenced in a "p" tag>,
  "since": <a timestamp, events must be newer than this to pass>,
  "until": <a timestamp, events must be older than this to pass>,
  "limit": <maximum number of events to be returned in the initial query>
}

*/

function open(e) 
{
   console.log(e.target);

   e.target.send('["REQ", "aa-you", {'
   + '"authors":["'
   + your.k.substring(0, 16)
   + '"]'
   //               + t ? ',"since":'+ t : ''
   + '}]');
   
   e.target.send('["REQ", "aa-notifications", {"#p":["' 
      + your.k + '"]'
   //            + t ? ',"since":'+t : ''
   + '}]');
      
   relaytion(e.target)
}

function close(e) 
{ 
   console.log('closed', e);
   
   let wsc = ws_closed[e.target.url] ? ws_closed[e.target.url] : [];
   
   const index = ws.indexOf(e.target);
   
   if (index > -1) {
     wsc.unshift(e.timeStamp);
     ws.splice(index, 1);
   }
   
   ws_closed[e.target.url] = wsc;
   console.log(wsc);
   
   // reconnect if somewhat stable
   if (wsc[1] && wsc[0] - wsc[1] > 99999) {
      connect(e.target.url);
   } else {
      // handle this later
   }

}

function connect(url) 
{
   r = new WebSocket(url);
   r.addEventListener('open', open); 
   r.addEventListener('message', message);
   r.addEventListener('close', close);
   ws.push(r);
}

function message(e) 
{
   const 
      type = JSON.parse(e.data)[0], // the message type
      dis = JSON.parse(e.data)[1], // the request id
      dat = JSON.parse(e.data)[2]; // the event data
   
   if (type !== 'EVENT') 
   {
      console.log(type, dis);
   }
   
   if (dis && dat) 
   {
      session[dat.id] = JSON.stringify(dat);
      
      if ( !your.t || your.t < dat.created_at) your.t = dat.created_at;
      
      switch (dis) {
         case 'aa-you':
            switch (dat.kind) 
            {
               case 0: kind0(dat); break;
               case 3: kind3(dat); break;
               case 4: kind4(dat); break;
               default: //anykind(dat); 
            }
            break;
         case 'aa-notifications':
            notifica(dat); 
            break;
         case 'aa-inspect':
            switch (dat.kind) 
            {
               case 0: 
                  kind0(dat); 
                  break;
               case 1: 
                  kind1(dat);
                  break;
               case 3: 
                  kind3(dat); 
                  break;
               default: //anykind(dat); 
            }
            
         default: // aa-feed
            switch (dat.kind) 
            {
               case 0: 
                  kind0(dat); 
                  break;
               case 1: kind1(dat); break;
               case 3: kind3(dat); break;
               default: //anykind(dat); 
            }
      }
   }
}

function status(e) 
{
   relaytion(ws[0]) 
}

function get_event(id) 
{
   ws.forEach(function(r) {
      if (r.readyState === 1 && !session[id]) {
         r.send('["REQ", "aa-inspect", {"ids":["'+id+'"]}]');
      }
   });
   
   setTimeout(function () 
   {
      if (session[id]) select_e(id);
      else log('event not found: ' + id);
      
   }, 1000)
}

function get_pubkey(pubkey) 
{
   ws.forEach(function(r) {
      if (r.readyState === 1 && !your[pubkey]) {
         r.send('["REQ", "aa-inspect", {"authors":["'+pubkey+'"], "kinds":[0, 3]}]');
      }
   });
   
   setTimeout(function () 
   {
      if (your[pubkey]) select_p(pubkey);
      else log('pubkey not found: ' + pubkey);
   
   }, 1000)
}

function yourfollows(r) 
{ 
   let subs = '["' + your.k + '",' + your.follows.substr(1);
   const lastweek = new Date();
   lastweek.setDate(lastweek.getDate() - 3); // fetch kind1 from last x days
   
   r.send('["REQ", "aa-dis", {"kinds":[0, 3], "authors":'+ your.follows + '}]');
   r.send('["REQ", "aa-feed", {"kinds":[1], "authors":'+ subs +', "since":'+ Math.floor(lastweek.getTime()/1000) +'}]');

}

function print_event(o) 
{
   console.log(o);
}

function start() {
         
   let k = your.getItem('k');
   if (k) {
      iot.value = '';
      iot.placeholder = 'new post';
         
      document.body.classList.add('has-k');         
      
      Object.entries(relays).forEach(([url, can]) => 
      {
         if (can.read && can.write) connect(url);
      });
            
      idea.addEventListener('click', status, false);
      
      if (window.nostr) 
      { // nos2x
         console.log('nos2x available');
         /*
         window.nostr.getPublicKey(); //: string // returns your public key as hex
         window.nostr.signEvent(event): Event // returns the full event object signed
         window.nostr.getRelays(): { [url: string]: RelayPolicy } // returns a map of relays
         window.nostr.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
         window.nostr.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
         */
         
      }
   } else 
   {
      if (window.nostr) 
      {
         window.nostr.getPublicKey().then( key => 
         {
            your.k = key;
            start();
         });
      }
   }   
}
   
function relaytion(ship) 
{// updates id a with the connection status
/* 
   0	CONNECTING	Socket has been created. The connection is not yet open.
   1	OPEN	The connection is open and ready to communicate.
   2	CLOSING	The connection is in the process of closing.
   3	CLOSED	The connection is closed or couldn't be opened.*/
   
   idea.dataset.status = ship.url.substr(6);
   idea.textContent = new Date().toUTCString() + ' [' + ship.readyState + ']';
}

function build_relays(relays, l) 
{
   let rr = JSON.parse(relays);
   let r = l.querySelector('.relays');
   
   if (!r) 
   {
      r = document.createElement('ul');
      r.classList.add('relays', 'section');
      r.setAttribute('data-label', 'relays');
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
                  
                  } else if (ot[3] && ot[3] === 'root') 
                  {
                     eroot = ot[1];
                  
                  } else 
                  {
                     es.push(ot);
                  }
                   
                  break;
               case 'p': 
                  if (ot[3] && ot[3] === 'reply') 
                  {
                     preply = ot[1];
                  
                  } else if (ot[3] && ot[3] === 'root') 
                  {
                     proot = ot[1];
                  
                  } else 
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
   
   } else if (ereply) 
   {
      tags.push(['e', ereply,'','root']);
   }
   
   tags.push(['e', o.id,'','reply']);
   
   if (proot) 
   {
      tags.push(['p', proot,'','root']);
   
   } else 
   {
      if (preply) 
      {
         tags.push(['p', preply,'','root']);
      
      } else {
         if (ps.length > 0) {
            tags.push(['p', ps[0][1],'','root']);
         }
      }
   }
   
   if (o.pubkey !== your.k) tags.push(['p',o.pubkey,'','reply']);

   return tags
}



function prep(note)
{
   const now = Math.floor( ( new Date().getTime() ) / 1000 );
   const tags = session.interesting ? preptags(JSON.parse(session[session.interesting])) : [];
   const draft = [ 
      0,
      your.getItem('k'),
      now,
      1,
      tags,
      note
   ];
   
   session.draft = JSON.stringify(draft);
   sign(draft);
}

function sign(draft) 
{
   const hash = bitcoinjs.crypto.sha256( session.draft ).toString( 'hex' );
   const note = JSON.parse(session.draft);
   const unsigned = {
      "id": hash,
      "pubkey": draft[1],
      "created_at": draft[2],
      "kind": draft[3],
      "tags": draft[4],
      "content": draft[5]
   }
         
   if (window.nostr) 
   {
      window.nostr.signEvent(unsigned).then((signed) => 
      {
         session.post = JSON.stringify(signed);
         post(session.post);
      });
   
   } else { console.log('you need nos2x to sign notes', unsigned) }

}

function post(note) 
{ 
   ws.forEach(function(r) {
      if (r.readyState === 1) {
         r.send( '["EVENT",' + note + ']' );
      }
   });
}

function hashchange(e) 
{  
   let hash = location.hash;
   let search = hash ? arParams(hash) : arParams(location.search);
   
   console.log(location);
   
   if (search[0] !== '') {
      console.log(search);
      switch (search[0].substr(1, 1)) {
         case 'e':
            select_e(search[0].substr(3));
            break;
         case 'p':
            select_p(search[0].substr(3))
            break;
         default:
      }
   }     
}

window.addEventListener('load', function(event) {
   
   over(story);
   if (location.hash) {
      setTimeout(hashchange, 2000);
   }
   
   knd1.addEventListener('click', clickEvent, false);
   u.addEventListener('click', function(e) { select_p(your.k) }, false);
   iot.addEventListener('blur', less, false);
   iot.addEventListener('keyup', is, false);
   iot.addEventListener('focus', more, false);
   
   // get all the the elements for tog()
   const togs = document.querySelectorAll('[data-tog]');
   togs.forEach(function(l) { l.addEventListener('click', function(e) { tog(e,l); }, false); });	
   
   start();

}, false);