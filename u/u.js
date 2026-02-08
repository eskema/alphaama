/*

alphaama
mod    u
user you

*/


aa.u =
{
  name:'user',
  about:'your stuff',
  def:
  {
    id:'u',
    ls:{},
  },
  bootstrap:
  {
    relays:
    [
      'wss://nos.lol',
      'wss://relay.damus.io',
      'wss://relay.primal.net',
    ],
    options:
    [
      'score 0',
      'pow 17',
      'relays_ask off',
    ]
  },
  styles:['/u/u.css'],
  // scripts:
  // [
  //   // '/u/mk.js?v='+aa_version,
  // ],
  get p(){ return aa.db?.p[aa.u.o?.pubkey] },
  butts:
  {
    mod:[],
    init:
    [
      ['u setup','setup']
    ]
  }
};


// decrypt cache
// aa.u.o.decrypt_cache stores encrypted string in IndexedDB
// aa.u.decrypt_cache._data stores decrypted {events, keys} in memory
// lazy loaded on first decrypt
aa.u.decrypt_cache = {
  _data: { events: {}, keys: {} },
  _loaded: false,

  // decrypt cache blob from aa.u.o (lazy, on first use)
  load: async () => {
    if (aa.u.decrypt_cache._loaded) return;
    aa.u.decrypt_cache._loaded = true;
    if (!aa.u.o.decrypt_cache) return;
    try {
      let decrypted = await aa.fx.decrypt(aa.u.o.decrypt_cache);
      aa.u.decrypt_cache._data = aa.pj(decrypted) || { events: {}, keys: {} };
    } catch(e) {
      aa.log('decrypt cache: failed to load');
      aa.u.decrypt_cache._data = { events: {}, keys: {} };
    }
  },

  // encrypt and save cache to aa.u.o
  save: async () => {
    try {
      aa.u.o.decrypt_cache = await aa.fx.encrypt44(JSON.stringify(aa.u.decrypt_cache._data));
      await aa.mod.save(aa.u);
    } catch(e) {
      aa.log('decrypt cache: failed to save');
    }
  },

  add_key: async (privkey) => {
    await aa.u.decrypt_cache.load();
    const keypair = aa.fx.keypair(privkey);
    if (!keypair) {
      aa.log('Invalid private key');
      return null;
    }
    const [pubkey_npub, pubkey_hex, privkey_hex] = keypair;
    aa.u.decrypt_cache._data.keys[pubkey_hex] = privkey_hex;
    debt.add(() => aa.u.decrypt_cache.save(), 1000, 'save_decrypt_cache');
    return pubkey_hex;
  },

  get: async (event_id) => {
    await aa.u.decrypt_cache.load();
    return aa.u.decrypt_cache._data.events[event_id]?.decrypted;
  },

  add: async (event_id, decrypted, pubkey) => {
    await aa.u.decrypt_cache.load();
    aa.u.decrypt_cache._data.events[event_id] = { decrypted, pubkey };
    debt.add(() => aa.u.decrypt_cache.save(), 1000, 'save_decrypt_cache');
  },

  get_key: async (pubkey) => {
    await aa.u.decrypt_cache.load();
    return aa.u.decrypt_cache._data.keys[pubkey];
  },

  has: async (event_id) => {
    await aa.u.decrypt_cache.load();
    return aa.u.decrypt_cache._data.events.hasOwnProperty(event_id);
  },

  has_key: async (pubkey) => {
    await aa.u.decrypt_cache.load();
    return aa.u.decrypt_cache._data.keys.hasOwnProperty(pubkey);
  },

  get_event_pubkey: async (event_id) => {
    await aa.u.decrypt_cache.load();
    return aa.u.decrypt_cache._data.events[event_id]?.pubkey;
  },

  clear: async () => {
    aa.u.decrypt_cache._data = { events: {}, keys: {} };
    aa.u.decrypt_cache._loaded = true;
    await aa.u.decrypt_cache.save();
  },

  size: async () => {
    await aa.u.decrypt_cache.load();
    return {
      events: Object.keys(aa.u.decrypt_cache._data.events || {}).length,
      keys: Object.keys(aa.u.decrypt_cache._data.keys || {}).length
    };
  }
};


// add user
aa.u.add_pubkey =async(pubkey='')=>
{
  if (!aa.fx.is_key(pubkey)) return;
  if (aa.u.p?.pubkey === pubkey) return;
  
  aa.u.o.pubkey = pubkey;
  aa.u.o.npub = aa.fx.encode('npub',pubkey);
  aa.u.o.ls.u = pubkey;
  if (aa.u.p?.follows.length) 
    aa.u.o.ls.k3 = aa.u.p.follows.join(' ');
  await aa.mod.save(aa.u);
  await aa.u.start();
};


// add user
aa.u.add =async(s='')=>
{
  let array = aa.fx.splitr(s);
  let key = array.shift();
  if (key === 'pubkey' || key === 'npub' || key === 'k3')
  {
    aa.log(`default keys cannot be changed: ${key}`);
    return
  }
  if (aa.u.o.ls[key])
  {
    if (!window.confirm(`replace key: ${key}`))
      return
  }
  aa.u.o.ls[key] = array.join(' ');
  await aa.mod.save(aa.u);
  aa.mod.ui(aa.u,key);
};


