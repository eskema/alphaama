/*

alphaama
mod    r
relays

*/


aa.r = 
{
  def:{id:'r',ls:{},r:'read',w:'write'},
  active:{},
  message_type:{},
  old_id:'rel',
};


// add relays
aa.r.add =s=>
{
  aa.mod_servers_add(aa.r,s);
  let a = s.split(' ');
  let url = a.shift();
  if (a.includes('off')) aa.r.force_close([url]);
};


// add relays from object
aa.r.add_from_o =(relays)=>
{
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) aa.r.add(a.join(',')); 
  aa.log(a.length+' relays added to ['+aa.r.def.id+']');
};


// broadcast note action
aa.clk.bro =e=>
{
  const note = e.target.closest('.note');
  aa.cli.v(`${localStorage.ns} e bro ${note.dataset.id} `);
};


// broadcast event from id to relays
// s = 'id relay relay relay'
aa.r.bro =(s='')=>
{
  let a = s ? s.split(' ') : [];
  let id = a.shift();
  let dat = aa.db.e[id];
  if (dat) aa.r.broadcast(dat.event,a);
};


// post event to relays
aa.r.broadcast =(event,relays=false)=>
{
  if (!relays || !relays.length) relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.w);
  if (!relays.length) 
  {
    aa.log('aa.r.broadcast: no relays');
    return false
  }

  let note_log = aa.mk.details('k'+event.kind+' sent '+event.id);
  note_log.id = 'note_log_'+event.id;
  note_log.append(aa.mk.l('p',{con:'to: '+relays}));
  aa.log_read(aa.log(note_log));
  

  const opts = {send:{}};
  const dis = JSON.stringify(['EVENT',event]);
  opts.send[event.id] = dis;

  for (const k of relays)
  {
    const relay = aa.r.active[k];
    if (!relay) 
    {
      if (!aa.r.o.ls[k]) aa.r.hint_notice(k,opts,aa.r.o.w);
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
aa.r.c_on =(url,o=false)=> 
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
  : aa.r.active[url] = {q:{},send:{},sent:[],cc:[]};
  
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
    relay.ws.onopen = aa.r.ws_open;
    relay.ws.onclose = aa.r.ws_close;
    relay.ws.onmessage = aa.r.ws_message;
    relay.ws.onerror = aa.r.ws_error;
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
    setTimeout(()=>
    {
      delete r.q[id];
      aa.r.upd_state(k);
    },500);
  }
  else console.log('no close ',k,id);
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


// remove relay(s)
aa.r.del =s=>
{
  const as = s.split(',');
  if (as.length)
  {
    for (const i of as) 
    {
      let a = i.trim().split(' ');
      const url = aa.is.url(a.shift().trim())?.href;
      if (url && aa.r.o.ls[url])
      {
        if (aa.r.active[url])
        {
          aa.r.force_close([url]);
          delete aa.r.active[url];
        }
        delete aa.r.o.ls[url];
        document.getElementById(aa.r.def.id+'_'+aa.fx.an(url)).remove();
      }
    }
  }

  // const work =a=>
  // {
  //   const url = aa.is.url(a.shift().trim())?.href;
  //   if (url && aa.r.o.ls[url])
  //   {
  //     if (aa.r.active[url])
  //     {
  //       aa.r.force_close([url]);
  //       delete aa.r.active[url];
  //     }
  //     delete aa.r.o.ls[url];
  //     document.getElementById(aa.r.def.id+'_'+aa.fx.an(url)).remove();
  //   }
  // };
  // aa.fx.loop(work,s);
  aa.mod_save(aa.r);
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
        if (opts)
        {
          if (opts.req?.length) rel_active.q[opts.req[1]] = opts;
          if (opts.send?.length) rel_active.send = opts.send;
        }
        aa.r.try(rel_active,JSON.stringify(request));
      }
    }
  }
};


