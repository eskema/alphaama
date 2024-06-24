// author pubkey profile stuff

aa.p = {};  


// on load

aa.p.load =()=>
{
  aa.actions.push(
  {
    action:['p','score'],
    required:['id','number'], 
    description:'set user score (for auto parsing and stuff)',
    exe:aa.p.score
  });

  const section = aa.mk.section('p');
  aa.p.l = aa.mk.l('div',{id:'authors'});
  section.append(aa.p.l);

  aa.p.section_observer.observe(aa.p.l,{attributes:false,childList:true});
};

aa.p.section_mutated =a=> 
{
  for (const mutation of a) 
  {
    const section = mutation.target.closest('section');
    let butt = section.querySelector('section > header > .butt');
    aa.fx.data_count(butt,'.profile');
  }
};

aa.p.section_observer = new MutationObserver(aa.p.section_mutated);

// save p

aa.p.save =p=>
{
  const q_id = 'author_save';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.db.p[p.xpub] = p;
  aa.temp[q_id].push(p);
  aa.to(()=>
  {
    let q = [...aa.temp[q_id]];
    aa.temp[q_id] = [];
    aa.db.idb.worker.postMessage({put:{store:'authors',a:q}})
  },1000,q_id);
};


// get from db kind-3 event of hex pubkey

aa.p.get_k3 =async(xpub)=>
{
  return new Promise(resolve=>
  {
    let k3_id;
    const p = xpub ? aa.db.p[xpub] : aa.db.p[aa.u.o.ls.xpub];
    if (p && p.pastdata.k3.length) k3_id = p.pastdata.k3[0][0];
    // console.log(k3_id);
    aa.db.get_e(k3_id).then(dat=>
    {
      if (dat) resolve(dat);
      else resolve(false);
    });
  });
};

aa.p.authors_from_tags =tags=>
{
  const authors = [];
  const p_to_get = [];
  
  for (const tag of tags)
  {
    if (aa.is.tag.p(tag)) 
    {
      const xpub = tag[1];
      authors.push(xpub);
      if (!aa.db.p[xpub]) p_to_get.push(xpub);
    }
  }
  
  if (p_to_get.length)
  {
    aa.db.idb.ops({get_a:{store:'authors',a:p_to_get}}).then(a=>
    {
      for (p of a) aa.db.p[p.xpub] = p;
    });
  }  
  return authors
};

aa.p.profile =p=>
{
  let profile = document.getElementById(p.npub);
  if (!profile) 
  {
    profile = aa.mk.l('article',{cla:'profile simp',id:p.npub});
    profile.dataset.trust = p.trust;
    profile.dataset.xpub = p.xpub;
    profile.dataset.updated = p.updated ?? 0;
    aa.fx.color(p.xpub,profile);
    profile.append(aa.mk.pubkey(p));
    profile.append(aa.p.profile_actions(p));
    profile.append(aa.mk.l('section',{cla:'metadata'}));
    profile.append(aa.mk.l('section',{cla:'extradata'}));
    
    aa.p.l.append(profile);
  }
  return profile
};

aa.p.profile_actions =p=>
{
  const butt = (id)=> aa.mk.l('button',{con:id,cla:'butt '+id,clk:aa.clk[id]});
  
  const l = aa.mk.l('p',{cla:'actions'});

  const butt_score = aa.mk.l('button',
  {
    cla:'butt score',
    con:p.trust+'',
    clk:aa.p.profile_butt_score
  });
  
  l.append(butt_score);

  if (aa.u.o.ls.xpub)
  {
    if (p.xpub !== aa.u.o.ls.xpub)
    {
      const butt_follow = aa.mk.l('button',
      {
        cla:'butt follow',
        con:'follow',
        clk:aa.p.profile_butt_follow
      });
  
      if (aa.u.is_following(p.xpub)) 
      {
        butt_follow.classList.add('is_bff');
        butt_follow.textContent = 'unfollow';
      }
      l.append(butt_follow);
    }
    
  }
  
  // let a = ['score','follow'];
  // for (const s of a) l.append(butt(s),' ');
  return l
};

aa.p.profile_butt_all =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p',{authors:[xpub],kinds:[0,3,10002]}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
  // console.log(request);
};

aa.p.profile_butt_metadata =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','profile',{authors:[xpub],kinds:[0],limit:1}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
  // console.log(request);
};

