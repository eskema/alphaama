/*

alphaama
mod    p
author pubkey profile

*/

document.head.append(aa.mk.l('link',{rel:'stylesheet',ref:'/p/p.css'}));

aa.p = 
{
  p(xpub)
  {
    return {
      xpub:xpub,
      relay:'',
      relays:{},
      petname:'',
      petnames:[],
      npub: aa.fx.encode('npub',xpub),
      score:0,
      updated:0,
      metadata:{},
      trust:0, // will be deprecated in favor of score
      verified:[], // [result,date]
      sets:[],
      follows:[],
      followers:[],
      // rels:{}, // will be deprecated in favor of relays
      // extradata: // will be deprecated
      // {
      //   bff:[],
      //   relays:[],
      //   followers:[],
      //   petnames:[],
      //   lists:[],
      // },
      // pastdata: // will be deprecated in favor of events
      // { 
      //   k0:[],
      //   k3:[],
      //   k10002:[],
      // },
      events:{}, // n:[[id,created_at],...]
    }
  }
};

// process all p tags from kind-3
aa.p.migrate_p_fields =p=>
{
  let upd;
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

  if (upd) aa.p.save(p)
};


// profile actions
aa.p.actions =p=>
{
  const l = aa.mk.l('p',{cla:'actions'});
  let a = [[p.trust+'','p_score']];
  if (!aa.is.u(p.xpub))
  {
    let follow_con = aa.u.is_following(p.xpub)?'unfollow':'follow';
    a.push([follow_con,'p_follow']);
  }
  a.push(['refresh','p_refresh']);
  if (a.length) for (const s of a) l.append(aa.mk.butt(s),' ');
  return l
};


// load author list from db into memory
aa.p.authors =async a=>
{
  const p_to_get = [];
  for (const xpub of a) if (!aa.db.p[xpub]) p_to_get.push(xpub);
  if (p_to_get.length)
  {
    let ap = await aa.db.get('idb',{get_a:{store:'authors',a:p_to_get}});
    for (const p of ap) aa.db.p[p.xpub] = p;
    // .then(a=>{ for (const p of ap) aa.db.p[p.xpub] = p });
  } 
};


// returns array of hex pubkeys from p tags
aa.p.authors_from_tags =tags=>
{
  const authors = [];  
  for (const tag of tags) if (aa.is.tag.p(tag)) authors.push(tag[1]);  
  return authors
};


// populate list element with authors
aa.p.author_list =(a,l,sort='text_asc')=>
{
  if (!a.length) return;
  aa.p.authors(a).then(e=>
  {
    l.classList.add('list','list_grid','author_list');
    for (const x of a) 
      l.append(aa.mk.l('li',{cla:'item author_list_item',app:aa.mk.p_link(x)}));
    setTimeout(()=>{aa.fx.sort_l(l,sort)},500);
  });
};


// clear profile filters
aa.p.clear =e=>
{
  if (history?.state?.last?.startsWith('#npub'))
  {
    console.log(aa.p.viewing);
    if (aa.p.viewing) aa.i.filter_solo_rm(aa.p.viewing[0],aa.p.viewing[1]);
    delete aa.p.viewing;
  }
};


// make all other profile sections after metadata
aa.mk.extradata =p=>
{
  const extradata = aa.mk.l('section',{cla:'extradata'});
  const a = ['p_petnames','p_relays','p_follows','p_followers'];
  for (const k of a)
  {
    let id = k.slice(2);
    const v = p[id];
    if (aa.mk.hasOwnProperty(k)) extradata.append(aa.mk[k](v,p));
    else if (v.length) extradata.append(aa.mk.item(id,v,'p'));
  }
  return extradata
};


// return last replaceable event from p of kind n
aa.p.get_last_of =async(p,kn)=>
{
  if (p.events[kn]?.length)
  {
    return await aa.db.get_e(p.events[kn][0][0]);
  }
  return false
};


// returns profile if already loaded or get it from database
aa.db.get_p =async xpub=>
{
  if (aa.db.p[xpub]) return aa.db.p[xpub];
  let p = await aa.db.idb.ops({get:{store:'authors',key:xpub}});
  if (p) aa.db.p[xpub] = p;
  return p
};


