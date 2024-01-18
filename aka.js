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
      aka.load_bff(p)
    }
    author.profile(p);
    if (updd) author.save(p);
  }
  else v_u.log('no aka')
};

aka.load_bff =async p=>
{
  if (p.extradata.bff.length)
  {
    let bffs = await aa.db.get({get_a:{store:'authors',a:p.extradata.bff}});
    for (const bff of bffs) aa.p[bff.xpub] = bff;
    for (const bff of bffs) author.profile(bff);
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
    npub:it.fx.npub(xpub),
    trust:0,
    updated:0,
    verified:[], // [result,date]
    sets:[],
    extradata:
    {
      bff:[],
      relays:[],
      relay_hints:[],
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
  aa.p[p.xpub] = p;
  aa.db.put({put:{store:'authors',a:[p]}});
};

author.get_k3 =async()=>
{
  let k3_id;
  const aka_pub = aa.p[aka.o.ls.xpub];
  if (aka_pub && aka_pub.pastdata.k3) k3_id = aka_pub.pastdata.k3[0][0];
  if (k3_id) 
  {
    const k3 = await aa.db.get_e(k3_id);
    return k3;
  }
  else v_u.log('no k3 found');
  return false;
};

author.k3 =(tags,x)=>
{
  let is_bff, is_aka = aka?.o.ls.xpub === x;
  if (!is_aka && aa.p[aka?.o.ls.xpub].extradata.bff.includes(x)) is_bff = true; 
  const bff = [];
  for (const tag of tags)
  {
    if (it.tag.p(tag)) 
    {
      const [type,xpub,relay,petname] = tag;
      bff.push(xpub);
      aa.db.get_p(xpub).then(p=>
      {
        let updd;

        if (!p.extradata.relay_hints) 
        {
          p.extradata.relay_hints = [];
          updd = true
        }

        if (relay)
        {
          if (it.a_set(p.extradata.relay_hints,[relay])) updd = true;
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
        if (is_aka)
        {
          if (p.trust === 0)
          {
            p.trust = 5;
            updd = true;
          }
          if (it.a_set(p.sets,['bff'])) updd = true;
        }
        else if (is_bff && it.a_set(p.sets,['ff'])) updd = true;
        
        if (updd) author.save(p);
      });
    }
  }
  return bff
};

author.get =async xpub=>
{
  return new Promise(resolve=>
  {
    if (!it.s.x(xpub) && xpub.startsWith('npub')) xpub = it.fx.decode(xpub);
    let dis = aa.p[xpub];
    if (!dis)
    {
      aa.db.cash.get('p',xpub).then(dat=>
      {
        if (!dat) dat = author.p(xpub);
        aa.p[xpub] = dat;
        resolve(dat)
      });
    }
    else resolve(dis)
  });
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
    const pubkey = it.mk.l('p',{cla:'pubkey'});
    profile.append(pubkey);
    
    const butt_score = it.mk.l('button',
    {
      cla:'butt score',
      con:p.trust,
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
      if (aka.o.ls.bff?.includes(p.xpub)) 
      {
        butt_follow.classList.add('is_bff');
        butt_follow.textContent = 'unfollow';
      }
      pubkey.append(butt_follow);
    }
    
    it.mk.author(p.xpub,p)
    .then(dis=>{pubkey.append(dis,it.mk.l('span',{cla:'xpub',con:p.xpub}))});

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
      console.log(p)
      if (p?.extradata.relays.length) 
      {
        url = it.s.url(p.extradata.relays[0]);
        if (url) a.push(url.href);
      }
      else a.push('');

      if (p?.metadata?.name)
      {
        a.push(it.fx.an(p.metadata.name));
      } 
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
  let relays_details = it.mk.details('relays ('+a.length+')',ul);
  extr.append(relays_details);

  if (a.length)
  {
    for (const item of a) 
    {
      ul.append(it.mk.l('li',{cla:'item relay',con:item}))
    }
  }

  const butt_relays = it.mk.l('button',
  {
    cla:'butt profile_relays refresh',
    con:'refresh relays',
    clk:author.profile_butt_relays
  });
  if (p.pastdata.k10002.length) butt_relays.dataset.last = it.tim.e(p.pastdata.k10002[0][1]);

  relays_details.append(butt_relays);
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



author.follow =async s=>
{
  console.log(s)
  
  if (!aka.o.ls.xpub) 
  {
    v_u.log('no aka found, setup one first')
    return false;
  }
  const a = s.trim().split(',');
  let p_tag = ['p'],k,relay,petname;
  if (a.length) 
  {
    k = a.shift().trim();
    if (k.startsWith('npub')) k = it.fx.decode(k);
    if (!it.s.key(k)) {console.log('invalid key');return false}
    p_tag.push(k);
    
    let dat_k3 = await author.get_k3();
    if (dat_k3)
    {
      console.log(dat_k3);
      const tags = dat_k3.event.tags;
      let is_following, len = tags.length;
      for (let i=0;i<len;i++)
      {
        if (tags[i][1] === k) is_following = [i,tags[i]];
      }
      if (is_following)
      {
        v_u.log('you already follow this');
        console.log('already following',is_following);
        return false;
      }
      else
      {
        const p = await aa.db.get_p(k);
        if (p) console.log(p);
        if (a.length) 
        {
          relay = a.shift().trim();
          let url = it.s.url(relay);
          if (url) p_tag.push(url.href);
          else 
          {
            if (p?.extradata.relays.length) 
            {
              url = it.s.url(p.extradata.relays[0]);
              if (url) p_tag.push(url.href);
            }
            else p_tag.push('')
          }
        }
        if (a.length) 
        {
          petname = a[0].trim();
          if (it.s.an(petname)) p_tag.push(petname);
          else if (p?.metadata?.name) p_tag.push(p.metadata.name);
        }

        console.log(p_tag);
        const c_len = tags.length +1;
        if (window.confirm('new contacts length = '+c_len+'. you sure?'))
        {
          tags.push(p_tag);
          console.log(tags)
        }

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
    }
    else 
    {
      v_u.log('no k3 found, create one first')
    }
  } 
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