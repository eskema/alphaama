/*

alphaama
mod    p
author pubkey profile

*/

aa.db.p = {};
aa.p =
{
  p(x)
  {
    return {
      events:{}, // n:[[id,created_at],...]
      follows:[],
      followers:[],
      metadata:{},
      npub: aa.fx.encode('npub',x),
      petname:'',
      petnames:[],
      pubkey:x,
      relay:'',
      relays:{},
      sets:[],
      score:0,
      updated:0,    
      verified:[], // [result,date]
      xpub:x,
    }
  },
  styles:['/p/p.css']
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
  let p = await aa.p.get(pubkey) || aa.p.p(pubkey);
  aa.p.links_upd(p);
  return p
};


// get a name for display
aa.p.author_name =p=>
{
  return p.metadata?.name || p.metadata?.display_name || p.metadata?.displayName || p.npub.slice(0,12);
};


// load author list from db into memory
aa.p.authors =async a=>
{
  const p_to_get = [];
  for (const x of a) if (!aa.db.p[x]) p_to_get.push(x);
  if (p_to_get.length)
  {
    let p_stored = await aa.db.ops('idb',{get_a:{store:'authors',a:p_to_get}});
    for (const p of p_stored) 
    {
      aa.db.p[p.pubkey] = p;
      aa.p.links_upd(p)
    }
  } 
};


// populate list element with authors
aa.p.authors_list =(a,cla,sort='text_asc')=>
{
  if (!a.length) return;
  cla = 'list list_grid author_list'+(cla?' '+cla:'');
  const l = aa.mk.l('ul',{cla});
  for (const x of a)
  {
    l.append(aa.mk.l('li',
    {
      cla:'item author_list_item',
      app:aa.mk.p_link(x)
    }))
  }
  setTimeout(()=>{fastdom.mutate(()=>{aa.fx.sort_l(l,sort)}) },500);
  // aa.p.authors(a)
  // .then(()=>
  // {
  //   let items = [];
  //   for (const x of a)
  //   {
  //     items.push(aa.mk.l('li',
  //     {
  //       cla:'item author_list_item',
  //       app:aa.mk.p_link(x)
  //     }))
  //   }
  //   fastdom.mutate(()=>
  //   {
  //     l.append(...items);
  //     setTimeout(()=>{ fastdom.mutate(()=>{aa.fx.sort_l(l,sort)}) },500);
  //   })
  // });
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
        items = aa.get.index_items('pubkey',pub);
        k_v = 'pubkey_'+pub;
        aa.i.filter_solo_rm(items,k_v);
      }
    }
  }
};


// data for p links, etc
aa.p.data =(p,upd)=>
{
  let o = aa.temp.p_link.find(i=>i.pubkey === p.pubkey);
  if (!o) 
  {
    o = {pubkey:p.pubkey,a:[]};
    aa.temp.p_link.push(o);
  }
  if (!o.data || upd) o.data = aa.p.link_data(p);
  return o
};


// follow / unfollow
// aa.p.del =x=>
// {
  // aa.cli.add('p del '+x)
  // unfollow
  // let s = localStorage.ns+' p del ';
  // let sx = s+x;
  // let v = aa.cli.t.value;
  // if (v.length >= sx.length && v.startsWith(s))  sx = v+' '+x;
  // aa.cli.v(sx);
// };


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
    kn.unshift([event.id,event.created_at]);
    if (event.created_at > p.updated) p.updated = event.created_at;
    upd = true
  }
  return upd
};


// return follows of pubkey
aa.p.follows =async(s='')=>
{
  let pubkey = aa.is.key(s) ? s : aa.u?.p?.pubkey;
  let p = aa.db.p[pubkey];//aa.p.author(pubkey);
  let follows = p ? p.follows : [];
  aa.log(`${follows.length} follows of ${pubkey}`);
  return follows
};


