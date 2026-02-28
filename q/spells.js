// NIP-A7 spell utilities


// convert NIP-A7 relative time to alphaama time variable
aa.q.spell_time =s=>
{
  if (s === 'now') return 'now';
  if (/^\d+$/.test(s)) return parseInt(s);
  let match = s.match(/^(\d+)(s|m|h|d|w|mo|y)$/);
  if (!match) return s;
  let [, n, unit] = match;
  switch (unit)
  {
    case 's': return `m_${Math.ceil(n / 60) || 1}`;
    case 'm': return `m_${n}`;
    case 'h': return `h_${n}`;
    case 'd': return `n_${n}`;
    case 'w': return `n_${n * 7}`;
    case 'mo': return `M_${n}`;
    case 'y': return `y_${n}`;
  }
  return s
};


// build filter from NIP-A7 spell tags
// convert: replace spell variables with alphaama equivalents
aa.q.spell_filter =(tags, convert)=>
{
  let filter = {};
  for (const tag of tags)
  {
    switch (tag[0])
    {
      case 'k':
        if (!filter.kinds) filter.kinds = [];
        filter.kinds.push(parseInt(tag[1]));
        break;
      case 'authors':
        filter.authors = convert
          ? tag.slice(1).map(v=>
              v === '$me' ? 'u' : v === '$contacts' ? 'k3' : v
            )
          : tag.slice(1);
        break;
      case 'ids':
        filter.ids = tag.slice(1);
        break;
      case 'tag':
        filter['#'+tag[1]] = tag.slice(2);
        break;
      case 'limit':
        filter.limit = parseInt(tag[1]);
        break;
      case 'since':
        filter.since = convert ? aa.q.spell_time(tag[1]) : tag[1];
        break;
      case 'until':
        filter.until = convert ? aa.q.spell_time(tag[1]) : tag[1];
        break;
      case 'search':
        filter.search = tag[1];
        break;
    }
  }
  if (tags.some(t=> t[0] === 'close-on-eose')) filter.eose = 'close';
  return filter
};


// convert alphaama time variable to NIP-A7 relative time
aa.q.time_spell =s=>
{
  if (s === 'now') return 'now';
  if (typeof s === 'number') return String(s);
  if (typeof s !== 'string' || !s.includes('_')) return String(s);
  let n = s.slice(2);
  switch (s[0])
  {
    case 'm': return `${n}m`;
    case 'h': return `${n}h`;
    case 'n': return `${n}d`;
    case 'M': return `${n}mo`;
    case 'y': return `${n}y`;
  }
  return String(s)
};


// convert query filter to NIP-A7 spell tags
aa.q.filter_to_spell =filter=>
{
  let tags = [];
  for (const key in filter)
  {
    switch (key)
    {
      case 'kinds':
        for (const k of filter.kinds) tags.push(['k', String(k)]);
        break;
      case 'authors':
        tags.push(['authors', ...filter.authors.map(v=>
          v === 'u' ? '$me' : v === 'k3' ? '$contacts' : v
        )]);
        break;
      case 'ids':
        tags.push(['ids', ...filter.ids]);
        break;
      case 'limit':
        tags.push(['limit', String(filter.limit)]);
        break;
      case 'since':
        tags.push(['since', aa.q.time_spell(filter.since)]);
        break;
      case 'until':
        tags.push(['until', aa.q.time_spell(filter.until)]);
        break;
      case 'search':
        tags.push(['search', filter.search]);
        break;
      case 'eose':
        if (filter.eose === 'close') tags.push(['close-on-eose']);
        break;
      default:
        if (key.startsWith('#'))
          tags.push(['tag', key.slice(1), ...filter[key]]);
    }
  }
  return tags
};


// create spell event (kind:777) from query
aa.mk.k777 =(s='')=>
{
  let [fid, content] = s.split(aa.regex.fw);
  if (!fid)
  {
    aa.log('mk 777: provide a query id');
    return
  }

  let query = aa.q.o.ls[fid];
  if (!query)
  {
    aa.log(`mk 777: filter not found: ${fid}`);
    return
  }

  let filter = query.o || aa.pj(query.v);
  if (!filter)
  {
    aa.log('mk 777: invalid filter');
    return
  }

  let tags = aa.q.filter_to_spell(filter);
  tags.shift(['cmd','REQ']);
  tags.push(['name', fid]);

  const event = aa.fx.normalise_event({kind: 777, tags, content: content || ''});
  aa.mk.confirm(
  {
    title: `new spell: ${fid}`,
    l: aa.mk.tag_list(tags),
    no: {exe: ()=> {}},
    yes: {exe: ()=> { aa.bus.emit('e:finalize', event) }},
  });
};


// render spell (NIP-A7)
aa.q.render_spell =async(element,dat)=>
{
  let tags = dat.event.tags;
  let name = aa.fx.tag_value(tags,'name') || '';
  let cmd = aa.fx.tag_value(tags,'cmd') || 'REQ';

  // raw filter for display, converted for import
  let filter = aa.q.spell_filter(tags);
  let filter_import = aa.q.spell_filter(tags, true);

  let relays_tag = tags.find(t=> t[0] === 'relays');
  let relays = relays_tag ? relays_tag.slice(1) : [];

  let import_json = JSON.stringify(filter_import);
  let fid = name ? aa.fx.an(name) : '';
  if (!fid.length) fid = '<query_id>';

  let info = make('p', {cla: 'paragraph spell_info',con: `cmd: ${cmd} `});
  let filter_el = make('pre', {cla: 'paragraph spell_filter', con: JSON.stringify(filter, null, 2)});

  // import button
  let import_cmd = fid
    ? `q add ${fid} ${import_json}`
    : `q add ${import_json}`;

  let import_butt = make('p',
  {
    cla:'paragraph',
    app:aa.mk.butt_action(import_cmd, 'import spell', 'exe')
  });
  
  element.append(
    name ? make('h4', {con: name}) : '',
    info,
    filter_el,
    relays.length ? make('p', {cla: 'paragraph spell_relays', con: 'relays: ' + relays.join(', ')}) : '',
    import_butt
  );

};