// gets a relay url or empty string 
// for follow list relay hints
aa.p.get_relay =p=>
{
  let p_relays = Object.entries(p.relays);
  if (!p_relays.length) return ' ';
  const u_relays = aa.r.in_set(aa.r.o.r).sort();

  let relays = p_relays
  .filter(r=>r[1].sets.includes('write'))
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


// on load
aa.p.load =()=>
{
  aa.clear.push(aa.p.clear);
  aa.actions.push(
    {
      action:['p','view'],
      required:['hex_pub'],
      description:'view profile by hex pubkey',
      exe:(s)=>{ aa.state.view(aa.fx.encode('npub',s)) }
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
    }
  );
  // create p section
  const section = aa.mk.section('p');
  aa.p.l = aa.mk.l('div',{id:'authors'});
  section.append(aa.p.l);
  // create section mutation observer
  aa.p.section_observer = new MutationObserver(a=> 
  {
    for (const mutation of a) 
    {
      const section = mutation.target.closest('section');
      let butt = section.querySelector('section > header > .butt');
      aa.fx.data_count(butt,'.profile');
    }
  });
  aa.p.section_observer.observe(aa.p.l,{attributes:false,childList:true});
};


// make metadata section
aa.mk.metadata =p=>
{
  let metadata = aa.mk.l('section',{cla:'metadata'});
  const butt = aa.mk.butt(['refresh','p_metadata']);
  const ul = aa.mk.l('div',{cla:'metadata_list'});
  
  if (p && p.metadata && Object.keys(p.metadata).length)
  {
    let k0 = p.events.k0;
    if (k0?.length) butt.dataset.last = aa.t.display_ext(k0[0][1]);
    for (const k in p.metadata)
    {
      let l, v = p.metadata[k];
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
  details.append(ul);
  metadata.append(details);
  return metadata
};

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
    l.dataset.verified_on = aa.t.display_ext(p.verified[0][1]);
    if (p.verified[0][0] === true) l.classList.add('nip05-verified');
  }
  l.addEventListener('click',e=>{e.preventDefault(); aa.p.verify_nip05(v,p)});
  
  return l
};

aa.mk.metadata_picture =(k,v,p)=>
{
  if (aa.is.trusted(p.trust) && v) 
  {
    let img = aa.mk.l('img',{src:v});
    img.addEventListener('click',e=>{e.target.classList.toggle('expanded')});
    return img;
  }
  else return aa.mk.l('p',{cla:k,con:v});
};

aa.mk.metadata_website =(k,v)=> aa.mk.link(v);


// follow / unfollow
aa.clk.p_follow =async e=>
{
  const x = e.target.closest('.profile').dataset.xpub;
  const dis = e.target.textContent;
  if (dis === 'unfollow')
  {
    // unfollow
    let s = localStorage.ns+' p unfollow ';
    let sx = s+x;
    let v = aa.cli.t.value;
    if (v.length >= sx.length && v.startsWith(s))  sx = v+' '+x;
    aa.cli.v(sx);
  }
  else
  {
    //follow
    let new_follow = [x];
    const p = await aa.db.get_p(x);
    new_follow.push(aa.p.get_relay(p));
    let petname;
    if (p.metadata?.name) petname = p.metadata.name;
    else if (p.petnames.length) petname = p.petnames[0];
    if (petname?.length) new_follow.push(aa.fx.an(petname));
    else new_follow.push('')
    aa.cli.v(localStorage.ns+' p follow '+new_follow.join(', '));
  }
};


// refresh follows
aa.clk.p_follows =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_follows',{authors:[xpub],kinds:[3],limit:1}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
};


// make follows
aa.mk.p_follows =(a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'follows'});
  const butt_follows = aa.mk.butt(['refresh follows','p_follows']);
  let follows_details = aa.mk.details('follows ('+a.length+')',butt_follows);
  follows_details.append(ul);
  aa.p.author_list(a,ul);
  if (p?.events.k3?.length) 
    butt_follows.dataset.last = aa.t.display(p.events.k3[0][1]);
  return follows_details;
};


