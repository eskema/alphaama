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
    for (const s of butts) l.append(' ',aa.mk.butt_clk(s));
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
    let relay = aa.p.relay(p);
    if (relay) new_follow.push(relay);
    let petname;
    if (p.metadata?.name) petname = p.metadata.name;
    else if (p.petnames.length) petname = p.petnames[0];
    if (petname) 
    {
      if (!relay) new_follow.push('.')
      new_follow.push(aa.fx.an(petname));
    }
    aa.cli.v(localStorage.ns+' p add '+new_follow.join(' '))
  }
};


// refresh follows
aa.clk.p_follows =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  aa.r.def_req('p_follows',{authors:[pubkey],kinds:[3],limit:1});
};


// refresh metadata
aa.clk.p_metadata =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  aa.r.def_req('p_metadata',{authors:[pubkey],kinds:[0],limit:1});
};


// refresh all profile data (metadata,relays,follows)
aa.clk.p_refresh =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  aa.r.def_req('p_refresh',{authors:[pubkey],kinds:[0,3,10002,10019]})
};


// refresh relays
aa.clk.p_relays =e=>
{
  const pubkey = e.target.closest('.profile').dataset.pubkey;
  aa.r.def_req('p_relays',{authors:[pubkey],kinds:[10002],limit:1})
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