/*

alphaama
mod    u
user you

*/


aa.styleshit('/u/u.css');

aa.u = 
{
  def:{id:'u',ls:{}},
  old_id:'aka',
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
      con:'nip7 signer not found (!window.nostr)',
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


// make event from JSON string, autocompletes missing fields
aa.u.event_mk =s=>
{
  let event = aa.parse.j(s);
  if (event)
  {
    let dis = aa.u.event_normalise(event);
    aa.u.event_draft({event:dis,clas:['draft'],seen:[],subs:[]});
    aa.cli.fuck_off();
  }
};


// event complete
aa.u.event_normalise =event=>
{
  if (!event.pubkey) event.pubkey = aa.u.p.xpub;
  if (!event.kind) event.kind = 1;
  if (!event.created_at) event.created_at = aa.t.now;
  if (!event.tags) event.tags = [];
  if (!event.content) event.content = '';
  return event
}


// draft event
aa.u.event_draft =async dat=>
{
  aa.fx.a_add(dat.clas,['draft']);
  dat.event.tags = [...new Set(dat.event.tags)];
  if (!dat.event.id) dat.event.id = aa.fx.hash(dat.event);
  aa.db.e[dat.event.id] = dat;
  aa.e.print(dat);
  
  let sect = document.getElementById('e');
  if (sect && !sect.classList.contains('expanded')) aa.clk.expand({target:sect});
};


// finalize event creation
aa.u.event_finalize =async event=>
{
  event.tags = [...new Set(event.tags)];
  if (!event.id) event.id = aa.fx.hash(event);
  const signed = await aa.u.sign(event);
  if (signed)
  {
    aa.db.e[event.id] = dat = {event:signed,seen:[],subs:[],clas:[]};
    aa.db.upd_e(dat);
    aa.e.print(dat);
    aa.r.broadcast(signed);
  }
};


// decrypt kind-4 from id
aa.u.decrypt =async s=>
{
  aa.cli.fuck_off();
  
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
    return false;
  }

  let p_x = aa.get.tags(dat.event,'p')[0][1];
  if (aa.u.p.xpub !== p_x)
  {
    aa.log('content not for you');
    return
  }

  let decrypted = await window.nostr.nip04.decrypt(dat.event.pubkey,dat.event.content);
  if (!decrypted)
  {
    aa.log('decrypt failed');
    return
  }

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
aa.u.is_following =xpub=>
{
  if (aa.u?.p?.follows?.includes(xpub)) return true;
  return false
};


// if hex key is your pubkey
aa.is.u =x=> aa.u?.o?.ls?.xpub === x;


// make p tag array from array
aa.mk.tag_p =a=>
{
  let p_tag = ['p'];
  let k,relay,petname;
  
  if (a.length) k = a.shift().trim();
  if (!k) return false;
  if (k.startsWith('npub')) k = aa.fx.decode(k);
  if (!aa.is.key(k)) 
  {
    aa.log('invalid key to follow '+k);
    return false
  }
  if (aa.u.is_following(k)) 
  {
    aa.log('already following '+k);
    return false
  }
  p_tag.push(k);

  if (a.length) 
  {
    relay = a.shift().trim();
    let url = aa.is.url(relay);
    if (url) p_tag.push(url.href);
    else p_tag.push('')
  }

  if (a.length) 
  {
    petname = a.shift().trim();
    p_tag.push(aa.fx.an(petname));
  }
  return p_tag
};


// u add to follows
aa.u.follow =async s=>
{
  if (!aa.u.p) 
  {
    aa.log('no u found, set one first')
    return
  }

  aa.cli.fuck_off();
  
  let p_tag = aa.mk.tag_p(s.trim().split(','));
  if (!p_tag) return;
  while (p_tag[p_tag.length - 1].trim() === '') p_tag.pop();
  let dat_k3 = await aa.p.get_last_of(aa.u.p,'k3');
  if (!dat_k3)
  {
    aa.log('no k3 found, create one first');
    return
  }
  const new_k3 =
  {
    pubkey:aa.u.p.xpub,
    kind:3,
    created_at:aa.t.now,
    content:dat_k3.event.content,
    tags:[...dat_k3.event.tags,p_tag]
  };

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
        aa.u.event_finalize(new_k3).then(e=>{console.log('sent')})
      }
    }
  });
};