// if key is the same as the user
aa.u.is_u =pubkey=> aa.u.o?.pubkey === pubkey;


// on load
aa.u.load =async()=>
{
  let id = 'u';
  const mod = aa[id];
  // await aa.add_scripts(mod.scripts);
  // aa.add_styles(aa.u.styles);

  aa.cli.def.action = 
  {
    action:['mk','note'],
    required:['<text>'],
    description:'make a nostr note',
    exe:aa.mk.post
  };

  aa.resets.push(
    async()=>
    {
      await aa.db.ops('cash',{clear:'ALL'});
      aa.log('db cash: clear');
      let databases = await indexedDB.databases();
      for (const db of databases) indexedDB.deleteDatabase(db.name);
      aa.log('indexedDB: clear');
    }
  );

  aa.actions.push(
    {
      action:['help','aa'],
      description:'alphaama help',
      exe:()=>{aa.mk.help()}
    },
    {
      action:['zzz'],
      description:'resets everything',
      exe:aa.u.reset
    },
    {
      action:['fx','qr'],
      required:['<text>'],
      description:'create qr code',
      exe:aa.fx.qr
    },
    {
      action:['fx','decode'],
      required:['<nip19>'],
      description:'decode nip19 (bech32) entity',
      exe:aa.fx.decode
    },
    {
      action:['fx','decrypt'],
      required:['<pubkey>','<text>'],
      description:'decrypt cyphertext',
      exe:aa.fx.decrypt
    },
    {
      action:['fx','kind'],
      required:['<number>'],
      description:'check if it is known',
      exe:aa.fx.kinds_type
    },
    {
      action:['fx','keypair'],
      optional:['<xsec>'],
      description:'generate nostr keys (secret_bytes,public,xsec,nsec)',
      exe:aa.fx.keypair
    },
    {
      action:[id,'setup'],
      optional:['<pubkey || nip05 || nprofile || npub>'],
      description:'setup pubkey, leave blank to use extension (nip07)',
      exe:mod.setup
    },
    {
      action:[id,'add'],
      required:['<key>','<value>'],
      description:'add variables to use in queries',
      exe:mod.add
    },
    {
      action:['e','pow'],
      required:['<hex_id>','<difficulty>'],
      description:'add proof-of-work to note',
      exe:aa.e.pow
    },
    {
      action:['p','add'],
      required:['<pubkey>'], 
      optional:['<relay>','<petname>'], 
      description:'follow profile (pubkey or npub)',
      exe:aa.e.follows_add
    },
    {
      action:['p','del'],
      required:['<pubkey>'], 
      description:'unfollow account (pubkey or npub)',
      exe:aa.e.follows_del
    },
    aa.cli.def.action
  );

  let u_u = aa.el.get('side').firstElementChild.firstElementChild;
  u_u.classList.add('u_u');
  aa.el.set('butt_u_u',u_u);
  aa.mk.nip7_butt();
  
  await aa.mod.load(mod);
  await mod.start(mod);

  // bus provider (breaks dependency on aa.u.p.pubkey from other modules)
  aa.bus.provide('u:pubkey', () => aa.u.o?.pubkey);
};


// tries to delete everything saved locally 
// and then reload clean
aa.u.reset =async()=>
{
  aa.log('reset initiated');
  sessionStorage.clear();
  aa.log('sessionStorage: clear');
  localStorage.clear();
  aa.log('localStorage: clear');

  for (const callback of aa.resets) await callback();

  aa.log('shh... go to sleep now.');
  setTimeout(()=>{location.href = location.origin},999)
};


// make u mod item
// aa.u.mk =(k,v)=>
// {
//   let l;
//   switch (k)
//   {
//     case 'npub':
//       let link = aa.mk.nostr_link(v,'view profile');
//       link.classList.add('key');
//       link.title = 'view u';
//       l = make('li',{id:aa.u.def.id+'_'+k,cla:'item'});
//       l.append(link,' ',make('span',{cla:'val',con:v}));
//       break;
//     case 'pubkey':
//       l = aa.mk.item('u',v);
//       break;
//     default: l = aa.mk.item(k,v);
//   }
//   return l
// };




