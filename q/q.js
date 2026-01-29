/*

alphaama
mod    q
queries

*/


aa.q =
{
  name:'queries',
  about:'manage and make nostr requests (REQ)',
  active:{},
  def:{id:'q',ls:{},subs:{}},
  ls:
  {
    a:
    {
      "authors":["u"],
      "kinds":[0,3,10002]
    },
    b:
    {
      "authors":["k3"],
      "kinds":[0,3,10002]
    },
    c:
    {
      "authors":["k3"],
      "kinds":[0,10002]
    },
    f:
    {
      "authors":["u","k3"],
      "kinds":[0,1,3,6,7,16,20,21,22,9802,10002,30023,30818],
      "since":"h_12",
    },
    id:{"ids":["x"],"eose":"close"},
    ida:
    {
      "kinds":[30023],
      "authors":["u"],
      "#d":["s"],
      "limit":1
    },
    n:
    {
      "#p":["u"],
      "kinds":[1,4,6,7,16],
      "since":"n_21",
      "limit":500
    },
    ref:{"#e":["x"],"limit":200},
    replies:
    {
      "authors":["u","k3"],
      "kinds":[11,1111],
      "since":"n_6"
    },
    tag:{"#t":["s"],"limit":200},
    u:{"authors":["u"],"since":"n_7","limit":500},
  },
  butts:
  {
    mod:[],
    init:
    [
      ['q stuff','stuff']
    ]
  },
  styles:
  [
    '/q/q.css',
  ],
};


// add filter
aa.q.add =(s='',silent)=>
{
  let [fid,v] = s.split(aa.regex.fw);
  fid = aa.fx.an(fid);
  let o = aa.pj(v);
  if (!o)
  {
    aa.log('invalid filter: '+v);
    return ''
  }
  let mod = aa.q;
  let con = `${localStorage.ns} ${mod.def.id} add ${fid} `;
  let filter = mod.o.ls[fid];
  let is_new;
  let changed;

  if (filter)
  {
    if (filter.v === v) con += '=== is the same';
    else
    {
      con += filter.v+' > '+v;
      filter.v = v;
      filter.o = o;
      changed = true;
    }
  }
  else
  {
    mod.o.ls[fid] = {v,o};
    con += mod.o.ls[fid].v;
    changed = true;
    is_new = true;
  }
  if (changed)
  {
    aa.mod.save(mod);
    aa.mod.ui(mod,fid);
  }

  if (!silent) aa.log(make('p',{con}));
  return fid
};


// close one or all active queries
aa.q.close =s=>
{
  for (const id of aa.fx.splitr(s)) aa.r.close(id);
};


// run filter
aa.q.db =async(s='')=>
{
  const tasks = aa.fx.splitr(s,',');
  let times = 0;
  for (const task of tasks)
  {
    const a = aa.fx.splitr(task);
    let fid,request;
    if (a.length) fid = a.shift();
    if (fid && aa.q.o.ls.hasOwnProperty(fid))
    {
      let filter = aa.q.o.ls[fid].o || aa.q.o.ls[fid].v;
      let [filtered] = aa.q.filter(filter);
      if (!filtered) 
      {
        aa.log(aa.q.def.id+' db: invalid filter')
        continue
      }
      
      times++;
      let [get_id,events] = await aa.r.get_filter(filtered);
      for (const dat of events) aa.e.print_q(dat);
    } 
  }
};


// takes a string and
// returns an array with a request filter and options
aa.q.filter =filter=>
{
  if (typeof filter === 'string') 
    filter = aa.pj(filter);
  if (!filter) return [];

  let var_map = new Map();
  // for (const key in aa.u.o.ls)
  // {
  //   var_map.set(key,aa.u.o.ls[key].split(' '));
  // }
  // var_map.set('u', ()=>[aa.u.p.pubkey]);
  // var_map.set('k3', ()=>aa.u.p.follows);

  let options = {};

  // let p;
  // let x = aa.u.p.pubkey;
  // if (!x) aa.log('vars: no u');
  // else p = aa.db.p[x];

  let filter_keys = Object.keys(filter);
  for (const key of filter_keys)
  {
    const value = filter[key];
    switch(key)
    {
      case 'eose':
        options[key] = value;
        delete filter[key];
        break;
      case 'since':
      case 'until':
        if (typeof value === 'string') 
          filter[key] = aa.fx.time_convert(value);
        break;
      default:
        if (!Array.isArray(value)) break;
        for (const val of value)
        {
          if (!val && val !== 0)
          {
            console.trace(filter);
            return []
          }

          if (typeof val === 'string')
          {
            // filter[key] = value.filter(i=>i!==val);
            // if (p) filter[key].push(...p.follows);
            if (Object.hasOwn(aa.u?.o?.ls,val))
            {
              filter[key] = filter[key].filter(i=>i!==val);
              filter[key].push(...aa.u.o.ls[val].split(' '));
            }
            // switch (val)
            // {
            //   case 'u':
            //   case 'x':
            //     filter[key] = filter[key].filter(i=>i!==val);
            //     if (x) filter[key].push(x);
            //     break;
            //   case 'k3':
            //     filter[key] = filter[key].filter(i=>i!==val);
            //     if (p) filter[key].push(...p.follows);
            //     break;
            // }
          }
          if (!filter[key].length) 
          {
            aa.log('vars: invalid filter');
            return []
          }
        }
    }
  }
  if (!Object.keys(options).length) options = false;
  return [filter,options]
};


