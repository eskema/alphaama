const 
yours = window.localStorage,
page = document.body,
session = window.sessionStorage,
idea = document.getElementById('a'), 
dlist = document.getElementById('list'),
put = document.getElementById('iot'),
cleet = document.getElementById('e'),
feed = document.getElementById('sea'),
fool = document.getElementById('foo'),
sec = document.getElementById('sec'),
u = document.getElementById('u');

session.removeItem('interesting');

function orIs(it) 
{// let's find out
   const interesting = document.querySelector('.interesting');
   select(it, interesting ? interesting : idea);
} cleet.addEventListener('click', orIs);

function pause(video) 
{ 
   video.pause();
   video.classList.remove('playin');
}

function play(video) 
{
   let playin = document.querySelector('.playin');
   if (playin) {
      pause(video);
   } else {
      video.play();
      video.classList.add('started','playin');
   }
}
	        
function vip(e) 
{ // o cão do Marinho
   if (e.target.paused) {
      play(e.target);
   } else pause(e.target);
}

function rewind(e) 
{
   const container = e.target.parentElement,
   video = container.querySelector('video');
   video.currentTime = 0;
}

function player(src, poster)
{  
   const rapper = document.createElement('figure'),
   video = document.createElement('video'),
   controls = document.createElement('figcaption'),
   url = document.createElement('span'),
   progress = document.createElement('progress');

   let postr = poster ? poster : '';
   if (postr) video.setAttribute('poster', postr);
   
   video.setAttribute('loop', '');
   video.setAttribute('playsinline', '');
   video.setAttribute('preload', 'metadata');  
   video.classList.add('content-video');
   video.setAttribute('src', src); 
   
   rapper.classList.add('yo');
      
   url.classList.add('vhs'); url.innerHTML = src;
   
   progress.innerHTML = '0% played',
   progress.setAttribute('min', 0),
   progress.setAttribute('max', 100),
   progress.setAttribute('value', 0),
   
   controls.append(url); controls.append(progress);      

   rapper.prepend(video); rapper.append(controls);
   
   return rapper;
}

function rap(video)
{
   let controls = video.nextSibling;
   let progress = controls.querySelector('progress');
   
   video.addEventListener('click', vip);
   controls.addEventListener('click', rewind);
   
   video.addEventListener('timeupdate', function(e) {
      
      const percentage = Math.floor((100 / this.duration) * this.currentTime);
      
      controls.dataset.elapsed = Math.ceil(this.currentTime);
      controls.dataset.remains = Math.round(this.duration - this.currentTime);
      controls.dataset.duration = Math.floor(this.duration);
      
      progress.value = percentage;
      progress.style.width = percentage + '%';
      progress.innerHTML = percentage + '%';
      
   });
   video.addEventListener('loadedmetadata', function(event) {
      controls.dataset.duration = Math.ceil(video.duration);
   });
   
   over(video); over(controls);
}

function yt(url) {
// fuck youtube but here it is anyway
   return '<figure class="yt"><iframe src="https://www.youtube.com/embed/'+url.searchParams.get('v') + '" title="yt" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>'
}

function tag(spray,can) 
{
   // spray is an event, can is an element
   // on event add/remove classes to elements
   spray.preventDefault();
   
   const 
   tag = can.getAttribute('data-tag'), 
   it = can.getAttribute('data-it'),
   ac = can.getAttribute('aria-controls');
   
   let 
   piece = document.querySelector(it),
   wall = ac ? document.getElementById(ac) : false;
   
   if (it) {
           if (it === '_self') piece = can;
      else if (it === '_parent') piece = can.parentNode;
      else if (!piece) piece = page;
      
      if (piece.classList.contains(tag)) { 
         
         piece.classList.remove(tag);
         if (wall) wall.setAttribute('aria-expanded','false');
         
      } else {
         
         if (can.classList.contains('tag1')) document.querySelector('.'+tag).classList.remove(tag);
         piece.classList.add(tag);
         
      }
	} else { 
      if (tag) {
         page.classList.toggle(tag);
         if (wall && wall.getAttribute('aria-expanded') == 'false') {
            wall.setAttribute('aria-expanded','true');
         } else if (wall) wall.setAttribute('aria-expanded','false');
      } 
   }			
}

