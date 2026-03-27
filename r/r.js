/*

alphaama
mod    r
relays

*/


aa.r =
{
  name:'relays',
  about:'manage relays',
  active:{},
  def:
  {
    id:'r',
    ls:{},
    r:'read',
    w:'write',
  },
  manager_src:'/r/manager.js?v='+aa_version,
  scripts:
  [
    '/r/mk.js',
    '/r/msg.js',
  ],
  styles:
  [
    '/r/r.css',
  ],
  butts:
  {
    mod:[],
    init:
    [
      ['r stuff','stuff']
    ]
  },
  temp: new Map(),
  on_sub:new Map(),
  on_eose:new Map(),
  get r(){ return aa.fx.in_set(this.o.ls,this.o.r) },
  get w(){ return aa.fx.in_set(this.o.ls,this.o.w) }
};


// add relays
aa.r.add =s=>
{
  const mod = aa.r;

  const valid = new Set();
  const invalid = new Set();
  const off = new Set();
  const changed = new Map();

  const items = aa.fx.splitr(s,',');

  let df = new DocumentFragment();

  for (const i of items)
  {
    let a = aa.fx.splitr(i);
    // [url,set1,set2]
    let url_to_check = a.shift();
    const url = aa.fx.url(url_to_check)?.href;
    if (!url)
    {
      invalid.add(url_to_check);
      continue;
    }
    if (a.includes('db'))
    {
      a = a.filter(s => s !== 'db');
      aa.log("'db' is a reserved set name");
      if (!a.length) continue;
    }

    if (!Object.hasOwn(mod.o.ls,url))
    {
      mod.o.ls[url] = {sets:[]};
      changed.set(url,a);
    }
    
    if (!aa.fx.a_add(mod.o.ls[url].sets,a)) continue;
    
    changed.set(url,a);
    if (a.includes('off')) off.add(url);
    else valid.add(url);
    df.append(make('p',{con:`${url} ${a.join(' ')}`}))
  }
  
  if (invalid.size) 
  {
    aa.log(`aa.r.add - invalid urls: ${[...invalid]}`);
    console.trace('invalid urls',invalid);
  }
  
  if (changed.size)
  {
    aa.mod.save_to(mod);
    let cla = 'relays added';
    let log = aa.el.get(cla);
    if (!log)
    {
      log = aa.mk.details(cla,0,0,'base'); // ,make('div',{cla:'list'})
      aa.el.set(cla,log);
      aa.log(log);
    }
    fastdom.mutate(()=>{log.append(df)});
    let relays = {};
    for (const key of changed.keys()) relays[key] = mod.o.ls[key];
    aa.r.manager.postMessage(['relays',relays]);
  }

  // let [valid,invalid,off] = aa.mod.serve rs_add(aa.r,s,cla);
  let union = valid.union(off);
  if (union.size) aa.mod.ui(mod,[...union]);
  if (off.size) aa.r.force_close([...off]); 
};


// add relays from object
aa.r.add_from_o =relays=>
{
  //o = {'wss://url.com':{sets:['read','write'}}
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) aa.r.add(a.join(','));
};


// // authenticate to relay with main keys
// aa.r.auth =async a=>
// {
//   console.log(a);
//   let [s,event,relay] = a;
//   event = aa.e.normalise(event);
//   event.tags = aa.fx.a_u(event.tags);
//   if (!event.id) event.id = aa.fx.hash(event);
//   let signed = await aa.e.sign(event);
//   if (signed) aa.r.manager.postMessage(['auth',{relays:[relay],request:['AUTH',signed]}]);
// };


// broadcast event from id to relays
// s = 'id relay|set relay|set'
aa.r.bro =async(s='')=>
{
  let [id,...args] = s.split(' ');
  let dat = await aa.bus.request('e:get', id);
  if (!dat)
  {
    aa.log('r bro: event not found');
    return
  }

  let relays = [];
  for (const arg of args)
  {
    let resolved = aa.r.rel(arg);
    if (resolved.length) relays.push(...resolved);
    else
    {
      let url = aa.fx.url(arg)?.href;
      if (url)
      {
        if (!aa.r.o.ls[url]) aa.r.add(`${url} bro`);
        relays.push(url);
      }
    }
  }

  if (!relays.length && dat.seen?.length)
    relays = aa.r.w.filter(r => !dat.seen.includes(r));
  aa.r.send_event({event:dat.event,relays});
};



