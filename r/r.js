/*

alphaama
mod    r
relays

*/

// relay options
aa.o.defaults.relays_ask = 
{
  options:['on','off'],
  fx:s=> aa.fx.pick_other(s,aa.o.defaults.relays_ask.options)
};


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
    '/r/clk.js?v='+aa_version,
    '/r/mk.js?v='+aa_version,
    '/r/msg.js?v='+aa_version,
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

  // if (!as.length) return all;
  let df = new DocumentFragment();
  let haz;
  items.map(i=>
  {
    
  })
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

    if (!Object.hasOwn(mod.o.ls,url))
    {
      mod.o.ls[url] = {sets:[]};
      changed.set(url,a);
    }
    
    if (!aa.fx.a_add(mod.o.ls[url].sets,a)) continue;
    
    changed.set(url,a);
    if (a.includes('off')) off.add(url);
    else valid.add(url);
  }
  
  if (invalid.size) 
  {
    aa.log(`aa.r.add - invalid urls: ${[...invalid.values()]}`);
    console.trace('invalid urls',s);
  }
  
  if (changed.size)
  {
    aa.mod.save(mod);
    let cla = 'relays added';
    let log = aa.el.get(cla);
    if (!log) 
    {
      log = aa.mk.details(cla,0,0,'base'); // ,aa.mk.l('div',{cla:'list'})
      aa.el.set(cla,log);
      aa.log(log);
    }
    // [...changed.entries()].map()
    log.append(df);
    aa.r.manager.postMessage(['relays',aa.r.o.ls]);
  }

  // let [valid,invalid,off] = aa.mod.serve rs_add(aa.r,s,cla);
  let union = valid.union(off);
  if (union.size) aa.mod.ui(mod,[...union.values()])
  if (off.size) aa.r.force_close([...off.values()]); 
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
// s = 'id relay relay relay'
aa.r.bro =async(s='')=>
{
  let [id,...relays] = s.split(' ');
  let dat = await aa.e.get(id);
  if (dat) 
  {
    aa.r.send_event({event:dat.event,relays});
  }
  else aa.log('r bro: event not found')
};



