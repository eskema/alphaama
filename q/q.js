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
  def:{id:'q',ls:{},subs:{},reqs:{}},
  ls:
  {
    a:
    {
      "authors":["u"],
      "kinds":[0,3,10000,10001,10002,10003,10004,10005,10006,10007,10050,10063]
    },
    b:
    {
      "authors":["k3"],
      "kinds":[0,3,10002,10050]
    },
    c:
    {
      "authors":["k3"],
      "kinds":[0,10002]
    },
    f:
    {
      "authors":["u","k3"],
      "kinds":[1,6,7,11,16,20,21,22,1111,9802,30023,30818],
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
    m:{"#p":["u"],"kinds":[1059],"since":"n_21","limit":500},
    tag:{"#t":["s"],"limit":200},
    u:{"authors":["u"],"since":"n_7","limit":500},
    z:{"kinds":[9735],"#P":["u","k3"],"since":"h_24"},
    zaps:{"kinds":[9735],"#p":["u","k3"],"since":"h_24"},
  },
  scripts:
  [
    '/q/spells.js',
    '/q/views.js',
  ],
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


// set query description
aa.q.about_set =s=>
{
  let [fid,...rest] = s.trim().split(aa.regex.fw);
  let about = rest.join(' ').trim();
  let mod = aa.q;
  if (!Object.hasOwn(mod.o.ls,fid))
  {
    aa.log(`${mod.def.id} about: filter not found ${fid}`);
    return
  }
  mod.o.ls[fid].about = about || undefined;
  aa.mod.save(mod);
  aa.mod.ui(mod,fid);
  aa.log(`${mod.def.id} ${fid} about: ${about || '(cleared)'}`);
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
  let con = aa.cmd(`${mod.def.id} add ${fid} `);
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
  if (s) sessionStorage.q_db = s;
  const tasks = aa.fx.splitr(s,',');
  let times = 0;
  for (const task of tasks)
  {
    const a = aa.fx.splitr(task);
    let fid,request;
    if (a.length) fid = a.shift();
    if (fid && aa.q.o.ls.hasOwnProperty(fid))
    {
      let filter = aa.q.o.ls[fid].v;
      let [filtered] = aa.q.filter(filter);
      if (!filtered) 
      {
        aa.log(aa.q.def.id+' db: invalid filter')
        continue
      }
      
      times++;
      let [get_id,events] = await aa.r.get_filter(filtered);
      for (const dat of events) aa.bus.emit('e:print_q', dat);
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
  filter = structuredClone(filter);

  let options = {};

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
            if (Object.hasOwn(aa.u?.o?.ls,val))
            {
              filter[key] = filter[key].filter(i=>i!==val);
              filter[key].push(...aa.u.o.ls[val].split(' '));
            }
          }
        }
        if (!filter[key].length)
        {
          aa.log('vars: invalid filter');
          return []
        }
        else
        {
          // dedupe expanded values (defends against polluted variables like ls.k3)
          if (filter[key].length !== new Set(filter[key]).size)
            filter[key] = [...new Set(filter[key])];

          if (key === 'authors'
          || key === 'ids'
          || key === '#p'
          || key === '#e')
          {
            if (filter[key].some(val=>!aa.fx.is_hex(val)))
            {
              aa.log(`invalid filter: ${filter[key]}`);
              return []
            }
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
    aa.el.get(`mod_q_query_${k}`).remove();
    // document.getElementById(mod.def.id+'_'+aa.fx.an(k))?.remove();
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
  if (!filter)
  {
    aa.log('invalid filter: '+fid);
    return false
  }

  let {keys:outbox_keys,outbox:outbox_map} = as_outbox ? aa.q.outbox_key(filter) : {};
  if (as_outbox && !outbox_keys?.length)
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
  if (!outbox_map.length)
  {
    aa.log('no authors in outbox');
    return
  }

  for (const {key} of outbox_keys) delete filter[key];

  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve(results)},10000);
    const res =sheet=>
    {
      results.push(sheet);
      if (results.length === outbox_map.length)
      {
        clearTimeout(abort);
        resolve(results);
      }
    };

    for (const [url,all_pubs] of outbox_map)
    {
      let f = {...filter};
      for (const {key,pubkeys} of outbox_keys)
      {
        let relevant = pubkeys.filter(p => all_pubs.includes(p));
        if (relevant.length) f[key] = relevant;
      }
      let dis =
      {
        id:id+aa.fx.rands(),
        filter:f,
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
  const butts = make('span');
  const id = 'q';
  for (const s of ['view','run','out','sub','db'])
  {
    let dis = `${id}_${s}`;
    if (sessionStorage.getItem(dis))
    {
      butts.append(aa.mk.butt_action(`${id} ${s} ${sessionStorage[dis]}`),' ');
    }
  }
  if (butts.childElementCount)
  {
    let l = aa.log(butts);
    l.classList.add('log_pinned');
  }
};


// on load
aa.q.load =async()=>
{
  let mod = aa.q;
  let id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'about'],
      required:['<query_id>','<text>'],
      description:'set query description',
      exe:mod.about_set
    },
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
      action:[id,'view'],
      required:['<id||filter||search>'],
      description:'open filter as a view',
      exe:mod.view
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
    {
      action:['k','777'],
      required:['<query_id>'],
      description:'create spell event (kind:777) from query',
      exe:aa.mk.k777
    },
  );

  await aa.mod.load(mod);
  let needs_save;
  if (!mod.o?.subs) { mod.o.subs = {}; needs_save = true; }
  if (!mod.o?.reqs) { mod.o.reqs = {}; needs_save = true; }
  if (needs_save) aa.mod.save(mod);
  aa.mod.mk(mod);

  // register spell render
  aa.bus.emit('e:render_add', 'spell', [777], aa.q.render_spell);

  // bus listener (breaks r -> q circular dependency)
  aa.bus.on('q:stamp', (sub, ts) => aa.q.stamp(sub, ts));
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

  const texts = {};

  texts.val = `${value.v}`;
  texts.del = `${id} del ${key}`;
  texts.run = `${id} run ${key}`;
  texts.sub = `${id} sub ${key}`;
  texts.out = `${id} out ${key}`;
  texts.req = `${id} req read ${value.v}`;
  texts.add = `${id} add ${key} ${texts.val}`;

  let preview_text = value.about || texts.val;
  let about_preview = preview_text.length > 30
    ? preview_text.slice(0,30) + '…'
    : preview_text;

  let butts = make('span',{cla:'butts'});
  butts.append(make('a',
  {
    cla:'a butt',
    ref:`#req?req=${key}`,
    con:'view',
    clk:aa.clk.a
  }),' ');
  for (const item of ['req','sub','run','out'])
  {
    butts.append(aa.mk.butt_action(texts[item],item),' ')
  }

  let actions = make('div',
  {
    cla:'mod_actions',
    app:[
      aa.mk.butt_action(texts.del,'del','del'),
      ' ',aa.mk.butt_action(texts.add,'edit','add')
    ]
  });

  let content = make('div',
  {
    app:[
      value.about ? make('p',{cla:'about',con:value.about}) : '',
      make('p',{cla:'val',con:texts.val}),
      actions
    ]
  });

  let details = aa.mk.details(key,content,0,'mod_details');
  details.firstElementChild.append(' ',make('span',{cla:'q_about_preview',con:about_preview}));

  const element = make('li',
  {
    cla:'item query',
    app:[details,' ',butts]
  });

  aa.el.set(`mod_q_query_${key}`,element);
  return element

};


