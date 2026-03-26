// q view: #req?req=id&kinds=1,6&authors=u&relays=read

const req_fired = new Set();

aa.view.ls.req = async (_path, search) =>
{
  let p = new URLSearchParams(search);
  let req_id = p.get('req');

  // base from saved filter, merged with URL params
  let filter = req_id && aa.q.o.ls[req_id]
    ? { ...aa.pj(aa.q.o.ls[req_id].v) }
    : {};

  // params whose values may be hex/bech32 (decode before filter validation)
  let id_keys = new Set(['ids','authors','e','p']);

  let decode = val =>
  {
    if (aa.fx.is_hex(val)) return val;
    if (/^(npub|note|nevent|naddr|nprofile)1/.test(val)) return aa.fx.decode(val);
    return val;  // variable (u, k3) or time shortcut (n_7, h_12) — aa.q.filter expands
  };

  for (let [k, v] of p.entries())
  {
    if (k === 'req' || k === 'relays') continue;
    let fk = k.length === 1 ? `#${k}` : k;  // single letter → tag filter (#e, #p, #t, #a …)
    if (id_keys.has(k))
      filter[fk] = v.split(',').map(decode);
    else if (k === 'kinds')
      filter[fk] = v.split(',').map(Number);
    else if (k === 'limit')
      filter[fk] = Number(v);
    else
      filter[fk] = v;  // since, until, search — passed as-is for aa.q.filter
  }

  let [expanded, opts] = aa.q.filter(filter);
  if (!expanded)
  {
    aa.log('req view: invalid filter');
    return;
  }

  if (req_fired.has(search)) return;
  req_fired.add(search);

  aa.log(aa.mk.details(`req view: ${search}`, make('pre', {con: JSON.stringify(expanded, null, 2)})));

  // resolve relays
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
    if (!relays.length) relays = aa.r.r;
    if (!relays.length)
    {
      relays = aa.u.bootstrap.relays;
      aa.r.add(relays.map(r => `${r} read write`).join(','));
    }
  }

  let section = aa.el.get('section_e');
  if (section && !section.classList.contains('expanded'))
    aa.clk.expand({target: section});

  let sub_id = `req_${aa.fx.rands()}`;

  // DB first
  let [, events] = await aa.r.get_filter(expanded);
  aa.q.log('db', ['REQ', sub_id, expanded, opts], `db: ${events.length} events`);
  for (const dat of events) aa.bus.emit('e:print_q', dat);

  // relay sub or outbox
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
    aa.r.send_req({ request, relays, options: opts || {} });
  }

  aa.view.req_sub = sub_id;
};


aa.view.clears.push(() =>
{
  if (aa.view.req_sub)
  {
    aa.r.close(aa.view.req_sub);
    delete aa.view.req_sub;
  }
});