// gets all p tags from array 
// and checks if metadata is available or if it needs to fetch it
aa.p.from_tags =async tags=>
{
  if (!aa.temp.pubs) aa.temp.pubs = {};
  let a = tags.filter(aa.is.tag_p);
  for (const tag of a)
  {
    let x = tag[1];
    if (!aa.db.p[x] || !aa.db.p[x].events.k0?.length)
    {
      if (!aa.temp.pubs[x]) aa.temp.pubs[x] = [];
      let url = aa.is.url(tag[2])?.href;
      if (url) aa.fx.a_add(aa.temp.pubs[x],[url]);
    }
  }
  let pubkeys = Object.keys(aa.temp.pubs);
  if (pubkeys.length)
  {
    aa.fx.to(()=>
    {
      aa.db.ops('idb',{get_a:{store:'authors',a:pubkeys}}).then(dat=>
      {
        for (const p of dat) 
        {
          if (p.events.k0?.length)
          {
            delete aa.temp.pubs[p.pubkey];
            aa.db.p[p.pubkey] = p;
            aa.p.links_upd(p);
          }
        }
        for (const pub in aa.temp.pubs) 
        {
          if (!aa.miss.p[pub]) aa.miss.p[pub] = {nope:[],relays:[]}
          aa.fx.a_add(aa.miss.p[pub].relays,aa.temp.pubs[pub]);
          delete aa.temp.pubs[pub];
        }
        aa.get.missing('p');
      });
    },1000,'get_pubs');
  }
};


// returns profile if already loaded or get it from database
aa.p.get =async pubkey=>
{
  if (!aa.is.key(pubkey)) return;
  if (aa.db.p[pubkey]) return aa.db.p[pubkey];
  let p = await aa.db.ops('idb',{get:{store:'authors',key:pubkey}});
  if (p) 
  {
    aa.db.p[pubkey] = p;
    aa.p.links_upd(p)
  }
  return p
};


// returns link data from p
aa.p.link_data =p=>
{
  let o = {pubkey:p.pubkey,class_add:[],class_rm:[],src:false};
  o.name = aa.p.author_name(p);
  let petname = p.petname.length ? p.petname 
  : p.petnames.length ? p.petnames[0] 
  : false;
  if (petname) o.petname = petname;
  if (p.metadata)
  {
    if (p.metadata.nip05) o.nip05 = p.metadata.nip05;
    if (p.verified.length) o.verified = p.verified[0];
    if (p.metadata.picture && aa.is.trusted(p.score))
    {
      let url = aa.is.url(p.metadata.picture.trim())?.href;
      if (url) o.src = url;
    } 
  }
  else o.miss = true;

  if (aa.is.u(p.pubkey))
  {
    aa.fx.a_add(o.class_add,['is_u']);
    aa.fx.a_add(o.class_rm,['is_mf','is_bff'])
  }
  else aa.fx.a_add(o.class_rm,['is_u']);
  
  if (aa.is.following(p.pubkey)) 
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
  for (const k of p.followers) { if (aa.is.following(k)) common++ }
  o.followers = common;
  return o
};


// update link
aa.p.link_data_upd =async(l,o)=>
{
  fastdom.mutate(()=>
  {
    // name
    let name = l.querySelector('.name');
    if (name.textContent !== o.name) name.textContent = o.name;
    if (!name.childNodes.length) name.classList.add('empty');
    else name.classList.remove('empty');
    // petname
    if (o.petname) name.dataset.petname = o.petname;
    // picture
    aa.p.link_img(l,o.src);
    // nip05
    if (o.nip05) 
    {
      l.dataset.nip05 = o.nip05;
      name.dataset.nip05 = o.nip05;
      if (o.verified) 
      {
        l.dataset.verified = o.verified[0];
        l.dataset.verified_on = o.verified[1];
        name.dataset.verified = o.verified[0];
        name.dataset.verified_on = o.verified[1];
      }
    }
    l.classList.add(...o.class_add);
    l.classList.remove(...o.class_rm);
    l.dataset.followers = o.followers;
  });
};