function orient(l) 
{ // element, elem, el, l
   if (l) {
      const to = document.querySelector('.interesting');
      if (to) {
         const lrect = l.getBoundingClientRect(),
            lcenter = window.getComputedStyle(l).transformOrigin,
            lcenters = lcenter.split(" "),
            lx = lrect.left + parseInt(lcenters[0]) - window.pageXOffset,
            ly = lrect.top  + parseInt(lcenters[1]) - window.pageYOffset;
         const torect = to.getBoundingClientRect(),
            tox = torect.left - window.pageXOffset,
            toy = torect.top - window.pageYOffset;
         const radians = Math.atan2(tox - lx, toy - ly);
         const degree = (radians * (180 / Math.PI) * -1) + 180;
         l.style.transform = "rotate("+degree+"deg)";
      } else {
         l.style.transform = "rotate(0)";
      }
   }
}

function select(e,l) 
{ // opens / close an article on event
   e.preventDefault();
   
   if (typeof l === 'string') {
      l = document.getElementById(l);
   } 
   
   let interesting = document.querySelector('.interesting'),
   stuff = { behavior:'smooth', block: 'start'};
      
   let it;
   
   if (e.target.id === "e") { 
      // cleet click
      if (interesting) it = interesting.querySelector('.marker');
      else {
         if (page.classList.contains('scroll')) it = idea; // if scrolled, go to top
         else it = sec;	// go to bottom
      }
      
   } else {
      if (l) {
         if (l.classList.contains('interesting')) {
            
            l.classList.remove('interesting');
            page.classList.remove('k-is-s');
            it = l;
            session.removeItem('interesting');
            put.placeholder = 'new post';
            
         } else {
            
            if (interesting) interesting.classList.remove('interesting');
            
            l.classList.add('interesting');
            page.classList.add('k-is-s');
            it = l.querySelector('.marker');
            session.interesting = l.id.substring(2);         
            const last = document.querySelector('.last');
            if (last) last.classList.remove('last');
            put.placeholder = 'reply to ' + l.querySelector('figcaption').textContent;
            
         } l.classList.add('last');
      }
      
   } 
   
   if (it) it.scrollIntoView(stuff);
   else {
      let notice = document.createElement('li');
      notice.textContent = 'event not found'
      fool.append(notice);
   }
   
   
   
}

function scrollin(scrollp, l) 
{
   const h = l.scrollHeight - window.innerHeight;
   
   if (scrollp > 20) l.classList.add('scroll');
   else if (scrollp < 20) l.classList.remove('scroll');
   
   if (scrollp > h - 100) l.classList.add('scrolled');
   else if (scrollp < h - 150) l.classList.remove('scrolled');
   
   orient(cleet);
}

let lscroll = 0, ticking = false;

window.addEventListener('scroll', function(e) {
   lscroll = window.scrollY;
   if (!ticking) {
      window.requestAnimationFrame(function() {
         scrollin(lscroll, page);
         ticking = false;
      });
      ticking = true;
   }
});

//let kp = [], foolast = 0;

function is(e)
{ // input handler event
   let l;
   
   if (e.key === 'Enter') {
      
      // get the value of input and make it safer
      const 
      n = document.createTextNode(e.target.value),
      v = n.wholeText,
      l = document.createElement('li'); // input history item
            
      l.append(n); // append input to history item
      let clear = false;
      
      // commands switch
      switch (v) {
         case '--h': // help
            l.dataset.tip = '" try dis tips fren:\n'
            +"{\n"
            +" --h : more halp soon™... \n"
            +" --bbbb : boom biddy bye bye \n"
            +" --d : toggle frens \n"
            // +" --e + space + event_id // load event \n"
            +" --k pubkey : u c that key \n"
            // +" --p + space + pubkey // check profile \n"
            +" --x : clears input history \n"
            +"}";
            break;
         case '--bbbb': // boom biddy bye bye, 
            // destroys everything, 
            // or at least tries to..
            bbbb();
            clear = true; // don't append this to history
            break;
         case '--d': // toggle frens
            page.classList.toggle('push'); 
            break;
         case '--x':
            if (!yours.x) yours.setItem('x', 'clear input history');
            fool.innerHTML = '';
            put.placeholder = 'new post';
            clear = true;
            break;
         default: console.log(v.substring(0,3));
            
            if (v.substring(0,3) === "--k") {
               bbbb();
               yours.setItem('k', v.substring(4));
               start();
               clear = true;
               
            // } else if (v.substring(0,3) === "--p") {
               // const p = v.substring(4);
               // l.dataset.tip = '"p, ' + p;
               
            } else {
//               l.dataset.tip = '" => nope(try: "--h")';
               
               signnote(prepnote(v));
            }
            
      }
         		
      if (!clear) { // append input to history
      	fool.append(l);
         fool.scrollTop = fool.scrollHeight; 
      }
      
      put.value = '';
   }
   
// to interpret what you want before enter return
// i.e. handle mentions, etc..
// if (v.length > 0) {
// 	fool.dataset.log = v;
// }
   
// get value of history, key up/down
//   if (e.key === 'ArrowUp') {
//      if (fool.childNodes.length) { }
//   }
//   
//   if (e.key === 'ArrowDown') { }
   
}

