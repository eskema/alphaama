// author link for header
aa.mk.author_link =(pubkey,p)=>
{
  return aa.mk.l('div',
  {
    cla:'p_link',
    app:
    [
      aa.mk.p_link(pubkey,p),
      ' ',
      aa.mk.l('span',
      {
        cla:'actions empty',
        app:aa.mk.butt_clk(['…','pa'])
      })
    ]
  })
};

aa.mk.profile_data =p=>
{
  const l = aa.mk.l('section',{cla:'profile_data'});
  let keys = Object.keys(p);
  for (const k of keys)
  {
    let excl = 
    [
      'npub',
      'petname',
      'pubkey',
      'relay',
      'score',
      'updated',
      'verified',
      'xpub',
    ];
    if (k && !excl.includes(k)) 
    {
      let v = p[k];
      let item;
      if (Object.hasOwn(aa.mk,k)) 
      {
        item = aa.mk.l('p',{cla:`item item_${k}`,app:aa.mk[k](k,v,p)});
      }
      else item = aa.mk.item(k,v,{tag_name:'p'});
      if (k === 'metadata') l.prepend(item,' ');
      else l.append(item,' ');
    }
  }
  return l
};


// make all other profile sections after metadata
aa.mk.extradata =p=>
{
  let keys = [
    'events',
    'follows',
    'followers',
    'nprofiles',
    'petnames',
    'relays',
    'sets',
  ];

  // const exc = ['metadata','pubkey','xpub','npub','verified'];
  // const keys = Object.keys(p).filter(i=>!exc.includes(i));
  let app = new DocumentFragment();
  for (const k of keys) app.append(aa.mk.item(k,p[k]));

  return aa.mk.l('section',{cla:'extradata',app});
};


// make metadata section
aa.mk.metadata =(key,value,p)=>
{
  const ul = aa.mk.l('div',{cla:key+' list'});

  for (const k in value)
  {
    let v = value[k];
    if (!v) v = '';
    if (v && typeof v === 'string') v.trim();
    let kk = key+'_'+k;
    
    let l;
    if (aa.mk.hasOwnProperty(kk)) 
    {
      l = aa.mk[kk](k,v,p)
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
  
  let metadata = aa.mk.details(key,ul,1);
  return metadata
};


aa.mk.metadata_about =(k,v)=> aa.mk.l('p',{app:aa.e.content(v)});


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
  l.addEventListener('click',e=>{e.preventDefault(); aa.p.check_nip05(v,p)});
  
  return l
};

aa.mk.metadata_picture =(cla,src,p)=>
{
  if (aa.fx.is_trusted(p.score) && src)
  {
    let img = aa.mk.l('img',{src});
    img.addEventListener('click',e=>
    {e.target.classList.toggle('expanded')});
    return img;
  }
  else return aa.mk.l('p',{cla,con:src});
};

aa.mk.metadata_website =(k,v)=> 
{
  let link = aa.mk.link(v);
  link.classList.remove('content_link');
  return link
};


// make p link
aa.mk.p_link =(pubkey,p)=>
{
  if (!p) p = aa.db.p[pubkey];
  if (!p) 
  {
    p = aa.p.p(pubkey);
  }

  const element = aa.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+', '+pubkey,
    ref:'#'+p.npub,
    clk:aa.clk.a,
    app:aa.mk.l('span',{cla:'name',con:p.npub.slice(0,12)})
  });
  
  aa.fx.color(pubkey,element);

  aa.p.data(p).then(dis=>
  {
    dis.elements.push(element);
    aa.p.data_link_upd(element,dis.data);
  });

  return element
};


// returns the profile of p
// creates the profile from p object if not found
aa.mk.profile =p=>
{
  let profile = aa.p.profiles.get(p.pubkey);
  if (profile) return profile;
  
  profile = aa.mk.l('article',
  {
    cla:'profile',
    id:p.npub,
    dat:
    {
      trust: p.score,
      pubkey: p.pubkey,
      updated: p.updated || 0
    },
    app:[aa.mk.profile_header(p),' ']
  });

  aa.p.profiles.set(p.pubkey,profile);
  setTimeout(()=>
  {
    aa.fx.color(p.pubkey,profile);
    fastdom.mutate(()=>{aa.p.l.append(profile)});
    aa.fx.count_upd(aa.el.get('butt_section_p'))
  },200);
  
  return profile
};




aa.mk.profile_header =p=>
{
  const pubkey = aa.mk.l('p',{cla:'pubkey'});
  pubkey.append(
    aa.mk.author_link(p.pubkey),
    ' ',aa.mk.l('span',{cla:'pub',con:p.pubkey}),
    ' ',aa.mk.time(p.updated)
  );
  return pubkey
};


aa.mk.relays =(k,v)=>
{
  let ul = aa.mk.l('ul',{cla:k+' list'});
  for (const url in v) ul.append(aa.mk.server(url,v[url]));
  return aa.mk.details(k,ul);
};


aa.mk.follows =(k,v,p)=>
{
  let l = aa.p.authors_list(v,k);
  return aa.mk.details(k,l);
}


aa.mk.followers = aa.mk.follows;