// remove filter
aa.q.del =s=>
{
  let mod = aa.q;
  let k = s.trim();
  if (Object.hasOwn(mod.o.ls,k))
  {
    let old_v = mod.def.id+' add '+k+' '+mod.o.ls[k].v;
    let con = mod.def.id+' filter deleted: '+k+' ';
    let app = aa.mk.butt_action(old_v,'undo');
    aa.log(make('p',{con,app}));

    delete mod.o.ls[k];
    document.getElementById(mod.def.id+'_'+aa.fx.an(k))?.remove();
    aa.mod.save(mod);
  }
  else aa.log(mod.def.id+' '+k+' not found')
};


aa.q.get =async(fid,options)=>
{
  let filter_raw = aa.q.o.ls[fid]?.o;
  if (!filter_raw) 
  {
    let filter_json = aa.q.o.ls[fid]?.v;
    if (filter_json) filter_raw = aa.pj(filter_json);
  }
  if (!filter_raw) return;

  let id = `${fid}_${aa.fx.rands()}`;
  let as_outbox = options?.mode === 'outbox';
  
  let [filter,opts] = aa.q.filter(filter_raw);
  if (!filter 
  || (as_outbox && !filter.authors?.length))
  {
    aa.log('invalid filter: '+fid);
    return false
  }

  if (!options) options = opts;
  
  let results = [];

  if (!as_outbox)
  {
    let relays = options?.relays || aa.r.r;
    let request = {id,filter,relays,options};

    return new Promise(resolve=>
    {
      const abort = setTimeout(()=>{ resolve(results) },10000);
      const res =sheet=>
      {
        clearTimeout(abort);
        results.push(sheet);
        resolve(results);
      };

      try
      {
        aa.r.get(request).then(res).catch(res)
      }
      catch(er){ console.log(results,er) }
    })
  }

  // as outbox
  let outbox = aa.r.outbox(filter.authors);
  if (!outbox.length)
  {
    aa.log('no authors in outbox');
    return
  }

  delete filter.authors;
  
  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve(results)},10000);
    const res =sheet=>
    {
      results.push(sheet);
      if (results.length === outbox.length)
      {
        clearTimeout(abort);
        resolve(results);
      }
    };

    for (const [url,authors] of outbox)
    {
      let dis = 
      {
        id:id+aa.fx.rands(),
        filter:{...filter,authors},
        relays:[url],
        options
      }

      try
      {
        aa.r.get(dis).then(res).catch(res)
      }
      catch(er){console.log(results,er)}
      
    }
  })
};


// aa.q.help =()=>
// {
//   let mod = aa.q;
//   aa.log(aa.mk.doc(mod.readme))
// };


// request filter from id_a
// aa.fx.ida_filter =s=>
// {
//   let [k,p,d] = s.split(':');
//   return {kinds:[parseInt(k)],authors:[p],'#d':[d]}
// };


aa.q.last =(fid,filter)=>
{
  if (aa.q.o.ls[fid])
  {
    let q_last = aa.pj(sessionStorage.q_last);
    if (!q_last) q_last = {};
    if (!q_last[fid]) q_last[fid] = [];
    q_last[fid] = [...q_last[fid].slice(-100),filter];
    sessionStorage.q_last = JSON.stringify(q_last);
  }
};


aa.q.last_butts =()=>
{
  aa.mk.butts_session('q','run');
  aa.mk.butts_session('q','out');
  
  // if (!sessionStorage.q_last) return;
  // let q_last = aa.pj(sessionStorage.q_last);
  // console.log(q_last);
};


