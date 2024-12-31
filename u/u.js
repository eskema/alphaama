/*

alphaama
mod    u
user you

*/


aa.styleshit('/u/u.css');

aa.u = 
{
  def:{id:'u',ls:{}},
  // old_id:'aka',
  requires:['o','p','e'],
  get p(){ return aa.db.p[aa.u.o.ls.xpub] },
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
    }));
  }
  else aa.log(s);
};


// cancel event draft
aa.clk.cancel =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  if (aa.temp.mining && aa.temp.mining[xid]) aa.fx.pow_a(xid);
  aa.e.note_rm(note);
};


// edit event
aa.clk.edit =e=>
{
  const note = e.target.closest('.note');
  // const xid = note.dataset.id;
  aa.cli.v(aa.db.e[note.dataset.id].event.content);
  aa.e.note_rm(note);
  // if (aa.viewing === note.id) aa.state.clear()
  // note.remove();
  // aa.fx.data_count(document.getElementById('butt_e'),'.note');
  // delete aa.db.e[xid];
};


// draft event
aa.e.draft =async dat=>
{
  aa.fx.a_add(dat.clas,['draft']);
  dat.event.tags = [...new Set(dat.event.tags)];
  if (!dat.event.id) dat.event.id = aa.fx.hash(dat.event);
  aa.db.e[dat.event.id] = dat;
  aa.e.print(dat);
  
  let sect = document.getElementById('e');
  if (sect && !sect.classList.contains('expanded')) aa.clk.expand({target:sect});
};


// make event from JSON string, autocompletes missing fields
aa.mk.e =s=>
{
  let event = aa.parse.j(s);
  if (event)
  {
    aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
    aa.cli.fuck_off();
  }
};


// encrypt note
aa.clk.encrypt =async e=>
{
  const note = e.target.closest('.note');
  const id = note.dataset.id;
  let dat = aa.db.e[id];
  let peer = dat.event.tags.find(t=>t[0]==='p')[1];
  let encrypted = await window.nostr.nip04.encrypt(peer,dat.event.content);
  let dis = Object.assign({},dat.event);
  dis.content = encrypted;
  delete dis.id;
  if ('sig' in dis) delete dis.sig;
  note.remove();
  delete aa.db.e[id];
  console.log(dis);
  aa.e.draft(aa.mk.dat({event:dis,clas:['encrypted']}));
};




// finalize event creation
aa.e.finalize =async(event,relays)=>
{
  event.tags = [...new Set(event.tags)];
  if (!event.id) event.id = aa.fx.hash(event);
  const signed = await aa.u.sign(event);
  if (signed)
  {
    aa.db.e[event.id] = dat = aa.mk.dat({event:signed});
    aa.db.upd_e(dat);
    aa.e.print(dat);
    aa.r.broadcast(signed,relays);
  }
};


// event complete
aa.e.normalise =event=>
{
  if (!event.pubkey) event.pubkey = aa.u.p.xpub;
  if (!event.kind) event.kind = 1;
  if (!event.created_at) event.created_at = aa.t.now;
  if (!event.tags) event.tags = [];
  if (!event.content) event.content = '';
  return event
}


// decrypt kind-4 from id
aa.u.note_decrypt =async s=>
{ 
  if (!window.nostr) 
  {
    aa.log('no extension found');
    return
  }

  let x = s.trim();
  if (!aa.is.x(x))
  {
    aa.log('invalid id');
    return
  }
  
  let dat = await aa.db.get_e(x);
  if (!dat) 
  {
    aa.log('event not found');
    return
  }

  let decrypted;
  if (dat.event.kind === 4) 
  {
    let p_x = dat.event.tags.find(t=>t[0]==='p')[1];
    if (aa.u.p.xpub !== p_x)
    {
      aa.log('content not for you');
      return
    }
    decrypted = await window.nostr.nip04.decrypt(dat.event.pubkey,dat.event.content);
  }
  else decrypted = await window.nostr.nip44.decrypt(dat.event.pubkey,dat.event.content);
  if (!decrypted)
  {
    aa.log('decrypt failed');
    return
  }
  
  aa.u.note_content_decrypted(x,decrypted);
  return decrypted
};


