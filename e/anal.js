// ─── REGISTRY ────────────────────────────────────────────

aa.e.anal.collectors = new Map();
aa.e.anal.renderers = new Map();

aa.e.anal.collect =(name, hooks)=>
{
  aa.e.anal.collectors.set(name, hooks);
};

aa.e.anal.render =(name, fn)=>
{
  aa.e.anal.renderers.set(name, fn);
};


// ─── SHARED HELPERS (ctx) ────────────────────────────────

aa.e.anal.ctx =()=>
{
  const kl = aa.e.kinds_list || {};
  const mk_kinds_ul =obj=>
  {
    const ul = make('ul',{cla:'list anal_kinds_list'});
    const sorted = Object.entries(obj).sort((a, b)=> b[1] - a[1]);
    for (const [kind, count] of sorted)
    {
      const desc = kl[kind] || '';
      const li = make('li',{cla:'item'});
      li.append(make('span',{cla:'key',con:desc ? `${desc} (kind-${kind})` : `kind-${kind}`}), ' ', make('span',{cla:'val',con:count}));
      ul.append(li);
    }
    return ul
  };
  const name_of =pubkey=>
  {
    const p = aa.db.p[pubkey];
    return p ? aa.p.author_name(p) : aa.fx.short_key(pubkey);
  };
  return {kl, mk_kinds_ul, name_of}
};


// ─── RUN ─────────────────────────────────────────────────

aa.e.anal.run =(keys)=>
{
  setTimeout(()=> aa.bus.emit('cli:dismiss'), 200);

  let selected_keys = keys
    ? keys.trim().split(/\s+/)
    : null;

  // select collectors + renderers
  let collectors = [];
  let renderers = [];
  if (selected_keys)
  {
    for (const k of selected_keys)
    {
      if (aa.e.anal.collectors.has(k)) collectors.push([k, aa.e.anal.collectors.get(k)]);
      if (aa.e.anal.renderers.has(k)) renderers.push([k, aa.e.anal.renderers.get(k)]);
    }
  }
  else
  {
    collectors = [...aa.e.anal.collectors.entries()];
    renderers = [...aa.e.anal.renderers.entries()];
  }

  // init
  const data = {};
  const active = [];
  for (const [name, hooks] of collectors)
  {
    const acc = hooks.init();
    active.push({name, hooks, acc});
  }

  // single pass
  for (const dat of aa.em.values())
  {
    for (const c of active) c.hooks.step(dat, c.acc);
  }

  // finalize
  for (const c of active) c.hooks.done(c.acc, data);

  // render
  const ctx = aa.e.anal.ctx();
  const id = 'e anal';
  const mod_l = aa.e.mod_l;
  let details = aa.el.get(id);
  const l = make('article',{cla:'anal'});

  for (const [name, fn] of renderers) fn(data, l, ctx);

  if (details)
  {
    const old_content = details.querySelector('article.anal');
    if (old_content) old_content.replaceWith(l);
    else details.append(l);
    details.open = true;
  }
  else if (mod_l)
  {
    details = aa.mk.details('analysis', l, 1, 'aa_anal');
    details.id = 'aa_anal';
    aa.el.set(id, details);
    mod_l.append(details);
  }
  if (mod_l && !mod_l.hasAttribute('open')) mod_l.toggleAttribute('open');
  if (details) setTimeout(()=>{ aa.fx.scroll(details) }, 200);
};


// ─── BUILT-IN COLLECTORS ─────────────────────────────────


// core: post count, kinds, timestamps
aa.e.anal.collect('core',
{
  init: ()=> ({post_count:0, kinds:new Map(), ts_oldest:Infinity, ts_newest:0, oldest_id:null, newest_id:null}),
  step: (dat, a)=>
  {
    a.post_count++;
    const ts = dat.event.created_at;
    a.kinds.set(dat.event.kind, (a.kinds.get(dat.event.kind) || 0) + 1);
    if (ts < a.ts_oldest) { a.ts_oldest = ts; a.oldest_id = dat.event.id }
    if (ts > a.ts_newest) { a.ts_newest = ts; a.newest_id = dat.event.id }
  },
  done: (a, data)=> { data.core = a }
});


