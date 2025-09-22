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
  styles:
  [
    '/r/r.css?v='+aa_version,
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

    if (!Object.hasOwn(mod.o.ls,url))
    {
      mod.o.ls[url] = {sets:[]};
      changed.set(url,a);
    }
    
    if (!aa.fx.a_add(mod.o.ls[url].sets,a)) continue;
    
    changed.set(url,a);
    if (a.includes('off')) off.add(url);
    else valid.add(url);
    df.append(aa.mk.l('p',{con:`${url} ${a.join(' ')}`}))
  }
  
  if (invalid.size) 
  {
    aa.log(`aa.r.add - invalid urls: ${[...invalid.values()]}`);
    console.trace('invalid urls',invalid);
  }
  
  if (changed.size)
  {
    aa.mod.save_to(mod);
    let cla = 'relays added';
    let log = aa.el.get(cla);
    if (!log)
    {
      log = aa.mk.details(cla,0,0,'base'); // ,aa.mk.l('div',{cla:'list'})
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
  if (union.size) aa.mod.ui(mod,[...union.values()]);
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
aa.r.common =(pubkeys=[],sets=[])=>
{
  let common = {};
  let offed = aa.fx.in_set(aa.r.o.ls,'off',0);
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
      if (!common[url]) common[url] = [];
      if (!common[url].includes(pubkey)) common[url].push(pubkey)
    }

    if (!has_set)
    {
      if (!common.none) common.none = [];
      aa.fx.a_add(common.none,[pubkey]);
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
  if (!relays?.length) relays = aa.r.r;
  if (!aa.r.on_sub.has(id)) aa.r.on_sub.set(id,aa.e.print_q);
  aa.r.send_req({request,relays,options});
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
    const abort = setTimeout(()=>{resolve(sheet)},2121);

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

  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve(false)},6666);
    
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
  let result = relay_list.join();
  aa.log(relay_list.length+' relays in '+a);
  return result 
};


// on load
aa.r.load =async()=>
{
  const mod = aa.r;
  const id = mod.def.id;

  aa.add_styles(mod.styles);

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
  if (aa.o.l) aa.mod.mk(aa.o);
  else {console.log('no o')}
  
  // mod scripts
  await aa.add_scripts(mod.scripts);
  
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

  // load saved data and make ui
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

  let id = aa.r.def.id;
  // element.dataset.state = 0;
  const edit_text = `${id} add ${k} off`;
  const del_text = `${id} del ${k}`;

  let sets = aa.mk.l('span',{cla:'sets'});
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

  let actions = aa.mk.l('div',
  {
    cla:'mod_actions',
    app:[
      aa.mk.butt_action(del_text,'del','del'),
      ' ',aa.mk.butt_action(edit_text,'edit','add')
    ]
  });
  
  const element = aa.mk.l('li',
  {
    cla:'item relay',
    dat:{state:0,sets:v.sets},
    app:[info,' ',sets,' ',actions]
  });
  
  aa.el.set(k,element);
  return element 
};




// return sorted relay list for outbox
aa.r.outbox =(a=[],sets=[])=>
{
  if (!sets.length) sets = ['write','k10002'];
  if (!a?.length) return [];
  let relays = aa.r.common(a,sets);
  let outbox = aa.fx.intersect(relays,a,parseInt(localStorage.outbox_max));
  
  let none;
  if (outbox.none)
  {
    none = [...outbox.none];
    delete outbox.none;
  }

  let sorted_outbox = Object.entries(outbox).sort(aa.fx.sorts.len);
  if (none) 
  {
    for (const item of sorted_outbox) item[1].push(...none)
  }
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
  toggles.append(
    sets_span,
    aa.mk.l('br'),
    states_span,
    aa.mk.l('br'),
    aa.mk.list_filter(mod.ul)
  );
  fastdom.mutate(()=>
  {
    mod.l.insertBefore(toggles,mod.ul);
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
  // max events in memory
  let limit = localStorage.events_max
  ? parseInt(localStorage.events_max)
  : 99999;
  let options = {relays:mod.o.ls,limit};
  // initialize relay manager
  mod.manager.postMessage(['init',options]);
};


// nip11 relay info message from manager
aa.r.info =([type,url,info])=>
{
  let mod = aa.r;
  let relay = mod.o.ls[url];
  relay.info = info;
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