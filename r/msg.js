// authenticate to relay with main keys
aa.r.auth =async data=>
{
  // console.log(data);
  let [type,event,relay] = data;
  event = aa.fx.normalise_event(event);
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  let signed = await aa.bus.request('e:sign', event);
  
  data = {relays:[relay],request:['AUTH',signed]};
  if (signed) aa.r.manager.postMessage(['auth',data]);
};


aa.r.event =async data=>
{
  let [type,dat] = data;
  // console.log(data);
  for (const sub of dat?.subs)
  {
    aa.bus.emit('q:stamp', sub, dat.event.created_at);
    if (aa.r.on_sub.has(sub))
    {
      aa.r.on_sub.get(sub)(dat);
    }
  }
};


// batch event handler - processes multiple events at once
aa.r.events =async data=>
{
  let [type,events,url] = data;
  for (const dat of events)
  {
    await aa.r.event(['event', dat]);
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
  else sift.move(l_r);

  fastdom.mutate(()=>
  {
    l_r.append(make('p',{con:url}));
    l_r.classList.add('has_new');
  });
  
};


// manager received from a relay
// ["OK",<event_id>,<true|false>,<message>]
aa.r.ok =async data=>
{
  const [type,id,is_ok,reason,url] = data;
  let key = `["${type}","${url}"]`;
  let dat = await aa.bus.request('e:get', id);
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
  let dat = await aa.bus.request('e:get', id);
  if (!dat) return;

  const classes = ['not_sent','draft'];
  dat.clas = aa.fx.a_rm(dat.clas,classes);
  aa.fx.a_add(dat.seen,[url]);
  // aa.db.upd_e(dat);
  let note = aa.bus.request('e:printed_get', id);
  if (note)
  {
    fastdom.mutate(()=>
    {

      if (classes.some(i=> note.classList.contains(i))) 
      {
        note.classList.remove('not_sent','draft');
        note.querySelector('.by > .actions')
          ?.replaceWith(aa.bus.request('e:note_actions', dat))
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
  const score = aa.r.score(url);
  fastdom.mutate(()=>
  {
    element.dataset.state = relay.state;
    element.dataset.subs = aa.r.subs_open(relay.subs);
    element.dataset.score = Math.round(score);
    element.title = `Reliability: ${Math.round(score)}/100`;
  })
};


// update relay reliability stats in persistent storage
aa.r.update_stats =async data=>
{
  let [type,url,stat_type] = data;
  if (!aa.r.o.ls[url]) return;

  // don't penalize relays when we have no connectivity
  if (!aa.online && stat_type !== 'success') return;

  switch(stat_type)
  {
    case 'terminated':
      aa.r.o.ls[url].terminated_count = (aa.r.o.ls[url].terminated_count || 0) + 1;
      aa.r.o.ls[url].last_terminated = Math.floor(Date.now() / 1000);
      break;
    case 'error':
      aa.r.o.ls[url].error_count = (aa.r.o.ls[url].error_count || 0) + 1;
      break;
    case 'success':
      aa.r.o.ls[url].success_count = (aa.r.o.ls[url].success_count || 0) + 1;
      break;
  }

  // Save to DB
  aa.mod.save_to(aa.r);
};


// manager detected mass relay failures — we're offline
aa.r.offline =()=>
{
  aa.online = false;
  aa.mk.status(true);
  for (const fn of aa.on_offline) fn();
};