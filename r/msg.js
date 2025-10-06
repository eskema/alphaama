// authenticate to relay with main keys
aa.r.auth =async data=>
{
  // console.log(data);
  let [type,event,relay] = data;
  event = aa.e.normalise(event);
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  let signed = await aa.e.sign(event);
  
  data = {relays:[relay],request:['AUTH',signed]};
  if (signed) aa.r.manager.postMessage(['auth',data]);
};


aa.r.event =async data=>
{
  let [type,dat] = data;
  // console.log(a);
  for (const sub of dat?.subs)
  {
    if (aa.r.on_sub.has(sub))
    {
      aa.r.on_sub.get(sub)(dat);
      return
    }
  }
};


aa.r.notice =async data=>
{
  let url = data.pop();
  // let [type,text,url] = data;
  // console.log('notice',data);
  aa.log_key(`["NOTICE","${url}"]`,data.slice(1));
};


aa.r.eose =async data=>
{
  let [sub_id,url] = data.slice(1);
  if (aa.r.on_eose.has(sub_id))
  {
    setTimeout(()=>{aa.r.on_eose.get(sub_id)(url)},100);
    return
  }

  let l_id = `["REQ","${sub_id}"]`;
  let l = aa.el.get(l_id);
  if (!l)
  {
    aa.log_details('r.eose','["EOSE","…"]',sub_id,url);
    return
  }

  let l_r_id = `["EOSE","${sub_id}"]`;
  let l_r = aa.el.get(l_r_id);
  if (!l_r)
  {
    l_r = aa.mk.details(l_r_id,0,0,'base');
    aa.el.set(l_r_id,l_r);
    fastdom.mutate(()=>{l.append(l_r)});
  }
  else aa.fx.move(l_r);

  fastdom.mutate(()=>
  {
    l_r.append(aa.mk.l('p',{con:url}));
    l_r.classList.add('has_new');
  });
  
};


// manager received from a relay
// ["OK",<event_id>,<true|false>,<message>]
aa.r.ok =async data=>
{
  const [type,id,is_ok,reason,url] = data;
  let key = `["${type}","${url}"]`;
  let dat = await aa.e.get(id);
  let kind = dat ? dat.event.kind : '?'
  let text = `${kind} ${id} ${is_ok} ${reason}`;
  aa.log_key(key,text)
  
  if (is_ok) aa.r.ok_ok(id,url);
  else if (reason) aa.r.ok_not_ok(data);
};


// OK true
aa.r.ok_ok =async(id,url)=>
{
  // const [s,id,is_ok,reason,url] = a;
  let dat = await aa.e.get(id);
  if (!dat) return;

  const classes = ['not_sent','draft'];
  dat.clas = aa.fx.a_rm(dat.clas,classes);
  aa.fx.a_add(dat.seen,[url]);
  // aa.db.upd_e(dat);
  let note = aa.e.printed.get(id);
  if (note)
  {
    fastdom.mutate(()=>
    {

      if (classes.some(i=> note.classList.contains(i))) 
      {
        note.classList.remove('not_sent','draft');
        note.querySelector('.by > .actions')
          ?.replaceWith(aa.e.note_actions(dat))
      }

      let seen = note.dataset.seen 
        ? aa.fx.splitr(note.dataset.seen.trim()) 
        : [];
        
      if (aa.fx.a_add(seen,[url])) 
        note.dataset.seen = seen.join(' ');

    })
  }
};


// OK false
aa.r.ok_not_ok =async data=>
{
  const [s,id,is_ok,reason,origin] = data;
  let [type,txt] = reason.split(':');
  switch (type)
  {
    case 'blocked':
    case 'auth-required':
    case 'restricted':
      aa.r.force_close([origin]);
  }
};


// update relay state in ui
aa.r.state =async data=>
{
  let [s,relay] = data;
  let url = relay.url;
  aa.r.active[url] = relay;
  let element = aa.el.get(url);
  if (!element)
  {
    console.log('aa.r.state: no element found',relay);
    return
  }
  fastdom.mutate(()=>
  {
    element.dataset.state = relay.state;
    element.dataset.subs = aa.r.subs_open(relay.subs);
  })
};