// given a list of pubkeys
// return list of relays in common by the pubkeys
aa.r.common =(pubkeys=[],sets=[])=>
{
  let common = {};
  let offed = aa.fx.in_set(aa.r.o.ls,'off',0);
  const now = Date.now() / 1000;
  for (const pubkey of pubkeys)
  {
    let has_set;
    let relays = aa.db.p[pubkey]?.relays;
    if (relays)
    {
      relays = aa.fx.in_sets_all(relays,sets);
      if (relays.length) has_set = true;
    }
    else relays = [];

    for (let url of relays)
    {
      url = aa.fx.is_valid_relay(aa.fx.url(url));
      if (!url || offed.includes(url)) continue;
      const r = aa.r.o.ls[url];
      if (r?.retry_after && now < r.retry_after) continue;
      if (!common[url]) common[url] = new Set();  // Use Set for O(1) deduplication
      common[url].add(pubkey);  // Set automatically handles duplicates
    }

    if (!has_set)
    {
      if (!common.none) common.none = [];
      aa.fx.a_add(common.none,[pubkey]);
    }
  }

  // Convert Sets back to arrays
  for (const url in common)
  {
    if (common[url] instanceof Set) common[url] = [...common[url]];
  }

  return common
};


// close relay connection
aa.r.close =id=>
{
  aa.r.manager.postMessage(['close',id]);
};


// default request 
aa.r.def_req =(id,filter,relays)=>
{
  const request = ['REQ',id,filter];
  const options = {eose:'close'};
  if (!relays?.length) relays = aa.r.r;
  if (!aa.r.on_sub.has(id)) aa.r.on_sub.set(id, dat => aa.bus.emit('e:print_q', dat));
  aa.r.on_eose.set(id,()=>
  {
    aa.r.on_eose.delete(id);
    aa.r.on_sub.delete(id);
  });
  aa.r.send_req({request,relays,options});
};



// nip-50 search
aa.r.search =(s='')=>
{
  if (!s) return;
  const relays = aa.r.rel('search').length ? aa.r.rel('search') : aa.r.r;
  aa.r.def_req('search_'+aa.now, {search:s,limit:100}, relays);
};


// delete relay
aa.r.del =s=>
{
  const a = s.split(',');
  if (!a.length) return;
  
  for (const i of a)
  {
    const url = aa.fx.url(i.trim())?.href;
    if (url && aa.r.o.ls[url])
    {
      //todo
      if (aa.r.active[url])
      {
        aa.r.force_close([url]);
        delete aa.r.active[url];
      }
      delete aa.r.o.ls[url];
      let l = aa.el.get(url);
      l.remove();
      aa.el.delete(url);
    }
  }
  aa.mod.save(aa.r);
};


// aa.r.eose_log =([id,url])=>
// {
//   let cla = 'eose';
//   let log = aa.el.get(cla);
//   if (!log) 
//   {
//     log = aa.mk.details(cla);
//     aa.el.set(cla,log);
//     aa.log(log);
//   }
//   log.append()
//   aa.log(data.join(' '))
// };


// make request and await eose
aa.r.get =async dis=>
{
  let {id,filter,relays,options} = dis;

  let sheet = 
  {
    id,
    filter,
    started:aa.now,
    events:new Map(),
    eose:new Map(),
  };
  
  sheet.request = ['REQ',id,filter];
  sheet.relays = relays?.length ? relays : aa.r.r;
  sheet.options = options || {};
  aa.r.on_sub.set(id,dat=>{ sheet.events.set(dat.event.id,dat) });
  // console.log(sheet);

  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve(sheet)},6666);

    aa.r.on_eose.set(id,data=>
    {
      let now = aa.now;
      sheet.eose.set(data,now);
      if (sheet.eose.size===sheet.relays.length)
      {
        clearTimeout(abort);
        sheet.ended = now;
        resolve(sheet)
      }
    });

    aa.r.send_req(sheet);
  })
};