// get relays from extension (nip7)
aa.r.ext =async()=>
{
  return new Promise(resolve=>
  {
    if (window.nostr) 
    {
      window.nostr.getRelays().then(r=>
      {
        aa.r.add_from_o(aa.r.from_o(r,['ext']));
        resolve('rel ext done');
      });
    } 
    else 
    {
      aa.log('no extension found, make sure it is enabled.');
      resolve('rel ext done');
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
}


// returns relays object from tags array (kind-10002,etc..)
// aa.r.from_tags =(tags,sets=[])=>
// {
//   let relays = {};
//   for (const tag of tags)
//   {
//     const [type,url,permission] = tag;
//     const href = aa.is.url(url)?.href;
//     if (href)
//     {
//       let relay = relays[href] = {sets:[]};
//       if (permission === 'read') aa.fx.a_add(relay.sets,['read',...sets]);
//       else if (permission === 'write') aa.fx.a_add(relay.sets,['write',...sets]);
//       else aa.fx.a_add(relay.sets,['read','write',...sets]);
//     }
//   }
//   return relays
// }


// relay hint notice
aa.r.hint_notice =(url,opts,set='hint')=>
{
  // needs to display info from what npub, where does the notice come from?
  
  let id = 'notice_'+aa.fx.an(url);
  if (document.getElementById(id)) return;
  
  let text = `r add ${url} `;
  let notice = {title:text};
  notice.id = id;
  notice.butts = {};

  notice.butts.yes =
  {
    title:set,
    exe:e=>
    {
      aa.r.add(`${url} ${set}`);
      aa.r.c_on(url,opts);
      e.target.closest('.is_new')?.classList.remove('is_new');
      e.target.remove();
    }
  };
  let set_off = 'off';
  notice.butts.no =
  {
    title:set_off,
    exe:e=>
    {
      aa.r.add(`${url} ${set_off}`);
      e.target.closest('.is_new')?.classList.remove('is_new');
      e.target.remove();
    }
  };
  let set_other = 'other'
  notice.butts.maybe =
  {
    title:set_other,
    exe:e=>
    {
      aa.r.add(url);
      aa.r.c_on(url,opts);
      aa.cli.v(localStorage.ns+' '+text);
      e.target.closest('.is_new')?.classList.remove('is_new');
      e.target.remove();
    }
  };
  aa.log(aa.mk.notice(notice));
};



// event template for relay list
aa.kinds[10002] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root','tiny');
  
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      let relays = {};
      let sets = ['k10002'];
      let tags = dat.event.tags.filter(i=>i[0]==='r');
      for (const tag of tags)
      {
        const [type,url,permission] = tag;
        const href = aa.is.url(url)?.href;
        if (!href) continue;
        let relay = relays[href] = {sets:[]};
        if (permission === 'read') aa.fx.a_add(relay.sets,['read',...sets]);
        else if (permission === 'write') aa.fx.a_add(relay.sets,['write',...sets]);
        else aa.fx.a_add(relay.sets,['read','write',...sets]);
      }
      // let relays = aa.r.from_tags(dat.event.tags,['k10002']);
      aa.p.relays_add(relays,p);
      if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
      aa.p.save(p);
    }
  });
  
  return note
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


// make relay list
aa.mk.k10002 =(s='')=>
{
  let log = aa.r.def.id+' ls: ';
  const err = (er)=>{aa.log(log+er)};

  let ls = aa.r.o.ls;
  let relay_list = [];
  let a = s ? s.split(',') : Object.keys(ls);
  
  for (const k of a)
  { 
    let read, write;
    const tag = [k];
    if (ls[k].sets.includes('read')) read = true;
    if (ls[k].sets.includes('write')) write = true;
    if (read || write)
    {
      if (read && !write) tag.push('read');
      if (!read && write) tag.push('write');
      relay_list.push(tag.join(' '))
    }
  }

  const relays = [];
  for (const r of relay_list) 
  {
    let relay = r.trim().split(' ');
    relay.unshift('r');
    relays.push(relay);
  }
  if (relays.length)
  {
    aa.dialog(
    {
      title:'new relay list',
      l:aa.mk.tag_list(relays),
      no:{exe:()=>{} },
      yes:{exe:()=>
      {
        const event = 
        {
          pubkey:aa.u.p.xpub,
          kind:10002,
          created_at:aa.now,
          content:'',
          tags:relays
        };
        // aa.e.finalize(event);
      }},
    });
  }
};


