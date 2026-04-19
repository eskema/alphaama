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
  closes:[],
  limit:99999,
  paused:false,
  relays:new Map(),
  subs:new Map(),
  events:new Map(),
  nip11_tried:new Set(),
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


// workaround: redstore ignores #d filter when authors is absent
const db_tag_filter =(events, filter)=>
{
  if (!filter['#d'] || filter.authors) return events;
  const values = filter['#d'];
  return events.filter(ev =>
    ev.tags.some(t => t[0] === 'd' && values.includes(t[1]))
  );
};

const db_time_filter =(events, filter)=>
{
  if (!filter.since && !filter.until) return events;
  return events.filter(ev =>
    (!filter.since || ev.created_at >= filter.since)
    && (!filter.until || ev.created_at <= filter.until)
  );
};

const db_filter =async filter=>
{
  let events = new Map();
  try
  {
    let results = db_time_filter(db_tag_filter(await db.queryEvents(filter), filter), filter);
    if (results.length > 500)
      console.warn('db_filter: %d results for', results.length, filter);
    for (let event of results)
      events.set(event.id,event);
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
  if (relay) relay.no_info = true;
  let info;
  try { info = await nip11(url) }
  catch(er)
  {
    console.log('error retrieving nip11', url)
  }

  info = info || null;
  if (relay && info) { delete relay.no_info; relay.info = info }
  postMessage(['info',url,info]);
};


const relay_info =async(relays=[])=>
{
  for (const url of relays)
  {
    let relay = manager.relays.get(url);
    if (relay) delete relay.no_info;
    fetch_info(url)
  }
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
    relay.auth_event_id = event.id;
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

  let relay = manager.relays.get(url);
  let request = relay?.worker.open.get(sub_id);
  if (relay) relay.worker.open.delete(sub_id);

  if (!reason) return;

  let [what,why] = reason.split(':');
  switch (what)
  {
    // case 'block':
    // case 'blocked':
    case 'restricted':
      terminate(url);
      break;
    case 'auth-required':
      // any relay can demand auth — if we already auto-signed, queue for resend after auth completes
      if (request && !relay?.authed)
      {
        if (!relay.auth_sub_queue) relay.auth_sub_queue = [];
        relay.auth_sub_queue.push(request);
      }
      else terminate(url);
      break;
    case 'rate-limited':
      // back off and stop blasting; resend will be gated by process_requests / keepalive
      if (relay)
      {
        relay.rate_limited_until = now() + 60;
        console.warn('rate-limited:',url,why || '');
      }
      break;
    // case 'pow':
    // case 'duplicate':
    // case 'invalid':
    // case 'error':
    // default:
  }
};


// relay worker ok response
const on_ok =(a,url)=>
{
  let event_id = a[1];
  let ok = a[2];
  let relay = manager.relays.get(url);

  // OK for our auto-signed AUTH event — drive auth state. still surface to page for log visibility
  // (page-side aa.r.ok already skips ok_ok for kind 22242).
  if (relay?.auth_event_id === event_id)
  {
    if (ok)
    {
      relay.authed = true;
      delete relay.waiting;
      clearTimeout(relay.auth_timeout);
      delete relay.auth_timeout;
      flush_after_auth(relay);
    }
  }

  let kind = manager.events.get(event_id)?.event?.kind;
  postMessage([...a,url,kind]);
  if (ok === false) on_not_ok(event_id,a[3],url);
};


// flush queues that were blocked by the auth gate
const flush_after_auth =relay=>
{
  if (relay.auth_queue?.size)
  {
    for (const id of relay.auth_queue)
    {
      let dat = manager.events.get(id);
      if (dat) send_request(relay,{json: JSON.stringify(['EVENT', dat.event])});
    }
    relay.auth_queue.clear();
  }
  if (relay.auth_sub_queue?.length)
  {
    for (const request of relay.auth_sub_queue)
      send_request(relay,request);
    relay.auth_sub_queue = [];
  }
  process_requests(relay);
};


// relay refused event
const on_not_ok =(event_id,reason,url)=>
{
  if (!reason) return;

  let relay = manager.relays.get(url);

  // our auto-signed AUTH event was rejected — relay won't accept this client
  if (relay?.auth_event_id === event_id)
  {
    terminate(url);
    return
  }

  let [what,why] = reason.split(':');
  switch (what)
  {
    case 'block':
    case 'blocked':
    case 'restricted':
      terminate(url);
      break;
    case 'auth-required':
      if (!relay) break;
      if (manager.events.has(event_id))
      {
        if (!relay.auth_queue) relay.auth_queue = new Set();
        relay.auth_queue.add(event_id);
      }
      break;
    // case 'pow':
    // case 'duplicate':
    // case 'rate-limited':
    // case 'invalid':
    // case 'error':
    // default:
  }
};


const on_open =data=>
{
  // console.log(data)
};


const state_pending = new Set();
const on_state =relay=>
{
  if (state_pending.has(relay.worker.url)) return;
  state_pending.add(relay.worker.url);
  Promise.resolve().then(()=>
  {
    state_pending.delete(relay.worker.url);
    postMessage(['state',
    {
      state: relay.ws?.readyState || 0,
      ...relay.worker
    }]);
  });
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

// dedupe array fields in a filter, returns a new filter if anything changed
const dedupe_filter =(filter,ctx)=>
{
  if (!filter || typeof filter !== 'object') return filter;
  let cleaned;
  for (const k of ['authors','ids','#p','#P','#e','#a','kinds'])
  {
    let v = filter[k];
    if (Array.isArray(v) && v.length !== new Set(v).size)
    {
      if (!cleaned) cleaned = {...filter};
      cleaned[k] = [...new Set(v)];
      console.warn(`dedupe_filter: ${k} ${v.length} → ${cleaned[k].length}`,ctx);
    }
  }
  return cleaned || filter
};


// shuffle pubkey arrays so order varies between requests
const shuffle_filter =filter=>
{
  if (!filter || typeof filter !== 'object') return filter;
  let shuffled;
  for (const k of ['authors','#p','#P'])
  {
    let v = filter[k];
    if (!Array.isArray(v) || v.length < 2) continue;
    if (!shuffled) shuffled = {...filter};
    shuffled[k] = shuffle(v);
  }
  return shuffled || filter
};


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


let pre_process_active = 0;
const pre_process_max = 3;
const pre_process_queue = [];

const pre_process_request =async request=>
{
  let [type,sub_id,filter] = request;
  if (type !== 'REQ') return request;

  if (pre_process_active >= pre_process_max)
    await new Promise(resolve=> pre_process_queue.push(resolve));

  pre_process_active++;
  try
  {
    let results = db_time_filter(db_tag_filter(await db.queryEvents(filter), filter), filter);
    if (results.length > 500)
      console.warn('pre_process: %d results for', results.length, filter);
    for (let event of results)
    {
      let dat = mk_dat({event});
      manager.events.set(event.id,dat);
      on_event([type,sub_id,event]);
    }
  }
  finally
  {
    pre_process_active--;
    if (pre_process_queue.length)
      pre_process_queue.shift()();
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


const get_outbox =async({request,outbox,outbox_keys,options})=>
{
  // ensure outbox relays are registered in manager
  for (const [url] of outbox)
  {
    let valid = is_valid_url(url);
    if (valid && !manager.relays.has(valid))
      manager.relays.set(valid,{sets:['out']});
  }

  let [fid,filter] = request.slice(1);

  pre_process_request(request);

  for (const {key} of outbox_keys) delete filter[key];

  let batch_size = 20;
  let delay = 420;
  for (let i = 0; i < outbox.length; i += batch_size)
  {
    let batch = outbox.slice(i, i + batch_size);
    setTimeout(()=>
    {
      for (const [url,all_pubs] of batch)
      {
        let f = {...filter};
        for (const {key,pubkeys} of outbox_keys)
        {
          let relevant = pubkeys.filter(p => all_pubs.includes(p));
          if (relevant.length) f[key] = relevant;
        }
        relay_request(
        {
          request:['REQ',fid,f],
          url,
          options
        });
      }
    }, delay);
    delay += 3000;
  }
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
      request[2] = dedupe_filter(request[2],{sub_id:request[1],url});
      request[2] = shuffle_filter(request[2]);

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
      if (!dat) manager.events.set(request[1].id, mk_dat({event: request[1]}));
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
    if (!relay.ws || relay.ws.readyState > 1)
      connect(relay);
    return relay
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

    if (!relay.info && !relay.no_info) fetch_info(url)
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

  if (relay.ws && relay.ws.readyState < 3) return;

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
    clearTimeout(relay.worker.ping);

    if (manager.paused) return;

    let url = relay.worker.url;
    console.log('ws close', url, e.code, e.reason || '');

    manager.closes.push(now());
    check_connectivity();

    if (manager.paused) return;

    let w = relay.worker;

    // don't reconnect if idle (no open subs, no queued requests)
    if (!w.open.size && !w.queue.length) return;

    // track rapid reconnect cycles
    let t = now();
    if (!w.closes) w.closes = [];
    w.closes.push(t);
    // keep last 5 minutes
    w.closes = w.closes.filter(c => t - c < 300);
    // if 3+ closes in 2 minutes, back off longer
    let recent = w.closes.filter(c => t - c < 120).length;

    if ((w.errors.length - w.successes.length) < 21)
    {
      w.errors.push(t);
      let delay = recent >= 3
        ? 30000 * Math.min(recent - 2, 4)
        : 420 * (w.errors.length + 1);
      setTimeout(()=>{connect(relay)}, delay);
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
      on_message(data,relay.worker.url);
      keepalive(relay);
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

    keepalive(relay);

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
      // dispatch our AUTH event but don't mark authed until OK true arrives.
      // queues are flushed by flush_after_auth() from on_ok.
      send_request(relay,data[1]);
      clearTimeout(relay.auth_timeout);
      // fallback: if the relay doesn't send OK at all (some don't), assume success after 5s
      relay.auth_timeout = setTimeout(()=>
      {
        if (!relay.authed && !relay.worker?.terminated)
        {
          relay.authed = true;
          delete relay.waiting;
          delete relay.auth_timeout;
          flush_after_auth(relay);
        }
      },5000);
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

  if (relay.worker.terminated) return;

  // block while an auth challenge is pending OK true
  let awaiting_auth = relay.waiting && !relay.authed;

  // block while rate-limited backoff is active
  let t = now();
  let rate_limited = relay.rate_limited_until && t < relay.rate_limited_until;

  if (!awaiting_auth && !rate_limited)
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
    return
  }

  if (relay.worker.queue.length)
  {
    let wait = rate_limited ? (relay.rate_limited_until - t + 1) * 1000 : 1000;
    setTimeout(()=>{process_requests(relay)},wait)
  }
};


// adaptive keepalive — only pings relays that have a pattern of dropping.
//
// sends a valid NIP-01 REQ+CLOSE pair that can't match any event (filter by
// an all-'a' id with limit:0). keeps the connection active without polluting
// the relay's real subscription state and without relying on non-standard
// message types. stable relays get no ping.
//
// computes the typical connection lifetime from the relay's open/close history.
// if the median lifetime is under 5 minutes, schedules a ping at 80% of that
// lifetime. otherwise the relay is stable enough to leave alone.
const PING_FILTER = {ids:['a'.repeat(64)], limit:0};

const keepalive =relay=>
{
  clearTimeout(relay.worker.ping);
  if (relay.ws?.readyState !== 1) return;

  let delay = ping_delay(relay);
  if (!delay) return;  // stable relay, no ping needed

  relay.worker.ping = setTimeout(()=>
  {
    if (relay.ws?.readyState !== 1) return;
    if (relay.rate_limited_until && now() < relay.rate_limited_until)
    {
      keepalive(relay);
      return
    }
    let ping_id = 'ping:' + now();
    relay.ws.send(JSON.stringify(['REQ', ping_id, PING_FILTER]));
    relay.ws.send(JSON.stringify(['CLOSE', ping_id]));
    keepalive(relay);
  }, delay);
};

// compute how soon to ping based on the relay's connection history.
// returns 0 if no ping is needed (stable or insufficient data).
const ping_delay =relay=>
{
  let w = relay.worker;
  if (!w.closes?.length || w.closes.length < 2) return 0;

  // pair each close with the latest open that preceded it → connection lifetime
  let lifetimes = [];
  let opens = w.successes || [];
  for (let i = 0; i < w.closes.length; i++)
  {
    let close_t = w.closes[i];
    let open_t = 0;
    for (let j = opens.length - 1; j >= 0; j--)
    {
      if (opens[j] <= close_t) { open_t = opens[j]; break; }
    }
    if (open_t > 0) lifetimes.push(close_t - open_t);
  }
  if (!lifetimes.length) return 0;

  lifetimes.sort((a, b) => a - b);
  let median = lifetimes[Math.floor(lifetimes.length / 2)];
  if (median <= 0) return 0;

  // stable relay: median lifetime > 5 minutes → no ping needed
  if (median > 300) return 0;

  // ping at 80% of median lifetime (in ms), minimum 10s
  return Math.max(median * 800, 10000);
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
    keepalive(relay);
    on_state(relay)
    return
  }
  // try again later
  if (!Object.hasOwn(relay.worker,'terminated')
  && relay.worker.errors.length < 21)
    setTimeout(()=>{send_request(relay,request)},
      420*(relay.worker.errors.length+1))
};


// terminate a relay: mark terminated, close ws, notify page. idempotent.
const terminate =async url=>
{
  let relay = manager.relays.get(url);
  if (!relay || !relay.worker) return;
  if (relay.worker.terminated) return;

  relay.worker.terminated = now();
  clearTimeout(relay.worker.ping);

  if (relay.ws)
  {
    try { relay.ws.close() } catch (er) {}
    delete relay.ws;
  }

  postMessage(['update_stats', url, 'terminated']);
  postMessage(['state',{state:3,url,subs:relay.worker.subs}]);
};


// terminate worker (called from ws.onclose when errors >> successes)
const terminate_worker =relay=> terminate(relay.worker.url);


// detect mass relay closures — if many drop at once, we're offline
const check_connectivity =()=>
{
  const recent = now() - 5;
  const recent_closes = manager.closes.filter(t => t > recent);

  let active = 0;
  for (const [,relay] of manager.relays)
  {
    if (relay.worker && !relay.worker.terminated) active++;
  }

  if (recent_closes.length >= Math.min(3, active)
  && recent_closes.length >= active * 0.5)
  {
    pause();
    postMessage(['offline']);
  }

  manager.closes = recent_closes;
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
  const to_reconnect = [];
  const closed_info = [];
  for (const [url,relay] of manager.relays)
  {
    if (!relay.worker || relay.worker.terminated) continue;
    if (!relay.ws || relay.ws.readyState > 1)
    {
      to_reconnect.push(relay);
      closed_info.push({ url, ws_state: relay.ws ? relay.ws.readyState : 'no_ws' });
    }
  }
  console.log('[resume] triggered — relays to reconnect:', to_reconnect.length,
    '\nclosed/missing ws:', closed_info,
    '\ntotal tracked relays:', manager.relays.size);
  let delay = 0;
  for (let i = 0; i < to_reconnect.length; i += 20)
  {
    const batch = to_reconnect.slice(i, i + 20);
    console.log(`[resume] batch ${i/20 + 1} (delay ${delay}ms):`, batch.map(r => r.worker.url));
    setTimeout(()=>{ for (const relay of batch) connect(relay) }, delay);
    delay += 3000;
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
    case 'save': db.saveEvent(dis); break;
    default:
      console.log('manager onmessage: invalid operation',data)
  }
};
