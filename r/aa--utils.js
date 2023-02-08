
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
   const contact = aa.p[k];
   return contact && contact.data && contact.data.name ? contact.data.name : hex_trun(k)
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

function now() 
{
   return Math.floor(Date.now() / 1000)
}

function time_since(date) 
{
   const dis = (interval) => { return (Math.floor(interval) + '').padStart(2,'0') };
   
   const seconds = Math.floor((new Date() - date) / 1000);
   
   let interval = seconds / 31536000;
   if (interval > 1) return  dis(interval) + "Y";
   
   interval = seconds / 2592000;
   if (interval > 1) return  dis(interval) + "M";   
   
   interval = seconds / 86400;
   if (interval > 1) return  dis(interval) + "d";
   
   interval = seconds / 3600;
   if (interval > 1) return  dis(interval) + "h";
   
   interval = seconds / 60;
   if (interval > 1) return  dis(interval) + "m";
   
   return dis(seconds) + "s";
}

const update_time = (e)=> {e.target.title = time_since(dt(e.target.dataset.timestamp))}

function make_time(timestamp) 
{
   const l = document.createElement('time');   
   l.classList.add('created-at');
   l.dataset.timestamp = timestamp;
   
//   l.addEventListener('click', (e)=> {update_time(l)});
//   update_time(l);
   const d = dt(timestamp);
   l.setAttribute('datetime', d.toISOString());
   l.title =  time_since(d);
   l.textContent = format_date(d);
   
   l.addEventListener('click', update_time);
   return l
}

function dt(timestamp_in_seconds) 
{
   return new Date(timestamp_in_seconds*1000)
}

function format_date(d)
{  
   return d.getFullYear()
   +'/'+ (d.getMonth()+1+'').padStart(2,'0') 
   +'/'+ (d.getDate()+'').padStart(2,'0') 
   +' '+ (d.getHours()+'').padStart(2,'0') 
   +':'+ (d.getMinutes()+'').padStart(2,'0') 
   +':'+ (d.getSeconds()+'').padStart(2,'0')
}

//function update_time(l)
//{
//   const ts = l.dataset.timestamp;
//   const d = dt(ts);
//   l.setAttribute('datetime', d.toISOString());
//   l.title =  time_since(d);
//   l.textContent = format_date(d);
//}

