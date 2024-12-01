/*

alphaama
mod    q
queries

*/


aa.q =
{ 
  def:{id:'q',ls:{}},
  old_id:'q_e',
  active:{}
};


// add filter
aa.q.add =str=>
{
  aa.cli.clear();

  let [k,s] = str.split(aa.regex.fw);
  k = aa.fx.an(k);

  // let a = s.trim().split(' ');
  // let k = aa.fx.an(a.shift());
  // a = a.join('').replace(' ','');
  
  // let filters = s.match(/{(.*?)}/g);
  
  // s = '['+s+']';
  
  let o = aa.parse.j(s);
  if (!o)
  {
    aa.log('invalid filter: '+s);
    return ''
  } 

  let log = localStorage.ns+' q add '+k+' ';
  let filter = aa.q.o.ls[k];
  let is_new;
  let changed;

  if (filter)
  {
    if (filter.v === s) log += '=== is the same';
    else
    {
      log += filter.v+' > '+s;
      filter.v = s;
      changed = true;
    }
  }
  else 
  {
    aa.q.o.ls[k] = {v:s};
    log += aa.q.o.ls[k].v;
    changed = true;
    is_new = true;
  }
  if (changed) 
  {
    if (!is_new) 
    {
      aa.q.close(k);
      aa.log(log);
    }
    aa.mod_save(aa.q).then(mod=>{aa.mod_ui(mod,k)});      
  }
  
  return k
};


// close one or all active queries
aa.q.close =s=>
{
  aa.cli.clear();
  let fids = s.trim().split(' ');
  for (const k in aa.r.active)
  {
    const a = fids.length ? fids : Object.keys(aa.r.active[k].q);
    if (a.length) for (const fid of a)  aa.r.close(k,fid);
  }
  aa.log(aa.q.def.id+' closed: '+fids);
};


// request filter from id_a
aa.fx.ida_rf =s=>
{
  let [k,p,d] = s.split(':');
  return {kinds:[parseInt(k)],authors:[p],'#d':[d]}
};


// on load
aa.q.load =()=>
{
  let mod = aa.q;
  let id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['fid','JSON_filter'],
      description:'add new filter',
      exe:mod.add
    },
    {
      action:[id,'rm'],
      required:['fid'],
      description:'remove one or more filters',
      exe:mod.rm_filter
    },
    {
      action:[id,'run'],
      required:['fid'],
      optional:['relset'],
      description:'run filter on relay set (relset), if no relset given default will be used',
      exe:mod.run
    },
    {
      action:[id,'out'],
      required:['fid'],
      description:'run filter with outbox',
      exe:mod.out
    },
    {
      action:[id,'req'],
      required:['relset','json_filter'],
      description:'run raw filter on relay set',
      exe:mod.req
    },
    {
      action:[id,'close'],
      optional:['fid'],
      description:'close one or all running queries',
      exe:mod.close
    },
    {
      action:[id,'stuff'],
      description:'sets a bunch of queries to get you started',
      exe:mod.stuff
    },
  );

  aa.mod_load(mod).then(aa.mk.mod).then(e=>
  {
    let add_butt = aa.mk.butt_action(`${id} add `,'+','add');
    mod.l.insertBefore(add_butt,document.getElementById(id));
    
    if (sessionStorage.q_run) 
    {
      let action = `${id} run ${sessionStorage.q_run}`;
      setTimeout(()=>{aa.log(aa.mk.butt_action(action))},500);
    }
    if (sessionStorage.q_out) 
    {
      let action = `${id} out ${sessionStorage.q_out}`;
      setTimeout(()=>{aa.log(aa.mk.butt_action(action))},600);
    }
  });
};


// make q mod item
aa.q.mk =(k,v) =>
{
  k = aa.fx.an(k);
  const id = aa.q.def.id;
  const l = aa.mk.l('li',{id:`${id}_${k}`,cla:'item filter'});
  let out = aa.mk.butt_action(`${id} out ${k}`,'out','out');
  let run = aa.mk.butt_action(`${id} run ${k}`,'run','run');
  let add = aa.mk.butt_action(`${id} add ${k} ${v.v}`,k,'add');
  let val = aa.mk.l('span',{cla:'val',con:v.v});
  let rm = aa.mk.butt_action(`${id} rm ${k}`,'rm','rm');
  
  l.append(
    out,' ',run,' ',add,' ',val,' ',rm
  );
  return l
};