aa.r.get_events =async ids=>
{
  let id = 'get_events_'+aa.fx.rands();

  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve([])},9999);
    
    aa.r.temp.set(id,data=>
    {
      clearTimeout(abort);
      setTimeout(()=>{aa.r.temp.delete(id)},100);
      resolve(data)
    });

    aa.r.manager.postMessage(['events',[id,ids]]);
  })
};

aa.r.get_filter =async filter=>
{
  let id = 'get_filter_'+aa.fx.rands();

  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve([id,[]])},6666);
    
    aa.r.temp.set(id,data=>
    {
      clearTimeout(abort);
      aa.r.temp.delete(id);
      resolve(data)
    });

    aa.r.manager.postMessage(['filter',[id,filter]]);
  })
};


// relay notice
aa.r.found =async({url,request,options,reason})=>
{
  if (!url) return;
  let id = 'notice_'+aa.fx.an(url);
  if (!aa.el.has('relays_add')) aa.el.set('relays_add',new Map());
  if (!aa.temp.relays_add) aa.temp.relays_add = new Map();
  if (aa.temp.relays_add.get(id)) return;

  let cleanup =e=>
  {
    e?.target.closest('.notice')?.remove();
    // e.target.classList.add('slap');
    // e.target.closest('.is_new')?.classList.remove('is_new');
  }
  
  let title = url;
  let cla = 'r_notice';
  let butts = [];
  let notice = {id,cla,title,butts};
  let dis = ['request',{relays:[url],request,options}];

  let add_relay_and_request =e=>
  {
    aa.r.add(`${url} hint`);
    if (request) aa.r.manager.postMessage(dis);
    cleanup(e);
  }

  // if (localStorage.relays_ask==='off')
  // {
  //   add_relay_and_request()
  //   return
  // }

  let hint ={con:'hint',cla:'yes',exe:add_relay_and_request};

  let off ={con:'off',cla:'no',exe:e=>
    {
      aa.r.add(`${url} off`);
      cleanup(e);
    }
  };

  let other ={con:'other',cla:'maybe',exe:e=>
    {
      aa.r.add(url);
      if (request) aa.r.manager.postMessage(dis);
      // aa.r.c_on(url,opts);
      aa.bus.emit('cli:stage',title);
      cleanup(e);
    }
  };
  
  butts.push(off,other,hint);
  let l_notice = aa.mk.notice(notice,1);
  aa.temp.relays_add.set(id,l_notice);

  let l = aa.el.get('r.add');
  if (!l)
  {
    l = aa.mk.details('r add …',0,0,'base');
    aa.el.set('r.add',l);
  }
  
  l.append(l_notice);

  let log = l.parentElement;
  if (log) aa.logs.append(log);
  else aa.log(l);
};


// force close relay connection
aa.r.force_close =(a=[])=>
{
  for (const url of a) aa.r.manager.postMessage(['terminate',url])
};


// returns a relays object from object (extension,k3)
aa.r.from_o =(o,sets=false)=>
{
  let relays = {};
  for (let url in o)
  {
    const href = aa.fx.url(url)?.href;
    if (href)
    {
      relays[href] = {sets:[]};
      if (o[url].read === true) aa.fx.a_add(relays[href].sets,['read']);
      if (o[url].write === true) aa.fx.a_add(relays[href].sets,['write']);
      if (Array.isArray(sets)) aa.fx.a_add(relays[href].sets,sets);
    }
  }
  return relays
};


aa.r.nip11 =(s='')=>
{
  let relays = aa.fx.splitr(s);
  aa.r.manager.postMessage(['info',relays]);
};


// list relays from sets
aa.r.ls =(s='')=>
{
  let relay_list = [];
  let a = s ? s.split(' ') : [];
  let ls = aa.r.o.ls;
  if (!a.length) relay_list.push(...Object.keys(ls));
  else relay_list.push(...aa.fx.in_sets(ls,a,false));
  let result = relay_list.join(', ');
  aa.log(relay_list.length+' relays in '+a);
  return result 
};


