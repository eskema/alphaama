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
  active:{},
  def:{id:'r',ls:{},r:'read',w:'write'},
  scripts:
  [
    '/r/clk.js?v='+aa_version,
    '/r/mk.js?v='+aa_version,
  ],
  temp: new Map(),
  on_sub:new Map(),
};


// add relays
aa.r.add =s=>
{
  let [valid,invalid,off] = aa.mod.servers_add(aa.r,s,'relays added');
  for (const url of off) aa.r.force_close([url]);
  aa.r.manager.postMessage(['relays',aa.r.o.ls]);
};


// add relays from object
aa.r.add_from_o =relays=>
{
  //o = {'wss://url.com':{sets:['read','write'}}
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) aa.r.add(a.join(','));
};


// authenticate to relay with main keys
aa.r.auth =async a=>
{
  console.log(a);
  let [s,event,relay] = a;
  event = aa.e.normalise(event);
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  let signed = await aa.u.sign(event);
  if (signed) aa.r.manager.postMessage(['auth',{relays:[relay],request:['AUTH',signed]}]);
};


// broadcast event from id to relays
// s = 'id relay relay relay'
aa.r.bro =async(s='')=>
{
  let [id,...relays] = s.split(' ');
  let event = await aa.db.e[id]?.event;
  if (event) aa.r.send_event({event,relays});
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
  if (!aa.r.on_sub.has(id)) aa.r.on_sub.set(id,aa.r.dat);
  aa.r.send_req({request,relays,options});
};


aa.r.event =([s,dat])=>
{
  for (const sub of dat.subs)
  {
    if (aa.r.on_sub.has(sub))
    {
      aa.r.on_sub.get(sub)(dat);
      return
    }
  }
};


// 
aa.r.dat =(dat)=>
{
  // console.log(dat)
  let event = dat.event;
  if (aa.miss.e[event.id]) 
  {
    delete aa.miss.e[event.id];
    dat.clas.push('miss');
  }
  else if (aa.fx.kind_type(event.kind) === 'parameterized')
  {
    let id_a = aa.fx.id_a(
      {
        kind:event.kind,
        pubkey:event.pubkey,
        identifier:event.tags.find(t=>t[0]==='d')[1],
      }
    );
    
    dat.id_a = id_a;
    if (aa.miss.a[id_a])
    {
      delete aa.miss.a[id_a];
      dat.clas.push('miss');
    }
  }
  aa.e.to_printer(dat);
  aa.db.upd_e(dat);
};


// delete relay
aa.r.del =s=>
{
  const a = s.split(',');
  if (!a.length) return;
  
  for (const i of a)
  {
    const url = aa.is.url(i.trim())?.href;
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


aa.r.eose =async data=>
{

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
    const href = aa.is.url(url)?.href;
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
      action:[id,'stuff'],
      description:'attempt to set some relays',
      exe:mod.stuff
    },
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


// OK true
aa.r.ok_ok =a=>
{
  const [s,id,is_ok,reason,origin] = a;
  let dat = aa.db.e[id];
  if (!dat) return;

  dat.clas = aa.fx.a_rm(dat.clas,['not_sent','draft']);
  aa.fx.a_add(dat.seen,[origin]);
  aa.db.upd_e(dat);

  const l = aa.temp.printed.find(i=>i.dataset.id === id);
  if (l)
  {
    l.classList.remove('not_sent','draft');
    aa.fx.dataset_add(l,'seen',[origin]);
    l.querySelector('.actions')?.replaceWith(aa.e.note_actions(dat))
  }
};


// OK false
aa.r.ok_not_ok =a=>
{
  const [s,id,is_ok,reason,origin] = a;
  let [type,txt] = reason.split(':');
  switch (type)
  {
    case 'blocked':
    case 'auth-required':
      aa.r.force_close([origin]);
      break;
    // case 'pow':
    // case 'duplicate':
    // case 'rate-limited':
    // case 'invalid':
    // case 'restricted':
    // case 'error':
    // default:
  }
};


// manager received from a relay
// ["OK",<event_id>,<true|false>,<message>]
aa.r.ok =async a=>
{
  const [s,id,is_ok,reason,origin] = a;
  if (is_ok) aa.r.ok_ok(a);
  else if (reason) aa.r.ok_not_ok(a);

  // ok details container element
  let l_id = 'r.ok';
  let l = aa.el.get(l_id);
  if (!l)
  {
    l = aa.mk.details('["OK","…"]',0,0,'base');
    aa.el.set(l_id,l);
    aa.log(l);
  }
  else aa.logs.lastChild.after(l.parentElement);

  let l_r = l.querySelector(`[data-origin="${origin}"]`);
  if (!l_r)
  {
    l_r = aa.mk.details(origin,0,1,'base');
    l_r.dataset.origin = origin;
    l.append(l_r);
  }
  let con = `${id} ${is_ok} ${reason}`;
  l_r.append(aa.mk.l('p',{con}));
  l_r.classList.add('has_new');
};


// return sorted relay list for outbox
aa.r.outbox =(a=[],sets=[])=>
{
  if (!sets.length) sets = [aa.r.o.w,'k10002'];
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
  let relay = aa.is.url(s)?.href;
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
aa.r.send_req =(dis)=>
{
  let {relays,request,options} = dis;
  if (!Array.isArray(request) || !request.length)
  {
    aa.log('aa.r.send_req: invalid request');
    return
  }
  relays = aa.r.validate(dis);
  if (!relays.length)
  {
    console.log('aa.r.send_req: no valid relays',dis);
    // console.trace(dis);
    return
  }
  aa.r.manager.postMessage(['request',{relays,request,options}]);
};


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
      const url = aa.is.url(url_string)?.href;
      const server = mod.o.ls[url];
      if (!server) return;
      server.sets = aa.fx.a_rm(server.sets,a);
      aa.mod.ui(mod,url);
    }
  }
  aa.mod.save(mod);
};