// on load
aa.r.load =()=>
{
  const mod = aa.r;
  const id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['url'], 
      optional:['set'], 
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
      required:['url','set'],
      description:'remove set from relays',
      exe:s=>aa.mod_setrm(mod,s)
    },
    {
      action:[id,'ext'],
      description:'get relays from extension',
      exe:mod.ext
    },
    {
      action:[id,'ls'],
      optional:['relset','relset'],
      description:'loads relay list from sets',
      exe:mod.ls
    },
    {
      action:['mk','10002'],
      optional:['<url set1 set2>,<url>'],
      description:'create a relay list (kind-10002)',
      exe:aa.mk.k10002
    },
    {
      action:['e','bro'],
      optional:['<url set1 set2>,<url>'],
      description:'broadcast note to relays',
      exe:mod.bro
    },
    {
      action:[id,'resume'],
      description:'resume open queries',
      exe:mod.resume
    },
  );
  aa.mod_load(mod).then(aa.mk.mod).then(e=>
  {
    let add_butt = aa.mk.butt_action(`${id} add `,'+','add');
    mod.l.insertBefore(add_butt,document.getElementById(id));
  });
}


// ["AUTH", <challenge-string>]
aa.r.message_type.auth =async message=> 
{
  console.log(message);
  let url = message.origin;
  let challenge = message.data[1];
  if (!url || !challenge) return;

  let event = {kind:22242,tags:[]};
  event.tags.push(['relay',url]);
  event.tags.push(['challenge',challenge]);
  aa.e.normalise(event);
  event.id = aa.fx.hash(event);
  const signed = await aa.u.sign(event);
  if (signed) 
  {
    let relay = aa.r.active[url];
    relay.challenge = challenge;
    aa.r.broadcast(signed,[url]);
  }
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
      let ds = event.tags.filter(t=>t[0]==='d')[0][1];
      let id = `${event.kind}:${event.pubkey}:${ds}`;
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
  if (is_ok) 
  {
    let r = aa.r.active[message.origin];
    if (id in r.send) delete r.send[id];
    aa.fx.a_add(r.sent,[id]);
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
  let log_l = document.getElementById('note_log_'+id);
  if (log_l) log_l.append(aa.mk.l('p',{con:log}));
  else aa.log(log);
};


// make r mod item
aa.r.mk =(k,v) =>
{
  // k = url
  // v = {sets:[]}

  const l = aa.mk.server(k,v);
  if (l)
  {
    l.id = aa.r.def.id+'_'+aa.fx.an(k);
    l.dataset.state = 0;
    aa.mod_servers_butts(aa.r,l,v);
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
  if (relay.ws.readyState === 1) relay.ws.send(dis);
  else 
  {
    if (!relay.failed_cons) relay.failed_cons = 0; 
    relay.failed_cons = relay.failed_cons++;
    if (relay.failed_cons < 10) setTimeout(()=>{aa.r.try(relay,dis)},500*relay.failed_cons)
  }
  aa.r.upd_state(relay.ws.url);
};


// update relay state in ui
aa.r.upd_state =url=>
{
  const relay = aa.r.active[url];
  if (relay)
  {
    let l = document.getElementById(aa.r.def.id+'_'+aa.fx.an(url));
    if (l)
    {
      setTimeout(()=>
      {
        l.dataset.state = relay?.ws?.readyState ||  '';
        l.dataset.q = Object.keys(relay.q);
      },100);
    }
    else console.log('aa.r.upd_state '+url,'no relay found')
  }
};


// on websocket close
aa.r.ws_close =async e=>
{
  const rl = e.target.url;
  let relay = aa.r.active[rl];
  aa.r.upd_state(e.target.url);
  
  if (relay && !relay.fc) 
  {
    let cc = relay.cc;
    const fails = cc.unshift(Math.floor(e.timeStamp));
    // reconnect if somewhat stable
    if (cc[1] && cc[0] - cc[1] > 99999 || fails < 21) 
    {  
      setTimeout(()=>{ aa.r.c_on(rl) }, 420 * fails)
    }
  } else aa.log(rl+' closed');
};


// on websocket error
aa.r.ws_error =e=>{ console.log('ws error:',e) };


// on websocket message
aa.r.ws_message =async e=>
{
  const err = async e=> 
  { 
    aa.log('unknown data from '+e.target.url);
    console.log('unknown data from '+e.target.url,e);
  };

  let a = aa.parse.j(e.data);
  if (a && Array.isArray(a))
  {
    let type = a[0].toLowerCase();
    if (aa.r.message_type.hasOwnProperty(type))
    {
      aa.r.message_type[type]({data:a,origin:e.target.url})
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




// event template for relay data from monitor nip66
aa.kinds[30166] =dat=>
{
  const note = aa.e.note_pre(dat);
  note.classList.add('root');
  aa.parse.content_o(aa.parse.j(dat.event.content),note);
  return note
};


// window.addEventListener('load',aa.r.load);