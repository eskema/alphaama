// broadcast note action
aa.clk.bro =e=>
{
  const note = e.target.closest('.note');
  aa.cli.v(`${localStorage.ns} e bro ${note.dataset.id}`);
};


// cancel event draft
aa.clk.cancel =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  if (aa.temp.mining && aa.temp.mining[xid]) aa.fx.pow_abort(xid);
  aa.e.note_rm(note);
};


// edit event
aa.clk.edit =async e=>
{
  const note = e.target.closest('.note');
  let dat = await aa.e.get(note.dataset.id);
  if (!dat) dat = aa.temp.dat;
  aa.e.note_rm(note);
  aa.cli.v(dat.event.content);
};


// encrypt note
aa.clk.encrypt =async e=>
{
  const note = e.target.closest('.note');
  const id = note.dataset.id;
  let dat = await aa.e.get(id);
  let peer = aa.fx.tag_value(dat.event.tags,'p');
  let encrypted = await window.nostr.nip04.encrypt(peer,dat.event.content);
  let event = {...dat.event};
  event.content = encrypted;
  delete event.id;
  if ('sig' in event) delete event.sig;
  aa.e.note_rm(note);
  // console.log(event);
  aa.e.draft(aa.mk.dat({event,clas:['encrypted']}));
};


// fetch note
aa.clk.fetch =e=>
{
  const note = e.target.closest('.note');

  let filter = '{';
  const id = note.dataset.id;
  if (id) filter += `"ids":["${id}"],`;
  else
  {
    const [kind,pubkey,ds] = note.dataset.id_a.split(':');
    filter += `"authors":[${pubkey}],"kinds":[${kind}],"#d":[${ds}],`;
  }
  filter += '"eose":"close"}';
  
  let relset = 'read ';
  if (note.dataset.r)
  {
    let r = note.dataset.r.trim().split(' ');
    if (r.length) 
    {
      let url = aa.fx.url(r[0])?.href;
      if (url) relset = url+' ';
    }
  }
  aa.cli.v(localStorage.ns+' '+aa.q.def.id+' req '+relset+filter);
};


// mark replies as read
aa.clk.mark_read =e=>
{
  e.stopPropagation();
  const classes = ['haz_new_reply','haz_new','is_new'];
  const replies = e.target.closest('.replies');
  const note = e.target.closest('.note');
  const root = e.target.closest('.root');
  const rid = note.dataset.id+'_replies';
  const new_stuff = replies.querySelectorAll('.'+classes.join(',.'));
  note.classList.remove(...classes);
  
  if (new_stuff.length)
  {
    e.preventDefault();
    for (const l of new_stuff)
    {
      sessionStorage[l.dataset.id] = 'is_read';
      l.classList.remove(...classes);
    }
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[rid] = '';
      replies.classList.remove('expanded');
    }
  }
  else 
  {
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[rid] = '';
      replies.classList.remove('expanded');
    }
    else 
    {
      sessionStorage[rid] = 'expanded';
      replies.classList.add('expanded');
    }
  }
  if (!aa.view.active)
  {
    let top = root.offsetTop + (3 * parseFloat(getComputedStyle(aa.l).fontSize));
    if (top < aa.l.scrollTop) aa.l.scrollTo(0,top);
  }
};


// note actions
aa.clk.na =e=>
{
  let l = e.target.closest('.actions');
  if (l.classList.contains('empty'))
  {
    for (const s of aa.e.butts.na) l.append(' ',aa.mk.butt_clk(s));
    l.classList.remove('empty');
  }
  l.classList.toggle('expanded');
};


aa.clk.quote =async e=>
{
  const note = e.target.closest('.note');
  let id = note.dataset.id;
  let dat = await aa.e.get(id);
  let data = 
  {
    id:dat.event.id,
    author:dat.event.pubkey,
    relays: dat.seen.slice(0,3)
  };
  let encoded;
  if (dat.id_a) 
  {
    data.identifier = aa.fx.tag_value(dat.event.tags,'d');
    encoded = aa.fx.encode('naddr',data);
  }
  else encoded = aa.fx.encode('nevent',data);

  let result = aa.cli.t.value.length ? `${aa.cli.t.value} nostr:${encoded}` 
  : `nostr:${encoded}`;
  aa.cli.v(result);
};


// post event
aa.clk.post =async e=>
{
  let dat = await aa.e.get(e.target.closest('.note').dataset.id);
  if (!dat) 
  {
    console.log('event not found in local db');
    return
  }
  // dat.clas = aa.fx.a_rm(dat.clas,['draft']);
  // aa.fx.a_add(dat.clas,['not_sent']);
  const event = dat.event;
  let relays = aa.r.r.filter(r=>!dat.seen.includes(r));
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


// toggle parsed content
aa.clk.render =async e=>
{
  let note = e.target.closest('[data-id]');
  let dat = aa.em.get(note.dataset.id);
  let content = note.querySelector('.content');
  if (content.classList.contains('e_render'))
  {
    fastdom.mutate(()=>
    {
      content.classList.remove('e_render');
      let content = l.querySelector('.content');
      content.textContent = dat.event.content;
    })
  }
  else 
  {
    let rendered = await aa.e.render(dat,{trust:localStorage.score});
    fastdom.mutate(()=>{content.replaceWith(rendered)});
  }
  
  // const dat = aa.em.get(e.target.closest('.note').dataset.id);
  // aa.e.render(dat,{trust:localStorage.score});
};


// request replies to note
aa.clk.req =e=>
{
  const note = e.target.closest('.note');
  const filter = '{"#e":["'+note?.dataset.id+'"],"kinds":[1],"limit":100}';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req read ${filter}`);
};


// sign event
aa.clk.sign =async e=>
{
  let dat = await aa.e.get(e.target.closest('.note').dataset.id);
  if (!dat || dat?.event?.sig)
  {
    aa.log('nothing to sign')
    return
  }

  let signed = await aa.e.sign(dat.event)
  if (!signed) 
  {
    aa.log('nothing to sign')
    return
  }

  dat.event = signed;
  dat.clas = aa.fx.a_rm(dat.clas,['draft']);
  aa.fx.a_add(dat.clas,['not_sent']);
  aa.db.upd_e(dat);
  aa.e.print(dat);
};


// toggle tiny note 
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
  let xid = await aa.fx.pow_note(e.target.closest('.note').dataset.id);
  if (!xid)
  {
    aa.log('nothing to sign');
    return
  }

  let dat = await aa.e.get(xid);

  aa.e.sign(dat.event).then(signed=>
  {
    if (signed)
    {
      dat.event = signed;
      dat.clas = aa.fx.a_rm(dat.clas,['draft']);
      aa.fx.a_add(dat.clas,['not_sent']);
      let relays = aa.r.w;
      relays = aa.r.tagged(dat.event,relays);
      aa.r.send_event({event:dat.event,relays}); //aa.r.broadcast(dat.event,relays);
    }
  })
};