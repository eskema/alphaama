// m DOM creators


// m section for #view
aa.mk.section_m =()=>
{
  let section = aa.mk.section(
  {
    id:'m', name:'m', element:aa.m.l,
    clk: e=>
    {
      let s = aa.el.get('section_m');
      let collapsing = s?.classList.contains('expanded');
      aa.clk.expand(e);
      aa.m.restore();
      if (collapsing && aa.m.active) aa.m.view_clear();
    }
  });

  section.firstElementChild.append(make('h2', {con:'nip17 messages'}));

  // buttons go in the chat_header (inside the panel), not the section header
  if (aa.m.chat?.header_el)
  {
    aa.m.chat.header_el.append(aa.mk.butt_action('m get','get'), ' ', aa.mk.butt_action('m new ','new'), ' ', aa.m.chat.compact_btn);
  }

  aa.m.count_upd();
  return section
};


// conversation list item for left panel
aa.mk.m_convo_item =pubkey=>
{
  let base = aa.mk.chat_item(pubkey, {cla:'m_convo_item'});
  // add m-specific aliases + classes for backward compat with m.css
  base.preview.classList.add('m_convo_preview');
  base.time.classList.add('m_convo_time');
  base.count.classList.add('m_convo_unread');
  base.count.textContent = '0';
  // m uses its own click handler (not chat_list delegation)
  base.el.addEventListener('click', aa.m.clk.select);
  return base.el;
};


// conversation header for right panel
aa.mk.m_convo_header =pubkey=>
{
  let back = make('a',
  {
    cla:'butt chat_back m_back',
    con:'x',
    ref:'/',
    tit:'close conversation',
    clk: aa.clk.a,
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
    cla:'butt chat_mark_read m_mark_read',
    con: count,
    tit:'mark read',
    dat:{pubkey},
    clk: aa.m.clk.mark_read,
  });

  return make('header',
  {
    cla:'chat_view_header m_header',
    dat:{pubkey},
    app:[link,' ',mark_read,' ',actions,' ',back],
  })
};


// individual message (simple div, NOT .note)
aa.mk.m_msg =rumor=>
{
  let from_u = aa.u.is_u(rumor.pubkey);
  let cla = 'chat_msg m_msg' + (from_u ? ' from_u' : '');

  let content = make('div',{cla:'chat_msg_content m_content'});
  let parsed = aa.e.content(rumor.content);
  if (parsed) content.append(parsed);
  else content.textContent = rumor.content || '';

  let time = make('span',
  {
    cla:'chat_msg_time m_time',
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
  let content_el = make('div',{cla:'chat_msg_content m_content'});
  let parsed = aa.e.content(content);
  if (parsed) content_el.append(parsed);
  else content_el.textContent = content || '';
  let send = make('button',{cla:'butt exe', con:'send', clk:aa.m.clk.send});
  let cancel = make('button',{cla:'butt no', con:'cancel', clk:aa.m.clk.cancel});
  let actions = make('div',{cla:'m_actions', app:[send,' ',cancel]});

  return make('div',
  {
    cla:'chat_msg m_msg m_draft from_u',
    dat:{pubkey},
    app:[content_el, actions],
  })
};


// pending convo item in left panel
aa.mk.m_pending_item =()=>
{
  let item = aa.mk.chat_item(null, {label:'pending', key:'_pending', cla:'m_convo_item m_pending_convo'});
  item.preview.textContent = 'awaiting decryption';
  item.count.classList.add('m_convo_unread');
  item.count.classList.remove('hidden');
  item.count.textContent = '0';
  item.el.addEventListener('click', aa.m.clk.select);
  return item.el;
};


// pending view header
aa.mk.m_pending_header =()=>
{
  let back = make('a',{cla:'butt chat_back m_back', con:'x', ref:'/', clk: aa.clk.a});
  let label = aa.mk.p_link_stub('pending');
  let batch = make('button',{cla:'butt exe', con:'decrypt 5', clk: aa.m.clk.decrypt_batch});
  let all = make('button',{cla:'butt exe', con:'decrypt all', clk: aa.m.clk.decrypt_all});
  let actions = make('span',{cla:'chat_actions', app:[batch,' ',all]});

  return make('header',
  {
    cla:'chat_view_header m_header m_pending_header',
    app:[label,' ',actions,' ',back],
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
