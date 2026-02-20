// view for npub
aa.view.ls.npub1 =async npub=>
{
  aa.view.active = npub;
  const k = 'pubkey';
  let pubkey = aa.fx.decode(npub);
  let p = await aa.p.author(pubkey);
  let profile = aa.mk.profile(p);
  if (!profile.classList.contains('upd')) aa.p.profile_upd(p);
  aa.view.in_view = profile;
  
  fastdom.mutate(()=>
  {
    profile.classList.add('in_view');
    aa.l.classList.add('viewing','view_p');
    
  });

  let ids = [];
  let items = [];
  let refs = aa.temp.p_link.get(pubkey)?.elements;
  if (refs) for (const ref of refs)
  {
    let el = ref.deref();
    if (!el) continue;
    let note = el.closest('.note');
    if (note && !ids.includes(note.dataset.id)) items.push(note);
  }
  let solo_value = 'pubkey_'+pubkey;
  let e_opts = aa.temp.section_e;
  if (e_opts)
  {
    e_opts.solo =
    {
      match: item=> item.dataset.pubkey === pubkey,
      value: solo_value,
      cla: 'note'
    };
  }
  if (items.length)
  {
    sift.solo_add(items,solo_value,aa.e.l,'note');
  }

  setTimeout(()=>{aa.fx.scroll(profile)},400);
};

// view for nprofile
aa.view.ls.nprofile1 =async nprofile=>
{
  let data = aa.fx.decode(nprofile);
  if (!data?.pubkey) return;
  if (data.relays?.length)
  {
    let p = await aa.p.author(data.pubkey);
    let relays = {};
    for (const url of data.relays)
    {
      relays[url] = {sets:['nprofile']};
    }
    aa.p.relays_add(relays,p);
    aa.p.save(p);
  }
  let npub = aa.fx.encode('npub',data.pubkey);
  aa.view.ls.npub1(npub);
};