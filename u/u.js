/*

alphaama
mod    u
user you

*/


aa.u =
{
  name:'user',
  about:'stuff',
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
  scripts:
  [
    '/u/clk.js?v='+aa_version,
    '/u/e.js?v='+aa_version,
    '/u/mk.js?v='+aa_version,
  ],
  get p(){ return aa.db?.p[aa.u.o?.ls?.pubkey] },
  butts:
  {
    // mod:[],
    init:
    [
      ['u setup','setup']
    ]
  }
};




// add user
aa.u.add =(pubkey='')=>
{
  if (aa.is.key(pubkey))
  {
    aa.u.o.ls = {pubkey:pubkey,npub:aa.fx.encode('npub',pubkey)};

    aa.mod.mk(aa.u);
    aa.mod.save(aa.u).then(aa.u.start);
    aa.log('u = '+pubkey);
  }
  else return false
};


// on load
aa.u.load =async()=>
{
  let id = 'u';
  const mod = aa[id];
  await aa.mk.scripts(mod.scripts);

  aa.cli.def.action = 
  {
    action:['mk','note'],
    required:['<text>'],
    description:'make a nostr note',
    exe:aa.mk.post
  };

  aa.actions.push(
    {
      action:[id,'setup'],
      optional:['<pubkey || nip05 || nprofile || npub>'],
      description:'setup pubkey, leave blank to use extension (nip07)',
      exe:mod.setup
    },
    {
      action:['e','pow'],
      required:['<hex_id>','<difficulty>'],
      description:'add proof-of-work to note',
      exe:mod.pow
    },
    {
      action:['p','add'],
      required:['<pubkey>'], 
      optional:['<relay>','<petname>'], 
      description:'follow profile (pubkey or npub)',
      exe:mod.k3_add
    },
    {
      action:['p','del'],
      required:['<pubkey>'], 
      description:'unfollow account (pubkey or npub)',
      exe:mod.k3_del
    },
    aa.cli.def.action
  );
  let app = aa.mk.butt_expand('u_u','a_a');
  aa.el.set('butt_u_u',app);
  aa.side = aa.mk.l('aside',{id:'u_u',app});
  aa.side.append(aa.mod_l);
  aa.bod.insertBefore(aa.side,aa.bod.lastChild.previousSibling);

  aa.mk.nip7_butt();
  
  await aa.mod.load(mod);
  await mod.start(mod);
};


// u add to s
aa.u.k3_add =async s=>
{
  if (!aa.u.p) 
  {
    aa.log('login first')
    return
  }
  let tag = ['p'];

  let [key,rest] = s.split(aa.fx.regex.fw);

  if (key.startsWith('npub')) key = aa.fx.decode(key);
  if (!aa.is.key(key)) 
  {
    aa.log('invalid key to follow '+key);
    return false
  }
  if (aa.is.following(key)) 
  {
    aa.log('already following '+key);
    return false
  }
  tag.push(key);
  
  let [relay,petname] = rest.trim().split(aa.fx.regex.fw);
  relay = aa.is.url(relay)?.href || '';
  petname = aa.fx.an(petname);

  if (relay) tag.push(relay);
  if (petname)
  {
    if (!relay) tag.push('');
    tag.push(petname)
  }
  
  let dat = await aa.p.events_last(aa.u.p,'k3');
  if (!dat) return false;
  dat = await aa.db.get_e(dat);
  if (!dat)
  {
    aa.log('no k3 found, create one first');
    return
  }

  const event = aa.e.normalise(
  {
    kind:3,
    content:dat.event.content,
    tags:[...dat.event.tags,tag]
  });

  aa.mk.dialog(
  {
    title:'new follow list',
    l:aa.mk.tag_list(event.tags),
    scroll:{behaviour:'smooth',block:'end'},
    no:{exe:()=>{}},
    yes:{exe:()=>
    { 
      aa.e.finalize(event);
      setTimeout(()=>{aa.p.author(a[0]).then(p=>{aa.p.profile_upd(p)});},500);
    }}
  });
};


