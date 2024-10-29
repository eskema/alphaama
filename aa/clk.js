/*

alphaama
click stuff

*/


// general nostr links
aa.clk.a =e=>
{
  e.preventDefault();
  let dis = e.target.getAttribute('href');
  if (dis==='/') dis = '';
  aa.state.view(dis);
};


// cancel event draft
aa.clk.cancel =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  if (aa.temp.mining && aa.temp.mining[xid]) aa.fx.pow_a(xid);
  aa.e.note_rm(note);
};


// adds a clicked class to show interaction
aa.clk.clkd =l=>
{
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};


// edit event
aa.clk.edit =e=>
{
  const note = e.target.closest('.note');
  // const xid = note.dataset.id;
  aa.cli.v(aa.db.e[note.dataset.id].event.content);
  aa.e.note_rm(note);
  // if (aa.viewing === note.id) aa.state.clear()
  // note.remove();
  // aa.fx.data_count(document.getElementById('butt_e'),'.note');
  // delete aa.db.e[xid];
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
  aa.u.event_draft({event:dis,clas:['draft','encrypted'],seen:[],subs:[]});
};

// expand 
aa.clk.expand =e=>
{
  if (e.hasOwnProperty('stopPropagation')) e.stopPropagation();
  let l = document.getElementById(e.target.dataset.controls) || e.target;
  if (!l) return;
  
  let block;
  requestAnimationFrame(e=>
  {
    if (l.classList.contains('expanded'))
    {
      l.classList.remove('expanded');
      sessionStorage[l.id] = '';
      block = 'center';
    }
    else
    {
      l.classList.add('expanded');
      sessionStorage[l.id] = 'expanded';
      block = 'start';
    }
    aa.fx.scroll(l,{behavior:'smooth',block:block});
  });
};


// fetch note
aa.clk.fetch =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const request = ['REQ','ids',{ids:[xid]}];
  let relays = [];
  if (note.dataset.r?.length)
  {
    let r = note.dataset.r?.split(' ');
    if (r.length) relays.push(...r);
  }
  else relays.push(...aa.fx.in_set(aa.r.o.ls,aa.r.o.r));
  aa.fx.dataset_add(note,'nope',relays);
  aa.r.demand(request,relays,{eose:'done'});
  setTimeout(()=>{aa.fx.scroll(document.getElementById(note.id))},200);
};


// request notes from profile
aa.clk.p_req =e=>
{
  const profile = e.target.closest('.profile');
  const xid = profile?.dataset.xpub;
  const p = aa.db.p[xid];
  const filter = `{"authors":["${p.xpub}"],"kinds":[1],"limit":100}`;
  let relay = p.relay;
  if (!relay && p.relays.length) 
  relay = p.relays.filter(r=>r.sets.includes('write'))[0];
  if (!relay) relay = 'read';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req ${relay} ${filter}`);
};


// toggle parsed content
aa.clk.parse =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.db.e[xid].event;
  aa.parse.context(note,event,true);
};


// post event
aa.clk.post =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat) 
  {
    let relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r).filter(r=>!dat.seen.includes(r));
    aa.r.broadcast(dat.event,relays);
  }
};


// pow event
aa.clk.pow =e=>
{
  let id = e.target.closest('.note').dataset.id;
  aa.cli.v(`${localStorage.ns} e pow ${id} ${localStorage.pow}`);
};


// react to event
aa.clk.react =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  // console.log('react',xid);
  aa.cli.v(localStorage.ns+' e react '+xid+' '+localStorage.reaction);
};


// request replies to note
aa.clk.req =e=>
{
  const note = e.target.closest('.note');
  const filter = '{"#e":["'+note?.dataset.id+'"],"kinds":[1],"limit":100}';
  aa.cli.v(localStorage.ns+' '+aa.q.def.id+' req read '+filter);
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


// update elapsed time
aa.clk.time =e=> 
{
  if (!e.target) return;
  const timestamp = parseInt(e.target.textContent);
  const date = aa.t.to_date(timestamp);
  e.target.dataset.elapsed = aa.t.elapsed(date);
};


// make note tiny
aa.clk.tiny =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
  const is_tiny = note.classList.contains('tiny');
  if (is_tiny) sessionStorage[note.dataset.id] = 'tiny';
  else sessionStorage[note.dataset.id] = '';
  aa.fx.scroll(note,{behavior:'smooth',block:is_tiny?'start':'center'});
};


// sign and broadcast event
aa.clk.yolo =async e=>
{
  let xid = await aa.u.mine_note(e.target.closest('.note').dataset.id);
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
      let pubs = aa.p.authors_from_tags(dat.event.tags);
      for (const pub of pubs)
      {
        let p = aa.db.p[pub];
        let i = 0;
        for (const r in p.relays)
        {
          i++;
          let rr = [];
          if (p.relays[r].sets.includes('read')) rr.push(r);
          aa.fx.a_add(relays,rr);
          if (i>3) break;
        }
        // let read_from = Object.entries(p.relays)
        // .filter(r=>r[1].sets.includes('read'));
      }
      // let outbox = aa.u.outbox(pubs,'read');
      // for (const r of outbox) relays.push(r[0]);
      relays = new Set(relays);
      // console.log(dat.event,relays);
      aa.r.broadcast(dat.event,relays);
    }
  })
};


// zap note
aa.clk.zap =e=>
{
  aa.log('soon™')
};