// u setup
aa.u.setup =async(s='')=>
{
  aa.u.setup_sheet = {s};
  aa.log('u re beeing set up… '+(aa.u.setup_sheet.s||'via nip07 extension using window.nostr'));
  let [pubkey,mode] = s.split(aa.regex.fw).map(i=>i.trim());
  let relays = [];

  if (!s && !window.nostr)
  {
    aa.log('nip07 extension not found');
    aa.log('make sure it is active and try again');
    aa.log('(tip)=> press control + shift + (arrow_up (↑) or arrow_down (↓)) to access prompt history')
    return
  }
  else if (!s && window.nostr) pubkey = await window.nostr.getPublicKey();
  else if (aa.fx.is_key(s)) pubkey = s;
  else if (s.startsWith('npub1')) pubkey = aa.fx.decode(s);
  else
  {
    let dis;
    if (s.includes('@')) dis = await NostrTools.nip05.queryProfile(s);
    else if (s.startsWith('nprofile1')) dis = aa.fx.decode(s);

    if (dis?.pubkey?.length) pubkey = dis.pubkey;
    if (dis?.relays?.length) relays.push(...dis.relays);
  }

  if (!pubkey)
  {
    aa.log('unable to get public key');
    return
  }

  aa.u.setup_sheet.pubkey = pubkey;
  aa.u.setup_sheet.relays = relays;
  aa.u.setup_sheet.mode = mode;

  await aa.u.add_pubkey(pubkey);

  if (mode) aa.o.add(`mode ${mode}`);
  else
  {
    aa.q.reset();
    let log = aa.log('almost there…');
    if (!Object.keys(aa.u.p.relays).length)
    {
      log = aa.log('first ');

      const rel_butt = aa.mk.butt_action(`r add ${aa.u.bootstrap.relays.map(i=>`${i} read write`).join()}`,'add some relays');
      rel_butt.addEventListener('click',aa.clk.done);
      log.lastChild.append(rel_butt,);
    }

    log = aa.log('if needed ');

    const options_butt = aa.mk.butt_action(`o add ${aa.u.bootstrap.options.join(', ')}`,'adjust options');
    options_butt.addEventListener('click',aa.clk.done);
    log.lastChild.append(options_butt,' (load media, switch theme, etc…)');

    log = aa.log('when ready, ');
    const req_butt = aa.mk.butt_action('q stuff','request your stuff');
    req_butt.addEventListener('click',aa.clk.done);
    log.lastChild.append(req_butt,' like profile, follows, etc..');
    
    // log = aa.log('finally, ');
    // log.lastChild.append(aa.mk.reload_butt(),' for a clean start');
  }
};


aa.u.setup_butt =()=>
{
  let setup_butt = make('p',
  {
    con:"let's get ",
    id:'u_setup',
    app:
    [
      aa.mk.butt_action('u setup'),
      ' or ',
      make('button',
      {
        cla:'butt exe',
        con:'else',
        clk:aa.u.setup_quick
      })
    ]
  });

  setTimeout(()=>{ aa.log(setup_butt) },500);
};


// quick setup using defaults
aa.u.setup_quick =async()=>
{
  const options = aa.u.bootstrap.options.join(', ');
  const relays = aa.u.bootstrap.relays.map(i=>`${i} read write`).join();
  aa.o.add(options);
  aa.r.add(relays);
  aa.q.reset();

  let pubkey = await window.nostr?.getPublicKey();
  if (!pubkey)
  {
    aa.log('unable to get public key');
    return
  }
  await aa.u.add_pubkey(pubkey);

  setTimeout(()=>{aa.q.stuff()},1000);
  // aa.fx.countdown('the page will reload in',21,1000)
  // .then(dis=>{if (dis) location.reload()});
};


// start mod
aa.u.start =async()=>
{
  let p = await aa.u.load_u();
  if (!p) return;
  aa.u.upd_u_u();
  aa.mod.mk(aa.u);
  aa.mk.profile(p);
};


aa.u.load_u =async()=>
{
  let needs_saving;
  let mod = aa.u;

  let ls = mod.o?.ls;
  if (!ls) 
  {
    mod.setup_butt();
    return
  }

  let pubkey = mod.o.pubkey;
  if (!pubkey && ls.pubkey)
  {
    pubkey = mod.o.pubkey = ls.pubkey;
    delete ls.pubkey;

    if (ls.npub) 
    {
      mod.o.npub = ls.npub;
      delete ls.npub
    }
    needs_saving = true;
  }
  if (!pubkey)
  {
    mod.setup_butt();
    return
  }
  else document.getElementById('u_setup')?.parentElement.remove();

  let p = await aa.p.author(pubkey);
  if (p.score !== 9)
  {
    p.score = 9;
    needs_saving = true;
  }
  if (aa.fx.a_add(p.sets,['u'])) needs_saving = true;
  if (needs_saving) aa.p.save(p);
  if (!ls.u && p)
  {
    ls.u = p.pubkey;
    aa.mod.save(mod);
  }
  if (!ls.k3 && p.follows.length)
  {
    ls.k3 = p.follows.join(' ');
    aa.mod.save(mod);
  }
  return p
};

aa.u.upd_u_u =async()=>
{
  let butt_u = aa.el.get('butt_u_u');
  if (!butt_u || !aa.u.p) return;
  let p = aa.u.p;
  let p_data = await aa.p.data(p,true);
  let parent = butt_u.parentElement;
  fastdom.mutate(()=>
  {
    butt_u.textContent = aa.fx.short_key(p.pubkey,1,'_');
    if (aa.fx.is_trusted(p.score))
      aa.p.link_img(parent,p_data.data.src);
    aa.fx.color(p.pubkey,parent);
  })
};

