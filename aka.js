const aka = 
{
  def:{id:'aka',ls:{}}
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
  aa.ct.aka = 
  {
    'set': 
    {
      required:['id'], 
      description:'set aka, can be hex or npub',
      exe:aka.add
    },
    'rm':
    {
      description:'remove aka',
      exe:aka.rm
    },
    'ext':
    { 
      description:'get aka from extension',
      exe:aka.ext
    },
    'follow': 
    {
      required:['id'], 
      optional:['relay','petname'], 
      description:'follow account (can be hex or npub)',
      exe:author.follow
    },
    'unfollow': 
    {
      required:['id'], 
      description:'unfollow account (can be hex or npub)',
      exe:author.unfollow
    },
    'score': 
    {
      required:['id','number'], 
      description:'set user score',
      exe:author.score
    },
  };
  
  aa.load_mod(aka).then(aka.start);
};

aka.start =async mod=>
{
  let ls = mod.o.ls;
  if (ls.xpub)
  {
    v_u.log('aka xpub '+ls.xpub);
    v_u.log('aka npub '+ls.npub);
    
    let butt_u = document.getElementById('butt_u');
    if (butt_u)
    {
      it.fx.color(ls.xpub,butt_u);
      butt_u.textContent = ls.xpub.substr(0,3);
    }
    let p = await aa.db.get_p(ls.xpub);
    let updd;
    console.log(p);
    if (p.trust < 9) 
    {
      p.trust = 9;
      updd = true;
    }
    if (it.a_set(p.sets,['aka'])) updd = true;
    if (butt_u) author.pic(butt_u,p);
    if (!p.pastdata.k0.length) v_u.log('aka !metadata');
    if (!p.pastdata.k3.length) v_u.log('aka !bffs');
    else 
    {
      aka.load_bff(p);
    }
    author.profile(p);
    if (updd) author.save(p);
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
      if (!aa.p[x]) aa.p[x] = author.p(x);
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
  if (window.nostr) 
  {
    cli.fuck_off();
    window.nostr.getPublicKey().then(aka.set);
  } 
  else v_u.log("no extension found, make sure it's enabled");
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

author.p =xpub=>
{
  return {
    xpub:xpub,
    relay:'',
    petname:'',
    npub: it.fx.npub(xpub),
    trust:0,
    updated:0,
    verified:[], // [result,date]
    sets:[],
    rels:{},
    extradata:
    {
      bff:[],
      relays:[],
      followers:[],
      petnames:[],
      lists:[],
    },
    pastdata: //[[id,created_at],...]
    { 
      k0:[],
      k3:[],
      k10002:[],
    },
  }
};

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
        let profile = document.getElementById(p.npub);
        if (!profile) profile = author.profile(p);
        author.update(profile,p,true);
      }
    });
  },1000,q_id);
};

author.get_k3 =async(xpub)=>
{
  let k3_id;
  const p = xpub ? aa.p[xpub] : aa.p[aka.o.ls.xpub];
  if (p && p.pastdata.k3) k3_id = p.pastdata.k3[0][0];
  if (k3_id) 
  {
    return await aa.db.get_e(k3_id);
  }
  else v_u.log('no k3 found');
  return false
};

