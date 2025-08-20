importScripts('/dep/nostr-tools.js');

// const count_lz =x=>
// {
//   let c = 0;
//   for (let i = 0; i < x.length; i++) 
//   {
//     const n = parseInt(x[i],16);
//     if (n === 0) c += 4;
//     else 
//     {
//       c += Math.clz32(n) - 28;
//       break
//     }
//   }
//   return c
// };

// const mine =async(event,difficulty)=>
// {
//   let event = NostrTools.nip13.minPow(event,difficulty)
//   // if (!difficulty) difficulty = 1;
//   // let c = 0;
//   // for(let i=0; difficulty >= c; i++)
//   // {
//   //   event.tags = event.tags.filter(tag=>tag[0] !== 'nonce');
//   //   event.tags.push(['nonce',''+i,difficulty+'']);
//   //   event.created_at = Math.floor(Date.now() / 1000);
//   //   event.id = NostrTools.getEventHash(event);
//   //   c = count_lz(event.id);
//   // }
//   postMessage([event,c]);
// };

onmessage =async e=>
{
  let {event,difficulty} = e.data;
  let mined = NostrTools.nip13.minePow(event,difficulty);
  postMessage(mined)
};