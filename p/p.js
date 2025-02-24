/*

alphaama
mod    p
author pubkey profile

*/



aa.mk.styleshit('/p/p.css');

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
  }
};


// follow add x to k3
aa.p.add =async x=>
{
  //follow
  let new_follow = [x];
  const p = await aa.db.get_p(x);
  new_follow.push(aa.p.relay(p));
  let petname;
  if (p.metadata?.name) petname = p.metadata.name;
  else if (p.petnames.length) petname = p.petnames[0];
  if (petname?.length) new_follow.push(aa.fx.an(petname));
  else new_follow.push('');
  aa.cli.v(localStorage.ns+' p add '+new_follow.join(', '));
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


// profile actions
aa.p.actions =()=> aa.mk.l('p',{cla:'actions empty',app:aa.mk.butt(['…','pa'])});

aa.clk.pa =e=>
{
  let l = e.target.closest('.actions');
  let profile = l.closest('article');
  let x = profile.dataset.xpub;
  if (l.classList.contains('empty'))
  {
    let butts = 
    [
      [`${profile.dataset.trust}`,'p_score'],
      ['get_notes','p_req'],
      ['refresh','p_refresh']
    ];
    if (!aa.is.u(x)) butts.push([aa.is.following(x)?'del':'add','k3']);
    for (const s of butts) l.append(' ',aa.mk.butt(s));
    l.classList.remove('empty');
  }
  l.classList.toggle('expanded');

  // let l = e.target.closest('.actions');
  // let note = l.closest('article');
  // e.target.remove();
  // let a = 
  // [
  //   [`${note.dataset.trust}`,'p_score'],
  //   ['get_notes','p_req'],
  //   ['refresh','p_refresh']
  // ];
  // let x = note.dataset.xpub;
  // if (!aa.is.u(x)) a.push([aa.is.following(x)?'del':'add','k3']);
  // for (const i of a) l.append(aa.mk.butt(i),' ');
};


// load author p
aa.p.author =async x=>
{
  let p = await aa.db.get_p(x);
  if (!p) p = aa.p.p(x);
  return p
};


// load author list from db into memory
aa.p.authors =async a=>
{
  // return await aa.db.get_pa(a)
  const p_to_get = [];
  for (const x of a) if (!aa.db.p[x]) p_to_get.push(x);
  if (p_to_get.length)
  {
    let p_stored = await aa.db.get('idb',{get_a:{store:'authors',a:p_to_get}});
    for (const p of p_stored) aa.db.p[p.xpub] = p;
  } 
};


// populate list element with authors
aa.p.author_list =(a,l,sort='text_asc')=>
{
  if (!a.length) return;
  aa.p.authors(a).then(e=>
  {
    let items = [];
    for (const x of a)
    {
      items.push(aa.mk.l('li',
      {
        cla:'item author_list_item',
        app:aa.mk.p_link(x)
      }))
    }
    l.append(...items);
    setTimeout(()=>
    {
      fastdom.mutate(()=>
      {
        l.classList.add('list','list_grid','author_list');
        aa.fx.sort_l(l,sort);
      })
    },500);
  });
};


// populate list element with authors
aa.p.authors_list =(a,clas,sort='text_asc')=>
{
  if (!a.length) return;
  const l = aa.mk.l('ul',{cla:clas+' list list_grid author_list'});
  aa.p.authors(a).then(e=>
  {
    let items = [];
    for (const x of a)
    {
      items.push(aa.mk.l('li',
      {
        cla:'item author_list_item',
        app:aa.mk.p_link(x)
      }))
    }
    l.append(...items);
    setTimeout(()=>{ aa.fx.sort_l(l,sort) },500);
  });
  return l
};


// clear profile filter
aa.p.clear =e=>
{
  if (aa.l.dataset.solo?.length)
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
      let solos = aa.l.dataset.solo.split(' ');
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


// follow / unfollow
aa.p.del =x=>
{
  // unfollow
  let s = localStorage.ns+' p del ';
  let sx = s+x;
  let v = aa.cli.t.value;
  if (v.length >= sx.length && v.startsWith(s))  sx = v+' '+x;
  aa.cli.v(sx);
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
    kn.unshift([event.id,event.created_at]);
    if (event.created_at > p.updated) p.updated = event.created_at;
    upd = true
  }
  return upd
};


// make all other profile sections after metadata
aa.mk.extradata =p=>
{
  const extradata = aa.mk.l('section',{cla:'extradata'});
  const a = 
  [
    'p_petnames',
    'p_relays',
    'p_follows',
    'p_followers',
    'p_mints',
    'p_p2pk',
    'p_events'
  ];
  for (const k of a)
  {
    let id = k.slice(2);
    const v = p[id];
    if (aa.mk.hasOwnProperty(k)) extradata.append(aa.mk[k](v,p));
    else if (v) 
    {
      let item = aa.mk.item(id,v,'p');
      item.classList.add('p_item');
      extradata.append(item);
    }
  }
  return extradata
};


// returns profile if already loaded or get it from database
aa.db.get_p =async xpub=>
{
  if (aa.db.p[xpub]) return aa.db.p[xpub];
  let p = await aa.db.idb.ops({get:{store:'authors',key:xpub}});
  if (p) aa.db.p[xpub] = p;
  return p
};

// returns profile if already loaded or get it from database
aa.p.get_authors =async a=>
{
  if (aa.db.p[xpub]) return aa.db.p[xpub];
  let p = await aa.db.idb.ops({get:{store:'authors',key:xpub}});
  if (p) aa.db.p[xpub] = p;
  return p
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



// follow / unfollow
aa.clk.k3 =async e=>
{
  const x = e.target.closest('.profile').dataset.xpub;
  const dis = e.target.textContent;
  if (dis === 'del') aa.p.del(x);
  else aa.p.add(x)
};


// return follows of pubkey
aa.p.k3 =async(s='')=>
{
  return new Promise(async resolve=>
  {
    let key = aa.is.key(s) ? s : aa.u.p.xpub;
    let p = await aa.p.author(key);
    aa.log(`${p.follows.length} follows of ${key}`);
    resolve(`${p.follows}`);
  });
};

// updates all links from p
aa.p.links_upd =async p=>
{
  const options = aa.p.p_link_data(p);
  const a = aa.temp.printed.filter(i=>i.dataset.pubkey === p.xpub)
  .map(i=>i.querySelector('.by .author'));
  // const a = document.querySelectorAll('.author[href="#'+p.npub+'"]');
  for (const l of a) aa.p.p_link_data_upd(l,options);  
  // update aa.i item element
  // aa.i.upd_item_pubkey(a[0],p);
};


// on load
aa.p.load =async()=>
{
  aa.clears.push(aa.p.clear);
  aa.actions.push(
    {
      action:['p','view'],
      required:['pubkey'],
      description:'view profile by pubkey',
      exe:(s)=>{ aa.state.view('#'+aa.fx.encode('npub',s)) }
    },
    {
      action:['p','score'],
      required:['id','number'], 
      description:'set user score (for auto parsing and stuff)',
      exe:aa.p.score
    },
    {
      action:['p','nip5'],
      required:['name@domain'], 
      description:'check nip5 validity',
      exe:aa.p.verify_nip05
    },
    {
      action:['p','k3'],
      optional:['pubkey'], 
      description:'returns k3 pubkeys of pubkey',
      exe:aa.p.k3
    }
  );
  aa.p.l = aa.mk.l('div',{id:'authors'});
  // create p section
  // const section = aa.mk.section('p',aa.p.l);
  
  // section.append(aa.p.l);
};


// load profiles given a list of hex pubkeys
aa.p.load_profiles =async a=>
{
  if (!a?.length) return;

  let stored = await aa.db.get('idb',{get_a:{store:'authors',a:a}});
  // let stored = await aa.db.get_pa(a);
  // let stored = await aa.db.cash.ops({get:a})
  for (const dis of stored) 
  {
    aa.db.p[dis.xpub] = dis;
    aa.p.profile(dis);
  }
  for (const x of a)
  {
    if (!aa.db.p[x]) 
    {
      if (!aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
      aa.db.p[x] = aa.p.p(x);
    }
    aa.p.profile(aa.db.p[x])
  } 
};


// add x id to missing p list
// aa.p.miss_p =(x,relays)=>
// {
//   if (!aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
//   for (const rel of relays)
//   {
//     const r = aa.is.url(rel)?.href;
//     if (r && !aa.miss.p[x].relays.includes(r)) aa.miss.e[x].relays.push(r);
//   }
// };


// aa.p.get_p =async(x,relays)=>
// {
//   return new Promise(resolve=>
//   {
//     aa.db.get_p(x).then(p=>
//     {
//       if (!p && !aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
//       if (!p) p = aa.p.p(x);
//       resolve(p)
//     }); 
//   });
// };


// make metadata section
aa.mk.metadata =p=>
{
  let metadata = aa.mk.l('section',{cla:'metadata'});
  const butt = aa.mk.butt(['refresh','p_metadata']);
  const ul = aa.mk.l('div',{cla:'metadata_list'});
  
  if (p && p.metadata && Object.keys(p.metadata).length)
  {
    let k0 = p.events.k0;
    if (k0?.length) butt.dataset.last = aa.fx.time_display_ext(k0[0][1]);
    for (const k in p.metadata)
    {
      let l, v = p.metadata[k];
      if (!v) v = '';
      if (v && typeof v === 'string') v.trim();
      if (aa.mk.hasOwnProperty('metadata_'+k)) 
      {
        l = aa.mk['metadata_'+k](k,v,p)
      }
      else 
      {
        let val;
        if (Array.isArray(v)) val = v.join(', ');
        else if (typeof v === 'object') val = JSON.stringify(v)
        else val = v;
        l = aa.mk.l('p',{con:val});
      }
      l.dataset.meta = k;
      if (v === '') l.classList.add('empty');
      ul.append(l);
    }
  }
  let len = ul.childNodes.length;
  const details = aa.mk.details('metadata ('+len+')',butt,len?1:0);
  details.classList.add('p_item');
  details.append(ul);
  metadata.append(details);
  return metadata
};

aa.mk.metadata_about =(k,v)=> aa.mk.l('p',{app:aa.parse.content(v)});

aa.mk.metadata_banner =(k,v,p)=> aa.mk.metadata_picture(k,v,p);

aa.mk.metadata_lud16 =(k,v)=> aa.mk.l('a',{ref:'lightning:'+v,con:v});

aa.mk.metadata_lud06 =(k,v)=> aa.mk.metadata_lud16(k,v);

aa.mk.metadata_nip05 =(k,v,p)=>
{
  l = aa.mk.l('a',{con:v});
  let [username,domain] = v.split('@');
  if (!username || !domain) return l;
  
  let url = 'https://'+domain+'/.well-known/nostr.json?name='+username;
  url = new URL(url).href;
  if (!url) return l;
  
  l.href = url;
  if (p.verified.length)
  {
    l.dataset.verified = p.verified[0][0];
    l.dataset.verified_on = aa.fx.time_display_ext(p.verified[0][1]);
    if (p.verified[0][0] === true) l.classList.add('nip05-verified');
  }
  l.addEventListener('click',e=>{e.preventDefault(); aa.p.verify_nip05(v,p)});
  
  return l
};

aa.mk.metadata_picture =(k,v,p)=>
{
  if (aa.is.trusted(p.score) && v) 
  {
    let img = aa.mk.l('img',{src:v});
    img.addEventListener('click',e=>{e.target.classList.toggle('expanded')});
    return img;
  }
  else return aa.mk.l('p',{cla:k,con:v});
};

aa.mk.metadata_website =(k,v)=> aa.mk.link(v);


// refresh follows
aa.clk.p_follows =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_follows',{authors:[xpub],kinds:[3],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// make follows
aa.mk.p_follows =(a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'follows'});
  const butt_follows = aa.mk.butt(['refresh follows','p_follows']);
  let follows_details = aa.mk.details('follows ('+a.length+')',butt_follows);
  follows_details.classList.add('p_item');
  follows_details.append(ul);
  aa.p.author_list(a,ul);
  if (p?.events.k3?.length) 
    butt_follows.dataset.last = aa.fx.time_display(p.events.k3[0][1]);
  return follows_details;
};


// make followers
aa.mk.p_followers =(a,p)=>
{
  let al = aa.p.authors_list(a,'followers');
  // let ul = aa.mk.l('ul',{cla:'followers'});
  // let followers_details = aa.mk.details('followers ('+a.length+')', ul);
  let followers_details = aa.mk.details('followers ('+a.length+')', al);
  followers_details.classList.add('p_item');
  // let butt = aa.mk.butt(['filter','lf']);
  // butt.dataset.last = 'dis';
  // followers_details.insertBefore(butt,al);
  // aa.p.author_list(a,ul);
  return followers_details
};


// make p link
aa.mk.p_link =(x)=>
{
  let p = aa.db.p[x];
  if (!p) p = aa.p.p(x);

  if (!aa.temp.p_link) aa.temp.p_link = [];
  let o = aa.temp.p_link.find(i=>i.pubkey === x);
  if (!o) o = {pubkey:x,data:aa.p.p_link_data(p),a:[]};
  aa.temp.p_link.push(o);
    
  // setTimeout(()=>
  // {
  //   for (const i of o.a) aa.p.p_link_data_upd(i,o.data);
  //   // aa.p.p_link_data_upd(l,o)
  // },0);
  
  const l = aa.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+', '+x,
    ref:'#'+p.npub,
    clk:aa.clk.a,
    app:aa.mk.l('span',{cla:'name',con:p.npub.slice(0,12)})
  });
  
  aa.fx.color(x,l);
  aa.p.p_link_data_upd(l,o.data);
  o.a.push(l);

  return l
};

