// gets all p tags from event
// checks if metadata is available 
// or set it as missing
aa.e.authors =event=>
{
  const missing = new Map();
  const authors = event.tags.filter(aa.fx.is_tag_p);
  for (const tag of authors)
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
  
  // aa.fx.to(()=>
  // {
  //   a.e.miss_authors(missing)
  //   aa.p.get_authors([...missing.keys()])
  //   .then(pubs=>
  //   {
  //     for (const p of pubs) if (p.events.k0) missing.delete(p.pubkey);

  //     for (const [pubkey,relays] of missing)
  //     {
  //       aa.e.miss_set('p',pubkey,[...relays.values()])
  //     }
  //   });
  // },420,'aa.e.authors');
};


aa.e.miss_authors =async missing=>
{
  let stored = await aa.p.get_authors([...missing.keys()]);

  for (const p of stored)
    if (p.events.k0) missing.delete(p.pubkey);

  for (const [pubkey,relays] of missing)
  {
    aa.e.miss_set('p',pubkey,[...relays.values()])
  }
};

aa.e.authors_bkp =async event=>
{
  let tags = event.tags;
  if (!aa.temp.pubs) aa.temp.pubs = new Map();
  const authors = tags.filter(aa.fx.is_tag_p);

  for (const tag of authors)
  {
    const pubkey = tag[1];
    if (!aa.db.p[pubkey] || !aa.db.p[pubkey].events.k0?.length)
    {
      if (!aa.temp.pubs.has(pubkey)) aa.temp.pubs.set(pubkey,new Set());
      
      let url = aa.fx.url(tag[2])?.href;
      if (url) aa.temp.pubs.get(pubkey).add(url);
    }
  }
  if (!aa.temp.pubs.size) return
  
  aa.fx.to(()=>
  {
    aa.db.ops('idb',{get_a:{store:'authors',a:[...aa.temp.pubs.keys()]}})
    .then(pubs=>
    {
      if (!pubs)
      {
        console.log('aa.e.authors',tags,pubs);
        return;
      }
      for (const p of pubs) 
      {
        if (p.events.k0?.length)
        {
          aa.temp.pubs.delete(p.pubkey);
          aa.db.p[p.pubkey] = p;
          aa.p.links_upd(p);
        }
      }
      for (const [pubkey,rset] of aa.temp.pubs)
      {
        aa.e.miss_set('p',pubkey,[...rset.values()])
        // aa.temp.pubs.delete(pubkey);
      }
      aa.temp.pubs.clear()
      // aa.e.miss_get('p');
    });
  },420,'get_pubs');
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
  missing.relays = [...rset.values()];
  aa.e.miss_get(type);
};


// get event from tag and prints it,
// otherwise add to missing list
aa.e.miss_print =async(tag,relays=[])=>
{
  // console.log('miss_print',tag);
  const id = tag[1];
  if (tag[2])
  {
    let relay = aa.fx.url(tag[2])?.href;
    if (relay) relays.push(relay);
    else console.log('invalid relay url',tag);
  }

  if (!aa.temp.miss_print) aa.temp.miss_print = new Map();
  if (!aa.temp.miss_print.has(id)) aa.temp.miss_print.set(id,[]);  
  
  aa.fx.a_add(aa.temp.miss_print.get(id),relays);
  
  aa.fx.to(aa.e.miss_to,500,'miss_print');
};


aa.e.miss_to =async()=>
{
  let ids = [...aa.temp.miss_print.keys()];
  let [get_id,events,missing] = await aa.r.get_events(ids);
  // console.log(events);
  for (const dat of events)
  {
    aa.temp.miss_print.delete(dat.event.id);
    aa.e.print_q(dat)
  }
  if (!missing) return;
  // console.trace(missing);
  for (const id of missing)
  {
    aa.e.miss_set('e',id,aa.temp.miss_print.get(id));
  }
};


// get event from tag and prints it,
// otherwise add to missing list
aa.e.miss_print_a =async(tag,relays=[])=>
{
  const [type,id,relay] = tag;

  if (relay) relays.push(relay);
  let dat = await aa.e.get_a(id);
  if (dat) aa.e.print_q(dat); 
  else aa.e.miss_set(type,id,relays);
};





aa.e.miss_type =type=>
{
  let dis = new Map();
  let missing = aa.temp.miss[type];
  if (!missing) missing = aa.temp.miss[type] = new Map();
  for (const [id,data] of missing)
  {
    for (const url of [...aa.r.r,...data.relays]) 
    {
      if (!data.nope.includes(url))
      {
        if (!dis.has(url)) dis.set(url,new Set());
        dis.get(url).add(id);
      }
    }
  }
  if (!dis.size) return {};
  // get the first value only
  let [url,keys] = [...dis.entries()].sort(aa.fx.sorts.len)[0];
  if (Array.isArray(url)) 
  {
    console.trace('url should not be array!!',url);
    return
  }

  for (const key of keys)
  {
    aa.fx.a_add(missing.get(key).nope,[url]);
  }
  return {relays:[url],keys:[...keys.values()]}
};


aa.e.miss_get =async type=>
{
  if (!aa.temp.miss[type]) return;
  aa.fx.to(()=>
  {
    let {relays,keys} = aa.e.miss_type(type);
    if (!relays) return;
    let delay = 0;
    let chunks = aa.fx.chunks(keys,420);
    for (const chunk of chunks)
    {
      let filters;
      switch (type)
      {
        case 'a': 
          filters = chunk.map(aa.fx.id_af);
          break;
        case 'p': 
          filters = [{authors:chunk,kinds:[0,10002]}];
          break;
        case 'e': 
          filters = [{ids:chunk}];
          break;
      }
      
      for (const f of filters)
      {
        let [filter] = aa.q.filter(f);
        if (!filter) continue;

        let req_id = `${type}_${aa.fx.rands(6)}`;
        aa.r.on_eose.set(req_id,()=>{aa.r.on_eose.delete(req_id)});
        setTimeout(()=>{aa.r.def_req(req_id,filter,relays)},delay*3);
        delay++;
      }
      // delay++;
    }

    if (aa.e.miss_check(type)) 
    {
      setTimeout(()=>{ aa.e.miss_get(type) },0);
    }
    

  },210,'miss_'+type);
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