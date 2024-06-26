// request / query stuff

aa.q =
{ 
  def:{id:'q',ls:{},sets:[]},
  old_id:'q_e',
  sn:'q',
};


// on load

aa.q.load =()=>
{
  aa.actions.push(
    {
      action:[aa.q.sn,'add'],
      required:['fid','JSON_filter'],
      description:'add new filter',
      exe:aa.q.add
    },
    {
      action:[aa.q.sn,'rm'],
      required:['fid'],
      description:'remove one or more filters',
      exe:aa.q.rm_filter
    },
    {
      action:[aa.q.sn,'sets'],
      required:['set'],
      optional:['fid'],
      description:'create sets of filters',
      exe:aa.q.sets
    },
    {
      action:[aa.q.sn,'setrm'],
      required:['set'],
      optional:['fid'],
      description:'remove set from filter',
      exe:aa.q.set_rm
    },
    {
      action:[aa.q.sn,'run'],
      required:['fid'],
      optional:['relset'],
      description:'run filter on relay set (relset), if no relset given default will be used',
      exe:aa.q.run
    },
    {
      action:[aa.q.sn,'req'],
      required:['relset','json_filter'],
      description:'run raw filter on relay set',
      exe:aa.q.req
    },
    {
      action:[aa.q.sn,'close'],
      optional:['fid'],
      description:'close one or all running queries',
      exe:aa.q.close
    },
    {
      action:[aa.q.sn,'stuff'],
      description:'sets a bunch of queries to get you started',
      exe:aa.q.stuff
    },
  );

  aa.mod_load(aa.q).then(aa.mk.mod);
};


// save 

aa.q.save =()=>{ aa.mod_save(aa.q).then(aa.mk.mod) };


// default queries

aa.q.stuff =()=>
{
  aa.log(localStorage.ns+' '+aa.q.sn+' stuff:');
  aa.q.add('a {"authors":["u_x"],"kinds":[0,3,10002]}');
  aa.q.add('b {"authors":["b_f"],"kinds":[0,3,10002]}');
  aa.q.add('d {"#p":["u_x"],"kinds":[4],"since":"n_2"}');
  aa.q.add('f {"authors":["u_x","b_f"],"kinds":[1,6,7,16,30023,30818],"since":"n_1"}');
  aa.q.add('n {"#p":["u_x"],"kinds":[1,4,6,7,16],"since":"n_3"}');
  aa.q.add('u {"authors":["u_x"],"since":"n_5"}');
};


// make mod item

aa.q.mk =(f_id,o) =>
{
  f_id = aa.fx.an(f_id);
  const l = aa.mk.l('li',{id:'f_'+f_id,cla:'item filter'});
  l.append(
    aa.mk.butt_action(aa.q.sn+' run '+f_id,f_id,'key'),
    aa.mk.l('span',{cla:'val',con:o.v}),
    aa.mk.butt_action(aa.q.sn+' rm ' + f_id,'rm','rm'),
  );
  let sets = aa.mk.l('span',{cla:'sets'});
  if (o.sets && o.sets.length)
  {
    l.dataset.sets = o.sets; 
    for (const set of o.sets)
    {
      sets.append(aa.mk.butt_action(aa.q.sn+' setrm '+set+' '+f_id,set))
    }
  }
  sets.append(aa.mk.butt_action(aa.q.sn+' sets _ '+f_id,'+'));
  
  l.append(sets);
  return l
};


// add set to filter

aa.q.sets =s=>
{
  const work =a=>
  { 
    const set_id = a.shift();
    if (aa.is.an(set_id)) 
    { 
      for (const f_id of a)
      {
        let r = aa.q.o.ls[f_id];
        if (r) 
        {
          if (!r.sets) r.sets = [];
          aa.fx.a_add(aa.q.o.ls[f_id].sets,[set_id]);
          it.mod_upd_item(aa.q,);
        }
      }
    }
  };
  aa.fx.loop(work,s,()=>{aa.q.save()})
};


// remove set from filter

aa.q.set_rm =s=>
{
  const work =a=>
  { 
    const set_id = a.shift();
    if (!aa.is.an(set_id)) return false;
    if (a.length)
    {
      for (const f_id of a)
      {
        let r = aa.q.o.ls[f_id];
        if (r && r.sets) r.sets = aa.fx.a_rm(r.sets,[set_id]);
      }
    }
    else
    {
      for (const k in aa.q.o.ls)
      {
        aa.q.o.ls[k].sets = aa.fx.a_rm(aa.q.o.ls[k].sets,[set_id]);
      }
    }
  };
  aa.fx.loop(work,s,()=>{aa.q.save()})
};


