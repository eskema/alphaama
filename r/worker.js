importScripts('/dep/nostr-tools.js');

let relay;
const ops = {};

// on worker message
onmessage =async e=>
{
  for (const a of e.data)
  {
    if (!Array.isArray(a)) 
    {
      postMessage(['invalid data',a]);
      continue
    }
    let op = a[0];
    if (!op in ops)
    {
      postMessage(['invalid operation',op]);
      continue
    }
    await ops[op](a);
  }
};

// boot up connection to relay
ops.connect =async([op,url])=>
{
  if (!relay || !relay.connected)
  {
    if (!url && relay?.url) url = relay.url;
    relay = await NostrTools.Relay.connect(url);
  }
  postMessage([op,relay.connected,relay.url])
};

ops.REQ =a=>
{
  // a = ['REQ',<id>'',<filter>{},<options>{}]
  let [type,id,filter,options] = a;
  if (!relay)
  {
    postMessage(['error','!relay']);
    return
  }
  let received = 0;
  const sub = relay.subscribe([a[2]],
  {
    onevent(event)
    {
      postMessage(['event',event,sub.id]);
      received++;
    },
    oneose()
    {
      postMessage(['eose',sub.id]);
      if(options?.eose === 'close') sub.close()
    }
  });
  postMessage(['sub',a[1],sub.id]);
};

ops.CLOSE =a=>
{
  // a = ['CLOSE',<id>'']
  if (!relay)
  {
    postMessage(['error','!relay']);
    return
  }
};

ops.ping =a=>
{
  // a = ['ping']
  if (!relay)
  {
    postMessage(['error','!relay']);
    return
  }
  postMessage(['pong',relay]);
};