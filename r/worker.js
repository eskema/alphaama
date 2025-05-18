// alphaama websocket worker
const worker =
{
  id:Math.floor(100000+Math.random()*900000),
  requests:[],
  sent:[],
  failures:[],
  successes:[],
};


const wut = 
{
  // now in seconds
  get now(){return Math.floor(Date.now()/1000)},
  // timeout exponential delay
  get ils(){return 420*(worker.failures.length+1)}
}


// websocket
let ws;



// terminate worker
const aborted =()=>
{
  ws = null;
  worker.terminated = wut.now;
  postMessage(['aborted',worker])
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
    }
    catch(er)
    {
      console.log('invalid url',url);
      return
    }
  }

  if (!worker.url)
  {
    console.log('no url');
    return
  }

  const abort_connect = setTimeout(()=>
  {aborted()},6999);

  ws = new WebSocket(worker.url);
  ws.onerror =e=>{ console.log('error',e) };
  ws.onclose =e=>
  {
    if (worker.failures.length < 21)
    {
      worker.failures.push(wut.now);
      setTimeout(()=>{connect(url)},wut.times)
    }
  };
  ws.onmessage = on_message;
  ws.onopen =()=>
  {
    clearTimeout(abort_connect);
    worker.successes.push(wut.now);
    process_requests();
    post_state();
  }
};


// on websocket message
const on_message =e=>
{
  let data;
  try { data = JSON.parse(e.data) }
  catch(er)
  { 
    console.log('unknown data',er);
    return
  }
  if (Array.isArray(data)) postMessage(data);
  else console.log('bad data',e.data);
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
    case 'open' : await connect(data[1]); break;
    case 'request': process_requests(data[1]); break;
    case 'close' : close_request(data); break;
    default: console.log('invalid operation',data)
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
    setTimeout(()=>{send_request(request)},wut.ils)
  }
};


// terminate worker
const terminate =()=>
{
  ws = null;
  worker.terminated = wut.now;
  postMessage(['terminated',worker])
};