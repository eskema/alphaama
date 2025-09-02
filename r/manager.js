// alphaama relay and db manager

// nostr-tools
importScripts('/dep/nostr-tools.js','/dep/store.js');



// relay manager
const manager = 
{
  limit:99999,
  relays:new Map(),
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


const db = new store.IDBEventStore;


const db_filter =async filter=>
{
  let events = new Map();
  for await (let event of db.queryEvents(filter))
  {
    events.set(event.id,event)
  }
  return mem_events(events)
};


const db_ids =async ids=>
{
  let events = new Map();
  const from_db = await db.getByIds(ids);
  for (const event of from_db) 
  {
    events.set(event.id,event)
  }
  return mem_events(events)
};


const fetch_info =async url=>
{
  url = is_valid_url(url);
  if (!url) return;

  let relay = manager.relays.get(url);
  
  if (relay?.bad) return;
  let info;
  try { info = await nip11(url) }
  catch(er)
  {
    
  }
  
  info = info || null;
  if (relay)
  {
    if (info) relay.info = info;
    else relay.bad = true;
  }
  postMessage(['info',url,info]);
};


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


// get events from memory or db by ids
const get_events =async([get_id,ids])=>
{
  let events = new Map();
  let missing = new Set();
  let result = [get_id];
  for (const id of ids)
  {
    if (manager.events.has(id)) 
      events.set(id,manager.events.get(id));
    else missing.add(id);
  }
  if (missing.size)
  {
    let from_db = await db_ids([...missing.values()]);
    missing = missing.difference(new Set(from_db.map(i=>i.id)));
    for (const event of from_db) events.set(event.id,event);
  }

  result.push([...events.values()]);
  if (missing.size) result.push([...missing.values()])
  postMessage(result);
};


// get events from memory or db from filter
const get_filter =async([get_id,filter])=>
{
  let events = await db_filter(filter);
  postMessage([get_id,events]);
};


const get_outbox =async({request,outbox,options})=>
{
  request = await pre_process_request(request);
  let [fid,filter] = request.slice(1);
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
  let hired;
  if (manager.workers.has(url))
  {
    hired = manager.workers.get(url);
    if (hired?.terminated)
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
    hired =
    {
      url,
      worker:new Worker(manager.worker_src+'?v=3&r='+encodeURIComponent(url)),
      subs:new Map(),
      closed:new Map(),
      key:NostrTools.generateSecretKey(),
      count:0,
    };

    manager.workers.set(url,hired);
    hired.worker.onerror =e=>{ console.log('manager: error',url,e) };
    hired.worker.onmessage =e=>{ on_message(e.data,url) };
    let relay = manager.relays.get(url);
    let has_auth;
    if (!relay?.sets || !Array.isArray(relay.sets))
    {
      console.log('no relay sets',relay)
    }
    else has_auth = relay.sets.includes('auth');
    hired.worker.postMessage(['open',url,has_auth]);
    ping(url);
  }
  return hired
};


const init =(options)=>
{
  console.log('manager init',options);
  if (options.limit) manager.limit = options.limit;
  for (const url in options.relays)
  {
    let relay = manager.relays.set(url,options.relays[url]).get(url);
    if (!Object.hasOwn(relay,'info')) fetch_info(url);
  }
};


// converts string to URL and returns it or false
const is_valid_url =(s='')=>
{
  if (!s) return;
  let url;
  try { url = new URL(s) }
  catch(er) { console.error(s); return }
  let protocol_whitelist = [
    // 'http:','https:',
    'ws:','wss:'];
  if(!url.hostname.length
  || url.hostname.includes('.local')
  || url.hostname.includes('127.0.')
  || url.pathname.includes('://')
  || !protocol_whitelist.includes(url.protocol)
  ) return;
  else return url?.href
};

// is hexadecimal
const is_x =s=> /^[A-F0-9]+$/i.test(s);


// is a valid nostr key
const is_key =x=> is_x(x) && x.length === 64;


const limits_reached =()=>
{
  if (manager.events.size < manager.limit) return false;
  manager.locked = true;
  for (const [url,worker] of manager.workers)
    terminate({url})
  
  postMessage(['limit','too many events'])
  
  return true
};


// return kind information
const kind_type =kind=> 
{
  if (typeof kind === 'string') kind = parseInt(kind.trim());
  return NostrTools.kinds.classifyKind(kind);
}


const mem_events =events_map=>
{
  let dats = [];
  if (limits_reached()) return dats;

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


const nip11 =async url=>
{
  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>{resolve()},6666);

    NostrTools.nip11.fetchRelayInformation(url)
    .then(info=>
    {
      clearTimeout(abort);
      resolve(info)
    })
    .catch(er=>
    {
      // console.log(url,er)
    })
  })
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
    case 'init': init(dis); break;
    case 'terminate': terminate(dis); break;
    case 'relays': set_relays(dis); break;
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
  
  if (!manager.relays.get(url)?.sets.includes('auth'))
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
  if (limits_reached()) return;
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


const ping =async url=>
{
  let relay = hires(url);
  if (relay.ping) clearTimeout(relay.ping);
  relay.ping = setTimeout(()=>
    {
      if (!relay.terminated) console.log('no pong',relay);
    },
    9999
  );
  setTimeout(()=>{relay.worker.postMessage(['ping'])},6666);
};


const pre_process_request =async request=>
{
  let [type,sub_id,filter] = request;
  if (type === 'REQ')
  {
    // let since = 1;
    for await (let event of db.queryEvents(filter))
    {
      // if (event.created_at > since) since = event.created_at;
      let dat = mk_dat({event});
      manager.events.set(event.id,dat);
      on_event([type,sub_id,event]);
    }
  }
  return request
};


// check where to send request
const process_request =async data=>
{
  let {relays,request,options} = data;
  if (!options?.db === false) request = await pre_process_request(request);
  for (const url of relays) relay_request({url,request,options});
};


const relay_info =async(relays=[])=>
{
  for (const url of relays) fetch_info(url)
};


// post request to relay workers
const relay_request =({url,request,options})=>
{
  if (manager.locked) return;

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


const set_relays =relays=>
{
  for (const url in relays)
  {
    manager.relays.set(url,relays[url])
  }
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