/*

alphaama
mod    r
relays

*/


aa.r = 
{
  active:{},
  def:{id:'r',ls:{},r:'read',w:'write'},
  message_type:{},
  old_id:'rel',
};


// add relays
aa.r.add =s=>
{
  let [valid,invalid,off] = aa.mod.servers_add(aa.r,s,'relay');
  for (const url of off) aa.r.force_close([url]);
};


// add relays from object
aa.r.add_from_o =relays=>
{
  //o = {'wss://url.com':{sets:['read','write'}}
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) aa.r.add(a.join(','));
};


// broadcast event from id to relays
// s = 'id relay relay relay'
aa.r.bro =async(s='')=>
{
  let [id,...relays] = s.split(' ');
  let dat = await aa.db.e[id];
  if (dat) aa.r.broadcast(dat.event,relays);
  else aa.log('r bro: event not found')
};


// post event to relays
aa.r.broadcast =(event,relays=[],options={})=>
{
  if (!relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.w);
  if (!relays.length) 
  {
    aa.log('aa.r.broadcast: no relays');
    return false
  }

  if (options.log !== false)
  {
    let note_log = aa.mk.details('k'+event.kind+' sent '+event.id);
    note_log.id = 'note_log_'+event.id;
    note_log.append(aa.mk.l('p',{con:'to: '+relays}));
    aa.log(note_log,0,1);
  }

  const opts = {send:{}};
  const dis = JSON.stringify(['EVENT',event]);
  opts.send[event.id] = dis;

  for (const k of relays)
  {
    const relay = aa.r.active[k];
    if (!relay) 
    {
      if (!aa.r.o.ls[k]) aa.r.hint_notice(k,opts);
      else aa.r.c_on(k,opts);
    }
    else
    {
      if (relay.sent.includes(event.id))
      {
        aa.log(`event already sent to ${k}`);
        continue;
      } 
      else aa.r.try(relay,dis)
    }
  }
};


// make relay connection
aa.r.c_on =async(url,o=false)=> 
{
  if (localStorage.mode === 'hard') 
  {
    aa.log('aa.r.c_on: mode=hard');
    return
  }
  
  if (aa.r.o.ls[url]?.sets.includes('off')) 
  {
    aa.r.force_close([url]);
    return
  }

  let relay = aa.r.active[url] ? aa.r.active[url] 
  : aa.r.active[url] = {q:{},send:{},sent:[],cc:[],err:[],failed:0};
  
  if (relay.fc) return;
  // {
  //   aa.log(url+' is force closed')
  //   return;
  // }
  if (relay.ws?.readyState !== 1)
  {
    if (relay.fc) delete relay.fc;
    if (o)
    {
      if (o.req?.length) relay.q[o.req[1]] = o;
      for (const ev in o.send) 
      {
        relay.send[ev] = o.send[ev];
      }
    }
    
    relay.ws = new WebSocket(url);
    
    const relay_to = setTimeout(()=>
    {
      // aa.log(relay?.ws?.readyState);
      if (relay?.ws?.readyState === 0) 
      {
        relay.failed = relay.failed++;
        if (relay.failed > 21) aa.r.force_close([url]);
      }
    },10000);

    relay.ws.onopen =e=>
    {
      clearTimeout(relay_to);
      aa.r.ws_open(e);
    }
    
    relay.ws.onclose = aa.r.ws_close;
    relay.ws.onerror = aa.r.ws_error;
    relay.ws.onmessage = aa.r.ws_message;
  }
};


