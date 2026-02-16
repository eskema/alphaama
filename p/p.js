/*

alphaama
mod    p
pubkey 
author 
profile 


*/

aa.db.p = {};
aa.p =
{
  def:
  {
    id:'p',
  },
  name:'profiles',
  about:'manage user profiles',
  scripts:
  [
    '/p/clk.js',
    '/p/mk.js',
    '/p/view.js',
  ],
  styles:
  [
    '/p/author.css',
    '/p/p.css',
  ],
  butts:
  {
    pa:
    [
      ['get_notes','p_req'],
      ['refresh','p_refresh'],
      ['@','mention'],
    ]
  },
  profiles: new Map()
};


// load author p from pubkey
aa.p.author =async pubkey=>
{
  let p = await aa.p.get(pubkey);
  if (!p) p = aa.db.p[pubkey] = aa.p.p(pubkey);
  return p
};


// get a name for display
aa.p.author_name =p=>
{
  return p.metadata?.name 
  || p.petname
  || p.petnames[0]
  || p.metadata?.display_name 
  || p.metadata?.nip05 
  || aa.fx.short_key(p.pubkey);
};


// populate list element with authors
aa.p.authors_list =(a,cla,sort='text_asc')=>
{
  if (!a.length) return;
  cla = 'list list_grid author_list'+(cla?' '+cla:'');
  const l = make('ul',{cla});

  fastdom.mutate(()=>
  {
    for (const x of a)
    {
      l.append(make('li',
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
aa.p.view_clear =element=>
{
  // fastdom.mutate(()=>{ 
    aa.l.classList.remove('view_p') 
  // });
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
    o = {pubkey:p.pubkey,elements:[]};
    aa.temp.p_link.set(p.pubkey,o);
  }
  if (!o.data || upd) o.data = await aa.p.data_link(p);
  return o
};


// returns link data from p
aa.p.data_link =async p=>
{
  let options = 
  {
    pubkey: p.pubkey,
    class_add: [],
    class_rm: [],
    src: false
  };

  options.name = aa.p.author_name(p);
  let petname = p.petname || p.petnames[0];
  if (petname) options.petname = petname;
  if (p.metadata)
  {
    if (p.metadata.nip05) options.nip05 = p.metadata.nip05;
    if (p.verified.length) options.verified = p.verified[0];
    if (p.metadata.picture && aa.fx.is_trusted(p.score))
    {
      let url = aa.fx.url(p.metadata.picture.trim())?.href;
      if (url)
      {
        // let cached = await aa.db.ops('cash',{out:[url]});
        // if (cached?.length) url = URL.createObjectURL(cached[0]);
        // else
        // {
          // if (p.score > 3) await aa.db.ops('cash',{all:[url]});
//     // {
//     //   aa.db.ops('cash',{add:[p.metadata.picture]});
//     //   src = p.metadata.picture;
//     // }
        // }
        options.src = url;
      }
    }
  }
  else options.miss = true;

  if (aa.u.is_u(p.pubkey))
  {
    aa.fx.a_add(options.class_add,['is_u']);
    aa.fx.a_add(options.class_rm,['is_mf','is_bff'])
  }
  else 
  {
    aa.fx.a_add(options.class_rm,['is_u']);
    // follows u
    if (aa.p.following(aa.u.p?.pubkey,p))
    {
      aa.fx.a_add(options.class_add,['fu']);
    }
  }
  
  if (aa.p.following(p.pubkey)) 
  {
    aa.fx.a_add(options.class_rm,['is_mf']);
    aa.fx.a_add(options.class_add,['is_bff']);
  }
  else
  {
    aa.fx.a_add(options.class_rm,['is_bff']);
    aa.fx.a_add(options.class_add,['is_mf']);
  }
  
  // followed by those you follow
  let common = 0;
  for (const k of p.followers) { if (aa.p.following(k)) common++ }
  options.followers = common;
  
  return options
};


// update link
aa.p.data_link_upd =async(element,options)=>
{
  let
  {
    pubkey,
    name,
    petname,
    src,
    nip05,
    verified,
    class_add,
    class_rm,
    followers
  } = options;

  let name_element = element.querySelector('.name');
  let href = element.href.split('#')[1];

  let title = `${pubkey}\n${href}\n`;
  fastdom.mutate(()=>
  {
    // name
    if (name_element.textContent !== name) 
      name_element.textContent = name;
    if (!name_element.childNodes.length) 
      name_element.classList.add('empty');
    else name_element.classList.remove('empty');
    title += name;
    // petname
    if (petname)
    {
      name_element.dataset.petname = petname;
      title += ` (${petname})`
    }
    // picture
    aa.p.link_img(element,src);
    // nip05
    if (nip05)
    {
      title += `\n${nip05} (${verified})`;
      for (const l of [element,name_element])
      {
        l.dataset.nip05 = nip05;
        if (verified)
        {
          l.dataset.verified = verified[0];
          l.dataset.verified_on = verified[1];
        }
      }
    }

    element.title = title;
    element.classList.add(...class_add);
    element.classList.remove(...class_rm);
    element.dataset.followers = followers;
  });
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
    if (event.created_at > p.updated) 
      p.updated = event.created_at;
    // aa.p.updated(p,event.created_at);
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
aa.p.follows =async(key='')=>
{
  let pubkey = aa.fx.is_key(key) ? key : aa.u?.p?.pubkey;
  let p = aa.db.p[pubkey];//aa.p.author(pubkey);
  let follows = p ? p.follows : [];
  aa.log(`${follows.length} follows of ${pubkey}`);
  return follows
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
    aa.p.links_upd(p);
  }
  return aa.db.p[pubkey]
};


// load author list from db into memory
aa.p.get_authors =async(pubkeys=[],upd)=>
{
  let authors = [];
  let missing = new Set();
  if (!upd)
  {
    for (const pubkey of pubkeys)
    {
      if (Object.hasOwn(aa.db.p,pubkey)) authors.push(aa.db.p[pubkey]);
      else missing.add(pubkey)
    }
    if (!missing.size) return authors;
  }
  let a = [...missing.values()];
  let stored = await aa.db.ops('idb',{get_a:{store:'authors',a}});
  if (stored?.length) for (const p of stored)
  {
    aa.db.p[p.pubkey] = p;
    missing.delete(p.pubkey);
    authors.push(p);
    setTimeout(()=>{aa.p.links_upd(p)},10);
  }
  
  for (const pubkey of missing)
  {
    aa.db.p[pubkey] = aa.p.p(pubkey);
    authors.push(aa.db.p[pubkey]);
  }

  return authors
};


// add picture to p_link
aa.p.link_img =async(l,src=false)=>
{
  let pic = l.querySelector('img');
  if (src)
  {
    if (!pic)
    {
      pic = make('img',{cla:'img'});
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
aa.p.links_upd =p=>
{
  debt.add(async()=>
  {
    let o = await aa.p.data(p,1);
    for (const i of o.elements)
      aa.p.data_link_upd(i,o.data);
  },420,'links_upd_'+p.pubkey);
};


// on load
aa.p.load =async()=>
{
  let mod = aa.p;
  let id = mod.def.id;
  // aa.add_styles(aa.p.styles);
  // await aa.add_scripts(mod.scripts);

  aa.temp.p_link = new Map();
  aa.view.clears.push(aa.p.view_clear);
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
    {
      action:[id,'search'],
      required:['<text>'],
      description:'search stored profiles by name, nip05, or petname',
      exe:aa.p.search
    },
  );
  // oto complete profiles
  aa.cli.on_upd.push(mod.oto);
  aa.p.l = make('div',{cla:'authors'});
  aa.mod.help_setup(mod);
  await aa.mod.load(mod);
  aa.mod.mk(mod);
};


// load profiles given a list of hex pubkeys
aa.p.load_profiles =async(pubkeys=[])=>
{
  if (!pubkeys.length) return;
  
  let p_dats = await aa.p.get_authors(pubkeys);
  for (const p of p_dats)
  {
    setTimeout(()=>{aa.mk.profile(p)},0)
  }
};


// load your metadata into input prefixed with set metadata command
aa.p.md =(s='')=>
{
  let p;
  if (aa.fx.is_key(s) && aa.db.p[s]) p = aa.db.p[s];
  else p = aa.u?.p;
  if (p.metadata) return JSON.stringify(p.metadata,null,2);
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
  if (p.extradata && (p.extradata.petnames.length !== p.petnames.length))
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



// find profiles matching string s (case-insensitive substring)
aa.p.find =s=>
{
  s = s.toLowerCase();
  return Object.values(aa.db.p)
  .filter(p=>
  {
    if (!p.metadata) return false;
    if (p.metadata?.name?.toLowerCase().includes(s)) return true;
    if (p.petnames?.some(n => n?.toLowerCase().includes(s))) return true;
    if (s > 3)
    {
      if (p.metadata?.nip05?.toLowerCase().includes(s)) return true;
      if (p.petname?.toLowerCase().includes(s)) return true;
    }
  })
  .sort((c,d)=>
  {
    let a_name = c.metadata?.name?.toLowerCase() || '';
    let b_name = d.metadata?.name?.toLowerCase() || '';

    if (a_name === s) return -1;
    if (b_name === s) return 1;

    if (a_name.startsWith(s) && !b_name.startsWith(s)) return -1;
    if (b_name.startsWith(s) && !a_name.startsWith(s)) return 1;

    if (a_name < b_name) return -1;
    if (a_name > b_name) return 1;
    return 0
  })
};


// creates a mention when composing a note
aa.p.oto =text=>
{
  const w = text.split(' ').pop();
  console.log('aa.p.oto',w.length)
  if (!w.startsWith('@') || w.length < 2) return
  let s = w.slice(1);
  if (!s) return;
  debt.add(()=>
  {
    let a = aa.p.find(s).map(p=>aa.mk.mention_item(p,w));
    fastdom.mutate(()=>{aa.cli.oto.append(...a)});
  }, 420, 'p.oto')
};


// profile data
aa.p.p =pubkey=>
{
  if (!pubkey || !aa.fx.is_key(pubkey)) return;
  return {
    events:{}, // kind:[[id,created_at],...],kind:{identifier:[[id,created_at],...]}
    follows:[], // [pubkey1,pubkey2,...]
    followers:[], // [pubkey1,pubkey2,...]
    // metadata:{}, // kind-0 content
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
  }
};


// process all p tags from kind-3 event
aa.p.process_k3_tags =async(event,p)=>
{
  // const is_u = aa.u.is_u(event.pubkey);
  let old_follows = new Set(p.follows);
  // if (ep?.follows?.length) old_follows = [...ep.follows];
  let new_follows = new Set(event.tags
    .filter(aa.fx.is_tag_p)
    .map(i=>i[1]));
  let unfollowed = old_follows.difference(new_follows);
  p.follows = [...new_follows];

  await aa.p.get_authors([...new_follows.union(old_follows)]);
  // update unfollowed
  setTimeout(()=>
  {
    aa.p.process_k3_tags_upd(event);
    if (unfollowed.size) console.log(unfollowed);
    // aa.p.unfollow([...unfollowed])
  },420);
};


aa.p.process_k3_tags_upd =(event)=>
{
  let op = aa.db.p[event.pubkey];
  const is_u = aa.u.is_u(op.pubkey);
  for (const tag of event.tags)
  {
    if (!aa.fx.is_tag_p(tag)) continue;

    const [type,pubkey,relay,petname] = tag;

    let upd;
    let p = aa.db.p[pubkey];
    if (!p)
    {
      p = aa.p.p(pubkey);
      if (!p) continue;
      upd = true;
    }

    if (relay)
    {
      let url = aa.fx.url(relay)?.href;
      if (url)
      {
        if (!p.relays[url]) p.relays[url] = {sets:[]};
        if (aa.fx.a_add(p.relays[url].sets,['hint'])) upd = true;
      }
    }

    if (petname)
    {
      if (aa.fx.a_add(p.petnames,[petname])) upd = true;
    }

    if (p.followers)
    {
      if (aa.fx.a_add(p.followers,[op.pubkey])) upd = true;
    }
    else 
    {
      console.log('no followers',p)
    }
    
    
    if (is_u)
    {
      if (p.score === 0)
      { 
        p.score = 5;
        upd = true 
      }
      if (aa.fx.a_add(p.sets,['k3'])) upd = true;
    }
    if (upd)
    {
      aa.p.save(p);
      debt.add(()=>{aa.p.links_upd(p)},200,'save_p_'+p.pubkey);
    }
  }
  
  aa.p.save(op);
  
  if (is_u)
  {
    aa.u.o.ls.k3 = op.follows.join(' ');
    setTimeout(()=>
    { 
      aa.p.load_profiles(op.follows);
      aa.mod.save(aa.u);
      aa.mod.ui(aa.u,'k3');
    },420)
  }
};


// update profile
aa.p.profile_upd =async(p)=>
{
  let profile = aa.mk.profile(p);
  const pubkey = profile.querySelector('.pubkey');
  const p_data = profile.querySelector('.profile_data');
  
  fastdom.mutate(()=>
  {
    profile.classList.add('upd');
    pubkey.replaceWith(aa.mk.profile_header(p));
    let profile_data = aa.mk.profile_data(p);
    if (p_data) p_data.replaceWith(profile_data);
    else profile.append(profile_data);

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

  const u_relays = aa.r.r.sort();
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
    .filter(r=> {
      // Filter out recently terminated relays
      const relay = aa.r.o.ls[r[0]];
      if (!relay) return true; // Unknown relay = include
      const term_count = relay.terminated_count || 0;
      if (term_count === 0) return true; // Never terminated = include

      // Allow if last termination was >24h ago
      const hours_since = (Date.now()/1000 - (relay.last_terminated || 0)) / 3600;
      return hours_since > 24;
    })
    .sort((a, b) => {
      // Primary sort: by reliability score
      const score_a = aa.r.score(a[0]);
      const score_b = aa.r.score(b[0]);
      if (score_a !== score_b) return score_b - score_a;

      // Secondary sort: by sets (existing logic)
      return aa.fx.sorts.sets(a, b);
    })
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
  
  let times = 1;
  const chunks = aa.fx.chunks(all,100);
  for (const a of chunks)
  {
    setTimeout(()=>{aa.db.ops('idb', {put:{store:'authors',a}})}, times*21);
    times++;
  }
};


aa.p.save = async p=>
{
  aa.db.p[p.pubkey] = p;
  // if (!p.updated
  // // || p.followers.length < 10
  // ) return;

  const q_id = 'author_save';
  if (!Object.hasOwn(aa.temp,q_id)) aa.temp[q_id] = [];
  aa.temp[q_id].push(p.pubkey);
  debt.add(aa.p.save_to,2100,q_id);
  if (aa.view.active === p.npub) aa.p.profile_upd(p);
};


// give a p score
aa.p.score =async s=>
{
  let [pubkey,score] = s.trim().split(' ');
  score = parseInt(score);
  if (aa.fx.is_hex(pubkey) && Number.isInteger(score))
  {
    aa.cli.fuck_off();
    let p = await aa.p.get(pubkey);
    if (!p) p = aa.p.p(pubkey);
    p.score = score;
    aa.p.profile_upd(p);
    setTimeout(()=>{aa.p.save(p)},200)
  }
  else aa.log('invalid data to score')
};


// search stored profiles by name, nip05, or petname
aa.p.search =async(s='')=>
{
  s = s.trim();
  if (!s) return;

  if (!aa.p.search_loaded)
  {
    let all = await aa.db.ops('idb',{all:{store:'authors'}});
    if (all?.length)
    {
      for (const p of all)
      {
        if (!aa.db.p[p.pubkey]) aa.db.p[p.pubkey] = p;
      }
    }
    aa.p.search_loaded = true;
  }

  let results = aa.p.find(s);
  if (!results.length)
  {
    aa.log(`no profiles found for "${s}"`);
    return;
  }

  let lines = results.map(p=>
  {
    let name = p.metadata?.name || p.petname || p.petnames?.[0] || '';
    let nip05 = p.metadata?.nip05 || '';
    return `${name} ${nip05} ${p.pubkey} ${p.npub}`
  });

  let details = aa.mk.details(`${results.length} results for "${s}":`,make('p',{con:`${lines.join('\n')}`}),1)
  aa.log(details,false,false);
  // aa.log(`${results.length} results for "${s}":\n${lines.join('\n')}`,false,false);
};