// add picture to p_link
aa.p.link_img =(l,src=false)=>
{
  let pic = l.querySelector('img');
  if (src)
  {
    if (!pic) 
    {
      pic = aa.mk.l('img',{cla:'picture'});
      pic.setAttribute('loading','lazy');
      l.append(pic);
      l.classList.add('has-picture');
    }
    if (!pic.src||pic.src!==src) pic.src = src;
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
  let o = aa.p.data(p,1);
  for (const i of o.a) aa.p.link_data_upd(i,o.data);

  // let options = aa.temp.p_link.find(i=>i.pubkey === p.pubkey);
  // if (options)
  // {
  //   options.data = aa.p.link_data(p);
  //   setTimeout(()=>
  //   {
  //     for (const i of options.a) aa.p.link_data_upd(i,options.data);
  //   },200);
  // }

  // const options = aa.p.link_data(p);
  // const a = aa.temp.printed.filter(i=>i.dataset.pubkey === p.pubkey)
  // .map(i=>i.querySelector('.by .author'));
  // for (const l of a) aa.p.link_data_upd(l,options);  
};


// on load
aa.p.load =async()=>
{
  await aa.mk.scripts([
    '/p/clk.js',
    '/p/is.js',
    '/p/kinds.js',
    '/p/mk.js',
    '/p/view.js'
  ]);

  aa.temp.p_link = [];
  aa.clears.push(aa.p.clear);
  aa.actions.push(
    {
      action:['p','view'],
      required:['pubkey'],
      description:'view profile by pubkey',
      exe:(s)=>{ aa.view.state('#'+aa.fx.encode('npub',s)) }
    },
    {
      action:['p','score'],
      required:['id','number'], 
      description:'set user score (for auto parsing and stuff)',
      exe:aa.p.score
    },
    {
      action:['p','check'],
      required:['name@domain'], 
      description:'check nip5 validity',
      exe:aa.p.check_nip05
    },
    {
      action:['p','md'],
      optional:['pubkey'], 
      description:'return metadata of pubkey',
      exe:aa.p.md
    },
    {
      action:['p','follows'],
      optional:['pubkey'], 
      description:'followed by pubkey',
      exe:aa.p.follows
    }
  );
  aa.cli.on_upd.push(aa.p.oto);
  aa.p.l = aa.mk.l('div',{id:'authors'});
};


// load profiles given a list of hex pubkeys
aa.p.load_profiles =async a=>
{
  if (!a?.length) return;

  let stored = await aa.db.ops('idb',{get_a:{store:'authors',a:a}});
  for (const dis of stored) 
  {
    aa.db.p[dis.pubkey] = dis;
    aa.mk.profile(dis);
  }
  for (const x of a)
  {
    if (!aa.db.p[x]) 
    {
      if (!aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
      aa.db.p[x] = aa.p.p(x);
    }
    aa.mk.profile(aa.db.p[x])
  }
};


// load your metadata into input prefixed with set metadata command
aa.p.md =(s='')=>
{
  let p;
  if (aa.is.key(s) && aa.db.p[s]) p = aa.db.p[s];
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

  if (p.hasOwnProperty('extradata'))
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

  if (upd) setTimeout(()=>{aa.p.save(p)},200);
};


// get profile from tag and prints it,
// otherwise add to missing list
// aa.p.miss_print =(tag,relays=[])=>
// {
//   const id = tag[1];
//   if (tag[2]) relays.push(tag[2]);

//   if (!aa.temp.profiles) aa.temp.profiles = {};
//   let dis = aa.temp.profiles[id];
//   if (!dis) dis = aa.temp.profiles[id] = [];
//   aa.fx.a_add(dis,relays);
//   aa.fx.to(aa.db.miss_profiles,500,'profiles');

//   // aa.db.get_e(id).then(dat=>
//   // {
//   //   if (dat) aa.e.to_printer(dat);
//   //   else aa.e.miss_e(id,relays);
//   // });
// };


// add event id to missing event list
aa.p.miss_p =(id,relays=[])=>
{
  if (!aa.miss.p[id]) aa.miss.p[id] = {nope:[],relays:[]}
  aa.fx.a_add(aa.miss.p[id].relays,aa.temp.pubs[id]);
};


// creates a mention on cli
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
    if (p.petname?.length
    && p.petname.toLowerCase().includes(s)) 
      return true;
  };
  // 
  const a = Object.values(aa.db.p).filter(for_mentions);
  for (const p of a) aa.cli.oto.append(aa.mk.mention_item(p,w));
};