// authors: per-author stats
aa.e.anal.collect('authors',
{
  init: ()=> ({authors:new Map()}),
  step: (dat, a)=>
  {
    const pk = dat.event.pubkey;
    const ts = dat.event.created_at;
    const hour = new Date(ts * 1000).getHours();
    if (!a.authors.has(pk))
      a.authors.set(pk, {ids: new Set(), kinds: new Map(), relays: new Map(), relay_kinds: new Map(), ts_oldest: Infinity, ts_newest: 0, oldest_id: null, newest_id: null, hours: new Array(24).fill(0)});
    const au = a.authors.get(pk);
    au.ids.add(dat.event.id);
    if (ts < au.ts_oldest) { au.ts_oldest = ts; au.oldest_id = dat.event.id }
    if (ts > au.ts_newest) { au.ts_newest = ts; au.newest_id = dat.event.id }
    au.hours[hour]++;
    au.kinds.set(dat.event.kind, (au.kinds.get(dat.event.kind) || 0) + 1);

    for (const url of dat.seen)
    {
      au.relays.set(url, (au.relays.get(url) || 0) + 1);
      if (!au.relay_kinds.has(url)) au.relay_kinds.set(url, new Map());
      au.relay_kinds.get(url).set(dat.event.kind, (au.relay_kinds.get(url).get(dat.event.kind) || 0) + 1);
    }
  },
  done: (a, data)=> { data.authors = a.authors }
});


// tags: p-tag and e-tag aggregates
aa.e.anal.collect('tags',
{
  init: ()=> ({p_counts:new Map(), p_pairs:new Map(), p_author_mentioned:new Map(), p_author_mentioned_by:new Map(), e_counts:new Map(), e_authors:new Map()}),
  step: (dat, a)=>
  {
    const kind = dat.event.kind;

    const count_p =(from, to)=>
    {
      if (from === to) return;
      a.p_counts.set(to, (a.p_counts.get(to) || 0) + 1);

      if (!a.p_author_mentioned.has(from)) a.p_author_mentioned.set(from, new Map());
      a.p_author_mentioned.get(from).set(to, (a.p_author_mentioned.get(from).get(to) || 0) + 1);

      if (!a.p_author_mentioned_by.has(to)) a.p_author_mentioned_by.set(to, new Map());
      a.p_author_mentioned_by.get(to).set(from, (a.p_author_mentioned_by.get(to).get(from) || 0) + 1);

      const pair_key = from < to ? from + ':' + to : to + ':' + from;
      if (!a.p_pairs.has(pair_key))
      {
        const pa = from < to ? from : to;
        const pb = from < to ? to : from;
        a.p_pairs.set(pair_key, {a: pa, b: pb, count: 0, kinds: new Set(), a_to_b: new Map(), b_to_a: new Map()});
      }
      const m = a.p_pairs.get(pair_key);
      m.count++;
      m.kinds.add(kind);
      const dir = from === m.a ? m.a_to_b : m.b_to_a;
      dir.set(kind, (dir.get(kind) || 0) + 1);
    };

    // zaps: use actual sender → recipient
    if (kind === 9735)
    {
      const target = aa.fx.tag_value(dat.event.tags, 'p');
      if (!target) return;
      for (const z of Object.values(dat.zaps || {}))
      {
        if (z.pubkey) count_p(z.pubkey, target);
      }
      return
    }

    // normal path
    const pk = dat.event.pubkey;
    for (const tag of dat.event.tags)
    {
      if (tag[0] === 'p' && aa.fx.is_hex(tag[1]))
        count_p(pk, tag[1]);
      else if (tag[0] === 'e' && aa.fx.is_hex(tag[1]))
      {
        a.e_counts.set(tag[1], (a.e_counts.get(tag[1]) || 0) + 1);
        if (!a.e_authors.has(tag[1])) a.e_authors.set(tag[1], new Set());
        a.e_authors.get(tag[1]).add(pk);
      }
    }
  },
  done: (a, data)=> { data.tags = a }
});


