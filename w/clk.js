// nutzap butt clk event
aa.clk.nzap =e=>
{
  const note = e.target.closest('[data-pubkey]');
  const pubkey = note?.dataset.pubkey;
  if (!pubkey) return;
  let t = `k 9321 ${localStorage.zap || 21} ${pubkey} "${localStorage.zap_memo || '<3'}"`;
  if (note.dataset.id) t += ` ${note.dataset.id}`;
  aa.bus.emit('cli:stage',t);
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