// alphaama relay and db manager
//
// 0. Imports & State
// 1. Utilities          — event_batcher, mk_dat, nip11
// 2. Data: Memory & DB  — limits_reached, mem_events, db_filter, db_ids, get_events, get_filter
// 3. NIP-11 Relay Info  — fetch_info, relay_info
// 4. NIP-42 Auth        — auth, on_auth
// 5. Incoming Messages  — on_event, on_eose, on_closed, on_ok, on_not_ok, on_open, on_state, on_message
// 6. Request Pipeline   — sub_close, close_sub, pre_process_request, process_request, get_outbox, relay_request
// 7. WebSocket & Relay  — hires, set_relays, init, connect, on_worker_message, process_requests, send_request, terminate, terminate_worker
// 8. Entry Point        — onmessage


// ─── 0. IMPORTS & STATE ────────────────────────────────────

importScripts('/dep/nostr-tools.js','/dep/redstore.js','./fx.js');
// importScripts('/dep/nostr-tools.js','/dep/store.js','./fx.js');

const db_worker = new Worker('/dep/redstore-worker.js',{type:'module'});
const db = new redstore.RedEventStore(db_worker);
db.init();
// const db = new store.IDBEventStore;

const manager =
{
  limit:99999,
  paused:false,
  relays:new Map(),
  subs:new Map(),
  events:new Map(),
};


// ─── 1. UTILITIES ──────────────────────────────────────────

// event batching to reduce postMessage overhead
const event_batcher = (() => {
  const batches = new Map(); // url → [events]
  let scheduled = false;

  const flush = () => {
    for (const [url, events] of batches) {
      if (events.length === 1) {
        // Single event - send normally for backward compatibility
        postMessage(['event', events[0], url]);
      } else {
        // Multiple events - send as batch
        postMessage(['events', events, url]);
      }
    }
    batches.clear();
    scheduled = false;
  };

  return {
    add: (dat, url) => {
      if (!batches.has(url)) batches.set(url, []);
      batches.get(url).push(dat);

      if (!scheduled) {
        scheduled = true;
        // Batch within single microtask (immediate, but allows accumulation)
        Promise.resolve().then(flush);
      }
    },

    // Force immediate flush (for critical events)
    flushNow: () => {
      if (scheduled) flush();
    }
  };
})();


// make event wrapper object
const mk_dat =(o={})=>
{
  const dat = {};
  if (o.event)
  {
    dat.event = o.event;
    if (NostrTools.kinds.classifyKind(dat.event.kind) === 'parameterized')
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
      clearTimeout(abort);
      resolve()
    })
  })
};


// ─── 2. DATA: MEMORY & DB ─────────────────────────────────

const limits_reached =()=>
{
  if (manager.locked) return true;

  if (manager.events.size < manager.limit) return false;
  manager.locked = true;

  for (const url of manager.relays.keys())
    terminate(url)

  postMessage(['limit','too many events'])
  return true
};


const mem_events =events_map=>
{
  let events = [];
  if (limits_reached()) return events;

  for (let [id,event] of events_map)
  {
    let dat;
    if (!manager.events.has(id))
    {
      dat = mk_dat({event});
      manager.events.set(id,dat);
    }
    else dat = manager.events.get(id);
    events.push(dat);
  }
  return events
};


const db_filter =async filter=>
{
  let events = new Map();
  try
  {
    let results = await db.queryEvents(filter);
    for (let event of results)
      events.set(event.id,event);
    // for await (let event of db.queryEvents(filter))
    // {
    //   events.set(event.id,event)
    // }
  }
  catch(er){ console.error(er)}

  return mem_events(events)
};