aa.p.profile_butt_relays =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','relays',{authors:[xpub],kinds:[10002],limit:1}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
  // console.log(request);
};

aa.p.profile_butt_bff =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','bff',{authors:[xpub],kinds:[3],limit:1}];
  aa.r.demand(request,aa.r.in_set(aa.r.o.r),{eose:'close'});
  // console.log(request);
};

aa.p.profile_butt_score =async e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const p = await aa.db.get_p(xpub);
  if (p) aa.cli.v(localStorage.ns+' p score '+xpub+' '+p.trust);
};

aa.p.profile_butt_follow =async e=>
{
  const x = e.target.closest('.profile').dataset.xpub;
  const is_bff = e.target.classList.contains('is_bff');
  if (is_bff)
  {
    // unfollow
    let s = localStorage.ns+' p unfollow ';
    let dis = s+x;
    if (aa.cli.t.value.length >= dis.length && aa.cli.t.value.startsWith(s)) 
    {
      aa.cli.v(aa.cli.t.value + ' ' + x);
    }
    else aa.cli.v(dis);
  }
  else
  {
    //follow
    console.log('follow');
    if (!aa.u.o.ls.xpub) return false;
    
    let a = [x];

    let dat_k3 = await aa.p.get_k3();
    if (dat_k3)
    {
      const p = await aa.db.get_p(x);
      if (p)
      {
        console.log(p);
        const rels = Object.entries(p.rels);
        if (rels.length)
        {
          let relays = rels.filter(r=>r[1].sets.includes('write'))
          .sort((o_1,o_2)=>
          {
            if (o_1[1].sets.length > o_2[1].sets.length) return -1;
            return 1
          });
          if (!relays.length)
          {
            const yours = Object.keys(aa.r.o.ls);
            relays = rels.filter(r=>yours.includes(r[0]));
          }
          if (!relays.length) relays = [rels[0]]
          if (relays.length)
          {
            const url = aa.is.url(relays[0][0]);
            if (url) a.push(url.href);
          }
        }
        else a.push('');

        if (p.metadata?.name)
        {
          a.push(aa.fx.an(p.metadata.name));
        }
        else if (p.extradata.petnames.length) a.push(aa.fx.an(p.extradata.petnames[0]));
      }
    }
    else console.log('no k3')

    aa.cli.v(localStorage.ns+' p follow '+a.join(', '));
  }
};

aa.p.update =async(profile,p,b=false)=>
{
  // console.log('author update');
  if (profile.classList.contains('simp') || b)
  {
    profile.classList.remove('simp');

    const pubkey = profile.querySelector('.pubkey');
    pubkey.replaceWith(aa.mk.pubkey(p));

    const actions = profile.querySelector('.actions');
    actions.replaceWith(aa.p.profile_actions(p));

    const metadata = profile.querySelector('.metadata');
    metadata.replaceWith(aa.mk.metadata(p));
    
    const extradata = profile.querySelector('.extradata');
    extradata.replaceWith(aa.mk.extradata(p));
    
    profile.dataset.trust = p.trust;
    profile.dataset.updated = p.updated ?? 0;

    aa.p.p_links_upd(p)
  }
};

