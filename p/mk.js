// make all other profile sections after metadata
aa.mk.extradata =p=>
{
  const extradata = aa.mk.l('section',{cla:'extradata'});
  const mk_item =(k)=>
  {
    let v = p[k];
    if (v)
    {
      let item = aa.mk.item(k,v,'p');
      item.classList.add('p_item');
      extradata.append(item);
    }
  };

  if (p.petnames.length) mk_item('petnames');
  
  if (Object.keys(p.relays).length)
  {
    let relays = aa.mk.l('ul',{cla:'relays list'});
    for (const url in p.relays) relays.append(aa.mk.server(url,p.relays[url]));
    let l = aa.mk.details('relays',relays);
    l.classList.add('p_item');
    extradata.append(l);
  }

  if (p.follows.length)
  {
    let follows = aa.p.authors_list(p.follows,'follows');
    let l = aa.mk.details('follows',follows);
    l.classList.add('p_item');
    extradata.append(l);
  }

  if (p.followers.length)
  {
    let followers = aa.p.authors_list(p.followers,'followers');
    let l = aa.mk.details('followers',followers);
    l.classList.add('p_item');
    extradata.append(l);
  }

  if (p.mints?.length) mk_item('mints');
  if (p.p2pk?.length) mk_item('p2pk');

  mk_item('events');
  
  // for (const k of a)
  // {
  //   let id = k.slice(2);
  //   const v = p[id];
  //   // if (aa.mk.hasOwnProperty(k)) extradata.append(aa.mk[k](v,p));
  //   // else if (v) 
  //   // {
  //   //   let item = aa.mk.details(id,item)
  //   //   let item = aa.mk.item(id,v,'p');
  //   //   item.classList.add('p_item');
  //   //   extradata.append(item);
  //   // }
  //   if (v) 
  //   {
  //     let item = aa.mk.item(id,v,'p');
  //     item.classList.add('p_item');
  //     extradata.append(item);
  //   }
  // }
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
  l.addEventListener('click',e=>{e.preventDefault(); aa.p.check_nip05(v,p)});
  
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


// make p link
aa.mk.p_link =pubkey=>
{
  let p = aa.db.p[pubkey];
  if (!p) p = aa.p.p(pubkey);
  
  const l = aa.mk.l('a',
  {
    cla:'a author',
    tit:p.npub+', '+pubkey,
    ref:'#'+p.npub,
    clk:aa.clk.a,
    app:aa.mk.l('span',{cla:'name',con:p.npub.slice(0,12)})
  });
  
  aa.fx.color(pubkey,l);

  let o = aa.p.data(p);
  aa.p.link_data_upd(l,o.data);
  o.a.push(l);
  return l
};


// returns the profile of p
// creates the profile from p object if not found
aa.mk.profile =p=>
{
  let profile = [...aa.p.l.childNodes].find(i=>i.dataset.pubkey === p.pubkey);
  if (!profile)
  {
    profile = aa.mk.l('article',{cla:'profile',id:p.npub});
    profile.dataset.trust = p.score;
    profile.dataset.pubkey = p.pubkey;
    profile.dataset.updated = p.updated ?? 0;

    profile.append(
      aa.mk.profile_header(p),
      ' ',aa.mk.l('section',{cla:'metadata'}),
      ' ',aa.mk.l('section',{cla:'extradata'})
    );
    aa.fx.color(p.pubkey,profile);
    aa.p.l.append(profile);
    aa.fx.count_upd(document.getElementById('butt_p'));
  }
  return profile
};


// make profile header
aa.mk.profile_header =(p)=>
{
  const pubkey = aa.mk.l('p',{cla:'pubkey'});
  pubkey.append(
    aa.mk.p_link(p.pubkey),
    ' ',aa.mk.l('p',{cla:'actions empty',app:aa.mk.butt(['…','pa'])}),
    ' ',aa.mk.l('span',{cla:'pub',con:p.pubkey}),
    ' ',aa.mk.time(p.updated)
  );
  return pubkey
};