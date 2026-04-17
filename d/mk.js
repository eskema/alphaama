/*

alphaama
mod    d
DOM creators — uses aa.mk.chat_list for the two-panel layout

*/

aa.d.mk = {};

aa.d.mk.panel =()=>
{
  let chat = aa.mk.chat_list(
  {
    id: 'd',
    persist_expand: 'd_panel',
    on_select: key =>
    {
      // clicking the already-active item clears instead of toggling back
      if (aa.d.active === key) { aa.d.view_clear(); return; }
      aa.view.state('#d_' + key);
    },
  });

  aa.d.chat = chat;

  // header buttons — compact_btn from chat_list, always last
  let create_btn = aa.mk.butt_action('d invite', 'create');
  create_btn.title = 'create a new invite link';
  let join_btn = aa.mk.butt_action('d join ', 'join');
  join_btn.title = 'join a session — paste the invite URL after this';
  chat.header_el.append(create_btn, ' ', join_btn, ' ', chat.compact_btn);

  let info = make('div', {cla:'d_info'});

  // ----- info bar -----

  const refresh_info =()=>
  {
    let logged = aa.u?.p?.pubkey ? aa.u.p.pubkey.slice(0,12) + '…' : 'not logged in';
    let sessions = aa.d.live?.sessions.size ?? 0;
    let invites = aa.d.live?.invites.size ?? 0;
    let pending = aa.d.live?.pending.size ?? 0;
    let device = aa.d.o?.device_id ? ' · ' + aa.d.o.device_id.slice(0,8) + '…' : '';
    info.textContent = `${logged}${device} · ${sessions} session(s) · ${invites} invite(s) · ${pending} pending`;
  };

  // ----- sidebar: summary items + sessions -----

  const refresh_list =()=>
  {
    chat.list_el.textContent = '';

    // invites summary — shows all invites (including revoked) so the user has the full picture
    let inv_count = Object.keys(aa.d.o?.invites || {}).length;
    if (inv_count)
    {
      let item = aa.mk.chat_item(null, {label:'invites', key:'invites', cla:'d_summary'});
      item.preview.textContent = 'manage invite links';
      item.count.textContent = inv_count;
      item.count.classList.remove('hidden');
      chat.add('invites', item.el);
    }

    // pending summary
    let pend_count = aa.d.live?.pending.size ?? 0;
    if (pend_count)
    {
      let item = aa.mk.chat_item(null, {label:'pending', key:'pending', cla:'d_summary'});
      item.count.textContent = pend_count;
      item.count.classList.remove('hidden');
      chat.add('pending', item.el);
    }

    // sessions — use shared chat_item with p_link, preview, time, count
    for (let [peer, entry] of (aa.d.live?.sessions || []))
    {
      let item = aa.mk.chat_item(peer, {cla:'d_session'});
      // populate preview with last message
      let last = entry.history[entry.history.length - 1];
      if (last)
      {
        let prefix = last.dir === 'in' ? '← ' : '→ ';
        item.preview.textContent = prefix + (last.text || '').slice(0, 60);
        item.time.textContent = last.ts ? aa.fx.time_elapsed(new Date(last.ts)) : '';
        item.el.dataset.stamp = last.ts || 0;
      }
      let unread = aa.d.unread(peer);
      if (unread) { item.count.textContent = unread; item.count.classList.remove('hidden'); }
      chat.add(peer, item.el);
    }

    if (!inv_count && !pend_count && !aa.d.live?.sessions.size)
    {
      chat.list_el.append(make('li', {cla:'d_empty', con:'no activity yet'}));
    }
  };

  // ----- main pane views -----

  const mk_close =()=> make('a',
  {
    cla:'butt chat_back',
    con:'x',
    ref:'/',
    tit:'close',
    clk: aa.clk.a,
  });

  const refresh_view =()=>
  {
    let sel = aa.d.active;
    if (sel === 'invites')  return render_invites();
    if (sel === 'pending')  return render_pending();
    if (sel && aa.d.live.sessions.has(sel)) return render_thread(sel);
    chat.clear_view();
  };

  const render_invites =()=>
  {
    let header = make('header', {cla:'chat_view_header'});
    header.append(mk_close(), ' ', aa.mk.p_link_stub('invites'));

    let content = make('div', {cla:'d_invite_list'});
    let all = Object.entries(aa.d.o.invites || {});
    if (!all.length)
    {
      content.append(make('div', {cla:'d_placeholder', con:'no invites yet'}));
      chat.set_view(header, content);
      return;
    }

    for (let [secret, saved] of all)
    {
      let row = make('div', {cla:'d_invite_detail'});
      let accepted = saved.accepted_by?.length || 0;
      let revoked = !!saved.revoked_at;
      let live = aa.d.live.invites.has(secret);
      // derive status: if any accepted peer has an active session, it's fulfilled
      let has_session = accepted && saved.accepted_by.some(pk => aa.d.live.sessions.has(pk));
      let status = revoked && !has_session ? 'revoked' : has_session ? `${accepted} joined` : accepted ? `${accepted} joined` : 'waiting';

      let ts = saved.created_at ? Math.floor(saved.created_at / 1000) : 0;
      let time_el = make('time', {cla:'time', con: ts ? aa.fx.time_display_ext(ts) : '?'});

      row.append(
        make('span', {cla:'key', con:secret.slice(0,12) + '…'}),
      );

      if (live) row.append(' ', aa.mk.butt_action('d revoke ' + secret.slice(0,8), 'revoke'));

      row.append(
        ' ',
        make('span', {cla:'val', con:status}),
        ' ',
        time_el,
      );

      if (live && saved.url)
      {
        let url_el = make('input', {type:'text', val:saved.url, cla:'d_invite_url'});
        url_el.readOnly = true;
        url_el.onclick =()=> url_el.select();
        row.append(url_el);
      }

      if (accepted)
      {
        let peers = make('div', {cla:'d_invite_peers'});
        for (let pk of saved.accepted_by)
          peers.append(aa.mk.p_link(pk), ' ');
        row.append(peers);
      }

      if (revoked && !has_session) row.classList.add('revoked');
      content.appendChild(row);
    }
    chat.set_view(header, content);
  };

  const render_pending =()=>
  {
    let header = make('header', {cla:'chat_view_header'});
    header.append(mk_close(), ' ', aa.mk.p_link_stub('pending sessions'));

    let content = make('div', {cla:'d_pending_list'});
    if (!aa.d.live.pending.size)
    {
      content.append(make('div', {cla:'d_placeholder', con:'no pending sessions'}));
      chat.set_view(header, content);
      return;
    }

    for (let [peer, pend] of aa.d.live.pending)
    {
      let row = make('div', {cla:'d_pending_detail'});
      let adopt_btn = aa.mk.butt_action('d adopt ' + peer.slice(0,12), 'adopt');
      let dismiss_btn = aa.mk.butt_action('d dismiss ' + peer.slice(0,12), 'dismiss');
      row.append(
        make('span', {cla:'key', con:pend.label}),
        ' ',
        make('span', {cla:'val', con:peer.slice(0,16) + '…'}),
        ' ',
        adopt_btn,
        ' ',
        dismiss_btn,
      );
      content.appendChild(row);
    }
    chat.set_view(header, content);
  };

  const render_thread =peer=>
  {
    let entry = aa.d.live.sessions.get(peer);
    if (!entry) { chat.clear_view(); return; }

    // header: profile(+pa) | mark_read | chat_actions | close
    let unread = aa.d.unread(peer);
    let profile = aa.mk.author_link(peer);
    let export_btn = aa.mk.butt_action('d export ' + peer.slice(0,12), 'export');
    let actions_toggle = make('button',
    {
      cla:'butt action_butt',
      con:'…',
      clk: e =>
      {
        e.target.closest('.actions').classList.toggle('expanded');
      },
    });
    let actions = make('span', {cla:'actions chat_actions empty', app:[actions_toggle, ' ', export_btn]});
    let mark_read = make('button',
    {
      cla:'butt chat_mark_read m_mark_read',
      con: entry.history.length + (unread ? ' (' + unread + ' new)' : ''),
      tit: 'mark read',
      dat: {pubkey: peer},
      clk: ()=>
      {
        let msgs = chat.view_el.querySelector('.chat_messages');
        if (!msgs) return;
        let new_els = msgs.querySelectorAll('.m_new');
        if (new_els.length)
        {
          for (let el of new_els) el.classList.remove('m_new');
          chat.view_el.classList.add('m_read');
          aa.d.mark_read(peer);
          mark_read.textContent = entry.history.length + '';
          refresh_list();
        }
        else
        {
          chat.view_el.classList.toggle('m_read');
        }
      },
    });
    let header = make('header',
    {
      cla:'chat_view_header',
      dat:{pubkey:peer},
      app:[profile, ' ', mark_read, ' ', actions, ' ', mk_close()],
    });

    // session info bar — ratchet chain state
    let s = entry.session.state || {};
    let skipped = s.skippedKeys ? Object.keys(s.skippedKeys).length : 0;
    let info_bar = make('div', {cla:'d_session_info'});
    info_bar.append(
      make('span', {cla:'val', con:`sent ${s.sendingChainMessageNumber ?? 0} · recv ${s.receivingChainMessageNumber ?? 0} · prev ${s.previousSendingChainMessageCount ?? 0}`}),
      skipped ? make('span', {cla:'val', con:` · skipped ${skipped}`}) : '',
    );

    // messages area
    let messages = make('div', {cla:'chat_messages'});
    if (!entry.history.length)
    {
      messages.append(make('div', {cla:'d_placeholder', con:'no messages yet — send one'}));
      chat.set_view(header, info_bar, messages);
      return;
    }

    let seen_ts = aa.d.o.seen?.[peer] || 0;

    for (let item of entry.history)
    {
      let is_new = (item.ts || 0) > seen_ts;

      // system/info messages
      if (item.dir === 'sys')
      {
        messages.appendChild(make('div', {cla:'chat_sys' + (is_new ? ' m_new' : ''), con:item.text, tit: item.ts ? new Date(item.ts).toLocaleString() : ''}));
        continue;
      }

      let from_u = item.dir === 'out';
      let cla = 'chat_msg m_msg' + (from_u ? ' from_u' : '');
      if (is_new) cla += ' m_new';
      if (item.recovered) cla += ' recovered';

      let content_el = make('div', {cla:'chat_msg_content'});
      let parsed = aa.e?.content?.(item.text);
      if (parsed) content_el.append(parsed);
      else content_el.textContent = item.text || '';

      let time_el = make('button',
      {
        cla:'chat_msg_time chat_inspect butt tiny',
        con: item.ts ? aa.fx.time_elapsed(new Date(item.ts)) : '',
        tit: item.ts ? new Date(item.ts).toLocaleString() + ' — click to inspect' : 'inspect',
        clk: e =>
        {
          let id = e.target.closest('.chat_msg')?.dataset.id;
          if (id) d_inspect(id);
        },
      });

      let msg = make('div', {cla, dat:{id: item.id, stamp: item.ts || 0}});
      msg.append(content_el, ' ', time_el);
      if (item.recovered) msg.append(' ', make('span', {cla:'tag', con:'↺'}));
      aa.fx.color(from_u ? aa.u?.p?.pubkey : peer, msg);
      messages.appendChild(msg);
    }
    // re-append draft if one exists for this peer
    if (aa.d._draft?.peer === peer)
      messages.appendChild(mk_draft(aa.d._draft.text, peer));

    chat.set_view(header, info_bar, messages);
    let last = messages.lastElementChild;
    if (last) last.scrollIntoView({block:'start'});
  };

  // draft message — mirrors m's m_draft pattern
  const mk_draft =(text, peer)=>
  {
    let content_el = make('div', {cla:'chat_msg_content'});
    let parsed = aa.e?.content?.(text);
    if (parsed) content_el.append(parsed);
    else content_el.textContent = text || '';

    let send = make('button',
    {
      cla:'butt exe',
      con:'send',
      clk: async()=>
      {
        let t = aa.d._draft?.text;
        aa.d._draft = null;
        if (t) await aa.d.send(peer, t);
        refresh_view();
      },
    });

    let cancel = make('button',
    {
      cla:'butt no',
      con:'cancel',
      clk: ()=>
      {
        aa.d._draft = null;
        refresh_view();
      },
    });

    let actions = make('div', {cla:'chat_draft_actions', app:[send, ' ', cancel]});
    let draft = make('div',
    {
      cla:'chat_msg chat_draft from_u',
      app:[content_el, actions],
    });
    aa.fx.color(aa.u?.p?.pubkey, draft);
    return draft;
  };

  // inspect dialog — shows raw rumor + outer 1060 event structure
  const d_inspect =id=>
  {
    let ev = aa.d.o.events?.[id];
    if (!ev) { aa.log('[d] no stored event for ' + id); return; }

    let dialog = aa.el.get('dialog');
    if (!dialog) return;

    let el = make('div', {cla:'m_inspect_wrap'});
    let close = make('button', {cla:'butt no', con:'close', clk:()=> dialog.close()});
    el.append(make('header', {app:[make('h3', {con:'event chain'}), ' ', close]}));

    // inner rumor
    if (ev.rumor)
    {
      el.append(make('details',
      {
        cla:'chain_section',
        app:
        [
          make('summary', {con:`rumor (kind ${ev.rumor.kind})`}),
          make('pre', {con: JSON.stringify(ev.rumor, null, 2)}),
        ],
      }));
    }

    // outer kind 1060
    if (ev.outer)
    {
      el.append(make('details',
      {
        cla:'chain_section',
        app:
        [
          make('summary', {con:`outer (kind ${ev.outer.kind})`}),
          make('pre', {con: JSON.stringify(ev.outer, null, 2)}),
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

  // ----- bus listeners -----

  const refresh_all =()=> { refresh_list(); refresh_view(); refresh_info(); aa.d.count_upd(); };

  aa.bus.on('d:draft', ()=> refresh_view());

  aa.bus.on('d:recv', ev =>
  {
    if (ev.peer === aa.d.active) refresh_view();
    refresh_list();
    refresh_info();
  });

  aa.bus.on('d:sent', ev =>
  {
    if (ev.peer === aa.d.active) refresh_view();
    refresh_list();
  });

  aa.bus.on('d:session_open', refresh_all);

  aa.bus.on('d:session_close',       refresh_all);
  aa.bus.on('d:restored',            refresh_all);
  aa.bus.on('d:pending_session',     refresh_all);
  aa.bus.on('d:pending_adopted',     refresh_all);
  aa.bus.on('d:pending_dismissed',   refresh_all);
  aa.bus.on('d:invite_created',      ()=> { aa.view.state('#d_invites'); refresh_all(); });
  aa.bus.on('d:invite_revoked',      refresh_all);
  aa.bus.on('d:view_open',           ()=> { refresh_list(); refresh_view(); });
  aa.bus.on('d:history_merged', ev =>
  {
    aa.log(`[d] merged ${ev.added} item(s) from peer ${ev.peer.slice(0,8)}`);
    if (ev.peer === aa.d.active) refresh_view();
    refresh_list();
    refresh_info();
  });

  // initial render
  refresh_info();
  refresh_list();

  return chat.l;
};
