const q_e =
{ 
  def:{id:'q_e',ls:{}},
  clk:{},
  sn:'q',
};

// q_e.upd =()=>{it.to(()=>{ aa.save(q_e) },2000,'qe_upd')};

q_e.load =()=>
{
  // aa.actions.push();
  let sn = q_e.sn;
  aa.ct[sn] = 
  {
    'add':
    {
      action:[sn,'add'],
      required:['fid','filter'],
      description:'add new filter',
      exe:q_e.add
    },
    'rm':
    {
      action:[sn,'rm'],
      required:['fid'],
      description:'remove one or more filters',
      exe:q_e.rm_filter
    },
    'sets':
    {
      action:[sn,'sets'],
      required:['set','sid'],
      optional:['fid'],
      description:'create sets of filters',
      exe:q_e.sets
    },
    'setrm':
    {
      action:[sn,'setrm'],
      required:['set'],
      optional:['fid'],
      description:'remove set from filter',
      exe:q_e.set_rm
    },
    'run':
    {
      action:[sn,'run'],
      required:['fid'],
      optional:['relset','options'],
      description:'run filter on relay set',
      exe:q_e.run
    },
    'raw':
    {
      action:[sn,'raw'],
      required:['relset','raw_filter'],
      description:'run raw filter on relay set',
      exe:q_e.raw
    },
    'close':
    {
      action:[sn,'close'],
      optional:['fid'],
      description:'stop all running filters or just one if provided',
      exe:q_e.close
    },
    'stuff':
    {
      action:[sn,'stuff'],
      description:'sets a bunch of queries to get you started',
      exe:q_e.stuff
    },
  };
  aa.actions.push(
    aa.ct[q_e.sn].add,
    aa.ct[q_e.sn].rm,
    aa.ct[q_e.sn].sets,
    aa.ct[q_e.sn].setrm,
    aa.ct[q_e.sn].run,
    aa.ct[q_e.sn].raw,
    aa.ct[q_e.sn].close,
    aa.ct[q_e.sn].stuff,
  );
  aa.load_mod(q_e).then(it.mk.mod);
};

q_e.stuff =()=>
{
  q_e.add('a {"authors":["aka"],"kinds":[0,3,10002]}');
  q_e.add('b {"authors":["bff"],"kinds":[0,3,10002]}');
  q_e.add('d {"#p":["aka"],"kinds":[4],"since":"n_2"}');
  q_e.add('f {"authors":["aka","bff"],"kinds":[1,6,7,16,30023],"since":"n_1"}');
  q_e.add('n {"#p":["aka"],"kinds":[1,4,6,7,16],"since":"n_1"}');
};

q_e.mk =(f_id,o) =>
{
  let sn = q_e.sn;
  f_id = it.fx.an(f_id);
  const l = it.mk.l('li',{id:'f_'+f_id,cla:'item filter'});
  if (o.sets && o.sets.length) l.dataset.sets = o.sets;    
  l.append(
    it.mk.l('button',{cla:'key',con:f_id,clk:e=>
    {
      cli.t.value = localStorage.ns+' '+sn+' run '+f_id;
      cli.foc();
    }}),
    // it.mk.l('span',{cla:'key',con:f_id}),
    it.mk.l('span',{cla:'val',con:o.v}),
    it.mk.l('button',{cla:'rm',con:'rm',clk:e=>
    {
      const filter = e.target.parentNode.querySelector('.key').innerText;
      cli.t.value = localStorage.ns+' '+sn+' rm ' + filter;
      cli.foc();
    }})
  );
  return l
};

q_e.demand =(request,relays,options)=>
{
  if (localStorage.mode === 'lockdown') 
  {
    v_u.log('mode:lockdown');
    return false;
  }

  if (request)
  {
    let filters = request.slice(2);
    for (const f of filters)
    {
      if (!it.fx.verify_filter(f)) 
      {
        v_u.log('demand failed, invalid filter: '+f);
        return false;
      }
    }

    let opts = {req:request};
    for (const opt in options) opts[opt] = options[opt];

    if (!relays && !relays.length) relays = rel.in_set(rel.o.r);
    if (!relays.length) return false;

    for (const k of relays)
    {
      let url = it.s.url(k)?.href;
      if (!url) 
      {
        v_u.log('invalid relay url: '+k);
        return false
      }

      const relay = rel.active[url];
      if (!relay)
      {
        if (!rel.o.ls[url])
        {
          // it.confirm(
          // {
          //   description:'fetch missing relay '+k+' from ?',
          //   yes(){},no(){},
          // })

          //    needs to display info from what npub

          if (window.confirm('fetch missing from relay '+url+'?'))
          {
            rel.add(url+' moar');
            rel.c_on(url,opts);
          }
          else rel.add(url+' off');
        }
        else if (!rel.o.ls[url].sets.includes('off')) rel.c_on(url,opts);
      }
      else 
      {
        if (!relay.ws || relay.ws.readyState === 3) rel.c_on(url,opts)
        else if (relay.ws.readyState === 1)
        {
          relay.q[request[1]] = opts;
          relay.ws.send(JSON.stringify(request));  
          rel.upd_state(k);
        }
      }
    }
  }
  else 
  {
    v_u.log('something wrong with demand:');
    v_u.log('check console for more info');
    console.log(request,relays,options);
  }
};

