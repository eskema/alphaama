/*

alphaama
mod    u
user you

*/


aa.mk.styles(['/u/u.css']);


aa.u = 
{
  def:{id:'u',ls:{}},
  get p(){ return aa.db?.p[aa.u.o?.ls?.xpub] },
};


// add user
aa.u.add =(pubkey='')=>
{
  if (aa.is.key(pubkey))
  {
    aa.u.o.ls = {xpub:pubkey,npub:aa.fx.encode('npub',pubkey)};

    aa.mod.mk(aa.u);
    aa.mod.save(aa.u).then(aa.u.start);
    aa.log('u = '+pubkey);
  }
  else return false
};


// check for nip7 extension (window.nostr) availability
// and log the result
aa.u.check_signer =()=>
{
  let s = 'window.nostr ok';
  if (!window.nostr)
  {
    aa.log(aa.mk.l('button',
    {
      con:'!window.nostr: nip7 signer not found',
      cla:'butt',
      clk:e=>
      {
        aa.clk.clkd(e.target);
        if (window.nostr)
        {
          let parent = e.target.parentElement;
          parent.textContent = '';
          parent.append(aa.mk.l('p',{con:s}));
        } 
      }
    }),false,false);
  }
  else aa.log(s,false,false);
};


// on load
aa.u.load =async()=>
{
  await aa.mk.scripts([
    '/u/clk.js',
    '/u/e.js',
    '/u/fx.js',
    '/u/is.js',
    '/u/mk.js',
  ]);

  let id = 'u';
  const mod = aa[id];
  aa.actions.push(
    {
      action:[id,'login'],
      optional:['mode','pubkey','relay'],
      description:'login as pubkey, leave blank to load from extension (nip-7)',
      exe:mod.login
    },
    {
      action:['fx','pow'],
      required:['hex_id','difficulty'],
      description:'add proof-of-work to note',
      exe:mod.pow
    },
    {
      action:['p','add'],
      required:['id'], 
      optional:['relay','petname'], 
      description:'follow account (hex or npub)',
      exe:mod.k3_add
    },
    {
      action:['p','del'],
      required:['id'], 
      optional:['more ids..'], 
      description:'unfollow account (hex or npub)',
      exe:mod.k3_del
    },
  );
  aa.u.check_signer();
  await aa.mod.load(mod);
  await mod.start(mod);
};


// u login
aa.u.login =async(s='')=>
{
  aa.log('attempting to login…');
  let pubkey = '';
  let relays = [];
  let [mode,pub,relay] = s.split(' ').map(i=>i.trim());
  
  if (!mode) mode = 'easy';
  else mode = aa.fx.an(mode);
  aa.log(`setting options with: .aa o add mode ${mode},trust 4`)
  aa.o.add(`mode ${mode},trust 4`);
  
  relay = aa.is.url(relay)?.href;
  if (relay) relays.push(relay);
  
  if (pub)
  {
    if (aa.is.key(pub)) pubkey = pub;
    else
    {
      if (pub.includes('@'))
      {
        let dis = await NostrTools.nip05.queryProfile(pub);
        if (dis?.pubkey?.length) pubkey = dis.pubkey;
        if (dis.relays?.length) relays.push(...dis.relays);
      }
      else if (pub.startsWith('np'))
      {
        if (pub.startsWith('npub1'))
        {
          pubkey = aa.fx.decode(pub);
        }
        else if (pub.startsWith('nprofile1'))
        {
          let dis = aa.fx.decode(pub);
          if (dis?.pubkey?.length) pubkey = dis.pubkey;
          if (dis.relays?.length) relays.push(...dis.relays);
        }
      }
    }
  }

  if (!pubkey && window.nostr)
  {
    // login via extension
    aa.log('no pubkey, trying nip-7 extension…');
    pubkey = await window.nostr.getPublicKey();
    if (!pubkey)
    {
      aa.log('unable to get public key from extension');
      return
    }
  }

  aa.u.add(pubkey);
  await aa.u.start();
  aa.log('adding some useful queries to fetch stuff')
  aa.q.stuff();
  
  if (!relays.length) relays = await aa.r.ext();
  else if (relay) aa.r.add(relay+' read write');
  if (!relays.length)
  {
    relay = window.prompt('provide a relay');
    if (!relay) return
    // aa.log(aa.mk.butt_action('r add wss://url.com read write'));
  }
  aa.u.jump()
};


