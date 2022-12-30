let aa;
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
      rekt:{}
   };
};

const hose = {}, reqs = {}, seen = {};
let options, relays, defaults = 
{
   'days': 1, // feed limit
   'media': false, //autoload media files
   'r': { // bootstrap relays if no others found
          "wss://nostr-pub.wellorder.net":{"read":true,"write":true},
          "wss://nostr-relay.wlvs.space":{"read":true,"write":true},
          "wss://relay.damus.io":{"read":true,"write":true} }
};

const re = new Worker('r/aa_relays_ww.js');
re.onmessage=e=>{ pre_process(e.data) };
async function fetch_relays() 
{
   return new Promise(resolve=>
   {
      if (window.nostr) 
      { 
         resolve(window.nostr.getRelays()) 
      } 
      else resolve(options.r)
   });
}

function aa_open(dis, reconnect = false) 
{
   const req = ['REQ', 'aa-open'];
   const subs = [aa.k, ...aa.bff];
   const day_since = x_days(options.days);
   const wen = reconnect && aa.t ? aa.t > day_since ? aa.t : day_since : day_since;
   // profiles and contacts from your you and your follows
   let filter = {authors: subs, kinds:[0,3]};
//   if (aa.k3.length) filter.since = wen;
   req.push(filter);
   // notes and reactions from your you and your follows
   filter = {authors: subs, kinds:[1,7], since: wen};
   req.push(filter);
   // replies to your posts
   filter = {'#p': [aa.k], kinds:[1,7], since: wen};
   req.push(filter);
   re.postMessage(['req', [req, dis]]);
   console.log(dis, req);
}

function pre_process([type, dis, dat]) 
{
//   console.log(type, dis, dat);
   
   switch (type) 
   {
      case 'OPEN':
//         console.log(type, dis, dat);
         if (dat === 1) 
         {
            if (!reqs[dis]) reqs[dis] = {};
            if (!reqs[dis]['aa-open']) 
            {
               reqs[dis]['aa-open'] = 1;
               aa_open(dis) 
            }
            else aa_open(dis, true)
         }
         break
      case 'STATE':
      case 'NOTICE':
         console.log(type, dis, dat);
//         let relay = document.querySelector('[data-label="'+new URL(dis).hostname+'"]');
//         if (relay) relay.dataset.state = dat;
         break;
      case 'EOSE': 
         console.log(type, dis, dat[1].length);
         dat[1].map((o)=>{ process(o) }); 
         setTimeout(()=>{fetch_missing(dis+"/")}, 500);
         break;
      case 'EVENT': 
         process(dat[1]); 
         setTimeout(()=>{fetch_missing(dis+"/")}, 1000);
//         fetch_missing(dis+"/");
//         fetch_some();
         break;      
   }
}

//else if (!relays) relays = options.r;

function bbbb()
{// boom biddy bye bye
 // tries to forget everything
   localStorage.clear(); 
   sessionStorage.clear(); 
   document.getElementById('kind-0').textContent = ''; // contacts
   document.getElementById('kind-1').textContent = ''; // timeline
   iot.placeholder = 'boom biddy bye bye'; // so you know what happened
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

function less(e) 
{
   document.body.classList.remove('mode-input');
}

function is(e)
{  // input handler event
   let 
      enter = false,
      clear = true;
   
   if (e.key === 'Enter' && e.shiftKey === false) 
   {
      e.preventDefault();
      enter = true;
   }
   
   const 
      n = document.createTextNode(e.target.value.trim()),
      v = n.wholeText,
      a = v.split(' ');
   
   let seg = a[0];
   try { seg = [...new Intl.Segmenter().segment(a[0])] } 
   catch (error) { console.log('no Intl.Segmenter()','use a better browser')};
   
   e.target.parentElement.dataset.content = v;
   
//   if (a[a.length - 1].startsWith('@')) {
//      mention(a[a.length - 1].substr(1));
//   }
 
   if (enter) {
      
      console.log(v);       
      
      // commands switch
      
      if (a.length === 1 && seg.length === 1 && aa.reaction) 
      {
         let note = aa.reaction;
         if (note) {
            note[0] = v;
            reaction(note);
            iot.blur();
         }
         
      }
      else if (aa.reaction)
      {
         console.log('too many chars', a);
         clear = false;
      }
      else 
      {
//         console.log('command', a);
         delete aa.reaction;
         switch (a[0]) 
         {
            case '--bbbb': // boom biddy bye bye, 
               // destroys everything, 
               // or at least tries to..
               bbbb();
               break;
            case '--media':
               options.media = !options.media; 
               localStorage.options = JSON.stringify(options);
               location.reload();
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
            case '--f':
               if (a[1]) 
               {
                  follow(a[1]);
               }
               break;
            case '--u':
               if (a[1]) 
               {
                  unfollow(a[1]);
               }
               break;
            case '--md':
               let data = aa.p[aa.k];
               if (data) 
               {
                  delete data.created_at;
                  data = JSON.stringify(data);
               }
               else 
               {
                  data = 'no metadata found.'
               }
               clear = false;
               iot.value = '--smd ' + data;
               iot.parentElement.dataset.content = '--smd ' + data;
               break;
            case '--smd':
               let smd = v.substr(5).trim();
               if (smd.startsWith('{') && smd.endsWith('}')) 
               {
                  set_metadata(JSON.parse(smd))
   //               smd = JSON.parse(smd);
   //               console.log(smd);
               } else {
                  console.log(smd)
               }
               break;
            case '--miss':
               fetch_missing(false); 
               break;
            case '--read':
               let unread = document.querySelectorAll('.unread');
               if (unread.length > 0) unread.forEach(toggle_state);
               break;
            
            default: 
               prep(v)
         }
         
      }
      
      if (clear) {
         iot.value = '';
         iot.parentElement.dataset.content = '';
      }
      
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
   aa.rekt = {};
   if (!localStorage.options) localStorage.options = JSON.stringify(defaults);
   options = JSON.parse(localStorage.options);
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

function start(k) {
 
   if (is_hex(k)) 
   {
      iot.value = '';
      iot.placeholder = 'new post';
         
      document.body.classList.add('has-k');  
      
      const u = document.getElementById('u');
      u.addEventListener('click', (e) => { select_p(k) });
      
      stylek(k, u);
      if (options.media) 
      {
         let dat = aa.p[k];
         if (dat && dat.picture)
         {
            const img = document.createElement('img');
            img.src = dat.picture;
            u.replaceChildren(img);
         }
      }
      
      fetch_relays().then((rels)=> 
      {
//         console.log('relays from ' + rels)
         if (!Object.keys(rels).length) rels = options.r;
//         relays = [...Object.entries(rels).filter(([url, can])=>can.read || can.write).map(([url,can])=>url)];
         re.postMessage(['rel', rels]);      
      });
   }     
}

window.addEventListener('load', (event)=> 
{  
   clean_up(); 
   knd1.addEventListener('click', clickEvent);
   
   iot.addEventListener('blur', less);
   iot.addEventListener('keyup', is);
   iot.addEventListener('focus', more);
   iot.addEventListener('keydown', (e)=> 
   { if (e.key === 'Enter' && e.shiftKey === false) { e.preventDefault() } });
   document.addEventListener('keyup', hotkeys);
   
   let a = document.getElementById('a');
//   a.addEventListener('click', ()=>{ if (a.dataset.mess) { hoes() } });
   
//   start();
//   setInterval(get_em, 1000);
//   document.body.scrollIntoView(stuff);
   
}, false);
