aa.view.ls.naddr1 =async naddress=>
{
  let data = aa.fx.decode(naddress);
  console.log(data);
};


aa.view.ls.nevent1 =async nevent=>
{
  let data = aa.fx.decode(nevent);
  if (data && data.id)
  {
    let nid = aa.fx.encode('note',data.id);
    let l = document.getElementById(nid);
    if (!l)
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
        // console.log(dat);
        let blank = aa.mk.note(dat);
        blank.classList.add('blank');
        aa.e.append_as_root(blank);
        aa.r.demand(['REQ','ids',{ids:[dat.event.id]}],dat.seen,{eose:'done'});
      }
    }
    else 
    {
      aa.view.replace(nid);
      aa.view.resolve(history.state.view);
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
      let blank = aa.mk.note({event:{id:x},clas:['blank','root']});
      aa.e.append_as_root(blank);
      aa.e.miss_e(x);
      aa.get.missing('e');
      setTimeout(()=>{aa.e.view(blank)},500);
    }
  }
};