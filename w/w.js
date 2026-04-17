/*

alphaama
mod    w
wallnut: zaps, nwc, cashu

*/



// w
aa.w =
{
  name:'wallnut',
  about:'zaps, nwc, cashu',
  def:
  {
    id:'w',
    ls:{},
  },
  scripts:
  [
    '/w/cashu-ts.iife.js',
    '/w/clk.js',
    '/w/kinds.js',
    '/w/mk.js',
  ],
  styles:
  [
    '/w/w.css',
  ],
  butts:
  {
    mod:
    [
      [`k 10019`,'k10019']
    ],
    init:
    [
      [`w import`,'import']
    ]
  }
};




// --- zap (NIP-57) ---


// zap: full flow
// parses: amount pubkey "memo" [event_id]
aa.w.zap =async(string='')=>
{
  let args = aa.fx.splitr(string);
  let amount = parseInt(args[0]);
  if (!amount || amount < 1)
  {
    aa.log('w zap: invalid amount');
    return
  }
  let pubkey = args[1];
  if (!pubkey || !aa.fx.is_key(pubkey))
  {
    aa.log('w zap: invalid pubkey');
    return
  }

  // extract memo (may be quoted)
  let memo = '';
  let event_id;
  let rest = args.slice(2).join(' ');
  let quote_match = rest.match(/^"([^"]*)"(.*)$/);
  if (quote_match)
  {
    memo = quote_match[1];
    let after = quote_match[2].trim();
    if (after && aa.fx.is_key(after)) event_id = after;
  }
  else if (args[2])
  {
    if (aa.fx.is_key(args[2])) event_id = args[2];
    else memo = args[2];
  }

  let msats = amount * 1000;

  // refresh recipient data from relays (kind 0 for lud16, kind 10019 for p2pk)
  aa.log('w zap: refreshing ' + pubkey.slice(0,8) + '…');
  let refresh = await aa.r.get(
  {
    id:'w_zap_refresh',
    filter:{authors:[pubkey],kinds:[0,10019],limit:2}
  });

  // gather fresh data from results
  let k0_event;
  let p2pk;
  for (const [,dat] of refresh.events)
  {
    let k = dat.event.kind;
    if (k === 0 && (!k0_event || dat.event.created_at > k0_event.created_at))
      k0_event = dat.event;
    if (k === 10019)
      p2pk = aa.fx.tag_value(dat.event.tags,'pubkey');
  }

  // fall back to cached metadata
  if (!k0_event)
  {
    let p = await aa.p.author(pubkey);
    let k0_id = aa.p.events_last(p,'k0');
    let dat = k0_id ? await aa.e.get(k0_id) : null;
    k0_event = dat?.event;
  }
  if (!k0_event)
  {
    aa.log('w zap: no metadata for ' + pubkey);
    return
  }

  // fall back to cached p2pk
  if (!p2pk) p2pk = aa.db.p[pubkey]?.p2pk;

  // queue fetched events for rendering (non-blocking)
  for (const [,dat] of refresh.events) aa.bus.emit('e:print_q',dat);

  // get lnurl endpoint
  let endpoint;
  try { endpoint = await NostrTools.nip57.getZapEndpoint(dat.event) }
  catch(err)
  {
    aa.log('w zap: failed to get endpoint: ' + err.message);
    return
  }
  if (!endpoint)
  {
    aa.log('w zap: no lightning address for ' + pubkey);
    return
  }

  // build zap request (kind 9734)
  let zap_opts =
  {
    pubkey,
    amount:msats,
    relays:aa.r.r,
    comment:memo,
  };

  // attach event if zapping a specific note
  if (event_id)
  {
    let event_dat = await aa.e.get(event_id);
    if (event_dat) zap_opts.event = event_dat.event;
  }

  let zap_request = NostrTools.nip57.makeZapRequest(zap_opts);

  // sign the zap request
  let signed = await aa.bus.request('e:sign',zap_request);
  if (!signed)
  {
    aa.log('w zap: signing failed');
    return
  }

  // call lnurl callback
  let callback_url = `${endpoint}?amount=${msats}&nostr=${encodeURIComponent(JSON.stringify(signed))}`;
  let response;
  try
  {
    response = await fetch(callback_url);
    response = await response.json();
  }
  catch(err)
  {
    aa.log('w zap: callback failed: ' + err.message);
    return
  }

  if (!response.pr)
  {
    aa.log('w zap: no invoice in response');
    if (response.reason) aa.log('w zap: ' + response.reason);
    return
  }

  aa.log('w zap: invoice received for ' + amount + ' sats');
  aa.w.zap_pay(response.pr);
};


// route payment: nwc → auto-melt → manual dialog
aa.w.zap_pay =async(bolt11)=>
{
  // try nwc
  let nwc = await aa.w.nwc_get();
  if (nwc)
  {
    let paid = await aa.w.nwc_pay(bolt11);
    if (paid) return
  }

  // try auto-melt if option is on
  if (localStorage.auto_melt === 'on')
  {
    let paid = await aa.w.melt_invoice(bolt11);
    if (paid) return
  }

  // fallback: manual dialog
  aa.w.zap_present(bolt11);
};


// melt a bolt11 invoice from cashu balance
// tries each mint until one has enough balance
aa.w.melt_invoice =async(bolt11)=>
{
  if (!aa.w.o?.enabled) return false;
  let mints = aa.w.o?.ls?.mints;
  if (!mints) return false;

  for (const url in mints)
  {
    let proofs = await aa.w.proofs_get(url);
    if (!proofs.length) continue;
    let balance = aa.w.sum_amounts(proofs);
    if (!balance) continue;

    try
    {
      let {wallet} = await aa.w.get_active(url);
      if (!wallet) continue;
      let quote = await wallet.createMeltQuoteBolt11(bolt11);
      if (!quote) continue;
      let needed = quote.amount + quote.fee_reserve;
      if (balance < needed) continue;

      aa.log('w melt: paying ' + needed + ' sats from ' + url);
      let {keep,send} = await wallet.ops.send(needed,proofs).includeFees().run();
      let melt_response = await wallet.meltProofs(quote,send);
      keep.push(...(melt_response.change || []));
      await aa.w.proofs_out(keep,url);
      aa.w.tx_log('melt',-needed,url,'invoice');
      await aa.w.save();
      aa.log('w melt: paid');
      return true
    }
    catch(err) { continue }
  }
  return false
};


