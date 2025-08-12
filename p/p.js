/*

alphaama
mod    p
author pubkey profile

*/

aa.db.p = {};
aa.p =
{
  def:{id:'p'},
  name:'profiles',
  about:'manage user profiles',
  scripts:
  [
    '/p/clk.js?v='+aa_version,
    '/p/mk.js?v='+aa_version,
    '/p/view.js?v='+aa_version,
  ],
  styles:['/p/p.css'],
  butts:
  {
    pa:
    [
      ['get_notes','p_req'],
      ['refresh','p_refresh'],
      ['@','mention'],
    ]
  }
};




aa.mk.styles(aa.p.styles);


// follow add x to k3
// aa.p.add =async x=>
// {
//   //follow
//   let new_follow = [x];
//   const p = await aa.p.get(x);
//   new_follow.push(aa.p.relay(p));
//   let petname;
//   if (p.metadata?.name) petname = p.metadata.name;
//   else if (p.petnames.length) petname = p.petnames[0];
//   if (petname?.length) new_follow.push(aa.fx.an(petname));
//   else new_follow.push('');
//   aa.cli.add('p add '+new_follow.join(', '))
//   // aa.cli.v(localStorage.ns+' p add '+new_follow.join(', '));
// };


// load author p from pubkey
aa.p.author =async pubkey=>
{
  return await aa.p.get(pubkey) || aa.p.p(pubkey);
};


// get a name for display
aa.p.author_name =p=>
{
  return p.metadata?.name 
  || p.petname
  || p.petnames[0]
  || p.metadata?.display_name 
  || p.metadata?.nip05 
  || p.pubkey.slice(0,12);
};


// load missing authors from db into memory
aa.p.authors_load =async a=>
{
  if (!a?.length) return [];
  let not_loaded = [...new Set(a.filter(i=>!Object.hasOwn(aa.db.p,i)))];
  if (!not_loaded.length) return [];

  let stored = await aa.p.get_authors(not_loaded);
  if (!stored?.length) return [];
  for (const p of stored) aa.db.p[p.pubkey] = p;
  
  let stored_ids = stored.map(i=>i.pubkey);
  return not_loaded.filter(i=>!stored_ids.includes(i));
  console.log(missing)
  return missing
};


// populate list element with authors
aa.p.authors_list =(a,cla,sort='text_asc')=>
{
  if (!a.length) return;
  cla = 'list list_grid author_list'+(cla?' '+cla:'');
  const l = aa.mk.l('ul',{cla});

  fastdom.mutate(()=>
  {
    for (const x of a)
    {
      l.append(aa.mk.l('li',
      {
        cla:'item author_list_item',
        app:aa.mk.p_link(x)
      }))
    }
  });

  setTimeout(()=>
  {
    fastdom.mutate(()=>
    {
      let summ = l.previousElementSibling;
      if (summ?.tagName === 'SUMMARY')
      {
        summ.dataset.count = a.length;
      }
      aa.fx.sort_l(l,sort)
    })
  },618);

  return l
};


// clear profile filter
aa.p.clear =e=>
{
  if (aa.e.l.dataset.solo?.length)
  {
    if (aa.p.viewing) 
    {
      items = aa.p.viewing[0];
      k_v = aa.p.viewing[1];
      delete aa.p.viewing;
      aa.i.filter_solo_rm(items,k_v);
    }
    else 
    {
      let solos = aa.e.l.dataset.solo.split(' ');
      for (const solo of solos)
      {
        let pub = solo.split('_')[1];
        items = aa.fx.index_items('pubkey',pub);
        k_v = 'pubkey_'+pub;
        aa.i.filter_solo_rm(items,k_v);
      }
    }
  }
};


// verify nip05
aa.p.check_nip05 =async(s,p)=>
{
  let verified = false;
  let dis = await NostrTools.nip05.queryProfile(s);
  if (dis)
  {
    if (!p) p = await aa.p.get(dis.pubkey);
    if (p && dis.pubkey === p.pubkey) verified = true
  }
  
  if (p)
  {
    p.verified.unshift([verified,aa.now]);
    aa.p.save(p);
  }

  // aa.log('nip5 '+verified+' for '+s);
  return verified
};


// data for p_links, etc
aa.p.data =async(p,upd)=>
{
  let o = aa.temp.p_link.get(p.pubkey);
  if (!o) 
  {
    o = {pubkey:p.pubkey,a:[]};
    aa.temp.p_link.set(p.pubkey,o);
  }
  if (!o.data || upd) o.data = await aa.p.link_data(p);
  return o
};