function more(e) 
{
   e.preventDefault();
   e.target.focus({ preventScroll: true });
   page.classList.add('cow-mit');
}

function less(e) 
{
   page.classList.remove('cow-mit');
   fool.scrollTop = fool.scrollHeight;
}

put.addEventListener('blur', less);
put.addEventListener('keyup', is);
put.addEventListener('focus', more);

function arParams(str) 
{   
   const ar = str.split('?');
   if (ar[1]) {
      const params = new URLSearchParams(ar[1]);
      if (params) {
         ar.push(params);
      }
   }
   return ar;
}

function replacer(url) 
{
   let src = arParams(url);
   let match = src[0];
   let rep = '';
   //	const sw = match.startsWith('');
   
   if ( match.endsWith('.jpg') 
     || match.endsWith('.jpeg') 
     || match.endsWith('.png')
     || match.endsWith('.gif')
     || match.endsWith('.svg')) { // images
   	
      rep += '<img src="' + url + '" class="content-img">';
      
   } else if ( match.endsWith('.mp4')){ // videos
      
      let poster = false;
      if (src.length > 2 && src[2].get('poster')) {
         poster = decodeURIComponent(src[2].get('poster'));
      }
      
      rep += player(url, poster).outerHTML;
      
   } else { // regular links
      
      const ur = new URL(url);
      let domain = ur.hostname.split('.').reverse().splice(0,2).reverse().join('.');
      if (domain === 'youtube.com') { 
         rep += yt(ur);
      } else {
         rep += '<a href="' + url 
         + '" class="content-link" target="_blank" rel="nofollow">' + url 
         + '</a>';
      }
	}
   return rep
}

function ai(content) 
{
   //URLs starting with http://, https://, or ftp://
   let patternA = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
   let re = content.replace(patternA, replacer);
   
   //URLs starting with www. (without // before it, or it'd re-link the ones done above)
   let patternB = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
   re = re.replace(patternB, replacer);
   
   // Change email addresses to mailto:: links
   // let patternC = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;
   // re = re.replace(patternC, '<a class="content-mail" href="mailto:$1">$1</a>');
   
   return re
}

function over(l) 
{
   // replacement for default :hover, 
   // to "better" handle touch devices
   
   // e.pointerType === 'mouse, pen, touch'
   
   function pointerenter(e) 
   {
      if (e.pointerType !== 'touch') {
         l.classList.add('over');
         l.parentElement.classList.add('is-over');
      } else l.removeEventListener('pointerenter', pointerenter);
   }
   
   function pointerleave(e) 
   {
      if (e.pointerType !== 'touch') {
         l.classList.remove('over');
         l.parentElement.classList.remove('is-over');
      } else l.removeEventListener('pointerleave', pointerleave);
   }
   
   function touchstart(e) 
   {
      l.classList.add('over');
      l.parentElement.classList.add('is-over');
   }
   
   function touchend(e) 
   {
      l.classList.remove('over');
      l.parentElement.classList.remove('is-over');
   }
   
   // not a touch, kinda
   l.addEventListener('pointerenter', pointerenter);
   l.addEventListener('pointerleave', pointerleave);
   // touch
   l.addEventListener('touchstart', touchstart);   
   l.addEventListener('touchend', touchend);
}

/* 

nostr event
{
  "id": "80de8c99a4cf4453268e9f0d2beba95664658d8470957dee3a3f29d3b237e0ea",
  "pubkey": "5c6c25b7ef18d8633e97512159954e1aa22809c6b763e94b9f91071836d00217",
  "created_at": 1648529895,
  "kind": 1,
  "tags": [],
  "content": "🪄🍽 Voilà. Your dishes are squeaky clean now.",
  "sig": "3c26dbc1269b353e8e56bad9646ac6406d773c6f86d61a18472d94546d06769ff0b7e59da2edba7e3393fff7df6f4d6ebc21114480c971a3e35b2ee4c76896cd"
}

*/

