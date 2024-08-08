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
  delete aa.db.e[xid];
  if (aa.viewing === note.id) aa.state.clear()
  note.remove();
  aa.fx.data_count(document.getElementById('butt_e'),'.note');
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
  const xid = note.dataset.id;
  if (aa.viewing === note.id) aa.state.clear()
  note.remove();
  aa.fx.data_count(document.getElementById('butt_e'),'.note');
  
  aa.cli.v(aa.db.e[xid].event.content);
  delete aa.db.e[xid];
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
  else relays.push(...aa.r.in_set(aa.r.o.r));
  aa.fx.dataset_add(note,'nope',relays);
  aa.r.demand(request,relays,{eose:'done'});
  setTimeout(()=>{aa.fx.scroll(document.getElementById(note.id))},200);
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
  if (dat) aa.r.broadcast(dat.event);
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
  if (dat)
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


aa.clk.time =e=> 
{
  // let timestamp = parseInt(e.target.textContent);
  // let date = aa.t.to_date(timestamp);
  e.target.dataset.elapsed = aa.t.elapsed(aa.t.to_date(parseInt(e.target.textContent)));
};

// make note tiny
aa.clk.tiny =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
  aa.fx.scroll(note,
  {
    behavior:'smooth',
    block:note.classList.contains('tiny') ? 'start':'center'
  });
};


// sign and broadcast event
aa.clk.yolo =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    aa.u.sign(dat.event).then(signed=>
    {
      if (signed)
      {
        dat.event = signed;
        dat.clas = aa.fx.a_rm(dat.clas,['draft']);
        aa.fx.a_add(dat.clas,['not_sent']);
        aa.r.broadcast(dat.event);
      }      
    })
  }
  else aa.log('nothing to sign')
};


// zap note
aa.clk.zap =e=>
{
  aa.log('soon™')
};