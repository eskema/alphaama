// event template for walLNut proofs
aa.e.kinds[7374] =dat=>
{
  const note = aa.mk.note(dat);
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  // note.querySelector('.tags_wrapper')?.setAttribute('open','');
  if (aa.u.is_u(dat.event.pubkey))
  {
    let p = aa.u.p;
    if (aa.p.events_newer(p,dat.event)) aa.p.save(p);
  }
  aa.e.append_check(dat,note,aa.fx.tag_reply(dat.event.tags));
  return note
};

aa.e.kinds[7375] =dat=>
{
  const note = aa.e.note_regular(dat);
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  if (aa.u.is_u(dat.event.pubkey))
  {
    let butt = aa.mk.butt_action(aa.w.def.id+' proofs '+dat.event.id,'import');
    setTimeout(()=>{ note.querySelector('.content')?.append(butt) },200);
  }
  return note
};


aa.e.kinds[7376] = aa.e.kinds[7374];


// event template for nutzap
aa.e.kinds[9321] =dat=>
{
  let note = aa.mk.note(dat);
  note.classList.add('tiny');
  let p_x = aa.fx.tag_value(dat.event.tags,'p');
  let e_id = aa.fx.tag_value(dat.event.tags,'e');
  let mint_url = aa.fx.tag_value(dat.event.tags,'u');

  // extract proofs and amount from proof tags
  let proofs = [];
  let amount = 0;
  for (const tag of dat.event.tags)
  {
    if (tag[0] === 'proof' && tag[1])
    {
      try
      {
        let proof = aa.pj(tag[1]);
        if (proof) { proofs.push(proof); amount += proof.amount || 0 }
      }
      catch(e) {}
    }
  }

  // append to parent event if tagged, otherwise root
  let tag_reply = aa.fx.tag_reply(dat.event.tags);
  if (tag_reply) aa.e.append_check(dat,note,tag_reply);
  else aa.e.append_as_root(note);

  // if addressed to us, try to redeem
  if (aa.u.is_u(p_x))
  {
    setTimeout(async()=>
    {
      let redeemed = await aa.w.is_redeemed(dat.event.id);
      if (redeemed) return;

      let log = `w: nutzapped +${amount} by `;
      let p = await aa.p.author(dat.event.pubkey);
      log += aa.p.author_name(p);
      if (e_id) log += ` for ${e_id}`;
      aa.log(log);

      // auto-redeem: swap proofs for fresh ones
      if (proofs.length && mint_url && aa.w.o?.enabled)
      {
        try
        {
          let {wallet} = await aa.w.get_active(mint_url);
          if (!wallet)
          {
            // mint not added yet, try to add it
            aa.w.add(mint_url);
            let r = await aa.w.get_active(mint_url);
            wallet = r.wallet;
          }
          if (wallet)
          {
            let p2pk = aa.w.o.ls.p2pk;
            let privkey = p2pk ? await aa.u.decrypt_cache.get_key(p2pk) : null;
            let token = {mint:mint_url,proofs,unit:'sat'};
            let fresh = await wallet.receive(token,privkey ? {privkey} : {});
            if (fresh?.length)
            {
              await aa.w.proofs_in(fresh,mint_url);
              aa.w.tx_log('nzap_recv',amount,mint_url,dat.event.id);
              aa.w.mark_redeemed(dat.event.id);
              await aa.w.save();
              aa.log('w: redeemed nutzap +' + amount);
            }
          }
        }
        catch(err) { aa.log('w: redeem failed: ' + err.message) }
      }
    },0);
  }
  return note
};


// event template for walLNut discovery
aa.e.kinds[10019] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root');
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  // note.querySelector('.tags_wrapper')?.setAttribute('open','');
  aa.p.get(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      let relays = {};
      let sets = ['k10019'];
      let tags = dat.event.tags.filter(i=>i[0]==='relay');
      for (const tag of tags)
      {
        const [type,url,permission] = tag;
        const href = aa.fx.url(url)?.href;
        if (!href) continue;
        relays[href] = {sets};
      }
      aa.p.relays_add(relays,p);
      if (aa.u.is_u(dat.event.pubkey)) aa.r.add_from_o(relays);
      p.mints = aa.fx.tags_values(dat.event.tags,'mint');
      p.p2pk = aa.fx.tag_value(dat.event.tags,'pubkey');
      aa.p.save(p);
    }
  });
  return note
};


// event template for wallnut config
aa.e.kinds[17375] =dat=>
{
  const note = aa.e.note_regular(dat);
  if (aa.u.is_u(dat.event.pubkey))
  {
    let p = aa.u.p;
    if (p && aa.p.events_newer(p,dat.event)) aa.p.save(p);

    let stored = aa.w.o?.kind_17375;
    let label;
    if (stored?.id === dat.event.id)
      label = make('span',{con:'active',cla:'tag'});
    else if (stored && dat.event.created_at < stored.created_at)
      label = make('span',{con:'older',cla:'tag'});
    else
    {
      // newer or no stored — auto-import and mark active
      aa.w.import(dat.event.id);
      label = make('span',{con:'active',cla:'tag'});
    }

    setTimeout(()=>{ note.querySelector('.content')?.append(label) },200);
  }
  return note
};


// addressable wallet (old format) — prompt migration to 17375
aa.e.kinds[37375] =dat=>
{
  const note = aa.e.note_regular(dat);
  if (aa.u.is_u(dat.event.pubkey))
  {
    let p = aa.u.p;
    if (p && aa.p.events_newer(p,dat.event)) aa.p.save(p);

    // always show "old" label on the note itself
    setTimeout(()=>{ note.querySelector('.content')?.append(make('span',{con:'old format',cla:'tag'})) },200);

    // prompt migration if not already migrated to 17375
    let stored = aa.w.o?.kind_17375;
    if (!stored || stored.kind === 37375)
    {
      // import this event first so mints/keys are available
      aa.w.import(dat.event.id).then(()=>
      {
        let migrate = make('button',
        {
          con:'migrate to kind:17375',
          cla:'butt exe',
          clk:async()=>
          {
            aa.log('wallnut: migrating from kind:37375 to kind:17375…');
            await aa.mk.k17375();
            // the new event will arrive via print_q and become importable
            // auto-import: find the newest 17375 we just created
            setTimeout(async()=>
            {
              let p = aa.u.p;
              let k17375_id = aa.p.events_last(p,'k17375');
              if (k17375_id) await aa.w.import(k17375_id);
              aa.log('wallnut: migration complete');
            },2000);
          }
        });
        aa.log(make('p',
        {
          con:'wallnut: kind:37375 is deprecated. ',
          app:[migrate]
        }));
      });
    }
  }
  return note
};