// fallback: show lightning link + qr code
aa.w.zap_present =(bolt11)=>
{
  let sats = NostrTools.nip57.getSatoshisAmountFromBolt11(bolt11);
  let l = make('div',{cla:'zap_invoice'});

  // amount
  if (sats) l.append(make('p',{con:`${sats} sats`,cla:'zap_amount'}));

  // lightning: link
  let link = make('a',{con:'open in wallet',cla:'butt zap_wallet_link',href:`lightning:${bolt11}`});
  l.append(link);

  // qr code
  let qr_el = make('div',{cla:'zap_qr'});
  l.append(qr_el);
  try { new QRCode(qr_el,{text:bolt11.toUpperCase(),width:256,height:256,correctLevel:QRCode.CorrectLevel.L}) }
  catch(err) { aa.log('w zap: qr failed: ' + err.message) }

  // copy invoice button
  l.append(aa.mk.butt_clip(bolt11,{con:'copy invoice'}));

  // cashu melt button (if wallnut active)
  if (aa.w.o?.enabled)
  {
    let melt_butt = make('button',
    {
      con:'pay with cashu',
      cla:'butt exe',
      clk:async()=>
      {
        let paid = await aa.w.melt_invoice(bolt11);
        if (paid)
        {
          let dialog = aa.el.get('dialog');
          if (dialog?.open) dialog.close();
        }
      }
    });
    l.append(melt_butt);
  }

  aa.mk.confirm(
  {
    title:'zap invoice',
    l,
    no:{title:'done'}
  });
};



// --- NWC (NIP-47) ---


// store nwc connection string
aa.w.nwc_set =async(string='')=>
{
  if (!string)
  {
    // show status
    let nwc = await aa.w.nwc_get();
    if (nwc)
    {
      let parsed = NostrTools.nip47.parseConnectionString(nwc);
      aa.log('w nwc: connected to ' + parsed.pubkey.slice(0,8) + '… relay: ' + parsed.relay);
    }
    else aa.log('w nwc: not configured. use `w nwc <connection_string>`');
    return
  }

  if (string === 'clear')
  {
    await aa.w.nwc_clear();
    aa.log('w nwc: cleared');
    return
  }

  // validate
  try { NostrTools.nip47.parseConnectionString(string) }
  catch(err)
  {
    aa.log('w nwc: invalid connection string: ' + err.message);
    return
  }

  await aa.u.decrypt_cache.add('_nwc',string);
  aa.log('w nwc: connection saved');
};


// get nwc connection string from cache
aa.w.nwc_get =async()=>
{
  return await aa.u.decrypt_cache.get('_nwc')
};


// clear nwc
aa.w.nwc_clear =async()=>
{
  await aa.u.decrypt_cache.load();
  delete aa.u.decrypt_cache._data.events['_nwc'];
  await aa.u.decrypt_cache.save();
};


// pay invoice via nwc
aa.w.nwc_pay =async(bolt11)=>
{
  let nwc_string = await aa.w.nwc_get();
  if (!nwc_string) return false;

  let {pubkey,relay,secret} = NostrTools.nip47.parseConnectionString(nwc_string);

  // build signed+encrypted kind 23194
  let event;
  try { event = await NostrTools.nip47.makeNwcRequestEvent(pubkey,secret,bolt11) }
  catch(err)
  {
    aa.log('w nwc: failed to create request: ' + err.message);
    return false
  }

  // standalone websocket to wallet relay
  return new Promise(resolve=>
  {
    let ws;
    let timeout_id;
    let resolved = false;

    const cleanup =()=>
    {
      if (timeout_id) clearTimeout(timeout_id);
      try { ws?.close() } catch(e) {}
    };

    const done =(success,msg)=>
    {
      if (resolved) return;
      resolved = true;
      cleanup();
      if (msg) aa.log(msg);
      resolve(success);
    };

    try { ws = new WebSocket(relay) }
    catch(err)
    {
      done(false,'w nwc: failed to connect to ' + relay);
      return
    }

    timeout_id = setTimeout(()=> done(false,'w nwc: timeout waiting for response'),15000);

    ws.onopen =()=>
    {
      // send event
      ws.send(JSON.stringify(['EVENT',event]));
      // subscribe for response
      let sub_id = 'nwc_' + event.id.slice(0,8);
      ws.send(JSON.stringify(['REQ',sub_id,
      {
        kinds:[23195],
        authors:[pubkey],
        '#e':[event.id],
        limit:1
      }]));
    };

    ws.onmessage =msg=>
    {
      let data;
      try { data = JSON.parse(msg.data) } catch(e) { return }
      if (data[0] !== 'EVENT') return;

      let response_event = data[2];
      if (!response_event || response_event.kind !== 23195) return;

      // decrypt response (nip04 with raw secret key)
      try
      {
        let result = NostrTools.nip04.decrypt(secret,pubkey,response_event.content);
        let parsed = JSON.parse(result);
        if (parsed.error)
          done(false,'w nwc: payment failed: ' + (parsed.error.message || parsed.error.code));
        else if (parsed.result_type === 'pay_invoice')
          done(true,'w nwc: zap paid');
        else
          done(false,'w nwc: unexpected response');
      }
      catch(err) { done(false,'w nwc: decrypt error: ' + err.message) }
    };

    ws.onerror =()=> done(false,'w nwc: websocket error');
    ws.onclose =()=>
    {
      if (!resolved) done(false,'w nwc: connection closed');
    };
  })
};



// --- cashu (NIP-60/61) ---


