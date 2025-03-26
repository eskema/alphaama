// a button that will populate the input with a command text
aa.mk.butt_action =(s,con=false,cla='')=>
{
  con = con||s;
  cla = 'butt plug'+(cla?' '+cla:'');
  let clk =e=>{ aa.cli.add(s) };

  // const butt = aa.mk.l('button',{con,cla,clk});
  // if (cla) butt.classList.add(cla);
  // return butt
  return aa.mk.l('button',{con,cla,clk})
};


// item content with key as butt_action
aa.mk.item_action =(k,v,s)=>
{
  const df = new DocumentFragment();
  df.append(aa.mk.butt_action(s,k,'key'),' ',aa.mk.l('span',{cla:'val',con:v}))
  return df
};


aa.mk.mention_item =(p,w)=>
{
  const l = aa.mk.l('li',{cla:'item mention',bef:p.metadata.name??''});
  let after = (p.petname?p.petname:p.petnames[0])+' '+(p.metadata.nip05??'');
  l.append(
    aa.mk.l('span',{cla:'description',con:after,}),
    aa.mk.l('span',{cla:'val',con:p.npub})
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
  const l = aa.mk.l('li',{cla:'item',bef:localStorage.ns});
  l.append(aa.mk.l('span',{cla:'val',con:o.action.join(' ')}));
  l.tabIndex = '1';
  if (o.required) l.append(' ',aa.mk.l('span',{cla:'required',con:o.required.join(' ')}));
  if (o.optional) l.append(' ',aa.mk.l('span',{cla:'optional',con:o.optional.join(' ')}));
  if (o.description) l.append(' ',aa.mk.l('span',{cla:'description',con:o.description}));
  if (o.acts?.length)
  {
    let acts = aa.mk.l('span',{cla:'acts'})
    l.append(' ',acts);
    for (const act of o.acts)
    {
      let butt = aa.mk.l('button',{cla:'butt acts',con:act,clk:e=>
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


aa.mk.k1 =async(s='')=>
{
  //     const mentions = await aa.get.mentions(s);
      
  //   }
    
  //   aa.e.draft(aa.cli.dat);
  //   delete aa.cli.dat;
  //   aa.cli.fuck_off();
  // }
  // else 
  // {
  //   aa.log(s);
  //   let log_text = 'unable to create note';
  //   if (!aa.u?.p?.pubkey)
  //   {
  //     log_text += ', login first using the command: ';
  //     log_text += localStorage.ns+' u login';
  //   }
  //   aa.log(log_text);      
  // }
};