// run filter with outbox
aa.q.out =async s=>
{
  aa.cli.clear();

  const tasks = s.split(',');
  for (const task of tasks)
  {
    const a = task.trim().split(' ');
    let fid = a.shift();
    if (fid && aa.q.o.ls.hasOwnProperty(fid)) 
    { 
      if (!aa.q.active.out) aa.q.active.out = [];
      if (!aa.q.active.out.includes(fid)) aa.q.active.out.push(fid);
      sessionStorage.q_out = aa.q.active.out;

      let [filtered,options] = aa.q.replace_filter_vars(aa.q.o.ls[fid].v);
      
      // wip 
      let outbox;
      let authors;
      if (filtered.authors?.length)
      {
        aa.log('outbox for '+filtered.authors.length+' authors');
        outbox = aa.u.outbox(filtered.authors);
        authors = filtered.authors;
        delete filtered.authors;
      }

      if (outbox?.length)
      {
        aa.log('using '+outbox.length+' relays:');
        let relays = [];
        for (const r of outbox)
        {
          let filter = {...filtered};
          let url = r[0];
          filter.authors = r[1];
          let req = ['REQ',fid,filter];
          // console.log(url,req);
          relays.push(url+' '+filter.authors.length);
          aa.r.demand(req,[url],options);
        }
        aa.log(relays.join(', '));
        aa.log(aa.mk.butt_action(aa.q.def.id+' close '+fid));
      }
    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};



// remove filter
aa.q.rm_filter =s=>
{
  aa.cli.clear();
  let k = s.trim();
  if (aa.q.o.ls.hasOwnProperty(k)) 
  {
    let old_v = aa.q.def.id+' add '+k+' '+aa.q.o.ls[k].v;
    let undo = aa.mk.butt_action(old_v,'undo');
    let log = aa.mk.l('p',
    {
      con:aa.q.def.id+' filter removed: '+k+' ',
      app: undo
    });
    aa.log(log);

    delete aa.q.o.ls[k];
    document.getElementById(aa.q.def.id+'_'+aa.fx.an(k)).remove();
    aa.mod_save(aa.q);
  }
  else aa.log(aa.q.def.id+' '+k+' not found')
};


// takes a string and
// returns an array with a request filter and options
aa.q.replace_filter_vars =s=>
{
  const o = aa.parse.j(s);
  let options = {};  
  if (!aa.u.p) aa.log('vars: no u');

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
              case 'u':
              case 'u_x':
                o[k] = o[k].filter(dis=>dis!==val);
                if (aa.u.p) o[k].push(aa.u.p.xpub); 
                break;
              case 'b_f':
              case 'bff':
              case 'k3':
                o[k] = o[k].filter(dis=>dis!==val);
                if (aa.u.p) o[k].push(...aa.u.p.follows);                    
                break;
            }
          }
          if (!o[k].length) return false
        }
    }
  }
  if (!Object.keys(options).length) options = false
  return [o,options]
};


// raw req
aa.q.req =s=>
{
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
  aa.log(aa.mk.butt_action(aa.q.def.id+' close '+rid));
};


// run filter
aa.q.run =async s=>
{
  aa.cli.clear();
  const tasks = s.split(',');
  for (const task of tasks)
  {
    const a = task.trim().split(' ');
    let fid,rels,request;
    if (a.length) fid = a.shift();
    if (fid && aa.q.o.ls.hasOwnProperty(fid)) 
    { 
      if (!aa.q.active.run) aa.q.active.run = [];
      if (!aa.q.active.run.includes(fid)) aa.q.active.run.push(fid);
      sessionStorage.q_run = aa.q.active.run;

      let [filtered,options] = aa.q.replace_filter_vars(aa.q.o.ls[fid].v);
      if (filtered) request = ['REQ',fid,filtered];
      
      if (a.length) rels = a.shift();
      let relays = aa.r.rel(rels);
      if (!relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
      aa.r.demand(request,relays,options);
      aa.log(aa.mk.butt_action(aa.q.def.id+' close '+request[1]));
    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};


// add useful queries
aa.q.stuff =()=>
{
  let queries = 
  [
    'a {"authors":["u"],"kinds":[0,3,10002,10019,37375]}',
    'b {"authors":["k3"],"kinds":[0,3,10002,10019]}',
    'd {"#p":["u"],"kinds":[4],"since":"n_7"}',
    'f {"authors":["u","k3"],"kinds":[0,1,3,6,7,16,20,10002,10019,30023,30818],"since":"n_1"}',
    'n {"#p":["u"],"kinds":[1,4,6,7,16,9735],"since":"n_3"}',
    'r {"authors":["u","k3"],"kinds":[6,7,16],"since":"n_1"}',
    'u {"authors":["u"],"since":"n_5"}',
    'z {"#p":["u"],"kinds":[9735],"since":"n_21"}'
  ];
  for (const s of queries) aa.q.add(s);
  aa.log(queries.length +' queries added to ['+aa.q.def.id+']');
};


window.addEventListener('load',aa.q.load);