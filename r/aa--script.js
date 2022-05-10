const 
your = window.localStorage,
session = window.sessionStorage,
idea = document.getElementById('a'), 
dlist = document.getElementById('list'),
put = document.getElementById('iot'),
cleet = document.getElementById('e'),
feed = document.getElementById('sea'),
fool = document.getElementById('foo'),
sec = document.getElementById('sec'),
u = document.getElementById('u'),
stuff = { behavior:'smooth', block: 'start'};

session.removeItem('interesting');

let defaults = {
   'media-autoload': true
}

if (!your.options) {
   your.options = JSON.stringify(defaults);
   console.log('options:', your.options);
}

function orIs(it) 
{// let's find out
   const interesting = document.querySelector('.interesting');
   select(it, interesting ? interesting : idea);
} cleet.addEventListener('click', orIs, false);

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
   } else {
      pause(e.target);
   }
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
   if (postr) {
      video.setAttribute('poster', postr);
   }
   
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
   
   video.addEventListener('click', vip, false);
   controls.addEventListener('click', rewind, false);
   
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
   }, false);
   
   over(video); over(controls);
}

function yt(url) {
// fuck youtube but here it is anyway
   return '<figure class="yt"><iframe src="https://www.youtube.com/embed/'+url.searchParams.get('v') + '" title="yt" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>'
}

function tog(e,l) // toggle classes
{
   e.preventDefault();
   
   const 
      tog = l.getAttribute('data-tog'), 
      id = l.getAttribute('aria-controls');
   
   let wall = id ? document.getElementById(id) : false;
   
   if (tog) {
      
      document.body.classList.toggle(tog);
      e.target.classList.toggle('active');
      
      if (wall && wall.getAttribute('aria-expanded') == 'false') {
         wall.setAttribute('aria-expanded','true');
      } else if (wall) { wall.setAttribute('aria-expanded','false'); }
   } 			
}

function ash(tags, l) 
{
   const 
      ul = document.createElement('ul'),
      note = { 
      'e': [], // list of event ids
      'p': [], // list of pubkeys
      'nonce': [], // pow
      'custom': [], // else
      'reply': false,
      'replyto': false,
      'oe': false,
      'op': false,
      'ul': ul
   };
   
   ul.classList.add('tags');
   
   let nodes = ul.childNodes;
   
   
   if (tags.length > 0) {
      
      tags.forEach(function(ot, i) {
         
         let g = note[ot[0]];
         if (!g) {
            g = note.custom;
         } g.push(ot[1]);
         
//         console.log(ot);
         
         let tag = document.createElement('li');
         tag.classList.add('tag', 'tag-'+ot[0]);
         tag.dataset.tag = ot;
         
         let a = document.createElement('a');
         a.classList.add('tag-link');
         
                  
         
         if (ot.length > 1) {
            let rel = '';
            if (ot[2] && ot[2].substr(0, 6) === 'wss://') {
               rel = '?wss=' + encodeURIComponent(ot[2].substr(6));
            }
            a.href = '#' + ot[0] + '-' + ot[1] + rel;
            if (ot[0] === 'e' || ot[0] === 'p') {
               a.innerHTML = pretty(ot[1]);
               a.setAttribute('style', '--c:#' + hex(ot[1], false));
            } else {
               a.innerHTML = ot[1];
            }
            
         } else {
            a.innerHTML = ot;
         }
         
         tag.append(a);

         ul.append(tag);

      });

      if (note.e.length > 0) {
         
         note.oe = tags.findIndex(element => element[1] === note.e[0]);
         note.reply = tags.findIndex(element => element[1] === note.e[note.e.length - 1]);
         
         l.setAttribute('data-reply', note.e[note.e.length - 1]);

      }
            
      if (note.p.length > 0) {
         note.op = tags.findIndex(element => element[1] === note.p[0]);
         note.replyto = tags.findIndex(element => element[1] === note.p[note.p.length - 1]);
      }
      
      if (note.nonce.length > 0) {
         let nonce = l.dataset.nonce;
         l.setAttribute('data-nonce', note.nonce[0]);
      }
      
      nodes.forEach(function(li, i) {
         if (i === note.reply) {
            li.classList.add('tag-e-parent');
         }
         
         if (i === note.replyto) {
            li.classList.add('tag-p-parent');
         }
         
         if (i === note.oe) {
            li.classList.add('tag-e-top');
         }
         
         if (i === note.op) {
            li.classList.add('tag-p-top');
         }
      });
      
//      note.ul = ul;
   }
   
   return note
}