// on load
aa.u.load =()=>
{ 
  aa.actions.push(
    {
      action:['u','login'],
      optional:['easy || hard'],
      description:'load pubkey and relays from ext with optional mode, leave blank for default',
      exe:aa.u.login
    },
    {
      action:['u','decrypt'],
      required:['id'],
      description:'decrypt note',
      exe:aa.u.decrypt
    },
    {
      action:['u','md'],
      description:'autofills metadata to edit and set',
      exe:aa.u.metadata_load
    },
    {
      action:['u','smd'],
      required:['{JSON}'], 
      description:'set metadata (kind-0)',
      exe:aa.u.metadata_set
    },
    {
      action:['e','react'],
      required:['id','reaction'], 
      description:'react to a note',
      exe:aa.u.react
    },
    {
      action:['e','mk'],
      required:['JSON'],
      description:'mk event from JSON',
      exe:aa.u.event_mk
    },
    {
      action:['e','pow'],
      required:['hex_id','difficulty'],
      description:'add proof-of-work to note',
      exe:aa.u.pow
    },
    {
      action:['p','follow'],
      required:['id'], 
      optional:['relay','petname'], 
      description:'follow account (hex or npub)',
      exe:aa.u.follow
    },
    {
      action:['p','unfollow'],
      required:['id'], 
      optional:['more ids..'], 
      description:'unfollow account (hex or npub)',
      exe:aa.u.unfollow
    },
    {
      action:['u','dm'],
      required:['text','p_list'],
      description:'send dm to pubkeys',
      exe:aa.u.dm
    },
  );
  
  aa.mod_load(aa.u).then(aa.u.start);
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


// relay hint notice
aa.u.login_notice =()=>
{
  // needs to display info from what npub, where does the notice come from?
  
  let id = 'notice_'+aa.fx.an(url);
  if (document.getElementById(id)) return;
  
  let text = `r add ${url} `;
  let notice = {title:text};
  notice.id = id;
  notice.butts = {};

  notice.butts.yes =
  {
    title:set,
    exe:e=>
    {
      aa.r.add(`${url} ${set}`);
      aa.r.c_on(url,opts);
      setTimeout(()=>
      {e.target.parentElement.textContent = `${text} ${set}`},50);
    }
  };
  let set_off = 'off';
  notice.butts.no =
  {
    title:set_off,
    exe:e=>
    {
      aa.r.add(`${url} ${set_off}`);
      setTimeout(()=>
      {e.target.parentElement.textContent = `${text} ${set_off}`},50);
    }
  };
  let set_other = 'other'
  notice.butts.maybe =
  {
    title:set_other,
    exe:e=>
    {
      aa.r.add(url);
      aa.r.c_on(url,opts);
      aa.cli.v(localStorage.ns+' '+text);
      setTimeout(()=>
      {e.target.parentElement.textContent = `${text} ${set_other}`},50);
    }
  };
  aa.log(aa.mk.notice(notice));
};


// load your metadata into input prefixed with set metadata command
aa.u.metadata_load =()=>
{
  const md = aa.u.p.metadata;
  if (md) aa.cli.v(localStorage.ns+' '+aa.u.def.id+' smd '+JSON.stringify(md));
};


// set your metadata (kind-0)
aa.u.metadata_set =async s=>
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
      aa.u.event_finalize(event).then(e=>{console.log(e)});
    }},
  });
};


// add proof-of-work (pow) to note
aa.u.pow =async s=>
{
  let [xid,difficulty] = s.trim().split(' ');
  difficulty = parseInt(difficulty);
  if (!aa.is.x(xid) || !difficulty) { aa.log('pow failed'); return }

  let note = document.querySelector(`.note[data-id="${xid}"]`);
  if (!note) { aa.log(`pow failed: note not found`); return }
  aa.u.mine_note(xid,difficulty);
};

aa.u.mine_note =async(xid,difficulty = 0)=>
{
  return new Promise(async resolve=>
  {
    let event = aa.db.e[xid].event;
    let note = document.querySelector(`.note[data-id="${xid}"]`);
    let pow = difficulty;
    if (!pow)
    {
      let nonce = event.tags.filter(t=>t[0] === 'nonce');
      if (!nonce.length) pow = parseInt(localStorage.pow);
    }
    if (pow && aa.fx.clz(xid) < pow) 
    {
      if (note) note.classList.add('mining');
      let mined = await aa.fx.pow(event,pow);
      let [pow_e,r] = mined;
      if (pow_e)
      {
        if (note) aa.e.note_rm(note)
        // {
        //   if (aa.viewing === note.id) aa.state.clear();
        //   note.remove();
        // }
        // delete aa.db.e[xid];
        event = pow_e;
        aa.u.event_draft(aa.mk.dat({event:event,clas:['draft']}));
      }
      else aa.log('pow failed')
    }
    resolve(event.id)
  });
};


