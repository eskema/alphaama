// view for npub
aa.views.npub1 =async npub=>
{
  aa.viewing = npub;
  const k = 'pubkey';
  let v = aa.fx.decode(npub);
  let p = await aa.p.author(v);
  let l = aa.p.profile(p);
  if (!l.classList.contains('upd')) aa.p.profile_upd(p);

  fastdom.mutate(()=>
  {
    l.classList.add('in_view');
    aa.in_view = l;
    aa.l.classList.add('viewing','view_p');
    aa.fx.scroll(l);
  });


  // let items = aa.get.index_items(k,v);
  // const k_v = k+'_'+aa.fx.an(v);
  // aa.p.viewing = [items,k_v];
  // aa.i.filter_solo_apply(items,k_v);
};

// view for nprofile
aa.views.nprofile1 =async nprofile=>
{

};