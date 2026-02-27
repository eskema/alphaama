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
      ['mk 10063','k10063'],
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
    aa.log(`b list failed: ${res.statusText}`);
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
    if (b.o.ls[url])
    {
      delete b.o.ls[url];
      if (b.o.def === url)
        b.o.def = Object.keys(b.o.ls)[0] || '';
      let li = b.mod_li?.get(url);
      if (li)
      {
        li.remove();
        b.mod_li.delete(url);
      }
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


// get servers for a pubkey from kind 10063 profile data
b.get_servers =async pubkey=>
{
  let p = await aa.p.get(pubkey);
  if (!p?.blossom?.length) return [];
  return p.blossom
};




// custom item renderer for mod UI
b.mk =(key, value)=>
{
  const id = b.def.id;
  let is_def = b.o.def === key;
  let actions = make('div',
  {
    cla: 'mod_actions',
    app:
    [
      aa.mk.butt_action(`${id} def ${key}`, 'def', 'def'),
      aa.mk.butt_action(`${id} rm ${key}`, 'del', 'del'),
    ]
  });
  let item = make('li',
  {
    cla: 'item' + (is_def ? ' def' : ''),
    app:
    [
      make('span', {cla: 'key', con: key}),
      ' ', actions,
    ]
  });
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
  let prev = b.o.def;
  if (!b.o.ls[url]) b.add(string);
  b.o.def = url;
  aa.mod.save(b);
  aa.mod.ui(b, [url, prev].filter(Boolean));
  aa.log(`b default: ${url}`);
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
      action:[id,'upload'],
      description:'upload file to blossom server',
      exe:mod.cli_upload
    },
    {
      action:[id,'list'],
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
  );

  await aa.mod.load(mod);
  aa.mod.mk(mod);
};


export default b
