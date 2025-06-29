// alphaama relay manager

// nostr-tools
importScripts('/dep/nostr-tools.js');


// relay manager
const manager = 
{
  relays:null,
  subs:new Map(),
  events:new Map(),
  worker_src:'/r/worker.js?v=3',
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


// is verifies event cryptographically
const is_valid_event =event=>
{
  let verified;
  try { verified = NostrTools.verifyEvent(event) }
  catch(er){ console.error('unable to verify:',event) };
  return verified
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
    case 'request': process_request(dis); break;
    case 'auth': auth(dis); break;
    case 'close' : close_sub(dis); break;
    default: console.log('invalid operation',data)
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
      relay.worker.postMessage(['request',JSON.stringify(['CLOSE',id])]);
    }
  }
  manager.subs.delete(id);
};


// order to terminate workers
const terminate =async o=>
{
  let url = o.url;
  let relay = hires(url);
  if (!relay)
  {
    console.error('!relay',o)
    return;
  }
  
  relay.terminated = o;
  relay.worker.terminate();
  let state = 3;
  let worker = relay.w;
  let subs = relay.subs;
  postMessage(['state',{state,...worker,subs,url}]);
  console.log(['terminated',o]);
};


// instantiate relay with worker
const hires =(url)=>
{
  url = is_valid_url(url);
  if (!url)
  {
    console.log(`url is invalid`,url);
    return
  }

  let relay;
  if (manager.workers.has(url))
  {
    relay = manager.workers.get(url);
    if (relay?.terminated) return
  }
  else
  {
    relay =
    {
      url,
      worker:new Worker(manager.worker_src),
      subs:new Map(),
      key:NostrTools.generateSecretKey(),
    };
    let has_auth = manager.relays[url]?.sets.includes('auth');
    manager.workers.set(url,relay);
    relay.worker.onerror =e=>{ console.log('manager: error',url,e) };
    relay.worker.onmessage =e=>{ on_message(e.data,url) };
    relay.worker.postMessage(['open',url,has_auth]);
  }
  return relay
};


// make event wrapper object
const mk_dat =(o={})=>
{
  const dat = {};
  if (o.event) dat.event = o.event;
  dat.seen = o.seen || [];
  dat.subs = o.subs || [];
  dat.clas = o.clas || [];
  dat.refs = o.refs || [];
  return dat
};


// relay worker message
const on_message =(a,url)=>
{
  switch (a[0].toLowerCase())
  {
    case 'auth': on_auth(a[1],url); break;
    case 'eose': on_eose(a[1],url); break;
    case 'event': on_event(a,url); break;
    case 'ok': on_ok(a,url); break;
    case 'state': on_state(a,url); break;
    case 'aborted':
    case 'terminated': terminate(a[1],url); break;
    default:postMessage([...a,url])
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
    relay.worker.postMessage(['request',JSON.stringify(['CLOSE',id])]);
  }
};


// relay worker event
const on_event =async(a,url)=>
{
  let relay = hires(url);
  let [s,sub_id,event] = a;
  
  let new_data;
  const seen = [url];
  let sub = relay.subs.get(sub_id);
  const subs = [sub.id];
  
  let dat = manager.events.get(event.id);
  if (dat)
  {
    const new_seen = a_add(dat.seen,seen);
    const new_subs = a_add(dat.subs,subs);
    new_data = new_seen || new_subs;
  }
  else if (is_valid_event(event))
  {
    new_data = true;
    dat = mk_dat({event,seen,subs});
    manager.events.set(event.id,dat);
  }
  if (new_data) postMessage(['event',dat,url]);
};


// relay worker ok response
const on_ok =async(a,url)=>
{
  if (a[2] === false) not_ok(a,url);
  postMessage([...a,url])
};


// relay refused event
const not_ok =(a,url)=>
{
  let [s,id,is_ok,reason] = a;
  if (reason)
  {
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
  }
};


// ["AUTH", <challenge-string>]
const on_auth =async(challenge,url)=> 
{
  if (!challenge)
  {
    console.log('auth: no challenge')
    return;
  }
  
  let relay = hires(url);
  if (!relay) return;
  relay.challenge = challenge;

  let unsigned = NostrTools.nip42.makeAuthEvent(url,challenge);
  if (!manager.relays[url]?.sets.includes('auth'))
  {
    let signed = NostrTools.finalizeEvent(unsigned,relay.key);
    if (signed) 
    {
      let request = ['AUTH',signed];
      relay.worker.postMessage(['auth',JSON.stringify(request)]);
      // relay_request({url,request:['AUTH',signed]});
    }
  }
  else 
  {
    relay.worker.postMessage(['waiting',challenge]);
    postMessage(['auth',unsigned,url]);
  }
};


const on_state =async([s,state,worker],url)=>
{
  let relay = hires(url);
  relay.state = state;
  relay.o = worker;
  let subs = relay?.subs;
  postMessage([s,{state,...worker,subs,url}]);
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
  relay.worker.postMessage(['auth',JSON.stringify(request)]);
};


// check where to send request
const process_request =data=>
{
  let {relays,request,options} = data;
  for (const url of relays) relay_request({url,request,options});
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
  switch (request[0].toLowerCase())
  {
    case 'req':
      let id = request[1];
      let sub_id = 'sub:'+(relay.subs.size+1);
      request[1] = sub_id;
      relay.subs.set(sub_id,{id,request,options});
      if (!manager.subs.has(id)) manager.subs.set(id,new Map());
      let r_sub = manager.subs.get(id);
      if (!r_sub.has(url)) r_sub.set(url,new Set());
      let r_sub_r = r_sub.get(url);
      r_sub_r.add(sub_id);
      break;
    case 'event':
      let dat = manager.events.get(request[1].id);
      if (dat && dat.seen.includes(url)) return;
      break;
  }
  relay.worker.postMessage(['request',JSON.stringify(request)]);
};


// const subs_map =(id,url)=>
// {
//   if (!manager.subs.has(id)) return;
//   let sub_map = manager.subs.get(id);

//   let ids = sub_map.get(url);
//   let relay = hires(url);
//   for (const id of ids)
//   {
//     //
//   }
// };