aa.p.author_name =p=>
{
  return p.metadata?.name || p.metadata?.display_name || p.metadata?.displayName || p.npub.slice(0,12);
};


// returns link data from p
aa.p.p_link_data =p=>
{
  let o = {pubkey:p.xpub,class_add:[],class_rm:[],src:false};

  o.name = aa.p.author_name(p);
  // let name = p.metadata?.name || p.metadata?.display_name || p.metadata?.displayName || p.npub.slice(0,12);
  // o.name = name;
  
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

  if (aa.is.u(p.xpub)) 
  {
    aa.fx.a_add(o.class_add,['is_u']);
    aa.fx.a_add(o.class_rm,['is_mf','is_bff'])
  }
  else aa.fx.a_add(o.class_rm,['is_u']);
  
  if (aa.is.following(p.xpub)) 
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
aa.p.p_link_data_upd =async(l,o)=>
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
    aa.p.p_link_pic(l,o.src);
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
aa.p.p_link_pic =(l,src=false)=>
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
aa.p.p_links_upd =async p=>
{
  const options = aa.p.p_link_data(p);
  const a = document.querySelectorAll('.author[href="#'+p.npub+'"]');
  for (const l of a) aa.p.p_link_data_upd(l,options);  
  // update aa.i item element
  // aa.i.upd_item_pubkey(a[0],p);
};


// refresh metadata
aa.clk.p_metadata =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_metadata',{authors:[xpub],kinds:[0],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh all profile data (metadata,relays,follows)
aa.clk.p_refresh =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_refresh',{authors:[xpub],kinds:[0,3,10002,10019]}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh relays
aa.clk.p_relays =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_relays',{authors:[xpub],kinds:[10002],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// make relays
aa.mk.p_relays =(a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'relays list'});
  if (a) for (const relay in a) ul.append(aa.mk.server(relay,a[relay]));
  const butt_relays = aa.mk.butt(['refresh relays','p_relays']);
  let relays_details = aa.mk.details('relays ('+ul.childNodes.length+')',butt_relays);
  relays_details.classList.add('p_item');
  relays_details.append(ul);
  if (p.events.k10002?.length) 
    butt_relays.dataset.last = aa.fx.time_display(p.events.k10002[0][1]);
  return relays_details
};