// return last stored replaceable event id from p of kind n
aa.p.events_last =(p,kn,s='')=>
{
  if (p.events[kn])
  {
    let id;
    if (s && p.events[kn][s]?.length) id = p.events[kn][s][0][0];
    else if (p.events[kn][0]) id = p.events[kn][0][0];
    return id
  }
  return false
};


// check if replaceable event is newer
aa.p.events_newer =(p,event,param)=>
{
  let upd = false;
  if (!param) param = aa.fx.tag_value(event.tags,'d');
  let kn = p.events['k'+event.kind];
  if (!kn) kn = p.events['k'+event.kind] = param ? {} : [];
  if (param)
  {
    if (!kn[param]) kn[param] = [];
    kn = kn[param];
  }
  
  if (!kn.length || kn[0][1] < event.created_at) 
  {
    kn.unshift([event.id,event.created_at]); //,JSON.stringify(event)
    aa.p.updated(p,event.created_at);
    upd = true
  }
  return upd
};


// true if p follows pubkey
// default p is u
aa.p.following =(pubkey,p)=>
{
  if (!p) p = aa.u?.p;
  if (p?.follows?.includes(pubkey)) return true;
  return false
};


// return follows of pubkey
aa.p.follows =async(s='')=>
{
  let pubkey = aa.fx.is_key(s) ? s : aa.u?.p?.pubkey;
  let p = aa.db.p[pubkey];//aa.p.author(pubkey);
  let follows = p ? p.follows : [];
  aa.log(`${follows.length} follows of ${pubkey}`);
  return follows
};


aa.p.follows_upd =event=>
{
  const is_u = aa.fx.is_u(event.pubkey);
  const a_p = [];
  for (const tag of event.tags)
  {
    if (!aa.fx.is_tag_p(tag)) continue;

    const [type,pubkey,relay,petname] = tag;

    let upd;
    let p = aa.db.p[pubkey];
    if (!p)
    {
      p = aa.db.p[pubkey] = aa.p.p(pubkey);
      upd = true;
    }

    if (relay)
    {
      let url = aa.fx.url(relay)?.href;
      if (url && is_u)
      {
        if (!p.relays[url]) p.relays[url] = {sets:[]};
        if (aa.fx.a_add(p.relays[url].sets,['hint'])) upd = true;
      }
      // if (is_u && p.relay !== relay) { p.relay = relay; upd = true; }
    }

    if (petname)
    {
      if (!p.petnames) p.petnames = [];
      if (aa.fx.a_add(p.petnames,[petname])) upd = true;
      if (is_u && p.petname !== petname) { p.petname = petname; upd = true; }
    }

    if (aa.fx.a_add(p.followers,[event.pubkey])) upd = true;
    
    if (is_u)
    {
      if (p.score === 0) 
      { 
        p.score = 5; 
        upd = true 
      }
      if (aa.fx.a_add(p.sets,['k3'])) upd = true;
    }
    if (upd) a_p.push(p);
  }
  return a_p
};


// returns profile if already loaded or get it from database
aa.p.get =async pubkey=>
{
  if (!aa.fx.is_key(pubkey)) return;
  if (aa.db.p[pubkey]) return aa.db.p[pubkey];
  let p = await aa.db.ops('idb',{get:{store:'authors',key:pubkey}});
  if (p)
  {
    aa.db.p[pubkey] = p;
    aa.p.links_upd(p)
  }
  return p
};


// load author list from db into memory
aa.p.get_authors =async pubkeys=>
{
  const p_to_get = new Set();
  for (const x of pubkeys) if (!aa.db.p[x]) p_to_get.add(x);
  if (!p_to_get.size) return [];
  return await aa.db.ops('idb',
  {
    get_a:{store:'authors',a:[...p_to_get.values()]}
  });
};


