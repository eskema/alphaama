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
  
  // aa.view.replace(`#${id_a}`);
  // aa.view.tits(data.identifier,id_a);
  let l = aa.temp.printed.find(i=>i.dataset.id_a === id_a);
  // let l = document.getElementById(nid);
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
  if (!data || !data.id) return;
  let l = aa.temp.printed.find(i=>i.dataset.id === data.id);
  // let l = document.getElementById(nid);
  if (l) aa.view.upd(aa.fx.encode('note',data.id));
  else
  {
    let dat = await aa.db.get_e(data.id);
    if (dat) aa.e.to_printer(dat); //aa.e.print(dat);
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
    if (dat) aa.e.to_printer(dat); //aa.e.print(dat);
    else 
    {
      // let blank = aa.mk.note({event:{id:x},clas:['blank','root']});
      // aa.e.append_as_root(blank);
      aa.e.miss_e(x);
      aa.get.missing('e');
      aa.log('trying to find event.. '+x);
      // setTimeout(()=>{aa.e.view(blank)},500);
    }
  }
};