// score profile
aa.clk.p_score =async e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const p = await aa.db.get_p(xpub);
  if (p) aa.cli.v(localStorage.ns+' p score '+xpub+' '+p.score);
};


// returns the profile of p
// creates the profile from p object if not found
aa.p.profile =p=>
{
  aa.p.migrate_p_fields(p);
  let profile = document.getElementById(p.npub);
  if (!profile) 
  {
    profile = aa.mk.l('article',{cla:'profile',id:p.npub});
    profile.dataset.trust = p.score;
    profile.dataset.xpub = p.xpub;
    profile.dataset.updated = p.updated ?? 0;
    aa.fx.color(p.xpub,profile);
    profile.append(aa.mk.pubkey(p));
    profile.append(aa.mk.l('section',{cla:'metadata'}));
    profile.append(aa.mk.l('section',{cla:'extradata'}));
    aa.p.l.append(profile);
    aa.fx.count_upd(document.getElementById('butt_p'));
  }
  return profile
};


// make profile header
aa.mk.pubkey =p=>
{
  const pubkey = aa.mk.l('p',{cla:'pubkey'});
  pubkey.append(aa.mk.p_link(p.xpub));
  pubkey.append(aa.p.actions());
  pubkey.append(' ',aa.mk.l('span',{cla:'xpub',con:p.xpub}));
  pubkey.append(' ',aa.mk.time(p.updated));
  return pubkey
};

