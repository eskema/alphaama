let aa, compose, drafts = {}, temp = {}, db = {};
try { aa = JSON.parse(localStorage.aa) } 
catch (error) 
{ 
   console.log('fresh start');
   aa = 
   {
      p:{},
      bff:[],
      ff:[],
      k0:[],
      k3:[],
      k10001: []
   }
}

function save_aa() 
{
   localStorage.aa = JSON.stringify(aa)
}

if (!aa.k10001) aa.k10001 = [];

//const hose = {}, reqs = {}, seen = {};
let options, defaults = 
{
   days: 1, // feed limit
   media: false, //autoload media files
   reaction: '+', // default reaction char
   log:{ demand:false, broadcast:true},
   
   r: {  // bootstrap relays if no others found
         // the relays listed here are public instances 
         // maintained by the creators of the respective implementations
         
         // https://sr.ht/~gheartsfield/nostr-rs-relay/
         "wss://nostr-pub.wellorder.net":{"read":true,"write":true},
         // https://github.com/Cameri/nostream
         "wss://eden.nostr.land":{"read":true,"write":true},
         // https://github.com/atdixon/me.untethr.nostr-relay
         "wss://nostr-relay.untethr.me":{"read":true,"write":true}
      }
};

// NIP:5 verification
const aa_nip5 = new Worker('r/aa_nip5.js');

function nip5_check(nip5,k, re = false)
{
   let [username, domain] = nip5.trim().split('@');
   if (username && domain) 
   {
      let
         nip5 = localStorage.nip5 ? JSON.parse(localStorage.nip5) : {},
         internal_check;
         
      if (!re && nip5[domain] && nip5[domain].json.names[username]) internal_check = nip5[domain].json.names[username];
      
      if (internal_check === k) nip5_result([nip5,k,true]);
      else aa_nip5.postMessage([username,domain,k]);
   }
}

function nip5_result(result) 
{
   // result = [nip5,k,bool,json]
   console.log(result);
   const wen = now();
   if (result.length > 3) 
   {
      let domain = result[0].split('@')[1];
      let nip5 = localStorage.nip5 ? JSON.parse(localStorage.nip5) : {};
      if (!nip5[domain]) nip5[domain] = {};
      nip5[domain].json = result[3];
      nip5[domain].wen = wen;
      localStorage.nip5 = JSON.stringify(nip5);
   }
   aa.p[result[1]].last_verified = wen;
   aa.p[result[1]].verified = result[2];
   update_fren(aa.p[result[1]]); 
}

aa_nip5.onmessage=e=>{nip5_result(e.data)};

// wip adding webtorrent support
//const wt = new WebTorrent();

async function fetch_relays() 
{
   return new Promise(resolve=>
   {
      if (window.nostr) 
      { 
         window.nostr.getRelays().then((r)=>
         {
            if (!Object.keys(r).length) r = options.r;
            resolve(r)
         });
      } 
      else resolve(options.r)
   });
}

const resolve_relays = (list) =>
{
   if (!Object.keys(list).length) list = options.r;
   add_relaytion(list) 
}

function bbbb()
{// boom biddy bye bye
 // tries to forget everything
   localStorage.clear(); 
   sessionStorage.clear(); 
   document.getElementById('kind-0').textContent = ''; // contacts
   document.getElementById('kind-1').textContent = ''; // timeline
   io({t:'',p:'boom biddy bye bye'}); // so you know what happened
   u.removeAttribute('style');
   u.textContent = '';
   history.pushState('', '', location.origin+location.pathname);
   document.body.setAttribute('class', '');
   options = defaults;
}

function view_close()
{
   // close fren
   let solo = document.querySelector('.fren.solo');
   if (solo) 
   {
      document.body.classList.remove('p-k');
      solo.classList.remove('solo');
      let active = solo.querySelector('section.active');
      if (active) active.classList.remove('active');
      unhide();
   }
   
   let interesting = document.querySelector('.interesting');
   if (interesting)
   {
      document.body.classList.remove('has-interesting');
      document.getElementById('iot').placeholder = 'new post';
      interesting.classList.remove('interesting');
      sessionStorage.removeItem('interesting'); 
      const moms = document.querySelectorAll('.mom');
      moms.forEach((mom)=> { mom.classList.remove('mom') });
   }
   
}

