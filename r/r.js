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
  aa.cli.clear();
  
  const work =a=>
  {
    let url_string = a.shift().trim();
    const url = aa.is.url(url_string)?.href;
    if (url)
    {
      if (!aa.r.o.ls[url]) aa.r.o.ls[url] = {sets:[]};
      aa.fx.a_add(aa.r.o.ls[url].sets,a);
      aa.mod_ui(aa.r,url,aa.r.o.ls[url]);
    }
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.r);
};


// add relays from object
aa.r.add_from_o =(relays)=>
{
  let a = [];
  for (const r in relays) a.push(r+' '+relays[r].sets.join(' '));
  if (a.length) aa.r.add(a.join(',')); 
  aa.log(a.length+' relays added');
};


// post event to relays
aa.r.broadcast =(event,relays=false)=>
{
  if (!relays || !relays.length) relays = aa.r.in_set(aa.r.o.w);
  if (!relays.length) 
  {
    aa.log('aa.r.broadcast: no relays');
    return false
  }

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
        // if (relay.send[event.id]) delete relay.send[event.id]
        continue;
      } 
      else aa.r.try(relay,dis)
    }
  }
};


// append relay buttons to item
aa.r.butts =(l,o)=>
{
  let url = l.querySelector('.url').innerText;
  l.append(' ',aa.mk.butt_action(aa.r.def.id+' rm '+url,'rm','rm'));
  
  let sets = aa.mk.l('span',{cla:'sets'});
  if (o.sets && o.sets.length)
  {    
    for (const set of o.sets)
    {
      sets.append(aa.mk.butt_action(aa.r.def.id+' setrm '+url+' '+set,set),' ')
    }
  }
  // sets.append(aa.mk.butt_action(aa.r.def.id+' add '+url+' off','+'));
  l.append(' ',sets,' ',aa.mk.butt_action(aa.r.def.id+' add '+url+' off','+','add'));
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
      for (const ev in o.send) relay.send[ev] = o.send[ev];
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
    setTimeout(()=>
    {
      delete r.q[id];
      aa.r.upd_state(k);
    },500);
  }
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

  if (!relays?.length) relays = aa.r.in_set(aa.r.o.r);
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

aa.r.from_tags =(tags,sets=[])=>
{
  let relays = {};
  for (const tag of tags)
  {
    const [type,url,permission] = tag;
    const href = aa.is.url(url)?.href;
    if (href)
    {
      let relay = relays[href] = {sets:[]};
      if (permission === 'read') aa.fx.a_add(relay.sets,['read',...sets]);
      else if (permission === 'write') aa.fx.a_add(relay.sets,['write',...sets]);
      else aa.fx.a_add(relay.sets,['read','write',...sets]);
    }
  }
  return relays
}


// relay hint notice
aa.r.hint_notice =(url,opts,set='hint')=>
{
  // needs to display info from what npub, where does the notice come from?
  let act_yes = url+' '+set;
  let id = 'notice_'+aa.fx.an(url);
  if (document.getElementById(id)) return;
  let notice = {title:'r add '+act_yes+'?'};
  notice.id = id;
  notice.yes =
  {
    title:'yes',
    exe:e=>
    {
      aa.r.add(act_yes);
      aa.r.c_on(url,opts);
      setTimeout(()=>{e.target.parentElement.textContent = act_yes},50);
    }
  };
  let act_no = url+' off';
  notice.no =
  {
    title:'no',
    exe:e=>
    {
      aa.r.add(act_no);
      setTimeout(()=>{e.target.parentElement.textContent = act_no},50);
    }
  };
  aa.notice(notice);
}


// returns relays in a given set
aa.r.in_set =(relset,filter=true)=>
{
  let relays = [];
  for (const k in aa.r.o.ls)
  { 
    if (aa.r.o.ls[k].sets.includes(relset))
    {
      if (!filter) relays.push(k);
      else if (!aa.r.o.ls[k].sets.includes('off')) relays.push(k);
    } 
  }
  return relays
};