// delete keys from follow list
aa.u.k3_del =async s=>
{
  if (!aa.u.p)
  {
    aa.log('no u found, set one first');
    return false
  }
  
  let dat_k3 = await aa.p.events_last(aa.u.p,'k3');
  if (!dat_k3) return false;
  dat_k3 = await aa.db.get_e(dat_k3);
  if (!dat_k3) return false;
  aa.cli.fuck_off();

  let keys_to_unfollow = s.split(',').map(i=>i.trim());
  let new_follows = [...dat_k3.event.tags];
  const old_len = new_follows.length;
  let ul = aa.mk.l('ul',{cla:'list removed_tags'});
  for (const k of keys_to_unfollow)
  {
    if (k.startsWith('npub')) k = aa.fx.decode(k);
    if (aa.is.x(k)) 
    {
      ul.append(aa.mk.l('li',{con:k,cla:'disabled'}));
      new_follows = new_follows.filter(tag=>tag[1]!==k);
      aa.p.score(k+' 4');
    }
    else aa.log('invalid pubkey to unfollow')
  }

  if (new_follows.length)
  {
    const l = aa.mk.l('div',{cla:'wrap'});
    l.append(aa.mk.tag_list(new_follows),ul);
    aa.mk.dialog(
    {
      title:'new follow list:'+old_len+'->'+new_follows.length,
      l:l,
      scroll:{behaviour:'smooth',block:'end'},
      no:{ exe:()=>{} },
      yes:{ exe:()=>
      {
        const event = 
        {
          kind:3,
          content:dat_k3.event.content,
          tags:new_follows
        };
        aa.e.finalize(aa.e.normalise(event));
      }},
    });
  }
};


// make u mod item
aa.u.mk =(k,v)=>
{
  let l;
  switch (k)
  {
    case 'npub':
      let link = aa.mk.nostr_link(v,'view');
      link.classList.add('key');
      link.title = 'view u';
      l = aa.mk.l('li',{id:aa.u.def.id+'_'+k,cla:'item'});
      l.append(link,' ',aa.mk.l('span',{cla:'val',con:v}));
      break;
      
    default: l = aa.mk.item(k,v);
  }
  return l
};


// action to add proof-of-work (pow) to a note
aa.u.pow =async(s='')=>
{
  let [nid,difficulty] = s.split(' ');
  difficulty = parseInt(difficulty.trim());
  nid = nid.trim();
  if (!aa.is.x(nid) || !difficulty) { aa.log('pow failed'); return }
  return await aa.u.pow_note(nid,difficulty);
};


// pow from nid with target difficulty
aa.u.pow_note =async(nid,difficulty=0)=>
{
  return new Promise(async resolve=>
  {
    let event = aa.db.e[nid].event;
    let pow = difficulty;
    if (!pow)
    {
      let nonce = event.tags.filter(t=>t[0] === 'nonce');
      if (!nonce.length) pow = parseInt(localStorage.pow);
    }
    if (pow && aa.fx.clz(nid) < pow) 
    {
      let note = document.querySelector(`.note[data-id="${nid}"]`);
      if (note) note.classList.add('mining');
      let mined = await aa.fx.pow(event,pow);
      let [pow_e,r] = mined;
      if (pow_e)
      {
        if (note) aa.e.note_rm(note)
        event = pow_e;
        aa.e.draft(aa.mk.dat({event:event}));
      }
      else aa.log('pow failed')
    }
    resolve(event.id)
  });
};


// sign event
aa.u.sign =async event=>
{
  return new Promise(resolve=>
  {
    if (!window.nostr) 
    {
      aa.log('you need a signer');
      resolve(false)
    }
    window.nostr.signEvent(event).then(resolve);
  });
};


