
// cancel event draft
aa.clk.cancel =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  if (aa.temp.mining && aa.temp.mining[xid]) aa.fx.pow_abort(xid);
  aa.e.note_rm(note);
};


// edit event
aa.clk.edit =e=>
{
  const note = e.target.closest('.note');
  let dat = aa.db.e[note.dataset.id] || aa.cli.dat;
  aa.e.note_rm(note);
  aa.cli.v(dat.event.content);
};


// encrypt note
aa.clk.encrypt =async e=>
{
  const note = e.target.closest('.note');
  const id = note.dataset.id;
  let dat = aa.db.e[id];
  let peer = dat.event.tags.find(t=>t[0]==='p')[1];
  let encrypted = await window.nostr.nip04.encrypt(peer,dat.event.content);
  let dis = Object.assign({},dat.event);
  dis.content = encrypted;
  delete dis.id;
  if ('sig' in dis) delete dis.sig;
  note.remove();
  delete aa.db.e[id];
  console.log(dis);
  aa.e.draft(aa.mk.dat({event:dis,clas:['encrypted']}));
};


// post event
aa.clk.post =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (!dat) 
  {
    console.log('event not found in local db');
    return
  }

  const event = dat.event;
  let relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r).filter(r=>!dat.seen.includes(r));
  aa.r.send_event({event,relays});
};


// pow event
aa.clk.pow =e=>
{
  let id = e.target.closest('.note').dataset.id;
  aa.cli.v(`${localStorage.ns} fx pow ${id} ${localStorage.pow}`);
};


// react to event
aa.clk.react =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  aa.cli.v(`${localStorage.ns} mk 7 ${xid} ${localStorage.reaction}`);
};


// sign event
aa.clk.sign =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat && !dat.event.sig)
  {
    aa.u.sign(dat.event).then(signed=>
    {
      if (signed)
      {
        dat.event = signed;
        dat.clas = aa.fx.a_rm(dat.clas,['draft']);
        aa.fx.a_add(dat.clas,['not_sent']);
        aa.db.upd_e(dat);
        aa.e.print(dat);
      }
    })
  }
  else aa.log('nothing to sign')
};


// sign and broadcast event
aa.clk.yolo =async e=>
{
  let xid = await aa.u.pow_note(e.target.closest('.note').dataset.id);
  if (!xid)
  {
    aa.log('nothing to sign');
    return
  }

  let dat = aa.db.e[xid];

  aa.u.sign(dat.event).then(signed=>
  {
    if (signed)
    {
      dat.event = signed;
      dat.clas = aa.fx.a_rm(dat.clas,['draft']);
      aa.fx.a_add(dat.clas,['not_sent']);
      let relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.w);
      relays = aa.r.tagged(dat.event,relays);
      aa.r.send_event({event:dat.event,relays}); //aa.r.broadcast(dat.event,relays);
    }
  })
};


// add relays from p tagged users 10002 'read'
aa.r.tagged =(event,relays=[])=>
{
  let pubs = event.tags.filter(aa.is.tag_p).map(i=>i[1]);
  for (const x of pubs)
  {
    let read_relays = aa.fx.in_set(aa.db.p[x].relays,'read');
    let ab = aa.fx.a_ab(relays,read_relays);
    if (!ab.inc.length < 3) relays.push(...ab.exc.slice(0,3 - ab.inc.length))
  }
  return new Set(relays);
};