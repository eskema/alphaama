aa.bus.on('p:miss', pubkey => aa.e.authors([['p', pubkey]]));


// checks if metadata is available
// or set it as missing
aa.e.authors =p_tags=>
{
  const missing = new Map();
  
  for (const tag of p_tags)
  {
    let [type,pubkey,relay] = tag;
    if (!aa.db.p[pubkey] || !aa.db.p[pubkey].metadata)
    {
      if (!missing.has(pubkey)) missing.set(pubkey,new Set());
      
      let url = aa.fx.url(relay)?.href;
      if (url) missing.get(pubkey).add(url);
    }
  }
  
  if (missing.size) aa.e.miss_authors(missing)
};


aa.e.miss_authors =async missing=>
{
  let stored = await aa.p.get_authors([...missing.keys()]);

  for (const p of stored)
    if (p.metadata) missing.delete(p.pubkey);

  for (const [pubkey,relays] of missing)
  {
    aa.e.miss_set('p',pubkey,[...relays])
  }
};


// check if there are still missing events to get
aa.e.miss_check =type=>
{
  let missing = aa.temp.miss[type];
  if (!missing.size) return;

  for (const item of missing)
  {
    if (item[1].nope.length < item[1].relays.length)
    return true;
  }
  return
};


aa.e.miss_set =(type,id,relays=[])=>
{
  let miss = aa.temp.miss[type];
  if (!miss) miss = aa.temp.miss[type] = new Map();

  if (!miss.has(id)) miss.set(id,{nope:[],relays:[]});
  let missing = miss.get(id);
  
  relays = relays.map(i=>aa.fx.url(i)?.href).filter(i=>i)
  let rset = new Set([
    ...relays.map(i=>aa.fx.url(i)?.href).filter(i=>i),
    ...aa.r.r]);
  let pubkey = type === 'p'
  ? id
  : !aa.fx.is_key(id) 
    ? aa.fx.split_ida(id)[1]
    : false;
  if (pubkey)
  {
    let p = aa.db.p[pubkey];
    if (p) rset = new Set([...rset,...aa.fx.in_set(p.relays,'write')])
  }
  missing.relays = [...rset];
  setTimeout(()=>{aa.e.miss_get(type)},420);
};


// get event from tag and prints it,
// otherwise add to missing list
// aa.e.miss_print =async(tag,relays=[])=>
// {
//   // console.log('miss_print',tag);
//   const id = tag[1];
//   if (tag[2])
//   {
//     let relay = aa.fx.url(tag[2])?.href;
//     if (relay) relays.push(relay);
//     else console.log('invalid relay url',tag);
//   }

//   if (!aa.temp.miss_print) aa.temp.miss_print = new Map();
//   if (!aa.temp.miss_print.has(id)) aa.temp.miss_print.set(id,[]);  
  
//   aa.fx.a_add(aa.temp.miss_print.get(id),relays);
  
//   debt.add(aa.e.miss_to,500,'miss_print');
// };


// aa.e.miss_to =async()=>
// {
//   let ids = [...aa.temp.miss_print.keys()];
//   let [get_id,events,missing] = await aa.r.get_events(ids);
//   // console.log(events);
//   for (const dat of events)
//   {
//     aa.temp.miss_print.delete(dat.event.id);
//     aa.e.print_q(dat)
//   }
//   if (!missing) return;
//   // console.trace(missing);
//   setTimeout(()=>
//   {
//     for (const id of missing)
//     {
//       if (!aa.em.has(id)) aa.e.miss_set('e',id,aa.temp.miss_print.get(id));
//     }
//   },1000);
  
// };


// get event from tag and prints it,
// otherwise add to missing list
// aa.e.miss_print_a =async(tag,relays=[])=>
// {
//   const [type,id,relay] = tag;

//   if (relay) relays.push(relay);
//   let dat = await aa.e.get_a(id);
//   if (dat) aa.e.print_q(dat); 
//   else aa.e.miss_set(type,id,relays);
// };





// how many relays to query per round (in parallel). lower = less wire
// bandwidth + more rounds; higher = fewer rounds + duplicate event traffic.
// large default to mimic the old fan-out feel while still gating future
// rounds on EOSEs (so we don't re-ask relays that already answered).
aa.e._miss_parallel_n = 12;

aa.e.miss_type =type=>
{
  let result = {};
  if (!Object.hasOwn(aa.temp.miss, type))
    return result;

  let missing = aa.temp.miss[type];

  let read_relays = new Set(aa.r.r);
  let dis = new Map();
  for (const [id,data] of missing)
  {
    if (!id) continue;
    for (const url of new Set(data.relays).union(read_relays))
    {
      if (!data.nope.includes(url))
      {
        if (!dis.has(url)) dis.set(url,new Set());
        dis.get(url).add(id);
      }
    }
  }
  if (!dis.size) return result;

  // pick the top N relays by how many pending ids they cover. each round
  // queries all of them in parallel for the union of ids — duplicate events
  // are deduped client-side, but we get our answers much faster than asking
  // one relay at a time.
  let sorted = [...dis.entries()].sort(aa.fx.sorts.len);
  let picks = sorted.slice(0, aa.e._miss_parallel_n);
  let urls = picks.map(([url])=> url);
  let key_union = new Set();
  for (const [, keys] of picks)
    for (const k of keys) key_union.add(k);

  result.relays = urls;
  result.keys = [...key_union];
  // mark every picked relay as tried for every id we're asking. next round
  // will skip them and look further down the list.
  for (const key of result.keys)
  {
    let entry = missing.get(key);
    if (entry) aa.fx.a_add(entry.nope, urls);
  }
  return result
};