// zaps: totals, senders, receivers, most zapped notes
aa.e.anal.collect('zaps',
{
  init: ()=> ({count:0, sats:0, notes:new Map(), senders:new Map(), receivers:new Map()}),
  step: (dat, a)=>
  {
    if (!dat.zaps) return;
    for (const z of Object.values(dat.zaps))
    {
      a.count++;
      a.sats += z.amount || 0;

      if (z.pubkey)
      {
        let s = a.senders.get(z.pubkey) || {count:0, sats:0};
        s.count++;
        s.sats += z.amount || 0;
        a.senders.set(z.pubkey, s);
      }

      let recv = dat.event.pubkey;
      let r = a.receivers.get(recv) || {count:0, sats:0};
      r.count++;
      r.sats += z.amount || 0;
      a.receivers.set(recv, r);

      let n = a.notes.get(dat.event.id) || {count:0, sats:0};
      n.count++;
      n.sats += z.amount || 0;
      a.notes.set(dat.event.id, n);
    }
  },
  done: (a, data)=> { data.zaps = a }
});


// relays: per-relay stats
aa.e.anal.collect('relays',
{
  init: ()=> ({relays:new Map()}),
  step: (dat, a)=>
  {
    const pk = dat.event.pubkey;
    for (const url of dat.seen)
    {
      if (!a.relays.has(url)) a.relays.set(url, {count: 0, pubkeys: new Map()});
      const rel = a.relays.get(url);
      rel.count++;
      rel.pubkeys.set(pk, (rel.pubkeys.get(pk) || 0) + 1);
    }
  },
  done: (a, data)=> { data.relays = a.relays }
});


// timeline: per-day stats
aa.e.anal.collect('timeline',
{
  init: ()=> ({timeline:new Map()}),
  step: (dat, a)=>
  {
    const dt = new Date(dat.event.created_at * 1000);
    const day = dt.toISOString().slice(0, 10);
    const hour = dt.getHours();
    if (!a.timeline.has(day)) a.timeline.set(day, {count: 0, hours: new Array(24).fill(0)});
    const tl = a.timeline.get(day);
    tl.count++;
    tl.hours[hour]++;
  },
  done: (a, data)=> { data.timeline = a.timeline }
});


// ─── BUILT-IN RENDERERS ─────────────────────────────────


// notes: count, kinds, referenced notes
aa.e.anal.render('notes', (data, l, ctx)=>
{
  const {core, tags} = data;
  if (!core || !tags) return;
  const body = make('div',{cla:'anal_notes_body'});

  const kinds_sorted = Object.fromEntries([...core.kinds.entries()].sort((a, b)=> b[1] - a[1]));


  // most engagement
  const noted = [...tags.e_counts.entries()].sort((a, b)=> b[1] - a[1]);
  const by_authors = [...tags.e_authors.entries()].sort((a, b)=> b[1].size - a[1].size);
  if (by_authors.length && by_authors[0][1].size >= 2)
  {
    const [note_id, authors_set] = by_authors[0];
    if (!noted.length || note_id !== noted[0][0])
    {
      const wrap = make('div',{cla:'item anal_top'});
      wrap.append(make('span',{con:`most engaged (${authors_set.size})`,cla:'key'}));
      wrap.append(make('span',{cla:'val',app:aa.e.quote({id: note_id})}));
      body.append(wrap);
    }
  }

  // top 10 most referenced
  const top_roots = noted.slice(0, 10);
  if (top_roots.length)
  {
    const roots_ul = make('ul',{cla:'list anal_top_roots'});
    for (const [note_id, count] of top_roots)
    {
      const li = make('li',{cla:'item'});
      li.append(make('span',{cla:'key',con:count}), ' ', make('span',{cla:'val',app:aa.e.quote({id: note_id})}));
      roots_ul.append(li);
    }
    body.append(aa.mk.details(`most referenced (${top_roots.length})`, roots_ul, 0, 'base'));
  }
  body.append(aa.mk.details(`kinds (${core.kinds.size})`, ctx.mk_kinds_ul(kinds_sorted), 0, 'base'));
  l.append(aa.mk.details(`notes (${core.post_count})`, body, 0, 'base anal_notes'));
});


