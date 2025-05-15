// alphaama websocket worker
const worker =
{
  requests:[],
  sent:[],
  failures:[],
  successes:[]
};


// websocket
let ws;


// now in seconds
const now =()=> Math.floor(Date.now()/1000);


// checks if websocket is ready,
// if not, add to failures
// retry and terminate if too many failures
const check_state =()=>
{
  if (ws?.readyState === 1) return true;
  worker.failures.push(now());
  if (worker.failures.length > 21)
  {
    terminate();
    return
  }
  return true
};


// send websocket a request to close subscription
const close_request =request=>
{
  send_request(JSON.stringify(request))
};


// open websocket connection
const connect =async url=>
{
  if (worker.terminated)
  if (ws?.readyState === 1) return;

  if (!worker.url && url) 
  {
    try 
    { 
      url = new URL(url)?.href;
      worker.url = url;
    }
    catch(er)
    {
      err('invalid url',url);
      return
    }
  }

  if (!worker.url)
  {
    err('no url');
    return
  }

  const abort = setTimeout(check_state,6942);

  ws = new WebSocket(worker.url);
  ws.onclose = on_close;
  ws.onerror = on_error;
  ws.onmessage = on_message;
  ws.onopen =e=>
  {
    clearTimeout(abort);
    on_open();
  };
};


// default worker error
const err =(msg='error',err)=>
{
  console.error(`ws ${worker.url}: ${msg}`,err)
};


// on websocket close
const on_close =e=>
{
  retry(connect) 
};


// on websocket error
const on_error =e=>
{
  err('',e) 
};


// on websocket message
const on_message =e=>
{
  let data;
  try { data = JSON.parse(e.data) }
  catch(er)
  { 
    err('unknown data',er);
    return
  }
  if (Array.isArray(data)) postMessage(data);
  else err('bad data',e.data);
};


// on websocket open
const on_open =()=>
{
  worker.successes.push(now());
  process_requests();
  post_state();
};


// on worker message
onmessage =async e=>
{
  let data = e.data;
  if (!Array.isArray(data)
  || !data?.length)
  {
    err('invalid data',data);
    return
  }
  switch (data[0].toLowerCase())
  {
    case 'open' : await connect(data[1]); break;
    case 'request': process_requests(data[1]); break;
    case 'close' : close_request(data); break;
    default: err('invalid operation',data)
  }
};


// post websocket connection state
const post_state =()=>
{
  postMessage(['state',ws?.readyState||0,worker]);
};


// add request to requests and processes them all
const process_requests =request=>
{
  if (request) worker.requests.push(request);
  while (worker.requests.length) send_request(worker.requests.shift())
};


// retry running a function if relay is good
const retry =(f,dis)=>
{
  if (check_state()) setTimeout(()=>{ f(dis) },420*worker.failures.length);
};


// send websocket request 
const send_request =request=>
{
  if (ws?.readyState === 1) 
  {
    try 
    { 
      ws.send(request);
      worker.sent.push(request);
    }
    catch(er) {err('could not send',request)}
  }
  else retry(send_request,request);
  post_state()
};


// terminate worker
const terminate =()=>
{
  ws = null;
  worker.terminated = now();
  postMessage(['terminated',worker])
};