aa.u.note_decrypted_content =async(x,decrypted)=>
{
  let l = document.getElementById(aa.fx.encode('note',x));
  if (!l) 
  {
    aa.log('decrypted cyphertext:');
    aa.log(decrypted);
  }
  else
  {
    let content = l.querySelector('.content');
    content.classList.remove('encrypted');
    content.classList.add('decrypted');
    content.querySelector('.butt.decrypt').remove();
    l.querySelector('.content').append(aa.parse.content(decrypted));
  }
};


// true if you follow pubkey
aa.is.following =xpub=>
{
  if (aa.u?.p?.follows?.includes(xpub)) return true;
  return false
};


// if hex key is your pubkey
aa.is.u =x=> aa.u?.o?.ls?.xpub === x;


// make p tag array from array
aa.fx.tag_k3 =a=>
{
  let tag = ['p'];
  let k,relay,petname;
  
  if (a.length) k = a.shift().trim();
  if (!k) return false;
  if (k.startsWith('npub')) k = aa.fx.decode(k);
  if (!aa.is.key(k)) 
  {
    aa.log('invalid key to follow '+k);
    return false
  }
  if (aa.is.following(k)) 
  {
    aa.log('already following '+k);
    return false
  }
  tag.push(k);

  if (a.length) 
  {
    relay = a.shift().trim();
    let url = aa.is.url(relay);
    if (url) tag.push(url.href);
    else tag.push('')
  }

  if (a.length) 
  {
    petname = a.shift().trim();
    tag.push(aa.fx.an(petname));
  }
  while (tag[tag.length - 1].trim() === '') tag.pop();
  return tag
};