// add mint to wallnut
aa.w.add =(string='')=>
{
  // s = mint mint...
  let urls = aa.fx.splitr(string);
  let added = [];
  let needs_saving;
  if (urls.length)
  {
    for (let url of urls)
    {
      url = aa.fx.url(url.trim())?.href;
      let mint = aa.w.get_mint(url);
      if (!mint && url)
      {
        mint = aa.w.o.ls.mints[url] = {proofs:[],quotes:{},url};
        if (aa.w.o.ls.def === '') aa.w.o.ls.def = url;
        needs_saving = true;
      }
      if (mint) added.push(mint);
    }
  }
  if (needs_saving) aa.w.save();
  return added
};


// updates and returns sum of all proofs
aa.w.balance =()=>
{
  let balance = aa.w.sum_amounts(Object.values(aa.w.o.ls.mints));
  aa.w.o.ls.balance = balance;
  aa.mod.mk(aa.w);
  return balance
}


// get active wallet from mint
// if no mint is provided
// def is returned
aa.w.get_active =async url=>
{
  if (!url) url = aa.w.get_def();
  if (!url)
  {
    aa.log('w: no mints defined yet, use `w add` first');
    return []
  }
  // check for already initialized wallet
  let active = aa.w.active[url] || {};
  if (active.wallet) return active;

  active.url = url;
  // instantiate a new wallet
  // check if mint is cached
  active.wallet = new cashuts.Wallet(url);
  let mint = aa.w.get_mint(url);
  if (mint.cache)
  {
    active.wallet.loadMintFromCache(mint.cache.info,mint.cache.keys);
  }
  else
  {
    await active.wallet.loadMint();
    let keys = active.wallet.keyChain.cache;
    let info = active.wallet.getMintInfo().cache;
    mint.cache = {keys,info};
    aa.w.save();
  }
  active.mint = mint;

  aa.w.active[url] = active;

  return active
};


// get default mint
// fallback to first active
// fallback to first added
aa.w.get_def =()=>
{
  return aa.w.o.ls.def
  || Object.keys(aa.w.active)[0]
  || Object.keys(aa.w.o.ls.mints)[0];
};


// get mint object
aa.w.get_mint =s=> aa.w.o.ls.mints[s];


// import wallnut from kind 17375 / 37375
aa.w.import =async(id='')=>
{
  if (!id)
  {
    aa.log('w import: no id provided');
    return
  }

  let dat = await aa.e.get(id);
  if (!dat)
  {
    aa.log('w import: event not found');
    return
  }

  let kind_17375 = aa.w.o?.kind_17375;
  if (kind_17375 && dat.event.created_at <= kind_17375.created_at)
  {
    aa.log('w import: event is not newer');
    return
  }

  let decrypted_tags = await aa.fx.decrypt_parse(dat.event);
  if (!decrypted_tags)
  {
    aa.log('w import: failed to decrypt');
    return
  }
  decrypted_tags.push(...dat.event.tags);

  let mints = aa.fx.tags_values(decrypted_tags,'mint');
  let privkey = aa.fx.tag_value(decrypted_tags,'privkey');

  if (mints?.length) aa.w.add(mints.join(' '));
  if (privkey?.length) aa.w.key(privkey,{silent:true});

  aa.w.o.kind_17375 = dat.event;
  aa.w.save();
};


//
aa.w.import_7375 =async(id='')=>
{
  if (!id)
  {
    aa.log('w import: no id provided');
    return
  }

  let dat = await aa.e.get(id);
  if (!dat)
  {
    aa.log('w import: event not found');
    return
  }

  let {mint,proofs} = await aa.fx.decrypt_parse(dat.event);
  let url = aa.fx.url(mint)?.href;
  if (!url)
  {
    aa.log('w import: invalid mint url');
    return
  }

  mint = aa.w.get_mint(url);
  if (!mint) mint = aa.w.add(url)[0];

  if (proofs?.length) aa.w.proofs_in(proofs,url);
  aa.w.save();
  return proofs
};


// check if nutzap has been redeemed, track if not
aa.w.is_redeemed =async id=>
{
  let ls = aa.w.o?.ls;
  if (!ls) return false;
  if (!(ls.redeemed instanceof Set)) ls.redeemed = new Set(ls.redeemed || []);
  if (!(ls.redeemable instanceof Map)) ls.redeemable = new Map(Object.entries(ls.redeemable || {}));
  if (ls.redeemed.has(id)) return true;
  // track as redeemable
  if (!ls.redeemable.has(id))
  {
    ls.redeemable.set(id,{ts:Math.floor(Date.now()/1000)});
    aa.w.save();
  }
  return false
};


// mark nutzap as redeemed
aa.w.mark_redeemed =id=>
{
  let ls = aa.w.o?.ls;
  if (!ls) return;
  if (!(ls.redeemed instanceof Set)) ls.redeemed = new Set(ls.redeemed || []);
  if (!(ls.redeemable instanceof Map)) ls.redeemable = new Map(Object.entries(ls.redeemable || {}));
  ls.redeemed.add(id);
  ls.redeemable.delete(id);
};


// add keypair to wallnut
// opts.silent — suppress confirm dialog and 'update wallet events?' prompt
// (used by import: the imported key is already published, nothing to re-publish)
aa.w.key =async(privkey='',opts={})=>
{
  const silent = opts.silent === true;
  const has_keys = (await aa.u.decrypt_cache.size()).keys > 0;
  if (has_keys && !silent && !window.confirm('Add another private key?')) {
    return;
  }

  const pubkey = await aa.u.decrypt_cache.add_key(privkey);
  if (pubkey)
  {
    let prev = aa.w.o.ls.p2pk;
    let rotated = prev && prev !== pubkey;
    if (rotated)
    {
      if (!aa.w.o.ls.rotated_keys) aa.w.o.ls.rotated_keys = [];
      if (!aa.w.o.ls.rotated_keys.includes(prev))
        aa.w.o.ls.rotated_keys.push(prev);
    }
    aa.w.o.ls.p2pk = pubkey;
    aa.w.save();

    if (!silent) aa.log(`w key: added ${pubkey}`);

    // prompt only when replacing an existing key — skip on first setup and on silent import
    if (rotated && !silent)
    {
      let k10019_butt = make('button',
      {
        con:'publish k:10019',
        cla:'butt exe',
        clk:()=> aa.mk.k10019()
      });
      let k17375_butt = make('button',
      {
        con:'publish k:17375',
        cla:'butt exe',
        clk:()=> aa.mk.k17375()
      });
      aa.log(make('p',
      {
        con:'update wallet events? ',
        app:[k10019_butt,' ',k17375_butt]
      }));
    }
  }
  return pubkey;
};


