aa.e.miss_set =(type,id,relays=[])=>
{
  let miss = aa.temp.miss[type];
  if (!miss) miss = aa.temp.miss[type] = new Map();

  if (!miss.has(id)) miss.set(id,{nope:[],relays:[]});
  let missing = miss.get(id);
  
  let rset = new Set([
    ...relays.map(i=>aa.fx.url(i)?.href).filter(i=>i),
    ...aa.fx.in_set(aa.r.o.ls,aa.r.o.r)]);
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
  const id = tag[1];
  if (tag[2])
  {
    let relay = aa.fx.url(tag[2])?.href;
    if (relay) relays.push(relay);
    else console.trace(tag,relays);
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
    aa.e.to_printer(dat)
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
  if (dat) aa.e.to_printer(dat); 
  else aa.e.miss_set(type,id,relays);
};


aa.e.miss_type =type=>
{
  let dis = new Map();
  let def_relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
  let missing = aa.temp.miss[type];
  if (!missing) missing = aa.temp.miss[type] = new Map();
  for (const [id,v] of missing)
  {
    // let v = missing.get();
    for (const url of [...def_relays,...v.relays]) 
    {
      if (!v.nope.includes(url))
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
    console.trace(url);
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
  if (!aa.temp.miss[type]) return
  aa.fx.to(()=>
  {
    let {relays,keys} = aa.e.miss_type(type);
    if (!relays) return;
    let filters;
    switch (type)
    {
      case 'a': filters = keys.map(aa.fx.id_af);break;
      case 'p': filters = [{authors:keys,kinds:[0,10002]}];break;
      case 'e': filters = [{ids:keys}];break;
    }
    for (const f of filters)
    {
      let [filter,options] = aa.q.filter(f);
      if (!filter) continue;
      let req_id = `${type}_${aa.fx.rands(6)}`;
      aa.r.on_eose.set(req_id,()=>{aa.r.on_eose.delete(req_id)});
      aa.r.def_req(req_id,filter,relays);
    }
    setTimeout(()=>
    {
      if (aa.temp.miss[type].size) aa.e.miss_get(type);
    },0);

  },420,'miss_'+type);
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