// on load
aa.q.load =async()=>
{
  let mod = aa.q;
  let id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['<query_id>','<JSON_filter>'],
      description:'add new query (request filter)',
      exe:mod.add
    },
    {
      action:[id,'db'],
      required:['<query_id>'],
      description:'run query on local db',
      exe:mod.db
    },
    {
      action:[id,'del'],
      required:['<query_id>'],
      description:'remove one or more filters',
      exe:mod.del
    },
    {
      action:[id,'run'],
      required:['<query_id>'],
      optional:['<url||set>'],
      description:'run filter on relay or set',
      exe:mod.run
    },
    {
      action:[id,'out'],
      required:['<query_id>'],
      description:'run filter in outbox mode (authors relays)',
      exe:mod.out
    },
    {
      action:[id,'req'],
      required:['<url||set>','<JSON_filter>'],
      description:'run raw request filter on relay or set',
      exe:mod.req
    },
    {
      action:[id,'close'],
      optional:['<query_id>'],
      description:'close one or all running queries',
      exe:mod.close
    },
    {
      action:[id,'reset'],
      description:'reset/add default queries',
      exe:mod.reset
    },
    {
      action:[id,'stuff'],
      description:'run base queries to get things started',
      exe:mod.stuff
    },
    {
      action:[id,'sub'],
      required:['fid'],
      optional:['relset'],
      description:'subscribe from last since',
      exe:mod.sub
    },
  );

  await aa.mod.load(mod);
  if (!mod.o?.subs)
  {
    mod.o.subs = {};
    aa.mod.save(mod);
  }
  aa.mod.mk(mod);
};


aa.q.log =(s,request,con)=>
{
  let [type,fid,filter,options] = request;

  aa.q.last(fid,filter);
  if (aa.q.o.ls[fid])
  {
    let q_last = aa.pj(sessionStorage.q_last);
    if (!q_last) q_last = {};
    if (!q_last[fid]) q_last[fid] = [];
    q_last[fid] = [...q_last[fid].slice(-10),filter];
    sessionStorage.q_last = JSON.stringify(q_last);
  }

  let id = `["${type.toUpperCase()}","${fid}"]`;
  let l = aa.el.get(id);
  if (!l)
  {
    l = aa.mk.details(id,0,0,'base');
    let close_butt = aa.mk.butt_action(`${aa.q.def.id} close ${fid}`);
    close_butt.addEventListener('click',e=>{('.l')?.remove()});
    l.append(close_butt);
    aa.el.set(id,l);
    aa.log(l);
  }
  else aa.logs.append(l.parentElement);
  
  let dis = aa.mk.details(s,0,0,'base');
  dis.append(
    make('p',{con}),' ',
    make('p',{app:aa.mk.ls({ls:{filter,options}})})
  );
  l.append(' ',dis);
};


// make q mod item
aa.q.mk =(key,value) =>
{
  const mod = aa.q;
  const id = mod.def.id;


  // const l = make('li',{id:`${id}_${key}`,cla:'item filter'});
  // let butts = make('span',{cla:'butts'});
  // butts.append(
  //   aa.mk.butt_action(`${id} del ${key}`,'del'),' ',
  //   aa.mk.butt_action(`${id} run ${key}`,'run'),' ',
  //   aa.mk.butt_action(`${id} out ${key}`,'out'),' ',
  // );
  // let l_k = make('span',{cla:'key',app:aa.mk.butt_action(`${id} add ${key} ${value.v}`,key,'add')});
  // let l_v = make('span',{cla:'val',con:value.v});
  // l.append(l_k,' ',l_v,' ',butts);
  // return l

    // k = url
  // v = {sets:[]}

  // element.dataset.state = 0;
  const texts = {};

  texts.val = `${value.v}`;
  texts.del = `${id} del ${key}`;
  texts.run = `${id} run ${key}`;
  texts.out = `${id} out ${key}`;
  texts.req = `${id} req read ${value.v}`;
  texts.add = `${id} add ${texts.val}`;
  

  let actions = make('div',
  {
    cla:'mod_actions',
    app:[
      aa.mk.butt_action(texts.del,'del','del'),
      ' ',aa.mk.butt_action(texts.add,'edit','add')
    ]
  });

  let butts = make('span',{cla:'butts'});
  for (const item of ['req','run','out'])
  {
    butts.append(aa.mk.butt_action(texts[item],item),' ')
  }
  
  const element = make('li',
  {
    cla:'item query',
    app:
    [
      make('span',{cla:'key',con:key}),
      ' ',make('span',{cla:'val',con:texts.val}),
      ' ',butts,
      ' ',actions
    ]
  });
  
  aa.el.set(key,element);
  return element 

};


