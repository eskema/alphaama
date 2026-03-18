// m DOM creators


// m section for #view
aa.mk.section_m =()=>
{
  let section = aa.mk.section({id:'m', name:'m', element:aa.m.l});

  let expand = make('button',
  {
    cla:'butt exe m_expand',
    con:'expand',
    clk: aa.m.clk.expand,
  });

  let butts = make('span',
  {
    cla:'butts',
    app:[aa.mk.butt_action('m get','get'),' ',aa.mk.butt_action('m new ','new'),' ',expand],
  });

  let header = section.querySelector('header');
  if (header) header.append(' ',butts);

  let butt = section.querySelector('.section_butt');
  if (butt)
  {
    butt.addEventListener('click', aa.m.restore, {once:true});
    butt.addEventListener('click', ()=>
    {
      // aa.clk.expand toggles class in fastdom.mutate, so 'expanded' here
      // means it's about to be collapsed
      let s = aa.el.get('section_m');
      if (s?.classList.contains('expanded') && aa.m.active)
        aa.m.view_clear();
    });
  }

  aa.m.count_upd();
  return section
};


// conversation list item for left panel
aa.mk.m_convo_item =pubkey=>
{
  let link = aa.mk.p_link(pubkey);
  let preview = make('span',{cla:'m_convo_preview'});
  let time = make('span',{cla:'m_convo_time'});
  let unread = make('span',{cla:'m_convo_unread hidden', con:'0'});

  return make('div',
  {
    cla:'m_convo_item',
    dat:{pubkey, stamp:0},
    app:[link, time, preview, unread],
    clk: aa.m.clk.select,
  })
};


// conversation header for right panel
aa.mk.m_convo_header =pubkey=>
{
  let back = make('button',
  {
    cla:'butt m_back',
    con:'<',
    tit:'close conversation',
    clk: aa.m.clk.back,
  });

  let link = aa.mk.p_link(pubkey);
  let actions = make('span',
  {
    cla:'actions empty',
    app: aa.mk.butt_clk(['…','action_butt','pa']),
  });

  let convo = aa.m.convos.get(pubkey);
  let count = convo ? convo.messages.children.length : 0;

  let mark_read = make('button',
  {
    cla:'butt m_mark_read',
    con: count,
    tit:'mark read',
    dat:{pubkey},
    clk: aa.m.clk.mark_read,
  });

  return make('header',
  {
    cla:'m_header',
    dat:{pubkey},
    app:[back,' ',link,' ',actions,' ',mark_read],
  })
};


// individual message (simple div, NOT .note)
aa.mk.m_msg =rumor=>
{
  let from_u = aa.u.is_u(rumor.pubkey);
  let cla = 'm_msg' + (from_u ? ' from_u' : '');

  let content = make('div',{cla:'m_content'});
  let parsed = aa.e.content(rumor.content);
  if (parsed) content.append(parsed);
  else content.textContent = rumor.content || '';

  let time = make('span',
  {
    cla:'m_time',
    con: aa.fx.time_elapsed(new Date(rumor.created_at * 1000)),
    tit: new Date(rumor.created_at * 1000).toLocaleString(),
  });

  let inspect = make('button',
  {
    cla:'m_inspect butt tiny',
    con:'i',
    clk: aa.m.clk.inspect,
  });

  let msg = make('div',
  {
    cla,
    dat:{id:rumor.id, stamp:rumor.created_at},
    app:[content, time, ' ', inspect],
  });
  aa.fx.color(rumor.pubkey, msg);
  return msg
};


// draft message in active convo
aa.mk.m_draft =(content,pubkey)=>
{
  let content_el = make('div',{cla:'m_content'});
  let parsed = aa.e.content(content);
  if (parsed) content_el.append(parsed);
  else content_el.textContent = content || '';
  let send = make('button',{cla:'butt exe', con:'send', clk:aa.m.clk.send});
  let cancel = make('button',{cla:'butt no', con:'cancel', clk:aa.m.clk.cancel});
  let actions = make('div',{cla:'m_actions', app:[send,' ',cancel]});

  return make('div',
  {
    cla:'m_msg m_draft from_u',
    dat:{pubkey},
    app:[content_el, actions],
  })
};