function anykind(o) 
{
//   console.log(o);
//   session.setItem(o.id, JSON.stringify(o));
}

function kind0(o) 
{ // NIP-01 set_metadata
   
   yours.setItem(o.pubkey, o.content);
   let fren;
   const bff = document.getElementById('p-'+o.pubkey),
   frend = JSON.parse(o.content),
   pubkey = document.createElement('p');
   
   if (bff) { 
      fren = bff;
      fren.innerHTML = '';
   } else {
      fren = document.createElement('li');
      fren.id = 'p-' + o.pubkey;
      fren.classList.add('fren');    
      over(fren);
      dlist.append(fren);    
   }
   
   pubkey.classList.add('pubkey');
   pubkey.innerHTML = o.pubkey;
   fren.append(pubkey);
	
   if (frend.name) {
	   const name = document.createElement('h2');
	   name.classList.add('name');
	   name.innerHTML = frend.name;
	   fren.append(name);
      
      if (frend.nip05) {
         name.setAttribute('data-nip05', frend.nip05)
         if (frend['nip05'].startsWith('_@')) {
            name.classList.add('root');
         }
      }
	}
   
   if (frend.picture) {
      let src = arParams(frend.picture);
      const picture = document.createElement('img');
      picture.setAttribute('src', src[0]);
      picture.classList.add('picture');
      fren.append(picture);
      
      if (src.length > 2) { // there's parameters
         let srcl = src[2].get('logo'); // let c if it is a logo
         if (srcl) { // it is
            // let's build it
            const logo = document.createElement('img');
            logo.classList.add('logo');
            logo.setAttribute('src', decodeURIComponent(srcl));
            fren.append(logo);
         }
      }
      
      if (o.pubkey == yours.getItem('k')) { // gets main profile img
         u.setAttribute('src', frend.picture.split('?')[0]);
      }
   }
   
	if (frend.about) {
	   const about = document.createElement('p');
	   about.classList.add('about');
	   about.innerHTML = ai(frend.about);
	   fren.append(about);
	}
   
   // see if there are already posts from pubkey and updates figure
   const upd = document.querySelectorAll('.p-'+o.pubkey+'');
   upd.forEach(function(l) {
      if (frend.picture) {
         l.querySelector('.d-fig img').src = arParams(frend.picture)[0];
      } if (frend.name) {
         l.querySelector('.d-fig figcaption').innerHTML = frend.name;
      }
   });
}