// on load
aa.u.load =()=>
{
  
  let id = 'u';
  const mod = aa[id];
  aa.actions.push(
    {
      action:[id,'login'],
      optional:['easy || hard'],
      description:'load pubkey and relays from ext with optional mode, leave blank for default',
      exe:mod.login
    },
    {
      action:['e','decrypt'],
      required:['nid'],
      description:'decrypt note',
      exe:mod.note_decrypt
    },
    {
      action:['p','k0'],
      optional:['pubkey'], 
      description:'return metadata of pubkey',
      exe:aa.p.k0
    },
    {
      action:['mk','0'],
      required:['{JSON}'], 
      description:'set metadata (kind-0)',
      exe:aa.mk.k0
    },
    {
      action:['mk','7'],
      required:['id','reaction'], 
      description:'react to a note',
      exe:aa.mk.k7
    },
    {
      action:['mk','e'],
      required:['JSON'],
      description:'mk event from JSON',
      exe:aa.e.draft_event_from_JSON
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
    {
      action:['mk','4'],
      required:['pubkey','text'],
      description:'encrypt text to pubkey',
      exe:aa.mk.k4
    },
  );
  aa.u.check_signer();
  aa.mod_load(mod).then(mod.start);
};


// u login
aa.u.login =async s=>  
{  

  // return new Promise(resolve=>
  // {
    if (window.nostr && aa.u)
    {
      await aa.u.set_mode(s.trim());
      window.nostr.getPublicKey().then(x=>
      {
        aa.u.set_u_p(x);
        if (aa.r) 
        {
          aa.r.ext().then(()=>
          {
            // resolve('login with relays')
          });
        }
        // else resolve('login without relays')
      });
    }
    else 
    {
      aa.log('enable extension first and try again');
      // resolve('no login');
    }
  // });
};


// load your metadata into input prefixed with set metadata command
aa.p.k0 =(s='')=>
{
  let p;
  if (aa.is.key(s) && aa.db.p[s]) p = aa.db.p[s];
  else p = aa.u.p;
  if (p.metadata) return JSON.stringify(p.metadata);
  return ''
  // if (p.metadata) aa.cli.v(localStorage.ns+' mk 0 '+JSON.stringify(p.metadata));
};


// set your metadata (kind-0)
aa.mk.k0 =async s=>
{
  let md = aa.parse.j(s);
  if (!md) return;
  aa.dialog(
  {
    title:'new metadata',
    l:aa.mk.ls({ls:md}),
    no:{exe:()=>{}},
    yes:{exe:()=>
    {
      const event = 
      {
        pubkey:aa.u.p.xpub,
        kind:0,
        created_at:aa.t.now,
        content:JSON.stringify(md),
        tags:[]
      };
      aa.e.finalize(event).then(e=>{console.log(e)});
    }},
  });
};


// u add to s
aa.u.k3_add =async s=>
{
  if (!aa.u.p) 
  {
    aa.log('no u found, set one first')
    return
  }
  
  let tag = aa.fx.tag_k3(s.trim().split(','));
  if (!tag) return;
  
  let dat_k3 = await aa.p.events_last(aa.u.p,'k3');
  if (!dat_k3) return false;
  dat_k3 = await aa.db.get_e(dat_k3);
  if (!dat_k3)
  {
    aa.log('no k3 found, create one first');
    return
  }
  const new_k3 = aa.e.normalise(
  {
    kind:3,
    content:dat_k3.event.content,
    tags:[...dat_k3.event.tags,tag]
  });

  aa.dialog(
  {
    title:'new follow list',
    l:aa.mk.tag_list(new_k3.tags),
    scroll:true,
    no:{exe:()=>{}},
    yes:
    {
      exe:()=>
      { 
        aa.e.finalize(new_k3).then(e=>{console.log('sent')})
      }
    }
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

  let keys_to_unfollow = s.trim().split(' ');
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
      aa.db.get_p(k).then(p=>aa.p.p_links_upd(p))
    }
    else aa.log('invalid pubkey to unfollow')
  }

  if (new_follows.length)
  {
    const l = aa.mk.l('div',{cla:'wrap'});
    l.append(aa.mk.tag_list(new_follows),ul);
    aa.dialog(
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
        aa.e.finalize(event);
      }},
    });
  }
};


// Encrypted direct Message
aa.mk.k4 =async(s='')=>
{
  let [pubkey,text] = s.split(aa.regex.fw);
  let event = {kind:4,tags:[['p',pubkey]]};
  event.content = await window.nostr.nip04.encrypt(pubkey,text);
  aa.e.draft(aa.mk.dat(
  {
    event:aa.e.normalise(event),
    clas:['encrypted']
  }));
};


// new reaction event (kind-7)
// should go to aa.e
aa.mk.k7 =async s=>
{
  let [xid,reaction] = s.trim().split(' ');
  if (!aa.is.x(xid) || !aa.is.one(reaction))
  {
    aa.log('reaction failed');
    return
  }
  
  aa.cli.fuck_off();
    
  const event = 
  {
    pubkey:aa.u.p.xpub,
    kind:7,
    created_at:aa.t.now,
    content:reaction,
    tags:[]
  };

  let reply_dat = await aa.db.get_e(xid);
  if (reply_dat) event.tags.push(...aa.get.tags_for_reply(reply_dat.event));
  aa.e.finalize(event);
};


// is nip4 cyphertext
aa.is.nip4 =s=> 
{
  let l = s.length;
  if (l < 28) return false;

  return s[l - 28] == '?' 
  && s[l - 27] == 'i'
  && s[l - 26] == 'v'
  && s[l - 25] == '='
};


// post event
aa.clk.post =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat) 
  {
    let relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r).filter(r=>!dat.seen.includes(r));
    aa.r.broadcast(dat.event,relays);
  }
};