// run filter with outbox
aa.q.out =async s=>
{
  const tasks = s.split(',');
  if (!aa.q.active.out) aa.q.active.out = [];
  for (const task of tasks)
  {
    const a = task.trim().split(' ');
    let id = a.shift();
    if (!Object.hasOwn(aa.q.o.ls,id))
    {
      aa.log(aa.q.def.id+' run: filter not found '+id);
      continue
    }
    
    aa.fx.a_add(aa.q.active.out,[id]);
    sessionStorage.q_out = aa.q.active.out;
    let request = aa.q.filter(aa.q.o.ls[id].v);
    request.unshift('REQ',id);
    aa.q.outbox(request);
  }
};


// demand request as outbox
aa.q.outbox =(request,more)=>
{
  let [type,fid,filter,options] = request;
  // fid = `${fid}_out`;
  let authors_len = filter?.authors?.length;
  if (!authors_len) 
  {
    aa.log('no authors for outbox');
    return;
  }

  let outbox = aa.r.outbox(filter.authors);
  if (!outbox.length)
  {
    aa.log('no authors in outbox');
    return;
  }
  
  aa.r.add(`${outbox.map(i=>i[0]).join(' out,')} out`);
  
  let callback = more?.on_sub || aa.e.print_q;
  aa.r.on_sub.set(fid,callback);
  aa.r.send_out({request:['REQ',fid,filter],outbox,options});

  if (!options.eose || options.eose !== 'close')
  {
    let txt = `outbox for ${authors_len} authors`;
    txt += `\nusing ${outbox.length} relays:\n`;
    txt += outbox.map(i=>`${i[0]} ${i[1].length}`).join(', ');
    aa.q.log('out',request,txt);
  }
};


// raw req
aa.q.req =(s='')=>
{
  let [rels,f] = s.split(aa.regex.fw);
  // let rels = a.shift();
  let relays = aa.r.rel(rels);
  let fid = 'req_'+aa.now;

  // const f = a.join('').replace(' ','');
  let [filter,options] = aa.q.filter(f.replace(' ',''));
  if (!filter)
  {
    aa.log('invalid filter: '+filter);
    return false
  }
  let request = ['REQ',fid,filter];
  if (!relays.length)
  {
    request.push(options);
    aa.q.outbox(request)
  }
  else
  {
    aa.r.on_sub.set(fid,aa.e.print_q);
    aa.r.send_req({request,relays,options});
    aa.q.log('req',request,`to: ${relays}`);
  }
};


// reset / add default query filters
aa.q.reset =(keys=[])=>
{
  if (!keys.length) keys = Object.keys(aa.q.ls);
  else keys = keys.filter(key=>Object.hasOwn(aa.q.ls,key));
  for (const key of keys)
    aa.q.add(`${key} ${JSON.stringify(aa.q.ls[key])}`,true);
};


// run filter
aa.q.run =async(s='')=>
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

      let [filtered,options] = aa.q.filter(aa.q.o.ls[fid].v);
      if (!filtered) 
      {
        aa.log(aa.q.def.id+' run: invalid filter')
        continue
      }
      request = ['REQ',fid,filtered];
      
      if (a.length) rels = a.shift();
      let relays = aa.r.rel(rels);
      if (!relays.length) relays = aa.r.r;
      aa.r.on_sub.set(fid,aa.e.print_q);
      setTimeout(()=>{ aa.r.send_req({request,relays,options}) },delay);
      delay = delay + 1000;
      
      aa.q.log('run',request,`to: ${relays}`);

    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};

aa.q.print =async(id,options)=>
{
  let sheets = await aa.q.get(id,options);
  if (!sheets) return;

  for (const sheet of sheets)
  {
    for (const [id,dat] of sheet.events)
      aa.e.print_q(dat)
  }
};