// init cashu (called from load or enable button)
aa.w.init_cashu =()=>
{
  let mod = aa.w;
  let id = mod.def.id;

  // ensure cashu state exists
  let ls = mod.o?.ls || mod.def.ls;
  if (!ls.mints) ls.mints = {};
  if (!(ls.redeemable instanceof Map)) ls.redeemable = new Map(Object.entries(ls.redeemable || {}));
  if (!(ls.redeemed instanceof Set)) ls.redeemed = new Set(ls.redeemed || []);
  if (!Object.hasOwn(ls,'def')) ls.def = '';
  if (!mod.active) mod.active = {};

  // auto_melt option
  if (!Object.hasOwn(localStorage,'auto_melt')) localStorage.auto_melt = 'off';

  // migrate proofs from w.o.ls to decrypt cache
  aa.w.proofs_migrate();

  // extend stock query definitions (in-memory)
  if (aa.q?.ls)
  {
    aa.q.ls.w = {"authors":["u"],"kinds":[7375,10019,17375,37375]};
    if (aa.q.ls.a) aa.fx.a_add(aa.q.ls.a.kinds,[10019,17375,37375]);
    if (aa.q.ls.b) aa.fx.a_add(aa.q.ls.b.kinds,[10019]);
    if (aa.q.ls.c) aa.fx.a_add(aa.q.ls.c.kinds,[10019]);
    if (aa.q.ls.f) aa.fx.a_add(aa.q.ls.f.kinds,[10019]);
    if (aa.q.ls.n) aa.fx.a_add(aa.q.ls.n.kinds,[9321,9735]);

    // persist wallnut kinds into saved queries (once)
    if (aa.q.o && !aa.q.o.ls.w)
    {
      let to_reset = ['w'];
      let modified = [];
      for (const key of ['a','b','c','f','n'])
      {
        let saved = aa.q.o.ls[key];
        if (!saved) { to_reset.push(key); continue }
        if (saved.o?.kinds?.includes(10019) || saved.o?.kinds?.includes(9321)) continue;
        let stock = aa.q.ls[key];
        let saved_kinds = [...(saved.o?.kinds || [])].sort().join();
        let stock_base = stock.kinds.filter(k=> k !== 10019 && k !== 17375 && k !== 37375 && k !== 9321 && k !== 9735);
        let stock_sorted = stock_base.sort().join();
        if (saved_kinds === stock_sorted) to_reset.push(key);
        else modified.push(key);
      }
      if (to_reset.length) aa.q.reset(to_reset);
      if (modified.length)
      {
        let butt = make('button',
        {
          con:'update',
          cla:'butt exe',
          clk:()=>{ aa.q.reset(modified); aa.log('w: queries updated') }
        });
        aa.log(make('p',
        {
          con:`wallnut: queries ${modified.join(', ')} need updating for cashu kinds. `,
          app:[butt]
        }));
      }
    }
  }
  // extend renders
  aa.fx.a_add(aa.e.rnd.encrypted,[7374,7375,7376,17375,37375]);
  if (!aa.e.rnd.no_auto_decrypt) aa.e.rnd.no_auto_decrypt = [];
  aa.fx.a_add(aa.e.rnd.no_auto_decrypt,[7374,7375,17375,37375]);
  // cashu actions
  aa.actions.push(
    {
      action:[id,'add'],
      required:['<mint_url>'],
      description:'add mint to wallnut',
      exe:mod.add
    },
    {
      action:[id,'key'],
      optional:['<privkey>'],
      description:'set private key to wallnut',
      exe:mod.key
    },
    {
      action:[id,'import'],
      required:['<event_id>'],
      description:'create wallnut from kind:17375/37375',
      exe:mod.import
    },
    {
      action:[id,'proofs'],
      required:['<event_id>'],
      description:'import proofs from kind:7375',
      exe:mod.import_7375
    },
    {
      action:[id,'quote'],
      required:['<amount>'],
      description:'mint quote',
      exe:mod.quote
    },
    {
      action:[id,'check'],
      required:['<quote_id>'],
      description:'keeps checking quote state',
      exe:mod.quote_check
    },
    {
      action:[id,'mint'],
      required:['<quote_id>'],
      description:'mint proofs from quote',
      exe:mod.mint
    },
    {
      action:[id,'melt'],
      required:['<invoice>'],
      description:'pay lightning invoice from wallnut proofs',
      exe:mod.melt
    },
    {
      action:[id,'token'],
      required:['<amount>'],
      optional:['<pubkey>','<memo>'],
      description:'create a token to send',
      exe:mod.token
    },
    {
      action:[id,'receive'],
      required:['<token>'],
      description:'receive a token',
      exe:mod.receive
    },
    {
      action:[id,'redeem'],
      required:['<event_id>'],
      description:'redeem a nut zap',
      exe:mod.redeem
    },
    {
      action:[id,'audit'],
      description:'check proof states and balance per mint',
      exe:mod.audit
    },
  );
  // nutzap buttons
  aa.e.butts?.na?.push(['nzap']);
  aa.p.butts?.pa?.push(['nzap']);
};


