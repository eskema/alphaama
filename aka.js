const aka = 
{
  def:{id:'aka',ls:{}},
  sn:'aka',
};

aka.mk =(k,v)=>
{
  const l = it.mk.l('li', {id:'aka_'+it.fx.an(k),cla:'item'});
  l.append(it.mk.l('span',{cla:'key',con:k}));
  switch (k)
  {
    case 'bff':
      l.append(it.mk.l('span',{cla:'val',con:v.length}))
      break;
    default: 
      l.append(it.mk.l('span',{cla:'val',con:v}))
  }
  return l
};

aka.load =()=>
{ 
  aa.actions.push(
    {
      action:['u','md'],
      description:'autofills metadata to edit and set',
      exe:aka.md
    },
    {
      action:['u','smd'],
      required:['{JSON}'], 
      description:'set metadata (kind-0)',
      exe:aka.smd
    },
    {
      action:['e','react'],
      required:['id','reaction'], 
      description:'react to a note',
      exe:aka.react
    },
    {
      action:['p','follow'],
      required:['id'], 
      optional:['relay','petname'], 
      description:'follow account (hex or npub)',
      exe:aka.follow
    },
    {
      action:['p','unfollow'],
      required:['id'], 
      optional:['more ids..'], 
      description:'unfollow account (hex or npub)',
      exe:aka.unfollow
    },
    {
      action:['p','score'],
      required:['id','number'], 
      description:'set user score (for auto parsing and stuff)',
      exe:aka.score
    }
  );
  
  aa.load_mod(aka).then(aka.start);
};

aka.start =async mod=>
{
  let ls = mod.o.ls;
  if (ls.xpub)
  {
    v_u.log('u xpub '+ls.xpub);
    v_u.log('u npub '+ls.npub);
    
    let butt_u = document.getElementById('butt_u');
    if (butt_u)
    {
      it.fx.color(ls.xpub,butt_u);
      butt_u.textContent = ls.xpub.slice(0,3);
    }

    let p = await aa.db.get_p(ls.xpub);
    if (p)
    {
      let changed;
      // console.log(p);
      if (p.trust < 9) 
      {
        p.trust = 9;
        changed = true;
      }
      if (it.a_set(p.sets,['aka'])) changed = true;
      if (butt_u) author.pic(butt_u,p);
      if (!p.pastdata.k0.length) v_u.log('aka !metadata');
      if (!p.pastdata.k3.length) v_u.log('aka !bffs');
      else aka.load_bff(p);
      author.profile(p);
      if (changed) author.save(p);
    } 
  }
  else v_u.log('no aka')
};

aka.load_bff =async p=>
{
  console.log('load_bff');
  
  if (p.extradata.bff.length)
  {
    let bffs = await aa.db.get({get_a:{store:'authors',a:p.extradata.bff}});
    for (const bff of bffs) aa.p[bff.xpub] = bff;
    for (const x of p.extradata.bff)
    {
      if (!aa.p[x]) aa.p[x] = it.p(x);
      author.profile(aa.p[x])
    } 
  }
};

aka.set =s=>
{   
  let pub = s.trim();
  if (pub) 
  {
    let o = {};
    if (!it.s.x(pub) && pub.startsWith('npub')) o = {xpub:it.fx.decode(pub),npub:pub};
    else if (it.s.x(pub)) o = {xpub:pub,npub:it.fx.npub(pub)};
    aka.o.ls = o;
    aa.save(aka);
    aka.start(aka);
  } 
  else console.log('aka mk requires', aa.ct.aka.add.required)
};

aka.ext =async()=>
{
  return new Promise(resolve=>
  {
    if (window.nostr) 
    {
      cli.fuck_off();
      window.nostr.getPublicKey().then(k=>
      {
        aka.set(k);
        resolve('aka ext done');
      });
    } 
    else 
    {
      v_u.log("no extension found, make sure it's enabled");
      resolve('aka ext done');
    }
  });
};

aka.rm =s=>
{
  if (window.confirm('remove aka?')) 
  {
    aka.o.ls = {};
    aa.save(aka);
    v_u.log('aka removed');
  }
};

const author = {mk:{}};

