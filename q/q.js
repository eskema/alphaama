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
  def:{id:'q',ls:{}},
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
  }
};


// add filter
aa.q.add =(s='',silent)=>
{
  let [fid,s_filter] = s.split(aa.fx.regex.fw);
  fid = aa.fx.an(fid);
  let o = aa.parse.j(s_filter);
  if (!o)
  {
    aa.log('invalid filter: '+s_filter);
    return ''
  }
  let mod = aa.q;
  let con = `${localStorage.ns} ${mod.def.id} add ${fid} `;
  let filter = mod.o.ls[fid];
  let is_new;
  let changed;

  if (filter)
  {
    if (filter.v === s) con += '=== is the same';
    else
    {
      con += filter.v+' > '+s_filter;
      filter.v = s_filter;
      changed = true;
    }
  }
  else
  {
    mod.o.ls[fid] = {v:s_filter};
    con += mod.o.ls[fid].v;
    changed = true;
    is_new = true;
  }
  if (changed)
  {
    aa.mod.save(mod);
    aa.mod.ui(mod,fid);
  }
  // let q_add = aa.temp.q_add;
  // if (!q_add) 
  // {
  //   q_add = aa.temp.q_add = aa.mk.details('q add …');
  //   aa.log(q_add);
  // }
  // q_add.append(aa.mk.l('p',{con}))
  if (!silent)
  {
    let l = aa.mk.l('p',{con});
    aa.log(l);
    aa.fx.scroll(l);
  }
  return fid
};


// close one or all active queries
aa.q.close =s=>
{
  for (const id of aa.fx.splitr(s)) aa.r.close(id);
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
    aa.log(aa.mk.l('p',{con,app}));

    delete mod.o.ls[k];
    document.getElementById(mod.def.id+'_'+aa.fx.an(k))?.remove();
    aa.mod.save(mod);
  }
  else aa.log(mod.def.id+' '+k+' not found')
};


aa.q.get =(s='')=>
{
  let [rels,s_filter] = s.split(aa.fx.regex.fw);
  let id = 'get_'+aa.now;

  // const f = a.join('').replace(' ','');
  let [filter,options] = aa.q.filter(s_filter.replace(' ',''));
  if (!filter)
  {
    aa.log('invalid filter:'+s_filter);
    return false
  }
  let relays = aa.r.rel(rels);
  aa.r.get({id,filter,relays,options}).then(dis=>console.log(dis))
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
    let q_last = aa.parse.j(sessionStorage.q_last);
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
  // let q_last = aa.parse.j(sessionStorage.q_last);
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
    // {
    //   action:[id,'sub'],
    //   required:['fid'],
    //   optional:['relset'],
    //   description:'testing new relay code',
    //   exe:mod.sub
    // },
  );

  await aa.mod.load(mod);
  aa.mod.mk(mod);
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
aa.q.out =async s=>
{
  const tasks = s.split(',');
  if (!aa.q.active.out) aa.q.active.out = [];
  for (const task of tasks)
  {
    const a = task.trim().split(' ');
    let fid = a.shift();
    if (!Object.hasOwn(aa.q.o.ls,fid))
    {
      aa.log(aa.q.def.id+' run: filter not found '+fid);
      continue
    }
    
    aa.fx.a_add(aa.q.active.out,[fid]);
    sessionStorage.q_out = aa.q.active.out;
    let request = aa.q.filter(aa.q.o.ls[fid].v);
    request.unshift('REQ',fid);
    aa.q.outbox(request);
  }
};


// demand request as outbox
aa.q.outbox =request=>
{
  let [type,fid,filter,options] = request;
  
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
  aa.r.on_sub.set(fid,aa.e.to_printer);
  aa.r.send_out({request:['REQ',fid,filter],outbox,options});
  // for (const r of outbox)
  // {
  //   let url = r[0];
  //   let f = {...filter};
  //   f.authors = r[1];
    
  //   let request = ['REQ',fid,f];
  //   let relays = [url];
    
  //   aa.r.send_req({request,relays,options});
  // }
  // note log
  if (!options.eose || options.eose !== 'close')
  {
    let txt = `outbox for ${authors_len} authors`;
    txt += `\nusing ${outbox.length} relays:\n`;
    txt += outbox.map(i=>`${i[0]} ${i[1].length}`).join(', ');
    aa.q.log('out',request,txt);
  }
  
};