// new reaction event (kind-7)
// should go to aa.e
aa.u.react =async s=>
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
  aa.u.event_finalize(event);
};


// u set mode
aa.u.set_mode =s=>
{
  switch (s)
  {
    case 'easy':
      // let butt_u = document.getElementById('butt_u');
      // if (!butt_u.parentElement.classList.contains('.expanded')) butt_u.click();
      aa.o.set('mode easy');
      aa.q.stuff();
      break;

    case 'hard': 
      aa.o.set('mode hard'); 
      break;

    default:
      aa.o.set('mode normal');
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
      let link = aa.mk.nostr_link(v,'-->');
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


// remove keys from follow list
aa.u.unfollow =async s=>
{
  if (!aa.u.p) 
  {
    aa.log('no u found, set one first');
    return false
  }
  
  let dat_k3 = await aa.p.get_last_of(aa.u.p,'k3');
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
      new_follows = new_follows.filter(p=>p[1]!==k);
      aa.p.score(k+' 4');
      aa.p.p_links_upd(p);
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
          pubkey:aa.u.p.xpub,
          kind:3,
          created_at:aa.t.now,
          content:dat_k3.event.content,
          tags:new_follows
        };
        aa.u.event_finalize(event).then(e=>{console.log('sent')});
      }},
    });
  }
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
        if (!aa.u.is_following(xid))
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

aa.u.outbox =(a=[],sets=[aa.r.o.w,'k10002'])=>
{
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
  // if (!sets.length) sets = [aa.r.o.w,'k10002'];
  let relays = {};
  let offed = aa.fx.in_set(aa.r.o.ls,'off',0);

  for (const x of a)
  {
    let has_set;
    let p_relays = aa.db.p[x]?.relays;
    if (p_relays) p_relays = aa.fx.in_sets(p_relays,sets);
    if (p_relays.length) has_set = true;
    // console.log(p_relays);

    for (const r of p_relays)
    {
      if (offed.includes(r)) continue;
      if (!relays[r]) relays[r] = [];      
      if (!relays[r].includes(x)) relays[r].push(x)
    }

    if (!has_set) 
    {
      for (const r of aa.fx.in_set(aa.r.o.ls,aa.r.o.r))
      {
        if (!relays[r]) relays[r] = [];
        aa.fx.a_add(relays[r],[x]);
      }
    }
  }
  return relays
};


// encrypted direct message
aa.kinds[4] =dat=>
{
  let note = aa.e.note_regular(dat);
  let content = note.querySelector('.content');
  if (!dat.clas.includes('draft'))
  {
    content.classList.add('encrypted');
    content.querySelector('.paragraph').classList.add('cypher');
    note.querySelector('.actions .butt.react')?.remove();
    note.querySelector('.actions .butt.req')?.remove();
  }
  let u_x = aa.u.o.ls.xpub;
  let p_x = aa.get.tags(dat.event,'p')[0][1];
  if (u_x === p_x)
  {
    note.classList.add('for_u');
    content.append(aa.mk.butt_action('u decrypt '+dat.event.id,'decrypt','decrypt'));
  }
  let k_v = 'pubkey_'+p_x;
  if (aa.p.viewing && aa.p.viewing[1] === k_v) 
  {
    aa.p.viewing[0].push(note);
    aa.i.solo(note,k_v);
  }

  return note
};



aa.u.dm =async s=>
{
  let text, cm = s?.match(aa.regex.str);
  if (cm.length)
  {
    text = cm[1];

    authors = s.slice(cm.index+cm[0].length)
    .trim().split(',').filter(aa.is.key);
    if (!authors.length) authors.push(aa.u.p.xpub);

    let sec = NostrTools.generateSecretKey();
    let pub = NostrTools.getPublicKey(sec);
    
    for (const p of authors)
    {
      let event = {pubkey:pub,kind:4,tags:[['p',p]]};
      event.content = await NostrTools.nip04.encrypt(sec,p,text);
      aa.u.event_draft(aa.mk.dat(
      {
        event:aa.u.event_normalise(event),
        clas:['encrypted']
      }));
    }
  }
};

window.addEventListener('load',aa.u.load);