aa.clk.pa =e=>
{
  let l = e.target.closest('.actions');
  let pubkey = l.closest('[data-pubkey]').dataset.pubkey;
  l.classList.toggle('expanded');
  if (!l.classList.contains('empty')) return
  
  let butts = [...aa.p.butts.pa];
  if (!aa.fx.is_u(pubkey)) 
    butts.unshift([aa.p.following(pubkey)?'del':'add','k3']);
  butts.unshift([`${aa.db.p[pubkey].score}`,'p_score']);
  
  for (const s of butts) l.append(' ',aa.mk.butt_clk(s));
  l.classList.remove('empty');
};

// follow / unfollow
aa.clk.k3 =async e=>
{
  const pubkey = e.target.closest('[data-pubkey]')
    .dataset.pubkey;
  
  if (e.target.textContent === 'del') 
  {
    aa.cli.add('p del '+pubkey)
  }
  else
  {
    let p = await aa.p.author(pubkey);
    // aa.p.add(x);
    
    aa.cli.add(`p add ${aa.fx.follow(p)}`)
  }
};


aa.clk.mention =async e=>
{
  const pubkey = e.target.closest('[data-pubkey]')?.dataset.pubkey;
  if (!pubkey) return;

  let p = await aa.p.get(pubkey);
  let encoded = aa.fx.encode('nprofile',{
    pubkey,
    relays: aa.p.relays(p).slice(0,3)
  });

  let result = aa.cli.t.value.length ? `${aa.cli.t.value} nostr:${encoded}` 
  : `nostr:${encoded}`;
  aa.cli.v(result);
};


// refresh follows
aa.clk.p_follows =e=>
{
  const pubkey = e.target.closest('[data-pubkey]').dataset.pubkey;
  aa.r.def_req('p_follows',{authors:[pubkey],kinds:[3],limit:1});
};


// refresh metadata
aa.clk.p_metadata =e=>
{
  const pubkey = e.target.closest('[data-pubkey]').dataset.pubkey;
  aa.r.def_req('p_metadata',{authors:[pubkey],kinds:[0],limit:1});
};


// refresh all profile data (metadata,relays,follows)
aa.clk.p_refresh =e=>
{
  const pubkey = e.target.closest('[data-pubkey]').dataset.pubkey;
  aa.r.def_req('p_refresh',{authors:[pubkey],kinds:[0,3,10002,10019]})
};


// refresh relays
aa.clk.p_relays =e=>
{
  const pubkey = e.target.closest('[data-pubkey]').dataset.pubkey;
  aa.r.def_req('p_relays',{authors:[pubkey],kinds:[10002],limit:1})
};


// score profile
aa.clk.p_score =async e=>
{
  const pubkey = e.target.closest('[data-pubkey]').dataset.pubkey;
  const p = await aa.p.get(pubkey);
  if (p) aa.cli.v(localStorage.ns+' p score '+pubkey+' '+p.score);
};


// request notes from profile
aa.clk.p_req =e=>
{
  const profile = e.target.closest('[data-pubkey]');
  const xid = profile?.dataset.pubkey;
  const p = aa.db.p[xid];
  const filter = `{"authors":["${p.pubkey}"],"kinds":[1],"limit":100}`;
  let relay = p.relay;
  if (!relay && p.relays.length) 
  relay = p.relays.filter(r=>r.sets.includes('write'))[0];
  if (!relay) relay = 'read';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req ${relay} ${filter}`);
};