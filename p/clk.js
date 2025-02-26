aa.clk.pa =e=>
{
  let l = e.target.closest('.actions');
  let profile = l.closest('article');
  let x = profile.dataset.xpub;
  if (l.classList.contains('empty'))
  {
    let butts = 
    [
      [`${profile.dataset.trust}`,'p_score'],
      ['get_notes','p_req'],
      ['refresh','p_refresh']
    ];
    if (!aa.is.u(x)) butts.push([aa.is.following(x)?'del':'add','k3']);
    for (const s of butts) l.append(' ',aa.mk.butt(s));
    l.classList.remove('empty');
  }
  l.classList.toggle('expanded');
};

// follow / unfollow
aa.clk.k3 =async e=>
{
  const x = e.target.closest('.profile').dataset.xpub;
  const dis = e.target.textContent;
  if (dis === 'del') aa.p.del(x);
  else aa.p.add(x)
};

// refresh follows
aa.clk.p_follows =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_follows',{authors:[xpub],kinds:[3],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};

// refresh metadata
aa.clk.p_metadata =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_metadata',{authors:[xpub],kinds:[0],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh all profile data (metadata,relays,follows)
aa.clk.p_refresh =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_refresh',{authors:[xpub],kinds:[0,3,10002,10019]}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// refresh relays
aa.clk.p_relays =e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const request = ['REQ','p_relays',{authors:[xpub],kinds:[10002],limit:1}];
  aa.r.demand(request,aa.fx.in_set(aa.r.o.ls,aa.r.o.r),{eose:'close'});
};


// score profile
aa.clk.p_score =async e=>
{
  const xpub = e.target.closest('.profile').dataset.xpub;
  const p = await aa.db.get_p(xpub);
  if (p) aa.cli.v(localStorage.ns+' p score '+xpub+' '+p.score);
};


// request notes from profile
aa.clk.p_req =e=>
{
  const profile = e.target.closest('.profile');
  const xid = profile?.dataset.xpub;
  const p = aa.db.p[xid];
  const filter = `{"authors":["${p.xpub}"],"kinds":[1],"limit":100}`;
  let relay = p.relay;
  if (!relay && p.relays.length) 
  relay = p.relays.filter(r=>r.sets.includes('write'))[0];
  if (!relay) relay = 'read';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req ${relay} ${filter}`);
};