// add filter

aa.q.add =s=>
{
  let a = s.trim().split(' ');
  let fid = aa.fx.an(a.shift());
  a = a.join('').replace(' ','');
  let o = aa.parse.j(a);
  if (o)
  {
    let log = localStorage.ns+' q add '+fid+' ';
    let filter = aa.q.o.ls[fid];
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
      aa.q.o.ls[fid] = {v:a,sets:[]};
      log += aa.q.o.ls[fid].v;
      changed = true;
    }
    if (changed) aa.q.save();
    aa.log(log);
    // aa.cli.fuck_off();
    aa.cli.clear();
  }
  else aa.log('invalid filter');
};


// takes a string and
// returns an array with a request filter and options

aa.q.replace_filter_vars =s=>
{
  const o = aa.parse.j(s);
  let options = {};  
  const u = aa.db.p[aa.u.o.ls.xpub];
  if (!u) aa.log('vars: no u');

  if (o) for (const k in o) 
  {
    const v = o[k];
    switch (k)
    {
      case 'eose':
        options.eose = v;
        delete o[k];
        break;
      case 'since':
      case 'until':
        if (typeof v === 'string') o[k] = aa.t.convert(v);
        break;
      default:
        if (Array.isArray(v)) for (let i=0;i<v.length;i++)
        {
          const val = v[i];
          if (typeof val === 'string') 
          { 
            switch (val) 
            {
              case 'u_x':
                o[k] = o[k].filter(dis=>dis!==val);
                if (u) o[k].push(u.xpub); 
                break;
              case 'b_f':
              case 'bff':
                o[k] = o[k].filter(dis=>dis!==val);
                if (u) o[k].push(...u.extradata.bff);                    
                break;
            }
          }
        }
    }
  }
  if (!Object.keys(options).length) options = false
  return [o,options]
};

// remove filter

aa.q.rm_filter =s=>
{
  let fid = s.trim();
  if (aa.q.o.ls.hasOwnProperty(fid)) 
  {
    delete aa.q.o.ls[fid];
    aa.q.save();
    // aa.cli.fuck_off();
    aa.cli.clear();
    aa.log('filter removed: '+fid);
  }
  else aa.log(localStorage.ns+' '+aa.q.sn+' '+fid+' not found')
};


// raw req

aa.q.req =s=>
{
  // aa.cli.fuck_off();
  aa.cli.clear();
  let a = s.trim().split(' ');
  let rels = a.shift();
  let relays = aa.r.rel(rels);
  if (!relays.length)
  {
    aa.log(aa.q.o+' req: invalid relay / relset ('+rels+')');
    return false
  }
  const filt = a.join('').replace(' ','');
  let [filtered,options] = aa.q.replace_filter_vars(filt);
  if (!filtered)
  {
    aa.log('invalid filter:'+filt);
    return false
  }
  let rid = 'raw_'+aa.t.now;
  aa.r.demand(['REQ',rid,filtered],relays,options);
  aa.log(aa.mk.butt_action(aa.q.sn+' close '+rid));
};


// run filter

aa.q.run =async s=>
{
  // aa.cli.fuck_off();
  aa.cli.clear();
  const tasks = s.split(',');
  for (const task of tasks)
  {
    const a = task.trim().split(' ');
    let fid,rels,request;
    if (a.length) fid = a.shift();
    if (fid && aa.q.o.ls.hasOwnProperty(fid)) 
    { 
      let [filtered,options] = aa.q.replace_filter_vars(aa.q.o.ls[fid].v);
      if (filtered) request = ['REQ',fid,filtered];
      
      if (a.length) rels = a.shift();
      let relays = aa.r.rel(rels);
      if (!relays.length) relays = aa.r.in_set(aa.r.o.r);
      aa.r.demand(request,relays,options);
      aa.log(aa.mk.butt_action(aa.q.sn+' close '+request[1]));
    } 
    else aa.log(aa.q.sn+' run: filter not found');
  }
};


// close one or all active queries

aa.q.close =s=>
{
  let fids = s.trim().split(' ');
  aa.log(localStorage.ns+' '+aa.q.sn+' close');  
  for (const k in aa.r.active)
  {
    const a = fids.length ? fids : Object.keys(aa.r.active[k].q);
    if (a.length) for (const fid of a) aa.r.close(k,fid);
  }
  // aa.cli.fuck_off();
  aa.cli.clear();
};

window.addEventListener('load',aa.q.load);