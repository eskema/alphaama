if (!aa) aa = {};

/*

alphaama
mod    r
relays

*/


aa.r = 
{
  active:{},
  def:{id:'r',ls:{},r:'read',w:'write'},
  // message_type:{},
  // old_id:'rel',
};


// add relays
aa.r.add =s=>
{
  let [valid,invalid,off] = aa.mod.servers_add(aa.r,s,'relays');
  for (const url of off) aa.r.force_close([url]);
  aa.r.w.postMessage(['relays',aa.r.o.ls]);
};


// add relays from object
aa.r.add_from_o =relays=>
{
  //o = {'wss://url.com':{sets:['read','write'}}
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) aa.r.add(a.join(','));
};


// authenticate to relay with main keys
aa.r.auth =async([auth,event,relay])=> 
{
  event.id = aa.fx.hash(event);
  signed = await aa.u.sign(event);
  if (signed) aa.r.w.postMessage(['q',{relays:[relay],request:['AUTH',event]}]);
};


// broadcast event from id to relays
// s = 'id relay relay relay'
aa.r.bro =async(s='')=>
{
  let [id,...relays] = s.split(' ');
  let dat = await aa.db.e[id];
  if (dat) aa.r.send({event:dat.event,relays}); //aa.r.broadcast(dat.event,relays);
  else aa.log('r bro: event not found')
};


// post event to relays
aa.r.broadcast =(event,relays=[],options={})=>
{
  aa.r.send({relays,event,options});
};


// given a list of pubkeys
// return list of relays in common by the pubkeys
aa.r.common =(a=[],sets=[])=>
{
  let common = {};
  let offed = aa.fx.in_set(aa.r.o.ls,'off',0);
  for (const x of a)
  {
    let has_set;
    let relays = aa.db.p[x]?.relays;
    if (relays) 
    {
      relays = aa.fx.in_sets_all(relays,sets);
      if (relays.length) has_set = true;
    }
    else relays = [];

    for (const r of relays)
    {
      if (offed.includes(r)) continue;
      if (!common[r]) common[r] = [];
      if (!common[r].includes(x)) common[r].push(x)
    }

    if (!has_set)
    {
      for (const r of aa.fx.in_set(aa.r.o.ls,aa.r.o.r))
      {
        if (!common[r]) common[r] = [];
        aa.fx.a_add(common[r],[x]);
      }
    }
  }
  return common
};


// close relay connection
aa.r.close =id=>
{
  aa.r.w.postMessage(['close',id]);
};


// 
aa.r.dat =([s,dat])=>
{
  let event = dat.event;
  if (aa.miss.e[event.id]) 
  {
    delete aa.miss.e[event.id];
    dat.clas.push('miss');
  }
  else if (aa.fx.kind_type(event.kind) === 'parameterized')
  {
    let id_a = aa.fx.id_a({
      kind:event.kind,
      pubkey:event.pubkey,
      identifier:event.tags.find(t=>t[0]==='d')[1],
    }); //`${event.kind}:${event.pubkey}:${identifier}`;
    
    dat.id_a = id_a;
    if (aa.miss.a[id_a])
    {
      delete aa.miss.a[id_a];
      dat.clas.push('miss');
    }
  }
  aa.e.to_printer(dat);
  aa.db.upd_e(dat);
};


// delete relay
aa.r.del =s=>
{
  const a = s.split(',');
  if (!a.length) return;
  
  for (const i of a)
  {
    const url = aa.is.url(i.trim())?.href;
    if (url && aa.r.o.ls[url])
    {
      //todo
      if (aa.r.active[url])
      {
        aa.r.force_close([url]);
        delete aa.r.active[url];
      }
      delete aa.r.o.ls[url];
      document.getElementById(aa.r.def.id+'_'+aa.fx.an(url))?.remove();
    }
  }
  aa.mod.save(aa.r);
};


// send REQ to relays
aa.r.demand =(request,relays,options)=>
{ 
  aa.r.req({relays,request,options}) 
};