// on load
aa.w.load =async()=>
{
  let mod = aa.w;
  let id = mod.def.id;
  // w default options
  if (!Object.hasOwn(localStorage,'zap'))
    localStorage.zap = '21';
  if (!Object.hasOwn(localStorage,'zap_memo'))
    localStorage.zap_memo = '<3';

  // zap + nwc actions (always available)
  aa.actions.push(
    {
      action:[id,'zap'],
      required:['<amount>','<pubkey>'],
      optional:['<memo>','<event_id>'],
      description:'zap a pubkey or event',
      exe:mod.zap
    },
    {
      action:[id,'nwc'],
      optional:['<connection_string>'],
      description:'set/show/clear nwc connection',
      exe:mod.nwc_set
    },
  );
  // zap button (always available)
  aa.e.butts?.na?.push(['zap']);

  // load
  await aa.mod.load(mod);

  // cashu (gated on enable button via w.o.enabled)
  if (mod.o.enabled) aa.w.init_cashu();

  await aa.mod.mk(mod);
  if (!mod.o.enabled)
  {
    // show enable button in the info area
    let info = mod.mod_l?.querySelector('.mod_info');
    if (info)
    {
      let butt = make('button',
      {
        con:'enable wallnut',
        cla:'butt exe',
        clk:async()=>
        {
          if (!window.confirm('this is very experimental, use at your own risk. don\'t be stupid.')) return;
          mod.o.enabled = true;
          await aa.mod.save(mod);
          aa.w.init_cashu();
          await aa.mod.mk(mod);
          mod.mod_l?.classList.add('expanded');
          mod.start(mod);
        }
      });
      fastdom.mutate(()=>{ info.append(butt) });
    }
  }
  else mod.start(mod);
};


// melt proofs
aa.w.melt =async(invoice='')=>
{
  let {wallet,mint} = await aa.w.get_active();
  if (!wallet)
  {
    aa.log('w melt: no wallet')
    return
  }
  const quote = await wallet.createMeltQuoteBolt11(invoice);
  if (!quote)
  {
    aa.log('w melt: no quote')
    return
  }
  const amount = quote.amount + quote.fee_reserve;
  let proofs = await aa.w.proofs_get(mint.url);
  const {keep,send} = await wallet.ops.send(amount,proofs).includeFees().run();
  const melt_response = await wallet.meltProofs(quote,send);
  aa.log(aa.mk.ls({ls:melt_response}));
  console.log(melt_response);
  keep.push(...melt_response.change);

  aa.w.tx_log('melt',-amount,mint.url,invoice);
  aa.w.tx_out(keep,mint.url);
};


// mint proofs from quote
aa.w.mint =async(quote_id='')=>
{
  let {wallet,mint} = await aa.w.get_active();
  if (!wallet)
  {
    aa.log('w mint: no wallnut found');
    return
  }
  let amount = mint.quotes[quote_id]?.amount;
  if (!amount)
  {
    aa.log('w mint: no amount for quote')
    return;
  }
  aa.log(`w mint: ${aa.fx.units(amount)} from ${quote_id}`);

  let proofs = await wallet.mintProofsBolt11(amount,quote_id);
  aa.w.tx_log('mint',amount,mint.url,quote_id);
  aa.w.tx_in({proofs,url:mint.url});
};


// make w mod item
aa.w.mk =(key,value)=>
{
  switch (key)
  {
    case 'mints': return aa.mk.w_mints(key,value)
    case 'history': return aa.mk.w_history(value)
    case 'balance':
    case 'privkey':
    case 'redeemed':
    case 'redeemable':
      break;
    default: return aa.mk.item(key,value)
  }
};


aa.w.mod_butts =async(used)=>
{
  let mod = aa.w;
  if (used)
  {
    let df = new DocumentFragment();
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
    let upd_butt = aa.mk.butt_action(`k 10019`,'k10019');
    df.append(add_butt,' ',upd_butt);
    fastdom.mutate(()=>
    {
      mod.mod_l.insertBefore(df,mod.mod_l.lastChild);
    })
  }
  else
  {
    fastdom.mutate(()=>
    {
      mod.mod_l.append(aa.mk.butt_action(`${mod.def.id} import`,'import'))
    })
  }
};


// --- vault: AES-GCM encrypted proof storage in IDB ---
// no size limits (unlike NIP-44/sessionStorage)
// AES key stored small in decrypt_cache, proofs in IDB as encrypted blobs

aa.w.vault =
{
  _key:null,
  _map:null,
  _loaded:false,

  // get or create the AES key (stored in decrypt cache as base64)
  get_key:async()=>
  {
    if (aa.w.vault._key) return aa.w.vault._key;
    let stored = await aa.u.decrypt_cache.get('_w_vault_key');
    if (stored)
    {
      let raw = Uint8Array.from(atob(stored),c=> c.charCodeAt(0));
      aa.w.vault._key = await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
      return aa.w.vault._key;
    }
    // generate new key
    let key = await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
    let exported = new Uint8Array(await crypto.subtle.exportKey('raw',key));
    await aa.u.decrypt_cache.add('_w_vault_key',btoa(String.fromCharCode(...exported)));
    aa.w.vault._key = key;
    return key;
  },

  // encrypt JSON string → {iv, data} (both base64)
  encrypt:async json=>
  {
    let key = await aa.w.vault.get_key();
    let iv = crypto.getRandomValues(new Uint8Array(12));
    let encoded = new TextEncoder().encode(json);
    let encrypted = await crypto.subtle.encrypt({name:'AES-GCM',iv},key,encoded);
    return {
      iv:btoa(String.fromCharCode(...iv)),
      data:btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
  },

  // decrypt {iv, data} → JSON string
  decrypt:async blob=>
  {
    let key = await aa.w.vault.get_key();
    let iv = Uint8Array.from(atob(blob.iv),c=> c.charCodeAt(0));
    let data = Uint8Array.from(atob(blob.data),c=> c.charCodeAt(0));
    let decrypted = await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data);
    return new TextDecoder().decode(decrypted);
  },

  // load proofs map from IDB
  load:async()=>
  {
    if (aa.w.vault._loaded) return;
    aa.w.vault._loaded = true;
    let blob = await aa.db.ops('idb',{get:{store:'stuff',key:'w_vault'}});
    if (blob?.data)
    {
      try
      {
        let json = await aa.w.vault.decrypt(blob);
        aa.w.vault._map = aa.pj(json) || {};
      }
      catch(err) { aa.w.vault._map = {} }
    }
    else aa.w.vault._map = {};
  },

  // save proofs map to IDB (debounced)
  save:()=>
  {
    debt.add(async()=>
    {
      let json = JSON.stringify(aa.w.vault._map || {});
      let blob = await aa.w.vault.encrypt(json);
      blob.id = 'w_vault';
      await aa.db.ops('idb',{put:{store:'stuff',a:[blob]}});
    },2000,'w_vault_save');
  }
};