// returns link data from p
aa.p.link_data =async p=>
{
  let o = {pubkey:p.pubkey,class_add:[],class_rm:[],src:false};
  o.name = aa.p.author_name(p);
  let petname = p.petname || p.petnames[0];
  if (petname) o.petname = petname;
  if (p.metadata)
  {
    if (p.metadata.nip05) o.nip05 = p.metadata.nip05;
    if (p.verified.length) o.verified = p.verified[0];
    if (p.metadata.picture && aa.fx.is_trusted(p.score))
    {
      let url = aa.fx.url(p.metadata.picture.trim())?.href;
      if (url)
      {
        let cached = await aa.db.ops('cash',{out:[url]});
        if (cached?.length) 
        {
          // console.log(cached[0]);
          // url = cached[0];
          url = URL.createObjectURL(cached[0]);
        }
        else
        {
          if (p.score > 3) await aa.db.ops('cash',{all:[url]});
//     // {
//     //   aa.db.ops('cash',{add:[p.metadata.picture]});
//     //   src = p.metadata.picture;
//     // }
        }
        o.src = url;
      }
    }
  }
  else o.miss = true;

  if (aa.fx.is_u(p.pubkey))
  {
    aa.fx.a_add(o.class_add,['is_u']);
    aa.fx.a_add(o.class_rm,['is_mf','is_bff'])
  }
  else 
  {
    aa.fx.a_add(o.class_rm,['is_u']);
    // follows u
    if (aa.p.following(aa.u.p?.pubkey,p))
    {
      aa.fx.a_add(o.class_add,['fu']);
    }
  }
  
  if (aa.p.following(p.pubkey)) 
  {
    aa.fx.a_add(o.class_rm,['is_mf']);
    aa.fx.a_add(o.class_add,['is_bff']);
  }
  else
  {
    aa.fx.a_add(o.class_rm,['is_bff']);
    aa.fx.a_add(o.class_add,['is_mf']);
  }
  
  // followed by those you follow
  let common = 0;
  for (const k of p.followers) { if (aa.p.following(k)) common++ }
  o.followers = common;
  return o
};


// update link
aa.p.link_data_upd =async(l,o)=>
{
  let name = l.querySelector('.name');
  let title = `${o.pubkey}\n${l.href.split('#')[1]}\n`;
  fastdom.mutate(()=>
  {
    // name
    if (name.textContent !== o.name) name.textContent = o.name;
    if (!name.childNodes.length) name.classList.add('empty');
    else name.classList.remove('empty');
    title += o.name;
    // petname
    if (o.petname) 
    {
      name.dataset.petname = o.petname;
      title += ` (${o.petname})`
    }
    // picture
    aa.p.link_img(l,o.src);
    // nip05
    if (o.nip05)
    {
      title += `\n${o.nip05} (${o.verified})`;
      for (const dis of [l,name])
      {
        dis.dataset.nip05 = o.nip05;
        if (o.verified)
        {
          dis.dataset.verified = o.verified[0];
          dis.dataset.verified_on = o.verified[1];
        }
      }
      
    }

    l.title = title;
    l.classList.add(...o.class_add);
    l.classList.remove(...o.class_rm);
    l.dataset.followers = o.followers;
  });
};


// add picture to p_link
aa.p.link_img =async(l,src=false)=>
{
  let pic = l.querySelector('img');
  if (src)
  {
    if (!pic)
    {
      pic = aa.mk.l('img',{cla:'img'});
      pic.setAttribute('loading','lazy');
      l.append(pic);
      l.classList.add('has-picture');
    }
    if (!pic.src||pic.src!==src) pic.src = src
  }
  else if (pic)
  {
    l.removeChild(pic);
    l.classList.remove('has-picture');
  }
};


// updates all links from p
aa.p.links_upd =async p=>
{
  let o = await aa.p.data(p,1);
  for (const i of o.a) aa.p.link_data_upd(i,o.data);
};


// on load
aa.p.load =async()=>
{
  let mod = aa.p;
  let id = mod.def.id;
  await aa.mk.scripts(mod.scripts);

  aa.temp.p_link = new Map();
  aa.clears.push(aa.p.clear);
  aa.actions.push(
    {
      action:[id,'view'],
      required:['<pubkey>'],
      description:'view profile by pubkey',
      exe:(s)=>{ aa.view.state('#'+aa.fx.encode('npub',s)) }
    },
    {
      action:[id,'score'],
      required:['<id>','<number>'], 
      description:'set user score (for auto parsing and stuff)',
      exe:aa.p.score
    },
    {
      action:[id,'check'],
      required:['<name@domain>'], 
      description:'check nip5 validity',
      exe:aa.p.check_nip05
    },
    {
      action:[id,'md'],
      optional:['<pubkey>'], 
      description:'return metadata of pubkey',
      exe:aa.p.md
    },
    {
      action:[id,'follows'],
      optional:['<pubkey>'], 
      description:'followed by pubkey',
      exe:aa.p.follows
    },
  );
  // oto complete profiles
  aa.cli.on_upd.push(aa.p.oto);
  aa.p.l = aa.mk.l('div',{id:'authors'});
  aa.mod.help_setup(aa.p);
};