// convert a JSON filter object to req view URL search params
aa.q.view_search =filter=>
{
  let p = new URLSearchParams();
  for (const [k,v] of Object.entries(filter))
  {
    // strip # prefix for tag filters in URL
    let pk = k.startsWith('#') ? k.slice(1) : k;
    if (Array.isArray(v)) p.set(pk,v.join(','));
    else p.set(pk,String(v));
  }
  return p.toString()
};

// open filter as a view
// accepts: filter id, JSON filter, or URL search string
aa.q.view =s=>
{
  s = s.trim();
  let search;

  // JSON filter
  let o = aa.pj(s);
  if (o)
  {
    let [expanded] = aa.q.filter(o);
    if (!expanded)
    {
      aa.log(aa.q.def.id+' view: invalid filter');
      return
    }
    search = aa.q.view_search(o);
  }
  // URL search string (has = in it)
  else if (s.includes('='))
  {
    let p = new URLSearchParams(s);
    if (!p.toString().length)
    {
      aa.log(aa.q.def.id+' view: invalid search string');
      return
    }
    search = p.toString();
  }
  // filter id
  else
  {
    if (!Object.hasOwn(aa.q.o.ls,s))
    {
      aa.log(aa.q.def.id+' view: filter not found '+s);
      return
    }
    search = `req=${s}`;
  }

  sessionStorage.q_view = s;
  if (!aa.q.o.reqs[search])
  {
    aa.q.o.reqs[search] = {ts: Date.now()};
    aa.mod.save_to(aa.q);
  }
  aa.view.state('#req',search);
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


// outbox source: collect pubkeys from authors, #p, #P — do relay lookup per set, merge
aa.q.outbox_key =filter=>
{
  let keys = [];
  if (filter?.authors?.length) keys.push({key:'authors', pubkeys:filter.authors, sets:['write','k10002']});
  if (filter?.['#p']?.length) keys.push({key:'#p', pubkeys:filter['#p'], sets:['read','k10002']});
  if (filter?.['#P']?.length) keys.push({key:'#P', pubkeys:filter['#P'], sets:['read','k10002']});
  if (!keys.length) return {};

  // relay lookup per group, merge into single map {url: Set(pubkeys)}
  let merged = {};
  for (const g of keys)
  {
    let ob = aa.r.outbox(g.pubkeys, g.sets);
    for (const [url, pubs] of ob)
    {
      if (!merged[url]) merged[url] = new Set();
      for (const p of pubs) merged[url].add(p);
    }
  }

  let outbox = Object.entries(merged).map(([url,s]) => [url,[...s]]);
  outbox.sort(aa.fx.sorts.len);
  return {keys, outbox}
};


// demand request as outbox
aa.q.outbox =(request,more)=>
{
  let [type,fid,filter,options] = request;
  // fid = `${fid}_out`;

  let {keys,outbox} = aa.q.outbox_key(filter);
  if (!keys?.length)
  {
    aa.log('no authors for outbox');
    return;
  }
  if (!outbox.length)
  {
    aa.log('no authors in outbox');
    return;
  }

  aa.r.add(`${outbox.map(i=>i[0]).join(' out,')} out`);

  let callback = more?.on_sub || (dat => aa.bus.emit('e:print_q', dat));
  aa.r.on_sub.set(fid,callback);
  aa.r.send_out({request:['REQ',fid,filter],outbox,outbox_keys:keys,options});

  if (!options.eose || options.eose !== 'close')
  {
    let all = [...new Set(keys.flatMap(k => k.pubkeys))];
    let txt = `outbox for ${all.length} pubkeys (${keys.map(k=>k.key).join(', ')})`;
    txt += `\nusing ${outbox.length} relays:\n`;
    txt += outbox.map(i=>`${i[0]} ${i[1].length}`).join(', ');
    aa.q.log('out',request,txt);
  }
};


// raw req
aa.q.req =(s='')=>
{
  let [rels,f] = s.split(aa.regex.fw);
  let fid = 'req_'+aa.now;

  let [filter,options] = aa.q.filter(f.replace(' ',''));
  if (!filter)
  {
    aa.log('invalid filter: '+filter);
    return false
  }

  // db-only query
  if (rels === 'db')
  {
    aa.r.get_filter(filter).then(([get_id,events])=>
    {
      for (const dat of events) aa.bus.emit('e:print_q', dat);
    });
    aa.q.log('req',['REQ',fid,filter],'to: db');
    return
  }

  let as_outbox = rels === 'out';
  let relays = as_outbox ? [] : aa.r.rel(rels);
  let request = ['REQ',fid,filter];
  if (!relays.length && !as_outbox)
  {
    aa.log(`${aa.q.def.id} req: no relays for ${rels}`);
    return
  }
  if (as_outbox || !relays.length)
  {
    request.push(options);
    aa.q.outbox(request)
  }
  else
  {
    aa.r.on_sub.set(fid, dat => aa.bus.emit('e:print_q', dat));
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
      if (!relays.length && !rels) relays = aa.r.r;
      if (!relays.length)
      {
        aa.log(`${aa.q.def.id} run: no relays for ${rels || 'default'}`);
        continue
      }
      aa.r.on_sub.set(fid, dat => aa.bus.emit('e:print_q', dat));
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

  let max_ts = 0;
  for (const sheet of sheets)
  {
    for (const [eid,dat] of sheet.events)
    {
      if (dat.event.created_at > max_ts) max_ts = dat.event.created_at;
      aa.bus.emit('e:print_q', dat)
    }
  }

  if (options?.sub && max_ts)
  {
    let sub_id = `${id}_sub`;
    if (!aa.q.o.subs[sub_id] || aa.q.o.subs[sub_id] < max_ts)
    {
      aa.q.o.subs[sub_id] = max_ts;
      aa.mod.save(aa.q);
    }
  }
};


// fetch basic stuff to get things started
//
// staged pipeline — each stage awaits the prior one's data to be processed
// so the next stage can use it. stages use inline filters (not aa.q.ls) so
// the sequencing is explicit and doesn't depend on variable expansion.
//
// stage 1  — your k10002 (relay list) from bootstrap reads
// stage 2a — your k0 + k3 first, on your own relays; wait for k3 to apply so
//            later stages have your follows list. separate from 2b so the
//            list kinds don't compete for bandwidth with the critical k3.
// stage 2b — your other list kinds (mute, search, blocked, emoji, DM, etc.)
// stage 3  — follows' k10002, needed for stage 4's outbox routing
// stage 4  — follows' k0 + k3 + k10050 via outbox
aa.q.stuff =async()=>
{
  const options = {eose:'close'};
  const pubkey = aa.u.p?.pubkey;
  if (!pubkey) { aa.log('q stuff: no pubkey'); return }

  // direct fetch via aa.r.get + emit results to print_q so handlers run
  const grab =async(filter, relays)=>
  {
    let id = 'stuff_' + aa.fx.rands();
    let sheet = await aa.r.get({id, filter, relays: relays?.length ? relays : aa.r.r, options});
    for (const [, dat] of sheet.events) aa.bus.emit('e:print_q', dat);
    return sheet;
  };

  // outbox-routed fetch — groups authors by each of their declared write
  // relays (from k10002) and fans out per-relay queries in parallel.
  const grab_outbox =async filter=>
  {
    let {keys, outbox} = aa.q.outbox_key(filter);
    if (!keys?.length || !outbox?.length)
    {
      aa.log('q stuff: no outbox routing available — skipping');
      return
    }
    let base = {...filter};
    for (const {key} of keys) delete base[key];

    let promises = [];
    for (const [url, pubs] of outbox)
    {
      let f = {...base};
      for (const {key, pubkeys} of keys)
      {
        let relevant = pubkeys.filter(p => pubs.includes(p));
        if (relevant.length) f[key] = relevant;
      }
      let id = 'stuff_out_' + aa.fx.rands();
      promises.push(aa.r.get({id, filter: f, relays: [url], options}));
    }
    let sheets = await Promise.all(promises);
    for (const sheet of sheets)
      for (const [, dat] of sheet.events) aa.bus.emit('e:print_q', dat);
  };

  // wait for a readiness signal, short-circuit if the condition already holds
  // (fire_ready so the race resolves immediately), cap with a timeout
  const wait =(key, check, ms=3000)=>
  {
    if (check && check()) aa.mod.fire_ready(key);
    return Promise.race(
    [
      new Promise(resolve => aa.mod.ready(key, resolve)),
      aa.fx.delay(ms),
    ])
  };

  // does p have any k10002-tagged relays?
  const has_k10002 =p=>
    !!p?.relays && Object.values(p.relays).some(r => r.sets?.includes('k10002'));

  // stage 1 — your relay list
  aa.log('q stuff 1/4: finding your relays');
  await grab({authors:[pubkey], kinds:[10002]});
  await wait('u:k10002', () => has_k10002(aa.u.p));

  // stage 2a — your profile + follows, prioritised so k3 lands before list kinds
  aa.log('q stuff 2/4: getting your profile and follows');
  await grab({authors:[pubkey], kinds:[0,3]});
  await Promise.all(
  [
    wait('u:k0', () => !!aa.u.p?.metadata),
    wait('u:follows', () => !!aa.u.o.ls.k3?.length),
  ]);

  // stage 2b — remaining list kinds (background, non-critical)
  grab({authors:[pubkey], kinds:[10000,10001,10003,10004,10005,10006,10007,10050,10063]});

  let follows = aa.u.o.ls.k3 ? aa.u.o.ls.k3.split(' ').filter(Boolean) : [];
  if (!follows.length)
  {
    aa.log('q stuff: no follows — done');
  }
  else
  {
    // stage 3 — follows' relay lists, so stage 4 can route via outbox
    aa.log(`q stuff 3/4: getting ${follows.length} follows' relays`);
    await grab({authors: follows, kinds:[10002]});
    // no single readiness for N follows — small ceiling to let handlers apply
    await aa.fx.delay(1500);

    // stage 4 — follows' profile + follow lists + DM relays via outbox
    let ready_count = follows.filter(pk => has_k10002(aa.db.p[pk])).length;
    aa.log(`q stuff 4/4: ${ready_count}/${follows.length} follows have k10002 — fetching via outbox`);
    await grab_outbox({authors: follows, kinds:[0,3,10050]});
  }

  // finalize
  setTimeout(()=>
  {
    sessionStorage.q_out = 'f';
    sessionStorage.q_run = 'n';
    aa.log(make('p',
    {
      content: 'all done ',
      app: aa.mk.reload_butt()
    }),{pinned:true});
    // non-critical modules (e.g. d) gate their restore on this signal
    aa.mod.fire_ready('u:ready');
  },1000);
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
aa.q.sub =async(s, silent)=>
{
  if (s) sessionStorage.q_sub = s;
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

    let as_outbox = rels === 'out';
    let relays = as_outbox ? [] : aa.r.rel(rels);
    if (!relays.length && !as_outbox && !rels) relays = aa.r.r;
    if (!relays.length && !as_outbox)
    {
      aa.log(`${txt} no relays for ${rels}`);
      continue
    }

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
        aa.bus.emit('e:print_q', dat)
      }
    };

    if (as_outbox)
    {
      request.push(options);
      aa.q.outbox(request,more)
    }
    else
    {
      aa.r.on_sub.set(fid,more.on_sub);
      aa.r.send_req({request,relays,options});
    }

    if (!silent) aa.q.log('sub',request,`to: ${as_outbox ? 'outbox' : relays}`);
  }
};