aa.mk.metadata =p=>
{
  let metadata = aa.mk.l('section',{cla:'metadata'});
  
  if (p && p.metadata && Object.keys(p.metadata).length)
  {
    for (const k in p.metadata)
    {
      let l, v = p.metadata[k];
      if (v && typeof v === 'string') v.trim();
      if (k === 'picture' || k === 'banner')
      {
        if (aa.is.trusted(p.trust)) l = aa.mk.l('img',{src:v});
        else l = aa.mk.l('p',{cla:k,con:v})
      }
      else if (k === 'lud06' || k === 'lud16')
      {
        l = aa.mk.l('a',{ref:'lightning:'+v,con:v});
      }
      else if (k === 'nip05')
      {
        l = aa.mk.l('a',{con:v});
        let [username,domain] = v.split('@');
        if (username && domain) 
        {
          const url = new URL('https://'+domain+'/.well-known/nostr.json?name='+username);
          if (url) 
          {
            l.href = url.href;
            if (p.verified.length)
            {
              l.dataset.verified = p.verified[0][0];
              l.dataset.verified_on = aa.t.display(p.verified[0][1]);
              if (p.verified[0][0] === true) l.classList.add('nip05-verified');
            }
            l.addEventListener('click',aa.p.verify_nip5)
          }
        }
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
      metadata.append(l);
    }
  }

  const butt_metadata = aa.mk.l('button',
  {
    cla:'butt profile_metadata refresh',
    con:'refresh metadata',
    clk:aa.p.profile_butt_metadata
  });
  const ts = p.pastdata.k0[0][1];
  const last_date = aa.t.display(ts)+' ~'+aa.t.elapsed(aa.t.to_date(ts));
  if (p.pastdata.k0.length) 
    butt_metadata.dataset.last = last_date;


  metadata.append(butt_metadata);

  return metadata
};
  
aa.p.list =(a,l)=>
{
  l.classList.add('author_list');
  if (a.length)
  {    
    const bff_li = x=>
    {
      const dis = aa.mk.p_link(x);
      l.append(aa.mk.l('li',{cla:'bff',app:dis}));
    };
    
    let keys_to_get = [];
    for (const x of a)
    {
      if (!aa.db.p[x]) keys_to_get.push(x)
    }
    if (keys_to_get.length)
    {
      // console.log('aa.p.list');
      aa.db.idb.ops({get_a:{store:'authors',a:keys_to_get}})
      .then(all=>
      {
        for (const bff of all) aa.db.p[bff.xpub] = bff;
        for (const bff of a) bff_li(bff)
      });
    }
    else 
    {
      for (const bff of a) bff_li(bff)
    }
  }

};
  
aa.mk.bff =(extr,a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'bffs'});
  let bff_details = aa.mk.details('follows ('+a.length+')', ul);
  extr.append(bff_details);

  aa.p.list(a,ul);
  
  const butt_bff = aa.mk.l('button',
  {
    cla:'butt profile_bff refresh',
    con:'refresh follows',
    clk:aa.p.profile_butt_bff
  });

  if (p.pastdata?.k3.length) butt_bff.dataset.last = aa.t.display(p.pastdata.k3[0][1]);
  bff_details.append(butt_bff);
  setTimeout(()=>{aa.fx.sort_l(ul,'text_asc')},500);
};

aa.mk.followers =(extr,a)=>
{
  let ul = aa.mk.l('ul',{cla:'followers'});
  let followers_details = aa.mk.details('followers ('+a.length+')', ul);
  extr.append(followers_details);

  aa.p.list(a,ul);
  setTimeout(()=>{aa.fx.sort_l(ul,'text_asc')},50);
};

aa.mk.relays =(extr,a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'relays'});
  
  if (a.length)
  {
    for (const item of a) ul.append(aa.mk.l('li',{cla:'item relay',con:item}))
  }

  if (p.rels)
  {
    for (const relay in p.rels) ul.append(aa.r.mk_item(relay,p.rels[relay]))
  }

  const butt_relays = aa.mk.l('button',
  {
    cla:'butt profile_relays refresh',
    con:'refresh relays',
    clk:aa.p.profile_butt_relays
  });

  if (p.pastdata.k10002.length) butt_relays.dataset.last = aa.t.display(p.pastdata.k10002[0][1]);

  let relays_details = aa.mk.details('relays ('+ul.childNodes.length+')',ul);
  relays_details.append(butt_relays);
  extr.append(relays_details);
};

aa.mk.relay_hints =(extr,a,p)=>
{
  let ul = aa.mk.l('ul',{cla:'relay_hints'});
  let relay_hints_details = aa.mk.details('relay_hints ('+a.length+')',ul);
  extr.append(relay_hints_details);

  if (a.length)
  {
    for (const item of a) 
    {
      ul.append(aa.mk.l('li',{cla:'item relay',con:item}))
    }
  }
};

aa.mk.pubkey =p=>
{
  const pubkey = aa.mk.l('p',{cla:'pubkey'});
  pubkey.append(aa.mk.p_link(p.xpub,p));
  pubkey.append(aa.mk.l('span',{cla:'xpub',con:p.xpub}));
  pubkey.append(aa.mk.time(p.updated));

  return pubkey
};

aa.mk.extradata =p=>
{
  const extradata = aa.mk.l('section',{cla:'extradata'});
  for (const k in p.extradata)
  {
    const v = p.extradata[k];
    if (aa.mk.hasOwnProperty(k)) aa.mk[k](extradata,v,p);
    else if (v.length) extradata.append(aa.mk.item(k,v,'p'));
  }
  return extradata
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
    console.log(p,score);
    p.trust = score;    
    aa.p.update(aa.p.profile(p),p,true);
    aa.p.save(p);
  }
  else aa.log('invalid data to score')
};

