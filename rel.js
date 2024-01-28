const rel = 
{
  def:{id:'rel',ls:{},sets:['read','write'],r:'read',w:'write'}, 
  active:{},
};

rel.load =(e)=>
{
  aa.ct.rel = 
  {
    'add': 
    {
      required:['url'], 
      optional:['set'], 
      description:'add or replace relays',
      exe:rel.add
    },
    'sets':
    {
      required:['set','url'],
      description:'create sets of relays',
      oto:rel.ls,
      exe:rel.sets
    },
    'rm':
    {
      required:['url'], 
      description:'remove relay',
      oto:rel.ls,
      exe:rel.rm
    },
    'setrm':
    {
      required:['set'],
      optional:['url'],
      description:'remove set from relays',
      oto:rel.ls,
      exe:rel.set_rm
    },
    'ext':
    {
      description:'get relays from extension',
      exe:rel.ext
    }
  };
  aa.load_mod(rel).then(rel.start);
}

rel.start =(mod)=>
{
  let up;
  if (!mod.o.r) 
  {
    mod.o.r = 'read';
    up = true;
  }
  if (!mod.o.w) 
  {
    mod.o.w = 'write';
    up = true;
  }
  if (up) rel.save()
};

rel.save =()=>
{
  aa.save(rel);
};

rel.upd_state =url=>
{
  const relay = rel.active[url];
  if (relay)
  {
    let l = document.getElementById(it.fx.an(url));
    if (l)
    {
      setTimeout(()=>
      {
        l.dataset.state = relay.ws.readyState;
        l.dataset.q = Object.keys(relay.q);
      },100);
    }
    
  }
  
}

rel.c_on =async(url,o=false)=> 
{
  let relay = rel.active[url] ? rel.active[url] : rel.active[url] = {q:{},cc:[]};
  if (relay.ws?.readyState !== 1)
  {
    if (relay.fc) delete relay.fc;
    if (o)
    {
      if (o.req?.length) relay.q[o.req[1]] = o;
      if (o.send?.length) relay.send = o.send;
    }
    
    relay.ws = new WebSocket(url);
    relay.ws.onopen = rel.on_open;
    relay.ws.onclose = rel.on_close;
    relay.ws.onmessage = rel.on_message;
  }
};

rel.mk =(u,o) =>
{
  const l = rel.mk_item(u,o);
  if (l)
  {
    l.append(it.mk.l('button',
    {
      cla:'rm',
      con:'rm',
      clk:e=>
      {
        const url = e.target.parentNode.querySelector('.url').innerText;
        cli.t.value = localStorage.ns + ' rel rm ' + url;
        cli.foc();
      }
    }));
    return l
  }
  else return false
};

rel.mk_item =(u,o)=>
{
  u = it.s.url(u);
  if (u) 
  {
    const l = it.mk.l('li',{id:it.fx.an(u.href),cla:'item relay'});
    l.dataset.state = 0;
    const url_l = it.mk.l('p',{cla:'url'});
    url_l.append(
      it.mk.l('span',{cla:'protocol',con:u.protocol+'//'}),
      it.mk.l('span',{cla:'host',con:u.host}),
      it.mk.l('span',{cla:'pathname',con:u.pathname}),
      it.mk.l('span',{cla:'hashsearch',con:u.hash+u.search})
    );
    
    if (o.sets && o.sets.length) l.dataset.sets = o.sets;    
    l.append(url_l);
    return l
  }
  return false
};

rel.add =s=>
{ 
  const work =(a)=>
  {
    let url_string = a.shift();
    
    const u = it.s.url(url_string);
    if (u && !rel.o.ls[u.href])
    {
      rel.o.ls[u.href] = {sets:[]};
      for (const set of a) rel.o.ls[u.href].sets.push(set)
    }
  };
  it.loop(work,s,rel.save);
  cli.clear();
};

rel.rm =s=>
{
  const work =a=>
  {
    for (let url of a)
    {
      url = it.s.url(url);
      if (url)
      {
        if (rel.o.ls[url.href])
        {
          if (rel.active[url.href])
          {
            rel.force_close([url.href]);
            delete rel.active[url.href];
          }
          delete rel.o.ls[url.href]
        }
      }
    }
  };

  it.loop(work,s,rel.save);
  cli.clear();
};

rel.close =(k,id)=>
{
  rel.active[k].ws.send(JSON.stringify(['CLOSE',id]));
  delete rel.active[k].q[id];
  setTimeout(()=>{rel.upd_state(k)},100);
};

rel.resume =()=>
{
  for (const url in rel.active) { rel.c_on(url) }
};

rel.sets =s=>
{
  const work =a=>
  {
    const set_id = a.shift();
    if (it.s.an(set_id)) 
    {
      for (let url of a)
      {
        url = it.s.url(url);
        if (url)
        {
          if (!rel.o.ls[url.href].sets) rel.o.ls[url.href].sets = [];
          it.a_set(rel.o.ls[url.href].sets,[set_id]);
        }
      }
      if (!rel.o.sets) rel.o.sets = [];
      it.a_set(rel.o.sets,set_id);
    }
  };

  it.loop(work,s,rel.save);
  cli.clear();
};

