let aa, compose, temp = {}, db = {};
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
if (!aa.k10001) aa.k10001 = [];

//const hose = {}, reqs = {}, seen = {};
let options, defaults = 
{
   days: 1, // feed limit
   media: false, //autoload media files
   log:{ demand:false, broadcast:true},
   r:  {  // bootstrap relays if no others found
            // the relays listed here are public instances 
            // maintained by the creators of the respective implementations
            
            // https://sr.ht/~gheartsfield/nostr-rs-relay/
            "wss://nostr-pub.wellorder.net":{"read":true,"write":true},
            // https://github.com/Cameri/nostream
            "wss://nostr-relay.wlvs.space":{"read":true,"write":true},
            // https://github.com/atdixon/me.untethr.nostr-relay
            "wss://nostr-relay.untethr.me":{"read":true,"write":true}
         }
};

// NIP:5 verification
const aa_nip5 = new Worker('r/aa_nip5.js');

function nip5_check(nip5,k)
{
   let [username, domain] = nip5.trim().split('@');
   if (username && domain) 
   {
      let
         nip5 = localStorage.nip5 ? JSON.parse(localStorage.nip5) : {},
         internal_check;
         
      if (nip5[domain] && nip5[domain].json.names[username]) internal_check = nip5[domain].names[username];
      if (internal_check === k) postMessage([nip5,k,true]);
      else aa_nip5.postMessage([username,domain,k]);
   }
}

function nip5_result(result) 
{
   // result = [nip5,k,bool,json]
   console.log(result);
   const wen = Date.now()/1000;
   if (result.length > 3) 
   {
      let nip5 = localStorage.nip5 ? JSON.parse(localStorage.nip5) : {};
      nip5[domain].json = json;
      nip5[domain].wen = wen;
      localStorage.nip5 = JSON.stringify(nip5);
   }

   if (result[2] === true) 
   {
      aa.p[result[1]].verified = true;
      aa.p[result[1]].verified_on = wen;
   }
//   const tit = fren.querySelector('.tit');
//   if (tit) 
//   {
//      tit.dataset.nip05 = dat.nip05;
//      fren.classList.add('nip05');
//      if (dat.nip05.startsWith('_@')) tit.classList.add('root');
//      document.querySelectorAll('a[href="#p-'+pubkey+'"]')
//      .forEach((a)=>{a.dataset.nip05 = dat.nip05});
//   }  
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
   io('','boom biddy bye bye'); // so you know what happened
   u.removeAttribute('style');
   u.textContent = '';
   history.pushState('', '', location.pathname);
   document.body.setAttribute('class', '');
   options = defaults;
}

function hashchange(e) 
{  
   let hash = location.hash;
   let hex_string = hash.split('?')[0].substr(3)
   if (is_hex(hex_string)) 
   {
      console.log(hex_string);
      switch (hash.substr(1, 1)) 
      {
         case 'e':
            sub_root(hex_string);
            break;
         case 'p':
            select_p(pubkey) 
            break;
      }
   }     
}

function new_mention(dis) 
{
   // wip, right now it just autocompletes when you click it
   const 
      iot = document.getElementById('iot'),
      helper = document.getElementById('helper');
   helper.textContent = '';
   
   Object.entries(aa.p)
   .filter(([k,dat])=> dat.name && dat.name.startsWith(dis) 
   || dat.nip05 && dat.nip05.startsWith(dis)
   || k.startsWith(dis))
   .map(([k,dat])=>
   {
      let content = '(' + hex_trun(k) + ') ' + dat.name + (dat.nip05 ? ' / ' + dat.nip05 : '');
      l = m_l('p',{cla:'helper',con:content})
      helper.append(l);
      l.addEventListener('click', ()=> 
      {
         helper.textContent = '';
         
         io(iot.value.substr(0,iot.value.length - dis.length) + dat.name + ' ');
//         iot.value += dat.name + ' ';
         iot.setSelectionRange(iot.value.length,iot.value.length);
         iot.focus();
//         let mentions = helper.dataset.mentions;
//         mentions = mentions ? JSON.parse(mentions) : [];
//         mentions.push([iot.value.substr(0,iot.value.length - dis.length), dat.name, k])
      })
   });
}

function io(text, placeholder = false) 
{
   const iot = document.getElementById('iot');
   iot.value = text;
   iot.parentElement.dataset.content = text;
   if (placeholder) iot.placeholder = placeholder;
}

function less(e) 
{
   document.body.classList.remove('mode-input');
   if (!e.target.value.length && compose) compose = false;
}