// takes a string and
// returns an array with a request filter and options
aa.q.filter =(s,x)=>
{
  const filter = typeof s === 'string' ? aa.parse.j(s) : s;
  if (!filter) return [];

  let options = {};
  let p;
  if (!x) x = aa.u.p.pubkey;
  if (!x) aa.log('vars: no u');
  else p = aa.db.p[x];

  for (const k in filter)
  {
    const v = filter[k];
    switch (k)
    {
      case 'eose':
        options.eose = v;
        delete filter[k];
        break;
      case 'since':
      case 'until':
        if (typeof v === 'string') filter[k] = aa.fx.time_convert(v);
        break;
      default:
        if (Array.isArray(v)) for (const val of v)
        {
          if (typeof val === 'string')
          {
            switch (val)
            {
              case 'u':
              case 'x':
                filter[k] = filter[k].filter(dis=>dis!==val);
                if (x) filter[k].push(x);
                break;
              case 'k3':
                filter[k] = filter[k].filter(dis=>dis!==val);
                if (p) filter[k].push(...p.follows);
                break;
            }
          }
          if (!filter[k].length) 
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



// raw req
aa.q.req =(s='')=>
{
  let [rels,f] = s.split(aa.fx.regex.fw);

  let a = s.split(' ');
  // let rels = a.shift();
  let relays = aa.r.rel(rels);
  let fid = 'req_'+aa.now;

  // const f = a.join('').replace(' ','');
  let [filter,options] = aa.q.filter(f.replace(' ',''));
  if (!filter)
  {
    aa.log('invalid filter:'+filt);
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
    aa.r.on_sub.set(fid,aa.e.to_printer);
    aa.r.send_req({request,relays,options});
    // request.push(options);
    aa.q.log('req',request,`to: ${relays}`);
  }
};


// reset / add default query filters
aa.q.reset =(keys=[])=>
{
  if (!keys.length) keys = Object.keys(aa.q.ls);
  else keys = keys.filter(key=>Object.hasOwn(aa.q.ls,key));
  
  for (const key of keys) aa.q.add(`${key} ${JSON.stringify(aa.q.ls[key])}`,1);
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
      if (filtered) request = ['REQ',fid,filtered];
      
      if (a.length) rels = a.shift();
      let relays = aa.r.rel(rels);
      if (!relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
      aa.r.on_sub.set(fid,aa.e.to_printer);
      setTimeout(()=>{ aa.r.send_req({request,relays,options}) },delay);
      delay = delay + 1000;
      
      aa.q.log('run',request,`to: ${relays}`);

    } 
    else aa.log(aa.q.def.id+' run: filter not found');
  }
};



// fetch basic stuff to get things started
aa.q.stuff =async()=>
{
  aa.q.run('a');
  setTimeout(()=>{ aa.q.run('a') },1000);
  setTimeout(()=>{ aa.q.run('b') },2000);
  setTimeout(()=>
  {
    aa.q.out('b');
    sessionStorage.q_out = 'f';
    sessionStorage.q_run = 'n';
  },3000);
  // setTimeout(()=>
  // {
  //   sessionStorage.q_out = 'f';
  //   sessionStorage.q_run = 'n';
    
  //   // aa.q.last_butts();
  // },4000);
  
  // let con = 'q stuff:\n';
  // let butt_a = ['req your data (relays,metadata,follows,mints,walLNuts)','plug','q_stuff_run_a'];
  // let butt_b = ['req basic data from your follows','plug','q_stuff_run_b']
  // const app = 
  // [
  //   aa.mk.butt_clk(butt_a),
  //   ' then ',
  //   aa.mk.butt_clk(butt_b)
  // ];
  // let text = aa.mk.l('p',{con,app})
  // aa.log(text);
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
    txt += ` ${fid}`;
    let relays = aa.r.rel(rels);
    if (!relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
    if (!relays.length)
    {
      aa.log(`${txt} no relays provided`);
      continue
    }

    let [filter,options] = aa.q.filter(ls[fid].v);
    let request = ['REQ',fid,filter,options];
        
    aa.r.w.postMessage([['req',request,relays]]);
    // let a = [aa.r.a.ms];
    // for (const url of relays) aa.r.lay(url,{a,request});
    aa.q.log('sub',request,`to: ${relays}`);
  }
};


aa.q.log =(s,request,con)=>
{
  let [type,fid,filter,options] = request;

  aa.q.last(fid,filter);
  if (aa.q.o.ls[fid])
  {
    let q_last = aa.parse.j(sessionStorage.q_last);
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
  
  let dis = aa.mk.details(s,0,1,'base');
  dis.append(
    aa.mk.l('p',{con}),' ',
    aa.mk.l('p',{app:aa.mk.ls({ls:{filter,options}})})
  );
  l.append(' ',dis);
};