function mom(my) 
{
   const parents = [];
   
   for ( ; my && my !== document; my = my.parentNode ) {
		if (my.classList.contains('event') && !my.classList.contains('interesting')) { parents.push(my); }
	}
   
   parents.forEach(function(l) {
      l.classList.add('mom');
   });
 
}

function orient(l) 
{ // rotates an element towards another
   if (l) {
      const to = document.querySelector('.was-interesting');
      if (to) {
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
      
      } else { l.style.transform = "rotate(0)"; }
   }
}

function select(e,l) 
{ // opens / close an article on event
   e.preventDefault();
   
   if (typeof l === 'string') {
      l = document.getElementById(l);
   } 
      
   let 
      interesting = document.querySelector('.interesting'),
      it;
   
   if (e.target.id === "e") { 
      // cleet click
      if (interesting) { it = interesting.querySelector('.marker'); }
      else {
         if (document.body.classList.contains('scroll')) { it = idea; }  // if scrolled, go to top
         else { it = sec; } // go to bottom
      }
      
   } else {
      if (l) {
         
         let fren = l.closest('.fren');
         
         
         
         if (l.classList.contains('interesting')) {
            
            l.classList.remove('interesting');
            fren.classList.remove('has-interesting');
            
            let moms = document.querySelectorAll('.mom');
            moms.forEach(function(mom) {
               mom.classList.remove('mom');
            });
            
            document.body.classList.remove('k-is-s');
            
            it = l;
            session.removeItem('interesting');
            put.placeholder = 'new post';
            
         } else {
            
            if (interesting) interesting.classList.remove('interesting'); 
            
            l.classList.add('interesting');
            fren.classList.add('has-interesting');
            
            mom(l);
            
            document.body.classList.add('k-is-s');
            
            it = l;
            session.interesting = l.id.substring(2);         
            const last = document.querySelector('.last');
            if (last) { last.classList.remove('last'); }
            put.placeholder = 'reply to ' + l.querySelector('figcaption').textContent;
            
         } l.classList.add('last');
      }
      
   } 
   
   if (it) {
      
      if (it.classList.contains('interesting')) {
         
         it.scrollTo({
           top: 0,
           left: 0,
           behavior: 'smooth'
         });
      
      } else {
         it.scrollIntoView(stuff);
      }
      
      it.scrollIntoView(stuff);
      
   } else {
//      foo('event not found');
      let notice = document.createElement('li');
      notice.textContent = 'event not found'
      fool.append(notice);
   }
}

function scrollin(scrollp, l) 
{
   const h = l.scrollHeight - window.innerHeight;
   
   if (scrollp > 20) {
      l.classList.add('scroll');
      if (scrollp > h - 100) l.classList.add('scrolled');
   } else if (scrollp < 20) { l.classList.remove('scroll'); }
   
   if (scrollp < h - 150) { l.classList.remove('scrolled'); }
   
   orient(cleet);
}

let lscroll = 0, ticking = false;

window.addEventListener('scroll', function(e) {
   lscroll = window.scrollY;
   if (!ticking) {
      window.requestAnimationFrame(function() {
         scrollin(lscroll, document.body);
         ticking = false;
      });
      ticking = true;
   }
}, false);

//let kp = [], foolast = 0;

function is(e)
{ // input handler event
   const 
   n = document.createTextNode(e.target.value),
   v = n.wholeText;
   let l,
   c = v.substr(-1);
   
   if (e.key === 'Enter') {
      
      // get the value of input and make it safer
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
            document.body.classList.toggle('ffs'); 
            break;
         case '--x':
            if (!your.x) { your.setItem('x', 'clear input history'); }
            fool.innerHTML = '';
            put.placeholder = 'new post';
            clear = true;
            break;
         
         default: 
            
            console.log(v.substring(0,3));
            
            if (v.substring(0,3) === "--k") {
               bbbb();
               your.setItem('k', v.substring(4));
               start();
               clear = true;
               
            // } else if (v.substring(0,3) === "--p") {
               // const p = v.substring(4);
               // l.dataset.tip = '"p, ' + p;
               
            } else {
//               l.dataset.tip = '" => nope(try: "--h")';
               prepnote(v)
               
            }
            
      }
         		
      if (!clear) { // append input to history
      	fool.append(l);
         fool.scrollTop = fool.scrollHeight; 
      }
      
      put.value = '';
   }
   
