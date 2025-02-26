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


// make follows
aa.mk.p_follows =(a,p)=>
{
  let al = aa.p.authors_list(a,'follow');
  const butt_follows = aa.mk.butt(['refresh follows','p_follows']);
  let follows_details = aa.mk.details('follows ('+a.length+')',butt_follows);
  follows_details.classList.add('p_item');
  // let ul = aa.p.authors_list(a,'follow');
  follows_details.append(al);
  // aa.p.author_list(a,ul);
  if (p?.events.k3?.length) 
    butt_follows.dataset.last = aa.fx.time_display(p.events.k3[0][1]);
  return follows_details;
};



// make followers
aa.mk.p_followers =(a,p)=>
{
  let al = aa.p.authors_list(a,'followers');
  let followers_details = aa.mk.details('followers ('+a.length+')', al);
  followers_details.classList.add('p_item');

  return followers_details
};


// make p link
aa.mk.p_link =(x)=>
{
  let p = aa.db.p[x];
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

  let o = aa.p.data(p);
  aa.p.link_data_upd(l,o.data);
  o.a.push(l);

  return l
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