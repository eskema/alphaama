/*

alphaama
mod    b
blossom — blobs stored simply on mediaservers

*/


const b =
{
  name:'blossom',
  about:'blob storage on mediaservers',
  def:
  {
    id:'b',
    def:'',
    ls:{},
  },
  scripts:
  [
    '/b/mk.js',
    '/b/kinds.js',
  ],
  styles:
  [
    '/b/b.css'
  ],
  butts:
  {
    mod:
    [
      ['k 10063','k10063'],
      ['b upload','upload'],
    ],
    init:[]
  }
};


// create blossom auth event (kind 24242)
// returns Authorization header value
b.auth =async(action, opts={})=>
{
  if (!aa.signer.available())
  {
    aa.log('b: you need a signer');
    return
  }
  const expiration = Math.floor(Date.now() / 1000) + (opts.expiration || 3600);
  const tags =
  [
    ['t', action],
    ['expiration', String(expiration)],
  ];
  if (opts.sha256)
  {
    const hashes = Array.isArray(opts.sha256) ? opts.sha256 : [opts.sha256];
    for (const h of hashes) tags.push(['x', h])
  }
  if (opts.server) tags.push(['server', opts.server]);

  const event =
  {
    kind: 24242,
    created_at: Math.floor(Date.now() / 1000),
    content: action,
    tags,
  };
  const signed = await aa.signer.signEvent(event);
  if (!signed) return;
  return 'Nostr ' + btoa(JSON.stringify(signed))
};