// process all p tags from kind-3 event
aa.p.process_k3_tags =async(event)=>
{
  const x = event.pubkey;
  const is_u = aa.is.u(x);
  let ep = await aa.p.get(x);
  const old_bff = [...ep.follows];
  // let new_follows = [];
      
  ep.follows = event.tags.filter(aa.is.tag_p).map(i=>i[1]);
  await aa.p.authors(ep.follows);

  // const to_upd = [];
  follows_to_upd =event=>
  {
    const is_u = aa.is.u(event.pubkey);
    const a_upd = [];
    for (const tag of event.tags)
    {
      if (!aa.is.tag_p(tag)) continue;

      const pubkey = tag[1];
      const relay = tag[2];
      const petname = tag[3];

      let upd;
      let p = aa.db.p[pubkey];
      if (!p) 
      {
        p = aa.db.p[pubkey] = aa.p.p(pubkey);
        upd = true;
      }

      if (relay)
      {
        let url = aa.is.url(relay)?.href;
        if (url)
        {
          if (!p.relays[url]) p.relays[url] = {sets:[]};
          if (aa.fx.a_add(p.relays[url].sets,['hint'])) upd = true;
        }
        if (is_u && p.relay !== relay) { p.relay = relay; upd = true; }
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
      if (upd) a_upd.push(p);
    }
    return a_upd
  };

  let to_upd = follows_to_upd(event);
  to_upd.push(ep);

  setTimeout(()=>{for (const p of to_upd) aa.p.save(p)},200);
  if (is_u) aa.p.load_profiles(ep.follows);
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
  let p_relays = Object.entries(p.relays);
  if (!p_relays.length) return ' ';
  const u_relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r).sort();

  let relays = p_relays
  .filter(r=>r[1].sets.includes(set))
  .sort(aa.fx.sorts.sets);

  for (const url of u_relays)
  {
    for (const r of relays)
    {
      const ru = aa.is.url(r[0])?.href;
      if (ru === url) return url
    }
  }

  for (const r of relays)
  {
    const url = aa.is.url(r[0])?.href;
    if (url) return url
  }    
  return u_relays[0]
};


// add relays to profile
aa.p.relays_add =(o,p)=>
{
  if (!p.relays) p.relays = {};
  for (const relay in o)
  {
    if (!p.relays[relay]) p.relays[relay] = o[relay];
    else aa.fx.a_add(p.relays[relay].sets,o[relay].sets);
  }
};


// save p
aa.p.save_to =()=>
{
  const q_id = 'author_save';
  let pubs = [...new Set(aa.temp[q_id])];
  aa.temp[q_id] = [];
  let all = [];
  for (const pub of pubs) 
  {
    const p = aa.db.p[pub];
    all.push(p);
  }
  const chunks = aa.fx.chunks(all,420);
  let times = 0;
  for (const a of chunks)
  {
    setTimeout(()=>
    {
      aa.db.idb.postMessage({put:{store:'authors',a}})
    },times * 100);
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
  aa.fx.to(aa.p.save_to,1000,q_id);
};


// give a p score
aa.p.score =async s=>
{
  let [pubkey,score] = s.trim().split(' ');
  score = parseInt(score);
  if (aa.is.x(pubkey) && Number.isInteger(score))
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


// window.addEventListener('hashchange',aa.p.clear);