// fetch basic stuff to get things started
aa.u.jump =()=>
{
  aa.log('fetching basic stuff to get things started');
  aa.log('querying for your metadata:\n.aa q run a');
  aa.q.run('a');
  setTimeout(()=>
  {
    aa.log('running it again to include newly found relays');
    aa.q.run('a');
    
    setTimeout(()=>
    {
      // get data from pubkeys found on your follow list  
      if (aa.u.p.follows.length)
      {
        const follows_details = aa.mk.details(aa.u.p.follows.length,0);
        follows_details.append('k3 = '+aa.u.p.follows.join(', '));
        aa.log(follows_details);
        // aa.log(`found ${aa.u.p.follows.length} ${aa.fx.plural(aa.u.p.follows.length,'follow')}`);
      }
      // aa.log('k3 = '+aa.u.p.follows.join(', '));
      aa.log('querying for your follows data on your relays:\n.aa q run b');
      aa.q.run('b');
      setTimeout(()=>
      {
        aa.log('querying for your follows data as outbox:\n.aa q out b');
        setTimeout(()=>{aa.q.outbox('b')},0);
        setTimeout(()=>
        {
          sessionStorage.q_out = 'f';
          sessionStorage.q_run = 'n';
          aa.log('login done. reload page when things stop moving.')
        },1000);
      },5000);
    },3000);
  },1000);
};


// u add to s
aa.u.k3_add =async s=>
{
  if (!aa.u.p) 
  {
    aa.log('login')
    return
  }
  let a = s.split(',');
  let tag = aa.fx.tag_k3(a);
  if (!tag) return;
  
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
    scroll:true,
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

  let keys_to_unfollow = s.split(' ');
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
      scroll:true,
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


// is nip4 cyphertext
// aa.is.nip4 =s=> 
// {
//   let l = s.length;
//   if (l < 28) return false;

//   return s[l - 28] == '?' 
//   && s[l - 27] == 'i'
//   && s[l - 26] == 'v'
//   && s[l - 25] == '='
// };


// return sorted relay list for outbox
aa.u.outbox =(a=[],sets=[])=>
{
  if (!sets.length) sets = [aa.r.o.w,'k10002'];
  if (!a?.length) return [];
  let relays = aa.r.common(a,sets);
  let outbox = aa.fx.intersect(relays,a);
  let sorted_outbox = Object.entries(outbox).sort(aa.fx.sorts.len);
  return sorted_outbox;
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


// start mod
aa.u.start =async()=>
{
  let mod = aa.u;
  let ls = mod?.o?.ls;
  if (!ls.xpub)
  {
    let login_butt = aa.mk.l('p',{id:'u_login',app:aa.mk.butt_action('u login')});
    setTimeout(()=>{aa.log(login_butt)},500);
    return
  }
  else document.getElementById('u_login')?.parentElement.remove();

  let p = await aa.db.get_p(ls.xpub);
  if (!p) p = aa.p.p(ls.xpub);

  let upd;
  if (p.score < 9) 
  {
    p.score = 9;
    upd = true;
  }
  if (aa.fx.a_add(p.sets,['u'])) upd = true;
  if (upd) aa.p.save(p);
  aa.u.upd_u_u();
  aa.mod.mk(mod);
  aa.mk.profile(p)
  // mod.l.append(aa.mk.ls({ls:p}));
};


// update u_u button
aa.u.upd_u_u =()=>
{
  let butt_u = document.getElementById('butt_u_u');
  if (!butt_u || !aa.u.p) return;
  let p = aa.u.p;
  fastdom.mutate(()=>
  {
    aa.fx.color(p.xpub,document.getElementById('u_u'));
    butt_u.textContent = p.xpub.slice(0,1)+'_'+p.xpub.slice(-1);
    if (aa.is.trusted(p.score)) aa.p.link_img(butt_u,p.metadata.picture);
  })
};


// web of trust 
aa.u.wot =async()=>
{
  let ff = {};
  let to_get = [];
  let follows = aa.u.p.follows;
  if (!follows?.length) return false;  
  for (const x of follows)
  {
    let p = aa.db.p[x];
    let p_follows = p?.follows;
    if (p_follows?.length)
    {      
      for (const xid of p_follows)
      {
        if (!aa.is.following(xid))
        {
          if (!ff[xid]) ff[xid] = [];
          aa.fx.a_add(ff[xid],[x]);
          if (!aa.db.p[xid]) aa.fx.a_add(to_get,[xid]);
        }
      }
    }
  }

  if (to_get.length)
  {
    let dat = await aa.db.ops('idb',{get_a:{store:'authors',a:to_get}});
    if (dat) for (const p of dat) aa.db.p[p.xpub] = p;
  }
  
  aa.ff = ff;
  let wot = {};
  let sorted = Object.entries(aa.ff).sort((a,b)=>b[1].length - a[1].length);
  return sorted
  for (const f of sorted)
  {
    let x = f[0];
    let n = f[1].length;
    let id = aa.db.p[x]?.petnames[0] || aa.db.p[x]?.metadata?.name || x;
    wot[id] = n;
  }

  return wot
};