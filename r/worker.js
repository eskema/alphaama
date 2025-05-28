// alphaama websocket worker
const worker =
{
  requests:[],
  sent:[],
  successes:[],
  failures:[],
  errors:[],
  aborts:[],
  messages:[],
};


// get stuff
const get = 
{
  // now in seconds
  get now(){return Math.floor(Date.now()/1000)},
  // timeout exponential delay
  get times(){return 420*(worker.failures.length+1)}
}


// websocket
let ws;



// terminate worker
const abort =()=>
{
  console.log('aborted',worker);
  worker.aborted.push(get.now);
  if (worker.aborted > 3) terminate('aborted')
  else setTimeout(connect,500)
};


// // send websocket a request to close subscription
// const close_request =request=>
// {
//   send_request(JSON.stringify(request))
// };


// open websocket connection
const connect =url=>
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
      worker.id = `${url}/${Math.floor(100000+Math.random()*900000)}`;
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

  // const abort_connect = setTimeout(()=>{abort()},6999);

  ws = new WebSocket(worker.url);
  ws.onerror =e=>
  {
    worker.errors.push(get.now);
    // console.log('error',worker)
  };
  ws.onclose =e=>
  {
    // console.log('ws closed',worker);
    if (worker.failures.length < 21)
    {
      worker.failures.push(get.now);
      setTimeout(connect,get.times)
    }
  };
  ws.onmessage = on_message;
  ws.onopen =()=>
  {
    // clearTimeout(abort_connect);
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
    case 'open' : connect(data[1]); break;
    case 'auth': send_request(data[1]); break;
    case 'request': process_requests(data[1]); break;
    // case 'close' : close_request(data); break;
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
  if (request) 
  {
    // console.log(worker.requests);
    worker.requests.push(request);
  }
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
    setTimeout(()=>{send_request(request)},get.times)
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