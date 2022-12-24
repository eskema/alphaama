const 
   your = window.localStorage,
   session = window.sessionStorage,
   hose = {};
   
let get, options, relays, defaults = 
{
   'days': 1, // feed limit
   'media': false, //autoload media files
   'k': false, //account pubkey
   't': false, //timestamp for since,
   'r': { // bootstrap relays if no others found
          "wss://nostr-pub.wellorder.net":{"read":true,"write":true},
          "wss://nostr-relay.wlvs.space":{"read":true,"write":true},
          "wss://relay.damus.io":{"read":true,"write":true} }
}

function bbbb()
{// boom biddy bye bye
 // tries to forget everything
   your.clear(); // localStorage
   session.clear(); // SessionStorage
   document.getElementById('kind-0').textContent = ''; // contacts
   document.getElementById('kind-1').textContent = ''; // timeline
   iot.placeholder = 'boom biddy bye bye'; // so you know what happened
   u.removeAttribute('style');
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
   
   e.target.parentElement.dataset.content = v;
   
//   if (a[a.length - 1].startsWith('@')) {
//      mention(a[a.length - 1].substr(1));
//   }
 
   if (enter) {
      
      console.log(v);       
      
      // commands switch
      
      if (a.length === 1 && [...new Intl.Segmenter().segment(a[0])].length === 1 && your.reaction) 
      {
//         console.log('reaction', a);
         let note = JSON.parse(your.reaction);
         note[0] = v;
         reaction(note);
         iot.blur();
      }
      else if (your.reaction)
      {
         console.log('too many chars', a);
         clear = false;
      }
      else 
      {
//         console.log('command', a);
         your.removeItem('reaction');
         switch (a[0]) 
         {
            case '--bbbb': // boom biddy bye bye, 
               // destroys everything, 
               // or at least tries to..
               bbbb();
               break;
            case '--media':
               options.media = !options.media; 
               your.options = JSON.stringify(options);
               window.location.reload();
               break;
            case '--k':
               if (a[1]) 
               {
                  bbbb();
                  options.k = a[1];
                  your.options = JSON.stringify(options);
                  start();
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
               let data = your[options.k] ? JSON.parse(your[options.k]) : false;
               if (data) 
               {
                  if (data.id) delete data.id;
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
            case '--some':
               fetch_some(); 
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
   session.clear();
   
   if (!your.options) your.options = JSON.stringify(defaults);
   options = JSON.parse(your.options);
   
   relays = options.r 
            && typeof options.r === 'object' ? 
               options.r 
            : options.r ? 
                  JSON.parse(options.r) 
               : defaults.r;
   
   // update options from previous versions
   if (!options.k && your.k) {
      options.k = your.k;
      your.removeItem('k');
   }
   
   if (!options.t && your.t) {
      options.t = your.t;
      your.removeItem('t');
   }
   
   if (!options.r && your.r) {
      options.r = your.r;
      your.removeItem('r');
   }
   
   if (!options.days) {
      options.days = defaults.days;
   }
   
   your.options = JSON.stringify(options);
   
   console.log(options);
}

function start() {
 
   if (options.k) 
   {
      const u = document.getElementById('u');
      let dat = your[options.k] ? JSON.parse(your[options.k]) : false;
      
      iot.value = '';
      iot.placeholder = 'new post';
         
      document.body.classList.add('has-k');  
      
      
      
      u.addEventListener('click', (e) => { select_p(options.k) });
      
      stylek([options.k], u);
      if (options.media && dat) 
      { // gets main profile img
         if (dat.picture)
         {
            const img = document.createElement('img');
            img.src = dat.picture;
            u.replaceChildren(img);
         }
      }
      
      Object.entries(relays).forEach(([url, can]) => 
      { 
         if (can.read || can.write) connect(url, false)
      });      
      
      if (window.nostr) 
      { // nos2x
         console.log('nos2x available');
         /*
         window.nostr.getPublicKey(); //: string // returns your public key as hex
         window.nostr.signEvent(event): Event // returns the full event object signed
         window.nostr.getRelays(): { [url: string]: RelayPolicy } // returns a map of relays
         window.nostr.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
         window.nostr.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
         */
         
      }
   } else 
   {
      if (window.nostr) 
      {
         window.nostr.getPublicKey().then((k) => 
         {
            options.k = k;
            your.options = JSON.stringify(options);
            start();
         });
      }
   }     
}

function stored() 
{
   let count = 0;
   let recent = 0;
   let tt = x_days(JSON.parse(your.options).days);
//   console.log(tt,JSON.parse(your.options).t );
   
   Object.keys(sessionStorage).forEach(function(key){
      count++;
//      if (sessionStorage[key].startsWith('{')) {
         const v = sessionStorage[key];
         if (v.startsWith('{')) {
            const o = JSON.parse(v);
            
            if (o.created_at < tt) {
               recent++;
               let l = process(o, 'cached');
//               console.log(o.created_at);
            }
         }
   });
   
   console.log(count, recent);
}


window.addEventListener('load', function(event) 
{
   
   clean_up(); 
//   stored();
   
   knd1.addEventListener('click', clickEvent, false);
   
   iot.addEventListener('blur', less, false);
   iot.addEventListener('keyup', is, false);
   iot.addEventListener('focus', more, false);
   //prevent Enter key from adding line break
   iot.addEventListener('keydown', (e)=> 
   {
      if (e.key === 'Enter' && e.shiftKey === false) 
      {
         e.preventDefault();
      }
   }, false);
   document.addEventListener('keyup', hotkeys);
   
   start();
   setInterval(get_em, 1000);
//   document.body.scrollIntoView(stuff);
   
}, false);