const state_pop = (e) =>
{
//   console.log('pop', history.state);
   let state = history.state;
   if (!state) 
   {
      state = {nostr:hash_get(), from:''};
      history.pushState(state, '', location.origin+location.pathname+'#'+state.nostr);
   }
   else 
   {
      switch (state.nostr.substr(0,4)) 
      {
         case 'npub': p_open(history.state.nostr); break;
         case 'note': e_open(history.state.nostr); break;
//         case 'nprofile':
//         case 'nrelay':
         default: view_close()
      }
   }
};

function nostr_link(e) 
{
   e.preventDefault();
   let state, dis = e.target.dataset.nostr;
   if (history.state.nostr === dis) state = {nostr:'',from:dis};
   else state = {nostr:dis,from:history.state.nostr};
   history.pushState(state,'','#'+state.nostr);
   state_pop('');
}

function hash_get() 
{
   return location.hash.split('?')[0].substr(1)
}



function io(t) 
{
   const iot = document.getElementById('iot');
   if (t.hasOwnProperty('t'))
   {
      iot.value = t.t;
      iot.parentElement.dataset.content = t.t;
   }
   if (t.p) iot.placeholder = t.p;
   if (t.b)
   {
      
      iot.blur();
      less('');
   }
   if (t.f)
   {
      iot.focus();
      iot.setSelectionRange(iot.value.length,iot.value.length);
   }
}

function compose_clear() 
{
   compose = false;
   document.getElementById('compose-tags').textContent = '';
   document.getElementById('helper').textContent = '';
   io({t:'',b:1});
}

function less(e) 
{
//   console.log(document.activeElement.closest('#wtfyw'));
//   if (document.activeElement !== document.body && !document.activeElement.closest('#wtfyw'))
//   { 
//      if (!e.target.value.length && compose) compose = false;
//      document.body.classList.remove('mode-input');
//   }
   if (!document.getElementById('iot').value.length && compose)
   {
      compose_clear();
   }
   document.body.classList.remove('mode-input');
}

function one_char(string) 
{
   let a = string.split(' ');
   let seg = a[0];
   try { seg = [...new Intl.Segmenter().segment(a[0])] } 
   catch (error) { console.log('no Intl.Segmenter(), use a better browser')};
   
   if (a.length === 1 && seg.length === 1) return true;
   else return false
}

function is(e)
{  
   // input handler event
   const 
      helper = document.getElementById('helper'),
      n = document.createTextNode(e.target.value.trimStart()),
      w = n.wholeText,
      a = w.split(' ');
   
   e.target.parentElement.dataset.content = w;
   compose.o.content = w;
   
   if (e.key === 'Enter' && e.shiftKey === false) 
   { 
      e.preventDefault();
      
      if (a[0] === '--aa' ) kinda[a[1]](w);
      else
      {
         console.log(compose);
         if (drafts[compose.o.id]) delete drafts[compose.o.id];
         switch (compose.o.kind) 
         {
            case 1: draft(); break;
            case 7: if (one_char(w)){ draft() } break;
         }
         
      }
   }
   else 
   {
      // still not finished typing
      // todo: auto-complete
   
      // if (v.startsWith('--aa')) 
//      if (compose) 
//      {
//         helper.dataset.compose = compose.reply ? 'reply to ' + compose.reply.n : 'new post';
//         
//      }
      
      // wip mentions
      let l_word = a[a.length - 1].toLowerCase();
      if (l_word.startsWith('@') && l_word.length > 1 && !w.endsWith(' ')) 
      {
         new_mention(l_word.substr(1));
      }
      else 
      {
         if (w==='') compose_edit_tags();
         else helper.textContent = '';  
      }
   }
}

function build_reply_tags() 
{
   
   
   const hashtags = parse_hashtags(compose.o.content);
   if (hashtags.length) hashtags.forEach((t)=>{ compose.o.tags.push(t) });
   
}

