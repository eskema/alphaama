// dm DOM creators


// conversation list item for left panel
aa.mk.dm_convo_item =pubkey=>
{
  let link = aa.mk.p_link(pubkey);
  let preview = make('span',{cla:'dm_convo_preview'});
  let time = make('span',{cla:'dm_convo_time'});
  let unread = make('span',{cla:'dm_convo_unread hidden', con:'0'});

  return make('div',
  {
    cla:'dm_convo_item',
    dat:{pubkey, stamp:0},
    app:[link, time, preview, unread],
    clk: aa.dm.clk.select,
  })
};


// conversation header for right panel
aa.mk.dm_convo_header =pubkey=>
{
  let back = make('button',
  {
    cla:'butt dm_back',
    con:'<',
    tit:'close conversation',
    clk: aa.dm.clk.back,
  });

  let link = aa.mk.p_link(pubkey);
  let actions = make('span',
  {
    cla:'actions empty',
    app: aa.mk.butt_clk(['…','action_butt','pa']),
  });

  let convo = aa.dm.convos.get(pubkey);
  let count = convo ? convo.messages.children.length : 0;

  let mark_read = make('button',
  {
    cla:'butt dm_mark_read',
    con: count,
    tit:'mark read',
    dat:{pubkey},
    clk: aa.dm.clk.mark_read,
  });

  return make('header',
  {
    cla:'dm_header',
    dat:{pubkey},
    app:[back,' ',link,' ',actions,' ',mark_read],
  })
};


// individual message (simple div, NOT .note)
aa.mk.dm_msg =rumor=>
{
  let from_u = aa.u.is_u(rumor.pubkey);
  let cla = 'dm_msg' + (from_u ? ' from_u' : '');

  let content = make('div',{cla:'dm_content'});
  let parsed = aa.e.content(rumor.content);
  if (parsed) content.append(parsed);
  else content.textContent = rumor.content || '';

  let time = make('span',
  {
    cla:'dm_time',
    con: aa.fx.time_elapsed(new Date(rumor.created_at * 1000)),
    tit: new Date(rumor.created_at * 1000).toLocaleString(),
  });

  let inspect = make('button',
  {
    cla:'dm_inspect butt tiny',
    con:'i',
    clk: aa.dm.clk.inspect,
  });

  return make('div',
  {
    cla,
    dat:{id:rumor.id, stamp:rumor.created_at},
    app:[content, time, ' ', inspect],
  })
};


// draft message in active convo
aa.mk.dm_draft =(content,pubkey)=>
{
  let content_el = make('div',{cla:'dm_content', con:content});
  let send = make('button',{cla:'butt exe', con:'send', clk:aa.dm.clk.send});
  let cancel = make('button',{cla:'butt no', con:'cancel', clk:aa.dm.clk.cancel});
  let actions = make('div',{cla:'dm_actions', app:[send,' ',cancel]});

  return make('div',
  {
    cla:'dm_msg dm_draft from_u',
    dat:{pubkey},
    app:[content_el, actions],
  })
};


// pending convo item in left panel
aa.mk.dm_pending_item =()=>
{
  let label = make('span',{cla:'dm_pending_label', con:'pending'});
  let unread = make('span',{cla:'dm_convo_unread'});
  return make('div',
  {
    cla:'dm_convo_item dm_pending_convo',
    dat:{pubkey:'_pending'},
    app:[label, unread],
    clk: aa.dm.clk.select,
  })
};


// pending view header
aa.mk.dm_pending_header =()=>
{
  let back = make('button',{cla:'butt dm_back', con:'<', clk: aa.dm.clk.back});
  let label = make('span',{con:'pending'});
  let batch = make('button',{cla:'butt exe', con:'decrypt 5', clk: aa.dm.clk.decrypt_batch});
  let all = make('button',{cla:'butt exe', con:'decrypt all', clk: aa.dm.clk.decrypt_all});

  return make('header',
  {
    cla:'dm_header dm_pending_header',
    app:[back,' ',label,' ',batch,' ',all],
  })
};


// pending gift wrap item
aa.mk.dm_pending_wrap =(id, dat)=>
{
  let event = dat.event;
  let id_el = make('span',{cla:'dm_pending_id mono', con: id.slice(0,12)+'\u2026', tit:id});
  let pk = make('span',{cla:'dm_pending_pk mono', con: event.pubkey.slice(0,12)+'\u2026', tit:event.pubkey});
  let time = make('span',{cla:'dm_time', con: aa.fx.time_elapsed(new Date(event.created_at * 1000))});
  let btn = make('button',{cla:'butt exe tiny', con:'decrypt', dat:{id}, clk: aa.dm.clk.decrypt_one});

  return make('div',
  {
    cla:'dm_pending_wrap',
    dat:{id},
    app:[id_el,' ',pk,' ',time,' ',btn],
  })
};


// inspect dialog showing decrypt chain
aa.mk.dm_inspect =rumor_id=>
{
  let entry = aa.dm.chain.get(rumor_id);
  if (!entry)
  {
    aa.log('chain not found for '+rumor_id);
    return
  }

  let dialog = aa.el.get('dialog');
  if (!dialog) return;

  let wrap = make('div',{cla:'dm_inspect_wrap'});

  let close = make('button',{cla:'butt no', con:'close', clk:()=> dialog.close()});
  let header = make('header',{app:[make('h3',{con:'message chain'}),' ',close]});
  wrap.append(header);

  // rumor section
  let rumor_pre = make('pre',{con: JSON.stringify(entry.rumor,null,2)});
  let rumor_section = make('section',
  {
    cla:'chain_section',
    app:[make('h4',{con:'rumor (kind 14)'}), rumor_pre],
  });
  wrap.append(rumor_section);

  // seal section
  if (entry.seal)
  {
    let seal_pre = make('pre',{con: JSON.stringify(entry.seal,null,2)});
    let seal_section = make('section',
    {
      cla:'chain_section',
      app:[make('h4',{con:'seal (kind 13)'}), seal_pre],
    });
    wrap.append(seal_section);
  }

  // wrap ids
  if (entry.wrap_ids?.length)
  {
    let ids_text = entry.wrap_ids.join('\n');
    let wrap_pre = make('pre',{con: ids_text});
    let wrap_section = make('section',
    {
      cla:'chain_section',
      app:[make('h4',{con:`gift wrap ids (${entry.wrap_ids.length})`}), wrap_pre],
    });
    wrap.append(wrap_section);
  }

  fastdom.mutate(()=>
  {
    dialog.textContent = '';
    dialog.append(wrap);
    dialog.showModal();
  });
};