author.save =p=>
{
  const q_id = 'author_save';
  if (!aa.q.hasOwnProperty(q_id)) aa.q[q_id] = [];
  aa.p[p.xpub] = p;
  aa.q[q_id].push(p);
  it.to(()=>
  {
    aa.db.put({put:{store:'authors',a:aa.q[q_id]}}).then(()=>
    {aa.q[q_id] = [];});
  },1000,q_id);
};

author.load =async xpub=>
{
  const q_id = 'author_load';
  if (!aa.q.hasOwnProperty(q_id)) aa.q[q_id] = [];
  aa.q[q_id].push(xpub);
  
  it.to(()=>
  {
    const authors = [...aa.q[q_id]];
    aa.q[q_id] = [];
    console.log(q_id);
    aa.db.get({get_a:{store:'authors',a:authors}}).then(a=>
    {
      for (p of a) 
      {
        aa.p[p.xpub] = p;
        let profile = document.getElementById(p.npub);
        if (!profile) profile = author.profile(p);
        // author.update(profile,p,true);
      }
    });
  },1000,q_id);
};

author.get_k3 =async(xpub)=>
{
  return new Promise(resolve=>
  {
    let k3_id;
    const p = xpub ? aa.p[xpub] : aa.p[aka.o.ls.xpub];
    if (p && p.pastdata.k3.length) k3_id = p.pastdata.k3[0][0];
    console.log(k3_id);
    aa.db.get_e(k3_id).then(dat=>
    {
      if (dat) resolve(dat);
      else resolve(false);
    });
  });
};

aka.is_aka =(x)=> aka?.o.ls.xpub === x;

author.process_k3_tags =(tags,x)=>
{
  const is_aka = aka.is_aka(x);
  const to_upd = [];
  if (is_aka) aka.follows = tags;
  for (const tag of tags)
  {
    if (!it.tag.p(tag)) continue;
    let updd;
    const [type,xpub,relay,petname] = tag;
    if (it.s.x(xpub))
    {
      let p = aa.p[xpub];
      if (!p) 
      {
        p = aa.p[xpub] = it.p(xpub);
        updd = true;
      }

      if (relay)
      {
        let url = it.s.url(relay);
        if (url)
        {
          if (!p.rels) p.rels = {};
          if (!p.rels[url.href]) p.rels[url.href] = {sets:[]};
          if (it.a_set(p.rels[url.href].sets,['hint'])) updd = true;
        }
        if (is_aka && p.relay !== relay) 
        {
          p.relay = relay;
          updd = true;
        }
      }

      if (petname)
      {
        if (it.a_set(p.extradata.petnames,[petname])) updd = true;
        if (is_aka && p.petname !== petname) 
        {
          p.petname = petname;
          updd = true;
        }
      }

      if (it.a_set(p.extradata.followers,[x])) updd = true;
      if (is_aka && p.trust === 0)
      {
        p.trust = 5;
        updd = true;
      }
      
      if (updd) to_upd.push(p);
    }
    else console.log('invalid hex key in k3 of '+x,xpub)
  }

  if (to_upd.length) 
  {
    aa.db.put({put:{store:'authors',a:to_upd}});
    for (const p of to_upd)
    {
      const profile = document.getElementById(p.npub);
      if (profile) author.update(profile,p,true)
    }
  }
};

author.bff_from_tags =tags=>
{
  const bff = [];
  const p_to_get = [];
  
  for (const tag of tags)
  {
    if (it.tag.p(tag)) 
    {
      const xpub = tag[1];
      bff.push(xpub);
      if (!aa.p[xpub]) p_to_get.push(xpub);
    }
  }

  if (p_to_get.length)
  {
    console.log('author.bff_from_tags');
    aa.db.get({get_a:{store:'authors',a:p_to_get}}).then(a=>
    {
      for (p of a) aa.p[p.xpub] = p;
    });
  }  
  return bff
};

author.profile =p=>
{
  let profile = document.getElementById(p.npub);
  if (!profile) 
  {
    profile = it.mk.l('article',{cla:'profile simp',id:p.npub});
    profile.dataset.trust = p.trust;
    profile.dataset.xpub = p.xpub;
    it.fx.color(p.xpub,profile);
    profile.append(author.mk.pubkey(p));
    profile.append(it.mk.l('section',{cla:'metadata'}));
    profile.append(it.mk.l('section',{cla:'extradata'}));
    profile.dataset.updated = p.updated ?? 0;
    document.getElementById('authors').append(profile);
    it.butt_count('p','.profile');
  }
  return profile
};