// fetch one round of missing items from the top-N relays in parallel
// (aa.e._miss_parallel_n, default 3), then wait for at least the first EOSE
// per req before starting the next round. previously this recursed on a
// flat 420ms timer, fanning the same ids out across every relay before any
// answered — wasteful, and concurrent chains could pile up since every
// miss_set schedules another get_missing via debounce. now: one chain at a
// time per type, gated on actual relay completion, and each round picks
// fresh relays (the previous round's are recorded in nope[]).
aa.e._miss_inflight = aa.e._miss_inflight || {};
aa.e.get_missing =type=>
{
  // already a chain running for this type → do nothing. the in-flight
  // chain will recurse once its EOSEs come back, picking up anything
  // miss_set added in the meantime.
  if (aa.e._miss_inflight[type]) return;

  let {relays,keys} = aa.e.miss_type(type);
  if (!relays) return;
  keys = keys.filter(i=>!aa.em.has(i));
  if (!keys.length)
  {
    if (aa.e.miss_check(type)) setTimeout(()=>{aa.e.get_missing(type)},0);
    return;
  }

  // build all filters this relay will be asked for
  let req_filters = [];
  for (const chunk of aa.fx.chunks(keys,420))
  {
    let filters;
    switch (type)
    {
      case 'a': filters = chunk.map(aa.fx.id_af); break;
      case 'p': filters = [{authors:chunk,kinds:[0,10002]}]; break;
      case 'e': filters = [{ids:chunk}]; break;
    }
    if (!filters) { console.error('no filters', type); return; }
    for (const f of filters)
    {
      let [filter] = aa.q.filter(f);
      if (filter) req_filters.push(filter);
    }
  }
  if (!req_filters.length) return;

  aa.e._miss_inflight[type] = true;

  let pending = req_filters.length;
  let done = false;
  let issued_req_ids = [];
  const cleanup_handlers =()=>
  {
    for (const req_id of issued_req_ids)
    {
      aa.r.on_eose.delete(req_id);
      aa.r.on_sub.delete(req_id);
    }
  };
  const finish =()=>
  {
    if (done) return;
    done = true;
    clearTimeout(timeout_id);
    cleanup_handlers();
    aa.e._miss_inflight[type] = false;
    // anything still missing → try the next relay batch now. items that
    // arrived during this round were already cleared from aa.temp.miss by
    // aa.e.miss_remove, so this is a re-pick against a fresh map.
    if (aa.e.miss_check(type)) setTimeout(()=>{aa.e.get_missing(type)},0);
  };
  const on_eose_done =()=>
  {
    pending--;
    if (pending <= 0) finish();
  };
  // safety net: if a relay never sends EOSE (auth wall, hang, dropped
  // connection past the manager's reconnect logic), don't get stuck.
  const timeout_id = setTimeout(finish, 3000);

  for (const filter of req_filters)
  {
    let req_id = `${type}_${aa.fx.rands(6)}`;
    issued_req_ids.push(req_id);
    aa.r.def_req(req_id,filter,relays);
    // each req goes to N relays; each relay sends its own EOSE → multiple
    // callbacks for the same req_id. advance the round on the first EOSE
    // per req_id so we don't wait for the slowest, but keep on_sub alive
    // (cleanup happens in finish/timeout) so events from slower relays
    // still get routed into print_q before the round is torn down.
    let triggered = false;
    aa.r.on_eose.set(req_id,()=>
    {
      if (triggered) return;
      triggered = true;
      on_eose_done();
    });
  }
};


aa.e.miss_get =async type=>
{
  if (!aa.temp.miss[type]) return;
  // short debounce: long debounces keep getting reset by a steady trickle
  // of miss_set calls, so the first round never starts. 200ms collects a
  // batch without delaying the work behind it.
  debt.add(()=>{aa.e.get_missing(type)},200,'miss_'+type);
};


aa.e.miss_quote =(element,data)=>
{
  let id = data.id_a || data.id;
  let dis = aa.temp.note_quotes.get(id);
  if (!dis)
  {
    dis = new Set();
    aa.temp.note_quotes.set(id,dis);
  }
  dis.add(element);
  
  let content = element.querySelector('.content');

  let relays = [];
  if (data.relays?.length) 
  {
    // para.append(`\nrelays: ${data.relays}`);
    relays = data.relays
  }
  let relay = relays.length?relays[0]:'read';
  let command = aa.q.def.id+' req';
  let filter;
  if (aa.fx.is_key(id))
  {
    filter = '{"ids":["'+id+'"],"eose":"close"}';
    aa.e.miss_set('e',id,relays);
  }
  else
  {
    filter = JSON.stringify(aa.fx.id_af(id))
    aa.e.miss_set('a',id,data.relays);
  }
  
  let butt = aa.mk.butt_action(`${command} ${relay} ${filter}`,'req');
  
  fastdom.mutate(()=>{content.prepend(' ',butt)});
  // console.log('quote miss',data);
//   let
//   {
//     id,
//     id_a,
//     author,
//     pubkey,
//     kind,
//     identifier,
//     relays,
//     entity
//   } = data;
};


aa.e.miss_remove =dat=>
{
  if (aa.temp.miss.e?.has(dat.event.id))
    aa.temp.miss.e.delete(dat.event.id);

  if (dat.id_a && aa.temp.miss.a?.has(dat.id_a))
    aa.temp.miss.a.delete(dat.id_a);
};