q_e.broadcast =(event,relays=false)=>
{
  if (localStorage.mode === 'lockdown') 
  {
    v_u.log('mode:lockdown');
    return false;
  }
  // ['EVENT', signed]
  const dis = JSON.stringify(['EVENT',event]);
  if (!relays || !relays.length) relays = rel.in_set(rel.o.w);
  if (relays && relays.length)
  {
    for (const k of relays)
    {
      const relay = rel.active[k];
      if (relay?.ws?.readyState === 1) relay.ws.send(dis);
      else
      {
        if (!rel.o.ls[k]) rel.add(k+' write');
        rel.c_on(k,{send:[dis]});
      }
    }
  }
};

q_e.sets =s=>
{
  const work =(a)=>
  { 
    const set_id = a.shift();
    if (it.s.an(set_id)) 
    { 
      for (const f_id of a)
      {
        let r = q_e.o.ls[f_id];
        if (r) 
        {
          if (!r.sets) r.sets = [];
          it.a_set(q_e.o.ls[f_id].sets,[set_id]);
        }
      }
    }
  };
  it.loop(work,s,()=>{aa.save(q_e)})
};

q_e.set_rm =(s)=>
{
  const work =(a)=>
  { 
    const set_id = a.shift();
    if (it.s.an(set_id)) 
    { 
      if (a.length)
      {
        for (const f_id of a)
        {
          let r = q_e.o.ls[f_id];
          if (r && r.sets) r.sets = it.a_rm(r.sets,[set_id]);
        }
      }
      else
      {
        for (const k in q_e.o.ls)
        {
          q_e.o.ls[k].sets = it.a_rm(q_e.o.ls[k].sets,[set_id]);
        }
      }
    }
  };
  it.loop(work,s,()=>{aa.save(q_e)})
};

q_e.sub =s=>
{   

};

q_e.add =s=>
{
  let a = s.trim().split(' ');
  let fid = it.fx.an(a.shift());
  a = a.join('').replace(' ','');
  let o = it.parse.j(a);
  if (o)
  {
    // console.log(o);
    let log = localStorage.ns+' q add '+fid+' ';
    let filter = q_e.o.ls[fid];
    let changed;
    if (filter && filter.v === a)
    {
      log += '=== is the same';
      // v_u.log(log+'=== is the same')
    }
    else if (filter)
    {
      log += filter.v+' > '+a;
      filter.v = a;
      changed = true;
    }
    else 
    {
      q_e.o.ls[fid] = {v:a,sets:[]};
      log += q_e.o.ls[fid].v;
      changed = true;
    }
    if (changed) aa.save(q_e);
    v_u.log(log);
    cli.fuck_off();
    
  }
  else v_u.log('invalid filter');
};

q_e.rm_filter =s=>
{
  let fid = s.trim();
  if (q_e.o.ls.hasOwnProperty(fid)) 
  {
    delete q_e.o.ls[fid];
    aa.save(q_e);
    cli.fuck_off();
    v_u.log('filter removed: '+fid);
  }
  else v_u.log(localStorage.ns+' '+q_e.sn+' '+fid+' not found')
};

q_e.raw =s=>
{
  let a = s.trim().split(' ');
  let rels = a.shift();
  let filter = a.join('').replace(' ',''); 
  if (rels && filter) 
  { 
    let [filtered,options] = it.fx.vars(filter);
    if (filtered)
    {
      let request = ['REQ','raw',filtered];
      let relays = [];
      let relay = it.s.url(rels)?.href;
      if (relay) relays.push(relay);
      else relays.push(...rel.in_set(rels));
      // else if (rel.o.sets.includes(rels)) relays.push(...rel.in_set(rels));
      if (relays.length)
      {
        v_u.log(localStorage.ns+' q  raw '+filter);
        console.log(request,relays,options);
        q_e.demand(request,relays,options);
      }
      else v_u.log('invalid relay / relset')
    }
    else v_u.log('invalid filter')
  } 
  else 
  {
    v_u.log(q_e.sn+' raw not ok');
    console.log(q_e.sn+' raw not ok',rels,filter)
  }
};

q_e.run =s=>
{
  console.log('run s');
  const a = s.trim().split(' ');
  let fid,relset;
  if (a.length) fid = a.shift();
  if (a.length) relset = a.shift();
  if (fid && q_e.o.ls.hasOwnProperty(fid)) 
  { 

    let [filtered,options] = it.fx.vars(q_e.o.ls[fid].v);
    let request;
    if (filtered) request = ['REQ',fid,filtered];
    
    let relays = rel.in_set(relset);
    if (!relays.length) relays = rel.in_set(rel.o.r);

    // console.log('qe run',request,relays,options);
    q_e.demand(request,relays,options);
    cli.fuck_off(localStorage.ns+' '+q_e.sn+' run '+fid);
  } 
  else v_u.log(q_e.sn+' run filter not found')
};

q_e.close =s=>
{
  let log = localStorage.ns+' '+q_e.sn+' close';
  let fids = s.trim().split(' ');

  for (const k in rel.active)
  {
    if (fids.length) 
    {
      for (const fid of fids)
      {
        if (rel.active[k].q[fid]) 
        {
          rel.close(k,fid);
          log += ' '+fid;
        }
      }
    }
    else 
    {
      for (const fid in rel.active[k].q) 
      {
        rel.close(k,fid);
        log += ' '+fid;
      }
    }
  }
  v_u.log(log)
};

q_e.req = {};

q_e.req.ids =(req={ids:[],relays:[]})=>
{
  const request = ['REQ','ids',{ids:req.ids}];
  if (!req.relays?.length) req.relays = rel.in_set(rel.o.r);
  const options = {eose:'close'};
  console.log(request,req.relays,options);
  q_e.demand(request,req.relays,options);
};