// make followers
aa.mk.p_followers =(a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'followers'});
  let followers_details = aa.mk.details('followers ('+a.length+')', ul);
  aa.p.author_list(a,ul);
  return followers_details
};


// make p link
aa.mk.p_link =(x,p=false)=>
{
  if (!p) p = aa.db.p[x];
  if (!p) p = aa.p.p(x);
  const l = aa.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+', '+x,
    ref:'#'+p.npub,
    clk:aa.clk.a,
    app:aa.mk.l('span',{cla:'name',con:p.npub.slice(0,12)})
  });
  aa.fx.color(x,l);
  aa.p.p_link_data_upd(l,aa.p.p_link_data(p));
  return l
};


// returns link data from p
aa.p.p_link_data =p=>
{
  let o = {class_add:[],class_rm:[],src:false};

  let name = p.metadata?.name || p.metadata?.display_name || p.metadata?.displayName || p.npub.slice(0,12);
  o.name = name.trim();
  
  let petname = p.petname.length ? p.petname 
  : p.petnames.length ? p.petnames[0] 
  : false;
  if (petname) o.petname = petname;
  if (p.metadata?.nip05) o.nip05 = p.metadata.nip05;
  if (p.verified.length) o.verified = p.verified[0];
  if (aa.is.u(p.xpub)) o.class_add.push('is_u');
  else o.class_rm.push('is_u');
  if (aa.u.is_following(p.xpub)) 
  {
    o.class_rm.push('is_mf');
    o.class_add.push('is_bff');
  }
  else 
  {
    o.class_rm.push('is_bff');
    o.class_add.push('is_mf');
  }
  
  let common = 0;
  for (const k of p.followers) { if (aa.u.is_following(k)) common++ }
  o.followers = common;
  if (p.metadata?.picture && aa.is.trusted(p.trust))
  {
    let url = aa.is.url(p.metadata.picture.trim());
    if (url) o.src = url.href;
  } 
  return o
};


// update link
aa.p.p_link_data_upd =async(l,o)=>
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
  aa.i.upd_item_pubkey(a[0],p);
};


// refresh metadata
aa.clk.p_metadata =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_metadata',{authors:[xpub],kinds:[0],limit:1}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
};


// refresh all profile data (metadata,relays,follows)
aa.clk.p_refresh =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_refresh',{authors:[xpub],kinds:[0,3,10002]}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
};


// refresh relays
aa.clk.p_relays =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_relays',{authors:[xpub],kinds:[10002],limit:1}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
};


// make relays
aa.mk.p_relays =(a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'relays list'});
  if (a) for (const relay in a) ul.append(aa.mk.relay(relay,a[relay]));
  const butt_relays = aa.mk.butt(['refresh relays','p_relays']);
  let relays_details = aa.mk.details('relays ('+ul.childNodes.length+')',butt_relays);
  relays_details.append(ul);
  if (p.events.k10002?.length) 
    butt_relays.dataset.last = aa.t.display(p.events.k10002[0][1]);
  return relays_details
};


// score profile
aa.clk.p_score =async e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const p = await aa.db.get_p(xpub);
  if (p) aa.cli.v(localStorage.ns+' p score '+xpub+' '+p.trust);
};


// create profile from p object
// on creation, profiles are in simp mode,
// meaning they are mostly empty of data except basic metadata
// use aa.p.upd(aa.p.profile(aa.p.p(x))) for full data
aa.p.profile =p=>
{
  aa.p.migrate_p_fields(p);
  let profile = document.getElementById(p.npub);
  if (!profile) 
  {
    profile = aa.mk.l('article',{cla:'profile simp',id:p.npub});
    profile.dataset.trust = p.trust;
    profile.dataset.xpub = p.xpub;
    profile.dataset.updated = p.updated ?? 0;
    aa.fx.color(p.xpub,profile);
    profile.append(aa.mk.pubkey(p));
    profile.append(aa.p.actions(p));
    profile.append(aa.mk.l('section',{cla:'metadata'}));
    profile.append(aa.mk.l('section',{cla:'extradata'}));
    aa.p.l.append(profile);
  }
  return profile
};


