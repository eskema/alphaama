// m module click handlers

aa.m.clk = {};


// select conversation from list
aa.m.clk.select =e=>
{
  let item = e.target.closest('.m_convo_item');
  if (!item) return;
  let pubkey = item.dataset.pubkey;
  if (pubkey === '_pending')
  {
    aa.view.state('#m_pending');
    return
  }
  let npub = aa.fx.encode('npub',pubkey);
  aa.view.state('#m_'+npub);
};


// inspect message chain
aa.m.clk.inspect =e=>
{
  let msg = e.target.closest('.m_msg');
  if (!msg) return;
  aa.mk.m_inspect(msg.dataset.id);
};


// send draft message
aa.m.clk.send =async e=>
{
  let draft = e.target.closest('.m_draft');
  if (!draft) return;
  let pubkey = draft.dataset.pubkey;
  let content = draft.querySelector('.m_content')?.textContent || '';
  if (!content.trim()) return;
  if (!aa.signer.available()) return aa.log('signer needed');

  draft.remove();
  aa.m.clk.send_msg(content, pubkey);
};


// send message content to pubkey
aa.m.clk.send_msg =async(content, pubkey)=>
{
  if (!content || !pubkey) return;
  if (!aa.signer.available()) return aa.log('signer needed');

  let rumor = aa.fx.normalise_event(
  {
    kind: 14,
    content,
    tags: [['p',pubkey]],
  });
  rumor.id = aa.fx.hash(rumor);

  // show immediately as sent message
  let msg = aa.mk.m_msg(rumor);
  msg.classList.add('m_sending');
  let convo = aa.m.convo(pubkey);
  fastdom.mutate(()=>{ convo.messages.append(msg) });

  let ok = await aa.m.send(rumor, pubkey);
  fastdom.mutate(()=>
  {
    if (ok) msg.classList.replace('m_sending','m_sent');
    else
    {
      msg.classList.replace('m_sending','m_failed');
      msg.append(make('span',{cla:'m_error', con:'send failed'}));
    }
  });
};


// cancel draft
aa.m.clk.cancel =e=>
{
  let draft = e.target.closest('.m_draft');
  if (draft) draft.remove();
};


// toggle expanded panel
aa.m.clk.expand =e=>
{
  let on = aa.m.l.classList.toggle('expanded');
  e.target.textContent = on ? 'compact' : 'expand';
  sessionStorage.m_panel = on ? 'expanded' : '';
};


// mark conversation as read
aa.m.clk.mark_read =e=>
{
  let pubkey = e.target.closest('[data-pubkey]')?.dataset.pubkey;
  if (!pubkey) return;
  aa.m.mark_read(pubkey);
};


// decrypt single pending gift wrap
aa.m.clk.decrypt_one =async e=>
{
  let id = e.target.closest('[data-id]')?.dataset.id;
  if (!id) return;
  let dat = aa.m.pending.get(id);
  if (!dat) return;
  aa.m.pending.delete(id);
  let ok = await aa.m.unwrap(dat, true);
  if (!ok) await aa.u.decrypt_cache.fail(id);
  let idx = aa.m.o.pending.indexOf(id);
  if (idx !== -1)
  {
    aa.m.o.pending.splice(idx, 1);
    aa.m.save_pending();
  }
  let el = aa.m.view_el.querySelector('.m_pending_wrap[data-id="'+id+'"]');
  if (el) fastdom.mutate(()=>{ el.remove() });
  aa.m.pending_upd();
};


// decrypt batch of 5 pending
aa.m.clk.decrypt_batch =()=> aa.m.decrypt_pending(5);


// decrypt all pending
aa.m.clk.decrypt_all =()=> aa.m.decrypt_pending(aa.m.pending.size);
