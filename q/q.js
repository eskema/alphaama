/*

alphaama
mod    q
queries

*/


aa.q =
{
  active:{},
  def:{id:'q',ls:{}},
  ls:
  {
    a:
    {
      "authors":["u",'k3'],
      "kinds":[0,3,10002,10019]
    },
    b:
    {
      "authors":["u","k3"],
      "kinds":[0,10002,10019]
    },
    f:
    {
      "authors":["u","k3"],
      "kinds":[0,1,3,6,7,16,20,21,22,10002,10019,30023,30818],
      "since":"n_1"
    },
    id:{"ids":["x"],"eose":"close"},
    ida:
    {
      "kinds":[30023],
      "authors":["u"],
      "#d":["s"]
    },
    n:
    {
      "#p":["u"],
      "kinds":[1,4,6,7,16,9321,9735],
      "since":"n_21"
    },
    ref:{"#e":["x"],"limit":200},
    tag:{"#t":["s"],"limit":200},
    u:{"authors":["u"],"since":"n_7"},
  },
  old_id:'q_e',
};


// add filter
aa.q.add =str=>
{
  let [k,s] = str.split(aa.fx.regex.fw);
  k = aa.fx.an(k);
  
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
  let fids = s.trim().split(' ');
  for (const k in aa.r.active)
  {
    const a = fids.length ? fids : Object.keys(aa.r.active[k].q);
    if (a.length) for (const fid of a)  aa.r.close(k,fid);
  }
  aa.log(aa.q.def.id+' closed: '+fids);
};


// remove filter
aa.q.del =s=>
{
  let k = s.trim();
  if (aa.q.o.ls.hasOwnProperty(k)) 
  {
    let old_v = aa.q.def.id+' add '+k+' '+aa.q.o.ls[k].v;
    let undo = aa.mk.butt_action(old_v,'undo');
    let log = aa.mk.l('p',
    {
      con:aa.q.def.id+' filter deleted: '+k+' ',
      app: undo
    });
    aa.log(log);

    delete aa.q.o.ls[k];
    document.getElementById(aa.q.def.id+'_'+aa.fx.an(k)).remove();
    aa.mod_save(aa.q);
  }
  else aa.log(aa.q.def.id+' '+k+' not found')
};


// fetch note
aa.clk.fetch =e=>
{
  const note = e.target.closest('.note');
  
  let filter = '{';
  const id = note.dataset.id;
  if (id)
  {
    filter += `"ids":["${id}"],`;
  } 
  else
  {
    const [kind,pubkey,ds] = note.dataset.id_a.split(':');
    filter += `"authors":[${pubkey}],"kinds":[${kind}],"#d":[${ds}],`;
  }
  filter += '"eose":"close"}';
  
  let relset = 'read ';
  if (note.dataset.r)
  {
    let r = note.dataset.r.trim().split(' ');
    if (r.length) 
    {
      let url = aa.is.url(r[0])?.href;
      if (url) relset = url+' ';
    }
  }
  aa.cli.v(localStorage.ns+' '+aa.q.def.id+' req '+relset+filter);
};


// request filter from id_a
// aa.fx.ida_filter =s=>
// {
//   let [k,p,d] = s.split(':');
//   return {kinds:[parseInt(k)],authors:[p],'#d':[d]}
// };


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
      action:[id,'del'],
      required:['fid'],
      description:'remove one or more filters',
      exe:mod.del
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
      exe:mod.outbox
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

  // add shortcut buttons with last queries executed
  aa.mod_load(mod).then(aa.mk.mod).then(e=>
  {
    let add_butt = aa.mk.butt_action(`${id} add `,'+','add');
    mod.l.insertBefore(add_butt,document.getElementById(id));
    
    if (sessionStorage.q_run) 
    {
      let run = `${id} run ${sessionStorage.q_run}`;
      setTimeout(()=>{aa.log(aa.mk.butt_action(run))},300);
    }
    if (sessionStorage.q_out) 
    {
      let out = `${id} out ${sessionStorage.q_out}`;
      setTimeout(()=>{aa.log(aa.mk.butt_action(out))},350);
    }
  });
};


