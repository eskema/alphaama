function x_days(number) 
{
   const days = new Date();
   days.setDate(days.getDate() - number); // fetch from last x days
   
   return Math.floor(days.getTime()/1000)
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

      let format = src[2] ? src[2].get('format') : false;
      if ( matchlow.endsWith('.jpg') 
      || matchlow.endsWith('.jpeg') 
      || matchlow.endsWith('.png')
      || matchlow.endsWith('.gif')
      || matchlow.endsWith('.svg')
      || format && format === 'jpg'
      || format && format === 'jpeg'
      || format && format === 'svg'
      || format && format === 'png') 
      { // images
         rep += '<img src="' + url + '" class="content-img" loading="lazy">';
         
      } else if ( matchlow.endsWith('.mp4'))
      { // videos
         let poster = src[2] && src[2].get('poster') ? decodeURIComponent(src[2].get('poster')) : false;
         
         rep += player(url, poster).outerHTML;
         
      } else { // regular links
         
         let ur = new URL(url);
         
         let domain = ur.hostname.split('.').reverse().splice(0,2).reverse().join('.');
         if (domain === 'youtube.com' || domain === 'youtu.be' ) 
         { 
            let id = ur.searchParams.get('v');
            
            if (!id) {
                id = ur.pathname.substring(1);
            }
            
            rep += yt(id)
         } 
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
   const bff = your[k] ? JSON.parse(your[k]) : false;
   let str = bff && bff.name ? bff.name : hex(k, '…');
   return str
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
         } 
         else 
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
         //e.target.closest('.event').classList.add('over');
         if (l.classList.contains('event')) 
         {
            let target = e.target.closest('.event');
            if (target !== null) 
            {
               target.classList.remove('over', 'more-over');
               if (target.parentElement !== null) 
               {
                  let targetP = target.parentElement.closest('.event')
                  if (targetP) targetP.classList.remove('more-over');
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

function stylek(keys, l) 
{
   let style = '';
   keys.forEach(function(k, index) 
   {
      let c = '--';
      for (var i = 0; i < index + 1; i++) {
         c += 'c';
      }
      style += c + ':' + rgb(k.substr(0, 6)) + ';'
   })
   
   l.style.cssText += style;
}

function make_time(timestamp) 
{
   const l = document.createElement('time');   
   l.classList.add('created-at');
   l.dataset.timestamp = timestamp;
   
   return l
}

function update_time(l)
{
   const ts = l.dataset.timestamp;
   const d = new Date(ts*1000);
   l.setAttribute('datetime', d.toISOString());
   l.title = d.toUTCString();
   l.textContent = timeSince(d);
   l.parentElement.dataset.stamp = ts;
}

function ordered(room, direction) 
{
   function sort_d(a,b,bool) 
   {
      if (bool) 
      { // asc
         return a.dataset.stamp > b.dataset.stamp
      }
      else 
      { // desc
         return a.dataset.stamp < b.dataset.stamp
      }
      
   }
   [...room.children]
   .sort( (a,b) => sort_d(a,b,direction) ? 1 : -1 )
   .forEach(node => room.appendChild(node));
}

function a_k(a,dat) 
{
   if (options.media && dat.picture) 
   {
      a.style.cssText += '--picture: url('+arParams(dat.picture)[0]+')';
      a.classList.add('has-picture');
   }
   if (dat.name) 
   {
      let a_text = a.querySelector('.text');
      if (!a_text) a_text = document.createElement('span');
      a_text.classList.add('text', 'test');
      a_text.textContent = dat.name;
      a.classList.add('has-text');
      a.append(a_text);
   }
}

function update_k(k) 
{
   // see if there are already posts from pubkey and updates info
   const 
      dat = JSON.parse(your[k]),
      existing = document.querySelectorAll('[href="#p-'+k+'"]');
   
   existing.forEach(function(a){a_k(a,dat)});
}

function taglink(tag, clas) 
{ // make tags clickable
   const a = document.createElement('a');
   
   a.classList.add('a');
   
   if (clas && clas !== '') a.classList.add(clas);
   
   if (tag && tag[1]) 
   {
      a.classList.add('a-'+tag[0]);
      a.title = tag[1];

      let a_text = document.createElement('span');
      a_text.classList.add('text');
      a.append(a_text);
      
      function ep(tag) 
      {
         a.href = '#' + tag[0] + '-' + tag[1];
         a.classList.add(tag[0] + '-' + tag[1]);
         a_text.textContent = pretty(tag[1]);
         stylek([tag[1]], a);
         
         if (tag[2]) a.setAttribute('data-relay', tag[2]);
         if (tag[3]) a.setAttribute('data-type', tag[0] +'-'+tag[3]);
      }
      
      switch (tag[0]) 
      {
         case 'e':
            ep(tag);
            a.classList.add('id');
            a.dataset.before = '{';
            a.dataset.after = '}';
            break;
         case 'p':
            ep(tag);
            a.classList.add('author');
            a.dataset.before = '@';
            let dat = your[tag[1]] ? JSON.parse(your[tag[1]]) : false;
            if (dat) a_k(a,dat);
            break;
         case 't':
         case 'hashtag':
            a.dataset.before = '#';
         default:
            a_text.textContent = tag[1];   
      }
      
   }
   
   return a
}

function ur(string) 
{
   return string.replace(/[^a-z0-9]/gi, '-').toLowerCase()
}

function ofa(a) 
{//object from array
   const o = {};
   o.id         = a[0] ? a[0] : false;
   o.pubkey     = a[1] ? a[1] : false;
   o.created_at = a[2] ? a[2] : false;
   o.kind       = a[3] ? a[3] : false;
   o.tags       = a[4] ? a[4] : false;
   o.content    = a[5] ? a[5] : false;
   o.sig        = a[6] ? a[6] : false;
   
   return o
}

function child_from_class(l, clas) 
{
   const childs = l.children;
   for (let i = 0; i < childs.length; i++) 
   {
     if (childs[i].classList.contains(clas)) return childs[i];
   }
}

function hide(k) 
{
   const notk = document.querySelectorAll('.event:not(.p-'+k+')');
   if (notk) { notk.forEach(function(l) { l.classList.add('hidden') })}
}

function unhide() 
{
   const hidden = document.querySelectorAll('.hidden');
   if (hidden) { hidden.forEach(function(l) { l.classList.remove('hidden') })}
}

function ancestor(l, clas) 
{ // parent events from reply to root
   let ancestor;
   for ( ; l && l !== document; l = l.parentNode ) 
   {
      if (l.classList.contains(clas)) ancestor = l;
	}
   
   return ancestor;
}

function mom(l) 
{ // parent events from reply to root
   for ( ; l && l !== document; l = l.parentNode ) 
   {
      if (l.classList.contains('event')) l.classList.add('mom')
	}
}

String.prototype.hexEncode = function()
{
   var hex, i;
   var result = "";
   for (i = 0; i < this.length; i++) 
   {
      hex = this.charCodeAt(i).toString(16);
      result += ("000"+hex).slice(-4);
   }
   
   return result
}

function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;  
}

function hash(a) 
{
   return bitcoinjs.crypto.sha256( JSON.stringify(a)).toString( 'hex' );   
}