// pending convo item in left panel
aa.mk.m_pending_item =()=>
{
  let label = make('span',{cla:'m_pending_label', con:'pending'});
  let unread = make('span',{cla:'m_convo_unread'});
  return make('div',
  {
    cla:'m_convo_item m_pending_convo',
    dat:{pubkey:'_pending'},
    app:[label, unread],
    clk: aa.m.clk.select,
  })
};


// pending view header
aa.mk.m_pending_header =()=>
{
  let back = make('button',{cla:'butt m_back', con:'<', clk: aa.m.clk.back});
  let label = make('span',{con:'pending'});
  let batch = make('button',{cla:'butt exe', con:'decrypt 5', clk: aa.m.clk.decrypt_batch});
  let all = make('button',{cla:'butt exe', con:'decrypt all', clk: aa.m.clk.decrypt_all});

  return make('header',
  {
    cla:'m_header m_pending_header',
    app:[back,' ',label,' ',batch,' ',all],
  })
};


// pending gift wrap item
aa.mk.m_pending_wrap =(id, dat)=>
{
  let event = dat.event;
  let id_el = make('span',{cla:'m_pending_id mono', con: id.slice(0,12)+'\u2026', tit:id});
  let pk = make('span',{cla:'m_pending_pk mono', con: event.pubkey.slice(0,12)+'\u2026', tit:event.pubkey});
  let time = make('span',{cla:'m_time', con: aa.fx.time_elapsed(new Date(event.created_at * 1000))});
  let btn = make('button',{cla:'butt exe tiny', con:'decrypt', dat:{id}, clk: aa.m.clk.decrypt_one});

  return make('div',
  {
    cla:'m_pending_wrap',
    dat:{id},
    app:[id_el,' ',pk,' ',time,' ',btn],
  })
};


// inspect dialog showing decrypt chain
aa.mk.m_inspect =rumor_id=>
{
  let entry = aa.m.chain.get(rumor_id);
  if (!entry)
  {
    aa.log('chain not found for '+rumor_id);
    return
  }

  let dialog = aa.el.get('dialog');
  if (!dialog) return;

  let el = make('div',{cla:'m_inspect_wrap'});

  let close = make('button',{cla:'butt no', con:'close', clk:()=> dialog.close()});
  let header = make('header',{app:[make('h3',{con:'message chain'}),' ',close]});
  el.append(header);

  // rumor
  el.append(make('details',
  {
    cla:'chain_section',
    app:
    [
      make('summary',{con:'rumor (kind 14)'}),
      make('pre',{con: JSON.stringify(entry.rumor,null,2)}),
    ],
  }));

  // seal
  if (entry.seal)
  {
    el.append(make('details',
    {
      cla:'chain_section',
      app:
      [
        make('summary',{con:'seal (kind 13)'}),
        make('pre',{con: JSON.stringify(entry.seal,null,2)}),
      ],
    }));
  }

  // gift wraps
  let from_u = aa.u.is_u(entry.rumor.pubkey);
  for (const wrap_id of entry.wrap_ids || [])
  {
    let event = entry.wraps?.[wrap_id];
    let cc = from_u && event?.tags && aa.u.is_u(aa.fx.tag_value(event.tags,'p'));
    let summary = `gift wrap (kind 1059)${cc ? ' (cc)' : ''}`;
    let con = event ? JSON.stringify(event,null,2) : wrap_id;
    el.append(make('details',
    {
      cla:'chain_section',
      app:
      [
        make('summary',{con: summary}),
        make('pre',{con}),
      ],
    }));
  }

  fastdom.mutate(()=>
  {
    dialog.textContent = '';
    dialog.append(el);
    dialog.showModal();
  });
};