// pow event
aa.clk.pow =e=>
{
  let id = e.target.closest('.note').dataset.id;
  aa.cli.v(`${localStorage.ns} e pow ${id} ${localStorage.pow}`);
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


// react to event
aa.clk.react =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  aa.cli.v(`${localStorage.ns} mk 7 ${xid} ${localStorage.reaction}`);
};


// u set mode
aa.u.set_mode =s=>
{
  switch (s)
  {
    case 'easy':
      // let butt_u = document.getElementById('butt_u');
      // if (!butt_u.parentElement.classList.contains('.expanded')) butt_u.click();
      aa.o.add('mode easy');
      aa.q.stuff();
      break;

    case 'hard': 
      aa.o.add('mode hard'); 
      break;

    default:
      aa.o.add('mode normal');
  }
};


// u set pubkey
aa.u.set_u_p =s=>
{   
  let pub = s.trim();
  if (pub) 
  {
    let o = {};
    if (!aa.is.x(pub) && pub.startsWith('npub')) o = {xpub:aa.fx.decode(pub),npub:pub};
    else if (aa.is.x(pub)) o = {xpub:pub,npub:aa.fx.encode('npub',pub)};
    aa.u.o.ls = o;
    aa.mod_save(aa.u).then(aa.u.start);
  } 
};


// sign event
aa.clk.sign =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat && !dat.event.sig)
  {
    aa.u.sign(dat.event).then(signed=>
    {
      if (signed)
      {
        dat.event = signed;
        dat.clas = aa.fx.a_rm(dat.clas,['draft']);
        aa.fx.a_add(dat.clas,['not_sent']);
        aa.db.upd_e(dat);
        aa.e.print(dat);
      }
    })
  }
  else aa.log('nothing to sign')
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
    window.nostr.signEvent(event).then(e=>resolve(e));
  });
};


// make u mod item
aa.u.mk =(k,v)=>
{
  let l;
  switch (k)
  {
    case 'npub':
      l = aa.mk.l('li',{id:aa.u.def.id+'_'+k,cla:'item'});
      let link = aa.mk.nostr_link(v,'view');
      link.classList.add('key');
      link.title = 'view u';
      l.append(
        link,
        ' ',
        aa.mk.l('span',{cla:'val',con:v})
      );
      break;
      
    default: l = aa.mk.item(k,v);
  }
  return l
};


