// nutzap butt clk event
aa.clk.nzap =e=>
{
  console.log(e);
  const note = e.target.closest('[data-pubkey]');
  const pubkey = note.dataset.pubkey;
 
  let t = `${localStorage.ns} mk 9321 ${localStorage.zap}`;
  t = `${t} ${pubkey} "${localStorage.zap_memo}"`;
  if (note.dataset.id) t += ` ${note.dataset.id}`;
  aa.bus.emit('cli:set',t);
};


// nutzap butt clk event
// aa.clk.nutzap_pub =e=>
// {
//   const note = e.target.closest('[data-pubkey]');
//   const pub = note.dataset.pubkey;
//   let t = `${localStorage.ns} mk 9321 ${localStorage.zap}`;
//   t = `${t} ${pub} "${localStorage.zap_memo}"`;
//   aa.cli.v(t);
// };