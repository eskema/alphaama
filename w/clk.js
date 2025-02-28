


// nutzap butt clk event
aa.clk.nzap =e=>
{
  const note = e.target.closest('.note');
  const pub = note.dataset.pubkey;
  const xid = note.dataset.id;
  let t = `${localStorage.ns} mk 9321 ${localStorage.zap}`;
  t = `${t} ${pub} "${localStorage.zap_memo}" ${xid}`;
  aa.cli.v(t);
};