// on load
aa.r.load =async()=>
{
  aa.bus.on('db:save', event => aa.r.manager.postMessage(['save', event]));

  // relay options
  aa.o.defaults.relays_ask = 
  {
    options:['on','off'],
    fx:s=> aa.fx.pick_other(s,aa.o.defaults.relays_ask.options)
  };

  const mod = aa.r;
  const id = mod.def.id;

  // add mod options
  if (!Object.hasOwn(localStorage,'outbox_max'))
  {
    localStorage.outbox_max = '3';
  }
  if (!Object.hasOwn(localStorage,'relays_ask')) 
  {
    localStorage.relays_ask = 'on';
  }
  if (!Object.hasOwn(localStorage,'events_max'))
  {
    localStorage.events_max = '9999';
  }

  // max events in memory
  mod.limit = localStorage.events_max
  ? parseInt(localStorage.events_max)
  : 99999;

  if (aa.o.mod_l) aa.mod.mk(aa.o);
  
  // mod scripts
  // await aa.add_scripts(mod.scripts);
  
  // mod actions
  aa.actions.push(
    {
      action:[id,'add'],
      required:['<url>'], 
      optional:['<set>','<set>'],
      repeat:',',
      description:'add / update relay with sets',
      exe:mod.add
    },
    {
      action:[id,'del'],
      required:['<url>'],
      description:'remove relay',
      exe:mod.del
    },
    {
      action:[id,'setrm'],
      required:['<url>','<set>'],
      optional:['<set>'],
      description:'remove set(s) from relay',
      exe:mod.setrm
    },
    {
      action:[id,'ls'],
      optional:['<set>'],
      description:'loads relay list from sets',
      exe:mod.ls
    },
    {
      action:[id,'info'],
      required:['<url>'],
      optional:['<url>'],
      description:'fetch relay information (nip11)',
      exe:mod.nip11
    },
    {
      action:['e','bro'],
      required:['<id>'],
      optional:['<url||set>'],
      description:'broadcast note to relay(s)',
      exe:mod.bro
    },
    {
      action:[id,'score_reset'],
      optional:['<url>'],
      description:'reset relay score(s) to default',
      exe:mod.score_reset
    },
    {
      action:[id,'s'],
      required:['<search>'],
      description:'nip-50 search request to read relays',
      exe:mod.search
    },
  );

  // load saved data and make ui
  await aa.mod.load(mod);
  aa.mod.mk(mod)
  .then(()=>
  {
    aa.r.toggles();
    aa.mod.ready('r:ui', aa.r.manager_setup);
  });

  // pause/resume relays on connectivity changes
  aa.on_offline.push(()=>
  {
    if (mod.manager) mod.manager.postMessage(['pause']);
  });
  aa.on_online.push(()=>
  {
    if (mod.manager) mod.manager.postMessage(['resume']);
  });
};


// make r mod item
aa.r.mk =(k,v)=>
{
  // k = url
  // v = {sets:[]}

  let id = aa.r.def.id;
  const edit_text = `${id} add ${k} off`;
  const del_text = `${id} del ${k}`;

  let sets = make('span',{cla:'sets'});
  if (v.sets && v.sets.length)
  {
    for (const set of v.sets)
    {
      const set_text = `${id} setrm ${k} ${set}`;
      sets.append(aa.mk.butt_action(set_text,set),' ')
    }
  }
  let info_text = `${id} info ${k}`;
  let info_butt = aa.mk.butt_action(info_text,'fetch info','relay_info');
  let info = aa.mk.details(k,info_butt,0,'info mod_details');
  if (v.info) info.append(aa.mk.ls({ls:v.info}));
  else info.classList.add('empty');

  let actions = make('div',
  {
    cla:'mod_actions',
    app:[
      aa.mk.butt_action(del_text,'del','del'),
      ' ',aa.mk.butt_action(edit_text,'edit','add')
    ]
  });

  const score = Math.round(aa.r.score(k));
  const in_backoff = v.retry_backoff > 0 && v.retry_after > Date.now() / 1000;
  const element = make('li',
  {
    cla:'item relay',
    dat:{state: in_backoff ? 4 : 0, sets:v.sets, score},
    app:[info,' ',sets,' ',actions],
    title: `Reliability: ${score}/100`
  });
  
  aa.el.set(k,element);
  return element 
};


