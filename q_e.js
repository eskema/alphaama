const q_e =
{ 
  def:{id:'q_e',ls:{}},
  clk:{},
  sn:'q',
};

q_e.load =()=>
{
  let sn = q_e.sn;
  aa.actions.push(
    {
      action:[sn,'add'],
      required:['fid','filter'],
      description:'add new filter',
      exe:q_e.add
    },
    {
      action:[sn,'rm'],
      required:['fid'],
      description:'remove one or more filters',
      exe:q_e.rm_filter
    },
    {
      action:[sn,'sets'],
      required:['set'],
      optional:['fid'],
      description:'create sets of filters',
      exe:q_e.sets
    },
    {
      action:[sn,'setrm'],
      required:['set'],
      optional:['fid'],
      description:'remove set from filter',
      exe:q_e.set_rm
    },
    {
      action:[sn,'run'],
      required:['fid'],
      optional:['relset'],
      description:'run filter on relay set',
      exe:q_e.run
    },
    {
      action:[sn,'raw'],
      required:['relset','raw_filter'],
      description:'run raw filter on relay set',
      exe:q_e.raw
    },
    {
      action:[sn,'close'],
      optional:['fid'],
      description:'close one or all running queries',
      exe:q_e.close
    },
    {
      action:[sn,'stuff'],
      description:'sets a bunch of queries to get you started',
      exe:q_e.stuff
    },
  );

  aa.load_mod(q_e).then(q_e.start);
};

q_e.start =mod=>
{
  it.mk.mod(mod);
  // v_u.log(mod.l);
};

q_e.save =()=>{ aa.save(q_e).then(it.mk.mod) };

q_e.stuff =()=>
{
  v_u.log(localStorage.ns+' '+q_e.sn+' stuff:');
  q_e.add('a {"authors":["u_x"],"kinds":[0,3,10002]}');
  q_e.add('b {"authors":["b_f"],"kinds":[0,3,10002]}');
  q_e.add('a {"authors":["u_x"],"kinds":[0,3,10002]}');
  q_e.add('d {"#p":["u_x"],"kinds":[4],"since":"n_2"}');
  q_e.add('f {"authors":["u_x","b_f"],"kinds":[1,6,7,16,30023],"since":"n_1"}');
  q_e.add('n {"#p":["u_x"],"kinds":[1,4,6,7,16],"since":"n_1"}');
  q_e.add('s {"#t":["soveng"],"kinds":[1],"since":"n_3"}');
};

q_e.mk =(f_id,o) =>
{
  let sn = q_e.sn;
  f_id = it.fx.an(f_id);
  const l = it.mk.l('li',{id:'f_'+f_id,cla:'item filter'});
  l.append(
    it.mk.l('button',{cla:'key',con:f_id,clk:e=>
    {
      cli.t.value = localStorage.ns+' '+sn+' run '+f_id;
      cli.foc();
    }}),
    it.mk.l('span',{cla:'val',con:o.v}),
    it.mk.l('button',{cla:'rm',con:'rm',clk:e=>
    {
      const filter = e.target.parentNode.querySelector('.key').innerText;
      cli.t.value = localStorage.ns+' '+sn+' rm ' + filter;
      cli.foc();
    }})
  );
  let sets = it.mk.l('span',{cla:'sets'});
  if (o.sets && o.sets.length)
  {
    l.dataset.sets = o.sets; 
    
    for (const set of o.sets)
    {
      sets.append(it.mk.l('button',
      {
        cla:'butt',
        con:set,
        clk:e=>
        {
          cli.v(localStorage.ns+' '+q_e.sn+' setrm '+set+' '+f_id)
        }
      }))
    }
  }
  sets.append(it.mk.l('button',
  {
    cla:'butt',
    con:'+',
    clk:e=> { cli.v(localStorage.ns+' '+q_e.sn+' sets _ '+f_id) }
  }))
  l.append(sets);
  return l
};

q_e.demand =(request,relays,options)=>
{
  if (localStorage.mode === 'hard') 
  {
    v_u.log('mode:hard, no connections allowed');
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

    if (!relays?.length) relays = rel.in_set(rel.o.r);
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
          //    needs to display info from what npub
          let act_yes = url+' hint';
          let notice = {title:'r add '+act_yes+'?'};
          notice.yes =
          {
            title:'yes',
            exe:e=>
            {
              console.log(url,opts);
              rel.add(act_yes);
              rel.c_on(url,opts);
              e.target.parentElement.textContent = act_yes;
            }
          };
          let act_no = url+' off';
          notice.no =
          {
            title:'no',
            exe:e=>
            {
              rel.add(act_no);
              e.target.parentElement.textContent = act_no;
            }
          };
          it.notice(notice);
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
  if (localStorage.mode === 'hard') 
  {
    v_u.log('mode:hard, no connections allowed');
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
  it.loop(work,s,()=>{q_e.save()})
};

q_e.set_rm =s=>
{
  const work =a=>
  { 
    const set_id = a.shift();
    if (!it.s.an(set_id)) return false;
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
  };
  it.loop(work,s,()=>{q_e.save()})
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
    let log = localStorage.ns+' q add '+fid+' ';
    let filter = q_e.o.ls[fid];
    let changed;
    if (filter?.v === a)
    {
      log += '=== is the same';
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
    if (changed) q_e.save();
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
    q_e.save();
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
      if (relays.length)
      {
        // v_u.log(localStorage.ns+' q  raw '+filter);
        // console.log(request,relays,options);
        q_e.demand(request,relays,options);
        cli.fuck_off();
        let log = it.mk.l('p',
        {
          con:localStorage.ns+' '+q_e.sn+' run '+filter+' ('+it.tim.now()+') '+relays+' '
        });
        let butt_close = it.mk.l('button',
        {
          cla:'button close',
          con:'[x]',
          clk:e=>
          { 
            cli.v(localStorage.ns+' '+q_e.sn+' close raw');
            log.textContent = "raw closed";
          }
        });
        log.append(butt_close)
        v_u.log(log);
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

q_e.run =async s=>
{
  // console.log('run s');
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
    q_e.demand(request,relays,options);
    cli.fuck_off();
    let close_butt = it.mk.l('button',
    {
      cla:'button close',
      con:'[x]',
      clk:e=>{ cli.v(localStorage.ns+' '+q_e.sn+' close '+fid) }
    });
    let log = it.mk.l('p',
    {
      con:localStorage.ns+' '+q_e.sn+' run '+fid+' ('+it.tim.now()+') '+relays+' ',
      app:close_butt
    });
    v_u.log(log);
  } 
  else v_u.log(q_e.sn+' run filter not found')
};

q_e.close =s=>
{
  let log = localStorage.ns+' '+q_e.sn+' close ';
  let fids = s.trim().split(' ');
  log+= ' '+fids.length?fids:'all'+' ';
  for (const k in rel.active)
  {
    if (fids.length) 
    {
      for (const fid of fids)
      {
        if (rel.active[k].q[fid]) 
        {
          rel.close(k,fid);
          log+=' '+k;
        }
      }
    }
    else 
    {
      for (const fid in rel.active[k].q) 
      {
        rel.close(k,fid);
        log+=' '+k;
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

q_e.req.authors =(req={ids:[],relays:[]})=>
{
  const request = ['REQ','ids',{authors:req.ids}];
  if (!req.relays?.length) req.relays = rel.in_set(rel.o.r);
  const options = {eose:'close'};
  console.log(request,req.relays,options);
  q_e.demand(request,req.relays,options);
};