function new_mention(dis) 
{
   // wip, right now it just autocompletes when you click it
   const 
      iot = document.getElementById('iot'),
      compose_tags = document.getElementById('compose-tags'),
      helper = document.getElementById('helper');
   helper.textContent = '';
   
   Object.entries(aa.p)
   .filter(([k,dat])=> dat.data).filter(([k,dat])=>
   (dat.data.name && dat.data.name.startsWith(dis))
   || (dat.data.nip05 && dat.data.nip05.startsWith(dis))
   || k.startsWith(dis))
   .map(([k,dat])=>
   {
      let content = '(' + hex_trun(k) + ') ' + dat.data.name + (dat.data.nip05 ? ' / ' + dat.data.nip05 : '');
      l = m_l('p',{cla:'helper',con:content})
      helper.append(l);
      l.addEventListener('click', ()=> 
      {
         let tag = ['p',k];
         if (!compose.o.tags.includes(tag)) 
         {
            compose.o.tags.push(tag);
            compose_tags.append(compose_make_tag(tag));
         }
         
         let index = compose.o.tags.indexOf(tag);
         helper.textContent = '';
         io({t:iot.value.substr(0,iot.value.length - dis.length - 1) + '#['+index+']',f:1});
//         iot.value += dat.name + ' ';
//         iot.setSelectionRange(iot.value.length,iot.value.length);
//         iot.focus();
//         let mentions = helper.dataset.mentions;
//         mentions = mentions ? JSON.parse(mentions) : [];
//         mentions.push([iot.value.substr(0,iot.value.length - dis.length), dat.name, k])
      })
   });
}

function more(e) 
{
   e.preventDefault();
   e.target.focus({ preventScroll: true });
   document.body.classList.add('mode-input');
   const helper = document.getElementById('helper');
   if (!compose) compose = {o:{kind:1,pubkey:aa.k,created_at:now(),tags:[]},draft:1};
   if (history.state.nostr.startsWith('note'))
   {
      if (!compose.reply || compose.reply.n !== history.state.nostr) 
      {
         console.log('compose',compose);
         compose.reply = db[dcode(history.state.nostr)];
         compose.o.tags = [...preptags(compose.reply.o)];
         compose_edit_tags();
      }
      
//      helper.dataset.compose = 'reply to ' + aa.p[compose.reply.o.pubkey].data.name;
   }
   else 
   {
//      helper.dataset.compose = 'new post';  
   }
}

function compose_make_tag(tag) 
{
   let l = m_l('li',{cla:'compose-tag',con:tag.join(' ')});
   if ((tag[0] === 'e' && (tag[3] === 'reply' || tag[3] === 'root'))
   || (compose.reply && tag[0] === 'p' && tag[1] === compose.reply.o.pubkey)) 
   {
      l.classList.add('required');
   }
   
   if (tag[0] === 'p' || tag[0] === 'e') 
   {
      let content = tag[0] + ' ' + hex_trun(tag[1]);
      if (tag[2]) content += ' ' +tag[2];
      if (tag[3]) content += ' ' +tag[3];
      l.textContent = content;
   }
   
   if (tag[0] === 'p') 
   {
      let dat = aa.p[tag[1]];
      if (dat)
      {
         if (dat.data && dat.data.name) l.dataset.name = dat.data.name;
      }
   }

   l.dataset.tag = tag;
   
   l.addEventListener('click', (e)=> 
   {
      let tag = e.target.dataset.tag.split(',');
      if (!compose.rm) compose.rm = [];
      compose.rm.push(...compose.o.tags.splice(compose.o.tags.indexOf(tag),1));
      document.getElementById('compose-tags').removeChild(l);
//            io({t:iot.value.substr(0,iot.value.length - dis.length) + dat.data.name + ' ',f:1});
   });
   
   return l
}

function compose_edit_tags() 
{
   const cp_tags = document.getElementById('compose-tags');
   cp_tags.textContent = '';
   cp_tags.dataset.length = compose.o.tags.length;
   if (compose.o.tags.length) compose.o.tags.forEach((tag)=>{ cp_tags.append(compose_make_tag(tag)) })
//   helper.textContent = compose.o.tags;
}

function kinda_follow(v)
{  // --aa f pubkey, relay, petname
   // follow pubkey
   let p = v.substr(3).trim().split(',');
   p.forEach((part)=> { part = part.trim() });
   if (p.length) follow(p);
}

function kinda_unfollow(v)
{  // --aa u pubkey
   // unfollow pubkey
   let k = v.substr(3).trim();
   if (k.length) unfollow(k);
}

function kinda_k(k)
{  // --aa k pubkey
   // login as pubkey in read-only mode
   if (k.length === 64 && is_hex(k)) 
   {
      bbbb();
      aa.k = k;
      save_aa();
      location.reload();
   }
}

function kinda_media()
{
   // --aa media
   options.media = !options.media; 
   localStorage.options = JSON.stringify(options);
   location.reload();
}

function kinda_metadata() 
{
   // --aa md
   let contact = aa.p[aa.k];
   io({t:contact ? '--aa smd ' + JSON.stringify(contact.data) : 'no metadata found.'});
}