// return sorted relay list for outbox
aa.r.outbox =(authors=[],sets=[])=>
{
  if (!sets.length) sets = ['write','k10002'];
  if (!authors?.length) return [];
  let relays = aa.r.common(authors,sets);
  let outbox = aa.fx.intersect(relays,authors,parseInt(localStorage.outbox_max));
  
  let none;
  if (outbox.none)
  {
    none = [...outbox.none];
    delete outbox.none;
  }
  
  // use read relays to ask for everything
  for (const r of aa.r.r) outbox[r] = authors;

  let sorted_outbox = Object.entries(outbox).sort(aa.fx.sorts.len);
  if (none) 
  {
    for (const item of sorted_outbox)
    {
      item[1].push(...none);
      item[1] = [...new Set(item[1])];
    }
  }

  
  
  return sorted_outbox;
};


// returns a list of relays given either a relay set or single url
aa.r.rel =(s='')=>
{
  s = s.trim();
  if (!s.includes('://') && s.includes('.')) s = `wss://${s}`;
  const a = [];
  let relay = aa.fx.url(s)?.href;
  if (relay) a.push(relay);
  else a.push(...aa.fx.in_set(aa.r.o.ls,s));
  return a
};


// send event to relays
aa.r.send_event =async({relays,event,options})=>
{
  if (!event)
  {
    aa.log('aa.r.send_event: no event');
    return
  }

  if (!aa.fx.verify_event(event))
  {
    aa.log('aa.r.send_event: invalid event');
    return
  }

  relays = relays?.length ? aa.r.validate({relays}) : [];

  if (!relays.length) relays = aa.r.w;
  if (!relays.length)
  {
    aa.log('aa.r.send_event: no relays');
    return false
  }

  aa.r.manager.postMessage(['request',{relays,request:['EVENT',event],options}]);
};


// request from relays
aa.r.send_req =data=>
{
  let {relays,request,options} = data;
  if (!Array.isArray(request) || !request.length)
  {
    aa.log('aa.r.send_req: invalid request');
    return
  }
  relays = aa.r.validate(data);
  if (!relays.length)
  {
    // console.log('aa.r.send_req: no valid relays',data);
    // console.trace(dis);
    return
  }
  aa.r.manager.postMessage(['request',{relays,request,options}]);
};


// request from outbox
aa.r.send_out =data=>
{
  aa.mod.ready('r:manager', ()=> aa.r.manager.postMessage(['outbox',data]));
};


// remove set from server
aa.r.setrm =(s="")=>
{
  let mod = aa.r;
  const as = s.split(',');
  if (as.length)
  {
    for (const i of as) 
    {
      let a = i.trim().split(' ').map(n=>n.trim());
      let url_string = a.shift();
      const url = aa.fx.url(url_string)?.href;
      const server = mod.o.ls[url];
      if (!server) return;
      server.sets = aa.fx.a_rm(server.sets,a);
      aa.mod.ui(mod,url);
    }
  }
  aa.mod.save(mod);
};

// aa.mk.r_toggles =(options)=>
// {
//   let {con,} 
// };


// calculate relay reliability score from persistent data (higher = better)
aa.r.score =(url)=>
{
  const relay = aa.r.o.ls[url];
  if (!relay) return 0;

  let score = 100; // Start perfect

  // Termination penalty
  const term_count = relay.terminated_count || 0;
  if (term_count > 0)
  {
    score -= term_count * 20; // -20 per termination

    // Decay penalty over time (forgive after 24h)
    const last_term = relay.last_terminated || 0;
    const hours_since = (Date.now()/1000 - last_term) / 3600;
    if (hours_since < 24) score -= (24 - hours_since);
  }

  const errors = relay.error_count || 0;
  const successes = relay.success_count || 0;
  const total = errors + successes;

  if (total === 0) return term_count > 0 ? score : score * 0.5; // No WS history: trust termination record as-is, unknown = neutral

  // Error rate penalty (0-30 points)
  const error_rate = errors / total;
  score -= error_rate * 30;

  // Success bonus (0-20 points)
  const success_rate = successes / total;
  score += success_rate * 20;

  return Math.max(0, score);
};


