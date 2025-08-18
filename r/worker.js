// alphaama websocket worker
const worker =
{
  errors:[],
  failures:[],
  open:new Map(),
  queue:[],
  received:[],
  sent:[],
  successes:[],
};


// get stuff
const get = 
{
  // now in seconds
  get now(){return Math.floor(Date.now()/1000)},
  // timeout exponential delay
  get delay(){return 420*(worker.failures.length+1)}
}


// websocket
let ws;


// open websocket connection
const connect =(a=[])=>
{
  let [s,url,has_auth] = a;
  if (worker.terminated)
  {
    console.log('terminated',worker,url);
    return
  }

  if (ws?.readyState === 1) return;

  if (!worker.url && url)
  {
    try
    { 
      url = new URL(url)?.href;
      worker.url = url;
      worker.id = `${url}/${Math.floor(100000+Math.random()*900000)}`;
      if (has_auth) worker.has_auth = true;
    }
    catch(er)
    {
      console.log('ws invalid url',url);
      return
    }
  }

  if (!worker.url)
  {
    console.log('no url');
    return
  }
  try { ws = new WebSocket(worker.url) }
  catch {}
  
  if (!ws)
  {
    console.log('could not connect to',worker.url)
    return
  } 
  
  ws.onerror =e=>
  {
    worker.errors.push(get.now);
    // console.log('error',worker)
  };
  ws.onclose =e=>
  {
    if ((worker.failures.length - worker.successes.length) < 21)
    {
      worker.failures.push(get.now);
      setTimeout(connect,get.delay)
    }
    else terminate();
  };
  ws.onmessage = on_message;
  ws.onopen =()=>
  {
    worker.successes.push(get.now);
    if (worker.open.size)
    {
      for (const [id,request] of worker.open)
      {
        if (request.stamp) request.request[2].since = request.stamp;
        request.json = JSON.stringify(request.request);
        worker.queue.push(request);
        // worker.open.delete(id)
        // setTimeout(()=>{worker.open.delete(id)},10);
      }
      worker.open.clear();
    }
    // console.log('worker connected to '+worker.url,worker);
    // delay to give time for auth
    setTimeout(process_requests,1111);
    post_state();
  }
};

const log =()=>
{
  return [worker.url,[...worker.open.keys()],[...worker.queue,worker]]
};


// on websocket message
const on_message =e=>
{
  worker.received.push(e.data);
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
        worker.waiting = data[1];
        break;
      case 'EVENT':
        let date = data[2].created_at;
        let sub = worker.open.get(data[1]);
        if ((sub && !sub.stamp) || sub?.stamp < date) sub.stamp = date;
        break;
    }
    postMessage(data);
  }
  else console.log('bad data from ws',e.data);
};


// on worker message
onmessage =async e=>
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
    case 'open' : connect(data); break;
    case 'auth':
      worker.authed = true;
      // console.log(data);
      if (Object.hasOwn(worker,'waiting')) delete worker.waiting;
      send_request(data[1]);
      setTimeout(()=>{process_requests()},500);
      break;
    case 'request': process_requests(data[1]); break;
    case 'waiting': worker.waiting = data[1]; break;
    case 'ping': pong(); break;
    default: console.log('invalid operation',data)
  }
};


// respond to ping from manager
const pong =()=>
{
  postMessage(['pong']);
}


// post websocket connection state
const post_state =()=>
{
  postMessage(['state',ws?.readyState||0,worker]);
};


// add request to requests and processes them all
const process_requests =request=>
{
  if (request) worker.queue.push(request);
  let is_ready = worker.has_auth ? worker.authed : true;
  if (is_ready)
  {
    while (worker.queue.length)
    send_request(worker.queue.shift())
  }
  else if (worker.waiting)
  {
    console.log(worker.url+' is waiting');
    setTimeout(process_requests,1000)
  }
};


// send websocket request 
const send_request =request=>
{
  if (ws?.readyState === 1)
  {
    if (Object.hasOwn(request,'close'))
    {
      if (worker.open.has(request.close)) worker.open.delete(request.close);
    }
    else if (Object.hasOwn(request,'id'))
    {
      worker.open.set(request.id,request);
    }
    ws.send(request.json);
    worker.sent.push(request.json);
    post_state()
    return
  }
  // try again later
  if (!Object.hasOwn(worker,'terminated')
  && worker.failures < 21)  
    setTimeout(()=>{send_request(request)},get.delay)
};


// terminate worker
const terminate =(s='terminated')=>
{
  ws = null;
  worker.terminated = get.now;
  postMessage([s,worker])
};