function kind1(o) 
{ // NIP-01 text_note

   const bff = document.getElementById('p-'+o.pubkey);
   
   if(bff) {
      bff.parentElement.prepend(bff);
      bff.setAttribute('aa-last', 'e-'+o.id);
      bff.addEventListener('click', function(e) {
         if (page.classList.contains('push')) {
            
         } else {
          select(e, document.getElementById('e-'+o.id));
         }
      });
   }
   
   let 
   l = document.getElementById('e-'+o.id),
   reply = false,
   tags;
   
   if (l) {
      let 
      figure = l.querySelector('.d-fig'),
         img = figure.querySelector('img'),
         caption = figure.querySelector('figcaption'),
      marker = l.querySelector('.marker'),
      article = l.querySelector('article'),
      raw = l.querySelector('.e');
   
   } else {
      l = document.createElement('li');
      
      figure = document.createElement('figure'),
         img = document.createElement('img'),
         caption = document.createElement('figcaption'),
      marker = document.createElement('span'),
      article = document.createElement('article'),
      raw = document.createElement('ul');
      
      figure.classList.add('d-fig');
      raw.classList.add('e');
      marker.classList.add('marker');
      l.classList.add('event');
      l.id = 'e-'+o.id;
      l.setAttribute('data-kind', o.kind);
      figure.classList.add('p-'+o.pubkey);
      figure.append(img, caption);
      
      figure.addEventListener('click', function(e) { select(e, l) });
      
      over(figure);
      
      if (o.tags.length > 0) {
         
         tags = document.createElement('li');
         tags.dataset.raw = 'tags';
         
         let es = [];
         
         o.tags.forEach(function(ot) {
            
            let t = document.createElement('a');
            t.classList.add('tag');
            t.href = '#' + ot[0] + '-' + ot[1];
            t.innerHTML = ot;
            tags.append(t);
            
            if (ot[0] === 'e') es.push(ot);
            if (ot[0] === 'nounce') caption.dataset.nounce = ot[1]
            
         });
         
         if (es.length > 0) {
            l.classList.add('re');
            reply = es[es.length - 1][1];
         }
         
      };
      
      l.append(figure, marker, article, raw);
      
      if (reply) {
         l.setAttribute('data-re', reply)
         let rep = document.getElementById('e-'+reply);   		
         if (rep) {
         	let lies = rep.querySelector('.replies');
            if (!lies) {
         	   lies = document.createElement('ul');
         	   lies.classList.add('replies');
         	   rep.append(lies);
         	} lies.append(l); 
         } else feed.prepend(l);
      } else feed.prepend(l);
   }
   
   const dat = JSON.parse(yours.getItem(o.pubkey));
   if (dat) { img.src = dat.picture ? dat.picture : 'r/aa--u.png';
      caption.innerHTML = dat.name ? dat.name : o.pubkey;
   } else { img.src = 'r/aa--u.png';
      caption.innerHTML = o.pubkey;
      figure.classList.add('new');
   }
   
   const 
   oc = document.createTextNode(o.content),
   ocd = oc.wholeText;
   article.innerHTML = '<p>' + ai(ocd) + '</p>';
   
   let media = article.querySelector('img, video, audio, iframe');
   if (media) { article.classList.add('has-media');
      let videos = article.querySelectorAll('video');
      if (videos) {
         videos.forEach(rap);
      }
   }
   
   let s = '';
   s += '<li data-raw="id"><a href="?e=' + o.id + '">' + o.id + '</a></li> ';
   s += '<li data-raw="pubkey"><a href="?p=' + o.pubkey + '">' + o.pubkey + '</a></li> ';
   s += '<li data-raw="sig">' + o.sig + '</li> ';
   s += '<li data-raw="kind">' + o.kind + '</li> ';
   s += tags ? tags .outerHTML : '<li data-raw="tags">-</li>';
   s += '<li data-raw="created_at"><time datetime="' + o.created_at + '">' + new Date(o.created_at*1000).toUTCString() + '</time></li> ';
   raw.innerHTML = s; 
   
   const taglinks = raw.querySelectorAll('.tag');
   taglinks.forEach(function(l) {
      l.addEventListener('click', function(e) {
         if (l.getAttribute('href')[1] === 'e') {
            select(e, document.getElementById(l.getAttribute('href').substring(1)));
         } else {
            e.preventDefault();
            let notice = document.createElement('li');
            notice.textContent = 'not working yet'
            fool.append(notice);
         }
      });
   });
}

function kind3(o) 
{ // NIP-02 Contact List and Petnames
   
   if (o.tags.length > 0) {
      o.tags.forEach(function(ot) {
         authors.push(ot[1]);
      });
   }
   // update profiles
   we.send('["REQ", "aa-dis", {"kinds":[0], "authors":'+ JSON.stringify(authors) +'}]');
   
   const lastweek = new Date();
   lastweek.setDate(lastweek.getDate() - 9); // fetch feed from last x days
   
   we.send('["REQ", "aa-feed", {"authors":'+ JSON.stringify(authors) +', "since":'+ Math.floor(lastweek.getTime()/1000) +'}]');
}

/* Socket Stuff

wss://nostr-pub.wellorder.net
wss://relayer.fiatjaf.com
wss://nostr.rocks
wss://nostr-relay.wlvs.space

{
  "ids": <a list of event ids or prefixes>,
  "kinds": <a list of a kind numbers>,
  "#e": <a list of event ids that are referenced in an "e" tag>,
  "#p": <a list of pubkeys that are referenced in a "p" tag>,
  "since": <a timestamp, events must be newer than this to pass>,
  "until": <a timestamp, events must be older than this to pass>,
  "authors": <a list of pubkeys or prefixes, the pubkey of an event must be one of these>
}

*/


let we, 
relays = 
[  
   "wss://nostr-pub.wellorder.net",
   "wss://relayer.fiatjaf.com",
   "wss://nostr.rocks",
   "wss://nostr-relay.wlvs.space",
   "wss://nostr-relay.untethr.me",
   "wss://relay.bitid.nz"
],
relay = relays[0],
authors = [];

function bbbb()
{// boom biddy bye bye
 // tries to forget everything
   authors = []; // list of pubkeys
   yours.clear(); // localStorage
   session.clear(); // SessionStorage
   dlist.innerHTML = ''; // fren list
   feed.innerHTML = ''; // timeline
   fool.innerHTML = ''; // input history
   put.placeholder = 'boom biddy bye bye'; // so you know what happened
   u.setAttribute('src', u.dataset.src);
   page.classList.remove('push');
}