// reset relay score(s) to default
aa.r.score_reset =(s='')=>
{
  const keys = ['terminated_count','last_terminated','error_count','success_count','retry_backoff','retry_after'];
  let urls = s.trim() ? [aa.fx.url(s.trim())?.href].filter(Boolean) : Object.keys(aa.r.o.ls);

  let count = 0;
  for (const url of urls)
  {
    let relay = aa.r.o.ls[url];
    if (!relay) continue;
    for (const k of keys) delete relay[k];
    count++;
  }

  aa.mod.save_to(aa.r);
  aa.log(`score reset: ${count} relay${count !== 1 ? 's' : ''}`);
};


// toggles for relay mod l — cycles each button through active/inactive/solo
// solo: stackable — multiple solo buttons show their union; inactive still applies within solo
// re-entrant: on subsequent calls only the button lists are rebuilt
aa.r.toggles =()=>
{
  const mod = aa.r;
  const cycle = ['active','inactive','solo'];
  const state_names = { 0:'unused', 1:'open', 2:'closing', 3:'closed', 4:'backoff' };

  const get_items =(k,v)=>
  {
    if (k === 'state')
      return Array.from(mod.mod_ul.children)
        .filter(i=> i.dataset.state === v);
    if (k === 'sets')
      return aa.fx.in_set(aa.r.o.ls,v,false)
        .map(url=> aa.el.get(url))
        .filter(Boolean);
    return [];
  };

  const set_btn_state =(btn,state)=>
  {
    btn.dataset.toggle_state = state;
    btn.classList.remove(...cycle);
    if (state !== 'active') btn.classList.add(state);
  };

  // recompute the 'solo' sift from all currently solo buttons
  // items not in any solo group get hidden; items in at least one are shown
  const recalc_solo =(all_btns,all_items)=>
  {
    for (const item of all_items) sift.less(item,'solo');
    const solo_btns = all_btns.filter(b=> (b.dataset.toggle_state||'active') === 'solo');
    if (!solo_btns.length) return;
    const solo_items = new Set(
      solo_btns.flatMap(b=> get_items(b.dataset.k,b.dataset.v))
    );
    for (const item of all_items)
      if (!solo_items.has(item)) sift.more(item,'solo');
  };

  const clk =e=>
  {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    const k = btn.dataset.k;
    const v = btn.dataset.v;
    const key = `${k}_${v}`;
    const cur = btn.dataset.toggle_state || 'active';
    const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
    const all_btns = Array.from(mod.mod_toggles.querySelectorAll('[data-k]'));
    const all_items = Array.from(mod.mod_ul.children);

    fastdom.mutate(()=>
    {
      if (cur === 'inactive')
        for (const item of get_items(k,v)) sift.less(item,key);

      if (next === 'inactive')
        for (const item of get_items(k,v)) sift.more(item,key);

      set_btn_state(btn,next);

      if (cur === 'solo' || next === 'solo')
        recalc_solo(all_btns,all_items);
    });
  };

  // snapshot current button states so we can carry them over on rebuild
  const prev_states = {};
  if (mod.mod_toggles)
  {
    for (const btn of mod.mod_toggles.querySelectorAll('[data-k]'))
      prev_states[`${btn.dataset.k}_${btn.dataset.v}`] = btn.dataset.toggle_state || 'active';
  }

  const mk_btn =(k,v,label)=>
  {
    const prev = prev_states[`${k}_${v}`] || 'active';
    const btn = make('button',
    {
      con: label,
      cla: 'butt',
      dat: { k, v, toggle_state: prev },
      clk
    });
    if (prev !== 'active') btn.classList.add(prev);
    return btn
  };

  // sets: one button per unique set across all relays
  const sets_butts = [...Object.values(aa.r.o.ls)
    .reduce((s,i)=> s.union(new Set(i.sets)), new Set())
  ].map(s=> mk_btn('sets',s,s));

  // states: derived from current list items, fallback to all known states
  let avail_states = [...new Set(
    Array.from(mod.mod_ul.children).map(i=> i.dataset.state).filter(Boolean)
  )];
  if (!avail_states.length) avail_states = Object.keys(state_names);
  const states_butts = avail_states.map(s=> mk_btn('state',s,state_names[s] || s));

  // on subsequent calls: replace just the button spans, leave sift_input intact
  if (mod.mod_toggles)
  {
    fastdom.mutate(()=>
    {
      mod.mod_toggles.querySelector('.sets').replaceChildren(...sets_butts);
      mod.mod_toggles.querySelector('.states').replaceChildren(...states_butts);
    });
    return
  }

  mod.mod_toggles = make('p',
  {
    cla:'toggles',
    app:
    [
      make('span',{ cla:'sets', app: sets_butts }),
      make('br'),
      make('span',{ cla:'states', app: states_butts }),
      make('br'),
      aa.mk.sift_input({element:mod.mod_ul})
    ]
  });

  mod.on_ui =()=> debt.add(aa.r.toggles,420,'r_toggles');

  fastdom.mutate(()=>
  {
    mod.mod_l.insertBefore(mod.mod_toggles,mod.mod_ul);
  })
};


