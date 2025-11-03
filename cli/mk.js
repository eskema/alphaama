// a button that will populate the input with a command text
aa.mk.butt_action =(s,con=false,cla='')=>
{
  con = con||s;
  cla = 'butt plug'+(cla?' '+cla:'');
  let clk =e=>{ aa.cli.add(s); aa.cli.foc() };
  return make('button',{con,cla,clk})
};


// item content with key as butt_action
aa.mk.item_action =(k,v,s)=>
{
  const df = new DocumentFragment();
  df.append(
    aa.mk.butt_action(s,k,'key'),
    ' ',
    make('span',{cla:'val',con:v})
  )
  return df
};


aa.mk.mention_item =(p,w)=>
{
  const l = make('li',{cla:'item mention',dat:{before:p.metadata.name??''}});
  let after = (p.petname?p.petname:p.petnames[0])+' '+(p.metadata.nip05??'');
  l.append(
    make('span',{cla:'description',con:after,}),
    make('span',{cla:'val',con:p.npub})
  );
  l.tabIndex = '1';
  
  const clk =e=>
  {
    aa.cli.upd_from_oto('nostr:'+e.target.querySelector('.val').textContent,w);
  };
  l.onclick = clk;
  l.onkeydown =e=>
  {
    if (e.key === 'Enter')
    {
      e.stopPropagation();
      e.preventDefault();
      clk(e)
    }
  };
  return l
};


// makes an action item for otocomplete
aa.mk.oto_act_item =(o,s)=>
{
  const l = make('li',{cla:'item',dat:{before:localStorage.ns}});
  l.append(make('span',{cla:'val',con:o.action.join(' ')}));
  l.tabIndex = '1';
  if (o.required) l.append(' ',make('span',{cla:'required',con:o.required.join(' ')}));
  if (o.optional) l.append(' ',make('span',{cla:'optional',con:o.optional.join(' ')}));
  if (o.description) l.append(' ',make('span',{cla:'description',con:o.description}));
  if (o.acts?.length)
  {
    let acts = make('span',{cla:'acts'})
    l.append(' ',acts);
    for (const act of o.acts)
    {
      let butt = make('button',{cla:'butt acts',con:act,clk:e=>
      {
        e.stopPropagation();
        e.preventDefault();
        let text = localStorage.ns+' ';
        text += e.target.closest('.item').querySelector('.val').textContent+' ';
        text += act+' ';
        aa.cli.upd_from_oto(text);
      }});
      acts.append(butt);
    }
  }
  
  if (s === 'pinned' || s === 'invalid') l.classList.add(s);
  else
  {
    const clk =e=>
    {
      e.stopPropagation();
      e.preventDefault();
      aa.cli.upd_from_oto(localStorage.ns+' '+e.target.closest('.item').querySelector('.val').textContent);
    };
    l.onclick = clk;
    l.onkeydown =e=>
    {
      if (e.key === 'Enter')
      {
        e.stopPropagation();
        e.preventDefault();
        clk(e)
      }
    };
  }
  return l
};