// migrate proofs from old locations to vault
aa.w.proofs_migrate =async()=>
{
  await aa.w.vault.load();
  let migrated;

  // from w.o.ls.mints[url].proofs (oldest format)
  let mints = aa.w.o?.ls?.mints;
  if (mints)
  {
    for (const url in mints)
    {
      if (mints[url].proofs?.length)
      {
        aa.w.vault._map[url] = mints[url].proofs;
        delete mints[url].proofs;
        migrated = true;
      }
    }
  }

  // from decrypt_cache (previous format)
  let cached = await aa.u.decrypt_cache.get('_w_proofs');
  if (cached)
  {
    let map = typeof cached === 'string' ? (aa.pj(cached) || {}) : cached;
    for (const url in map)
    {
      if (map[url]?.length)
      {
        aa.w.vault._map[url] = map[url];
        migrated = true;
      }
    }
    // remove from decrypt cache
    delete aa.u.decrypt_cache._data.events['_w_proofs'];
    aa.u.decrypt_cache.save();
  }

  if (migrated)
  {
    aa.w.vault.save();
    await aa.mod.save(aa.w);
    aa.log('w: migrated proofs to vault');
  }
};


// get proofs map
aa.w.proofs_map =async()=>
{
  await aa.w.vault.load();
  return aa.w.vault._map || {};
};


// get proofs for a mint
aa.w.proofs_get =async url=>
{
  let map = await aa.w.proofs_map();
  return map[url] || [];
};


// persist proofs (immediate in-memory, debounced to IDB)
aa.w.proofs_persist =map=>
{
  aa.w.vault._map = map;
  aa.w.vault.save();
};


// transaction history (local only)
aa.w.tx_log =(type,amount,mint,memo)=>
{
  if (!aa.w.o.ls.history) aa.w.o.ls.history = [];
  aa.w.o.ls.history.push({ts:Math.floor(Date.now()/1000),type,amount,mint,memo});
};


// add proofs for a mint
aa.w.proofs_in =async(proofs,url)=>
{
  let mint = aa.w.get_mint(url);
  if (!mint) return;
  let map = await aa.w.proofs_map();
  if (!map[url]) map[url] = [];
  map[url].push(...proofs);
  let amount = aa.w.sum_amounts(proofs);
  mint.amount = aa.w.sum_amounts(map[url]);
  aa.w.proofs_persist(map);
  return amount
};


// replace proofs for a mint (after send/melt)
aa.w.proofs_out =async(proofs,url)=>
{
  let mint = aa.w.get_mint(url);
  if (!mint) return;
  let map = await aa.w.proofs_map();
  let old_balance = aa.w.sum_amounts(map[url] || []);
  map[url] = [...proofs];
  let new_balance = aa.w.sum_amounts(proofs);
  mint.amount = new_balance;
  aa.w.proofs_persist(map);
  return old_balance - new_balance;
};


// mint quote
aa.w.quote =async(string='')=>
{
  let [amount,url] = aa.fx.splitr(string);
  amount = parseInt(amount);
  let {wallet,mint} = await aa.w.get_active(url);
  if (!wallet)
  {
    aa.log('w quote: no wallet found');
    return ''
  }

  const quote = await wallet.createMintQuote(amount);
  if (!quote)
  {
    aa.log('w quote: failed to create');
    return ''
  }

  quote.amount = amount;
  mint.quotes[quote.quote] = quote;
  aa.w.save();

  // show invoice
  aa.log('w quote: ' + aa.fx.units(amount) + ' — pay invoice to mint proofs');
  aa.w.zap_present(quote.request);

  // wait for payment
  aa.log('w: waiting for payment…');
  let paid = await aa.w.wait_paid(wallet,quote.quote);
  if (paid)
  {
    let dialog = aa.el.get('dialog');
    if (dialog?.open) dialog.close();
    aa.log('w: quote paid, minting proofs…');
    await aa.w.mint(quote.quote);
  }
  else aa.log('w: payment not detected — use `w check ' + quote.quote + '` to retry');
  return quote.quote
};


// check quote state manually
aa.w.quote_check =async(string='')=>
{
  let [quote_id,url] = aa.fx.splitr(string);
  if (!quote_id)
  {
    aa.log('w check: no quote id');
    return
  }
  let {wallet,mint} = await aa.w.get_active(url);
  if (!wallet)
  {
    aa.log('w check: no wallet found');
    return
  }
  let quote = await wallet.checkMintQuoteBolt11(quote_id);
  if (!quote)
  {
    aa.log('w check: quote not found');
    return
  }
  let state = quote.state?.toLowerCase();
  aa.log('w check: ' + quote_id.slice(0,8) + '… = ' + state);
  if (state === 'paid')
  {
    let amount = mint.quotes[quote_id]?.amount;
    if (amount) await aa.w.mint(quote_id);
    else aa.log('w check: unknown amount, use `w mint ' + quote_id + '`');
  }
};


