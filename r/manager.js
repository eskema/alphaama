// alphaama relay and db manager

// nostr-tools
importScripts('/dep/nostr-tools.js','/dep/store.js');

const db = new store.IDBEventStore;

// relay manager
const manager = 
{
  relays:null,
  subs:new Map(),
  events:new Map(),
  worker_src:'/r/worker.js',
  workers:new Map(),
};


// checks if array includes items
// adds them if not and returns if anything was added
const a_add =(a=[],b=[])=>
{
  let c;
  for (const i of b) if (!a.includes(i)) {a.push(i); c=1}
  return c
};


// converts string to URL and returns it or false
const is_valid_url =(s='')=>
{
  if (!s) return;
  let url;
  try { url = new URL(s) }
  catch(er) { console.error(s) }
  return url?.href
};


// is hexadecimal
const is_x =s=> /^[A-F0-9]+$/i.test(s);
// is a valid nostr key
const is_key =x=> is_x(x) && x.length === 64;

const fx_id_ae =event=>
{
  return fx_id_a(
  {
    kind:event.kind,
    pubkey:event.pubkey,
    identifier:event.tags.find(t=>t[0]==='d')[1],
  })
};

const fx_id_a =o=>
{
  if (!o.kind || typeof o.kind !== 'number') return;
  if (!o.pubkey || !is_key(o.pubkey)) return;
  if (!o.identifier || typeof o.identifier !== 'string') return;
  return `${o.kind}:${o.pubkey}:${o.identifier}`;
};

// make request filter from addressable string
const fx_id_af =string=>
{
  let [kind,pubkey,identifier] = fx_split_ida(string);
  return {
    kinds:[parseInt(kind)],
    authors:[pubkey],
    '#d':[identifier]
  }
};

const fx_split_ida =ida=>
{
  let a = ida.split(':');
  let kind = a.shift();
  let pubkey = a.shift();
  let identifier = a.length > 1 ? a.join(':') : a[0];
  return [kind,pubkey,identifier]
};

const auth =data=>
{
  let {relays,request} = data;
  let relay = hires(relays[0]);
  if (!relay)
  {
    console.log('manager auth: relay is invalid',url);
    return
  }
  relay.worker.postMessage(['auth',{json:JSON.stringify(request)}]);
};


const check_limits =()=>
{
  if (manager.events.size < 9999) return false;

  for (const [url,worker] of manager.workers)
    terminate({url})
  
  postMessage(['limit','too many events'])
  
  return true
};


// on manager message
onmessage =e=>
{
  let data = e.data;
  if (!Array.isArray(data)
  || !data?.length)
  {
    console.log('invalid data',data);
    return
  }
  const [type,dis] = data;
  switch (type.toLowerCase())
  {
    case 'terminate': terminate(dis); break;
    case 'relays': manager.relays = dis; break;
    case 'info': relay_info(dis); break;
    case 'request': process_request(dis); break;
    case 'auth': auth(dis); break;
    case 'close' : close_sub(dis); break;
    case 'events': get_events(dis); break;
    case 'filter': get_filter(dis); break;
    case 'outbox': get_outbox(dis); break;
    default: console.log('invalid operation',data)
  }
};


// get events from memory or db
const get_events =async([get_id,ids])=>
{
  let events = new Map();
  let missing = new Set();
  for (const id of ids)
  {
    if (manager.events.has(id)) 
      events.set(id,manager.events.get(id));
    else missing.add(id);
  }
  if (missing.size)
  {
    const from_db = await db.getByIds([...missing.values()]);
    for (const event of from_db)
    {
      const id = event.id;
      const dat = mk_dat({event});
      if (!manager.events.has(id)) manager.events.set(id,dat);
      missing.delete(id);
      events.set(id,dat);
    }
  }
  let result = [get_id,[...events.values()]];
  if (missing.size) result.push([...missing.values()])
  // if (missing.size) result.push([...missing.values()])
  postMessage(result);
};


const db_filter =async filter=>
{
  let events = new Map();
  for await (let event of db.queryEvents(filter))
  {
    events.set(event.id,event);
  }
  return events
};


const mem_events =events_map=>
{
  let dats = [];
  for (let [id,event] of events_map)
  {
    let dat;
    if (!manager.events.has(id)) 
    {
      dat = mk_dat({event});
      manager.events.set(id,dat);
    }
    else dat = manager.events.get(id);
    dats.push(dat);
  }
  return dats
}


// get events from memory or db
const get_filter =async([get_id,filter])=>
{
  let events = await db_filter(filter);
  let dats = mem_events(events);
  // let events = new Map();
  // for (let [id,event] of events)
  // {
  //   let dat;
  //   if (!manager.events.has(id)) 
  //   {
  //     dat = mk_dat({event});
  //     manager.events.set(id,dat);
  //   }
  //   else dat = manager.events.get(id);
  //   dats.push(dat);
  // }
  postMessage([get_id,dats]);
};