//   console.log()
    
// to interpret what you want before enter return
// i.e. handle mentions, etc..
// if (v.length > 0) {
 	fool.dataset.log = c;
   fool.dataset.content = v;
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
   document.body.classList.add('cow-mit');
}

function less(e) 
{
   document.body.classList.remove('cow-mit');
   fool.scrollTop = fool.scrollHeight;
}

put.addEventListener('blur', less, false);
put.addEventListener('keyup', is, false);
put.addEventListener('focus', more, false);

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
   let matchlow = match.toLowerCase();
   if ( matchlow.endsWith('.jpg') 
     || matchlow.endsWith('.jpeg') 
     || matchlow.endsWith('.png')
     || matchlow.endsWith('.gif')
     || matchlow.endsWith('.svg')) { // images
   	
      rep += '<img src="' + url + '" class="content-img">';
      
   } else if ( matchlow.endsWith('.mp4')){ // videos
      
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

function hex(k, separator) {
   // returns new 6 char hex from first 3 and last characters
   // used for item classes, color, etc
//   const str = 
   let sep = '';
   if (separator !== false) {
      sep = separator;
   }
   return k.substr(0, 3) + sep + k.substr(-3)
}

function pretty(k) 
{
   let 
      str,
      bff = JSON.parse(your.getItem(k));
   
   if (bff && bff.name) {
      str = bff.name
   } else {
      str = hex(k, '…')
   }
   
   return str
}

function mentions(text, tags) 
{
   function nip8(_, index) 
   {
      let it = '<a href="#" class="mention>' + index + '</a>';
      let ref = tags[index];
      if (ref && ref[1]) {
         
         let ide = pretty(ref[1]);
         it = '<a href="#' + ref[0] + '-' + ref[1] + '" class="mention mention-'+ref[0]+'" style="--c:#'+ hex(ref[1], false)+'">' + ide + '</a>';
      }
      
      
      
      return it;
   }
   
   return text.replace(/\B#\[(\d+)\]\B/g, nip8);
   
}



function ai(content, tags) 
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
   
   // nip8 (mentions)
//   let patternC = /\B#\[(\d+)\]\B/gim;
      
   re = mentions(re, tags);
   return re;
}

// over functions

function pointerenter(e) 
{
   if (e.pointerType !== 'touch') {
      e.target.classList.add('over');
      e.target.parentElement.classList.add('is-over');
   } else e.target.removeEventListener('pointerenter', pointerenter);
}

function pointerleave(e) 
{
   if (e.pointerType !== 'touch') {
      e.target.classList.remove('over');
      e.target.parentElement.classList.remove('is-over');
   } else e.target.removeEventListener('pointerleave', pointerleave);
}

function touchstart(e) 
{
   e.target.classList.add('over');
   e.target.parentElement.classList.add('is-over');
}

function touchend(e) 
{
   e.target.classList.remove('over');
   e.target.parentElement.classList.remove('is-over');
}

function over(l) 
{
   // replacement for default :hover, 
   // to "better" handle touch devices
   
   // e.pointerType === 'mouse, pen, touch'
   
   
   
   // not a touch, kinda
   l.addEventListener('pointerenter', pointerenter, false);
   l.addEventListener('pointerleave', pointerleave, false);
   // touch
   l.addEventListener('touchstart', touchstart, false);   
   l.addEventListener('touchend', touchend, false);
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
   
   your.setItem(o.pubkey, o.content);
   
   
   const bff = document.getElementById('p-'+o.pubkey),
   frend = JSON.parse(o.content);
//   pub = document.createElement('p');
   
   let fren;
   
   if (bff) { 
      fren = bff;
//      fren.innerHTML = '';
   } else {
      fren = newpub(o.pubkey);
//      fren = document.createElement('li');
//      fren.id = 'p-' + o.pubkey;
//      fren.classList.add('fren');    
//      over(fren);
//      feed.append(fren);    
   }
   
   fren.classList.add('bff');
   
   
//   pub.classList.add('pubkey');
//   pub.innerHTML = o.pubkey;
//   fren.append(pub);
	
   if (frend.name) {
      let name = fren.querySelector('.name');
      let petname = fren.querySelector('.petname');
      if (!name) {
         name = document.createElement('h2');         
         name.classList.add('name');
         petname = document.createElement('span');
         petname.classList.add('petname');
         name.append(petname);
         fren.append(name);
      }
	   
      petname.innerHTML = frend.name;
	   
      
      if (frend.nip05) {
         name.setAttribute('data-nip05', frend.nip05)
         if (frend['nip05'].startsWith('_@')) {
            name.classList.add('root');
         }
      }
	}
   
   if (frend.picture) {
      
      let picture = fren.querySelector('.picture');
      
      if (!picture) {
         picture = document.createElement('img');
         picture.classList.add('picture');
         fren.append(picture);
         fren.classList.add('has-picture');
      }
      
      
      
      let src = arParams(frend.picture);
      picture.setAttribute('src', src[0]);      
      
      if (src.length > 2) { // there's parameters
         let srcl = src[2].get('logo'); // let c if it is a logo
         if (srcl) { // it is
            // let's build it
            let logo = fren.querySelector('.logo');
            if (!logo) {
               logo = document.createElement('img');
               logo.classList.add('logo');
               fren.append(logo);
            }
            logo.setAttribute('src', decodeURIComponent(srcl));
         }
      }
      
      if (o.pubkey == your.getItem('k')) { // gets main profile img
         u.setAttribute('src', frend.picture.split('?')[0]);
      }
      
      
   }
   
	if (frend.about) {
      let about = fren.querySelector('.about');
      if (!about) {
         about = document.createElement('p');
         about.classList.add('about');
         fren.append(about);
      }
	   about.innerHTML = ai(frend.about);
	}
   
   // see if there are already posts from pubkey and updates figure
   const upd = document.querySelectorAll('.p-'+o.pubkey+'');
   upd.forEach(function(l) {
      
      if (frend.picture) {
         l.querySelector('.d-fig img').src = arParams(frend.picture)[0];
      } 
      
      if (frend.name) {
         l.querySelector('.d-fig figcaption').innerHTML = frend.name;
      }
   });
}


//dlist.addEventListener('click', function(e) {
//   
//   if (e.target.classList.contains('name')) {
//      select(e, document.getElementById(e.target.parentElement.getAttribute('aa-last')));
//   }
//   
//   console.log(e.target);
//});


function stylek(k, l) 
{
   let 
      c = k.substr(0, 3) + '' + k.substr(-3),
      cc = k.substr(0, 6), 
      ccc = k.substr(-6),
      styl = '--c:#' + c
          +'; --cc:#' + cc
          +'; --ccc:#' + ccc;
   
   
   l.setAttribute('style', styl );
   l.setAttribute('data-hex', hex(k, false));
   
//   return l
}

function newpub(k) 
{
   const 
      l = document.createElement('li'),
      p = document.createElement('p'),
      c = document.createElement('ul');
   
   if (k) 
   {
      l.id = 'p-' + k;
      l.classList.add('fren');    
      p.classList.add('pubkey');
      c.classList.add('events');
      p.innerHTML = k;
      l.append(p, c);
      feed.append(l);      
      
      l.addEventListener('click', function(event) 
      {
         if (event.target.classList.contains('pubkey') 
            || event.target.classList.contains('picture')
            || event.target.classList.contains('name')
            )
         {
            l.classList.toggle('smol');
            l.scrollIntoView(stuff);
         }
      }, false);
      
      over(l);
      return l;
   }
}

function newid(o) 
{
   const 
      l = document.createElement('li'),
      figure = document.createElement('figure'),
      img = document.createElement('img'),
      caption = document.createElement('figcaption'),
      marker = document.createElement('span'),
      article = document.createElement('article'),
      raw = document.createElement('ul'),
      hex = o.pubkey.substr(0,3) + o.pubkey.substr(-3);

   l.id = 'e-'+o.id;
   l.classList.add('event');
   l.setAttribute('data-kind', o.kind);
   l.setAttribute('data-hex', hex);
   l.setAttribute('style', '--c:#' + hex);
   
   figure.classList.add('d-fig');
   raw.classList.add('e');
   marker.classList.add('marker');
   
   figure.append(img, caption);
   
   figure.addEventListener('click', function(e) { select(e, l) }, false);
   
   over(figure);
   over(marker);
   over(article);
   
   l.append(figure, marker, article, raw);
   
   return l
}

function lies(rep, l) 
{
   let lies = rep.querySelector('.replies');
   if (!lies) {
      lies = document.createElement('ul');
      lies.classList.add('replies');
      rep.append(lies);
   } 
   lies.append(l); 
//   let repar = rep.parentElement;
//   if (repar) {
//      repar.prepend(rep);  
//      repar.parentElement.prepend(repar);
//   }
   
}


function kind1(o) 
{ // NIP--1 text_note

   let 
      l = document.getElementById('e-'+o.id),
      bff = document.getElementById('p-' + o.pubkey),
      tags;
   
   if (!l) {
      l = newid(o);
   } 
   
   if (!bff) {
      bff = newpub(o.pubkey);
   } 
   
   const 
      figure = l.querySelector('.d-fig'),
         img = figure.querySelector('img'),
         caption = figure.querySelector('figcaption'),
      marker = l.querySelector('.marker'),
      article = l.querySelector('article'),
      raw = l.querySelector('.e'),
      food = bff.querySelector('.events');
//      console.log(h);

   tags = ash(o.tags, l);
   l.append(tags.ul);
      
   if (tags.reply !== false) {
//         console.log(tags.reply, o.tags[tags.reply][1].substr(0, 4), tags.e[tags.e.length - 1].substr(0, 4), o.tags);
      // if it's a reply, check if we already have it
      
      let rep = document.getElementById('e-'+tags.e[tags.e.length - 1]);
      if (rep) { 
         lies(rep, l); 
      } else { 
         
         l.classList.add('orphan');
         
         rep = document.getElementById('e-'+tags.e[0]);
         if (rep) { 
            lies(rep, l);
         } else {
                           
            bff = document.getElementById('p-' + tags.p[0]);
            
            if (!bff) {
               bff = newpub(tags.p[0]);
            }
                  
            rep = document.createElement('li');
            rep.classList.add('event');
            rep.id = 'e-'+tags.e[0];
            rep.classList.add('p-'+0);
        
            if (tags.replyto !== tags.op) {
               
               repto = document.createElement('li');
               repto.classList.add('event');
               repto.id = 'e-'+tags.e[tags.e.length - 1];
               repto.classList.add('p-'+tags.p[tags.p.length - 1]);
               
               lies(repto, rep);
               
            } 
            
            lies(rep, l);
         }
      }
   } else { 
      food.prepend(l); 
      bff.parentElement.prepend(bff);
   }   
   
   const dat = JSON.parse(your.getItem(o.pubkey));
   if (dat) { img.src = dat.picture ? dat.picture : 'r/aa--u.png';
      caption.innerHTML = dat.name ? dat.name : o.pubkey;
   } else { img.src = 'r/aa--u.png';
      caption.innerHTML = o.pubkey;
      figure.classList.add('new');
   }
   
   const 
   oc = document.createTextNode(o.content),
   ocd = oc.wholeText;
   aiocd = ai(ocd, o.tags);

   article.innerHTML = '<p>' + aiocd + '</p>';
   
   let media = article.querySelector('img, video, audio, iframe');
   if (media) { article.classList.add('has-media');
      let videos = article.querySelectorAll('video');
      if (videos) {
         videos.forEach(rap);
      }
   }
   
//   re = re.replace(/\B#\[(\d+)\]\B/g, nip8);
   
   let s = '';
   s += '<li data-raw="id"><a href="?e=' + o.id + '">' + o.id + '</a></li> ';
   s += '<li data-raw="pubkey"><a href="?p=' + o.pubkey + '">' + o.pubkey + '</a></li> ';
   s += '<li data-raw="sig">' + o.sig + '</li> ';
   s += '<li data-raw="kind">' + o.kind + '</li> ';
//   s += h.ul.outerHTML : '<li data-raw="tags">-</li>';
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


let we, 
relays = your.relays;

if (!relays) {
   relays = [  
      "wss://nostr-pub.wellorder.net",
      "wss://relayer.fiatjaf.com",
      "wss://nostr.rocks",
      "wss://nostr-relay.wlvs.space",
      "wss://nostr-relay.untethr.me",
      "wss://relay.bitid.nz",
      "wss://nostr.bitcoiner.social",
   ]
}

let relay = relays[0],
authors = [];

function bbbb()
{// boom biddy bye bye
 // tries to forget everything
   authors = []; // list of pubkeys
   your.clear(); // localStorage
   session.clear(); // SessionStorage
   feed.innerHTML = ''; // timeline
   fool.innerHTML = ''; // input history
   put.placeholder = 'boom biddy bye bye'; // so you know what happened
   u.setAttribute('src', u.dataset.src);
   document.body.classList.remove('ffs');
}

function start() {
   
   // connect to chosen relay
   we = new WebSocket(relay);
   
   let k = your.getItem('k');
   if (k) {
      put.value = '';
      if (your.getItem('x')) {
         put.placeholder = 'new post'; // less is more
      } else { put.placeholder = '--x : clear input history'; } // tip
         
      document.body.classList.add('has-k');
      authors = [];
      authors.push(k);
      
      // updates idea with connection status
      idea.addEventListener('click', function(e) {
         relaytion(we) 
      }, false);
      
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
         
         if (dis && dat) {
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
//                  case 7: kind1(dat); break;
                  default: anykind(dat); 
               }
               
            } else {
               // 
               switch (dat.kind) {
                  case 0: kind0(dat); break;
                  default: ; 
               }
         	}
         }
      });
      
      we.addEventListener('close', function(e) { relaytion(we) }); 
      if (!k && window.nostr) {
         window.nostr.getPublicKey().then( key => {
            your.setItem('k', key);
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
   
   idea.dataset.status = '[' + ship.readyState + '] ' + relay.substr(6) + ' ' +  new Date().toUTCString()
}

function prepnote(note)
{
   const now = Math.floor( ( new Date().getTime() ) / 1000 );
   let tags = [];
   
   if (session.interesting) {
      
      const 
      o = JSON.parse(session.getItem(session.interesting)), 
      es = [], 
      ps = [];
      
      if (o.tags.length > 0) {
         o.tags.forEach(function(ot) {
            switch (ot[0]) {
               case 'e': es.push(ot); break;
               case 'p': ps.push(ot); break;
               default:
            }
         });
      }
      
      if (ps.length > 1) {
         let lastpub = ps[ps.length - 1][1];
         if ( lastpub !== o.pubkey && lastpub !== your.k) {
            tags.push(lastpub)
         }
      }  
      
      if (o.pubkey !== your.k) { tags.push(['p',o.pubkey]); }
      
      if (es.length > 0) {
         tags.push(es[0])
      }
      
      tags.push(['e', o.id]);
   }
   
   const ne = [ 
      0,
      your.getItem('k'),
      now,
      1,
      tags,
      note
   ];
   
   session.ne = JSON.stringify(ne);
   signnote();
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
         
   if (window.nostr) {
      window.nostr.signEvent(tosign).then( (e) => {
         session.post = JSON.stringify(e);
         postnote();
      });
   
   } else {
      console.log('no nos2x')
   }

}

function postnote() 
{ 
   we.send( '["EVENT",' + session.post + ']' );
}

window.addEventListener('load', function(event) {
   
   over(fool);
   
   // get all the the elements for tog()
   tags = document.querySelectorAll('[data-tog]');
   tags.forEach(function(l) { l.addEventListener('click', function(e) { tog(e,l); }, false); });	
   
   let k = your.getItem('k');
   
   if (!k && window.nostr) {
      window.nostr.getPublicKey().then( key => {
         your.setItem('k', key);
         start();
      });
   } else { start(); }

//   window.addEventListener('hashchange', function() {
//     console.log(location.hash)
//   }, false);

}, false);

//window.addEventListener('resize', function(event) {  });