author.profile_butt_all =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p',{authors:[xpub],kinds:[0,3,10002]}];
  q_e.demand(request,rel.in_set(rel.o.r),{eose:'close'});
  // console.log(request);
};

author.profile_butt_metadata =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','profile',{authors:[xpub],kinds:[0],limit:1}];
  q_e.demand(request,rel.in_set(rel.o.r),{eose:'close'});
  // console.log(request);
};

author.profile_butt_relays =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','relays',{authors:[xpub],kinds:[10002],limit:1}];
  q_e.demand(request,rel.in_set(rel.o.r),{eose:'close'});
  // console.log(request);
};

author.profile_butt_bff =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','bff',{authors:[xpub],kinds:[3],limit:1}];
  q_e.demand(request,rel.in_set(rel.o.r),{eose:'close'});
  // console.log(request);
};

author.profile_butt_score =async e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const p = await aa.db.get_p(xpub);
  if (p) cli.v(localStorage.ns+' p score '+xpub+' '+p.trust);
};

author.profile_butt_follow =async e=>
{
  const x = e.target.closest('.profile').dataset.xpub;
  const is_bff = e.target.classList.contains('is_bff');
  if (is_bff)
  {
    // unfollow
    let s = localStorage.ns+' p unfollow ';
    let dis = s+x;
    if (cli.t.value.length >= dis.length && cli.t.value.startsWith(s)) 
    {
      cli.v(cli.t.value + ' ' + x);
    }
    else cli.v(dis);
  }
  else
  {
    //follow
    console.log('follow');
    if (!aka.o.ls.xpub) return false;
    
    let a = [x];

    let dat_k3 = await author.get_k3();
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
          .sort(it.fx.sort_relays_by_sets_len);
          if (!relays.length)
          {
            const yours = Object.keys(rel.o.ls);
            relays = rels.filter(r=>yours.includes(r[0]));
          }
          if (!relays.length) relays = [rels[0]]
          if (relays.length)
          {
            const url = it.s.url(relays[0][0]);
            if (url) a.push(url.href);
          }
        }
        else a.push('');

        if (p.metadata?.name)
        {
          a.push(it.fx.an(p.metadata.name));
        }
        else if (p.extradata.petnames.length) a.push(it.fx.an(p.extradata.petnames[0]));
      }
    }
    else console.log('no k3')

    cli.v(localStorage.ns+' p follow '+a.join(', '));
  }
};

author.update =async(profile,p,b=false)=>
{
  // console.log('author update');
  if (profile.classList.contains('simp') || b)
  {
    profile.classList.remove('simp');

    const pubkey = profile.querySelector('.pubkey');
    pubkey.replaceWith(author.mk.pubkey(p));

    const metadata = profile.querySelector('.metadata');
    metadata.replaceWith(author.mk.metadata(p));
    
    const extradata = profile.querySelector('.extradata');
    extradata.replaceWith(author.mk.extradata(p));
    
    profile.dataset.trust = p.trust;
    profile.dataset.updated = p.updated ?? 0;

    author.links(p)
  }
};

author.mk.metadata =p=>
{
  let metadata = it.mk.l('section',{cla:'metadata'});
  
  if (p && p.metadata && Object.keys(p.metadata).length)
  {
    for (const k in p.metadata)
    {
      let l, v = p.metadata[k];
      if (v && typeof v === 'string') v.trim();
      if (k === 'picture' || k === 'banner')
      {
        if (it.s.trusted(p.trust)) l = it.mk.l('img',{src:v});
        else l = it.mk.l('p',{cla:k,con:v})
      }
      else if (k === 'lud06' || k === 'lud16')
      {
        l = it.mk.l('a',{ref:'lightning:'+v,con:v});
      }
      else if (k === 'nip05')
      {
        l = it.mk.l('a',{con:v});
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
              l.dataset.verified_on = it.tim.format(it.tim.std(p.verified[0][1]));
              if (p.verified[0][0] === true) l.classList.add('nip05-verified');
            }
            l.addEventListener('click',author.verify_nip5)
          }
        }
      }
      else 
      {
        let val;
        if (Array.isArray(v)) val = v.join(', ');
        else if (typeof v === 'object') val = JSON.stringify(v)
        else val = v;
        l = it.mk.l('p',{con:val});
      }
      l.dataset.meta = k;
      if (v === '') l.classList.add('empty');
      metadata.append(l);
    }
  }
  const butt_metadata = it.mk.l('button',
  {
    cla:'butt profile_metadata refresh',
    con:'refresh metadata',
    clk:author.profile_butt_metadata
  });
  if (p.pastdata.k0.length) butt_metadata.dataset.last = it.tim.e(p.pastdata.k0[0][1]);
  metadata.append(butt_metadata);

  return metadata
};

