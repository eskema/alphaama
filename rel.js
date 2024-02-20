const rel = 
{
  def:{id:'rel',ls:{},r:'read',w:'write'}, 
  // def:{id:'rel',ls:{},sets:['read','write'],r:'read',w:'write'}, 
  active:
  {
    // url:{q:[],cc:[],...}
  },
  sn:'r'
};

rel.load =e=>
{
  let sn = rel.sn;
  aa.ct[sn] = 
  {
    'add': 
    {
      action:[sn,'add'],
      required:['url'], 
      optional:['set'], 
      description:'add or replace relays',
      exe:rel.add
    },
    'rm':
    {
      action:[sn,'rm'],
      required:['url'], 
      description:'remove relay',
      // oto:rel.ls,
      exe:rel.rm
    },
    'sets':
    {
      action:[sn,'sets'],
      required:['set','url'],
      description:'create sets of relays',
      // oto:rel.ls,
      exe:rel.sets
    },
    'setrm':
    {
      action:[sn,'setrm'],
      required:['set'],
      optional:['url'],
      description:'remove set from relays',
      // oto:rel.ls,
      exe:rel.set_rm
    },
    'ext':
    {
      action:[sn,'ext'],
      description:'get relays from extension',
      exe:rel.ext
    },
    'list':
    {
      action:[sn,'list'],
      required:['set'],
      description:'loads relay list from set to mklist',
      exe:rel.list
    },
    'mklist':
    {
      action:[sn,'mklist'],
      description:'create a relay list (kind-10002)',
      exe:rel.mklist
    },
  };
  aa.actions.push(
    aa.ct[sn].add,
    aa.ct[sn].rm,
    aa.ct[sn].sets,
    aa.ct[sn].setrm,
    aa.ct[sn].ext,
    aa.ct[sn].list,
    aa.ct[sn].mklist,
  );
  aa.load_mod(rel).then(rel.start);
}

rel.start =mod=>
{
  it.mk.mod(mod);
  
  let changed;
  if (!mod.o.r) 
  {
    mod.o.r = 'read';
    changed = true;
  }
  if (!mod.o.w) 
  {
    mod.o.w = 'write';
    changed = true;
  }
  if (changed) rel.save()
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
        console.log('rel.upd_state '+url,l.dataset.state,l.dataset.q);
      },100);
    }
    else console.log('rel.upd_state '+url,'no relay l found')
  }
};

rel.c_on =async(url,o=false)=> 
{
  if (localStorage.mode === 'lockdown') 
  {
    v_u.log('mode:lockdown');
    return false;
  }

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
        cli.t.value = localStorage.ns + ' r rm ' + url;
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
    let url_string = a.shift().trim();
    
    const url = it.s.url(url_string)?.href;
    if (url)
    {
      if (!rel.o.ls[url]) rel.o.ls[url] = {sets:[]};
      it.a_set(rel.o.ls[url].sets,a);
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
  let relay = rel.active[k];
  if (relay)
  {
    if (relay.ws?.readyState === 1) relay.ws.send(JSON.stringify(['CLOSE',id]));
    delete rel.active[k].q[id];
    setTimeout(()=>{rel.upd_state(k)},100);
  }
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
      // if (!rel.o.sets) rel.o.sets = [];
      // it.a_set(rel.o.sets,[set_id]);
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
  return relays
};

rel.ext =async()=>
{
  return new Promise(resolve=>
  {
    if (window.nostr) 
    {
      window.nostr.getRelays().then(r=>
      {
        rel.add_to_aka(rel.from_o(r,['ext']));
        resolve('rel ext done');
      });
    } 
    else 
    {
      v_u.log('no extension found, make sure it is enabled.');
      resolve('rel ext done');
    }
  });
};

rel.add_to_aka =(relays)=>
{
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) rel.add(a.join(','));
  v_u.log(a.length+' relays added');
};

rel.add_to_p =(relays,p)=>
{
  if (!p.rels) p.rels = {};
  for (const relay in relays)
  {
    if (!p.rels[relay]) p.rels[relay] = relays[relay]
    else it.a_set(p.rels[relay].sets,relays[relay].sets);
  }
};

rel.from_o =(relays,sets=false)=>
{
  let rels = {};
  for (let url in relays)
  {
    const href = it.s.url(url)?.href;
    if (href)
    {
      rels[href] = {sets:[]};
      if (relays[url].read === true) it.a_set(rels[href].sets,['read']);
      if (relays[url].write === true) it.a_set(rels[href].sets,['write']);
      if (Array.isArray(sets)) it.a_set(rels[href].sets,sets);
    }
  }
  return rels
}

rel.from_tags =(tags,sets=false)=>
{
  let relays = {};
  for (const tag of tags)
  {
    const [type,url,permission] = tag;
    const href = it.s.url(url)?.href;
    if (href)
    {
      let relay = relays[href] = {sets:[]};
      if (permission === 'read') it.a_set(relay.sets,[...sets,'read']);
      else if (permission === 'write') it.a_set(relays.sets,[...sets,'write']);
      else it.a_set(relay.sets,[...sets,'read','write']);
    }
  }
  return relays
}

rel.list =s=>
{
  s = s.trim();
  let relays = [];
  for (const k in rel.o.ls)
  { 
    if (rel.o.ls[k].sets.includes(s))
    {
      let read, write;
      const tag = ['r',k];
      if (rel.o.ls[k].sets.includes('read')) read = true;
      if (rel.o.ls[k].sets.includes('write')) write = true;
      if (read && !write) tag.push('read');
      if (!read && write) tag.push('write');
      relays.push(tag.join(' '))
    } 
  }
  cli.v(localStorage.ns+' r mklist '+relays.join(','));
};

rel.mklist =s=>
{
  cli.fuck_off();
  s = s.trim().split(',');
  const relays = [];
  for (const r of s) relays.push(r.split(' '))
  if (relays.length)
  {
    it.confirm(
    {
      description:'new relay list',
      l:kin.tags(relays),
      yes()
      {
        const event = 
        {
          pubkey:aka.o.ls.xpub,
          kind:10002,
          created_at:it.tim.now(),
          content:'',
          tags:relays
        };
        event.id = it.fx.hash(event);
        // console.log(event);
        aa.f_it(event)
        // .then(e=>
        // {
        //   console.log(e);
        // });
      }
    });
    // console.log(it.mk.ls({ls:md}))
  }
};

rel.try =(relay,dis)=>
{
  if (relay.ws.readyState === 1) relay.ws.send(dis);
  else 
  {
    if (!relay.failed_cons) relay.failed_cons = 1; 
    relay.failed_cons = relay.failed_cons++;
    if (relay.failed_cons < 10) setTimeout(()=>{rel.try(relay,dis)},500)
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

      rel.try(relay,JSON.stringify(sub.req))
    }
  }
  if (relay.send?.length) for (const ev of relay.send) rel.try(relay,ev);
  rel.upd_state(e.target.url);
};

rel.on_close =async e=>
{
  const rl = e.target.url;
  let relay = rel.active[rl];
  rel.upd_state(e.target.url);
  
  if (relay && !relay.fc) 
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

  let a = it.parse.j(e.data);
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