// start mod
aa.u.start =async mod=>
{
  let ls = mod?.o?.ls;
  if (!ls.xpub)
  { 
    let log = aa.mk.l('p',{cla:'u_login'});
    log.append(aa.mk.butt_action('u login '));
    log.append(' ',aa.mk.butt_action('u login easy','easy'));
    log.append(' ',aa.mk.butt_action('u login hard','hard'));
    aa.log(log); 
    return 
  }
  else document.querySelector('.u_login')?.parentElement.remove();

  
  aa.fx.color(ls.xpub,document.getElementById('u_u'));

  let p = await aa.db.get_p(ls.xpub);
  if (!p) p = aa.p.p(ls.xpub);

  let upd;
  if (p.score < 9) 
  {
    p.score = 9;
    upd = true;
  }
  if (aa.fx.a_add(p.sets,['u'])) upd = true;
  
  let butt_u = document.getElementById('butt_u_u');
  if (butt_u) 
  {
    butt_u.textContent = ls.xpub.slice(0,1)+'_'+ls.xpub.slice(-1);
    if (aa.is.trusted(p.score)) aa.p.p_link_pic(butt_u,p.metadata.picture);
  }
  aa.p.profile(p);
  if (p.events.k3?.length) aa.p.load_profiles(p.follows);
  if (upd) aa.p.save(p);
  aa.mk.mod(mod);
  // mod.l.append(aa.mk.ls({ls:p}));
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
    let dat = await aa.db.idb.ops({get_a:{store:'authors',a:to_get}});
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

aa.u.outbox =(a=[],sets=[])=>
{
  if (!sets.length) sets = [aa.r.o.w,'k10002'];
  // console.log(sets);
  if (!a?.length) return [];
  let relays = aa.fx.common_relays(a,sets);
  // console.log(relays);
  let outbox = aa.fx.intersect(relays,a);
  console.log(outbox);
  let sorted_outbox = Object.entries(outbox).sort(aa.fx.sorts.v);
  console.log(sorted_outbox);
  return sorted_outbox;
};

aa.fx.common_relays =(a=[],sets=[])=>
{
  let common = {};
  let offed = aa.fx.in_set(aa.r.o.ls,'off',0);
  for (const x of a)
  {
    let has_set;
    let relays = aa.db.p[x]?.relays;
    if (relays) 
    {
      relays = aa.fx.in_sets_all(relays,sets);
      if (relays.length) has_set = true;
    }

    for (const r of relays)
    {
      if (offed.includes(r)) continue;
      if (!common[r]) common[r] = [];      
      if (!common[r].includes(x)) common[r].push(x)
    }

    if (!has_set) 
    {
      for (const r of aa.fx.in_set(aa.r.o.ls,aa.r.o.r))
      {
        if (!common[r]) common[r] = [];
        aa.fx.a_add(common[r],[x]);
      }
    }
  }
  return common
};


// encrypted direct message
aa.kinds[4] =dat=>
{
  let note = aa.e.note_regular(dat);
  let p_x = aa.mk.note_encrypted(dat,note);

  let k_v = 'pubkey_'+p_x;
  if (aa.p.viewing && aa.p.viewing[1] === k_v) 
  {
    aa.p.viewing[0].push(note);
    aa.i.solo(note,k_v);
  }

  return note
};


aa.mk.note_encrypted =(dat,note)=>
{
  let content = note.querySelector('.content');
  content.classList.add('encrypted');
  content.querySelector('.paragraph').classList.add('cypher');
  if (!dat.clas.includes('draft'))
  {
    note.querySelector('.actions .butt.react')?.remove();
    note.querySelector('.actions .butt.req')?.remove();
  }
  let p_x = aa.fx.tag_value(dat.event.tags,'p') || dat.event.pubkey;
  if (aa.u.o.ls.xpub === p_x)
  {
    note.classList.add('for_u');
    content.append(aa.mk.butt_action('u decrypt '+dat.event.id,'decrypt','decrypt'));
  }
  return p_x
};


aa.fx.split_str =(s='')=>
{
  if (s.startsWith('"" ')) return ['',s.slice(3)];
  let dis = s?.match(aa.regex.str);
  if (dis && dis.length) return [dis[1],s.slice(dis.index+dis[0].length).trim()]
  return [s]
};


// sign and broadcast event
aa.clk.yolo =async e=>
{
  let xid = await aa.u.pow_note(e.target.closest('.note').dataset.id);
  if (!xid)
  {
    aa.log('nothing to sign');
    return
  }

  let dat = aa.db.e[xid];

  aa.u.sign(dat.event).then(signed=>
  {
    if (signed)
    {
      dat.event = signed;
      dat.clas = aa.fx.a_rm(dat.clas,['draft']);
      aa.fx.a_add(dat.clas,['not_sent']);
      let relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.w);
      let pubs = aa.p.authors_from_tags(dat.event.tags);
      for (const x of pubs)
      {
        let read_relays = aa.fx.in_set(aa.db.p[x].relays,'read');
        let common = aa.fx.a_common(relays,read_relays);
        if (!common.common.length < 3)
        {
          relays.push(...common.uncommon.slice(0,3 - common.common.length))
        }

        
        // let p = aa.db.p[pub];
        // let i = 0;
        // for (const r in p.relays)
        // {
        //   i++;
        //   let rr = [];
        //   if (p.relays[r].sets.includes('read')) rr.push(r);
        //   aa.fx.a_add(relays,rr);
        //   if (i>3) break;
        // }
      }
      relays = new Set(relays);
      
      aa.r.broadcast(dat.event,relays);
    }
  })
};

window.addEventListener('load',aa.u.load);