// audit: check proof states and balance per mint
aa.w.audit =async()=>
{
  let mints = aa.w.o?.ls?.mints;
  if (!mints || !Object.keys(mints).length)
  {
    aa.log('w audit: no mints');
    return
  }

  let total_stored = 0;
  let total_spendable = 0;
  let total_spent = 0;
  let total_pending = 0;

  for (const url in mints)
  {
    let proofs = await aa.w.proofs_get(url);
    if (!proofs.length)
    {
      aa.log(`w audit: ${url} — no proofs`);
      continue
    }

    let stored = aa.w.sum_amounts(proofs);
    total_stored += stored;

    let {wallet} = await aa.w.get_active(url);
    if (!wallet)
    {
      aa.log(`w audit: ${url} — ${proofs.length} proofs, ${stored} sats (could not connect)`);
      continue
    }

    let states;
    try { states = await wallet.checkProofsStates(proofs) }
    catch(err)
    {
      aa.log(`w audit: ${url} — ${proofs.length} proofs, ${stored} sats (check failed: ${err.message})`);
      continue
    }

    let spendable = 0;
    let spent = 0;
    let pending = 0;
    for (let i = 0; i < proofs.length; i++)
    {
      let s = states[i]?.state;
      let a = proofs[i].amount;
      if (s === 'UNSPENT') spendable += a;
      else if (s === 'SPENT') spent += a;
      else if (s === 'PENDING') pending += a;
    }
    total_spendable += spendable;
    total_spent += spent;
    total_pending += pending;

    // remove spent proofs
    if (spent)
    {
      let clean = proofs.filter((_,i)=> states[i]?.state !== 'SPENT');
      await aa.w.proofs_out(clean,url);
      mints[url].amount = spendable + pending;
      aa.w.tx_log('audit',-spent,url,'removed spent proofs');
    }

    let parts = [`${spendable} spendable`];
    if (spent) parts.push(`${spent} spent (removed)`);
    if (pending) parts.push(`${pending} pending`);
    aa.log(`w audit: ${url} — ${proofs.length} proofs, ${parts.join(', ')}`);
  }

  if (total_spent) await aa.w.save();
  aa.log(`w audit: balance: ${total_spendable} sats`);
};


// wait for a mint quote to be paid
// tries websocket first, falls back to polling
aa.w.wait_paid =async(wallet,quote_id,timeout=300000)=>
{
  // try websocket (15s)
  try
  {
    let ws_paid = await Promise.race(
    [
      wallet.onceMintPaid(quote_id,{timeoutMs:15000}),
      new Promise(r=> setTimeout(()=> r(null),15000))
    ]);
    if (ws_paid) return true
  }
  catch(err) {}

  // fallback: poll every 5s
  let elapsed = 15000;
  while (elapsed < timeout)
  {
    await new Promise(r=> setTimeout(r,5000));
    elapsed += 5000;
    try
    {
      let check = await wallet.checkMintQuoteBolt11(quote_id);
      if (check?.state?.toLowerCase() === 'paid') return true
    }
    catch(err) {}
  }
  return false
};


// receive token
aa.w.receive =async(string='',pubkey)=>
{
  let [token,url] = string.split(aa.regex.fw);
  let {wallet,mint} = await aa.w.get_active(url);
  if (!wallet)
  {
    aa.log('w receive: no wallet found');
    return ''
  }

  // Get the specific privkey if pubkey is provided
  let privkey = pubkey ? await aa.u.decrypt_cache.get_key(pubkey) : null;
  const proofs = await wallet.receive(token, privkey ? {privkey} : {});
  aa.w.tx_log('receive',aa.w.sum_amounts(proofs),mint.url);
  aa.w.tx_in({proofs, url: mint.url});
  return proofs;
};


// redeem nutzap events
aa.w.redeem =async(string='')=>
{
  let ids = aa.fx.splitr(string).filter(aa.fx.is_key);
  return ids
};


// save wallnut
aa.w.save =async()=>
{
  await aa.mod.save(aa.w);
  aa.mod.mk(aa.w);
};


// instantiate wallnut
aa.w.start =async()=>
{
  if (!aa.w.o?.enabled) return;

  aa.mod.ready('u:pubkey',()=>
  {
    aa.mod.ready('r:manager',()=> aa.w.sync());
  });
};