// authors
aa.e.anal.render('authors', (data, l, ctx)=>
{
  const {authors, tags, zaps} = data;
  if (!authors || !tags) return;

  const sorted = [...authors.entries()]
    .sort((a, b)=> a[1].ids.size < b[1].ids.size ? 1 : -1)
    .map(([pubkey, au])=>
    {
      const kinds = Object.fromEntries([...au.kinds.entries()].sort((a, b)=> b[1] - a[1]));
      const mentioned = [...(tags.p_author_mentioned.get(pubkey)?.entries() || [])].sort((a, b)=> b[1] - a[1]).map(([pk, c])=> ({pubkey: pk, count: c}));
      const mentioned_by = [...(tags.p_author_mentioned_by.get(pubkey)?.entries() || [])].sort((a, b)=> b[1] - a[1]).map(([pk, c])=> ({pubkey: pk, count: c}));
      const au_relays = [...au.relays.entries()].sort((a, b)=> b[1] - a[1]).map(([url, c])=>
      {
        const rk = au.relay_kinds.get(url);
        const rk_sorted = rk ? Object.fromEntries([...rk.entries()].sort((a, b)=> b[1] - a[1])) : {};
        return {url, count: c, kinds: rk_sorted}
      });
      const peak_hours = [0,0,0,0];
      for (let h = 0; h < 24; h++) peak_hours[Math.floor(h / 6)] += au.hours[h];
      const zaps_received = zaps?.receivers.get(pubkey);
      const zaps_sent = zaps?.senders.get(pubkey);
      return {pubkey, count: au.ids.size, kinds, mentioned, mentioned_by, relays: au_relays, ts_oldest: au.ts_oldest, ts_newest: au.ts_newest, oldest_id: au.oldest_id, newest_id: au.newest_id, peak_hours, zaps_received, zaps_sent}
    });

  const authors_ls = aa.mk.ls(
  {
    mk:(k, v)=>
    {
      const li = make('li',{cla:'item anal_author'});
      const p_link = aa.mk.p_link(v.pubkey);
      p_link.classList.add('key');

      const body = make('div',{cla:'anal_author_body'});

      if (v.count)
      {
        const time_body = make('div',{cla:'anal_author_time'});
        const mk_time_item =(label, id)=>
        {
          const wrap = make('div',{cla:'item anal_top'});
          const val = make('p',{cla:'val'});
          if (id) val.append(aa.e.quote({id}));
          wrap.append(make('h3',{cla:'key',con:label}), val);
          return wrap
        };
        time_body.append(
          mk_time_item('newest', v.newest_id),
          mk_time_item('oldest', v.oldest_id),
        );
        const bucket_labels = ['00-06h','06-12h','12-18h','18-24h'];
        const hours_ul = make('ul',{cla:'list anal_peak_list'});
        for (let i = 0; i < v.peak_hours.length; i++)
        {
          if (!v.peak_hours[i]) continue;
          const hi = make('li',{cla:'item'});
          hi.append(make('span',{cla:'key',con:bucket_labels[i]}), make('span',{cla:'val',con:v.peak_hours[i]}));
          hours_ul.append(hi);
        }
        if (hours_ul.children.length)
        {
          const peak_wrap = make('div',{cla:'item anal_peak'});
          peak_wrap.append(make('span',{cla:'key',con:'peak hours'}), make('span',{cla:'val',app:hours_ul}));
          time_body.append(peak_wrap);
        }
        let peak_idx = v.peak_hours.indexOf(Math.max(...v.peak_hours));
        let time_label = v.peak_hours[peak_idx] ? `time (${bucket_labels[peak_idx]})` : 'time';
        body.append(aa.mk.details(time_label, time_body, 0, 'base'));
      }

      body.append(aa.mk.details(`kinds (${Object.keys(v.kinds).length})`, ctx.mk_kinds_ul(v.kinds), 0, 'base'));

      if (v.zaps_received || v.zaps_sent)
      {
        const zap_ul = make('ul',{cla:'list anal_author_zaps'});
        if (v.zaps_received)
        {
          const li = make('li',{cla:'item'});
          li.append(make('span',{cla:'key',con:'received'}), make('span',{cla:'val',con:`${v.zaps_received.sats} sats (${v.zaps_received.count})`}));
          zap_ul.append(li);
        }
        if (v.zaps_sent)
        {
          const li = make('li',{cla:'item'});
          li.append(make('span',{cla:'key',con:'sent'}), make('span',{cla:'val',con:`${v.zaps_sent.sats} sats (${v.zaps_sent.count})`}));
          zap_ul.append(li);
        }
        body.append(aa.mk.details('zaps', zap_ul, 0, 'base'));
      }

      if (v.mentioned.length)
      {
        const mentioned_ul = make('ul',{cla:'list anal_mentioned'});
        for (const m of v.mentioned)
        {
          const mi = make('li',{cla:'item'});
          const ml = aa.mk.p_link(m.pubkey);
          ml.classList.add('key');
          mi.append(ml, ' ', make('span',{cla:'val',con:m.count}));
          mentioned_ul.append(mi);
        }
        body.append(aa.mk.details(`mentioned (${v.mentioned.length})`, mentioned_ul, 0, 'base'));
      }

      if (v.mentioned_by.length)
      {
        const by_ul = make('ul',{cla:'list anal_mentioned_by'});
        for (const m of v.mentioned_by)
        {
          const mi = make('li',{cla:'item'});
          const ml = aa.mk.p_link(m.pubkey);
          ml.classList.add('key');
          mi.append(ml, ' ', make('span',{cla:'val',con:m.count}));
          by_ul.append(mi);
        }
        body.append(aa.mk.details(`mentioned by (${v.mentioned_by.length})`, by_ul, 0, 'base'));
      }

      if (v.relays.length)
      {
        const relays_ul = make('ul',{cla:'list anal_author_relays'});
        for (const r of v.relays)
        {
          const ri = make('li',{cla:'item'});
          const relay_sum = make('summary');
          relay_sum.append(make('span',{cla:'dim',con:r.url}), ' ', make('span',{cla:'anal_count',con:r.count}));
          const relay_det = make('details',{cla:'anal_relay_details'});
          relay_det.append(relay_sum, ctx.mk_kinds_ul(r.kinds));
          ri.append(relay_det);
          relays_ul.append(ri);
        }
        body.append(aa.mk.details(`relays (${v.relays.length})`, relays_ul, 0, 'base'));
      }

      const det = make('details',{cla:'val anal_author_details'});
      det.append(make('summary',{con:v.count}), body);
      li.append(p_link, det);
      return li
    },
    ls: Object.fromEntries(sorted.map((v, i)=> [i, v]))
  });
  l.append(aa.mk.details(`authors (${sorted.length})`, authors_ls, 0, 'base anal_authors'));
});