// 
aa.r.stuff =async(relays=[])=>
{
  // if (!relays.length) relays = await aa.r.ext();
  if (!relays.length)
  {
    // let prompt = window.prompt('add some relays','wss://nos.lol wss://relay.damus.io wss://relay.primal.net');
    // if (prompt) relays = aa.fx.splitr(prompt);
    // else aa.log(aa.mk.butt_action('r add wss://url.com read write','add some relays'));
    aa.log(aa.mk.butt_action('r add wss://nos.lol read write, wss://relay.damus.io read write, wss://relay.primal.net read write','add some relays'));
  }
  // if (!relays.length) return

  // let rels = relays.filter(i=>aa.is.url(i))
  // .map(i=>`${aa.is.url(i).href} read write auth`);
  // if (rels.length) aa.r.add(rels.join(','));
  // else aa.log('r stuff: no relays given')
};


// toggles for relay mod l
aa.r.toggles =()=>
{
  const mod = aa.r;
  const id = mod.def.id;
  let add_butt = aa.mk.butt_action(`${id} add `,'+','add');
  let modal_butt = aa.mk.butt_action(`fx modal ${id}`,'popup');
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
    let df = new DocumentFragment();
    df.append(add_butt,' ',modal_butt,' ',toggles);
    mod.l.insertBefore(df,mod.l.lastChild);
  })
};


// validate relays are ok to use
aa.r.validate =({relays,request,options})=>
{
  // filter invalid urls
  relays = relays.map(i=>aa.is.url(i)?.href).filter(i=>i);
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
  mod.manager = new Worker('/r/manager.js?v='+aa_version);//,{type:'module'});

  // relay union worker message
  mod.manager.onmessage =async e=>
  {
    const type = e.data[0]?.toLowerCase();
    if (!type) return;

    let fun = mod.temp.has(type) ? mod.temp.get(type) 
    : Object.hasOwn(mod,type) ? mod[type] : false;
  
    if (fun) fun(e.data);
    else console.log(`aa.r.manager.onmessage`,e.data);

    // if (mod.temp.has(dis)) setTimeout(()=>{mod.temp.get(dis)(type)},0);
    // else if (Object.hasOwn(mod,dis)) setTimeout(()=>{mod[dis](type)},0);
    // else console.log(`${mod}.manager.onmessage`,dis,type);

  };

  mod.manager.postMessage(['relays',mod.o.ls]);

};



// update relay state in ui
aa.r.state =([s,relay])=>
{
  let url = relay.url;
  aa.r.active[url] = relay;
  let l = aa.el.get(url);
  if (l)
  {
    if (!relay.failures)
    {
      console.log(relay);
      return
    }

    fastdom.mutate(()=>
    {
      l.dataset.state = relay.state;
      l.dataset.ratio = relay.failures.length - relay.successes.length;
      l.dataset.subs = aa.r.subs_open(relay.subs);
    })
  }
  else console.log('aa.r.state: no element found',relay)
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