const get_outbox =async({request,outbox,options})=>
{
  request = await pre_process_request(request);
  
  // console.log(request,outbox,options);
  // return
  let [fid,filter] = request.slice(1);
  // let all_authors = [...filter.authors];
  if (Object.hasOwn(filter,'authors')) delete filter.authors;
  for (const [url,authors] of outbox)
  {
    let dis = 
    {
      request:['REQ',fid,{...filter,authors}],
      url,
      options
    };
    relay_request(dis);
  }
};


// upstream close subscription
const close_sub =id=>
{
  if (!manager.subs.has(id)) return;
  
  let sub_map = manager.subs.get(id);
  console.log(sub_map);
  for (const url of sub_map.keys())
  {
    let ids = sub_map.get(url);
    let relay = hires(url);
    for (const id of ids)
    {
      let sub = relay.subs.get(id);
      sub.closed = Math.floor(Date.now()/1000);

      sub_close(relay,id)
    }
  }
  manager.subs.delete(id);
};


// close subscription
const sub_close =(relay,id)=>
{
  let dis = 
  {
    close:id,
    json:JSON.stringify(['CLOSE',id]),
  };
  relay.worker.postMessage(['request',dis]);
};


// instantiate relay with worker
const hires =(url)=>
{
  if (!url)
  {
    console.trace(`manager.hires: no url`);
    return
  }
  let relay;
  if (manager.workers.has(url))
  {
    relay = manager.workers.get(url);
    if (relay?.terminated) 
    {
      console.log(`manager.hires: relay is terminated`,url);
      return
    }
  }
  else
  {
    url = is_valid_url(url);
    if (!url)
    {
      console.log(`url is invalid`,url);
      return
    }
    relay =
    {
      url,
      worker:new Worker(manager.worker_src+'?v=3&r='+encodeURIComponent(url)),
      subs:new Map(),
      closed:new Map(),
      key:NostrTools.generateSecretKey(),
      count:0,
    };
    let has_auth = manager.relays[url]?.sets.includes('auth');
    manager.workers.set(url,relay);
    relay.worker.onerror =e=>{ console.log('manager: error',url,e) };
    relay.worker.onmessage =e=>{ on_message(e.data,url) };
    relay.worker.postMessage(['open',url,has_auth]);
    ping(url);
  }
  return relay
};


// return kind information
const kind_type =kind=> 
{
  if (typeof kind === 'string') kind = parseInt(kind.trim());
  return NostrTools.kinds.classifyKind(kind);
}


const ping =url=>
{
  let relay = hires(url);
  if (relay.ping) clearTimeout(relay.ping);
  relay.ping = setTimeout(()=>
    {
      if (!relay.terminated) console.log('no pong',relay);
    },
    21000
  );
  setTimeout(()=>{relay.worker.postMessage(['ping'])},15000);
};


// make event wrapper object
const mk_dat =(o={})=>
{
  const dat = {};
  if (o.event) 
  {
    dat.event = o.event;
    if (kind_type(dat.event.kind) === 'parameterized')
    {
      let id_a = fx_id_ae(dat.event);
      if (id_a) dat.id_a = id_a;
    }
  }
  dat.seen = o.seen || [];
  dat.subs = o.subs || [];
  dat.clas = o.clas || [];
  dat.refs = o.refs || [];
  return dat
};


// ["AUTH", <challenge-string>]
const on_auth =async(challenge,url)=> 
{
  if (!challenge)
  {
    console.log('auth: no challenge',url)
    return;
  }
  
  let relay = hires(url);
  if (!relay) return;
  relay.challenge = challenge;

  let unsigned = NostrTools.nip42.makeAuthEvent(url,challenge);
  let dis = {};
  if (!manager.relays[url]?.sets.includes('auth'))
  {
    // console.log(relay);
    let signed = NostrTools.finalizeEvent(unsigned,relay.key);
    if (signed) 
    {
      dis.json = JSON.stringify(['AUTH',signed]);
      relay.worker.postMessage(['auth',dis]);
    }
  }
  else 
  {
    // relay.worker.postMessage(['waiting',challenge]);
    postMessage(['auth',unsigned,url]);
  }
};