function kinda_set_md(v) 
{
   // --aa smd {metadata}
   let jsmd;
   try { jsmd = JSON.parse(v.substr(8).trim()) }
   catch (error) { console.log(smd) }
   if (jsmd) set_metadata(jsmd)
}

function kinda_set_relays(v) 
{
   // --aa srl {relays}
   let srl;
   try { srl = JSON.parse(v.substr(8).trim()) }
   catch (err) { console.log(v) }
   if (srl) set_relays(srl)
}

function kinda_options(v) 
{
   // --aa sop {options}
   let sop;
   try { sop = JSON.parse(v.substr(8).trim()) }
   catch (err) { console.log(v) }
   if (sop) { options = sop; localStorage.options = JSON.stringify(options) } 
}

const kinda = 
{
   bbbb:(v)=>{bbbb()},
   f:(v)=>{kinda_follow(v)},
   u:(v)=>{kinda_unfollow(v)},
   k:(v)=>{kinda_k(v)},
   media:(v)=>{kinda_media()},
   md:(v)=>{kinda_metadata()},
   smd:(v)=>{kinda_set_md(v)},
   srl:(v)=>{kinda_set_relays(v)},
   miss:(v)=>{fetch_missing(false);io({t:'',b:1})},
   ops:(v)=>{io({t:'--aa sop ' + JSON.stringify(options)})},
   sop:(v)=>{kinda_options(v)}
};



function clean_up() 
{
//   bbbb();
//   sessionStorage.clear();
   if (window.nostr) 
   {  // nos2x
      console.log('signer extension available');
/*
window.nostr.getPublicKey(); //: string // returns your public key as hex
window.nostr.signEvent(event): Event // returns the full event object signed
window.nostr.getRelays(): { [url: string]: RelayPolicy } // returns a map of relays
window.nostr.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
window.nostr.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
*/         
   }
   if (!localStorage.options) localStorage.options = JSON.stringify(defaults);
   options = JSON.parse(localStorage.options);
   if (!options.log) options.log = { demand:false, broadcast:true, eose: false};
   if (!options.rection) options.reaction = '+';
   localStorage.options = JSON.stringify(options);
   console.log('options', options);
   
   if (window.nostr && !aa.k) 
   {  
      window.nostr.getPublicKey().then((k) => 
      {
         aa.k = k;
         save_aa();
         start(k);
      });         
   } else if (aa.k) start(aa.k);
}



function update_u(contact) 
{
   const u = document.getElementById('u');
   stylek(contact.pub, u);
   u.dataset.nostr = contact.npub;
   if (options.media && contact.data.picture)
   {
      let img = u.querySelector('img');
      if (!img) 
      {
         img = document.createElement('img');
         u.replaceChildren(img)
      }
      img.src = contact.data.picture
   }
   u.addEventListener('click', nostr_link, false);
}

function start(k) 
{
   io({t:'',p:'new post'});
   document.body.classList.add('has-k');   
   let contact = p_get(k);
   update_u(contact);
   fetch_relays().then(resolve_relays);
}



//let last_known_scroll_position = 0;
//let ticking = false;
//
//function aa_scroll(e) 
//{
//   last_known_scroll_position = window.scrollY;
//   
//   if (!ticking) 
//   {
//      window.requestAnimationFrame(()=> 
//      {
//         handle_scroll(last_known_scroll_position, page);
//         ticking = false;
//      });
//   
//      ticking = true;
//   }
//}
//
//window.addEventListener('scroll', scroll);

function funk(e) 
{
//   history.pushState('aa','',location.origin + location.pathname);
   history.back();
   console.log(e.target);
}

window.addEventListener('load', (e)=> 
{  
   // update stuff from previous versions and make sure everything is good
   clean_up(); 
   
   // event listeners
   //
   // history list, when clicked for now should get you back
   document.getElementById('a').addEventListener('click', funk);
   // input and other things
   const iot = document.getElementById('iot');
   const les = document.getElementById('less');
   les.addEventListener('click', less);
   iot.addEventListener('keyup', is);
   iot.addEventListener('focus', more);
   iot.addEventListener('keydown', (kd)=> 
   { if (kd.key === 'Enter' && kd.shiftKey === false) { kd.preventDefault() } });
   // navigation hotkeys wen a note is selected
   document.addEventListener('keyup', hotkeys);
   const lists = document.querySelectorAll('.list');
   lists.forEach((l)=>{ l.addEventListener('click',togl) });
   
//   
//   hash_change(event);
   state_pop(e);
});

//window.addEventListener('hashchange', hash_change);
window.addEventListener('popstate', state_pop);