// validate relays are ok to use
aa.r.validate =({relays,request,options})=>
{
  // filter invalid urls
  relays = aa.r.validate_relays(relays);
  // check for new relays not already added
  let found = relays.filter(i=>!aa.r.o.ls[i]);
  if (found.length)
  {
    if (localStorage.relays_ask==='off')
    {
      if (found.some(i=>!aa.fx.url(i)))
      {
        console.log(found)
      }
      aa.r.add(found.map(i=>i?`${i} hint`:'').filter(i=>i).join());
    }
    else
    {
      // filter those out
      relays = relays.filter(i=>aa.r.o.ls[i]);
      // send found notices
      for (const url of found) aa.r.found({url,request,options});
    }
  }

  return relays.filter(i=>aa.r.o.ls[i] && !aa.r.o.ls[i].sets.includes('off'));
};


aa.r.validate_relays =relays=>
{
  return relays
    .map(i=>aa.fx.url(i))
    .filter(i=>aa.fx.is_valid_relay(i))
    .map(i=>i.href);
}


aa.r.manager_message =async e=>
{
  let mod = aa.r;
  const type = e.data[0]?.toLowerCase();
  if (!type) return;

  let fun = mod.temp.has(type) ? mod.temp.get(type)
  : Object.hasOwn(mod,type) ? mod[type] : false;

  if (fun) setTimeout(()=>{fun(e.data)},0);
  else aa.log(JSON.stringify(e.data));
};


// setup relay manager worker
aa.r.manager_setup =()=>
{
  let mod = aa.r;
  // relay manager
  mod.manager = new Worker(mod.manager_src);//,{type:'module'});

  // relay union worker message
  mod.manager.onmessage = mod.manager_message;
  let relays = mod.o.ls;
  let limit = mod.limit;

  // initialize relay manager
  mod.manager.postMessage(['init',{relays,limit}]);
  aa.mod.fire_ready('r:manager');
};


// nip11 relay info message from manager
aa.r.info =([type,url,info])=>
{
  let mod = aa.r;
  let relay = mod.o.ls[url];
  if (!relay) return;
  if (info) relay.info = info;
  else relay.no_info = true;
  aa.mod.save_to(mod);
  aa.mod.ui(mod,url);
  // console.log(url,info)
};


// on sub message
aa.r.sub =async data=>
{
  // let [type,url,sub_id,sub_mapped] = data;
  // let relay = aa.r.active[url];
  // if (!relay.subs) relay.subs = new Map();
  // relay.subs.set(sub_mapped,sub_id);
  // console.log(relay);
};


// return opened subscriptions 
// given map from r.active[url].subs
aa.r.subs_open =subs=>
{
  return [...new Set([...subs.values()]
  .filter(i=>!i.closed)
  .map(i=>i?.id))];
};