author.list =(a,l)=>
{
  if (a.length)
  {    
    const bff_li = x=>
    {
      const dis = it.mk.author(x);
      l.append(it.mk.l('li',{cla:'bff',app:dis}));
    };
    
    let keys_to_get = [];
    for (const x of a)
    {
      if (!aa.p[x]) keys_to_get.push(x)
    }
    if (keys_to_get.length)
    {
      console.log('author.list');
      aa.db.get({get_a:{store:'authors',a:keys_to_get}})
      .then(all=>
      {
        for (const bff of all) aa.p[bff.xpub] = bff;
        for (const bff of a) bff_li(bff)
      });
    }
    else 
    {
      for (const bff of a) bff_li(bff)
    }
  }
};

author.mk.extra ={};

author.mk.extra.bff =(extr,a,p)=>
{
  let ul = it.mk.l('ul',{cla:'bffs'});
  let bff_details = it.mk.details('follows ('+a.length+')', ul);
  extr.append(bff_details);

  author.list(a,ul);
  
  const butt_bff = it.mk.l('button',
  {
    cla:'butt profile_bff refresh',
    con:'refresh follows',
    clk:author.profile_butt_bff
  });

  if (p.pastdata?.k3.length) butt_bff.dataset.last = it.tim.e(p.pastdata.k3[0][1]);
  bff_details.append(butt_bff);

};

author.mk.extra.followers =(extr,a)=>
{
  let ul = it.mk.l('ul',{cla:'followers'});
  let followers_details = it.mk.details('followers ('+a.length+')', ul);
  extr.append(followers_details);

  author.list(a,ul);
};

author.mk.extra.relays =(extr,a,p)=>
{
  let ul = it.mk.l('ul',{cla:'relays'});
  
  if (a.length)
  {
    for (const item of a) ul.append(it.mk.l('li',{cla:'item relay',con:item}))
  }

  if (p.rels)
  {
    for (const relay in p.rels) ul.append(rel.mk_item(relay,p.rels[relay]))
  }

  const butt_relays = it.mk.l('button',
  {
    cla:'butt profile_relays refresh',
    con:'refresh relays',
    clk:author.profile_butt_relays
  });

  if (p.pastdata.k10002.length) butt_relays.dataset.last = it.tim.e(p.pastdata.k10002[0][1]);

  let relays_details = it.mk.details('relays ('+ul.childNodes.length+')',ul);
  relays_details.append(butt_relays);
  extr.append(relays_details);
};

author.mk.extra.relay_hints =(extr,a,p)=>
{
  let ul = it.mk.l('ul',{cla:'relay_hints'});
  let relay_hints_details = it.mk.details('relay_hints ('+a.length+')',ul);
  extr.append(relay_hints_details);

  if (a.length)
  {
    for (const item of a) 
    {
      ul.append(it.mk.l('li',{cla:'item relay',con:item}))
    }
  }
};

author.mk.pubkey =p=>
{
  const pubkey = it.mk.l('p',{cla:'pubkey'});
  const butt_score = it.mk.l('button',
  {
    cla:'butt score',
    con:p.trust+'',
    clk:author.profile_butt_score
  });
  
  pubkey.append(butt_score);

  if (aka.o.ls.xpub)
  {
    const butt_follow = it.mk.l('button',
    {
      cla:'butt follow',
      con:'follow',
      clk:author.profile_butt_follow
    });

    if (author.follows(p.xpub)) 
    {
      butt_follow.classList.add('is_bff');
      butt_follow.textContent = 'unfollow';
    }
    pubkey.append(butt_follow);
  }

  pubkey.append(it.mk.author(p.xpub,p),it.mk.l('span',{cla:'xpub',con:p.xpub}));

  return pubkey
};