// get profile from tag and prints it,
// otherwise add to missing list
aa.p.miss_print =(tag,relays=[])=>
{
  const id = tag[1];
  if (tag[2]) relays.push(tag[2]);

  if (!aa.temp.profiles) aa.temp.profiles = {};
  let dis = aa.temp.profiles[id];
  if (!dis) dis = aa.temp.profiles[id] = [];
  aa.fx.a_add(dis,relays);
  aa.fx.to(aa.db.miss_profiles,500,'profiles');

  // aa.db.get_e(id).then(dat=>
  // {
  //   if (dat) aa.e.to_printer(dat);
  //   else aa.e.miss_e(id,relays);
  // });
};

// add event id to missing event list
aa.p.miss_p =(id,relays=[])=>
{
  if (!aa.miss.p[id]) aa.miss.p[id] = {nope:[],relays:[]}
  aa.fx.a_add(aa.miss.p[id].relays,aa.temp.pubs[id]);
};

aa.db.miss_profiles =async()=>
{
  let pubkeys = Object.keys(aa.temp.profiles);
  let profiles = await aa.db.profiles(pubkeys);
  for (const p of profiles)
  {
    let id = p.xpub;
    pubkeys = pubkeys.filter(i=>i!==id);
    delete aa.temp.profiles[id];
    aa.db.p[id] = p;
    delete aa.temp.profiless[id];
    // aa.p.p_links_upd(p);
  }
  for (const id of pubkeys)
  {
    aa.p.miss_p(id,aa.temp.profiles[id]);
    delete aa.temp.profiles[id];
  }
};


