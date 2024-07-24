/*

alphaama
mod    q
filter queries

*/


aa.q =
{ 
  def:{id:'q',ls:{}},
  old_id:'q_e',
};


// add filter
aa.q.add =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let k = aa.fx.an(a.shift());
  a = a.join('').replace(' ','');
  let o = aa.parse.j(a);
  if (o)
  {
    let log = localStorage.ns+' q add '+k+' ';
    let filter = aa.q.o.ls[k];
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
      aa.q.o.ls[k] = {v:a};
      log += aa.q.o.ls[k].v;
      changed = true;
    }
    if (changed) 
    {
      aa.mod_save(aa.q)
      .then(mod=>{aa.mod_ui(mod,k,aa.q.o.ls[k])});
    }
    aa.log(log);
  }
  else aa.log('invalid filter');
};


// close one or all active queries
aa.q.close =s=>
{
  aa.cli.clear();
  let fids = s.trim().split(' ');
  aa.log(localStorage.ns+' '+aa.q.def.id+' close');  
  for (const k in aa.r.active)
  {
    const a = fids.length ? fids : Object.keys(aa.r.active[k].q);
    if (a.length) for (const fid of a) aa.r.close(k,fid);
  }
};


// on load
aa.q.load =()=>
{
  aa.actions.push(
    {
      action:[aa.q.def.id,'add'],
      required:['fid','JSON_filter'],
      description:'add new filter',
      exe:aa.q.add
    },
    {
      action:[aa.q.def.id,'rm'],
      required:['fid'],
      description:'remove one or more filters',
      exe:aa.q.rm_filter
    },
    // {
    //   action:[aa.q.def.id,'sets'],
    //   required:['set'],
    //   optional:['fid'],
    //   description:'create sets of filters',
    //   exe:aa.q.sets
    // },
    // {
    //   action:[aa.q.def.id,'setrm'],
    //   required:['set'],
    //   optional:['fid'],
    //   description:'remove set from filter',
    //   exe:aa.q.set_rm
    // },
    {
      action:[aa.q.def.id,'run'],
      required:['fid'],
      optional:['relset'],
      description:'run filter on relay set (relset), if no relset given default will be used',
      exe:aa.q.run
    },
    {
      action:[aa.q.def.id,'req'],
      required:['relset','json_filter'],
      description:'run raw filter on relay set',
      exe:aa.q.req
    },
    {
      action:[aa.q.def.id,'close'],
      optional:['fid'],
      description:'close one or all running queries',
      exe:aa.q.close
    },
    {
      action:[aa.q.def.id,'stuff'],
      description:'sets a bunch of queries to get you started',
      exe:aa.q.stuff
    },
  );

  aa.mod_load(aa.q).then(aa.mk.mod);
};


// make q mod item
aa.q.mk =(k,v) =>
{
  k = aa.fx.an(k);  
  const l = aa.mk.l('li',{id:aa.q.def.id+'_'+k,cla:'item filter'});
  l.append(
    aa.mk.butt_action(aa.q.def.id+' run '+k,k,'key'),
    aa.mk.l('span',{cla:'val',con:v.v}),
    aa.mk.butt_action(aa.q.def.id+' rm ' + k,'rm','rm'),
  );
  // let sets = aa.mk.l('span',{cla:'sets'});
  // if (v.sets && v.sets.length)
  // {
  //   l.dataset.sets = v.sets; 
  //   for (const set of v.sets)
  //   {
  //     sets.append(aa.mk.butt_action(aa.q.def.id+' setrm '+set+' '+k,set))
  //   }
  // }
  // sets.append(aa.mk.butt_action(aa.q.def.id+' sets _ '+k,'+'));
  
  // l.append(sets);
  return l
};


// remove filter
aa.q.rm_filter =s=>
{
  aa.cli.clear();
  let k = s.trim();
  if (aa.q.o.ls.hasOwnProperty(k)) 
  {
    delete aa.q.o.ls[k];
    document.getElementById(aa.q.def.id+'_'+aa.fx.an(k)).remove();
    aa.log(aa.q.def.id+' filter removed: '+k);
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
      let [filtered,options] = aa.q.replace_filter_vars(aa.q.o.ls[fid].v);
      if (filtered) request = ['REQ',fid,filtered];
      
      if (a.length) rels = a.shift();
      let relays = aa.r.rel(rels);
      if (!relays.length) relays = aa.r.in_set(aa.r.o.r);
      aa.r.demand(request,relays,options);
      aa.log(aa.mk.butt_action(aa.q.def.id+' close '+request[1]));
    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};


// q save 
// aa.q.save =()=>{ aa.mod_save(aa.q).then(aa.mk.mod) };


// add set to filter
// aa.q.sets =s=>
// {
//   const work =a=>
//   { 
//     const set_id = a.shift();
//     if (!aa.is.an(set_id)) return;
//     for (const k of a)
//     {
//       let r = aa.q.o.ls[k];
//       if (r) 
//       {
//         if (!r.sets) r.sets = [];
//         aa.fx.a_add(aa.q.o.ls[k].sets,[set_id]);
//         it.mod_ui(aa.q,k,aa.q.o.ls[k]);
//       }
//     }
//   };
//   aa.fx.loop(work,s);
//   aa.mod_save(aa.q);
// };


// remove set from filter
// aa.q.set_rm =s=>
// {
//   const work =a=>
//   { 
//     const set_id = a.shift();
//     if (!aa.is.an(set_id)) return;
//     if (a.length)
//     {
//       for (const k of a)
//       {
//         let r = aa.q.o.ls[k];
//         if (r && r.sets) 
//         {
//           r.sets = aa.fx.a_rm(r.sets,[set_id]);
//           aa.mod_ui(aa.q,k,aa.q.o.ls[k]);
//         }
//       }
//     }
//     else
//     {
//       for (const k in aa.q.o.ls)
//       {
//         aa.q.o.ls[k].sets = aa.fx.a_rm(aa.q.o.ls[k].sets,[set_id]);
//         aa.mod_ui(aa.q,k,aa.q.o.ls[k]);
//       }
//     }
//   };
//   aa.fx.loop(work,s)
//   aa.mod_save(aa.q);
// };


// add useful queries
aa.q.stuff =()=>
{
  aa.log(localStorage.ns+' '+aa.q.def.id+' stuff:');
  aa.q.add('a {"authors":["u"],"kinds":[0,3,10002]}');
  aa.q.add('b {"authors":["k3"],"kinds":[0,3,10002]}');
  aa.q.add('d {"#p":["u"],"kinds":[4],"since":"n_7"}');
  aa.q.add('f {"authors":["u","k3"],"kinds":[0,1,3,6,7,16,10002,30023,30818],"since":"n_1"}');
  aa.q.add('n {"#p":["u"],"kinds":[1,4,6,7,16,9735],"since":"n_3"}');
  aa.q.add('u {"authors":["u"],"since":"n_5"}');
  aa.q.add('z {"#p":["u"],"kinds":[9735],"since":"n_21"}');
};


window.addEventListener('load',aa.q.load);