// mentions: most mentioned + pairs
aa.e.anal.render('mentions', (data, l, ctx)=>
{
  const {tags} = data;
  if (!tags) return;
  const body = make('div',{cla:'anal_mentions_body'});

  // top 10 most mentioned people
  const top_people = [...tags.p_counts.entries()].sort((a, b)=> b[1] - a[1]).slice(0, 10);
  if (top_people.length)
  {
    const people_ul = make('ul',{cla:'list anal_most_mentioned'});
    for (const [pk, count] of top_people)
    {
      const li = make('li',{cla:'item'});
      li.append(make('span',{cla:'key',app:[aa.mk.p_link(pk)]}), make('span',{cla:'val',con:count}));
      people_ul.append(li);
    }
    body.append(aa.mk.details(`most mentioned (${top_people.length})`, people_ul, 0, 'base'));
  }

  // shared pair rendering
  const map_kinds =map=> Object.fromEntries([...map.entries()].sort((a, b)=> b[1] - a[1]));
  const mk_pair_item =(v, ctx)=>
  {
    const mk_dir_det =(count, kinds)=>
    {
      const sum = make('summary',{app:make('span',{cla:'anal_count',con:count})});
      const det = make('details',{cla:'anal_dir_details'});
      det.append(sum, ctx.mk_kinds_ul(kinds));
      return det
    };
    const mk_author =(pk, dir)=>
    {
      const p = make('p',{cla:'anal_pair_author'});
      p.append(aa.mk.p_link(pk), mk_dir_det(dir.count, dir.kinds));
      return p
    };
    const li = make('li',{cla:'item anal_mention'});
    li.append(
      mk_author(v.left, v.left_dir),
      make('span',{cla:'anal_count anal_total',con:v.count}),
      mk_author(v.right, v.right_dir),
    );
    return li
  };

  const all_pairs = [...tags.p_pairs.values()]
    .filter(m=> m.count >= 2)
    .sort((a, b)=> a.count < b.count ? 1 : -1)
    .map(m=>
    {
      const a_count = [...m.a_to_b.values()].reduce((s, v)=> s + v, 0);
      const b_count = [...m.b_to_a.values()].reduce((s, v)=> s + v, 0);
      const a_dir = {count: a_count, kinds: map_kinds(m.a_to_b)};
      const b_dir = {count: b_count, kinds: map_kinds(m.b_to_a)};
      const one_sided = a_count === 0 || b_count === 0;
      // left = higher count side
      const left = a_count >= b_count ? m.a : m.b;
      const right = a_count >= b_count ? m.b : m.a;
      const left_dir = a_count >= b_count ? a_dir : b_dir;
      const right_dir = a_count >= b_count ? b_dir : a_dir;
      return {left, right, left_dir, right_dir, count: m.count, kinds: [...m.kinds], one_sided}
    });

  const bffs = all_pairs.filter(p=> !p.one_sided);
  const stalkers = all_pairs.filter(p=> p.one_sided);

  // bff leaderboard
  const bff_ls = aa.mk.ls(
  {
    mk:(k, v)=> mk_pair_item(v, ctx),
    ls: Object.fromEntries(bffs.map((v, i)=> [i, v]))
  });
  body.append(aa.mk.details(`bff leaderboard (${bffs.length})`, bff_ls, 0, 'base'));

  // stalker leaderboard
  if (stalkers.length)
  {
    const stalker_ls = aa.mk.ls(
    {
      mk:(k, v)=> mk_pair_item(v, ctx),
      ls: Object.fromEntries(stalkers.map((v, i)=> [i, v]))
    });
    body.append(aa.mk.details(`stalker leaderboard (${stalkers.length})`, stalker_ls, 0, 'base'));
  }

  l.append(aa.mk.details('mentions', body, 0, 'base anal_mentions'));
});