// generic p object

aa.p.p =xpub=>
{
  return {
    xpub:xpub,
    relay:'',
    relays:{},
    petname:'',
    petnames:{},
    npub: aa.fx.encode('npub',xpub),
    score:0,
    updated:0,
    metadata:{},
    trust:0, // will be deprecated in favor of score
    verified:[], // [result,date]
    sets:[],
    follows:[],
    followers:[],
    rels:{}, // will be deprecated in favor of relays
    extradata: // will be deprecated
    {
      bff:[],
      relays:[],
      followers:[],
      petnames:[],
      lists:[],
    },
    pastdata: // will be deprecated in favor of e
    { 
      k0:[],
      k3:[],
      k10002:[],
    },
    events: // n:[[id,created_at],...]
    {
    }
  }
};


// updates all links from p

aa.p.p_links_upd =async p=>
{
  const options = aa.mk.p_link_data(p);
  const a = document.querySelectorAll('.author[href="#'+p.npub+'"]');
  for (const l of a) aa.p.p_link_data_upd(l,options)
};


// update link

aa.p.p_link_data_upd =async(l,o)=>
{
  let name = l.querySelector('.name');
  if (name.textContent !== o.name) name.textContent = o.name;
  if (!name.childNodes.length) name.classList.add('empty');
  else name.classList.remove('empty');
  if (o.petname) name.dataset.petname = o.petname;
  aa.p.pic(l,o.src);
  if (o.nip05) l.dataset.nip05 = o.nip05;
  l.classList.add(...o.class_add);
  l.classList.remove(...o.class_rm);
  l.dataset.followers = o.followers;
};


// add picture to p_link

aa.p.pic =(l,src=false)=>
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


// returns profile if already loaded or get it from database

aa.db.get_p =async xpub=>
{
  if (aa.db.p[xpub]) return aa.db.p[xpub];
  let p = await aa.db.idb.ops({get:{store:'authors',key:xpub}});
  if (p) 
  {
    // aa.db.upd_p(p);
    aa.db.p[xpub] = p;
  }
  return p
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
    if (!aa.db.p[x] || !aa.db.p[x].pastdata.k0.length)
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
          if (p.pastdata.k0.length)
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
  

// make p link

aa.mk.p_link =(x,p=false)=>
{
  if (!p) p = aa.db.p[x];
  if (!p) p = aa.p.p(x);
  const l = aa.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+' \n '+x,
    ref:'#'+p.npub,
    clk:aa.clk.a,
    app:aa.mk.l('span',{cla:'name',con:p.npub.slice(0,12)})
  });
  aa.fx.color(x,l);
  aa.p.p_link_data_upd(l,aa.mk.p_link_data(p));
  return l
};


// returns link data from p

aa.mk.p_link_data =p=>
{
  let o = {class_add:[],class_rm:[],src:false};

  let name_s = p.metadata?.name || p.metadata?.display_name || p.npub.slice(0,12);
  o.name = name_s.trim();
  
  let petname = p.petname.length ? p.petname 
  : p.extradata.petnames.length ? p.extradata.petnames[0] 
  : false;
  if (petname) o.petname = petname;
  if (p.metadata?.nip05) o.nip05 = p.metadata.nip05;
  if (aa.u.is_u(p.xpub)) o.class_add.push('is_u');
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
  for (const k of p.extradata.followers) { if (aa.u.is_following(k)) common++ }
  o.followers = common;
  if (p.metadata?.picture && aa.is.trusted(p.trust))
  {
    let url = aa.is.url(p.metadata.picture.trim());
    if (url) o.src = url.href;
  } 
  return o
};


// event template for user metadata 

