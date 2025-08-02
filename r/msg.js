// authenticate to relay with main keys
aa.r.auth =async a=>
{
  console.log(a);
  let [s,event,relay] = a;
  event = aa.e.normalise(event);
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  let signed = await aa.u.sign(event);
  if (signed) aa.r.manager.postMessage(['auth',{relays:[relay],request:['AUTH',signed]}]);
};


aa.r.event =async a=>
{
  let [s,dat] = a;
  // console.log(a);
  for (const sub of dat.subs)
  {
    if (aa.r.on_sub.has(sub))
    {
      aa.r.on_sub.get(sub)(dat);
      return
    }
  }
};


aa.r.eose =async data=>
{
  let [sub_id,url] = data.slice(1);
  if (aa.r.on_eose.has(sub_id))
  {
    setTimeout(()=>{aa.r.on_eose.get(sub_id)(url)},100);
    return
  }
  else aa.log_details('r.eose','["EOSE","…"]',sub_id,url)
};


// manager received from a relay
// ["OK",<event_id>,<true|false>,<message>]
aa.r.ok =async data=>
{
  const [id,is_ok,reason,url] = data.slice(1);
  let text = `${id} ${is_ok} ${reason}`;
  aa.log_details('r.ok','["OK","…"]',url,text)
  
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
  let l = aa.e.printed.get(id);
  if (l)
  {
    if (classes.some(i=> l.classList.contains(i))) 
    {
      l.classList.remove('not_sent','draft');
      l.querySelector('.by > .actions')?.replaceWith(aa.e.note_actions(dat))
    }
    let seen = l.dataset.seen ? aa.fx.splitr(l.dataset.seen.trim()) : [];
    if (aa.fx.a_add(seen,[url])) l.dataset.seen = seen.join(' ');
  }
};


// OK false
aa.r.ok_not_ok =async a=>
{
  const [s,id,is_ok,reason,origin] = a;
  let [type,txt] = reason.split(':');
  switch (type)
  {
    case 'blocked':
    case 'auth-required':
      aa.r.force_close([origin]);
      break;
    // case 'pow':
    // case 'duplicate':
    // case 'rate-limited':
    // case 'invalid':
    // case 'restricted':
    // case 'error':
    // default:
  }
};


// update relay state in ui
aa.r.state =([s,relay])=>
{
  let url = relay.url;
  aa.r.active[url] = relay;
  let l = aa.el.get(url);
  if (!l)
  {
    console.log('aa.r.state: no element found',relay);
    return
  }
  fastdom.mutate(()=>
  {
    l.dataset.state = relay.state;
    l.dataset.subs = aa.r.subs_open(relay.subs);
    
    // if (relay.failures) 
    //   l.dataset.ratio = 
    //     relay.failures.length - relay.successes.length;
    // else console.trace(relay);
      
  })
};