// make profile header
aa.mk.pubkey =p=>
{
  const pubkey = aa.mk.l('p',{cla:'pubkey'});
  pubkey.append(aa.mk.p_link(p.xpub,p));
  pubkey.append(aa.mk.l('span',{cla:'xpub',con:p.xpub}));
  pubkey.append(aa.mk.time(p.updated));
  return pubkey
};


// gets all p tags from array 
// and checks if metadata is available or if it needs to fetch it
aa.get.pubs =async tags=>
{
  if (!aa.temp.pubs) aa.temp.pubs = {};
  let a = tags.filter(t=>aa.is.tag.p(t));
  for (const tag of a)
  {
    let x = tag[1];
    let r = tag[2];
    if (!aa.db.p[x] || !aa.db.p[x].events.k0?.length)
    {
      if (!aa.temp.pubs[x]) aa.temp.pubs[x] = [];
      let url = aa.is.url(r);
      if (url) aa.fx.a_add(aa.temp.pubs[x],[url.href]);
    }
  }
  let pubkeys = Object.keys(aa.temp.pubs);
  if (pubkeys.length)
  {
    aa.to(()=>
    {
      aa.db.idb.ops({get_a:{store:'authors',a:pubkeys}}).then(dat=>
      {
        for (const p of dat) 
        {
          if (p.events.k0?.length)
          {
            aa.db.p[p.xpub] = p;
            delete aa.temp.pubs[p.xpub];
            aa.p.p_links_upd(p);
          }          
        }
        for (const x in aa.temp.pubs) 
        {
          if (!aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]}
          aa.fx.a_add(aa.miss.p[x].relays,aa.temp.pubs[x]);
          delete aa.temp.pubs[p.xpub];
        }
        aa.get.missing('p');
      });
    },500,'get_pubs');
  }
};


// add relays to profile
aa.p.relays_add =(relays,p)=>
{
  if (!p.rels) p.rels = {};
  for (const relay in relays)
  {
    if (!p.rels[relay]) p.rels[relay] = relays[relay]
    else aa.fx.a_add(p.rels[relay].sets,relays[relay].sets);
  }
};


// save p
aa.p.save = async p=>
{
  const q_id = 'author_save';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.db.p[p.xpub] = p;
  // let profile = document.getElementById(p.npub) || aa.p.profile(p);
  setTimeout(()=>{aa.p.p_links_upd(p)},100);
  if (aa.viewing === p.npub) aa.p.upd(aa.p.profile(p),p,1);
  aa.temp[q_id].push(p);
  aa.to(()=>
  {
    let q = [...aa.temp[q_id]];
    aa.temp[q_id] = [];
    aa.db.idb.worker.postMessage({put:{store:'authors',a:q}})
  },1000,q_id);
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
    p.trust = score;    
    // aa.p.upd(aa.p.profile(p),p,true);
    aa.p.save(p);
  }
  else aa.log('invalid data to score')
};


// update profile
aa.p.upd =async(profile,p,b=false)=>
{
  if (profile.classList.contains('simp') || b)
  {
    profile.classList.remove('simp');

    const pubkey = profile.querySelector('.pubkey');
    pubkey.replaceWith(aa.mk.pubkey(p));

    const actions = profile.querySelector('.actions');
    actions.replaceWith(aa.p.actions(p));

    const metadata = profile.querySelector('.metadata');
    metadata.replaceWith(aa.mk.metadata(p));
    
    const extradata = profile.querySelector('.extradata');
    extradata.replaceWith(aa.mk.extradata(p));
    
    profile.dataset.trust = p.trust;
    profile.dataset.updated = p.updated ?? 0;

    aa.p.p_links_upd(p)
  }
};


// verify nip05
aa.p.verify_nip05 =async(s,p)=>
{
  s = s.trim();
  let verified = false;
  let dis = await NostrTools.nip05.queryProfile(s);
  if (dis)
  {
    if (!p) p = await aa.db.get_p(dis.pubkey);
    if (p && dis.pubkey === p.xpub) verified = true
  }
  
  if (p)
  {
    p.verified.unshift([verified,aa.t.now]);
    aa.p.save(p);
    // if (aa.viewing === p.npub) aa.p.upd(aa.p.profile(p),p,1);
  }

  aa.log('nip5 '+verified+' for '+s);
};
  