// zaps
aa.e.anal.render('zaps', (data, l, ctx)=>
{
  const {zaps} = data;
  if (!zaps || !zaps.count) return;
  const body = make('div',{cla:'anal_zaps_body'});

  // totals
  const totals = make('div',{cla:'item'});
  totals.append(make('span',{cla:'key',con:'total'}), make('span',{cla:'val',con:`${zaps.sats} sats (${zaps.count} zaps)`}));
  body.append(totals);

  // top senders
  const top_senders = [...zaps.senders.entries()].sort((a, b)=> b[1].sats - a[1].sats).slice(0, 10);
  if (top_senders.length)
  {
    const ul = make('ul',{cla:'list'});
    for (const [pk, s] of top_senders)
    {
      const li = make('li',{cla:'item'});
      li.append(make('span',{cla:'key',app:[aa.mk.p_link(pk)]}), make('span',{cla:'val',con:`${s.sats} sats (${s.count})`}));
      ul.append(li);
    }
    body.append(aa.mk.details(`top senders (${top_senders.length})`, ul, 0, 'base'));
  }

  // top receivers
  const top_receivers = [...zaps.receivers.entries()].sort((a, b)=> b[1].sats - a[1].sats).slice(0, 10);
  if (top_receivers.length)
  {
    const ul = make('ul',{cla:'list'});
    for (const [pk, r] of top_receivers)
    {
      const li = make('li',{cla:'item'});
      li.append(make('span',{cla:'key',app:[aa.mk.p_link(pk)]}), make('span',{cla:'val',con:`${r.sats} sats (${r.count})`}));
      ul.append(li);
    }
    body.append(aa.mk.details(`top receivers (${top_receivers.length})`, ul, 0, 'base'));
  }

  // most zapped notes
  const top_notes = [...zaps.notes.entries()].sort((a, b)=> b[1].sats - a[1].sats).slice(0, 10);
  if (top_notes.length)
  {
    const ul = make('ul',{cla:'list'});
    for (const [id, n] of top_notes)
    {
      const li = make('li',{cla:'item'});
      li.append(make('span',{cla:'key',con:`${n.sats} sats (${n.count})`}), make('span',{cla:'val',app:aa.e.quote({id})}));
      ul.append(li);
    }
    body.append(aa.mk.details(`most zapped (${top_notes.length})`, ul, 0, 'base'));
  }

  l.append(aa.mk.details(`zaps (${zaps.count})`, body, 0, 'base anal_zaps'));
});


