// click stuff


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


// toggle class on either a provided element
// or event target

aa.clk.expanded =e=>
{
  e.stopPropagation();
  let l = document.getElementById(e.target.dataset.controls) || e.target;
  if (!l) return;
  
  let block;
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
  aa.fx.scroll(l,
  {
    behavior:'smooth',
    block:block
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
  else relays.push(...aa.r.in_set(aa.r.o.r));
  aa.fx.dataset_add(note,'nope',relays);
  aa.r.demand(request,relays,{eose:'done'});
  setTimeout(()=>{aa.fx.scroll(document.getElementById(note.id))},200);
};


// mark replies as read

aa.clk.mark_read =e=>
{
  e.stopPropagation();
  const replies = e.target.closest('.replies');
  const mom = e.target.closest('.note');
  let classes = ['haz_new_reply','haz_new','is_new']
  mom.classList.remove(...classes);
  const new_stuff = replies.querySelectorAll('.'+classes.join(',.')); //'.haz_new_reply,.haz_new,.is_new'        
  if (new_stuff.length)
  {
    e.preventDefault();
    for (const l of new_stuff) 
    {
      l.classList.remove(...classes);
      sessionStorage[l.dataset.id] = 'is_read';
    }
    if (replies.classList.contains('expanded')) 
    {
      replies.classList.remove('expanded');
      sessionStorage[replies.id] = '';
    }
  }
  else 
  {
    if (replies.classList.contains('expanded')) 
    {
      replies.classList.remove('expanded');
      sessionStorage[replies.id] = '';
    }
    else 
    {
      replies.classList.add('expanded');
      sessionStorage[replies.id] = 'expanded';
    }
  }

  aa.fx.scroll(replies,
  {
    behavior:'smooth',
    block:replies.classList.contains('expanded') ? 'start':'center'
  });
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


// sign event

aa.clk.sign =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    aa.fx.sign(dat.event).then(signed=>
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

aa.clk.yolo =e=>
{
  let dat = aa.db.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    aa.fx.sign(dat.event).then(signed=>
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


aa.clk.tiny =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
};

aa.clk.req =e=>
{
  const note = e.target.closest('.note');
  const filter = '{"#e":["'+note?.dataset.id+'"],"kinds":[1],"limit":100}';
  aa.cli.v(localStorage.ns+' '+aa.q.def.id+' req read '+filter);
};

aa.clk.zap =e=>
{
  aa.log('soon™')
};

aa.clk.parse =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.db.e[xid].event;
  aa.parse.context(note,event,true);
};



