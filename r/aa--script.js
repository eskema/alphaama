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
sec = document.getElementById('sec');

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
      
	   if (l.classList.contains('interesting')) {
         
         l.classList.remove('interesting');
         page.classList.remove('k-is-s');
         it = l;
         
   	} else {
         
         if (interesting) interesting.classList.remove('interesting');
         
         l.classList.add('interesting');
   		page.classList.add('k-is-s');
         it = l.querySelector('.marker');
         
         const last = document.querySelector('.last');
         if (last) last.classList.remove('last');
   	} l.classList.add('last');
	
   } it.scrollIntoView(stuff);
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
            authors = []; // list of pubkeys
            yours.clear(); // localStorage
            dlist.innerHTML = ''; // fren list
            feed.innerHTML = ''; // timeline
            fool.innerHTML = ''; // input history
            put.placeholder = 'boom biddy bye bye'; // so you know what happened
            let u = document.getElementById('u');
            u.setAttribute('src', u.dataset.src);
            clear = true; // don't append this to history
            break;
         case '--d': // toggle frens
            page.classList.toggle('push'); 
            break;
         case '--x':
            if (!yours.getItem('--x')) yours.setItem('--x', 'clear input history');
            fool.innerHTML = '';
            put.placeholder = '_';
				clear = true;
            break;
         default: console.log(v.substring(0,3));
            
            if (v.substring(0,3) === "--k") {
               start(v.substring(4));
               clear = true;
            
            // } else if (v.substring(0,3) === "--p") {
               // const p = v.substring(4);
               // l.dataset.tip = '"p, ' + p;
         
            } else l.dataset.tip = '" => nope(try: "--h")';
            
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
		
		rep += '<img src="' + match + '" class="content-img">';
	
   } else if ( match.endsWith('.mp4')){ // videos
      
      let poster = false;
      if (src.length > 2 && src[2].get('poster')) {
         poster = decodeURIComponent(src[2].get('poster'));
      }
      
      rep += player(match, poster).outerHTML;
      
	} else { // regular links
		rep += '<a href="' + match 
      + '" class="content-link" target="_blank" rel="nofollow">' + match 
      + '</a>';
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
			let u = document.getElementById('u');
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
//         if (page.classList.contains('push')) {
//            
//         } else {
            select(e, document.getElementById('e-'+o.id));
//         }
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
            t.addEventListener('click', function(e) {
               select(e, document.getElementById(ot[0] + '-' + ot[1]))
            });
            
            if (ot[0] == 'e') {
               es.push(ot);
            }
         
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
   			}  lies.append(l); 
   
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

//if (window.nostr.getPublicKey()) {
//   console.log(window.nostr.getPublicKey());
//}

let 
we, 
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

function start(k)
{  
   // connect to chosen relay
   we = new WebSocket(relay);
   // clear stuff from previous key
   yours.clear();
   feed.innerHTML = '';
   list.innerHTML = '';
   
   // detect starting mode
   if (k === '--k') { put.placeholder = '--k y0urpu6keyh3re'; // no key 
   } else {
      // check if already started by looking for a stored item 
      if (yours.getItem('--x')) {
         put.placeholder = '_'; // less is more
      } else put.placeholder = '--x : clear input history'; // tip
      page.classList.add('has-k');
      authors = [];
      authors.push(k);
      yours.setItem('k', k);
      // need to make some sessionStorage 
      // so we can have a base to come back to
      // after starting again with a new key,
      // and also a way to append keys instead of replacing
      // so we can have both and switch at will
      const li = document.createElement('li');
      li.append(k);
      fool.append(li);
      
      if (window.nostr) { // nos2x
      /*
      
async  window.nostr.getPublicKey(); //: string // returns your public key as hex
async  window.nostr.signEvent(event): Event // returns the full event object signed
async  window.nostr.getRelays(): { [url: string]: RelayPolicy } // returns a map of relays
async  window.nostr.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
async  window.nostr.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
      
      */
      }
      
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
               default: ; 
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
   
   }
}
   


   
function relaytion(ship) 
{// updates id a with the connection status
/* 
   0	CONNECTING	Socket has been created. The connection is not yet open.
   1	OPEN	The connection is open and ready to communicate.
   2	CLOSING	The connection is in the process of closing.
   3	CLOSED	The connection is closed or couldn't be opened.*/
   
   idea.dataset.status = '['+ ship.readyState +'] '+ relay + '/ ' + new Date().toUTCString()
}

window.addEventListener('load', function(event) {
   
   over(fool);
   
   // get all the the elements for tag()
   tags = document.querySelectorAll('[data-tag]');
	tags.forEach(function(l) { l.addEventListener('click', function(e) { tag(e,l); }); });	

   if (window.nostr) {
      
      window.nostr.getPublicKey().then( key => start(key) );
   
   } else {
      
      const pub = yours.getItem('k');
      
      if (pub) start(pub);
      else start('--k');
      
   }
   
//   window.addEventListener('hashchange', function() {
//     console.log(location.hash)
//   }, false);

});

//window.addEventListener('resize', function(event) {  });