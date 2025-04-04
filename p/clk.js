aa.clk.pa =e=>
{
  let l = e.target.closest('.actions');
  let profile = l.closest('article');
  let x = profile.dataset.pubkey;
  if (l.classList.contains('empty'))
  {
    let butts = 
    [
      [`${profile.dataset.trust}`,'p_score'],
      ['get_notes','p_req'],
      ['refresh','p_refresh']
    ];
    if (!aa.is.u(x)) butts.push([aa.is.following(x)?'del':'add','k3']);
    for (const s of butts) l.append(' ',aa.mk.clk_butt(s));
    l.classList.remove('empty');
  }
  l.classList.toggle('expanded');
};

// follow / unfollow
aa.clk.k3 =async e=>
{
  const x = e.target.closest('.profile').dataset.pubkey;
  const dis = e.target.textContent;
  if (dis === 'del') 
  {
    // aa.p.del(x);
    aa.cli.add('p del '+x)
  }
  else
  {
    // aa.p.add(x);
    let new_follow = [x];
    const p = await aa.p.get(x);
    new_follow.push(aa.p.relay(p));
    let petname;
    if (p.metadata?.name) petname = p.metadata.name;
    else if (p.petnames.length) petname = p.petnames[0];
    if (petname?.length) new_follow.push(aa.fx.an(petname));
    else new_follow.push('');
    aa.cli.v(localStorage.ns+' p add '+new_follow.join(', '))
  }
};


// refresh follows
aa.clk.p_follows =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  const request = ['REQ','p_follows',{authors:[pubkey],kinds:[3],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh metadata
aa.clk.p_metadata =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  const request = ['REQ','p_metadata',{authors:[pubkey],kinds:[0],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh all profile data (metadata,relays,follows)
aa.clk.p_refresh =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  const request = ['REQ','p_refresh',{authors:[pubkey],kinds:[0,3,10002,10019]}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh relays
aa.clk.p_relays =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  const request = ['REQ','p_relays',{authors:[pubkey],kinds:[10002],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// score profile
aa.clk.p_score =async e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  const p = await aa.p.get(pubkey);
  if (p) aa.cli.v(localStorage.ns+' p score '+pubkey+' '+p.score);
};


// request notes from profile
aa.clk.p_req =e=>
{
  const profile = e.target.closest('.profile');
  const xid = profile?.dataset.pubkey;
  const p = aa.db.p[xid];
  const filter = `{"authors":["${p.pubkey}"],"kinds":[1],"limit":100}`;
  let relay = p.relay;
  if (!relay && p.relays.length) 
  relay = p.relays.filter(r=>r.sets.includes('write'))[0];
  if (!relay) relay = 'read';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req ${relay} ${filter}`);
};