// u setup
aa.u.setup =async(s='')=>
{
  aa.u.setup_sheet = {s};
  aa.log('u re beeing set up… '+(aa.u.setup_sheet.s||'via nip07 extension using window.nostr'));
  let [pubkey,mode] = s.split(aa.fx.regex.fw).map(i=>i.trim());
  let relays = [];

  if (!s && !window.nostr)
  {
    aa.log('nip07 extension not found');
    aa.log('make sure it is active and try again');
    aa.log('(tip)=> press control + shift + (arrow_up (↑) or arrow_down (↓)) to access prompt history')
    return
  }
  else if (!s && window.nostr) pubkey = await window.nostr.getPublicKey();
  else if (aa.is.key(s)) pubkey = s;
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

  aa.u.add(pubkey);
  await aa.u.start();

  if (mode) aa.o.add(`mode ${mode}`);
  else
  {
    aa.q.reset();
    let log = aa.log('almost there…');
    if (!Object.keys(aa.u.p.relays).length)
    {
      log = aa.log('first ');
      let def_rels = 
      [
        'wss://nos.lol read write',
        'wss://relay.damus.io read write',
        'wss://relay.primal.net read write',
      ];
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
    
    log = aa.log('finally, ');
    log.lastChild.append(aa.mk.reload_butt(),' for a clean start');
  }
};


// quick setup using defaults
aa.u.setup_quick =async()=>
{
  const options = aa.u.bootstrap.options.join(', ');
  const relays = aa.u.bootstrap.relays.map(i=>`${i} read write`).join();
  aa.o.add(options);
  aa.r.add(relays);
  aa.q.reset();

  let pubkey = await window.nostr.getPublicKey();
  if (!pubkey)
  {
    aa.log('unable to get public key');
    return
  }
  aa.u.add(pubkey);
  await aa.u.start();

  setTimeout(()=>{aa.q.stuff()},1000);
  setTimeout(()=>{aa.log(aa.mk.l('p',{con:'wait a bit then ',app:aa.mk.reload_butt()}))},2000);
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
  let ls = aa.u.o?.ls;
  if (!ls) 
  {
    aa.mk.setup_butt();
    return
  }

  let pubkey = ls.pubkey;
  if (!pubkey && ls.xpub)
  {
    pubkey = ls.pubkey = ls.xpub;
    needs_saving = true;
  }
  if (!pubkey)
  {
    aa.mk.setup_butt();
    return
  }
  else document.getElementById('u_setup')?.parentElement.remove();

  let p = await aa.p.author(pubkey);
  if (p.score < 9) 
  {
    p.score = 9;
    needs_saving = true;
  }
  if (aa.fx.a_add(p.sets,['u'])) needs_saving = true;
  if (needs_saving) aa.p.save(p);

  return p
};


// update u_u button
// aa.u.upd_u_u =async()=>
// {
//   let butt_u = aa.el.get('butt_u_u');
//   if (!butt_u || !aa.u.p) return;
//   let p = aa.u.p;
//   fastdom.mutate(
//     ()=>
//     {
//       aa.fx.color(p.pubkey,butt_u.parentElement);
//       butt_u.textContent = p.pubkey.slice(0,1)+'_'+p.pubkey.slice(-1);
//     }
//   )

//   if (aa.is.trusted(p.score))
//   {
//     // let src;
//     // let cached = await aa.db.ops('cash',{out:[p.metadata.picture]});
//     // if (!cached.length)
//     // {
//     //   aa.db.ops('cash',{add:[p.metadata.picture]});
//     //   src = p.metadata.picture;
//     // }
//     // else src = URL.createObjectURL(cached[0]);
//     // fastdom.mutate(()=>{ 
//       aa.p.link_img(butt_u,p.metadata.picture) 
//     // });
//   }
// };

aa.u.upd_u_u =async()=>
{
  let butt_u = aa.el.get('butt_u_u');
  if (!butt_u || !aa.u.p) return;
  let p = aa.u.p;
  let p_data = await aa.p.data(p);

  fastdom.mutate(()=>
  {
    aa.fx.color(p.pubkey,butt_u.parentElement);
    butt_u.textContent = p.pubkey.slice(0,1)+'_'+p.pubkey.slice(-1);
    
    if (aa.is.trusted(p.score)) aa.p.link_img(butt_u,p_data.data.src);
  })
};


// web of trust 
// aa.u.wot =async()=>
// {
//   let ff = {};
//   let to_get = [];
//   let follows = aa.u.p.follows;
//   if (!follows?.length) return false;  
//   for (const x of follows)
//   {
//     let p = aa.db.p[x];
//     let p_follows = p?.follows;
//     if (p_follows?.length)
//     {      
//       for (const xid of p_follows)
//       {
//         if (!aa.is.following(xid))
//         {
//           if (!ff[xid]) ff[xid] = [];
//           aa.fx.a_add(ff[xid],[x]);
//           if (!aa.db.p[xid]) aa.fx.a_add(to_get,[xid]);
//         }
//       }
//     }
//   }

//   if (to_get.length)
//   {
//     let dat = await aa.db.ops('idb',{get_a:{store:'authors',a:to_get}});
//     if (dat) for (const p of dat) aa.db.p[p.pubkey] = p;
//   }
  
//   aa.ff = ff;
//   let wot = {};
//   let sorted = Object.entries(aa.ff).sort((a,b)=>b[1].length - a[1].length);
//   return sorted
//   for (const f of sorted)
//   {
//     let x = f[0];
//     let n = f[1].length;
//     let id = aa.db.p[x]?.petnames[0] || aa.db.p[x]?.metadata?.name || x;
//     wot[id] = n;
//   }

//   return wot
// };

aa.mk.styles(aa.u.styles);