// relay worker closed sub for a reason
const on_closed =async(a,url)=>
{
  let [sub_id,reason] = a.slice(1);
  if (!reason) return;
  
  let [what,why] = reason.split(':');
  switch (what)
  {
    // case 'block':
    // case 'blocked':
    case 'restricted':
    case 'auth-required':
      console.log(url,sub_id,reason);
      terminate({url});
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


// relay worker eose
const on_eose =async(id,url)=>
{
  let relay = hires(url);
  
  let sub = relay.subs.get(id);
  if (!sub) return;
  sub.done = true;
  if (sub.options 
  && sub.options.eose === 'close')
  {
    sub.closed = Math.floor(Date.now()/1000);
    let subscription = manager.subs.get(sub.id);
    if (subscription)
    {
      if (subscription.has(url)) subscription.delete(url);
      if (subscription.size === 0) manager.subs.delete(sub.id);
    }
    sub_close(relay,id)
  }
  postMessage(['eose',sub.id,url]);
  // console.log(manager.subs)
};


// relay worker event
const on_event =(a,url)=>
{
  let [sub_id,event] = a.slice(1);
  
  const seen = [];
  const subs = [];

  if (url)
  {
    seen.push(url);
    let relay = hires(url);
    let sub = relay.subs.get(sub_id);
    subs.push(sub.id);
    relay.count++;
  }
  else subs.push(sub_id);
  
  check_limits();

  let dat = manager.events.get(event.id);
  if (dat)
  {
    a_add(dat.seen,seen);
    a_add(dat.subs,subs);
  }
  else
  {
    let event_is_valid;
    try { event_is_valid = NostrTools.verifyEvent(event) }
    catch { console.error('invalid event: ', event) }
    if (event_is_valid)
    {
      dat = mk_dat({event,seen,subs});
      manager.events.set(event.id,dat);
      setTimeout(()=>{db.saveEvent(event)},0)
    }
  }
  postMessage(['event',dat,url]);
};


// relay worker message
const on_message =(a,url)=>
{
  switch (a[0].toLowerCase())
  {
    case 'auth': on_auth(a[1],url); break;
    case 'closed': on_closed(a,url); break;
    case 'eose': on_eose(a[1],url); break;
    case 'event': on_event(a,url); break;
    case 'ok': on_ok(a,url); break;
    case 'pong': ping(url); break;
    case 'state': on_state(a,url); break;
    case 'aborted':
    case 'terminated': terminate({url}); break;
    default:postMessage([...a,url])
  }
};


// relay worker ok response
const on_ok =async(a,url)=>
{
  postMessage([...a,url])
  if (a[2] === false) on_not_ok(a[3],url);
};


// relay refused event
const on_not_ok =(reason,url)=>
{
  if (!reason) return;
  
  let [what,why] = reason.split(':');
  switch (what)
  {
    case 'block':
    case 'blocked':
    case 'auth-required':
      terminate({url});
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


const on_state =async([s,state,worker],url)=>
{
  let relay = hires(url);
  relay.state = state;
  relay.o = worker;
  let subs = relay.subs;
  let dis = {state,...worker,subs,url};
  postMessage([s,dis]);
};


const pre_process_request =async request=>
{
  let [type,sub_id,filter] = request;
  if (type === 'REQ')
  {
    let since = 1;
    // let events = await db_filter(filter);

    for await (let event of db.queryEvents(filter))
    {
      if (event.created_at > since) since = event.created_at;
      let dat = mk_dat({event});
      manager.events.set(event.id,dat);
      on_event([type,sub_id,event]);
    }
    // if (request[2].since && request[2].since < since) 
    //   request[2].since = since + 1;
  }
  return request
};


// check where to send request
const process_request =async data=>
{
  let {relays,request,options} = data;
  request = await pre_process_request(request);
  for (const url of relays) relay_request({url,request,options});
};


const relay_info =async(relays={})=>
{
  for (const relay in relays)
  {
    manager.relays[relay] = relays[relay];
    manager.relays[relay].info = await NostrTools.nip11.fetchRelayInformation(relay);
    postMessage(['info',[relay,manager.relays[relay]]])
  }
};


// post request to relay workers
const relay_request =({url,request,options})=>
{
  let relay = hires(url);
  if (!relay)
  {
    console.log('relay is invalid',url);
    return
  }

  if (!request?.length)
  {
    console.log('invalid request');
    return
  }
  request = [...request];
  let dis = {};
  switch (request[0].toLowerCase())
  {
    case 'req':
      let id = request[1];
      let sub_id = 'sub:'+(relay.subs.size+1);
      request[1] = sub_id;
      dis.id = sub_id;
      dis.request = request;
      relay.subs.set(sub_id,{id,request,options});
      if (!manager.subs.has(id)) manager.subs.set(id,new Map());
      let r_sub = manager.subs.get(id);
      if (!r_sub.has(url)) r_sub.set(url,new Set());
      r_sub.get(url).add(sub_id);
      postMessage(['sub',url,id,sub_id]);
      break;
    
    case 'event':
      let dat = manager.events.get(request[1].id);
      if (dat && dat.seen.includes(url)) return;
      break;
  }
  dis.json = JSON.stringify(request);
  relay.worker.postMessage(['request',dis]);
};


// order to terminate workers
const terminate =async o=>
{
  let relay = hires(o.url);
  if (!relay)
  {
    console.error('!relay',o)
    return;
  }
  
  relay.o = o;
  relay.worker.terminate();
  let state = 3;
  let subs = relay.subs;
  postMessage(['state',{state,...o,subs}]);
};