// given a list of pubkeys
// return list of relays in common by the pubkeys
aa.r.common =(a=[],sets=[])=>
{
  let common = {};
  let offed = aa.fx.in_set(aa.r.o.ls,'off',0);
  for (const x of a)
  {
    let has_set;
    let relays = aa.db.p[x]?.relays;
    if (relays) 
    {
      relays = aa.fx.in_sets_all(relays,sets);
      if (relays.length) has_set = true;
    }
    else relays = [];

    for (const r of relays)
    {
      if (offed.includes(r)) continue;
      if (!common[r]) common[r] = [];
      if (!common[r].includes(x)) common[r].push(x)
    }

    if (!has_set)
    {
      for (const r of aa.fx.in_set(aa.r.o.ls,aa.r.o.r))
      {
        if (!common[r]) common[r] = [];
        aa.fx.a_add(common[r],[x]);
      }
    }
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
  if (!relays?.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
  if (!aa.r.on_sub.has(id)) aa.r.on_sub.set(id,aa.e.to_printer);
  aa.r.send_req({request,relays,options});
};


// make request and await completion
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
  sheet.relays = relays?.length ? relays : aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
  sheet.options = options || {};
  aa.r.on_sub.set(id,dat=>{ sheet.events.set(dat.event.id,dat) });
  console.log(sheet);

  return new Promise((resolve,reject)=>
  {
    const abort = setTimeout(()=>{reject(sheet)},6666);

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


// aa.r.event =([s,dat])=>
// {
//   for (const sub of dat.subs)
//   {
//     if (aa.r.on_sub.has(sub))
//     {
//       aa.r.on_sub.get(sub)(dat);
//       return
//     }
//   }
// };


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


// aa.r.eose =async data=>
// {
//   let [eose,sub_id,url] = data;
//   if (aa.r.on_eose.has(sub_id))
//   {
//     aa.r.on_eose.get(sub_id)(url);
//     return
//   }
//   else aa.log_details('r.eose','["EOSE","…"]',sub_id,url)
// };


aa.r.eose_log =([id,url])=>
{
  let cla = 'eose';
  let log = aa.el.get(cla);
  if (!log) 
  {
    log = aa.mk.details(cla);
    aa.el.set(cla,log);
    aa.log(log);
  }
  log.append()
  aa.log(data.join(' '))
};


aa.r.get_events =async ids=>
{
  let id = 'get_events_'+aa.fx.rands();

  return new Promise((resolve,reject)=>
  {
    const abort = setTimeout(()=>{reject()},6666);
    
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

  return new Promise((resolve,reject)=>
  {
    const abort = setTimeout(()=>{reject()},6666);
    
    aa.r.temp.set(id,data=>
    {
      clearTimeout(abort);
      setTimeout(()=>{aa.r.temp.delete(id)},100);
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
      aa.cli.add(title);
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
  for (const url of a) aa.r.manager.postMessage(['terminate',{url}])
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


// list relays from sets
aa.r.ls =(s='')=>
{
  let relay_list = [];
  let a = s ? s.split(' ') : [];
  let ls = aa.r.o.ls;
  if (!a.length) relay_list.push(...Object.keys(ls));
  else relay_list.push(...aa.fx.in_sets(ls,a,false));
  let result = relay_list.join();
  aa.log(relay_list.length+' relays in '+a);
  return result 
};


// on load
aa.r.load =async()=>
{
  const mod = aa.r;
  const id = mod.def.id;

  if (!Object.hasOwn(localStorage,'outbox_max'))
  {
    localStorage.outbox_max = '3';
    // aa.mod.ui(aa.o,'outbox_max');
  }
  if (!Object.hasOwn(localStorage,'relays_ask')) 
  {
    localStorage.relays_ask = 'on';
    // aa.mod.ui(aa.o,'relays_ask');
  }
  
  await aa.mk.scripts(mod.scripts);
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
    // {
    //   action:[id,'resume'],
    //   description:'resume open queries',
    //   exe:mod.resume
    // },
    {
      action:['e','bro'],
      required:['<id>'],
      optional:['<url||set>'],
      description:'broadcast note to relay(s)',
      exe:mod.bro
    },
  );

  aa.mod.load(mod)
  .then(aa.mod.mk)
  .then(()=>
  {
    aa.r.toggles();
    aa.r.manager_setup();
  });
};


// make r mod item
aa.r.mk =(k,v)=>
{
  // k = url
  // v = {sets:[]}

  const l = aa.mk.server(k,v);
  if (!l) return false;
  let id = aa.r.def.id;
  // l.id = id+'_'+aa.fx.an(k);
  l.dataset.state = 0;
  // aa.mod.servers_butts(aa.r,l,v);
  l.append(' ',aa.mk.butt_action(id+' del '+k,'del','del'));
  
  let sets = aa.mk.l('span',{cla:'sets'});
  if (v.sets && v.sets.length)
  {
    for (const set of v.sets)
    {
      sets.append(aa.mk.butt_action(id+' setrm '+k+' '+set,set),' ')
    }
  }
  l.append(' ',sets,' ',aa.mk.butt_action(id+' add '+k+' off','+','add'));
  if (!aa.el.has(k)) aa.el.set(k,l);
  // aa.r.state_upd(k);
  return l
};




// return sorted relay list for outbox
aa.r.outbox =(a=[],sets=[])=>
{
  if (!sets.length) sets = ['write','k10002'];
  if (!a?.length) return [];
  let relays = aa.r.common(a,sets);
  let outbox = aa.fx.intersect(relays,a,parseInt(localStorage.outbox_max));
  let sorted_outbox = Object.entries(outbox).sort(aa.fx.sorts.len);
  return sorted_outbox;
};


// returns a list of relays given either a relay set or single url
aa.r.rel =(s='')=>
{
  s = s.trim();
  const a = [];
  let relay = aa.fx.url(s)?.href;
  if (relay) a.push(relay);
  else a.push(...aa.fx.in_set(aa.r.o.ls,s));
  return a
};


// send event to relays
aa.r.send_event =({relays,event,options})=>
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

  if (!relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.w);
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
    console.log('aa.r.send_req: no valid relays',data);
    // console.trace(dis);
    return
  }
  aa.r.manager.postMessage(['request',{relays,request,options}]);
};


// request from outbox
aa.r.send_out =data=>{ aa.r.manager.postMessage(['outbox',data]) };


// todo
// resume subscriptions
aa.r.resume =s=>
{
  let ids = aa.fx.splitr(s);
  console.log(ids);
  // for (const url in aa.r.active) { aa.r.c_on(url) } 
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


// add relays from p tagged users 10002 'read'
aa.r.tagged =(event,relays=[])=>
{
  let pubs = event.tags.filter(aa.fx.is_tag_p).map(i=>i[1]);
  for (const x of pubs)
  {
    let read_relays = aa.fx.in_set(aa.db.p[x].relays,'read');
    let ab = aa.fx.a_ab(relays,read_relays);
    if (!ab.inc.length < 3) relays.push(...ab.exc.slice(0,3 - ab.inc.length))
  }
  return new Set(relays);
};


// toggles for relay mod l
aa.r.toggles =()=>
{
  const mod = aa.r;
  const id = mod.def.id;
  let sets_span = aa.mk.l('span',{cla:'sets'});
  let sets = [];
  for (const r of Object.values(aa.r.o.ls)) aa.fx.a_add(sets,r.sets);
  for (const set of sets)
  {
    let butt = aa.mk.butt_clk([set,'active','relset']);
    butt.dataset.k = 'sets';
    butt.dataset.v = set;
    sets_span.append(butt,' ');
  }
  let states_span = aa.mk.l('span',{cla:'states'});
  let states = 
  [
    ['0','unused'],
    ['1','open'],
    // ['2','connecting'],
    ['3','closed'],
  ];
  for (const state of states)
  {
    let [id,str] = state;
    let butt = aa.mk.butt_clk([str,'active','relstate']);
    butt.dataset.k = 'state';
    butt.dataset.v = id;
    states_span.append(butt,' ');
  }
  let toggles = aa.mk.l('p',{cla:'toggles'});
  toggles.append(sets_span,aa.mk.l('br'),states_span);
  fastdom.mutate(()=>
  {
    mod.l.insertBefore(toggles,mod.l.lastChild);
  })
};


// validate relays are ok to use
aa.r.validate =({relays,request,options})=>
{
  // filter invalid urls
  relays = relays.map(i=>aa.fx.url(i)?.href).filter(i=>i);
  // check for new relays not already added
  let found = relays.filter(i=>!aa.r.o.ls[i]);
  if (found.length)
  {
    // let add_relay_and_request =e=>
    // {
    //   aa.r.add(`${url} hint`);
    //   if (request) aa.r.manager.postMessage(dis);
    //   // aa.r.c_on(url,opts);
    //   cleanup(e);
    // }

    if (localStorage.relays_ask==='off')
    {
      if (found.some(i=>!aa.fx.url(i)))
      {
        console.log(found)
      }
      aa.r.add(found.map(i=>`${i} hint`).join());
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


// setup relay manager worker
aa.r.manager_setup =()=>
{
  let mod = aa.r;
  // relay manager
  mod.manager = new Worker(mod.manager_src);//,{type:'module'});

  // relay union worker message
  mod.manager.onmessage =async e=>
  {
    const type = e.data[0]?.toLowerCase();
    if (!type) return;

    let fun = mod.temp.has(type) ? mod.temp.get(type)
    : Object.hasOwn(mod,type) ? mod[type] : false;
  
    if (fun) fun(e.data);
    else aa.log(JSON.stringify(e.data));
  };

  mod.manager.postMessage(['relays',mod.o.ls]);
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