function is(e)
{  // input handler event
   const 
      iot = document.getElementById('iot'),
      helper = document.getElementById('helper');
      
   let 
      enter = false,
      clear = true;
   
   if (e.key === 'Enter' && e.shiftKey === false) 
   {
      e.preventDefault();
      enter = true;
   }
   
   const 
      n = document.createTextNode(e.target.value.trimStart()),
      v = n.wholeText,
      a = v.split(' ');
   
   if (!compose) compose = 
   {
      kind:1,
      pubkey:aa.k,
      created_at: Math.floor(Date.now() / 1000),
      content:v,
      tags:[]
   };
   else {
      compose.content = v;
   }

   let seg = a[0];
   try { seg = [...new Intl.Segmenter().segment(a[0])] } 
   catch (error) { console.log('no Intl.Segmenter(), use a better browser')};
   
   e.target.parentElement.dataset.content = v;
   
   // wip mentions
   let l_word = a[a.length - 1].toLowerCase();
   if (l_word.startsWith('@') && l_word.length > 1 && !l_word.endsWith(' ')) 
   {
      new_mention(l_word.substr(1));
   }
   else helper.textContent = '';   

   // 
   if (enter) 
   {      
      if (compose.kind === 7) 
      {
         console.log('new reaction')
      }
      
      if (a.length === 1 && seg.length === 1 && temp.reaction) 
      {
//         let note = temp.reaction;
//         if (note) {
//            note[0] = v;
//            reaction(note);
            iot.blur();
            reaction(compose);
            compose = false;
            
//         }
         
      }
      else if (temp.reaction)
      {
         console.log('too many chars', v.length);
         clear = false;
      }
      else 
      {
//       // commands switch
         delete temp.reaction;
         switch (a[0]) 
         {
            case '--bbbb': bbbb(); break;
            case '--media':
               options.media = !options.media; 
               localStorage.options = JSON.stringify(options);
               location.reload();
               break;
            case '--f':
               let fo = v.substr(3).trim().split(',');
               fo.forEach((f)=> { f = f.trim() });
               if (fo.length) follow(fo);
               break;
            case '--u':
               let un = v.substr(3).trim();
               if (un.length) unfollow(un);
               break;
            case '--k':
               if (a[1]) 
               {
                  bbbb();
                  aa.k = a[1];
                  localStorage.aa = JSON.stringify(aa);
                  location.reload();
               }
               break;
            case '--md':
               let contact = aa.p[aa.k], data;
               if (contact) 
               {
//                  data = contact.data;
//                  delete data.created_at;
                  data = JSON.stringify(contact.data);
               }
               else 
               {
                  data = 'no metadata found.'
               }
               clear = false;
               io('--smd ' + data);
               break;
            case '--smd':
               let smd = v.substr(5).trim();
               if (smd.startsWith('{') && smd.endsWith('}')) 
               {
                  set_metadata(JSON.parse(smd))
               } else {
                  console.log(smd)
               }
               break;
            case '--srl':
               let srl;
               try { srl = JSON.parse(v.substr(5).trim()) }
               catch (err) { console.log(v) }
               if (srl) set_relays(srl)
               break;
            case '--miss':
               fetch_missing(false); 
               break;
//            case '--read':
//               let unread = document.querySelectorAll('.unread');
//               if (unread.length > 0) unread.forEach(toggle_state);
//               break;
            default: 
//               compose.content = v;
//               if (helper.dataset.mentions) 
//               {
//                  console.log(helper.dataset.mentions)
//               }
               prep(compose)
         }
         
      }
      
      if (clear) io('');
   }
}

function more(e) 
{
   e.preventDefault();
   e.target.focus({ preventScroll: true });
   document.body.classList.add('mode-input');
}

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
   console.log('options', options);
   
   if (window.nostr && !aa.k) 
   {  
      window.nostr.getPublicKey().then((k) => 
      {
         aa.k = k;
         localStorage.aa = JSON.stringify(aa);
         start(k);
      });         
   } else if (aa.k) start(aa.k);
}

function update_u(k) 
{
   const u = document.getElementById('u');
   stylek(k, u);
      
   if (options.media) 
   {
      let contact = aa.p[k];
      if (contact && contact.data && contact.data.picture)
      {
         let img = u.querySelector('img');
         if (!img) 
         {
            img = document.createElement('img');
            u.replaceChildren(img)
         }
         img.src = contact.data.picture
      }
   }
}

function start(k) {
 
   if (is_hex(k)) 
   {
      io('','new post');
      document.body.classList.add('has-k');   
      update_u(k);
      document.getElementById('u').addEventListener('click', (e) => { select_p(k) });
      
      fetch_relays().then(resolve_relays);
   }     
}

function funk(e) 
{
   console.log(e.target);
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

window.addEventListener('load', (event)=> 
{  
   clean_up(); 
   
   document.getElementById('a').addEventListener('click', funk);
   
   document.getElementById('kind-1').addEventListener('click', clickEvent, false);
   const iot = document.getElementById('iot');
   iot.addEventListener('blur', less);
   iot.addEventListener('keyup', is);
   iot.addEventListener('focus', more);
   iot.addEventListener('keydown', (e)=> 
   { if (e.key === 'Enter' && e.shiftKey === false) { e.preventDefault() } });
   document.addEventListener('keyup', hotkeys);
   
   let a = document.getElementById('a');
   
}, false);