author.mk.extradata =p=>
{
  const extradata = it.mk.l('section',{cla:'extradata'});
  for (const k in p.extradata)
  {
    const v = p.extradata[k];
    if (author.mk.extra.hasOwnProperty(k)) author.mk.extra[k](extradata,v,p);
    else if (v.length) extradata.append(it.mk.item(k,v,'p'));
  }
  return extradata
};

author.verify_nip5 =()=>
{

};

author.links =p=>
{
  const a = document.querySelectorAll('.author[href="#'+p.npub+'"]');
  for (const l of a) author.link(l,p)
};

author.link =async(l,p=false)=>
{
  // console.log('link');
  if (p && p.metadata)
  {
    let name_s = p.metadata?.name || p.metadata?.display_name || p.npub.slice(0,12);
    let name = l.querySelector('.name');
    if (name.textContent !== name_s) name.textContent = name_s;
    if (!name.childNodes.length) name.classList.add('empty');
    else name.classList.remove('empty');
    
    let petname = p.petname.length ? p.petname 
    : p.extradata.petnames.length ? p.extradata.petnames[0] 
    : false;
    if (petname) name.dataset.petname = petname;

    author.pic(l,p);
    if (p.metadata.nip05) l.dataset.nip05 = p.metadata.nip05;
  }
  if (author.follows(p.xpub)) l.classList.add('is_bff');
  else l.classList.remove('is_bff');
};

author.pic =(l,p)=>
{
  let pic = l.querySelector('img');
  if (p.metadata?.picture && it.s.trusted(p.trust))
  {
    if (!pic) 
    {
      pic = it.mk.l('img',{cla:'picture'});
      l.append(pic);
      l.classList.add('has-picture');
    }
    let src = p.metadata.picture.trim();
    if (!pic.src||pic.src!==src) pic.src = src;
  } 
  else if (pic) 
  {
    l.removeChild(pic);
    l.classList.remove('has-picture');
  }
};

author.follows =(xpub)=>
{
  let ak = aa.p[aka.o.ls.xpub];
  if (ak && ak.extradata.bff.length)
  {
    if (ak.extradata.bff.includes(xpub)) return true;
    else return false;
  }
  // else v_u.log('no bff found to check');
};

aka.follow =async s=>
{
  // console.log(s);
  if (!aka.o.ls.xpub) 
  {
    v_u.log('no aka found, set one first')
    return false;
  }
  cli.fuck_off();
  
  const a = s.trim().split(',');
  let p_tag = ['p'],k,relay,petname;
  
  if (a.length) k = a.shift().trim();
  if (!k) return false;
  if (k.startsWith('npub')) k = it.fx.decode(k);
  if (!it.s.key(k)) {console.log('invalid key to follow',k);return false}
  if (author.follows(k)) {console.log('already following',k);return false}
  p_tag.push(k);

  if (a.length) 
  {
    relay = a.shift().trim();
    let url = it.s.url(relay);
    if (url) p_tag.push(url.href);
    else p_tag.push('')
  }

  if (a.length) 
  {
    petname = a.shift().trim();
    p_tag.push(it.fx.an(petname));
  }
  
  let caution;
  let dat_k3 = await author.get_k3();
  if (dat_k3)
  {
    const new_follows = [...dat_k3.event.tags,p_tag];
    it.confirm(
    {
      description: 'new follow list',
      l:kin.tags(new_follows),
      scroll:true,
      no(){},
      yes()
      {
        const event = 
        {
          pubkey:aka.o.ls.xpub,
          kind:3,
          created_at:it.tim.now(),
          content:dat_k3.event.content,
          tags:new_follows
        };
        event.id = it.fx.hash(event);
        aa.f_it(event).then(e=>{console.log('sent')});
      }
    });
  }
  else v_u.log('no k3 found, create one first')
};

aka.ufo =(s)=>
{
  // aka.score(k+' 0');
};