// add relays from extension (nip7)
aa.r.ext =async()=>
{
  return new Promise(resolve=>
  {
    if (window.nostr) 
    {
      window.nostr.getRelays().then(r=>
      {
        aa.r.add_from_o(aa.r.from_o(r,['ext']));
        resolve(Object.keys(r));
      });
    }
    else 
    {
      aa.log('no extension found, make sure it is enabled.');
      resolve([]);
    }
  });
};



// relay notice
aa.r.found =async({url,request,options,reason})=>
{
  if (!url) return;
  let id = 'notice_'+aa.fx.an(url);
  if (!aa.el.has('relays_add')) aa.el.set('relays_add',new Map());
  if (!aa.temp.relays_add) aa.temp.relays_add = new Map();
  if (aa.temp.relays_add.get(id)) return;

  let cleanup =e=>
  {
    e.target.closest('.notice').remove();
    // e.target.classList.add('slap');
    // e.target.closest('.is_new')?.classList.remove('is_new');
  }
  
  let title = url;
  let cla = 'r_notice';
  let butts = [];
  let notice = {id,cla,title,butts};
  let dis = ['request',{relays:[url],request,options}];
  // console.log(dis);

  let hint ={con:'hint',cla:'yes',exe:e=>
    {
      aa.r.add(`${url} hint`);
      if (request) aa.r.w.postMessage(dis);
      // aa.r.c_on(url,opts);
      cleanup(e);
    }
  };

  let off ={con:'off',cla:'no',exe:e=>
    {
      aa.r.add(`${url} off`);
      cleanup(e);
    }
  };

  let other ={con:'other',cla:'maybe',exe:e=>
    {
      aa.r.add(url);
      if (request) aa.r.w.postMessage(dis);
      // aa.r.c_on(url,opts);
      aa.cli.add(title);
      cleanup(e);
    }
  };
  
  butts.push(off,other,hint);
  let l_notice = aa.mk.notice(notice,1);
  aa.temp.relays_add.set(id,l_notice);

  let l = aa.el.get('r.add');
  if (!l)
  {
    l = aa.mk.details('r add …',0,0,'base');
    aa.el.set('r.add',l);
  }
  
  l.append(l_notice);

  let log = l.parentElement;
  if (log) aa.logs.append(log);
  else aa.log(l);
};


// force close relay connection
aa.r.force_close =(a=[])=>
{
  for (const url of a) aa.r.w.postMessage(['terminate',{url}])
};


// returns a relays object from object (extension,k3)
aa.r.from_o =(o,sets=false)=>
{
  let relays = {};
  for (let url in o)
  {
    const href = aa.is.url(url)?.href;
    if (href)
    {
      relays[href] = {sets:[]};
      if (o[url].read === true) aa.fx.a_add(relays[href].sets,['read']);
      if (o[url].write === true) aa.fx.a_add(relays[href].sets,['write']);
      if (Array.isArray(sets)) aa.fx.a_add(relays[href].sets,sets);
    }
  }
  return relays
};


// list relays from sets
aa.r.ls =(s='')=>
{
  let relay_list = [];
  let a = s ? s.split(' ') : [];
  let ls = aa.r.o.ls;
  if (!a.length) relay_list.push(...Object.keys(ls));
  else relay_list.push(...aa.fx.in_sets(ls,a,false));
  let result = relay_list.join();
  aa.log(relay_list.length+' relays in '+a);
  return result 
};


// on load
aa.r.load =async()=>
{
  await aa.mk.scripts
  ([
    '/r/clk.js',
    '/r/mk.js',
    // '/r/wip.js',
  ]);

  const mod = aa.r;
  const id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['url'], 
      optional:['set...'],
      repeat:',',
      description:'add or replace relays',
      exe:mod.add
    },
    {
      action:[id,'del'],
      required:['url'],
      description:'remove relay',
      exe:mod.del
    },
    {
      action:[id,'setrm'],
      required:['url','set...'],
      description:'remove set from relays',
      exe:s=>aa.mod.setrm(mod,s)
    },
    {
      action:[id,'ext'],
      description:'get relays from extension',
      exe:mod.ext
    },
    {
      action:[id,'ls'],
      optional:['relset...'],
      description:'loads relay list from sets',
      exe:mod.ls
    },
    {
      action:[id,'resume'],
      description:'resume open queries',
      exe:mod.resume
    },
    {
      action:[id,'stuff'],
      description:'attempt to set some relays',
      exe:mod.stuff
    },
    {
      action:['e','bro'],
      required:['id'],
      optional:['<url || set>...'],
      description:'broadcast note to relays',
      exe:mod.bro
    },
  );
  aa.mod.load(mod)
  .then(aa.mod.mk)
  .then(e=>
  {
    aa.r.toggles();
    aa.r.w.postMessage(['relays',mod.o.ls]);
  });
};


