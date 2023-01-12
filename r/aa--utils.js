function bytes_to_hex(bytes) 
{
   return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function hex_to_bytes(hex) 
{
   return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function zero_bits(b)
{
   let n = 0;
   if (b == 0) return 8;
   while (b >>= 1) n++;
   return 7-n;
}

function count_leading_zero_bits(bytes)
{
   let bits, total, i;
   for (i = 0, total = 0; i < 32; i++) 
   {
      bits = zero_bits(bytes[i]);
      total += bits;
      if (bits !== 8) break;
   }
   return total
}

function base64_to_hex(str) 
{
   const raw = atob(str);
   let i, result = ''; 
   for (i = 0; i < raw.length; i++) 
   {
      const hex = raw.charCodeAt(i).toString(16);
      result += (hex.length === 2 ? hex : '0' + hex);
   }
   return result
}

function x_days(number) 
{
   const days = new Date();
   days.setDate(days.getDate() - number); // fetch from last x days
   
   return Math.floor(days.getTime()/1000)
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
   const bff = aa.p[k];
   return bff && bff.name ? bff.name : hex_trun(k)
}



function x_0(x) 
{
   try { return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/, (thanks, cameri) => cameri)
   } catch (error) { return x }  
}

function stylek(k, l) 
{
   if (is_hex(k)) l.style.cssText = '--c:' + rgb(x_0(k)) + ';';
}

function time_since(date) 
{
   const seconds = Math.floor((new Date() - date) / 1000);
   let interval = seconds / 31536000;
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

function make_time(timestamp) 
{
   const l = document.createElement('time');   
   l.classList.add('created-at');
   l.dataset.timestamp = timestamp;
   
   l.addEventListener('click', (e)=> {update_time(l)});
   update_time(l);
   return l
}

function format_date(d)
{
   return (d.getHours()+'').padStart(2,'0') 
   +':'+ (d.getMinutes()+'').padStart(2,'0') 
   +':'+ (d.getSeconds()+'').padStart(2,'0')
   +' '+ (d.getDay()+'').padStart(2,'0') 
   +'/'+ (d.getMonth()+1+'').padStart(2,'0') 
   +'/'+ d.getFullYear()
}

function update_time(l)
{
   const ts = l.dataset.timestamp;
   const d = new Date(ts*1000);
   l.setAttribute('datetime', d.toISOString());
   l.title = format_date(d); //d.toUTCString()
   l.textContent = time_since(d);
//   l.closest('.e_e').dataset.stamp = ts;
}

function sotr(l, asc) 
{
   function sort_d(a,b,asc) 
   {
      if (asc) 
      { 
         return a.dataset.stamp > b.dataset.stamp
      }
      else 
      { // desc
         return a.dataset.stamp < b.dataset.stamp
      }
      
   }
   return [...l.children].sort( (a,b) => sort_d(a,b,asc) ? 1 : -1 )
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
   if (dat.name) 
   {
      let a_text = a.querySelector('.text');
      if (a_text.textContent !== dat.name) a_text.textContent = dat.name;
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
      if (!a_image.src || a_image.src !== dat.picture.trim()) a_image.src = dat.picture
   }
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

function dad(l, class_name) 
{ // parent events from reply to root
   for ( ; l && l !== document; l = l.parentNode ) 
   {
      if (l.classList.contains('event')) l.classList.add(class_name)
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
   if (aa.reaction) 
   {
      delete aa.reaction;
      io('');
      document.getElementById('iot').blur();
   }
   else 
   {
      io('+');
      document.getElementById('iot').focus();
      const l = e.target.closest('.event');
      aa.reaction = ['+', l.id.substr(2), l.dataset.p];
//      console.log(aa.reaction);
   }
}

function toggle_replies(e) 
{
   const l = e.target ? e.target.closest('.event') : e;
   if (!l.classList.contains('replies-hidden')) 
   {
      l.classList.add('replies-hidden');
      l.querySelectorAll('.event.new').forEach((ne)=>{ne.classList.remove('new', 'has-new')});
   }
   else 
   {
      let new_events = l.querySelectorAll('.event.new');
      if (new_events.length)
      {
         new_events.forEach((ne)=>{ne.classList.remove('new')});
         l.querySelectorAll('.has-new').forEach((ne)=>{ne.classList.remove('has-new')});
      }
      else {
         l.classList.remove('replies-hidden');
      }
      
      
   }
   
   l.scrollIntoView(stuff);
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
   function nip8(mention, index) 
   {
      const tag = tags[parseInt(index)];
      let kid;
      if (tag && tag.length >= 2) kid = tag[1];
      
      if (is_hex(kid)) 
      {
         if (tag[0] === 'p')
         {
            try { name = aa.p[kid].name }
            catch (error) { console.log('no name found') }
            
            if (name) mention = '@' + name;
            else mention = '@' + hex_trun(kid)
         }
         else if (tag[0] === 'e')
         {
            mention = '/' + hex_trun(kid)
         }         
      }
      
      return mention;
   }
   
   return text.replace(/\B#\[(\d+)\]\B/g, nip8);
   
}

function try_url(url) 
{
   let ur_l;
   try { ur_l = new URL(url) } 
   catch (error) { console.log('invalid url', url) };
//   console.log(ur_l);
   if (ur_l 
   && (ur_l.protocol === 'http:' || ur_l.protocol === 'https:')) return ur_l;
   else return false
}

function media_type(href) 
{
   const 
      lo = href.toLowerCase(),
      image_ext = ['jpg','jpeg','gif','webp','png'],
      video_ext = ['mp4'],
      audio_ext = ['mp3'],
      format = new URLSearchParams(href);
   
   function check_ext(extensions) 
   {
      let is = false;
      extensions.forEach((ext)=> 
      {  if (lo.endsWith('.'+ext)
         || (format.has('format') && format.get('format') === ext) ) is = true });
      return is
   }
   
   let check = check_ext(image_ext) ? 'image'
   : check_ext(video_ext) ? 'video'
   : check_ext(audio_ext) ? 'audio'
   : false;
   
   return check
}

function tag_link(tag)
{
   if (tag 
   && (tag[0] === 'e'
      || tag[0] === 'p'
      || tag[0] === 't'
      )
   && tag[1]
   ) 
   {
      const a = document.createElement('a');
      a.classList.add('a','a-'+tag[0]);
      a.title = tag[1];
      
      const a_text = document.createElement('span');
      a_text.classList.add('text');
      
      a.append(a_text);
      a.href = '#' + tag[0] + '-' + ur(tag[1]);
      a_text.textContent = pretty(tag[1]);
      if (tag[0] === 'e' || tag[0] === 'p') stylek(tag[1], a);      
      if (tag[0] === 'p' && is_hex(tag[1]) && aa.p[tag[1]]) a_k(a,aa.p[tag[1]]);
      return a
   }
         
   return false
}

function parse_link(url) 
{
   let ur_l = try_url(url); 
   if (ur_l) 
   {
      const 
         src = ur_l.origin + ur_l.pathname,
         type = options.media ? media_type(src) : false;

      let link;      
      switch (type) 
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
         default:
            link = document.createElement('a');
            link.href = ur_l.href;
            link.classList.add('content-link');
            link.target = '_blank';
            link.rel = 'nofollow';
            link.textContent = ur_l.href;
      } 
      return link
   }
   return false
}

function ai(o) 
{
   const 
      p = document.createElement('p'),
      oc = document.createTextNode(o.content),
      ocd = oc.wholeText,
      matches = {},
      matchy_mentions = [...ocd.matchAll(/\B#\[(\d+)\]\B/g)],
//      matchy_links = [...ocd.matchAll(/\b(https?:\/\/\S*\b)/g)];
      matchy_links = [...ocd.matchAll(/(\b(https?):\/\/[-A-Z0-9+&@#\/\*%?=~_|!:,.;]*[-A-Z0-9+&@$#\/%=~_|]*)/gim)];

      

   matchy_mentions.forEach((match)=> { matches[match.index] = match[0] });
   matchy_links.forEach((match)=> { matches[match.index] = match[0] });
   
   if (Object.keys(matches).length) 
   {
      let curser = 0;
      let sorted = Object.entries(matches).sort((a,b)=> a - b); 
      sorted.forEach(([i,m], index)=>
      {
         let i_nt = parseInt(i)
         
         p.append(document.createTextNode(ocd.substring(curser,i_nt)));
            
         if (m.startsWith('#[')) 
         {
            let mi = parseInt(m.replace(/\D/g,''));
            if (o.tags[mi] && is_hex(o.tags[mi][1]))
            {
               let mention = tag_link(o.tags[mi]);
               if (mention) p.append(mention);
               else p.append(document.createTextNode(m));
            }                              
         }
         else 
         {
            let link = parse_link(m);
            if (link) p.append(link);
         }
         curser = i_nt + m.length;
         if (index === sorted.length - 1) p.append(document.createTextNode(ocd.substring(curser)));
      });
   }
   else p.append(oc);
   
   return p
}

async function parse_content(e) 
{
   const l = e.target ? e.target.closest('.event') : e;
   let o; 
   try { o = db[l.id.substr(2)].o } 
   catch (error) { console.log('no data found') } 
   
   if (o && l) 
   {
      const content = l.querySelector('.content');
      
      if (l.classList.contains('parsed')) 
      {
         l.classList.remove('parsed');
         const p = document.createElement('p');
         p.textContent = merely_mentions(o.content, o.tags);
         
         if (content) content.replaceChildren(p);
      }
      else
      {
         l.classList.add('parsed');
         if (content) {
            
         }
         try { content.replaceChildren(ai(o)) } catch (error) { console.log('could not parse', o) }
         
         let media = content.querySelector('img, video, audio, iframe');
         if (media) 
         { 
            content.classList.add('has-media');
            let videos = content.querySelectorAll('video');
            if (videos) videos.forEach(rap);
         }
      }
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

function m_l(tag_name, o = false)
{
   const l = document.createElement(tag_name);
   if (o) 
   {
      if (o.id)  l.id = o.id;
      if (o.cla) l.classList.add(o.cla);
      if (o.lab) l.dataset.label = o.lab;
      if (o.ref) l.href = o.ref;
      if (o.src) l.src = o.src;
      if (o.tit) l.title = o.tit;
      if (o.con) l.textContent = o.con;  
   }
   return l
}