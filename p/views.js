// view for npub
aa.views.npub1 =async npub=>
{
  aa.viewing = npub;
  const k = 'pubkey';
  let v = aa.fx.decode(npub);
  let p = await aa.p.author(v);
  let profile = aa.mk.profile(p);
  if (!profile.classList.contains('upd')) aa.p.profile_upd(p);
  aa.in_view = profile;
  
  fastdom.mutate(()=>
  {
    profile.classList.add('in_view');
    aa.l.classList.add('viewing','view_p');
    aa.fx.scroll(l);
  });

  let ids = [];
  let items = [];
  let refs = [...aa.temp.p_link].find(i=>i.pubkey===v)?.a;
  for (const i of refs)
  {
    let note = i.closest('.note');
    if (note && !ids.includes(note.dataset.id)) items.push(note);
  }
  if (items.length)
  {
    const k_v = k+'_'+aa.fx.an(v);
    aa.p.viewing = [items,k_v];
    aa.i.filter_solo_apply(...aa.p.viewing);
  }
};

// view for nprofile
aa.views.nprofile1 =async nprofile=>
{

};