// close relay connection
aa.r.close =(k,id)=>
{
  let r = aa.r.active[k];
  if (r && r.q[id])
  {
    if (r.ws?.readyState === 1) r.ws.send(JSON.stringify(['CLOSE',id]));
    else console.log('close rs',r.ws?.readyState);
    delete r.q[id];
  }
  else console.log('no close ',k,id);
  aa.r.upd_state(k);
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
  if (!request || !Array.isArray(request)) 
  {
    aa.log('aa.r.demand: no request');
    return false
  }

  let filters = request.slice(2);

  if (!aa.fx.verify_req_filters(filters))
  {
    aa.log('aa.r.demand: invalid filter '+JSON.stringify(filters));
    return false
  }

  if (!relays?.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
  if (!relays.length) 
  {
    aa.log('aa.r.demand: no relays');
    return false
  }

  let opts = {req:request};
  for (const opt in options) opts[opt] = options[opt];

  for (const k of relays)
  {
    let url = aa.is.url(k)?.href;
    if (!url) 
    {
      aa.log('invalid relay url: '+k);
      return false
    }

    const rel_active = aa.r.active[url];
    if (!rel_active)
    {
      if (!aa.r.o.ls[url]) aa.r.hint_notice(url,opts)
      else 
      {
        if (!aa.r.o.ls[url].sets.includes('off')) aa.r.c_on(url,opts);
        else console.log('relay '+url+' is off');
      } 
    }
    else 
    {
      let no_active_connection = !rel_active.ws || !rel_active.ws?.readyState === 3;
      if (no_active_connection) aa.r.c_on(url,opts);
      else 
      {
        let requestr = JSON.stringify(request);
        if (opts)
        {
          if (opts.req?.length) 
          {
            let q_id = opts.req[1];
            let q = rel_active.q[q_id];
            if (!q) q = rel_active.q[q_id] = opts;
            else if (JSON.stringify(q.req) === requestr) continue;
          }
          if (opts.send?.length) rel_active.send = opts.send;
        }
        aa.r.try(rel_active,requestr);
      }
    }
  }
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


// force close relay connection
aa.r.force_close =(a=[])=>
{
  for (const k of a)
  {
    let r = aa.r.active[k];
    if (r && r.ws)
    {
      r.fc = true; 
      r.ws.close(); 
      delete r.ws;
      delete r.q;
      aa.r.upd_state(k)
    }
  }
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


// relay hint notice
aa.r.hint_notice =(url,opts)=>
{
  // needs to display info from what npub, where does the notice come from?
  let log = aa.mod.servers_add_log('relay');
  if (!log.hasAttribute('open')) log.setAttribute('open','');

  let id = 'notice_'+aa.fx.an(url);
  if (document.getElementById(id)) return;

  let cleanup =e=>
  {
    e.target.classList.add('slap');
    e.target.closest('.is_new')?.classList.remove('is_new');
  }
  
  let title = `r add ${url} `;
  let notice = {title};
  notice.id = id;
  notice.butts = [];

  let set_hint = 'hint';
  notice.butts.push(
  {
    title:set_hint,
    cal:'yes',
    exe:e=>
    {
      aa.r.add(`${url} ${set_hint}`);
      aa.r.c_on(url,opts);
      cleanup(e);
    }
  });
  
  let set_off = 'off';
  notice.butts.push(
  {
    title:set_off,
    cla:'no',
    exe:e=>
    {
      aa.r.add(`${url} ${set_off}`);
      cleanup(e);
    }
  });
  
  let set_other = 'other'
  notice.butts.push(
  {
    title:set_other,
    cla:'maybe',
    exe:e=>
    {
      aa.r.add(url);
      aa.r.c_on(url,opts);
      aa.cli.add(title);
      cleanup(e);
    }
  });

  log.lastChild.prepend(aa.mk.notice(notice));
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
    '/r/wip.js',
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
      action:['e','bro'],
      required:['id'],
      optional:['<url || set>...'],
      description:'broadcast note to relays',
      exe:mod.bro
    },
  );
  aa.mod.load(mod).then(aa.mod.mk).then(e=>
  {
    let add_butt = aa.mk.butt_action(`${id} add `,'+','add');
    fastdom.mutate(()=>
    {
      mod.l.insertBefore(add_butt,mod.l.lastChild)
    })
  });
}


// ["AUTH", <challenge-string>]
aa.r.message_type.auth =async message=> 
{
  console.log(message);
  let url = message.origin;
  let challenge = message.data[1];
  if (!url || !challenge) return;
  
  let active = aa.r.active[url];
  if (!active) return;
  active.challenge = challenge;

  let event = {kind:22242,tags:[['relay',url],['challenge',challenge]]};

  let relay = aa.r.o.ls[url];
  let signed;
  if (!relay?.sets.includes('auth'))
  {
    if (!relay.keys) relay.keys = aa.fx.keypair();
    event.pubkey = relay.keys[1];
    aa.e.normalise(event);
    console.log(event);
    signed = NostrTools.finalizeEvent(event,relay.keys[0]);
    console.log(event);
  }
  else
  {
    aa.e.normalise(event);
    event.id = aa.fx.hash(event);
    signed = await aa.u.sign(event);
  }

  if (signed) aa.r.broadcast(signed,[url],{log:false});
};


// ["CLOSED",<sub_id>,<message>]
aa.r.message_type.closed =async dis=> 
{
  console.log('aa.r.message_type.closed',dis)
};


// ["EOSE",<sub_id>]
aa.r.message_type.eose =message=>
{
  // console.log(message);
  const id = message.data[1];
  let sub = aa.r.active[message.origin].q[id];
  if (!sub) return;
  if (sub.eose && sub.eose === 'close') 
    aa.r.close(message.origin,id);
  sub.eose = 'done';
};


// ["EVENT",<sub_id>,<event_data>]
aa.r.message_type.event =message=>
{ 
  const sub_id = message.data[1];
  const event = message.data[2];

  let dat = aa.db.e[event.id],is_new;
  if (dat)
  {
    is_new = aa.fx.a_add(dat.seen,[message.origin]);
  }
  else if (aa.fx.verify_event(event)) 
  {
    dat = aa.db.e[event.id] = 
    {
      event:event,
      seen:[message.origin],
      subs:[sub_id],
      clas:[],
      refs:[]
    };

    if (aa.miss.e[event.id]) 
    {
      delete aa.miss.e[event.id];
      dat.clas.push('miss');
    }
    else if (aa.fx.kind_type(event.kind) === 'parameterized')
    {
      let identifier = event.tags.find(t=>t[0]==='d')[1];
      let id = `${event.kind}:${event.pubkey}:${identifier}`;
      dat.id_a = id;
      if (aa.miss.a[id])
      {
        delete aa.miss.a[id];
        dat.clas.push('miss');
      }
    }
  }
  else console.log('invalid event',message);

  if (dat)
  { 
    let sub = aa.r.active[message.origin]?.q[sub_id];
    if (sub && (!sub?.stamp 
    || sub?.stamp < dat.event.created_at)) 
    sub.stamp = dat.event.created_at;

    aa.db.upd_e(dat);
    aa.e.to_printer(dat);
  }
};


// ["NOTICE",<message>]
aa.r.message_type.notice =async message=> 
{
  let s = 'NOTICE from '+message.origin+': '+message.data;
  aa.log(s)
};


// ["OK",<event_id>,<true|false>,<message>]
aa.r.message_type.ok =async message=>
{
  const [type,id,is_ok,reason] = message.data;
  let log = 'not ok: '+reason+' '+id+' '+message.origin;
  let r = aa.r.active[message.origin];
  if (is_ok) 
  {
    if (id in r.send) 
    {
      aa.fx.a_add(r.sent,[id]);
      delete r.send[id];
    }

    let dat = aa.db.e[id];
    if (dat)
    {
      dat.clas = aa.fx.a_rm(dat.clas,['not_sent','draft']);
      aa.fx.a_add(dat.seen,[message.origin]);
      aa.db.upd_e(dat);

      const l = document.getElementById(aa.fx.encode('note',id));
      if (l) 
      {
        l.classList.remove('not_sent','draft');
        aa.fx.dataset_add(l,'seen',[message.origin]);
        let actions = l.querySelector('.actions');
        actions.replaceWith(aa.e.note_actions(dat))
      }
    }
    log = 'ok: '+id+(reason?' '+reason:'')+' '+message.origin;
  }
  else
  {
    if (reason.startsWith('auth-required:') 
    || reason.startsWith('blocked:'))
    {
      aa.r.force_close([message.origin])
    }
  }
  let log_l = document.getElementById('note_log_'+id);
  if (log_l) log_l.append(aa.mk.l('p',{con:log}));
  else aa.log(log);
};


// make r mod item
aa.r.mk =(k,v)=>
{
  // k = url
  // v = {sets:[]}

  const l = aa.mk.server(k,v);
  if (l)
  {
    l.id = aa.r.def.id+'_'+aa.fx.an(k);
    l.dataset.state = 0;
    aa.mod.servers_butts(aa.r,l,v);
    aa.r.upd_state(k);
    return l
  }
  else return false
};


// returns a list of relays given either a relay set or single url
aa.r.rel =s=>
{
  const a = [];
  let relay = aa.is.url(s)?.href;
  if (relay) a.push(relay);
  else a.push(...aa.fx.in_set(aa.r.o.ls,s));
  return a
};


// resume subscriptions
aa.r.resume =()=>
{
  for (const url in aa.r.active) { aa.r.c_on(url) } 
};


// try to send and retry if fails
aa.r.try =(relay,dis)=>
{
  if (!relay || !relay.ws) return;
  if (relay.ws.readyState === 1) 
  {
    relay.ws.send(dis);
    aa.r.upd_state(relay.ws.url);
  }
  else 
  {
    relay.failed++;
    if (relay.failed < 21) setTimeout(()=>{aa.r.try(relay,dis)},420*relay.failed);
    else aa.r.force_close([relay.ws.url]);
  }
  
};


// update relay state in ui
aa.r.upd_state =url=>
{
  const relay = aa.r.active[url];
  if (!relay) return
  let l = aa.r.l.querySelector('#'+aa.r.def.id+'_'+aa.fx.an(url));
  if (l)
  {
    let state = relay?.ws?.readyState ||  '';
    let q = relay?.q ? Object.keys(relay.q):[];
    let failed = relay?.failed;

    fastdom.mutate(()=>
    {
      l.dataset.state = state;
      l.dataset.q = q;
      l.dataset.failed = failed;
      l.parentElement?.prepend(l);
    })
  }
  else console.log('aa.r.upd_state '+url,'no element found')
};


// on websocket close
aa.r.ws_close =async e=>
{
  const url = e.target.url;
  let relay = aa.r.active[url];
  aa.r.upd_state(e.target.url);
  
  if (relay && !relay.fc)
  {
    let cc = relay.cc;
    cc.unshift(Math.floor(e.timeStamp));
    // reconnect if somewhat stable
    if (cc[1] && cc[0] - cc[1] > 99999 || cc.length < 21) 
    {  
      setTimeout(()=>{ aa.r.c_on(url) }, 420 * cc.length)
    }
  }
  else
  {
    aa.r.add(url+' off');
    // aa.log(url+' closed');
  }
};


// on websocket error
aa.r.ws_error =e=>
{ 
  console.log('ws error:',e);
  aa.r.ws_close(e);
  // aa.r.force_close([e.target.url])
};


// on websocket message
aa.r.ws_message =async e=>
{
  let origin = e.target.url;
  const err = async e=> 
  {
    if (!aa.r.active[origin].err) aa.r.active[origin].err = [];
    aa.r.active[origin].err.push(e);
    aa.log('unknown data from '+origin);
    console.log('unknown data from '+origin,e);
  };

  if (e.data.length > 200000) console.log(e.data.length,e.data);

  let data = aa.parse.j(e.data);
  if (data && Array.isArray(data))
  {
    let type = data[0].toLowerCase();
    if (Object.hasOwn(aa.r.message_type,type))
    {
      aa.r.message_type[type]({data,origin})
    }
    else err(e);
  }
  else err(e);
};


// on websocket open
aa.r.ws_open =async e=>
{
  let relay = aa.r.active[e.target.url];
  for (const sub_id in relay.q)
  {
    let sub = relay.q[sub_id];
    aa.r.try(relay,JSON.stringify(sub.req));
  }

  for (const ev in relay.send) aa.r.try(relay,relay.send[ev]);
  aa.r.upd_state(e.target.url);
};