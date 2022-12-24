function x_days(number) 
{
   const days = new Date();
   days.setDate(days.getDate() - number); // fetch from last x days
   
   return Math.floor(days.getTime()/1000)
}

function parse_hashtags(text) 
{
   const hashtags = [];
   const matches = text.match(/(\B[#])\w+/g);
   if (matches) matches.forEach((t)=>{hashtags.push(['t',t.substr(1).toLowerCase()])});
   return hashtags
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

function merely_mentions(text, tags) 
{
   function nip8(m, index) 
   {
      let mention = m, [tag, key] = tags[index];
      
      if (is_hex(key)) 
      {
         if (tag === 'p')
         {
            try { name = JSON.parse(localStorage[key]).name }
            catch (error) { console.log('no name found') }
            
            if (name) mention = '@' + name;
            else mention = '@' + hex_trun(key)
         }
         else if (tag === 'e')
         {
            mention = '/' + hex_trun(key)
         }         
      }
      else mention = hex_trun(key)
      
      return mention;
   }
   
   return text.replace(/\B#\[(\d+)\]\B/g, nip8)
}

function try_url(url) 
{
   let ur_l;
   try { ur_l = new URL(url) } 
   catch (error) { console.log('invalid url') };
//   console.log(ur_l);
   if (ur_l 
   && (ur_l.protocol === 'http:' || ur_l.protocol === 'https:')
   && !ur_l.href.includes('javascript:')
   && !ur_l.href.includes('data:')) return ur_l;
   else return false
}

function media_ext(string) 
{
   const 
      lo = string.toLowerCase(),
      image_ext = ['jpg','jpeg','gif','webp','png'],
      video_ext = ['mp4'],
      audio_ext = ['mp3'];
   
   function check_ext(extensions) 
   {
      let is = false;
      extensions.forEach((ext)=> { if (lo.endsWith('.'+ext)) is = true });
      return is
   }
   
   let check = check_ext(image_ext) ? 'image'
   : check_ext(video_ext) ? 'video'
   : check_ext(audio_ext) ? 'audio'
   : false;
   
   return check
}

function parse_link(url) 
{
   
   let ur_l = try_url(url); 
//   console.log(ur_l)
   if (ur_l) 
   {
      const 
         src = ur_l.origin + ur_l.pathname,
         ext = media_ext(src);
   
      let link;      
      if (ext) 
      {
         switch (ext) 
         {
            case 'image':
               link = document.createElement('img');
               link.src = ur_l.href;
               link.classList.add('content-img');
               link.loading = 'lazy';
               break;
            case 'video':
            case 'audio':
               link = player(ur_l.href);
               break;               
         }      
      }
      else
      {
         link = document.createElement('a');
         link.href = ur_l.href;
         link.classList.add('content-link');
         link.target = '_blank';
         link.rel = 'nofollow';
         link.textContent = ur_l.href;
      }
      return link
   }
}

function ai(l) 
{
//   console.log('ai',l);
   let o;
   try { o = JSON.parse(l.dataset.o) }
   catch (error) { console.log('no event data') }
   
   const p = document.createElement('p');
   
   function replacer(url) 
   {
      p.append(parse_link(url));
      return url
   }
   
   if (o) 
   {
      const 
         oc = document.createTextNode(o.content),
         content = l.querySelector('.content');
      
      let ocd = merely_mentions(oc.wholeText, o.tags);   
      //URLs starting with http://, https://, or ftp://
      let patternA = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/\*%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      let re = ocd.replace(patternA, replacer);
      //URLs starting with www. (without // before it, or it'd re-link the ones done above)
      let patternB = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      re = ocd.replace(patternB, replacer);
//      requestAnimationFrame(()=> { 
         content.append(p) 
//      });
   }
}

function arParams(str) 
{   
   const ar = str.split('?');
   if (ar[1]) {
      const params = new URLSearchParams(ar[1]);
      if (params) 
      {
         ar.push(params);
      }
   }
   return ar
}

function is_hex(str) 
{
  return /^[A-F0-9]+$/i.test(str)
}

function rgb(hex_string) 
{
   return parseInt(hex_string.substr(0, 2), 16)
   + ',' +parseInt(hex_string.substr(2, 2), 16)
   + ',' +parseInt(hex_string.substr(4, 2), 16)
}

function hex_trun(k, separator = '…') {
   // returns new 6 char hex from first 3 and last characters
   // used for item classes, color, etc
   return k.substr(0, 3) + separator + k.substr(-3)
}

function pretty(k) 
{
   const bff = your[k] ? JSON.parse(your[k]) : false;
   let str = bff && bff.name ? bff.name : hex_trun(k);
   return str
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

function x_0(x) 
{
   try { return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/, (thanks, cameri) => cameri)
   } catch (error) { return x }  
}

function stylek(keys, l) 
{
   let style = '';
   keys.forEach((k, index)=>
   {
      if (is_hex(k)) 
      {
         try 
         {
            let c = '--';
            for (var i = 0; i < index + 1; i++) { c += 'c'; }
            style += c + ':' + rgb(x_0(k)) + ';'
         }
         catch (error) { console.log(keys, error) }
      }

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
//   a.textContent = '';
   if (dat.name) 
   {
      let a_text = a.querySelector('.text');
      if (a_text.innerText !== dat.name) a_text.textContent = dat.name;
   }
   
   if (options.media && dat.picture) 
   {
      let a_image = a.querySelector('img');
      if (!a_image)
      {
         a_image = document.createElement('img');
         a.classList.add('has-picture');
         a.append(a_image);
      }
      if (!a_image.src || a_image.src !== dat.picture.trim()) 
      { 
         a_image.src = dat.picture
         if (a_image.src !== dat.picture.trim()) {
            console.log(a_image.src === dat.picture)
         }
         
      }
//      if (a_image.src && a_image.src !== dat.picture.trim())
   }
}

function update_k(k) 
{
   // see if there are already posts from pubkey and updates info
   const 
      dat = JSON.parse(your[k]),
      existing = document.querySelectorAll('[href="#p-'+k+'"]');
   
   existing.forEach((a)=>{a_k(a,dat)});
}

function taglink(tag) 
{ // make tags clickable
   const a = document.createElement('a');
   
   a.classList.add('a');   
   if (tag && tag[1]) 
   {
      a.classList.add('a-'+tag[0]);
      a.title = tag[1];

      let a_text = document.createElement('span');
      a_text.classList.add('text');
      a.append(a_text);
      
      function ep(tag) 
      {
         try 
         {
            a.href = '#' + tag[0] + '-' + tag[1];
            a.classList.add(tag[0] + '-' + tag[1], tag[0] === 'e' ? 'id' : 'author' );
            a_text.textContent = pretty(tag[1]);
            stylek([tag[1]], a);
            if (tag[2]) a.setAttribute('data-relay', tag[2]);
            if (tag[3]) a.setAttribute('data-type', tag[0] +'-'+tag[3]);
         } 
         catch (error) 
         { console.log('malformed tag: ' + tag) }

      }
      
      switch (tag[0]) 
      {
         case 'e':
            ep(tag);
            break;
         case 'p':
            ep(tag);
            let your_follows = your.follows ? JSON.parse(your.follows) : [];
            if (your_follows.includes(tag[1])) 
            {
               let dat = your[tag[1]] ? JSON.parse(your[tag[1]]) : false;
               if (dat) a_k(a,dat);
            }
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

function hash(a) 
{
   return bitcoinjs.crypto.sha256(JSON.stringify(a)).toString('hex')
}

function ofa(a) 
{//object from array
   const o = {};
   o.id         = a[0] ? a[0] : false;
   o.pubkey     = a[1] ? a[1] : false;
   o.created_at = a[2] ? a[2] : false;
   o.kind       = a[3] === 0 ? 0 : a[3] ? a[3] : false;
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
   const notk = document.querySelectorAll('.event:not([data-p="'+k+'"])');
   if (notk.length) { notk.forEach((l)=> { l.classList.add('hidden') })}
}

function unhide() 
{
   const hidden = document.querySelectorAll('.hidden');
   if (hidden.length) { hidden.forEach((l)=> { l.classList.remove('hidden') })}
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
   let hex, i,result = '';
   for (i = 0; i < this.length; i++) 
   {
      hex = this.charCodeAt(i).toString(16);
      result += ('000'+hex).slice(-4);
   }
   return result
}

function isElement(l) 
{
    return l instanceof Element || l instanceof HTMLDocument;  
}

function make_section(clas)
{
   let r = document.createElement('ul');
   r.classList.add('section', clas);
   r.setAttribute('data-label', clas);
   return r
}

function react(e) 
{
   if (your.reaction) 
   {
      your.removeItem('reaction');
      iot.blur();
      iot.value = '';
      iot.parentElement.dataset.content = '';
   }
   else 
   {
      iot.focus();
      iot.value = '+';
      iot.parentElement.dataset.content = '+';
      const l = e.target.closest('.event');
      your.reaction = JSON.stringify(['+', l.id.substr(2), l.dataset.p]);
      console.log(your.reaction);
   }
}

function toggle_replies(e) 
{
   const l = e.target ? e.target.closest('.event') : e;
   l.classList.toggle('replies-hidden');
}

function parse_content(e) 
{
   const l = e.target ? e.target.closest('.event') : e;
   
   if (l && l.classList.contains('parsed')) 
   {
      const content = l.querySelector('.content');
      let o;
      try 
      {
         o = JSON.parse(l.dataset.o);
      } 
      catch (error) 
      { 
         console.log('no data found');
      }    
      if (o) 
      {
         l.classList.remove('parsed');
         
         const p = document.createElement('p');
         p.textContent = merely_mentions(o.content, o.tags);
         content.replaceChildren(p);
      }  
   }
   else if (l)
   {
      l.classList.add('parsed');
      ai(l)
   }
}

function make_actions() 
{
   const actions_fragment = new DocumentFragment();
   const actions = document.createElement('p');
   actions.classList.add('actions');
   
   const load_media = document.createElement('button');
   load_media.title = 'will parse the content and load media';
   load_media.textContent = ':';
   load_media.classList.add('load-media');
   
   const reactions = document.createElement('button');
   reactions.title = 'react, 1 char limit';
   reactions.textContent = '<3';
   reactions.classList.add('reactions');

   const hide = document.createElement('button');
   hide.title = 'toggle replies'
   hide.classList.add('hide-replies');
   
   actions.append(load_media, reactions, hide);
   
   actions_fragment.append(actions);
   reactions.addEventListener('click', react);
   hide.addEventListener('click', toggle_replies);
   load_media.addEventListener('click', parse_content);
   
   return actions_fragment
}