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
  get p(){ return aa.db?.p[aa.u.o?.ls?.pubkey] },
  butts:
  {
    init:
    [
      ['u setup','setup']
    ]
  }
};


// add user
aa.u.add =(pubkey='')=>
{
  if (!aa.fx.is_key(pubkey)) return;
  if (aa.u.p?.pubkey === pubkey) return;
  
  aa.u.o.ls = {pubkey:pubkey,npub:aa.fx.encode('npub',pubkey)};
  aa.mod.save(aa.u).then(aa.u.start);
};


// if key is the same as the user
aa.u.is_u =pubkey=> aa.u.o?.ls?.pubkey === pubkey;


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
      l = make('li',{id:aa.u.def.id+'_'+k,cla:'item'});
      l.append(link,' ',make('span',{cla:'val',con:v}));
      break;
      
    default: l = aa.mk.item(k,v);
  }
  return l
};




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
  aa.u.add(pubkey);

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
  let ls = aa.u.o?.ls;
  if (!ls) 
  {
    aa.u.setup_butt();
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
    aa.u.setup_butt();
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

