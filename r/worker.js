// alternative storage system
const ass = {};
// WebSocket
let ws = null;
// message handler
onmessage =async e=>
{
  let ops = e.data; // [[]]
  for (const op of ops)
  {
    if (!Array.isArray(op)) continue;
    let cl = op[0];
    if (cl in ass) await ass[cl](op);
    else postMessage(['invalid op',cl]);
  }
};
// 
ass.boot =async a=>
{
  return new Promise(resolve=>
  {
    const abort = setTimeout(()=>
    {
      postMessage(['aborted']);
      resolve(false)
    },10000);

    ws = new WebSocket(a[1]);
    ws.onclose =e=>{postMessage(['close',e.data])};
    ws.onerror =e=>{postMessage(['erro',e.data])};
    ws.onopen =e=>{clearTimeout(abort);resolve(true)};
    ws.onmessage =e=>{postMessage(['mess',e.data])};
  })
};

ass.REQ =a=>
{
  if (ws?.readyState === 1) ws.send(JSON.stringify(a));
  else console.log('ass.REQ: no ws')
};

// const mess =age=>
// {
//   let a;
//   try {a = JSON.parse(age.data)}
//   catch(er) {console.error(er)}

//   if (!a || !Array.isArray(a)) 
//   {
//     console.log(e.data)
//     return;
//   }
//   messages.push(a);
//   switch(a[0])
//   {
//     case 'PRISON': break;
//     case 'AUTH': break;
//     case 'NOTICE': break;
//     case 'EVENT': break;
//     case 'EOSE': postMessage(messages); break;
//   }
// };


// force close relay connection
ass.force_close =async ws=>
{
  if (!ws) return
  let a = ['fc',ws.url];
  await ws.close();
  ws = null;
  postMessage(a)
};