function sort_ca(a,b,asc) 
{
   if (asc) 
   { 
      return a.created_at > b.created_at
   }
   else 
   { // desc
      return a.created_at < b.created_at
   }
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

function a_k(a,contact) 
{
   if (contact.data) 
   {
      if (contact.data.name) 
      {
         let name = contact.data.name.substr(0, 100);
         let a_text = a.querySelector('.text');
         if (a_text.textContent !== name) a_text.textContent = name;
      }
      let a_image = a.querySelector('img');
      if (options.media && contact.trust && contact.trust !== 'false' && contact.data.picture) 
      {
         if (!a_image)
         {
            a_image = m_l('img',{cla:'picture'});
            a.append(a_image);
         }
         if (!a_image.src || a_image.src !== contact.data.picture.trim()) a_image.src = try_url(contact.data.picture);
         a.classList.add('has-picture')
      }
      else if (a_image) a.removeChild(a_image)
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
   const l = e.target.closest('.event');
   if (compose && compose.o && compose.o.kind && compose.o.kind === 7 ) 
   {
      l.classList.remove('reacting');
      compose_clear();
//      delete temp.reaction;
//      io({t:''});
//      document.getElementById('iot').blur();
   }
   else 
   {

      l.classList.add('reacting');
//      temp.reaction = ['+', l.id, l.dataset.p];

      compose = {o:
      {
         kind:7,
         pubkey:aa.k,
         created_at: now(),
         content:options.reaction,
         tags:[['e',l.dataset.x,get_seen(l.dataset.x)],['p',l.dataset.p]]
      }, reply: db[l.dataset.x], draft:1,seen:[]};
      draft();
      
      
//      io({t:compose.o.content});
//      document.getElementById('iot').focus();
      
//      console.log(temp.reaction);
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

function togl(e) 
{
//   console.log('togl', e.target)
   e.target.classList.toggle('active')
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
            let name;
            try { name = aa.p[kid].data.name }
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

function tag_link(tag, content = false)
{
   const a = document.createElement('a');
   a.classList.add('a','a-'+tag[0]);
   a.title = tag[1];
   
   const a_text = document.createElement('span');
   a_text.classList.add('text');
   
   a.append(a_text);
   
   if (tag[0] === 'e' || tag[0] === 'p') 
   {
//      a.href = '#' + tag[0] + '-' + ur(tag[1]);
      let encoded = tag[0] === 'e' ? x_note(tag[1]) : x_npub(tag[1]);
      a.dataset.nostr = encoded;
      a.href = '#' + encoded;
      a_text.textContent = pretty(tag[1]);
      stylek(tag[1], a);      
      if (tag[0] === 'p' && is_hex(tag[1]) && aa.p[tag[1]]) a_k(a,aa.p[tag[1]]);
      a.addEventListener('click', nostr_link);
   }
   else a_text.textContent = content ? content : tag[1];
   return a
}

function parse_magnet(magnet)
{
   let ur = new URL(m);
   if (ur.protocol === 'magnet:' && ur.searchParams.has('xt')) 
   {
      let xt = ur.searchParams.get('xt');
      
      if (xt.startsWith('urn:btih:')) 
      {
         xt = xt.substr(9);
         console.log(xt);
         let dn = ur.searchParams.has('dn') ? ur.searchParams.get('dn') : 'no name';
         let maglink = m_l('a',{cla:'magnet', con:'magnet link: '+dn, ref:magnet});
         maglink.target = '_blank';
         
         p.append(maglink);
         maglink.addEventListener('click', (e)=> 
         {
            wt.add(m,(torrent)=> 
            {
              const ul = m_l('ul',{cla:'torrents'})
              torrent.files.forEach((file)=>
              {
                  ul.append(m_l('li',{con:file.name}))
              });
              p.append(ul)
            });
         });
      }
   }
}

function parse_lnbc(lnbc)
{
   let bolt_11, lnbc_link;
            
   try { bolt_11 = BOLT11.decode(lnbc) } 
   catch (error) { 
//      console.log(m,ocd,error) 
   }
   
   if (bolt_11) 
   {
      lnbc_link = m_l('a',
      {
         cla:'content-lnbc',
         ref:'lightning:' + bolt_11.paymentRequest, 
         con:'⚡️ ' + (bolt_11.sections[2].value / 1000) + ' sats',
         tit:bolt_11.sections[6].value
      });
      lnbc_link.rel = 'noopener noreferrer';
      lnbc_link.target = '_blank';
   }
   else lnbc_link = document.createTextNode(lnbc);
   
   return lnbc_link
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
            link.addEventListener('click', togl);
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
            link.rel = 'noopener noreferrer';
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
      matchy_mentions = [...ocd.matchAll(/#\[(\d+)\]/g)],
//      matchy_links = [...ocd.matchAll(/\b(https?:\/\/\S*\b)/g)];

//      matchy_links = [...ocd.matchAll(/(\b(https?):\/\/[-A-Z0-9+&@#\/\*%?=~_|!:,.;]*[-A-Z0-9+&@$#\/%=~_|]*)/gim)],
      matchy_links = [...ocd.matchAll(/((https?):\/\/[-A-Z0-9+&@#\/\*%?=~_|!:.,;]*[-A-Z0-9+&@$#\/%=~_|]*)\b/gim)],

      matchy_magnet = [...ocd.matchAll(/(magnet:\?xt=urn:btih:.*)/gi)],
      matchy_lnbc = [...ocd.matchAll(/((lnbc)[-A-Z0-9]*)\b/gi)];

      

   matchy_mentions.forEach((match)=> { matches[match.index] = match[0] });
   matchy_links.forEach((match)=> { matches[match.index] = match[0] });
   matchy_magnet.forEach((match)=> { matches[match.index] = match[0] });
   matchy_lnbc.forEach((match)=> { matches[match.index] = match[0] });
   
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
            if (o.tags[mi] 
            && is_hex(o.tags[mi][1])
            && (o.tags[mi][0] === 'e' || o.tags[mi][0] === 'p')
            )
            {
               let mention = tag_link(o.tags[mi]);
               if (mention) p.append(mention);
               else p.append(document.createTextNode(m));
            }                              
         }
         else if (m.startsWith('magnet'))
         {  
//            let magnet = parse_magnet(m);
            p.append(document.createTextNode(m))
         }
         else if (m.toLowerCase().startsWith('lnbc'))
         {
            p.append(parse_lnbc(m));
//            console.log(bolt_11);
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
   try { o = db[l.dataset.x].o } 
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
//         if (content) {
//            
//         }
         try { content.replaceChildren(ai(o)) } 
         catch (error) { console.log('could not parse', o) }
         
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
//   const actions_fragment = new DocumentFragment();
   const actions = m_l('p',{cla:'actions'});
//   const actions = document.createElement('p');
//   actions.classList.add('actions');
   
   const load_media = m_l('button',{cla:'load-media',con:':',tit:'will parse the content and load media'});
   load_media.addEventListener('click', parse_content);
   
   const reactions = m_l('button',{cla:'reactions',con:'<3',tit:'react, 1 char limit'});
//   reactions.title = 'react, 1 char limit';
//   reactions.textContent = '<3';
//   reactions.classList.add('reactions');
   reactions.addEventListener('click', react);

   const hide = m_l('button',{cla:'hide-replies',tit:'toggle replies'});
//   hide.title = 'toggle replies'
//   hide.classList.add('hide-replies');
   hide.addEventListener('click', toggle_replies);
   
   actions.append(load_media, reactions, hide);
   
   return actions
}

function view_source(e) 
{
   e.preventDefault();
   let event = e.target.closest('.event');
   event.classList.toggle('view-source');
   let source = child_from_class(event, 'source');
   if (!source)
   {
      source = raw_event(event.classList.contains('draft') ? drafts[event.dataset.x] : db[event.dataset.x]);
      source.classList.add('source');
      event.append(source);
   }
}

function draft_post(e) 
{
   let event = e.target.closest('.event');
//   let unsigned = JSON.parse(localStorage[event.id.substr(2)]);
//   console.log(drafts[event.dataset.x]);
   
   sign(drafts[event.dataset.x].o);
}

function draft_edit(e) 
{
   let event = e.target.closest('.event');
   compose = drafts[event.dataset.x];
   compose_edit_tags();
   io({t:compose.o.content,f:1});
//   let content = event.querySelector('.content').textContent;
//   switch (event.dataset.kind) {
//      case "0":
//         content = '--smd ' + content;
//         break;
//   }
   draft_cancel(e);
//   let par = event.parentElement;
//   event.remove();
//   if (par.classList.contains('replies') && !par.childNodes.length) par.closest('.event').classList.remove('has-replies');
   
   
//   io(compose.o.content);
   
}

function draft_cancel(e)
{
   let event = e.target.closest('.event');
   let par = event.parentElement;
   if (event.classList.contains('interesting')) not_interesting(event);
   event.remove();
   if (par.classList.contains('replies') && !par.childNodes.length) par.closest('.event').classList.remove('has-replies');
}

function make_draft_actions() 
{
   const actions = m_l('p',{cla:'actions-draft'});
   
   const post_btn = m_l('button',{cla:'post',con:'post'});
   post_btn.addEventListener('click', draft_post);
   
   const edit_btn = m_l('button',{cla:'edit',con:'edit'});
   edit_btn.addEventListener('click', draft_edit);
   
   const cancel_btn = m_l('button',{cla:'cancel',con:'cancel'});
   cancel_btn.addEventListener('click', draft_cancel);
   
   actions.append(post_btn, edit_btn, cancel_btn);
   
   return actions
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