aa.kinds[0] =dat=>
{
  let metadata = aa.parse.j(dat.event.content);
  if (metadata)
  {
    if (aa.miss.p[dat.event.pubkey]) delete aa.miss.p[dat.event.pubkey];
    aa.db.get_p(dat.event.pubkey).then(p=>
    {
      if (!p) p = aa.p.p(dat.event.pubkey);
      const c_at = dat.event.created_at;
      if (!p.pastdata.k0.length || p.pastdata.k0[0][1] < c_at) 
      {
        p.pastdata.k0.unshift([dat.event.id,c_at]);
        if (c_at > p.updated) p.updated = c_at;
        p.metadata = metadata;
        aa.p.save(p);
        let profile = document.getElementById(p.npub) || aa.p.profile(p);
        if (aa.viewing === p.npub) 
        {
          aa.p.update(profile,p,true);
        }
        setTimeout(()=>{aa.p.p_links_upd(p)},100);
      }      
    });
  }
  const note = aa.e.note_default(dat);
  note.classList.add('root','tiny');
  let content = note.querySelector('.content');
  content.textContent = '';
  content.append(metadata ? aa.mk.ls({ls:metadata}) : 'invalid kind:0 metadata');
    
  return note
};


// event template for follow list / contacts with legacy relay object

aa.kinds[3] =dat=>
{
  const d3_post =async(dat,note)=>
  {
    let p = await aa.db.get_p(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);   
    const c_at = dat.event.created_at;
    if (!p.pastdata.k3.length || p.pastdata.k3[0][1] < c_at) 
    {
      p.pastdata.k3.unshift([dat.event.id,c_at]);
      if (c_at > p.updated) p.updated = c_at;

      const old_bff = [...p.extradata.bff];
      p.extradata.bff = aa.p.authors_from_tags(dat.event.tags);
      aa.u.process_k3_tags(dat.event.tags,dat.event.pubkey);

      // for (const k of old_bff)
      // {
      //   if (!p.extradata.bff.includes(k))
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
          aa.r.add_to_p(relays,p);
          if (aa.u.is_u(dat.event.pubkey)) aa.r.add_from_o(relays);
          let content = note.querySelector('.content');
          content.textContent = '';
          content.append(aa.mk.ls({ls:con}))
        }
      }
      aa.p.save(p);
      let profile = document.getElementById(p.npub);
      if (!profile) profile = aa.p.profile(p);
      if (aa.viewing === p.npub) aa.p.update(profile,p,true);
      if (aa.u?.is_u(dat.event.pubkey)) aa.u.is_following_load_profiles(p);
    }
  };
  const note = aa.e.note_default(dat);
  note.classList.add('root','tiny');
  d3_post(dat,note);
  return note
};


// event template for relay list

aa.kinds[10002] =dat=>
{
  const tags = dat.event.tags;
  if (tags.length) 
  {    
    aa.db.get_p(dat.event.pubkey).then(p=>
    {
      if (!p) p = aa.p.p(dat.event.pubkey);
      const c_at = dat.event.created_at;
      if (!p.pastdata.k10002.length || p.pastdata.k10002[0][1] < c_at) 
      {
        p.pastdata.k10002.unshift([dat.event.id,c_at]);
        if (c_at > p.updated) p.updated = c_at;
        
        let relays = aa.r.from_tags(tags,['k10002']);
        aa.r.add_to_p(relays,p);
        if (aa.u.is_u(dat.event.pubkey)) aa.r.add_from_o(relays);
        aa.p.save(p);
      }

      let profile = document.getElementById(p.npub);
      if (!profile) profile = aa.p.profile(p);
      if (aa.viewing === p.npub) aa.p.update(profile,p,true);
      
    });
  }
  const note = aa.e.note_default(dat);
  note.classList.add('root','tiny');
  return note
};

aa.views.npub1 =async npub=>
{
  console.log(npub);
  let xpub = aa.fx.decode(npub);
  let p = await aa.db.get_p(xpub);
  if (!p) p = aa.p.p(xpub);
  
  let l = document.getElementById(npub);  
  if (!l)
  {
    l = aa.p.profile(p);
  }

  if (l.classList.contains('simp')) aa.p.update(l,p);
  l.classList.add('in_view');
  aa.l.classList.add('viewing','view_p');
  aa.fx.scroll(l);
  aa.viewing = npub;

  let notes_by = document.querySelectorAll('.note[data-pubkey="'+xpub+'"]');
  let notes_ref = document.querySelectorAll('.note[data-pubkey="'+xpub+'"]');
};

aa.views.nprofile1 =async nprofile=>
{

};

// nip05 (wip)

aa.get.nip05 =async s=>
{
  let nip05 = await NostrTools.nip05.queryProfile(s);
  console.log(nip05);
};

window.addEventListener('load',aa.p.load);