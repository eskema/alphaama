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

  let e_opts = aa.temp.section_e;
  if (e_opts) sift.filter(e_opts,{pubkey});

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