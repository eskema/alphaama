// view for npub
aa.view.ls.npub1 =async npub=>
{
  aa.view.active = npub;
  const k = 'pubkey';
  let v = aa.fx.decode(npub);
  let p = await aa.p.author(v);
  let profile = aa.mk.profile(p);
  if (!profile.classList.contains('upd')) aa.p.profile_upd(p);
  aa.view.in_view = profile;
  
  fastdom.mutate(()=>
  {
    profile.classList.add('in_view');
    aa.l.classList.add('viewing','view_p');
    setTimeout(()=>{aa.fx.scroll(profile)},200);
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
aa.view.ls.nprofile1 =async nprofile=>
{

};