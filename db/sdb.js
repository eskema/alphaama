const ports = new Set();


onconnect =e=>
{
  const port = e.ports[0];
  port.addEventListener('message',me=>
  {
    // port.postMessage(me.data);
    port_message(me.data,port);
  });
  port.start();
  port.postMessage('connected');
  ports.add(port);
};


// on worker message
const port_message =async(message,port)=>
{
  port.postMessage(message);
  // if (!Array.isArray(data)
  // || !data?.length)
  // {
  //   console.log('invalid data',data);
  //   return
  // }
  // switch (data[0].toLowerCase())
  // {
  //   default: console.log('shared worker operation',data)
  // }
};


const post_port =(data,port)=>
{
  if (!port) port = ports.values().next().value;
  port.postMessage(data)
};