rel.set_rm =s=>
{
  const work =a=>
  {
    const set_id = a.shift();
    if (it.s.an(set_id)) 
    {
      for (let url of a)
      {
        url = it.s.url(url);
        if (url)
        {
          let r = rel.o.ls[url.href];
          if (r && r.sets.includes(set_id))
          {
            r.sets = r.sets.filter(set=> set !== set_id)
          }
        }
      }
    }
  };
  it.loop(work,s,rel.save);
  cli.clear();
};

rel.in_set =relset=>
{
  let relays = [];
  for (const k in rel.o.ls)
  { 
    if (rel.o.ls[k].sets.includes(relset)) relays.push(k)
  }
  if (!relays.length) relays = false;
  return relays
};

rel.ext =()=>
{
  if (window.nostr) 
  {
    window.nostr.getRelays().then(rel.from_ext);
  } else v_u.log('no extension found, make sure it is enabled.')
};

rel.from_ext =(relays)=>
{
  let a = [];
  for (const rl in relays)
  {
    let s = rl+' ext';
    if (relays[rl].read) s += ' read';
    if (relays[rl].write) s += ' write';
    a.push(s);
  }
  if (a.length) rel.add(a.join(','));
  v_u.log(localStorage.ns+' rel ext: '+a.length+' added');
};

rel.from_k3 =(content)=>
{
  let relays;
  if (content.length > 3)
  {
    try { relays = JSON.parse(content)}
    catch (er) { console.log(er)}
  }
  console.log(relays)
  return relays
};

rel.add_from_k3 =(relays,p)=>
{
  if (relays)
  {
    if (!p.rels) p.rels = {};
    for (let url in relays)
    {
      const dis = it.s.url(url);
      if (dis)
      {
        let relay = p.rels[dis.href];
        if (!relay) relay = p.rels[dis.href] = {sets:[]};
        if (relays[url].read === true) it.a_set(relay.sets,['read']);
        if (relays[url].write === true) it.a_set(relay.sets,['write']);
        it.a_set(relay.sets,['k3']);
      }
    }
  }
};

rel.add_from_k10002 =(tags,p)=>
{
  if (!p.rels) p.rels = {};
  for (const tag of tags)
  {
    const [type,url,permission] = tag;
    const dis = it.s.url(url);
    if (dis)
    {
      let relay = p.rels[dis.href];
      if (!relay) relay = p.rels[dis.href] = {sets:[]};
      if (permission === 'read') it.a_set(relay.sets,['read']);
      else if (permission === 'write') it.a_set(relay.sets,['write']);
      else it.a_set(relay.sets,['read','write']);
      it.a_set(relay.sets,['k10002']);
    }
  }
};

rel.on_open =async e=>
{
  let relay = rel.active[e.target.url];
  for (const sub_id in relay.q)
  {
    let sub = relay.q[sub_id];
    if (sub?.eose !== 'done')
    {
      if (sub.stamp)
      {
        let filters_i = 2;
        // console.log(sub);
        while (filters_i < sub.req.length)
        {
          sub.req[filters_i].since = sub.stamp + 1;
          filters_i++;
        }
      }
      relay.ws.send(JSON.stringify(sub.req));
    }
  }
  if (relay.send?.length) 
  {
    for (const ev of relay.send) 
    {
      console.log(ev)
      relay.ws.send(ev)
    }
  }
  rel.upd_state(e.target.url);
};

rel.on_close =async e=>
{
  const rl = e.target.url;
  let relay = rel.active[rl];
  rel.upd_state(e.target.url);
  
  if (!relay.fc) 
  {
    let cc = relay.cc;
    const fails = cc.unshift(Math.floor(e.timeStamp));
    // reconnect if somewhat stable
    if (cc[1] && cc[0] - cc[1] > 99999 || fails < 21) 
    {  
      setTimeout(()=>{ rel.c_on(rl) }, 420 * fails)
    }
  } else v_u.log(rl+' closed');
};

rel.on_message =e=>
{
  const err = ()=> { v_u.log('invalid data from '+e.target.url) };

  let a;
  try{ a = JSON.parse(e.data) }
  catch(er){ err() }
  if (a && Array.isArray(a))
  {
    let type = a[0].toLowerCase();
    if (kin.hasOwnProperty(type)) kin[type]({data:a,origin:e.target.url});
    else err();
  }
  else err();
};

rel.force_close =(a=[])=>
{
  for (const rl of a)
  {
    let relay = rel.active[rl];
    if (relay && relay.ws)
    {
      relay.fc = true; 
      relay.ws.close(); 
      delete relay.ws;
    }
  }
};