// event template for user metadata 
aa.kinds[0] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  (async()=>
  {
    let p = await aa.db.get_p(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events(dat,p))
    {
      if (aa.miss.p[dat.event.pubkey]) delete aa.miss.p[dat.event.pubkey];
      
      let metadata = aa.parse.j(dat.event.content);
      if (metadata)
      {
        p.metadata = metadata;
        aa.p.save(p);
        
      }
      let content = note.querySelector('.content');
      content.textContent = '';
      content.append(metadata ? aa.mk.ls({ls:metadata}) : 'invalid kind:0 metadata');
    }
    
    
  })();
  
    
  return note
};

aa.p.events =(dat,p)=>
{
  let upd;
  let kn = p.events['k'+dat.event.kind];
  if (!kn) kn = p.events['k'+dat.event.kind] = [];
  
  const c_at = dat.event.created_at;
  if (!kn.length || kn[0][1] < c_at) 
  {
    kn.unshift([dat.event.id,c_at]);
    if (c_at > p.updated) p.updated = c_at;
    upd = true
  }
  return upd
};


// event template for follow list / contacts with legacy relay object
aa.kinds[3] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  (async()=>
  {
    let p = await aa.db.get_p(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events(dat,p))
    {
      const old_bff = [...p.follows];
      p.follows = aa.p.authors_from_tags(dat.event.tags);
      aa.p.authors(p.follows);
      aa.u.process_k3_tags(dat.event.tags,dat.event.pubkey);

      // for (const k of old_bff)
      // {
      //   if (!p.follows.includes(k))
      //   {
      //     // handle unfollowed k
      //   }
      // }

      let s = dat.event.content+''.trim();
      if (s.startsWith('{') && s.endsWith('}'))
      {
        let con = aa.parse.j(dat.event.content);
        if (con)
        {
          let relays = aa.r.from_o(con,['k3']);
          aa.p.relays_add(relays,p);
          if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
          let content = note.querySelector('.content');
          content.textContent = '';
          content.append(aa.mk.ls({ls:con}))
        }
      }
      aa.p.save(p);
      if (aa.is.u(dat.event.pubkey)) aa.u.load_follows(p);
    }
  })();
  
  // d3_post(dat,note);
  return note
};


// event template for relay list
aa.kinds[10002] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  (async()=>
  {
    let p = await aa.db.get_p(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events(dat,p))
    {
      const tags = dat.event.tags;
      let relays = aa.r.from_tags(tags,['k10002']);
      aa.p.relays_add(relays,p);
      if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
      aa.p.save(p);
    }
    let profile = document.getElementById(p.npub);
    if (!profile) profile = aa.p.profile(p);
  })();
  
  return note
};


// view for npub
aa.views.npub1 =async npub=>
{
  let xpub = aa.fx.decode(npub);
  let p = await aa.db.get_p(xpub);
  if (!p) p = aa.p.p(xpub);
  
  let l = document.getElementById(npub);  
  if (!l)
  {
    l = aa.p.profile(p);
  }

  if (l.classList.contains('simp')) aa.p.upd(l,p);
  l.classList.add('in_view');
  aa.l.classList.add('viewing','view_p');
  aa.fx.scroll(l);
  aa.viewing = npub;

  let notes_by = document.querySelectorAll('.note[data-pubkey="'+xpub+'"]');
  let notes_ref = document.querySelectorAll('.note[data-pubkey="'+xpub+'"]');

  const k = 'pubkey';
  const v = xpub;
  // let dis = e.target.classList.contains('.key') ? e.target : e.target.closest('.key');
  let items = aa.get.index_items(k,v);
  const k_v = k+'_'+aa.fx.an(v);
  aa.p.viewing = [items,k_v];
  aa.i.filter_solo_apply(items,k_v);

  // setTimeout(()=>
  // {
  //   let index = document.getElementById('i_item_'+xpub);
  //   if (index) index.querySelector('.key').click();
  // },200);
  
};

// view for nprofile
aa.views.nprofile1 =async nprofile=>
{

};


window.addEventListener('load',aa.p.load);
window.addEventListener('hashchange',aa.p.clear);