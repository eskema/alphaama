// dm module click handlers

aa.dm.clk = {};


// select conversation from list
aa.dm.clk.select =e=>
{
  let item = e.target.closest('.dm_convo_item');
  if (!item) return;
  let pubkey = item.dataset.pubkey;
  if (pubkey === '_pending')
  {
    aa.dm.open_pending();
    return
  }
  let npub = aa.fx.encode('npub',pubkey);
  aa.view.state('#dm_'+npub);
};


// inspect message chain
aa.dm.clk.inspect =e=>
{
  let msg = e.target.closest('.dm_msg');
  if (!msg) return;
  aa.mk.dm_inspect(msg.dataset.id);
};


// send draft message
aa.dm.clk.send =async e=>
{
  let draft = e.target.closest('.dm_draft');
  if (!draft) return;
  let pubkey = draft.dataset.pubkey;
  let content = draft.querySelector('.dm_content')?.textContent || '';
  if (!content.trim()) return;

  draft.remove();
  aa.dm.clk.send_msg(content, pubkey);
};


// send message content to pubkey
aa.dm.clk.send_msg =async(content, pubkey)=>
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
  let msg = aa.mk.dm_msg(rumor);
  msg.classList.add('dm_sending');
  let convo = aa.dm.convo(pubkey);
  fastdom.mutate(()=>{ convo.messages.append(msg) });

  let ok = await aa.dm.send(rumor, pubkey);
  fastdom.mutate(()=>
  {
    if (ok) msg.classList.replace('dm_sending','dm_sent');
    else
    {
      msg.classList.replace('dm_sending','dm_failed');
      msg.append(make('span',{cla:'dm_error', con:'send failed'}));
    }
  });
};


// cancel draft
aa.dm.clk.cancel =e=>
{
  let draft = e.target.closest('.dm_draft');
  if (draft) draft.remove();
};


// close conversation, go back to list
aa.dm.clk.back =()=>
{
  aa.view.clear();
};


// mark conversation as read
aa.dm.clk.mark_read =e=>
{
  let pubkey = e.target.closest('[data-pubkey]')?.dataset.pubkey;
  if (!pubkey) return;
  aa.dm.mark_read(pubkey);
};


// decrypt single pending gift wrap
aa.dm.clk.decrypt_one =async e=>
{
  let id = e.target.closest('[data-id]')?.dataset.id;
  if (!id) return;
  let dat = aa.dm.pending.get(id);
  if (!dat) return;
  aa.dm.pending.delete(id);
  let ok = await aa.dm.unwrap(dat);
  if (!ok) await aa.u.decrypt_cache.fail(id);
  let el = aa.dm.view_el.querySelector('.dm_pending_wrap[data-id="'+id+'"]');
  if (el) fastdom.mutate(()=>{ el.remove() });
  aa.dm.pending_upd();
};


// decrypt batch of 5 pending
aa.dm.clk.decrypt_batch =()=> aa.dm.decrypt_pending(5);


// decrypt all pending
aa.dm.clk.decrypt_all =()=> aa.dm.decrypt_pending(aa.dm.pending.size);
