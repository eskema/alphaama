// alphaama websocket worker
const worker =
{
  requests:[],
  sent:[],
  successes:[],
  failures:[],
  errors:[],
  messages:[],
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


  ws = new WebSocket(worker.url);
  ws.onerror =e=>
  {
    worker.errors.push(get.now);
    // console.log('error',worker)
  };
  ws.onclose =e=>
  {
    // console.log('ws closed',worker);
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
    // delay to give time for auth
    setTimeout(process_requests,1111);
    post_state();
  }
};


// on websocket message
const on_message =e=>
{
  worker.messages.push(e.data);
  let data;
  try { data = JSON.parse(e.data) }
  catch(er)
  { 
    console.log('unknown data',er);
    return
  }
  if (Array.isArray(data)) postMessage(data);
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
  if (request)
  {
    // console.log(worker.requests);
    worker.requests.push(request);
  }
  let is_ready = worker.has_auth ? worker.authed : true;
  if (is_ready) 
  {
    while (worker.requests.length)
    send_request(worker.requests.shift())
  }
  else if (worker.has_auth && worker.waiting)
  {
    setTimeout(process_requests,1000)
  }
};


// send websocket request 
const send_request =request=>
{
  if (ws?.readyState === 1) 
  {
    ws.send(request);
    worker.sent.push(request);
    post_state()
  }
  else if (!Object.hasOwn(worker,'terminated')
  && worker.failures < 21)
  {
    // try again later
    setTimeout(()=>{send_request(request)},get.delay)
    return
  }
};


// terminate worker
const terminate =(s='terminated')=>
{
  ws = null;
  worker.terminated = get.now;
  postMessage([s,worker])
};