// PUT /upload
b.upload =async(server, file)=>
{
  if (!server) server = b.get_def();
  if (!server)
  {
    aa.log('b upload: no server, use `b add` first');
    return
  }
  const buf = await file.arrayBuffer();
  const sha256 = await aa.fx.blob_sha256(file);

  const auth = await b.auth('upload', {sha256, server});
  if (!auth) return;

  const res = await fetch(server + '/upload',
  {
    method: 'PUT',
    headers:
    {
      'Authorization': auth,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: buf,
  });
  if (!res.ok)
  {
    const reason = res.headers.get('X-Reason') || res.statusText;
    aa.log(`b upload failed: ${reason}`);
    return
  }
  const descriptor = await res.json();
  aa.log(`b upload ok: ${descriptor.url}`);

  // auto-mirror to backup server if configured and distinct from primary
  let backup = b.get_backup();
  if (backup && backup !== server)
    b.mirror(descriptor.url, backup).catch(e=> console.error('b backup mirror', e));

  b.server_blobs_add(server, descriptor);
  b.server_blobs_refresh(server);

  return descriptor
};


// GET /<sha256>[.ext]
b.get =async(server, sha256, ext)=>
{
  const url = server + '/' + sha256 + (ext || '');
  const res = await fetch(url);
  if (!res.ok)
  {
    aa.log(`b get failed: ${res.statusText}`);
    return
  }
  return res
};


// HEAD /<sha256>
b.head =async(server, sha256)=>
{
  const res = await fetch(server + '/' + sha256, {method: 'HEAD'});
  return res.ok
};


// DELETE /<sha256> (auth required)
b.del =async(sha256, server)=>
{
  if (!server) server = b.get_def();
  if (!server)
  {
    aa.log('b delete: no server');
    return
  }
  const auth = await b.auth('delete', {sha256, server});
  if (!auth) return;

  const res = await fetch(server + '/' + sha256,
  {
    method: 'DELETE',
    headers: {'Authorization': auth},
  });
  if (!res.ok)
  {
    const reason = res.headers.get('X-Reason') || res.statusText;
    aa.log(`b delete failed: ${reason}`);
    return false
  }
  aa.log(`b deleted: ${sha256.slice(0,12)}...`);
  b.server_blobs_remove(server, sha256);
  b.server_blobs_refresh(server);
  return true
};


// GET /list/<pubkey>
b.list =async(server, pubkey, opts={})=>
{
  if (!server) server = b.get_def();
  if (!server)
  {
    aa.log('b list: no server');
    return
  }
  if (!pubkey) pubkey = aa.bus.request('u:pubkey');
  if (!pubkey)
  {
    aa.log('b list: no pubkey');
    return
  }

  if (server.endsWith('/')) server = server.slice(1,-1);

  let url = server + '/list/' + pubkey;
  const params = new URLSearchParams();
  if (opts.cursor) params.set('cursor', opts.cursor);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  if (qs) url += '?' + qs;

  const res = await fetch(url);
  if (!res.ok)
  {
    aa.log(`b list failed (${server}): ${res.status}${res.statusText ? ' ' + res.statusText : ''}`);
    return
  }
  return await res.json()
};


// PUT /mirror
b.mirror =async(url, server)=>
{
  if (!server) server = b.get_def();
  if (!server)
  {
    aa.log('b mirror: no server');
    return
  }
  // fetch HEAD to get sha256 from url
  const hash_match = url.match(/([a-f0-9]{64})/);
  if (!hash_match)
  {
    aa.log('b mirror: cannot extract sha256 from url');
    return
  }
  const sha256 = hash_match[1];

  const auth = await b.auth('upload', {sha256, server});
  if (!auth) return;

  const res = await fetch(server + '/mirror',
  {
    method: 'PUT',
    headers:
    {
      'Authorization': auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({url}),
  });
  if (!res.ok)
  {
    const reason = res.headers.get('X-Reason') || res.statusText;
    aa.log(`b mirror failed: ${reason}`);
    return
  }
  const descriptor = await res.json();
  aa.log(`b mirror ok: ${descriptor.url}`);
  b.server_blobs_add(server, descriptor);
  b.server_blobs_refresh(server);
  return descriptor
};


// PUT /media (server may transcode)
b.media =async(server, file)=>
{
  if (!server) server = b.get_def();
  if (!server)
  {
    aa.log('b media: no server');
    return
  }
  const sha256 = await aa.fx.blob_sha256(file);
  const auth = await b.auth('media', {sha256, server});
  if (!auth) return;

  const res = await fetch(server + '/media',
  {
    method: 'PUT',
    headers:
    {
      'Authorization': auth,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: await file.arrayBuffer(),
  });
  if (!res.ok)
  {
    const reason = res.headers.get('X-Reason') || res.statusText;
    aa.log(`b media failed: ${reason}`);
    return
  }
  const descriptor = await res.json();
  aa.log(`b media ok: ${descriptor.url}`);
  return descriptor
};


// HEAD /upload (pre-flight check)
b.check =async(server, sha256, size, type)=>
{
  if (!server) server = b.get_def();
  if (!server) return {ok: false, reason: 'no server'};

  const res = await fetch(server + '/upload',
  {
    method: 'HEAD',
    headers:
    {
      'X-SHA-256': sha256,
      'X-Content-Length': String(size),
      'X-Content-Type': type,
    },
  });
  if (res.ok) return {ok: true};
  return {ok: false, reason: res.headers.get('X-Reason') || res.statusText}
};


// add server urls
b.add =(string='')=>
{
  let urls = aa.fx.splitr(string);
  let added = [];
  let needs_saving;
  for (let url of urls)
  {
    url = aa.fx.url(url.trim())?.href;
    if (!url) continue;
    if (url.endsWith('/')) url = url.slice(0,-1);
    if (!b.o.ls[url])
    {
      b.o.ls[url] = {url};
      needs_saving = true;
    }
    if (!b.o.def)
    {
      b.o.def = url;
      needs_saving = true;
    }
    added.push(url);
  }
  if (needs_saving)
  {
    aa.mod.save(b);
    for (const url of added) aa.mod.ui(b, url);
  }
  if (added.length) aa.log(`b added: ${added.join(', ')}`);
  return added
};


// remove server url
b.rm =(string='')=>
{
  let urls = aa.fx.splitr(string);
  for (let url of urls)
  {
    url = aa.fx.url(url.trim())?.href;
    if (!url) continue;
    if (url.endsWith('/')) url = url.slice(0, -1);
    if (b.o.ls[url])
    {
      delete b.o.ls[url];
      if (b.o.def === url)
        b.o.def = Object.keys(b.o.ls)[0] || '';
      if (b.o.backup === url)
        b.o.backup = '';
      let li = b.mod_li?.get(url);
      if (li)
      {
        li.remove();
        b.mod_li.delete(url);
      }
      b.server_blobs?.delete(url);
      aa.log(`b removed: ${url}`);
    }
    else aa.log(`b rm: ${url} not found`);
  }
  aa.mod.save(b);
};


// get default server
b.get_def =()=>
{
  return b.o?.def || Object.keys(b.o?.ls || {})[0]
};


// get backup server (auto-mirror target on successful upload)
b.get_backup =()=>
{
  return b.o?.backup || ''
};


// get servers for a pubkey from kind 10063 profile data
b.get_servers =async pubkey=>
{
  let p = await aa.p.get(pubkey);
  if (!p?.blossom?.length) return [];
  return p.blossom
};




// per-server element refs for the inner blob lists (rebuilt each b.mk run)
b.server_blobs = new Map();


// custom item renderer for mod UI — mirrors r.mk's pattern: URL is the
// details summary (with [count] suffix via aa/list.css), update button +
// blob list live inside the body, action buttons sit on the left via CSS grid.
b.mk =(key, value)=>
{
  const id = b.def.id;
  let is_def = b.o.def === key;
  let is_backup = b.o.backup === key;
  let actions = make('div',
  {
    cla: 'mod_actions',
    app:
    [
      aa.mk.butt_action(`${id} def ${key}`, 'def', 'def'),
      aa.mk.butt_action(`${id} backup ${key}`, 'backup', 'backup'),
      aa.mk.butt_action(`${id} rm ${key}`, 'del', 'del'),
    ]
  });

  // per-server blob list inside a collapsible mod_details
  let saved = value?.last_descriptors || [];
  let blobs_list = make('ul', {cla: 'list'});
  for (const d of saved) blobs_list.append(aa.mk.b_list_item(d));

  let view_mode = value?.view_mode || 'list';
  if (view_mode === 'grid') blobs_list.classList.add('grid');

  let refresh_butt = make('button',
  {
    cla: 'butt exe',
    con: 'refresh list',
    clk: e=>{ e.preventDefault(); b.server_blobs_refresh(key) }
  });
  let toggle_butt = make('button',
  {
    cla: 'butt exe',
    con: view_mode === 'grid' ? 'list view' : 'grid view',
    clk: e=>{ e.preventDefault(); b.toggle_view(key) }
  });
  let time_ts = Math.floor((value?.last_refresh || Date.now()) / 1000);
  let time_el = aa.mk.time(time_ts);
  let butts = make('div', {cla: 'butts', app: [toggle_butt]});
  let list_controls = make('div', {cla: 'list_controls', app: [time_el, ' ', refresh_butt, ' ', butts]});

  let blobs = aa.mk.details(key, false, 0, 'mod_blobs mod_details');
  blobs.append(list_controls, blobs_list);
  let summary = blobs.firstElementChild;
  summary.dataset.count = saved.length;
  if (is_def || is_backup)
  {
    let parts = [];
    if (is_def) parts.push('default');
    if (is_backup) parts.push('backup');
    summary.append(make('span', {cla: 'b_tag', con: parts.join(' · ')}));
  }

  let item = make('li',
  {
    cla: 'item' + (is_def ? ' def' : '') + (is_backup ? ' backup' : ''),
    app: [actions, ' ', blobs],
  });

  b.server_blobs.set(key,
  {
    details: blobs,
    list: blobs_list,
    summary,
    time_el,
    toggle_butt,
    last: value?.last_refresh || 0,
  });
  if (saved.length) b.server_blobs_time_upd(key);

  return item
};


// CLI: b upload (opens file picker)
b.cli_upload =async()=>
{
  aa.mk.b_upload();
};


// CLI: b list
b.cli_list =async(string='')=>
{
  let [server,pubkey] = aa.fx.splitr(string);
  if (!server) server = b.get_def();
  const descriptors = await b.list(server,pubkey);
  if (!descriptors) return;
  if (!descriptors.length)
  {
    aa.log('b list: no blobs found');
    return
  }
  aa.mk.b_list(descriptors,server);
};


// CLI: b delete
b.cli_delete =async(string='')=>
{
  let sha256 = string.trim();
  if (!sha256)
  {
    aa.log('b delete: no sha256');
    return
  }
  await b.del(sha256);
};


// CLI: b def — set default server
b.cli_def =(string='')=>
{
  if (!string)
  {
    let def = b.get_def();
    aa.log(def ? `b default: ${def}` : 'b: no default server');
    return
  }
  let url = aa.fx.url(string)?.href;
  if (!url)
  {
    aa.log('b def: invalid url');
    return
  }
  if (url.endsWith('/')) url = url.slice(0, -1);
  let prev = b.o.def;
  if (!b.o.ls[url]) b.add(string);
  b.o.def = url;
  aa.mod.save(b);
  aa.mod.ui(b, [url, prev].filter(Boolean));
  aa.log(`b default: ${url}`);
  b.server_blobs_refresh(url);
};


// CLI: b backup — set backup server (auto-mirror target on upload)
b.cli_backup =(string='')=>
{
  string = string.trim();
  if (!string)
  {
    let backup = b.get_backup();
    aa.log(backup ? `b backup: ${backup}` : 'b: no backup server');
    return
  }
  let prev = b.o.backup;
  if (string === 'off' || string === 'clear')
  {
    b.o.backup = '';
    aa.mod.save(b);
    aa.mod.ui(b, [prev].filter(Boolean));
    aa.log('b backup: cleared');
    return
  }
  let url = aa.fx.url(string)?.href;
  if (!url)
  {
    aa.log('b backup: invalid url');
    return
  }
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!b.o.ls[url]) b.add(string);
  b.o.backup = url;
  aa.mod.save(b);
  aa.mod.ui(b, [url, prev].filter(Boolean));
  aa.log(`b backup: ${url}`);
};


// CLI: b mirror
b.cli_mirror =async(string='')=>
{
  let url = string.trim();
  if (!url)
  {
    aa.log('b mirror: no url');
    return
  }
  await b.mirror(url);
};


// auth-batch size: how many `x` tags one signed kind-24242 covers.
// each batch costs one signer prompt; nsyte uses 20, we use 21 for parity
// with alphaama's other "21" defaults.
b.sync_batch = 21;


// copy all blobs the user has on `source` over to `dest`, skipping ones the
// destination already has. uses one signed auth event per batch (BUD-11 allows
// multiple x tags) so 210 files cost ~10 signer prompts, not 210.
b.sync =async(source, dest)=>
{
  if (!source || !dest) { aa.log('b sync: need both source and dest'); return }
  if (source.endsWith('/')) source = source.slice(0, -1);
  if (dest.endsWith('/')) dest = dest.slice(0, -1);
  if (source === dest) { aa.log('b sync: source and dest are the same'); return }

  let pubkey = aa.bus.request('u:pubkey');
  if (!pubkey) { aa.log('b sync: no pubkey'); return }

  aa.log(`b sync: ${source} → ${dest}`);

  const [src_list, dst_list] = await Promise.all(
  [
    b.list(source, pubkey),
    b.list(dest, pubkey),
  ]);
  if (!src_list) { aa.log(`b sync: failed to list ${source} (source must support /list)`); return }
  if (!src_list.length) { aa.log('b sync: source is empty'); return }

  // dest /list works → fast set-difference
  // dest /list disallowed → fall back to per-blob HEAD probes (chunked)
  let missing;
  if (dst_list)
  {
    const dst_hashes = new Set(dst_list.map(d => d.sha256));
    missing = src_list.filter(d => !dst_hashes.has(d.sha256));
  }
  else
  {
    aa.log(`b sync: ${dest} doesn't allow /list — probing ${src_list.length} blob(s) via HEAD`);
    missing = [];
    const probe_chunk = 10;
    for (let i = 0; i < src_list.length; i += probe_chunk)
    {
      const chunk = src_list.slice(i, i + probe_chunk);
      const results = await Promise.all(chunk.map(d => b.head(dest, d.sha256).then(exists => ({d, exists}))));
      for (const {d, exists} of results)
      {
        if (exists) b.server_blobs_add(dest, {...d, url: `${dest}/${d.sha256}`});
        else missing.push(d);
      }
      aa.log(`b sync: probed ${Math.min(i + chunk.length, src_list.length)}/${src_list.length}`);
    }
  }

  if (!missing.length) { aa.log('b sync: already in sync'); return }

  const batches = Math.ceil(missing.length / b.sync_batch);
  const proceed = await new Promise(resolve=>
  {
    aa.mk.confirm(
    {
      title: 'b sync',
      l: make('div', {app:
      [
        make('p', {con: `${missing.length} missing blob(s) on ${dest}`}),
        make('p', {con: `${batches} signer prompt(s) — one kind-24242 event per ${b.sync_batch} files, each covering all of that batch's hashes as "x" tags. ${dest} will then fetch the blobs directly from ${source}.`}),
      ]}),
      yes: {title: `mirror ${missing.length}`, exe: ()=> resolve(true)},
      no:  {title: 'cancel',                   exe: ()=> resolve(false)},
    });
  });
  if (!proceed) { aa.log('b sync: cancelled'); return }

  aa.log(`b sync: ${missing.length} missing blob(s) to mirror`);

  let ok = 0, fail = 0;
  for (let i = 0; i < missing.length; i += b.sync_batch)
  {
    const batch = missing.slice(i, i + b.sync_batch);
    const auth = await b.auth('upload',
    {
      sha256: batch.map(d => d.sha256),
      server: dest,
      expiration: 3600,
    });
    if (!auth) { aa.log('b sync: auth failed, aborting'); return }

    await Promise.all(batch.map(async d =>
    {
      try
      {
        const res = await fetch(dest + '/mirror',
        {
          method: 'PUT',
          headers: {'Authorization': auth, 'Content-Type': 'application/json'},
          body: JSON.stringify({url: d.url}),
        });
        if (res.ok)
        {
          ok++;
          // record locally so the dest panel stays meaningful even if /list
          // is disallowed; we know the blob landed because the server 200'd.
          // url is rewritten to point at dest (d came from source).
          b.server_blobs_add(dest, {...d, url: `${dest}/${d.sha256}`});
        }
        else
        {
          const reason = res.headers.get('X-Reason') || res.statusText;
          aa.log(`b sync: ${d.sha256.slice(0,12)}… failed: ${reason}`);
          fail++;
        }
      }
      catch (e)
      {
        aa.log(`b sync: ${d.sha256.slice(0,12)}… error: ${e.message}`);
        fail++;
      }
    }));

    aa.log(`b sync: ${Math.min(i + batch.length, missing.length)}/${missing.length} (ok ${ok}, fail ${fail})`);
  }

  aa.log(`b sync: done — ${ok} mirrored, ${fail} failed`);

  if (b.server_blobs?.has(dest)) b.server_blobs_refresh(dest);
};


// CLI: b sync <source> <dest>
// accepts 'def' / 'backup' as keyword shortcuts for the configured servers
b.cli_sync =async(string='')=>
{
  let [source, dest] = aa.fx.splitr(string);
  const resolve =s=>
  {
    if (s === 'def') return b.get_def();
    if (s === 'backup') return b.get_backup();
    return s
  };
  source = resolve(source);
  dest = resolve(dest);
  if (!source || !dest)
  {
    aa.log('b sync: usage: b sync <source|def|backup> <dest|def|backup>');
    return
  }
  await b.sync(source, dest);
};


// on load
b.load =async()=>
{
  const mod = b;
  const id = mod.def.id;

  aa.actions.push(
    {
      action:[id,'add'],
      required:['<server_url>'],
      description:'add blossom server',
      exe:mod.add
    },
    {
      action:[id,'rm'],
      required:['<server_url>'],
      description:'remove blossom server',
      exe:mod.rm
    },
    {
      action:[id,'def'],
      optional:['<server_url>'],
      description:'set default blossom server',
      exe:mod.cli_def
    },
    {
      action:[id,'backup'],
      optional:['<server_url|off>'],
      description:'set backup blossom server (auto-mirror on upload)',
      exe:mod.cli_backup
    },
    {
      action:[id,'upload'],
      description:'upload file to blossom server',
      exe:mod.cli_upload
    },
    {
      action:[id,'list'],
      optional:['<server>','<pubkey>'],
      description:'list your blobs on blossom server',
      exe:mod.cli_list
    },
    {
      action:[id,'del'],
      required:['<sha256>'],
      description:'delete blob from blossom server',
      exe:mod.cli_delete
    },
    {
      action:[id,'mirror'],
      required:['<url>'],
      description:'mirror a blob url to your blossom server',
      exe:mod.cli_mirror
    },
    {
      action:[id,'sync'],
      required:['<source|def|backup>','<dest|def|backup>'],
      description:'copy missing blobs from source to dest (one auth event per 21 files)',
      exe:mod.cli_sync
    },
  );

  await aa.mod.load(mod);

  // migrate legacy entries: strip any trailing slash from server keys / def
  // / backup so they match the storage convention used by b.add. without
  // this, an old slash-keyed entry stays in b.o.ls and aa.mod.ui appends a
  // new (slash-less) entry alongside it on the first def/backup change.
  if (b.o?.ls)
  {
    let changed = false;
    for (const k of Object.keys(b.o.ls))
    {
      if (!k.endsWith('/')) continue;
      let nk = k.slice(0, -1);
      if (b.o.ls[nk]) Object.assign(b.o.ls[nk], b.o.ls[k]);
      else b.o.ls[nk] = b.o.ls[k];
      delete b.o.ls[k];
      changed = true;
    }
    if (b.o.def?.endsWith('/')) { b.o.def = b.o.def.slice(0, -1); changed = true; }
    if (b.o.backup?.endsWith('/')) { b.o.backup = b.o.backup.slice(0, -1); changed = true; }
    if (changed) aa.mod.save(b);
  }

  aa.mod.mk(mod);

  aa.mod.ready('u:pubkey', b.mod_blobs_init);
};


// scheduled-refresh interval for the def server's blob list (ms)
b.refresh_interval = 24 * 60 * 60 * 1000;


// fetch + repaint one server's per-item blob list
// idempotent (guards against overlapping calls per server)
b.server_blobs_refresh =async server=>
{
  let refs = b.server_blobs?.get(server);
  if (!refs || refs.refreshing) return;
  refs.refreshing = true;
  try
  {
    let descriptors = await b.list(server);
    if (!descriptors) return;
    b.server_blobs_paint(server, descriptors);
  }
  finally { refs.refreshing = false }
};


// paint a known set of descriptors into the per-server panel, persist them,
// and re-arm the def-server schedule. used by server_blobs_refresh (auto)
// and by cli_list (after the user-triggered fetch).
b.server_blobs_paint =(server, descriptors)=>
{
  let refs = b.server_blobs?.get(server);
  if (!refs) return;
  let items = descriptors.map(d => aa.mk.b_list_item(d));
  refs.last = Date.now();
  refs.summary.dataset.count = descriptors.length;
  fastdom.mutate(()=> refs.list.replaceChildren(...items));
  if (!b.o.ls[server]) b.o.ls[server] = {url: server};
  b.o.ls[server].last_descriptors = descriptors;
  b.o.ls[server].last_refresh = refs.last;
  aa.mod.save_to(b);
  b.server_blobs_time_upd(server);
  if (server === b.get_def()) b.mod_blobs_schedule_next();
};


// register a single descriptor we know lives on `server` (from upload, mirror,
// or sync success). lets the panel show a meaningful list even when the
// server disallows /list. dedupes by sha256.
b.server_blobs_add =(server, descriptor)=>
{
  if (!descriptor?.sha256) return;
  if (!b.o.ls[server]) b.o.ls[server] = {url: server};
  let list = b.o.ls[server].last_descriptors = b.o.ls[server].last_descriptors || [];
  if (list.some(d => d.sha256 === descriptor.sha256)) return;
  list.unshift(descriptor);
  b.o.ls[server].last_refresh = Date.now();
  aa.mod.save_to(b);

  let refs = b.server_blobs?.get(server);
  if (refs)
  {
    refs.last = b.o.ls[server].last_refresh;
    refs.summary.dataset.count = list.length;
    fastdom.mutate(()=> refs.list.prepend(aa.mk.b_list_item(descriptor)));
    b.server_blobs_time_upd(server);
  }
};


// drop a known descriptor from `server`'s panel (from successful delete).
b.server_blobs_remove =(server, sha256)=>
{
  let entry = b.o.ls[server];
  if (!entry?.last_descriptors?.length) return;
  let before = entry.last_descriptors.length;
  entry.last_descriptors = entry.last_descriptors.filter(d => d.sha256 !== sha256);
  if (entry.last_descriptors.length === before) return;
  entry.last_refresh = Date.now();
  aa.mod.save_to(b);

  let refs = b.server_blobs?.get(server);
  if (refs)
  {
    refs.last = entry.last_refresh;
    refs.summary.dataset.count = entry.last_descriptors.length;
    let items = entry.last_descriptors.map(d => aa.mk.b_list_item(d));
    fastdom.mutate(()=> refs.list.replaceChildren(...items));
    b.server_blobs_time_upd(server);
  }
};


// update the elapsed-time display for one server's blob list
b.server_blobs_time_upd =server=>
{
  let refs = b.server_blobs?.get(server);
  if (!refs?.time_el || !refs.last) return;
  let d = new Date(refs.last);
  let ts = Math.floor(refs.last / 1000);
  fastdom.mutate(()=>
  {
    // sync the time element to the new last_refresh — textContent holds the
    // timestamp (read back by aa.fx.time_upd on click), dataset.elapsed and
    // title mirror the helper's own initialization.
    refs.time_el.textContent = ts;
    refs.time_el.dataset.elapsed = aa.fx.time_elapsed(d);
    refs.time_el.title = aa.fx.time_display(ts);
    refs.time_el.setAttribute('datetime', d.toISOString());
  });
};


// toggle list <-> grid view for one server's panel; persists per-server
b.toggle_view =server=>
{
  if (!b.o.ls[server]) return;
  let mode = b.o.ls[server].view_mode === 'grid' ? 'list' : 'grid';
  b.o.ls[server].view_mode = mode;
  aa.mod.save_to(b);
  let refs = b.server_blobs?.get(server);
  if (!refs) return;
  fastdom.mutate(()=>
  {
    refs.list.classList.toggle('grid', mode === 'grid');
    if (refs.toggle_butt) refs.toggle_butt.textContent = mode === 'grid' ? 'list view' : 'grid view';
  });
};


// schedule the next def-server auto refresh after `delay` ms
b.mod_blobs_schedule_next =(delay = b.refresh_interval)=>
{
  if (b.mod_blobs_timer) clearTimeout(b.mod_blobs_timer);
  b.mod_blobs_timer = setTimeout(()=>
  {
    let def = b.get_def();
    if (def) b.server_blobs_refresh(def);
  }, delay);
};


// on u:pubkey: start the time-display tick, then decide whether the def
// server's persisted list is fresh (paint as-is) or stale (refresh now).
b.mod_blobs_init =()=>
{
  if (b.mod_blobs_time_timer) clearInterval(b.mod_blobs_time_timer);
  b.mod_blobs_time_timer = setInterval(()=>
  {
    for (const server of b.server_blobs.keys())
      b.server_blobs_time_upd(server);
  }, 60 * 1000);

  let def = b.get_def();
  if (!def) return;
  let last = b.o.ls[def]?.last_refresh || 0;
  let elapsed = Date.now() - last;
  if (!last || elapsed >= b.refresh_interval)
    b.server_blobs_refresh(def);
  else
    b.mod_blobs_schedule_next(b.refresh_interval - elapsed);
};


export default b