// make r mod item
aa.r.mk =(k,v)=>
{
  // k = url
  // v = {sets:[]}

  const l = aa.mk.server(k,v);
  if (!l) return false;
  l.id = aa.r.def.id+'_'+aa.fx.an(k);
  l.dataset.state = 0;
  aa.mod.servers_butts(aa.r,l,v);
  // aa.r.state_upd(k);
  return l
};


// returns a list of relays given either a relay set or single url
aa.r.rel =(s='')=>
{
  s = s.trim();
  const a = [];
  let relay = aa.is.url(s)?.href;
  if (relay) a.push(relay);
  else a.push(...aa.fx.in_set(aa.r.o.ls,s));
  return a
};


// request from relays
aa.r.req =({relays,request,options})=>
{
  if (!Array.isArray(request) || !request.length)
  {
    aa.log('aa.r.req: invalid request');
    return
  }
  relays = aa.r.validate({relays,request,options});
  if (relays.length)
  {
    aa.r.w.postMessage(['request',{relays,request,options}]);
  }
};


// todo
// resume subscriptions
aa.r.resume =s=>
{
  let ids = aa.fx.splitr(s);
  // for (const url in aa.r.active) { aa.r.c_on(url) } 
};


// send event to relays
aa.r.send =({relays,event,options})=>
{
  if (!event)
  {
    aa.log('aa.r.send: no event');
    return
  }

  if (!aa.fx.verify_event(event))
  {
    aa.log('aa.r.send: invalid event');
    return
  }

  relays = relays?.length ? aa.r.validate({relays}) : [];

  if (!relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.w);
  if (!relays.length)
  {
    aa.log('aa.r.send: no relays');
    return false
  }

  aa.r.w.postMessage(['request',{relays,request:['EVENT',event],options}]);
};


// 
aa.r.stuff =async(relays=[])=>
{
  if (!relays.length) relays = await aa.r.ext();
  if (!relays.length)
  {
    let prompt = window.prompt('add some relays','wss://nos.lol wss://relay.damus.io wss://relay.primal.net');
    if (prompt) relays = aa.fx.splitr(prompt);
    else aa.log(aa.mk.butt_action('r add wss://url.com read write','add relays'));
  }
  if (!relays.length) return

  let rels = relays.filter(i=>aa.is.url(i))
  .map(i=>`${aa.is.url(i).href} read write auth`);
  if (rels.length) aa.r.add(rels.join(','));
  else aa.log('r stuff: no relays given')
};


// toggles for relay mod l
aa.r.toggles =()=>
{
  const mod = aa.r;
  const id = mod.def.id;
  let add_butt = aa.mk.butt_action(`${id} add `,'+','add');
  let sets_span = aa.mk.l('span',{cla:'sets'});
  let sets = [];
  for (const r of Object.values(aa.r.o.ls)) aa.fx.a_add(sets,r.sets);
  for (const set of sets)
  {
    let butt = aa.mk.butt_clk([set,'active','relset']);
    butt.dataset.k = 'sets';
    butt.dataset.v = set;
    sets_span.append(butt,' ');
  }
  let states_span = aa.mk.l('span',{cla:'states'});
  let states = 
  [
    ['0','not connected'],
    ['1','connected'],
    ['2','connecting'],
    ['3','closed'],
  ];
  for (const state of states)
  {
    let [id,str] = state;
    let butt = aa.mk.butt_clk([str,'active','relstate']);
    butt.dataset.k = 'state';
    butt.dataset.v = id;
    states_span.append(butt,' ');
  }
  let toggles = aa.mk.l('p',{cla:'toggles'});
  toggles.append(sets_span,aa.mk.l('br'),states_span);
  fastdom.mutate(()=>
  {
    mod.l.insertBefore(toggles,mod.l.lastChild);
    mod.l.insertBefore(add_butt,toggles);
  })
};