// make q mod item
aa.q.mk =(k,v) =>
{
  k = aa.fx.an(k);
  const id = aa.q.def.id;
  const l = aa.mk.l('li',{id:`${id}_${k}`,cla:'item filter'});
  let butts = aa.mk.l('span',{cla:'butts'});
  butts.append(
    aa.mk.butt_action(`${id} del ${k}`,'del'),' ',
    aa.mk.butt_action(`${id} run ${k}`,'run'),' ',
    aa.mk.butt_action(`${id} out ${k}`,'out'),' ',
  );
  let key = aa.mk.l('span',{cla:'key',app:aa.mk.butt_action(`${id} add ${k} ${v.v}`,k,'add')});
  let val = aa.mk.l('span',{cla:'val',con:v.v});
  
  
  l.append(
    key,' ',val,' ',butts
  );
  return l
};


// run filter with outbox
aa.q.outbox =async s=>
{
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

      let dis = aa.q.replace_filter_vars(aa.q.o.ls[fid].v);
      dis.push(fid);
      aa.q.as_outbox(dis)
    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};


// demand request as outbox
aa.q.as_outbox =([filtered,options,fid])=>
{
  let outbox;
  let authors_len = 0;
  if (filtered.authors?.length)
  {
    authors_len = filtered.authors.length;
    outbox = aa.u.outbox(filtered.authors);
    delete filtered.authors;
  }

  if (outbox?.length)
  {
    aa.mod_servers_add(aa.r,outbox.map(i=>i[0]+' out').join(','),'relay');
    let relays = [];
    for (const r of outbox)
    {
      let url = r[0];

      // if (!aa.r.o.ls[url] || !aa.r.o.ls[url].sets.includes('out'))
      //   aa.r.add(url+' out');

      let filter = {...filtered};
      filter.authors = r[1];
      // console.log(['REQ',fid,filter],[url],options);
      aa.r.demand(['REQ',fid,filter],[url],options);
      relays.push(url+' '+filter.authors.length);
    }
    // aa.log(relays.join(', '));
    // aa.log(aa.mk.butt_action(aa.q.def.id+' close '+fid));
    if (!options.eose || options.eose !== 'close')
    {
      let note_log = aa.mk.details('q out '+fid);
      note_log.id = fid;
      note_log.append(aa.mk.butt_action(aa.q.def.id+' close '+fid));
      note_log.append(aa.mk.l('p',{con:'outbox for '+authors_len+' authors'}));
      note_log.append(aa.mk.l('p',{con:'using '+outbox.length+' relays:'}));
      note_log.append(aa.mk.l('p',{con:relays.join(', ')}));
      aa.log_read(aa.log(note_log));
    }
  }


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
        if (typeof v === 'string') o[k] = aa.fx.time_convert(v);
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
aa.q.req =(s='')=>
{
  let a = s.split(' ');
  let rels = a.shift();
  let relays = aa.r.rel(rels);
  let rid = 'req_'+aa.now;
  
  const filt = a.join('').replace(' ','');
  let [filtered,options] = aa.q.replace_filter_vars(filt);
  if (!filtered)
  {
    aa.log('invalid filter:'+filt);
    return false
  }

  
  if (!relays.length)
  {
    aa.q.as_outbox([filtered,options,rid])
  }
  else
  {
    aa.r.demand(['REQ',rid,filtered],relays,options);
    
    let note_log = aa.mk.details('q req '+rid);
    note_log.id = rid;
    note_log.append(aa.mk.butt_action(aa.q.def.id+' close '+rid));
    note_log.append(aa.mk.l('p',{con:'to: '+relays}));
    note_log.append(aa.mk.l('p',{app:aa.mk.ls({ls:{filter:filtered,options:options}})}));
    aa.log_read(aa.log(note_log));
  }
};


// run filter
aa.q.run =async s=>
{
  const tasks = s.split(',');
  let delay = 0;
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
      setTimeout(e=>{aa.r.demand(request,relays,options)},delay);
      delay = delay + 1000;
      if (!options.eose || options.eose !== 'close') 
      aa.log(aa.mk.butt_action(aa.q.def.id+' close '+request[1]));
    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};


// add useful queries
aa.q.stuff =()=>
{
  let id = aa.q.def.id;
  let keys = Object.keys(aa.q.ls);
  let queries = aa.mk.details(keys.length +' default queries');
  for (const key of keys)
  {
    let filter = JSON.stringify(aa.q.ls[key]);
    let s = `${key} ${filter}`;
    aa.q.add(s);
    queries.append(aa.mk.l('p',{con:s}))
  }
  aa.log(queries);
};

// window.addEventListener('load',aa.q.load);