author.process_k3_tags =(tags,x)=>
{
  const is_aka = aka?.o.ls.xpub === x;
  const to_upd = [];
  for (const tag of tags)
  {
    let updd;
    const [type,xpub,relay,petname] = tag;
    if (it.s.x(xpub))
    {
      let p = aa.p[xpub];
      if (!p) 
      {
        p = aa.p[xpub] = author.p(xpub);
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
    v_u.upd.butt_count('p','.profile');
  }
  return profile
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
  cli.v('.aa aka score '+xpub+' '+p.trust);
};

author.profile_butt_follow =async e=>
{
  const x = e.target.closest('.profile').dataset.xpub;
  const is_bff = e.target.classList.contains('is_bff');
  console.log(is_bff);
  if (is_bff)
  {
    // unfollow
    console.log('unfollow');
    cli.v('.aa aka unfollow '+x);
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
        if (!relays.length)
        {
          relays = [rels[0]]
        }
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
    else console.log('no k3')

    cli.v('.aa aka follow '+a.join(', '));
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
      it.mk.author(x).then(dis=>
      {
        l.append(it.mk.l('li',{cla:'bff',app:dis}));
      });
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

  // const butt_taglist = it.mk.l('button',
  // {
  //   cla:'butt taglist',
  //   con:'view tag list',
  //   clk:it.mk.taglist
  // });
  // bff_details.append(butt_taglist);

};

// it.mk.taglist =async e=>
// {
//   const xpub = e.target.closest('.profile').dataset.xpub;
//   const ul = e.target.parentElement.querySelector('ul');
//   ul.remove();
//   let k3 = await author.get_k3(xpub);
//   if (k3)
//   {
//     let tags = kin.tags(k3.event.tags);
//     e.target.parentElement.append(tags);
//   }
  
// };


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
    // profile.append(pubkey);
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
    
  it.mk.author(p.xpub,p).then(dis=>
  {
    pubkey.append(dis,it.mk.l('span',{cla:'xpub',con:p.xpub}))
  });

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

author.link =(l,p=false)=>
{
  // console.log('link');
  if (p && p.metadata)
  {
    if (p.metadata.name) 
    {
      let name = p.metadata.name.substr(0,100);
      let span = l.querySelector('span');
      if (span.textContent !== name) span.textContent = name;
    }
    author.pic(l,p);
    if (p.metadata.nip05) l.dataset.nip05 = p.metadata.nip05;
    
    if (author.follows(p.xpub)) l.classList.add('is_bff');
    else l.classList.remove('is_bff');
  }
  
};

author.pic =(l,p)=>
{
  let pic = l.querySelector('img');
  if (p.metadata?.picture)
  {
    if (!pic) 
    {
      pic = it.mk.l('img',{cla:'picture'});
      l.append(pic);
    }
    let src = p.metadata.picture.trim();
    if (!pic.dataset.src||pic.dataset.src!==src) pic.dataset.src = src;
    l.classList.add('has-picture');
    if (it.s.trusted(p.trust)) pic.src = pic.dataset.src
  } 
  else if (pic) l.removeChild(pic);
};

author.follows =(xpub)=>
{
  let ak = aa.p[aka.o.ls.xpub];
  if (ak && ak.extradata.bff.length)
  {
    if (ak.extradata.bff.includes(xpub)) return true;
    else return false;
  }
  else v_u.log('no bff found to check');
};

author.follow =async s=>
{
  console.log(s);
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
    if (it.s.an(petname)) p_tag.push(petname);
  }
    
  let dat_k3 = await author.get_k3();
  if (dat_k3)
  {
    const dialog = document.getElementById('dialog');
    const dialog_butts = it.mk.l('p',{cla:'dialog_butts'});
    const confirm_dialog = it.mk.l('button',
    {
      con:'confirm',
      cla:'butt',
      clk:()=>
      {
        const event = 
        {
          pubkey:aka.o.ls.xpub,
          kind:3,
          created_at:it.tim.now(),
          content:dat_k3.event.content,
          tags:aka.k3_tags
        };
        event.id = it.fx.hash(event);
        aa.sign(event).then((signed)=>
        {
          console.log('signed',signed);
          aa.e[event.id] = dat = {event:signed,seen:[],subs:[],clas:[]};
          aa.print(dat);
          aa.db.upd(dat);
          q_e.broadcast(signed);
        });

        dialog.close();
        dialog.textContent = '';
      }
    });
    const close_dialog = it.mk.l('button',
    {
      con:'cancel',
      cla:'butt',
      clk:()=>
      {
        dialog.close();
        dialog.textContent = '';
      }
    });
    dialog_butts.append(close_dialog,confirm_dialog);
    const tags = [...dat_k3.event.tags,p_tag];
    aka.k3_tags = tags;
    dialog.append(dialog_butts,kin.tags(tags));
    dialog.showModal();
    dialog.scrollTop = dialog.scrollHeight;
    // if (window.confirm('new contacts length = '+len+'. you sure?'))
    // {
    //   tags.push(p_tag);

    //   console.log(tags)
    // }

    // if (dat_k3.event.content.length) 
    // console.log('has content',dat_k3.event.content.length)
    // const draft = 
    // {
    //   pubkey:aka.o.ls.xpub,
    //   kind:3,
    //   created_at:it.tim.now(),
    //   content:dat_k3.event.content,
    //   tags:tags
    // };
    // aa.draft(draft)
  }
  else v_u.log('no k3 found, create one first')
};

author.unfollow =async s=>
{
  console.log(s)
};

author.score =s=>
{
  const [xpub,score] = s.trim().split(' ');
  console.log(xpub,score);
};

author.process =async xpub=>
{
  let p = await aa.db.get_p(xpub);
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
};

author.process_bff =(xpub=false)=>
{
  if (!xpub) xpub = aka.o.ls.xpub;
  const bff = aa.p[xpub]?.extradata.bff;
  for (const x of bff) author.process(x);
};