const q_e =
{ 
  def:{id:'q_e',ls:{}},
  clk:{},
};

q_e.upd =()=>{it.to(()=>{ aa.save(q_e) },2000,'qe_upd')};

q_e.load =()=>
{
  aa.ct.qe = 
  {
    'add':
    {
      required:['fid','filter'],
      description:'add new filter',
      exe:q_e.add
    },
    'rm':
    {
      required:['fid'],
      description:'remove one or more filters',
      exe:q_e.rm_filter
    },
    'sets':
    {
      required:['set','sid'],
      optional:['fid'],
      description:'create sets of filters',
      exe:q_e.sets
    },
    'setrm':
    {
      required:['set'],
      optional:['fid'],
      description:'remove set from filter',
      exe:q_e.set_rm
    },
    'run':
    {
      required:['fid'],
      optional:['relset','options'],
      description:'run filter on relay set',
      exe:q_e.run
    },
    'raw':
    {
      required:['relset','raw_filter'],
      description:'run raw filter on relay set',
      exe:q_e.raw
    },
    'close':
    {
      optional:['fid'],
      description:'stop all running filters or just one if provided',
      exe:q_e.close
    },
    'stuff':
    {
      description:'sets a bunch of queries to get you started',
      exe:q_e.stuff
    },
  };
  aa.load_mod(q_e);
};

q_e.stuff =()=>
{
  q_e.add('a {"authors":["aka"],"kinds":[0,3,10002]}');
  q_e.add('b {"authors":["bff"],"kinds":[0,3,10002]}');
  q_e.add('d {"#p":["aka"],"kinds":[4],"since":"n_2"}');
  q_e.add('f {"authors":["aka","bff"],"kinds":[1,7,30023],"since":"n_1"}');
  q_e.add('n {"#p":["aka"],"kinds":[1,4,7],"since":"n_1"}');
};

q_e.mk =(f_id,o) =>
{
  f_id = it.fx.an(f_id);
  const l = it.mk.l('li',{id:'f_'+f_id,cla:'item filter'});
  if (o.sets && o.sets.length) l.dataset.sets = o.sets;    
  l.append(
    it.mk.l('button',{cla:'key',con:f_id,clk:e=>
    {
      cli.t.value = localStorage.ns + ' qe run ' + f_id;
      cli.foc();
    }}),
    // it.mk.l('span',{cla:'key',con:f_id}),
    it.mk.l('span',{cla:'val',con:o.v}),
    it.mk.l('button',{cla:'rm',con:'rm',clk:e=>
    {
      const filter = e.target.parentNode.querySelector('.key').innerText;
      cli.t.value = localStorage.ns + ' qe rm ' + filter;
      cli.foc();
    }})
  );
  return l
};

q_e.demand =(request,relays,options)=>
{
  let filters = request.slice(2);
  for (const f of filters)
  {
    if (!it.fx.verify_filter(f)) 
    {
      console.log('demand failed: invalid filter',f);
      return false;
    }
  }
  if (request && relays && relays.length)
  {
    let opts = {req:request};
    for (const opt in options)
    {
      opts[opt] = options[opt];
    }

    for (const k of relays)
    {
      const relay = rel.active[k];

      if (!relay || !relay.ws || relay.ws.readyState === 3)
      {
        if (!rel.o.ls[k])
        {
          // it.confirm(
          // {
          //   description:'fetch missing relay '+k+' from ?',
          //   yes(){},no(){},
          // })

          //    needs to display info from what npub

          if (window.confirm('fetch missing from relay '+k+'?'))
          {
            rel.add(k+' moar');
            rel.c_on(k,opts);
          }
          else rel.add(k+' off');
        }
        else
        {
          if (!rel.o.ls[k].sets.includes('off')) rel.c_on(k,opts);
        }
      }
      else if (relay.ws.readyState === 1)
      {
        relay.q[request[1]] = opts;
        relay.ws.send(JSON.stringify(request));  
        rel.upd_state(k);      
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
  // ['EVENT', signed]
  if (!relays) relays = rel.in_set(rel.o.w);
  if (relays)
  {
    let dis = JSON.stringify(['EVENT',event]);
    for (const k of relays)
    {
      const relay = rel.active[k];
      if (relay?.ws?.readyState === 1)
      {
        // console.log('yo',dis)
        relay.ws.send(dis);
      }
      else
      {
        if (!rel.o.ls[k]) rel.add(k+' post');
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
  let o;
  try { o = JSON.parse(a) } catch (er) { console.log(er,s) }
  if (o)
  {
    // console.log(o);
    
    let log = localStorage.ns+' qe add '+fid+' ';
    let filter = q_e.o.ls[fid];
    if (filter && window.confirm('update filter?'))
    {
      log += filter.v + ' > ';
      filter.v = a
    }
    else q_e.o.ls[fid] = {v:a,sets:[]};
    aa.save(q_e);
    cli.fuck_off();
    v_u.log(log+q_e.o.ls[fid].v);
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
  else v_u.log(localStorage.ns+' qe '+fid+' not found')
};

q_e.raw =s=>
{
  let a = s.trim().split(' ');
  let rels = a.shift();
  let filter = a.join('').replace(' ','');

  // let [relset,filter] = s.trim().split(' ');
  if (rels && filter) 
  { 
    let filtered = it.fx.vars(filter);
    if (filtered)
    {
      let request = ['REQ','raw',filtered];
      let relays = [];
      let relay = it.s.url(rels);
      if (relay) relays.push(relay);
      else if (rel.o.sets.includes(rels)) relays.push(rel.in_set(rels));
      if (relays.length)
      {
        v_u.log(localStorage.ns+' qe raw '+filter);
        q_e.demand(request,relays,{eose:'close'});
      }
      else v_u.log('invalid relay / relset')
    }
    else v_u.log('invalid filter')
  }
};

q_e.run =s=>
{
  const a = s.trim().split(' ');
  let fid,relset,options={};
  if (a.length) fid = a.shift();
  if (a.length) relset = a.shift();
  if (a.length)
  {
    for (const opt of a)
    {
      let option = opt.split(':');
      if (option.length === 2) options[option[0]] = option[1];
    }
  }
  if (fid) 
  { 
    if (q_e.o.ls.hasOwnProperty(fid)) 
    {
      let filter = it.fx.vars(q_e.o.ls[fid].v);
      let request = ['REQ',fid,filter];
      let relays = rel.in_set(relset);
      if (!relays) relays = rel.in_set(rel.o.r);
      console.log(request,relays,options);
      q_e.demand(request,relays,options);
      cli.fuck_off();
      v_u.log(localStorage.ns+' qe run '+fid);
    }
    else v_u.log('qe run filter not found')
  }
};

q_e.close =s=>
{
  const log = localStorage.ns+' qe close';
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