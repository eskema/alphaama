aa.clk.pa =e=>
{
  let l = e.target.closest('.actions');
  let pubkey = l.closest('[data-pubkey]').dataset.pubkey;
  l.classList.toggle('expanded');
  if (!l.classList.contains('empty')) return

  let butts = [...aa.p.butts.pa];

  if (!aa.u.is_u(pubkey))
  {
    butts.unshift([aa.p.following(pubkey)?'del':'add','k3']);
    if (aa.m) butts.unshift(['dm','m_dm']);
  }

  butts.unshift([`${aa.db.p[pubkey]?.score??0}`,'p_score']);

  // dedicated container so toggle stays separate from action buttons
  let container = l.querySelector('.butts') || make('span', {cla:'butts'});
  for (const array of butts)
    container.append(aa.mk.butt_clk(array),' ');
  if (!container.parentElement) l.append(container);
  l.classList.remove('empty');
};

// follow / unfollow
aa.clk.k3 =async e=>
{
  const pubkey = e.target
    .closest('[data-pubkey]')?.dataset.pubkey;
  
  if (e.target.textContent === 'del') 
  {
    aa.bus.emit('cli:stage',`p del ${pubkey}`);
  }
  else
  {
    let p = await aa.p.author(pubkey);
    aa.bus.emit('cli:stage',`p add ${aa.fx.follow(p)}`)
  }
};


aa.clk.mention =async e=>
{
  const pubkey = e.target.closest('[data-pubkey]')?.dataset.pubkey;
  if (!pubkey) return;

  let p = await aa.p.get(pubkey);
  let encoded = aa.fx.encode('nprofile',
  {
    pubkey,
    relays: aa.p.relays(p).slice(0,3)
  });

  let cv = aa.bus.request('cli:value') || '';
  let result = cv.length ? `${cv} nostr:${encoded}`
  : `nostr:${encoded}`;
  aa.bus.emit('cli:set',result);
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
aa.clk.p_refresh =async e=>
{
  const pubkey = e.target.closest('[data-pubkey]').dataset.pubkey;
  const relays = aa.r.r;
  if (!relays.length)
  {
    aa.log('p refresh: no read relays — check your relay sets (add some with the `read` set)');
    return
  }
  aa.log(`p refresh: fetching ${pubkey.slice(0,8)}… across ${relays.length} relay(s)`);
  let sheet = await aa.r.get(
  {
    id: 'p_refresh_' + aa.fx.rands(),
    filter: {authors:[pubkey], kinds:[0,3,10002,10019]},
    relays,
    options: {eose:'close'},
  });
  let n = sheet.events.size;
  for (const [, dat] of sheet.events) aa.bus.emit('e:print_q', dat);
  // aa.r.get doesn't clean up on_sub after resolve — do it here
  aa.r.on_sub.delete(sheet.id);
  aa.r.on_eose.delete(sheet.id);
  let reached = sheet.eose.size;
  aa.log(`p refresh: ${n} event(s) from ${reached}/${relays.length} relay(s)${sheet.ended ? '' : ' (timed out, partial)'}`);
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
  if (p) aa.bus.emit('cli:set',aa.cmd('p score '+pubkey+' '+p.score));
};


// open dm conversation with profile
aa.clk.m_dm =e=>
{
  const pubkey = e.target.closest('[data-pubkey]')?.dataset.pubkey;
  if (!pubkey) return;
  let npub = aa.fx.encode('npub', pubkey);
  aa.view.state('#m_' + npub);
};


// request notes from profile
aa.clk.p_req =e=>
{
  const profile = e.target.closest('[data-pubkey]');
  const xid = profile?.dataset.pubkey;
  const p = aa.db.p[xid];
  const filter = `{"authors":["${p.pubkey}"],"kinds":[1],"limit":100}`;
  let relay = aa.p.relays(p,'write')[0];
  if (!relay) relay = 'read';
  aa.bus.emit('cli:set',aa.cmd(`${aa.q.def.id} req ${relay} ${filter}`));
};