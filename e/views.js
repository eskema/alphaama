aa.view.ls.naddr1 =async naddr=>
{
  let data = aa.fx.decode(naddr);
  if (!data) 
  {
    aa.log('unable to decode naddr')
    return;
  }
  aa.log('naddr '+JSON.stringify(data));
  let id_a = aa.view.id_a = aa.fx.id_a(data);
  
  let l = aa.e.by_ida(id_a);
  // let l = [...aa.e.printed.values()].find(i=>i.dataset.id_a === id_a);

  if (l)
  {
    aa.view.upd(`#${aa.fx.encode('note',l.dataset.id)}`);
    return
  }

  let dat = await aa.db.get_a(id_a);
  if (dat) aa.e.to_printer(dat);
  else
  {
    aa.e.miss_a(id_a,data.relays);
    aa.get.missing('a');
  }
};


aa.view.ls.nevent1 =async nevent=>
{
  let data = aa.fx.decode(nevent);
  aa.log(aa.parse.j());
  if (!data || !data.id) return;
  let l = aa.e.printed.get(data.id);
  if (l) aa.view.upd(aa.fx.encode('note',data.id));
  else
  {
    let dat = await aa.db.get_e(data.id);
    if (dat) aa.e.to_printer(dat); 
    else 
    {
      dat = aa.mk.dat(
      {
        event:{id:data.id,created_at:aa.now - 10},
        seen:[aa.fx.in_set(aa.r.o.ls,aa.r.o.r)]
      });

      if (data.author) dat.event.pubkey = data.author;
      if (data.kind) dat.event.kind = data.kind;
      if (data.relays)
      {
        for (let url of data.relays)
        {
          url = aa.is.url(url)?.href;
          if (url) aa.fx.a_add(dat.seen,[url]);
        }
      }
      aa.r.def_req('ids',{ids:[dat.event.id]},[...dat.seen]);
    }
  }
};


aa.view.ls.note1 =async nid=>
{
  aa.view.active = nid;
  let l = document.getElementById(nid);
  if (l && !l.classList.contains('blank')) aa.e.view(l);
  else
  {
    let x = aa.fx.decode(nid);
    let dat = await aa.db.get_e(x);
    if (dat) aa.e.to_printer(dat); 
    else 
    {
      aa.e.miss_e(x);
      aa.get.missing('e');
      
      let msg = aa.mk.l('p',{con:'looking for event.. '+x});
      aa.temp['looking_for_'+x] = msg;
      aa.log(msg);
    }
  }
};