// load profiles given a list of hex pubkeys
aa.p.load_profiles =async a=>
{
  if (!a?.length) return;

  let stored = await aa.db.ops('idb',{get_a:{store:'authors',a:a}});
  for (const dis of stored) 
  {
    aa.db.p[dis.pubkey] = dis;
    // aa.mk.profile(dis);
  }
  for (const x of a)
  {
    if (!aa.db.p[x])
    {
      aa.e.miss_set('p',x);
      aa.db.p[x] = aa.p.p(x);
    }
    setTimeout(()=>{aa.mk.profile(aa.db.p[x])},0)
  }
};


// load your metadata into input prefixed with set metadata command
aa.p.md =(s='')=>
{
  let p;
  if (aa.fx.is_key(s) && aa.db.p[s]) p = aa.db.p[s];
  else p = aa.u?.p;
  if (p.metadata) return JSON.stringify(p.metadata);
  return ''
};


// migrate deprecated fields to new values
aa.p.migrate_p_fields =p=>
{
  let upd;

  if (p.trust && p.score < p.trust)
  {
    p.score = p.trust;
    delete p.trust;
    upd = 1;
  }

  if (!p.petnames || (p.petnames && !Array.isArray(p.petnames)))
  {
    p.petnames = [];
    upd = 1;
  }
  if (p.extradata && (p.extradata.petnames.length !== !p.petnames.length))
  {
    p.petnames = p.extradata.petnames;
    upd = 1;
  }

  if (p.extradata && (!p.follows || (p.follows.length !== p.extradata.bff.length)))
  {
    p.follows = p.extradata.bff;
    upd = 1;
  }

  if (p.extradata && (!p.followers || (p.followers.length !== p.extradata.followers.length)))
  {
    p.followers = p.extradata.followers;
    upd = 1;
  }

  if (p.rels && (!p.relays || (Object.keys(p.relays).length !== Object.keys(p.rels).length)))
  {
    p.relays = p.rels;
    delete p.rels;
    upd = 1;
  }

  if (p.extradata)
  {
    delete p.extradata;
    upd = 1;
  }

  if (p.pastdata)
  {
    if (!p.events) p.events = {};
    for (const dis in p.pastdata) p.events[dis] = p.pastdata[dis];
    delete p.pastdata;
    upd = 1;
  }

  if (upd)
  {
    if (!p.nprofiles) p.nprofiles = [aa.fx.encode('nprofile',{pubkey:p.pubkey})];
    setTimeout(()=>{aa.p.save(p)},200);
  }
};



// creates a mention when composing a note
aa.p.oto =text=>
{
  const w = text.split(' ').pop();
  if (!w.startsWith('@') || w.length < 2) return
  // remove @ from start of word string
  let s = w.slice(1).toLowerCase();
  // filter p conditions
  const for_mentions =p=> 
  {
    if (p.hasOwnProperty('metadata'))
    {
      if (p.metadata.hasOwnProperty('name') && p.metadata.name?.length
      && p.metadata.name.toLowerCase().includes(s)) 
        return true;
      if (p.metadata.hasOwnProperty('nip05') && p.metadata.nip05?.length
      && p.metadata.nip05.toLowerCase().includes(s)) 
        return true;
    }
    for (const petname of [p.petname,...p.petnames])
    {
      if (petname?.toLowerCase().includes(s)) return true
    }
  };
  // 
  const a = Object.values(aa.db.p).filter(for_mentions)
  .sort((c,d)=>
  {
    let a_name = c.metadata.name || '';
    let b_name = d.metadata.name || '';
    
    if (a_name === s) return -1;
    if (b_name === s) return 1;

    if (a_name.startsWith(s) && !b_name.startsWith(s)) return -1;
    if (b_name.startsWith(s) && !a_name.startsWith(s)) return 1;

    if (a_name < b_name) return -1;
    if (a_name > b_name) return 1;
    return 0
  }).map(p=>aa.mk.mention_item(p,w));
  // for (const p of a) aa.cli.oto.append(...a);
  aa.cli.oto.append(...a);
};


// profile data
aa.p.p =pubkey=>
{
  if (!pubkey || !aa.fx.is_key(pubkey)) return;
  return {
    events:{}, // kind:[[id,created_at],...],kind:{identifier:[[id,created_at],...]}
    follows:[], // [pubkey1,pubkey2,...]
    followers:[], // [pubkey1,pubkey2,...]
    metadata:{}, // kind-0 content
    npub: aa.fx.encode('npub',pubkey), // npub encoded
    nprofiles:[aa.fx.encode('nprofile',{pubkey})], // [nprofile1a,nprofile1b]
    petname:'', // petname in kind:3 p tag
    petnames:[], // [petname1,petname2,...]
    pubkey, // hex pubkey
    relay:'', // relay in kind:3 p tag
    relays:{}, // url:{sets:[]}
    sets:[], // ['u','k3']
    score:0, // score
    updated:0, // last updated timestamp
    verified:[], // nip05 verification result [result,date]
    xpub:pubkey, // hex pubkey — to be deprecated
  }
};