// validate relays are ok to use
aa.r.validate =({relays,request,options})=>
{
  // filter invalid urls
  relays = relays.map(i=>aa.is.url(i)?.href).filter(i=>i);
  // check for new relays not already added
  let found = relays.filter(i=>!aa.r.o.ls[i]);
  if (found.length)
  {
    // filter those out
    relays = relays.filter(i=>aa.r.o.ls[i]);
    // send found notices
    for (const url of found) aa.r.found({url,request,options});
  }

  return relays.filter(i=>!aa.r.o.ls[i].sets.includes('off'));
};


// relay union worker reunion
aa.r.w = new Worker('/r/manager.js');//,{type:'module'});


// relay union worker message
aa.r.w.onmessage =async e=>
{
  let mess = e.data;
  let dis = mess[0]?.toLowerCase();
  if (dis && Object.hasOwn(aa.r,dis)) aa.r[dis](mess);
  else console.log('aa.r.w.onmessage',dis,mess);
};


// update relay state in ui
aa.r.state =([s,relay])=>
{
  let url = relay.url;
  aa.r.active[url] = relay;
  let l = aa.r.l.querySelector('#'+aa.r.def.id+'_'+aa.fx.an(url));
  if (l)
  {
    fastdom.mutate(()=>
    {
      l.dataset.state = relay.state;
      l.dataset.ratio = relay.failures.length - relay.successes.length;
      l.dataset.subs = aa.r.subs_open(relay.subs);
      // l.parentElement?.prepend(l);
    })
  }
  else console.log('aa.r.state: no element found',relay)
};


// return opened subscriptions 
aa.r.subs_open =subs=>
{
  return [...new Set([...subs.values()]
  .filter(i=>!i.closed)
  .map(i=>i?.id))];
};


// ["OK",<event_id>,<true|false>,<message>]
aa.r.ok =async a=>
{
  const [s,id,is_ok,reason,origin] = a;
  if (is_ok) 
  {
    let dat = aa.db.e[id];
    if (dat)
    {
      dat.clas = aa.fx.a_rm(dat.clas,['not_sent','draft']);
      aa.fx.a_add(dat.seen,[origin]);
      aa.db.upd_e(dat);

      const l = aa.temp.printed.find(i=>i.dataset.id === id);
      if (l) 
      {
        l.classList.remove('not_sent','draft');
        aa.fx.dataset_add(l,'seen',[origin]);
        l.querySelector('.actions')?.replaceWith(aa.e.note_actions(dat))
      }
    }
  }
  else if (reason)
  {
    let [type,txt] = reason.split(':');
    switch (type)
    {
      case 'blocked':
      case 'auth-required':
        aa.r.w.postMessage(['fc',origin]);
        break;
      // case 'pow':
      // case 'duplicate':
      // case 'rate-limited':
      // case 'invalid':
      // case 'restricted':
      // case 'error':
      // default:
    }
  }

  let l = aa.el.get('r.ok');
  if (!l)
  {
    l = aa.mk.details('ok …',0,0,'base');
    aa.el.set('r.ok',l);
    aa.log(l);
  }
  let con = `${id} ${is_ok} ${origin} — ${reason}`;
  l.append(aa.mk.l('p',{con}));
};


// return sorted relay list for outbox
aa.r.outbox =(a=[],sets=[])=>
{
  if (!sets.length) sets = [aa.r.o.w,'k10002'];
  if (!a?.length) return [];
  let relays = aa.r.common(a,sets);
  let outbox = aa.fx.intersect(relays,a);
  let sorted_outbox = Object.entries(outbox).sort(aa.fx.sorts.len);
  return sorted_outbox;
};