aka.unfollow =async s=>
{
  console.log('unfollows',s)
  if (!aka.o.ls.xpub) 
  {
    v_u.log('no aka found, set one first')
    return false;
  }
  
  let dat_k3 = await author.get_k3(p.xpub);
  if (!dat_k3) return false;
  
  cli.fuck_off();
  let keys_to_unfollow = s.trim().split(' ');
  let new_follows = [...dat_k3.event.tags];
  const old_len = new_follows.length;
  let ul = it.mk.l('ul',{cla:'list removed_tags'});
  for (k of keys_to_unfollow)
  {
    if (k.startsWith('npub')) k = it.fx.decode(k);
    if (it.s.x(k)) 
    {

      ul.append(it.mk.l('li',{con:k,cla:'disabled'}));
      new_follows = new_follows.filter(p=>p[1]!==k);
      aka.score(k+' 0');
    }
    else v_u.log('invalid pubkey to unfollow')
  }

  if (new_follows.length)
  {
    const l = it.mk.l('div',{cla:'wrap'});
    l.append(kin.tags(new_follows),ul);
    // console.log(new_follows);
    it.confirm(
    {
      description:'new follow list:'+old_len+'->'+new_follows.length,
      l:l,
      scroll:true,
      no(){},
      yes()
      {
        const event = 
        {
          pubkey:aka.o.ls.xpub,
          kind:3,
          created_at:it.tim.now(),
          content:dat_k3.event.content,
          tags:new_follows
        };
        event.id = it.fx.hash(event);
        aa.f_it(event).then(e=>{console.log('sent')});
      }
    });
  }
};

aka.md =()=>
{
  const md = aa.p[aka.o.ls.xpub].metadata;
  if (md) cli.v(localStorage.ns+' u smd '+JSON.stringify(md));
};

aka.smd =s=>
{
  cli.fuck_off();
  
  let md = it.parse.j(s);
  if (md)
  {
    console.log(md);
    it.confirm(
    {
      description:'new metadata',
      l:it.mk.ls({ls:md}),
      yes()
      {
        const event = 
        {
          pubkey:aka.o.ls.xpub,
          kind:0,
          created_at:it.tim.now(),
          content:JSON.stringify(md),
          tags:[]
        };
        event.id = it.fx.hash(event);
        aa.f_it(event).then(e=>{console.log(e)});
      }
    });
  }
};

aka.score =async s=>
{
  let [xpub,score] = s.trim().split(' ');
  score = parseInt(score);
  if (it.s.x(xpub) && Number.isInteger(score))
  {
    cli.fuck_off();
    const p = await aa.db.get_p(xpub);
    console.log(p,score);
    p.trust = score;    
    author.update(author.profile(p),p,true);
    author.save(p);
  }
  else v_u.log('invalid data to score')
};

aka.react =async s=>
{
  let [xid,reaction] = s.trim().split(' ');
  if (it.s.x(xid) && it.s.one(reaction))
  {
    cli.fuck_off();
    
    const event = 
    {
      pubkey:aka.o.ls.xpub,
      kind:7,
      created_at:it.tim.now(),
      content:reaction,
      tags:[]
    };

    let reply_dat = aa.e[xid];
    if (!reply_dat) reply_dat = await aa.db.get_e(xid);
    if (reply_dat)
    {
      const reply_e = aa.e[xid].event;
      event.tags.push(...it.get_tags_for_reply(reply_e));
    } 
    event.id = it.fx.hash(event);
    aa.f_it(event).then(e=>{console.log(e)});
  }
  else v_u.log('invalid data to score')
};

author.process =async xpub=>
{
  let p = await aa.db.get_p(xpub);
  if (p)
  {
    if (p.pastdata.k3.length)
    {
      const k3_id = p.pastdata.k3[0][0];
      const k3 = await aa.db.get_e(k3_id);
      const k3_tags = k3.event.tags;
      author.k3(k3_tags,xpub);
    }
    if (p.pastdata.k10002.length)
    {
      const k10002_id = p.pastdata.k10002[0][0];
      const k10002 = await aa.db.get_e(k10002_id);
      const k10002_tags = k10002.event.tags;
      console.log(k10002_tags);
    }
  }
};

author.process_bff =(xpub=false)=>
{
  if (!xpub) xpub = aka.o.ls.xpub;
  const bff = aa.p[xpub]?.extradata.bff;
  for (const x of bff) author.process(x);
};