function start() {
   
   // connect to chosen relay
   we = new WebSocket(relay);
   
   let k = yours.getItem('k');
   if (k) {
     
     if (yours.getItem('x')) {
         put.placeholder = 'new post'; // less is more
      } else put.placeholder = '--x : clear input history'; // tip
         
      page.classList.add('has-k');
      authors = [];
      authors.push(k);
      
      // updates idea with connection status
      idea.addEventListener('click', function(e) {
         relaytion(we) 
      });
      
      // send open request, gets all the events of k
      we.addEventListener('open', function(e) {
         we.send(
            '["REQ", "aa-you", {'
            +'"authors":["'
            + authors[0].substring(0, 16)
            +'"]}]'
         );
         relaytion(we)
      }); 
      
      // wen we get an event
      we.addEventListener('message', function(e) {
         
         const 
         dis = JSON.parse(e.data)[1], // the request id
         dat = JSON.parse(e.data)[2]; // the event data
         
         session.setItem(dat.id, JSON.stringify(dat));
         
         if (dis == "aa-you") {
            
            switch (dat.kind) {  
               case 0: kind0(dat); break;
               case 3: kind3(dat); break;
               default: ; 
            }
                        
         } else if (dis == "aa-feed") {
            
            switch (dat.kind) {
               case 0: kind0(dat); break;
               case 1: kind1(dat); break;
               default: anykind(dat); 
            }
            
         } else {
            // 
            switch (dat.kind) {
               case 0: kind0(dat); break;
               default: ; 
            }
      	}
      });
      
      we.addEventListener('close', function(e) { relaytion(we) }); 
      if (!k && window.nostr) {
      window.nostr.getPublicKey().then( key => {
         yours.setItem('k', key);
         start();
      });
   }
      if (window.nostr) { // nos2x
      /*
      
.getPublicKey(); //: string // returns your public key as hex
.signEvent(event): Event // returns the full event object signed
.getRelays(): { [url: string]: RelayPolicy } // returns a map of relays
.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
      
      */
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
   
   idea.dataset.status = '['+ ship.readyState +'] '+ relay +'/ ' + new Date().toUTCString()
}

function prepnote(note)
{
   const now = Math.floor( ( new Date().getTime() ) / 1000 );
   let tags = [];
   
   if (session.interesting) {
      
      const o = JSON.parse(session.getItem(session.interesting));
      const es = [], ps = [];
      
      if (o.tags.length > 0) {
         o.tags.forEach(function(ot) {
            if (ot[0] == 'e') {
               es.push(ot);
            }
            if (ot[0] == 'p') {
               ps.push(ot);
            }
         });
      }
      
      if (ps.length > 1) {
         let lastpub = ps[ps.length - 1][1];
         if ( lastpub !== o.pubkey && lastpub !== yours.k) {
            tags.push(lastpub)
         }
      }  
      
      if (o.pubkey !== yours.k) tags.push(['p',o.pubkey]);
      
      if (es.length > 0) {
         tags.push(es[0])
      }
      
      tags.push(['e', o.id]);
   }
   
   const ne = [ 
      0,
      yours.getItem('k'),
      now,
      1,
      tags,
      note
   ];
   
   session.ne = JSON.stringify(ne);
}

function signnote() 
{
   const notehash = bitcoinjs.crypto.sha256( session.ne ).toString( 'hex' );
   const notedat = JSON.parse(session.ne);
   
   const tosign = {
      "id": notehash,
      "pubkey": notedat[1],
      "created_at": notedat[2],
      "kind": notedat[3],
      "tags": notedat[4],
      "content": notedat[5]
   }
         
   if (window.nostr) window.nostr.signEvent(tosign).then( e => postnote(e) );

}

function postnote(e) 
{
   session.post = JSON.stringify(e);
   we.send( '["EVENT",' + session.post + ']' );
}

window.addEventListener('load', function(event) {
   
   over(fool);
   
   // get all the the elements for tag()
   tags = document.querySelectorAll('[data-tag]');
   tags.forEach(function(l) { l.addEventListener('click', function(e) { tag(e,l); }); });	
   
   let k = yours.getItem('k');
   
   if (!k && window.nostr) {
      window.nostr.getPublicKey().then( key => {
         yours.setItem('k', key);
         start();
      });
   } else start();

//   window.addEventListener('hashchange', function() {
//     console.log(location.hash)
//   }, false);

});

//window.addEventListener('resize', function(event) {  });