// gets all p tags from array 
// and checks if metadata is available or if it needs to fetch it
aa.get.pubs =async tags=>
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
      aa.db.idb.ops({get_a:{store:'authors',a:pubkeys}}).then(dat=>
      {
        for (const p of dat) 
        {
          if (p.events.k0?.length)
          {
            aa.db.p[p.xpub] = p;
            delete aa.temp.pubs[p.xpub];
            // aa.p.p_links_upd(p);
          }
        }
        for (const xpub in aa.temp.pubs) 
        {
          if (!aa.miss.p[xpub]) aa.miss.p[xpub] = {nope:[],relays:[]}
          aa.fx.a_add(aa.miss.p[xpub].relays,aa.temp.pubs[xpub]);
          delete aa.temp.pubs[xpub];
        }
        aa.get.missing('p');
      });
    },1000,'get_pubs');
  }
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


// request notes from profile
aa.clk.p_req =e=>
{
  const profile = e.target.closest('.profile');
  const xid = profile?.dataset.xpub;
  const p = aa.db.p[xid];
  const filter = `{"authors":["${p.xpub}"],"kinds":[1],"limit":100}`;
  let relay = p.relay;
  if (!relay && p.relays.length) 
  relay = p.relays.filter(r=>r.sets.includes('write'))[0];
  if (!relay) relay = 'read';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req ${relay} ${filter}`);
};


// save p
aa.p.save_to =()=>
{
  const q_id = 'author_save';
  let pubs = [...new Set(aa.temp[q_id])];
  aa.temp[q_id] = [];
  let a = [];
  for (const pub of pubs) 
  {
    const p = aa.db.p[pub];
    a.push(p);
    
  }
  let chunks = aa.fx.chunks(a,4444);
  // let times = 0;
  for (const chunk of chunks)
  {
    aa.db.idb.worker.postMessage({put:{store:'authors',a:chunk}})
  }
  // for (const p of a) setTimeout(()=>{aa.p.p_links_upd(p)},0);
};
aa.p.save = async p=>
{
  const q_id = 'author_save';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];

  aa.db.p[p.xpub] = p;
  if (aa.viewing === p.npub) aa.p.profile_upd(p);
  let l = [...aa.p.l.childNodes].find(i=>i.dataset.xpub === p.xpub);
  if (l) aa.p.p_link_data_upd(
    l.querySelector('.pubkey .author'),
    aa.p.p_link_data(p)
  );
  
  aa.temp[q_id].push(p.xpub);
  
  aa.fx.to(aa.p.save_to,1000,q_id);

};

// give a p score
aa.p.score =async s=>
{
  let [xpub,score] = s.trim().split(' ');
  score = parseInt(score);
  if (aa.is.x(xpub) && Number.isInteger(score))
  {
    aa.cli.fuck_off();
    const p = await aa.db.get_p(xpub);
    if (!p) p = aa.p.p(xpub);
    p.score = score;
    aa.p.profile_upd(p);
    setTimeout(()=>{aa.p.save(p)},200)
  }
  else aa.log('invalid data to score')
};


aa.p.follows_to_upd =event=>
{
  const is_u = aa.is.u(event.pubkey);
  const to_upd = [];
  for (const tag of event.tags)
  {
    if (!aa.is.tag_p(tag)) continue;

    const xpub = tag[1];
    const relay = tag[2];
    const petname = tag[3];

    let upd;
    let p = aa.db.p[xpub];
    if (!p) 
    {
      p = aa.db.p[xpub] = aa.p.p(xpub);
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
    if (upd) to_upd.push(p);
  }
  return to_upd
};


// process all p tags from kind-3 event
aa.p.process_k3_tags =async(event)=>
{
  const x = event.pubkey;
  const is_u = aa.is.u(x);
  let ep = await aa.db.get_p(x);
  const old_bff = [...ep.follows];
  // let new_follows = [];
      
  ep.follows = event.tags.filter(aa.is.tag_p).map(i=>i[1]);
  await aa.p.authors(ep.follows);

  // const to_upd = [];
  let to_upd = aa.p.follows_to_upd(event);
  to_upd.push(ep);

  setTimeout(()=>{for (const p of to_upd) aa.p.save(p)},200);
  if (is_u) aa.p.load_profiles(ep.follows);
};


// update profile
aa.p.profile_upd =async(p)=>
{
  let profile = aa.p.profile(p);
  const pubkey = profile.querySelector('.pubkey');
  const metadata = profile.querySelector('.metadata');
  const extradata = profile.querySelector('.extradata');
  
  fastdom.mutate(()=>
  {
    profile.classList.add('upd');
    pubkey.replaceWith(aa.mk.pubkey(p));
    metadata.replaceWith(aa.mk.metadata(p));
    extradata.replaceWith(aa.mk.extradata(p));
    profile.dataset.trust = p.score;
    profile.dataset.updated = p.updated ?? 0;
  });
  // aa.p.p_links_upd(p)
};


// returns user trust
aa.is.trust_x =x=> 
{
  let p = aa.db.p[x];
  if (!p) return false;
  return aa.is.trusted(p.score);
}


// verify nip05
aa.p.verify_nip05 =async(s,p)=>
{
  let verified = false;
  let dis = await NostrTools.nip05.queryProfile(s);
  if (dis)
  {
    if (!p) p = await aa.db.get_p(dis.pubkey);
    if (p && dis.pubkey === p.xpub) verified = true
  }
  
  if (p)
  {
    p.verified.unshift([verified,aa.now]);
    aa.p.save(p);
  }

  // aa.log('nip5 '+verified+' for '+s);
  return verified
};


// event template for user metadata 
aa.kinds[0] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  let x = dat.event.pubkey;
  aa.db.get_p(x).then(p=>
  {
    if (!p) p = aa.p.p(x);
    if (aa.p.events_newer(p,dat.event))
    {
      if (aa.miss.p[x]) delete aa.miss.p[x];
      let metadata = aa.parse.j(dat.event.content);
      if (metadata)
      {
        p.metadata = metadata;
        aa.p.save(p);
        
        let options = aa.temp.p_link?.find(i=>i.pubkey === x);
        if (!options) options = {pubkey:x,a:[]};
        options.data = aa.p.p_link_data(p);
        setTimeout(()=>
        {
          for (const i of options.a) aa.p.p_link_data_upd(i,options.data);
        },200);

        // aa.p.links_upd(p);
        // aa.p.p_links_upd(p);
        if (aa.is.u(x) && aa.u) aa.u.upd_u_u();
      }
    }
  });
  aa.parse.content_o(aa.parse.j(dat.event.content),note,'a');
  return note
};


// event template for follow list / contacts with legacy relay object
aa.kinds[3] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      aa.p.process_k3_tags(dat.event);
      aa.p.save(p)
    }
  });
  return note
};


// view for npub
aa.views.npub1 =async npub=>
{
  aa.viewing = npub;
  const k = 'pubkey';
  let v = aa.fx.decode(npub);
  let p = await aa.p.author(v);
  let l = aa.p.profile(p);
  if (!l.classList.contains('upd')) aa.p.profile_upd(p);

  fastdom.mutate(()=>
  {
    l.classList.add('in_view');
    aa.l.classList.add('viewing','view_p');
    aa.fx.scroll(l);
  });


  let items = aa.get.index_items(k,v);
  const k_v = k+'_'+aa.fx.an(v);
  aa.p.viewing = [items,k_v];
  aa.i.filter_solo_apply(items,k_v);
};

// view for nprofile
aa.views.nprofile1 =async nprofile=>
{

};


// window.addEventListener('load',aa.p.load);
window.addEventListener('hashchange',aa.p.clear);