// relays
aa.e.anal.render('relays', (data, l)=>
{
  if (!data.relays) return;
  const sorted = [...data.relays.entries()]
    .sort((a, b)=> b[1].count - a[1].count)
    .map(([url, rel])=>
    {
      const pubkeys = [...rel.pubkeys.entries()]
        .sort((a, b)=> b[1] - a[1])
        .map(([pk, c])=> ({pubkey: pk, count: c}));
      return {url, count: rel.count, pubkeys}
    });

  const relays_ls = aa.mk.ls(
  {
    mk:(k, v)=>
    {
      const li = make('li',{cla:'item anal_relay'});
      const summary = make('summary');
      summary.append(make('span',{cla:'key',con:v.url}), make('span',{cla:'val',con:v.count}));

      const body = make('ul',{cla:'list anal_relay_authors'});
      for (const p of v.pubkeys)
      {
        const pi = make('li',{cla:'item'});
        pi.append(make('span',{cla:'key',app:[aa.mk.p_link(p.pubkey)]}), make('span',{cla:'val',con:p.count}));
        body.append(pi);
      }

      const det = make('details',{cla:'base anal_relay_details'});
      det.append(summary, body);
      li.append(det);
      return li
    },
    ls: Object.fromEntries(sorted.map((v, i)=> [i, v]))
  });
  l.append(aa.mk.details(`relays (${sorted.length})`, relays_ls, 0, 'base anal_relays'));
});


// timeline
aa.e.anal.render('timeline', (data, l)=>
{
  const {core, timeline} = data;
  if (!core || !timeline) return;
  const body = make('div',{cla:'anal_timeline_body'});

  if (core.newest_id)
  {
    const newest_wrap = make('div',{cla:'item anal_top'});
    const val = make('p',{cla:'val'});
    val.append(aa.e.quote({id: core.newest_id}));
    newest_wrap.append(make('h3',{cla:'key',con:'newest'}), val);
    body.append(newest_wrap);
  }
  if (core.oldest_id)
  {
    const oldest_wrap = make('div',{cla:'item anal_top'});
    const val = make('p',{cla:'val'});
    val.append(aa.e.quote({id: core.oldest_id}));
    oldest_wrap.append(make('h3',{cla:'key',con:'oldest'}), val);
    body.append(oldest_wrap);
  }

  const bucket_labels = ['00-06h','06-12h','12-18h','18-24h'];
  const peak = [0,0,0,0];

  const sorted = [...timeline.entries()].sort((a, b)=> a[0] > b[0] ? -1 : 1);
  const timeline_ul = make('ul',{cla:'list anal_timeline_list'});
  for (const [day, tl] of sorted)
  {
    const buckets = [0,0,0,0];
    for (let h = 0; h < 24; h++)
    {
      let b = Math.floor(h / 6);
      buckets[b] += tl.hours[h];
      peak[b] += tl.hours[h];
    }
    const hours_ul = make('ul',{cla:'list anal_hours_list'});
    for (let i = 0; i < buckets.length; i++)
    {
      if (!buckets[i]) continue;
      const hi = make('li',{cla:'item'});
      hi.append(make('span',{cla:'key',con:bucket_labels[i]}), ' ', make('span',{cla:'val',con:buckets[i]}));
      hours_ul.append(hi);
    }
    const ti = make('li',{cla:'item'});
    ti.append(make('span',{cla:'key',con:day}), ' ', make('span',{cla:'val',con:tl.count}), hours_ul);
    timeline_ul.append(ti);
  }
  const peak_ul = make('ul',{cla:'list anal_peak_list'});
  for (let i = 0; i < peak.length; i++)
  {
    if (!peak[i]) continue;
    const pi = make('li',{cla:'item'});
    pi.append(make('span',{cla:'key',con:bucket_labels[i]}), make('span',{cla:'val',con:peak[i]}));
    peak_ul.append(pi);
  }

  const peak_wrap = make('div',{cla:'item anal_peak'});
  peak_wrap.append(make('span',{cla:'key',con:'peak hours'}), make('span',{cla:'val',app:peak_ul}));
  body.append(peak_wrap, aa.mk.details(`days (${sorted.length})`, timeline_ul, 0, 'base'));

  l.append(aa.mk.details('timeline', body, 0, 'base anal_timeline'));
});