// fetch basic stuff to get things started
aa.q.stuff =async()=>
{
  let options = {eose:'close'};
  aa.log('getting your stuff (relays, metadata, follows, etc…)');
  await aa.q.print('a',{options});
  setTimeout(async()=>
  {
    aa.log('getting your stuff again now that we might have more relays…');
    await aa.q.print('a',{options});
    setTimeout(async()=>
    {
      aa.log('getting your follows stuff');
      await aa.q.print('b',{options});
      setTimeout(async()=>
      {
        aa.log('getting your follows stuff again but now in outbox mode');
        await aa.q.print('b',{options, mode:'outbox'});
        aa.log(make('p',{ content: 'all done ', app: aa.mk.reload_butt() }))
        sessionStorage.q_out = 'f';
        sessionStorage.q_run = 'n';
      },999);
    },666);
  },420)

  // for (const dat of sheet_1.events) aa.e.print_q(dat);
  // let sheet_2 = await aa.q.get('a',{options});
  // for (const dat of sheet_2.events) aa.e.print_q(dat);
  // let sheet_3 = await aa.q.get('b',{options});
  // for (const dat of sheet_3.events) aa.e.print_q(dat);
  // let sheet_4 = await aa.q.get('b',{options,mode:'outbox'});
  // for (const dat of sheet_4.events) aa.e.print_q(dat);
  
  // sessionStorage.q_out = 'f';
  // sessionStorage.q_run = 'n';
  // aa.log('getting your stuff (relays, metadata, follows, etc…)');
  // aa.q.run('a');
  // setTimeout(()=>
  // {
  //   aa.log('again now that we might have more relays…');
  //   aa.q.run('a') 
  // },1400);
  // setTimeout(()=>
  // {
  //   aa.log('getting your follows stuff');
  //   aa.q.run('b') 
  // },3000);
  // setTimeout(()=>
  // {
  //   console.log(JSON.stringify(aa.u.p));
  //   aa.log('getting your follows stuff again but now in outbox mode');
  //   aa.q.out('b');
  //   sessionStorage.q_out = 'f';
  //   sessionStorage.q_run = 'n';
  //   setTimeout(()=>
  //   {
  //     aa.log(make('p',
  //     {
  //       con:'wait a bit while events load, then ',
  //       app:aa.mk.reload_butt()
  //     }))
  //   },2000);
  // },8000);
};


aa.q.stamp =async(id,timestamp)=>
{
  let mod = aa.q;
  let sub = mod.o.ls[id];
  if (!sub) return;
  let changed;
  if (!sub.since || sub.since > timestamp)
  {
    sub.since = timestamp;
    changed = true;
  }
  if (!sub.until || sub.until < timestamp)
  {
    sub.until = timestamp;
    changed = true;
  }
  
  if (changed)
  {
    debt.add(()=>
    {
      // console.log('aa.q.stamp saved',id);
      aa.mod.save(mod);
    }, 2100, `q.stamp_${id}`)
  }
};


// sub filter
aa.q.sub =async s=>
{
  let txt = `${aa.q.def.id} run:`;
  let ls = aa.q.o.ls;
  
  const tasks = s.split(',');
  for (const task of tasks)
  {
    let [fid,rels] = task.trim().split(' ');
    if (!Object.hasOwn(ls,fid))
    {
      aa.log(`${txt} filter not found ${fid}`);
      continue
    }

    // txt += ` ${fid}`;
    let relays = aa.r.rel(rels);
    // if (!relays.length) relays = aa.r.r;
    // if (!relays.length)
    // {
    //   aa.log(`${txt} no relays provided`);
    //   continue
    // }

    let [filter,options] = aa.q.filter(ls[fid].v);
    
    fid = `${fid}_sub`;

    let since = aa.q.o.subs[fid];
    if (since) 
    {
      if (!filter.since || filter.since < since) 
        filter.since = since + 1;
    }
    
    let request = ['REQ',fid,filter];
    let more =
    { 
      on_sub: dat=>
      {
        if (!aa.q.o.subs[fid]) aa.q.o.subs[fid] = 1;
        if (aa.q.o.subs[fid] < dat.event.created_at)
        {
          aa.q.o.subs[fid] = dat.event.created_at;
          debt.add(()=>{ aa.mod.save(aa.q) },666,fid)
        }
        aa.e.print_q(dat)
      } 
    };

    if (!relays.length)
    {
      request.push(options);
      aa.q.outbox(request,more)
    }
    else
    {
      relays = aa.r.r;
      aa.r.on_sub.set(fid,more.on_sub);
      aa.r.send_req({request,relays,options});
      aa.q.log('req',request,`to: ${relays}`);
    }

    aa.q.log('sub',request,`to: ${relays}`);
  }
};