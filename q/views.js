// q view: #req?req=id&kinds=1,6&authors=u&relays=read
//   req=id           — load saved filter by id
//   req=id1,id2,…    — run each saved filter as its own request, in parallel
//   no req param     — build filter from URL params alone (ad-hoc)
//
// the filter is rejected before sending if it ends up empty (no keys after
// expansion) — protects against `req=missing_id` or stray URL typos turning
// into an open query (`["REQ", id, {}]`) that matches every event on every
// relay.

const req_fired = new Set();

// params whose values may be hex/bech32 (decode before filter validation)
const id_keys = new Set(['ids','authors','e','p']);

const decode_val = val =>
{
  if (aa.fx.is_hex(val)) return val;
  if (/^(npub|note|nevent|naddr|nprofile)1/.test(val)) return aa.fx.decode(val);
  return val;  // variable (u, k3) or time shortcut (n_7, h_12) — aa.q.filter expands
};

// merge URL params into the filter (only meaningful for single-id or
// no-id requests — multi-id batches use the saved filters as-is so each
// stays self-contained).
const apply_url_params = (filter, p) =>
{
  for (let [k, v] of p.entries())
  {
    if (k === 'req' || k === 'relays') continue;
    let fk = k.length === 1 ? `#${k}` : k;
    if (id_keys.has(k))
      filter[fk] = v.split(',').map(decode_val);
    else if (k === 'kinds')
      filter[fk] = v.split(',').map(Number);
    else if (k === 'limit')
      filter[fk] = Number(v);
    else
      filter[fk] = v;  // since, until, search — passed as-is for aa.q.filter
  }
};

aa.view.ls.req = async (_path, search) =>
{
  let p = new URLSearchParams(search);
  let req_id = p.get('req');

  // split req param on comma → array of saved-query ids. when omitted,
  // keep a single null entry so URL params alone can drive an ad-hoc query.
  let req_ids = req_id
    ? req_id.split(',').map(s => s.trim()).filter(Boolean)
    : [null];

  // build {label, filter} per id, skipping anything that resolves to nothing
  let entries = [];
  for (const id of req_ids)
  {
    if (id && !aa.q.o.ls[id])
    {
      aa.log(`req view: no saved query "${id}"`);
      continue;
    }
    let filter = id ? { ...aa.pj(aa.q.o.ls[id].v) } : {};
    if (req_ids.length === 1) apply_url_params(filter, p);

    let [expanded, opts] = aa.q.filter(filter);
    if (!expanded || !Object.keys(expanded).length)
    {
      aa.log(`req view: refusing empty/open filter for "${id || 'ad-hoc'}"`);
      continue;
    }
    entries.push({ id, expanded, opts });
  }

  if (!entries.length)
  {
    aa.log(`req view: nothing to send (search="${search}")`);
    return;
  }

  if (req_fired.has(search)) return;
  req_fired.add(search);

  // persist to reqs (once per search, regardless of how many ids it batches)
  if (!aa.q.o.reqs[search])
  {
    aa.q.o.reqs[search] = {id: req_id, ts: Date.now()};
    aa.mod.save_to(aa.q);
  }
  if (req_id) sessionStorage.q_view = req_id;

  // resolve relays once — same set used for every id in the batch
  let rels_s = p.get('relays') || '';
  let as_outbox = rels_s === 'out';
  let relays = [];
  if (!as_outbox)
  {
    for (const r of rels_s.split(',').map(s => s.trim()).filter(Boolean))
      relays.push(...aa.r.rel(r));
    relays = [...new Set(relays)];
    let unknown = relays.filter(r => !aa.r.o.ls[r]);
    if (unknown.length) aa.r.add(unknown.map(r => `${r} hint`).join(','));
    if (!relays.length && !rels_s) relays = aa.r.r;
    if (!relays.length && !rels_s)
    {
      relays = aa.u.bootstrap.relays;
      aa.r.add(relays.map(r => `${r} read write`).join(','));
    }
    if (!relays.length && rels_s)
    {
      aa.log(`req view: no relays for ${rels_s}`);
      return
    }
  }

  let section = aa.el.get('section_e');
  if (section && !section.classList.contains('expanded'))
    aa.clk.expand({target: section});

  await new Promise(resolve => aa.mod.ready('r:manager', resolve));

  // run each entry as its own subscription. cleanup tracks all sub_ids so
  // navigating away closes every one (not just the last).
  let sub_ids = [];
  for (const { id, expanded, opts } of entries)
  {
    let sub_id = `req_${aa.fx.rands()}`;
    sub_ids.push(sub_id);

    aa.log(aa.mk.details(
      `req view: ${id || 'ad-hoc'} → ${sub_id}`,
      make('pre', {con: JSON.stringify(expanded, null, 2)})
    ));

    if (!rels_s)
    {
      let [, events] = await aa.r.get_filter(expanded);
      aa.q.log('db', ['REQ', sub_id, expanded, opts], `db: ${events.length} events`);
      for (const dat of events) aa.bus.emit('e:print_q', dat);
    }

    aa.r.on_sub.set(sub_id, dat => aa.bus.emit('e:print_q', dat));

    if (as_outbox)
    {
      let request = ['REQ', sub_id, expanded, opts];
      aa.q.log('out', request, 'to: outbox');
      aa.q.outbox(request);
    }
    else
    {
      let request = ['REQ', sub_id, expanded];
      aa.q.log('req', request, `to: ${relays}`);
      let req_opts = opts || {};
      if (rels_s) req_opts.db = false;
      aa.r.send_req({ request, relays, options: req_opts });
    }
  }

  aa.view.req_subs = sub_ids;
};


aa.view.clears.push(() =>
{
  if (aa.view.req_subs)
  {
    for (const sub of aa.view.req_subs) aa.r.close(sub);
    delete aa.view.req_subs;
  }
});
