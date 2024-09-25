importScripts('/dep/nostr-tools.js?v=2.7.2');

const count_lz =x=>
{
  let c = 0;
  for (let i = 0; i < x.length; i++) 
  {
    const n = parseInt(x[i],16);
    if (n === 0) c += 4;
    else 
    {
      c += Math.clz32(n) - 28;
      break
    }
  }
  return c
};

const mine_note =async(event,difficulty)=>
{ 
  if (!difficulty) difficulty = 1;
  let c = 0;
  for(let i=0; difficulty >= c; i++)
  {
    event.tags = event.tags.filter(tag=>tag[0] !== 'nonce');
    event.tags.push(['nonce',''+i,difficulty+'']);
    event.created_at = Math.floor(Date.now() / 1000);
    event.id = NostrTools.getEventHash(event);
    c = count_lz(event.id);
  }
  postMessage([event,c]);
};

onmessage =e=>
{
  console.log(e.data);
  let {event,difficulty} = e.data;
  console.log(event,difficulty);
  setTimeout(()=>{ console.log(event,difficulty);mine_note(event,difficulty) },0)
};