// process all p tags from kind-3 event
aa.p.process_k3_tags =async event=>
{
  const is_u = aa.fx.is_u(event.pubkey);
  let ep = await aa.p.get(event.pubkey);
  let old_follows;
  if (ep?.follows?.length) old_follows = [...ep.follows];
  ep.follows = event.tags.filter(aa.fx.is_tag_p).map(i=>i[1]);
  let missing = await aa.p.authors_load(ep.follows);
  for (const pubkey of missing)
  {
    aa.e.miss_set('p',pubkey,)
    aa.db.p[pubkey] = aa.p.p(pubkey);
  }
  let to_upd = aa.p.follows_upd(event);
  to_upd.push(ep);
  if (is_u) aa.p.load_profiles(ep.follows);
  setTimeout(()=>
  {
    for (const p of to_upd) 
    {
      aa.p.save(p);
      aa.p.links_upd(p);
    }
  },200);
};


// update profile
aa.p.profile_upd =async(p)=>
{
  let profile = aa.mk.profile(p);
  const pubkey = profile.querySelector('.pubkey');
  const p_data = profile.querySelector('.profile_data');
  // const metadata = profile.querySelector('.metadata');
  // const extradata = profile.querySelector('.extradata');
  
  fastdom.mutate(()=>
  {
    profile.classList.add('upd');
    pubkey.replaceWith(aa.mk.profile_header(p));
    let profile_data = aa.mk.profile_data(p);
    if (p_data) p_data.replaceWith(profile_data);
    else profile.append(profile_data);
    // metadata.replaceWith(aa.mk.metadata(p));
    // extradata.replaceWith(aa.mk.extradata(p));
    profile.dataset.trust = p.score;
    profile.dataset.updated = p.updated ?? 0;
    aa.p.links_upd(p)
  });
};


// gets a relay url or empty string 
// for follow list relay hints
aa.p.relay =(p,set='write')=>
{
  let relays = aa.p.relays(p,set);
  if (!relays.length) return;

  const u_relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r).sort();
  for (const url of u_relays)
  {
    for (const r of relays)
    {
      const ru = aa.fx.url(r)?.href;
      if (ru === url) return url
    }
  }

  for (const r of relays)
  {
    const url = aa.fx.url(r)?.href;
    if (url) return url
  }
  return
};


aa.p.relays =(p,set='write')=>
{
  return Object.entries(p.relays)
  .filter(r=>r[1].sets.includes(set))
  .sort(aa.fx.sorts.sets)
  .map(r=>r[0])
}


// add relays to p
aa.p.relays_add =(relays={},p={})=>
{
  for (const k in relays)
  {
    if (!p.relays[k]) p.relays[k] = relays[k];
    else aa.fx.a_add(p.relays[k].sets,relays[k].sets);
  }
};


// save p
aa.p.save_to =()=>
{
  const q_id = 'author_save';
  let pubs = [...new Set(aa.temp[q_id])];
  aa.temp[q_id] = [];
  let all = [];
  for (const pub of pubs) all.push(aa.db.p[pub]);
  const chunks = aa.fx.chunks(all,420);
  let times = 0;
  for (const a of chunks)
  {
    setTimeout(()=>
    {
      aa.db.idb.postMessage({put:{store:'authors',a}});
      // for (const p of a) aa.p.links_upd(p)
    },times * 300);
    times++;
  }
};


aa.p.save = async p=>
{
  const q_id = 'author_save';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.db.p[p.pubkey] = p;
  if (aa.view.active === p.npub) aa.p.profile_upd(p);
  aa.temp[q_id].push(p.pubkey);
  aa.fx.to(aa.p.save_to,4444,q_id);
};


// give a p score
aa.p.score =async s=>
{
  let [pubkey,score] = s.trim().split(' ');
  score = parseInt(score);
  if (aa.fx.is_hex(pubkey) && Number.isInteger(score))
  {
    aa.cli.fuck_off();
    const p = await aa.p.get(pubkey);
    if (!p) p = aa.p.p(pubkey);
    p.score = score;
    aa.p.profile_upd(p);
    setTimeout(()=>{aa.p.save(p)},200)
  }
  else aa.log('invalid data to score')
};


// most recent timestamp of p.events 
aa.p.updated =(p,t)=>
{
  if (t > p.updated) p.updated = t;
};



// window.addEventListener('hashchange',aa.p.clear);