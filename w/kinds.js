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
  let note = aa.e.kinds[7374](dat);
  let butt = aa.mk.butt_action(aa.w.def.id+' proofs '+dat.event.id,'import');
  setTimeout(()=>{ note.querySelector('.content').append(butt) },200);
  return note
};


aa.e.kinds[7376] = aa.e.kinds[7374];


// event template for nutzap
aa.e.kinds[9321] =dat=>
{
  const note = aa.mk.note(dat);
  let p_x = aa.fx.tag_value(dat.event.tags,'p');
  let e_id = aa.fx.tag_value(dat.event.tags,'e');
  if (aa.u.is_u(p_x) && !aa.w.is_redeemed(dat.event.id))
  {
    aa.w.save();
    setTimeout(async()=>
    {
      let log = `nutzapped +${amount} by `;
      log += await aa.p.author(dat.event.pubkey);
      if (e_id) log += ` for ${e_id}`;
      aa.log(log);
    },0);
  }
  aa.e.append_to(dat,note,aa.fx.tag_reply(dat.event.tags));
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


// event template for walLNut 
aa.e.kinds[17375] =dat=>
{
  const note = aa.e.note_regular(dat);
  // note.querySelector('.tags_wrapper')?.setAttribute('open','');
  if (aa.u.is_u(dat.event.pubkey))
  {
    let p = aa.u.p;
    if (p && aa.p.events_newer(p,dat.event))
    {
      aa.p.save(p);
    }
    let butt = aa.mk.butt_action(aa.w.def.id+' import '+dat.event.id,'import');
    setTimeout(()=>{ note.querySelector('.content').append(butt) },200);
  }
  return note
};


aa.e.kinds[37375] = aa.e.kinds[17375];