const db_ids =async ids=>
{
  let events = new Map();
  const from_db = await db.queryEvents({ids});
  for (const event of from_db)
  {
    events.set(event.id,event)
  }
  // const from_db_old = await db.getByIds(ids);
  // for (const event of from_db_old)
  // {
  //   events.set(event.id,event)
  // }
  return mem_events(events)
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
    missing = missing.difference(new Set(from_db.map(i=>i.event.id)));
    for (const dat of from_db) events.set(dat.event.id,dat);
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


// ─── 3. NIP-11 RELAY INFO ─────────────────────────────────

const fetch_info =async url=>
{
  url = is_valid_url(url);
  if (!url) return;

  let relay = manager.relays.get(url);

  if (relay?.no_info) return;
  let info;
  try { info = await nip11(url) }
  catch(er)
  {
    console.log('error retrieving nip11', url)
  }

  info = info || null;
  if (relay)
  {
    if (info) relay.info = info;
    else relay.no_info = true;
  }
  postMessage(['info',url,info]);
};


const relay_info =async(relays=[])=>
{
  for (const url of relays) fetch_info(url)
};


// ─── 4. NIP-42 AUTH ───────────────────────────────────────

const auth =data=>
{
  let {relays,request} = data;
  let relay = hires(relays[0]);
  if (!relay)
  {
    console.log('manager auth: relay is invalid',relays[0]);
    return
  }
  on_worker_message(relay,{data:['auth',{json:JSON.stringify(request)}]});
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

  if (relay.sets.includes('auth'))
  {
    postMessage(['auth',unsigned,url]);
    return
  }

  let event = NostrTools.finalizeEvent(unsigned,relay.key);
  if (event)
  {
    manager.events.set(event.id,mk_dat({event}));
    on_worker_message(relay,
    {
      data:
      [
        'auth',
        {
          json: JSON.stringify(['AUTH',event])
        }
      ]
    });
  }
};


// ─── 5. INCOMING: RELAY MESSAGES ──────────────────────────

// relay worker event
const on_event =(a,url)=>
{
  if (limits_reached()) return;
  let [sub_id,event] = a.slice(1);

  let sub_name;
  if (url)
  {
    let relay = hires(url);
    if (!relay) return;
    let sub = relay.worker.subs.get(sub_id);
    if (!sub) return;
    sub_name = sub.id;
  }
  else sub_name = sub_id;

  let dat = manager.events.get(event.id);
  if (dat)
  {
    if (url && !dat.seen.includes(url)) dat.seen.push(url);
    if (!dat.subs.includes(sub_name)) dat.subs.push(sub_name);
    event_batcher.add(dat, url);
  }
  else
  {
    let event_is_valid;
    try { event_is_valid = NostrTools.verifyEvent(event) }
    catch { console.error('invalid event: ', event) }
    if (event_is_valid)
    {
      let seen = url ? [url] : [];
      dat = mk_dat({event,seen,subs:[sub_name]});
      manager.events.set(event.id,dat);
      event_batcher.add(dat, url);
      setTimeout(()=>{db.saveEvent(event)},0)
    }
  }
};


// relay worker eose
const on_eose =async(id,url)=>
{
  let relay = hires(url);
  if (!relay) return;

  let sub = relay.worker.subs.get(id);
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
      terminate(url);
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


// relay worker ok response
const on_ok =async(a,url)=>
{
  postMessage([...a,url]);
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
      terminate(url);
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


const on_open =data=>
{
  // console.log(data)
};


const on_state =async relay=>
{
  postMessage(['state',
  {
    state: relay.ws?.readyState || 0,
    ...relay.worker
  }]);
};


// relay worker message router
const on_message =(a,url)=>
{
  switch (a[0].toLowerCase())
  {
    case 'auth': on_auth(a[1],url); break;
    case 'open': on_open(a); break;
    case 'closed': on_closed(a,url); break;
    case 'eose': on_eose(a[1],url); break;
    case 'event': on_event(a,url); break;
    case 'ok': on_ok(a,url); break;
    case 'aborted':
    case 'terminated': terminate(url); break;
    default:
      postMessage([...a,url])
  }
};


// ─── 6. REQUEST PIPELINE ──────────────────────────────────

// close subscription on a specific relay
const sub_close =(relay,id)=>
{
  let dis =
  {
    close: id,
    json: JSON.stringify(['CLOSE',id]),
  };
  on_worker_message(relay,{data:['request',dis]});
};


// close subscription on all relays
const close_sub =id=>
{
  let subscription = manager.subs.get(id);
  if (!subscription) return;
  for (const [url, sub_ids] of subscription)
  {
    let relay = manager.relays.get(url);
    if (!relay?.worker) continue;
    for (const sub_id of sub_ids)
      sub_close(relay, sub_id);
  }
  manager.subs.delete(id);
};


const pre_process_request =async request=>
{
  let [type,sub_id,filter] = request;
  if (type === 'REQ')
  {
    let results = await db.queryEvents(filter);
    for (let event of results)
    {
      let dat = mk_dat({event});
      manager.events.set(event.id,dat);
      on_event([type,sub_id,event]);
    }
    // for await (let event of db.queryEvents(filter))
    // {
    //   let dat = mk_dat({event});
    //   manager.events.set(event.id,dat);
    //   on_event([type,sub_id,event]);
    // }
  }
  return request
};


// check where to send request
const process_request =async data=>
{
  let {relays,request,options} = data;
  if (options?.db !== false)
    setTimeout(()=>{pre_process_request(request)})

  setTimeout(()=>
  {
    for (const url of relays) relay_request({url,request,options});
  },420);
};


const get_outbox =async({request,outbox,options})=>
{
  // ensure outbox relays are registered in manager
  for (const [url] of outbox)
  {
    let valid = is_valid_url(url);
    if (valid && !manager.relays.has(valid))
      manager.relays.set(valid,{sets:['out']});
  }

  let [fid,filter] = request.slice(1);
  if (Object.hasOwn(filter,'authors')) delete filter.authors;

  let batch_size = 20;
  let delay = 420;
  for (let i = 0; i < outbox.length; i += batch_size)
  {
    let batch = outbox.slice(i, i + batch_size);
    setTimeout(()=>
    {
      for (const [url,authors] of batch)
      {
        relay_request(
        {
          request:['REQ',fid,{...filter,authors}],
          url,
          options
        });
      }
    }, delay);
    delay += 3000;
  }

  pre_process_request(request);
};


// post request to relay workers
const relay_request =async({url,request,options})=>
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
      let sub_id = 'sub:'+(relay.worker.subs.size+1);
      request[1] = sub_id;
      dis.id = sub_id;
      dis.request = request;
      relay.worker.subs.set(sub_id,{id,request,options});
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
  on_worker_message(relay,{data:['request',dis]});
};


// ─── 7. WEBSOCKET & RELAY LIFECYCLE ───────────────────────

// instantiate relay with worker
const hires =(url)=>
{
  if (!url)
  {
    console.trace(`manager.hires: no url`);
    return
  }

  let relay = manager.relays.get(url);
  if (!relay)
  {
    console.trace(`manager.hires: no relay`);
    return
  }

  if (relay.worker)
  {
    if (relay.worker.terminated)
    {
      console.log(`manager.hires: relay is terminated`,url);
      return
    }
    else return relay
  }

  url = is_valid_url(url);
  if (!url)
  {
    console.log(`url is invalid`,url);
    return
  }

  relay.worker =
  {
    url,
    errors:[],
    open:new Map(),
    queue:[],
    subs: new Map(),
    successes:[],
  };

  relay.key = NostrTools.generateSecretKey();

  connect(relay)

  return relay
};


const set_relays =relays=>
{
  for (let url in relays)
  {
    url = is_valid_url(url);
    if (!url) continue;

    let relay = manager.relays.get(url);
    if (!relay) { manager.relays.set(url,relays[url]); relay = relays[url] }
    else
    {
      for (const key in relays[url])
        relay[key] = relays[url][key];
    }

    if (!relay.info) fetch_info(url)
  }
};


const init =(options)=>
{
  // console.log('manager init',options);
  if (options.limit) manager.limit = options.limit;
  if (options.relays) set_relays(options.relays)
};


const connect =(relay)=>
{
  // let [s,url,has_auth,options] = a;

  if (manager.paused) return;

  if (relay.worker.terminated)
  {
    console.log('terminated',relay.worker.url);
    return
  }

  if (relay.ws?.readyState === 1) return;

  try { relay.ws = new WebSocket(relay.worker.url) }
  catch(er)
  {

  }

  if (!relay.ws)
  {
    console.log('could not connect to',relay.worker.url)
    return
  }

  relay.ws.onerror =e=>
  {
    relay.worker.errors.push(now());
    postMessage(['update_stats', relay.worker.url, 'error']);
    // console.log('error',worker)
  };

  relay.ws.onclose =e=>
  {
    if (manager.paused) return;

    if ((relay.worker.errors.length - relay.worker.successes.length) < 21)
    {
      relay.worker.errors.push(now());
      // Don't track error stats here - onerror already handles it
      setTimeout(()=>{connect(relay)},420*(relay.worker.errors.length+1))
    }
    else terminate_worker(relay);
  };

  relay.ws.onmessage =e=>
  {
    // worker.received.push(e.data);
    let data;
    try { data = JSON.parse(e.data) }
    catch(er)
    {
      console.log('unknown data',er);
      return
    }
    if (Array.isArray(data))
    {
      switch (data[0])
      {
        case 'AUTH':
          relay.waiting = data[1];
          break;
        case 'EVENT':
          let date = data[2].created_at;
          let sub = relay.worker.open.get(data[1]);
          if ((sub && !sub.stamp) || sub?.stamp < date)
            sub.stamp = date;
          break;
      }
      on_message(data,relay.worker.url)
    }
    else console.log('bad data from ws',e.data);
  };
  relay.ws.onopen =()=>
  {
    if (!relay.worker.successes.length)
    {
      on_message(['open',relay.worker.url]);
    }

    relay.worker.successes.push(now());
    postMessage(['update_stats', relay.worker.url, 'success']);

    if (relay.worker.open.size)
    {
      for (const [id,request] of relay.worker.open)
      {
        if (request.stamp)
          request.request[2].since = request.stamp;
        request.json = JSON.stringify(request.request);
        relay.worker.queue.push(request);
        // worker.open.delete(id)
        // setTimeout(()=>{worker.open.delete(id)},10);
      }
      relay.worker.open.clear();
    }
    // console.log('worker connected to '+worker.url,worker);
    // delay to give time for auth
    setTimeout(()=>{process_requests(relay)},1111);
    on_state(relay)
  }
};


// on worker message
const on_worker_message =async(relay,e)=>
{
  let data = e.data;
  if (!Array.isArray(data)
  || !data?.length)
  {
    console.log('invalid data',data);
    return
  }
  switch (data[0].toLowerCase())
  {
    case 'open' : connect(relay); break;
    case 'auth':
      relay.authed = true;
      // console.log(data);
      if (Object.hasOwn(relay,'waiting')) delete relay.waiting;
      send_request(relay,data[1]);
      setTimeout(()=>{process_requests(relay)},500);
      break;
    case 'request': process_requests(relay,data[1]); break;
    case 'waiting': relay.waiting = data[1]; break;
    default: console.log('invalid operation',data)
  }
};


const process_requests =(relay,request)=>
{
  if (request)
    relay.worker.queue.push(request);

  let is_ready = relay.sets.includes('auth')
    ? relay.authed
    : true;

  if (is_ready)
  {
    while (relay.worker.queue.length)
    {
      if (relay.worker.open.size < 19)
        send_request(relay,relay.worker.queue.shift())
      else
      {
        setTimeout(()=>{process_requests(relay)},1000)
        return
      }
    }
  }
  else if (relay.waiting)
  {
    console.log(relay.worker.url+' is waiting');
    setTimeout(()=>{process_requests(relay)},1000)
  }
};


const send_request =(relay,request)=>
{
  if (relay.ws?.readyState === 1)
  {
    if (Object.hasOwn(request,'close'))
    {
      if (relay.worker.open.has(request.close))
        relay.worker.open.delete(request.close);
    }
    else if (Object.hasOwn(request,'id'))
    {
      relay.worker.open.set(request.id,request);
    }
    relay.ws.send(request.json);
    // relay.worker.sent.push(request.json);
    on_state(relay)
    return
  }
  // try again later
  if (!Object.hasOwn(relay.worker,'terminated')
  && relay.worker.errors.length < 21)
    setTimeout(()=>{send_request(relay,request)},
      420*(relay.worker.errors.length+1))
};


// order to terminate workers
const terminate =async url=>
{
  let relay = hires(url);
  if (!relay)
  {
    // console.error('!relay',url)
    return
  }
  postMessage(['state',{state:3,url,subs:relay.worker.subs}]);
};


// terminate worker
const terminate_worker =(relay,s='terminated')=>
{
  delete relay.ws;
  relay.worker.terminated = now();
  postMessage(['update_stats', relay.worker.url, 'terminated']);
  terminate(relay.worker.url)
};


// pause all relay activity (offline)
const pause =()=>
{
  manager.paused = true;
  for (const [url,relay] of manager.relays)
  {
    if (!relay.worker || relay.worker.terminated) continue;
    // move open subs back so onopen can resume them
    // ws will close on its own since we're offline
  }
};


// resume relay activity (back online)
const resume =()=>
{
  manager.paused = false;
  for (const [url,relay] of manager.relays)
  {
    if (!relay.worker || relay.worker.terminated) continue;
    if (!relay.ws || relay.ws.readyState > 1)
      connect(relay);
  }
};


// ─── 8. ENTRY POINT ───────────────────────────────────────

// on manager message
onmessage =e=>
{
  let data = e.data;
  if (!Array.isArray(data)
  || !data?.length)
  {
    console.log('manager onmessage: invalid data',data);
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
    case 'pause': pause(); break;
    case 'resume': resume(); break;
    default:
      console.log('manager onmessage: invalid operation',data)
  }
};