// list relays from set
aa.r.list =s=>
{
  const err = ()=> {aa.log(aa.r.def.id+' ls: no relays found')};
  a = s.trim().split(' ');
  if (!a.length || a[0] === '') a[0]= 'k10002';
  let relays = [];
  for (const set of a) relays.push(...aa.r.in_set(set,false));
  relays = [...new Set(relays)];
  let rels = [];
  if (relays.length)
  {
    for (const k of relays)
    { 
      let read, write;
      const tag = [k];
      if (aa.r.o.ls[k].sets.includes('read')) read = true;
      if (aa.r.o.ls[k].sets.includes('write')) write = true;
      if (read || write)
      {
        if (read && !write) tag.push('read');
        if (!read && write) tag.push('write');
        rels.push(tag.join(' '))
      }
    }
  }
  if (rels.length) aa.cli.v(localStorage.ns+' '+aa.r.def.id+' mkls '+rels.join(', '));
  else err();
};


// make relay list
aa.r.list_mk =s=>
{
  aa.cli.clear();
  const a = s.trim().split(',');
  const relays = [];
  for (const r of a) 
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
          created_at:aa.t.now,
          content:'',
          tags:relays
        };
        aa.u.event_finalize(event);
      }},
    });
  }
};


// on load
aa.r.load =()=>
{
  aa.actions.push(
    {
      action:[aa.r.def.id,'add'],
      required:['url'], 
      optional:['set'], 
      description:'add or replace relays',
      exe:aa.r.add
    },
    {
      action:[aa.r.def.id,'rm'],
      required:['url'], 
      description:'remove relay',
      exe:aa.r.rm
    },
    // {
    //   action:[aa.r.def.id,'sets'],
    //   required:['set','url'],
    //   description:'create sets of relays',
    //   exe:aa.r.sets
    // },
    {
      action:[aa.r.def.id,'setrm'],
      required:['url','set'],
      description:'remove set from relays',
      exe:aa.r.rm_set
    },
    {
      action:[aa.r.def.id,'ext'],
      description:'get relays from extension',
      exe:aa.r.ext
    },
    {
      action:[aa.r.def.id,'ls'],
      required:['set'],
      description:'loads relay list from sets',
      exe:aa.r.list
    },
    {
      action:[aa.r.def.id,'mkls'],
      description:'create a relay list (kind-10002)',
      exe:aa.r.list_mk
    },
    {
      action:[aa.r.def.id,'resume'],
      description:'resume open queries',
      exe:aa.r.resume
    },
  );
  aa.mod_load(aa.r).then(aa.mk.mod);
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
  aa.u.event_complete(event);
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
aa.r.message_type.eose =async message=>
{
  const sub_id = message.data[1];
  let sub = aa.r.active[message.origin].q[sub_id];
  if (!sub) return;
  if (sub.eose && sub.eose === 'close')
  {
    aa.r.close(message.origin,sub_id);
  }
  sub.eose = 'done';
};


// ["EVENT",<sub_id>,<event_data>]
aa.r.message_type.event =async message=>
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

// ["NOTICE",,<message>]
aa.r.message_type.notice =async message=> 
{
  console.log(message)
};

// ["OK",<event_id>,<true|false>,<message>]
aa.r.message_type.ok =async message=>
{
  const [type,id,is_ok,reason] = message.data;
  if (is_ok) 
  {
    console.log('ok',id,message.origin);
    let r = aa.r.active[message.origin];
    if (id in r.send) delete r.send[id];
    aa.fx.a_add(r.sent,[id]);
    let dat = aa.db.e[id];
    if (dat)
    {
      dat.clas = aa.fx.a_rm(dat.clas,['not_sent','draft']);
      aa.fx.a_add(dat.seen,[message.origin]);
      aa.db.upd_e(dat);

      const l = document.getElementById(aa.fx.encode('nid',id));
      if (l) 
      {
        l.classList.remove('not_sent','draft');
        aa.fx.dataset_add(l,'seen',[message.origin]);
        let actions = l.querySelector('.actions');
        actions.replaceWith(aa.e.note_actions(dat))
      }
    }
  }
  else aa.log(message.origin+' not ok: '+reason+' '+id);
};


// make r mod item
aa.r.mk =(k,v) =>
{
  // k = url
  // v = {sets:[]}

  const l = aa.mk.relay(k,v);
  if (l)
  {
    l.id = aa.r.def.id+'_'+aa.fx.an(k);
    l.dataset.state = 0;
    aa.r.butts(l,v);
    aa.r.upd_state(k);
    return l
  }
  else return false
};


// make relay item
aa.mk.relay =(k,v)=>
{
  k = aa.is.url(k);
  if (!k) return false;

  const l = aa.mk.l('li',{cla:'item relay'});
  const url_l = aa.mk.l('p',{cla:'url'});
  url_l.append(
    aa.mk.l('span',{cla:'protocol',con:k.protocol+'//'}),
    aa.mk.l('span',{cla:'host',con:k.host}),
    aa.mk.l('span',{cla:'pathname',con:k.pathname}),
    aa.mk.l('span',{cla:'hashsearch',con:k.hash+k.search})
  ); 
  l.append(url_l); 
  if (v.sets && v.sets.length) l.dataset.sets = v.sets;   
  return l
};


// returns a list of relays given either a relay set or single url
aa.r.rel =s=>
{
  const a = [];
  let relay = aa.is.url(s)?.href;
  if (relay) a.push(relay);
  else a.push(...aa.r.in_set(s));
  return a
};


// remove relay(s)
aa.r.rm =s=>
{
  aa.cli.clear();
  
  const work =a=>
  {
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
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.r);

};


// resume subscriptions
aa.r.resume =()=>
{
  aa.cli.clear(); 
  for (const url in aa.r.active) { aa.r.c_on(url) } 
};


// save r
aa.r.save =()=>{ aa.mod_save(aa.r).then(aa.mk.mod) };


// add set to relays
// aa.r.sets =s=>
// {
//   const work =a=>
//   {
//     const set_id = a.shift();
//     if (aa.is.an(set_id)) 
//     {
//       for (let url of a)
//       {
//         url = aa.is.url(url)?.href;
//         if (url)
//         {
//           let r = aa.r.o.ls[url];
//           if (!r.sets) r.sets = [];
//           aa.fx.a_add(r.sets,[set_id]);
//           aa.mod_ui(aa.r,url,r);
//         }
//       }
//     }
//   };
//   aa.fx.loop(work,s);
//   aa.mod_save(aa.r)
//   aa.cli.clear();
// };


// remove set from relays
// deprecated in favor of aa.r.rm_set
// aa.r.set_rm =s=>
// {
//   const work =a=>
//   {
//     const set_id = a.shift();
//     if (aa.is.an(set_id)) 
//     {
//       for (let url of a)
//       {
//         url = aa.is.url(url)?.href;
//         if (url)
//         {
//           let r = aa.r.o.ls[url];
//           if (r && r.sets.includes(set_id))
//           {
//             r.sets = r.sets.filter(set=> set !== set_id);
//             aa.mod_ui(aa.r,url,r);
//           }
          
//         }
//       }
//     }
//   };
//   aa.fx.loop(work,s);
//   aa.mod_save(aa.r)
//   aa.cli.clear();
// };

// remove set from relays
aa.r.rm_set =s=>
{
  aa.cli.clear();
  const work =a=>
  {
    let url_string = a.shift().trim();
    const url = aa.is.url(url_string)?.href;
    const relay = aa.r.o.ls[url];
    if (!relay) return;
    relay.sets = aa.fx.a_rm(relay.sets,a);
    aa.mod_ui(aa.r,url,relay);
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.r)
};


// try to send and retry if fails
aa.r.try =(relay,dis)=>
{
  if (relay.ws.readyState === 1) relay.ws.send(dis);
  else 
  {
    if (!relay.failed_cons) relay.failed_cons = 0; 
    relay.failed_cons = relay.failed_cons++;
    if (relay.failed_cons < 10) setTimeout(()=>{aa.r.try(relay,dis)},500)
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
  let delay = 0;
  for (const sub_id in relay.q)
  {
    let sub = relay.q[sub_id];
    // if (sub?.eose !== 'done')
    // if (sub?.eose && sub?.eose !== 'done')
    // {
      // if (sub.stamp)
      // {
      //   let filters_i = 2;
      //   while (filters_i < sub.req.length)
      //   {
      //     sub.req[filters_i].since = sub.stamp + 1;
      //     filters_i++;
      //   }
      // }
      aa.r.try(relay,JSON.stringify(sub.req));
      // setTimeout(()=>{aa.r.try(relay,JSON.stringify(sub.req))},delay);
    // }
    // delay = 100 + delay;
  }
  // delay = 0;
  for (const ev in relay.send) 
  {
    aa.r.try(relay,relay.send[ev])
    // setTimeout(()=>{aa.r.try(relay,relay.send[ev])},delay);
    // delay = 100 + delay;
  }
  aa.r.upd_state(e.target.url);
};


window.addEventListener('load',aa.r.load);