// sync wallet state from relays
aa.w.sync =async()=>
{
  let mod = aa.w;
  let pubkey = aa.u.p.pubkey;
  let relays = aa.r.r;
  if (!relays.length) return;
  if (!mod.o.subs) mod.o.subs = {};

  // 1. fetch replaceable wallet events (10019, 17375, 37375)
  let rep = await aa.r.get(
  {
    id:'w_rep',
    relays,
    filter:{authors:[pubkey],kinds:[10019,17375,37375]},
    options:{db:false}
  });

  // process replaceables: newest first
  let rep_events = [...rep.events.values()]
    .map(d=> d.event)
    .sort((a,b)=> b.created_at - a.created_at);

  let wallet_event;
  let k10019;
  for (const event of rep_events)
  {
    if ((event.kind === 17375 || event.kind === 37375) && !wallet_event)
      wallet_event = event;
    if (event.kind === 10019 && !k10019)
      k10019 = event;
  }

  if (wallet_event)
  {
    let stored = mod.o.kind_17375;
    if (!stored || wallet_event.created_at > stored.created_at)
    {
      aa.log(`w: found wallet config (kind:${wallet_event.kind})`);
      await aa.w.import(wallet_event.id);
    }
  }

  if (k10019)
  {
    let p = await aa.p.author(pubkey);
    p.p2pk = aa.fx.tag_value(k10019.tags,'pubkey');
    p.mints = aa.fx.tags_values(k10019.tags,'mint');
    aa.log('w: synced mints (' + p.mints.length + ')');
  }

  // queue replaceables for rendering
  for (const [,dat] of rep.events) aa.bus.emit('e:print_q',dat);

  // track timestamp
  if (rep_events.length)
  {
    mod.o.subs.w_rep = rep_events[0].created_at;
  }

  // 2. fetch user's proof events (kind 7375, authored by user)
  let proofs_filter = {authors:[pubkey],kinds:[7375],limit:500};

  let proofs_res = await aa.r.get(
  {
    id:'w_proofs',
    relays,
    filter:proofs_filter,
    options:{db:false}
  });

  let proofs_events = [...proofs_res.events.values()].map(d=> d.event);
  if (proofs_events.length)
  {
    proofs_events.sort((a,b)=> b.created_at - a.created_at);
    let total_fresh = 0;

    // decrypt all proof events, collect proofs grouped by mint
    let by_mint = {};
    let seen_secrets = new Set();
    for (const event of proofs_events)
    {
      try
      {
        let decrypted = await aa.fx.decrypt_parse(event);
        if (!decrypted?.proofs?.length || !decrypted.mint) continue;
        let url = aa.fx.url(decrypted.mint)?.href;
        if (!url) continue;
        if (!by_mint[url]) by_mint[url] = [];
        for (const proof of decrypted.proofs)
        {
          if (seen_secrets.has(proof.secret)) continue;
          seen_secrets.add(proof.secret);
          by_mint[url].push(proof);
        }
      }
      catch(err) { continue }
    }

    // check which proofs are still spendable and import them
    for (const url in by_mint)
    {
      let all_proofs = by_mint[url];
      if (!all_proofs.length) continue;

      let mint = aa.w.get_mint(url);
      if (!mint) mint = aa.w.add(url)[0];

      // check proof states via mint
      let spendable = all_proofs;
      try
      {
        let {wallet} = await aa.w.get_active(url);
        if (wallet)
        {
          let states = await wallet.checkProofsStates(all_proofs);
          spendable = all_proofs.filter((_,i)=> states[i]?.state === 'UNSPENT');
        }
      }
      catch(err)
      {
        aa.log('w: could not verify proofs for ' + url + ', importing all');
      }

      if (spendable.length)
      {
        // dedupe against existing proofs
        let current = await aa.w.proofs_get(url);
        let existing = new Set(current.map(p=> p.secret));
        let fresh = spendable.filter(p=> !existing.has(p.secret));
        if (fresh.length)
        {
          aa.w.proofs_in(fresh,url);
          total_fresh += fresh.length;
          aa.log('w: imported ' + fresh.length + ' proofs from ' + url);
        }
      }
    }

    // track processed proof events
    if (!mod.o.processed_proofs) mod.o.processed_proofs = [];
    let processed = new Set(mod.o.processed_proofs);
    let unprocessed = proofs_events.filter(e=> !processed.has(e.id));

    // rotate: only if new proofs were actually imported
    if (unprocessed.length && total_fresh)
    {
      let needs_rotation = unprocessed.length > 1;
      if (needs_rotation)
      {
        let old_ids = unprocessed.map(e=> e.id);
        for (const url in by_mint)
        {
          let rot_proofs = await aa.w.proofs_get(url);
          if (!rot_proofs.length) continue;
          let content = {mint:url,proofs:rot_proofs};
          content.del = old_ids;
          let encrypted = await aa.fx.encrypt44(JSON.stringify(content));
          let event = aa.e.normalise({kind:7375,content:encrypted,tags:[]});
          await aa.e.finalize(event);
          // track new event as processed
          if (event.id) processed.add(event.id);
          aa.log('w: rotated proofs for ' + url);
        }
        // delete old proof events
        let del_tags = old_ids.map(id=> ['e',id]);
        del_tags.push(['k','7375']);
        let del_event = aa.e.normalise(
        {
          kind:5,
          content:'wallnut: rotated proofs',
          tags:del_tags
        });
        await aa.e.finalize(del_event);
        aa.log('w: deleted ' + old_ids.length + ' old proof events');
      }
      // mark all as processed
      for (const e of proofs_events) processed.add(e.id);
      mod.o.processed_proofs = [...processed];
    }
  }
  for (const [,dat] of proofs_res.events) aa.bus.emit('e:print_q',dat);

  // 3. fetch nutzaps to user (kind 9321, tagged #p)
  let nz_filter = {kinds:[9321],'#p':[pubkey],limit:500};
  if (mod.o.subs.w_nz) nz_filter.since = mod.o.subs.w_nz + 1;
  else nz_filter.since = Math.floor(Date.now() / 1000) - 86400 * 30;

  let nz_res = await aa.r.get(
  {
    id:'w_nz',
    relays,
    filter:nz_filter,
    options:{db:false}
  });

  let nz_events = [...nz_res.events.values()].map(d=> d.event);
  if (nz_events.length)
  {
    nz_events.sort((a,b)=> b.created_at - a.created_at);
    aa.log('w: found ' + nz_events.length + ' nutzaps');
    mod.o.subs.w_nz = nz_events[0].created_at;
  }
  for (const [,dat] of nz_res.events) aa.bus.emit('e:print_q',dat);

  await aa.w.save();
};


// calculate balance from proofs
aa.w.sum_amounts =a=>
{
  let total = 0;
  for (const i of a) total = total + i.amount;
  return total
};


// returns token to send
aa.w.token =async(string='')=>
{
  let [amount,s] = aa.fx.splitr(string,aa.regex.fw);
  amount = parseInt(amount);
  let pubkey,memo;
  if (s) [pubkey,memo] = aa.fx.splitr(s,aa.regex.fw);
  let {wallet,mint} = await aa.w.get_active();
  if (!memo) memo = localStorage.zap_memo;

  let proofs = await aa.w.proofs_get(mint.url);
  let builder = wallet.ops.send(amount,proofs).includeFees();
  if (pubkey && aa.fx.is_key(pubkey)) builder = builder.asP2PK({pubkey:'02'+pubkey});
  const {keep,send} = await builder.run();

  aa.w.tx_log('token',-amount,mint.url,memo);
  aa.w.tx_out(keep,mint.url);

  return cashuts.getEncodedTokenV4(
  {
    memo,
    mint:mint.url,
    proofs:send,
    unit:'sat',
  })
};


aa.w.tx_in =async({proofs,url})=>
{
  if (!proofs || !proofs.length)
  {
    aa.log('w: tx_in no proofs');
    return
  }
  if (!aa.w.o.ls.mints[url])
  {
    aa.log('w: mint not found');
    return
  }

  const amount = await aa.w.proofs_in(proofs,url);
  aa.log(`w: +${amount} in ${url}`);
  await aa.w.save();
  await aa.mk.k7375({url})
};


aa.w.tx_out =async(proofs,url)=>
{
  if (!proofs || !proofs.length)
  {
    aa.log('w: tx_out no proofs');
    return
  }

  const w = aa.w.get_mint(url);
  if (!w)
  {
    aa.log('w: mint not found');
    return
  }
  if (!url) url = aa.w.get_def();

  let amount = await aa.w.proofs_out(proofs,url);
  aa.log(`w: -${amount} in ${url}`);
  await aa.w.save();
  await aa.mk.k7375({url})
};
