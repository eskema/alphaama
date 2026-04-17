//   "kind": 10019,
//   "tags": [
//       [ "mint","https://mint1"],
//       [ "mint","https://mint2"],
//       [ "pubkey","<p2pk-pubkey>"]
//   ]
// update kind-10019 
aa.mk.k10019 =(s='')=>
{
  let mints = Object.keys(aa.w.o.ls.mints);
  if (!mints?.length)
  {
    aa.log('mk10019: no mints found');
    return
  }
  let tags = [];
  for (const i of mints) tags.push(['mint',i]);
  let p2pk = aa.w.o.ls.p2pk;
  if (p2pk?.length) tags.push(['pubkey',p2pk]);

  aa.e.finalize(aa.e.normalise({kind:10019,tags}));
};


// "kind": 7375,
// "content": nip44_encrypt({
//   "mint": "https://stablenut.umint.cash",
//   "proofs": [
//     // one or more proofs in the default cashu format
//     {
//         "id": "005c2502034d4f12",
//         "amount": 1,
//         "secret": "z+zyxAVLRqN9lEjxuNPSyRJzEstbl69Jc1vtimvtkPg=",
//         "C": "0241d98a8197ef238a192d47edf191a9de78b657308937b4f7dd0aa53beae72c46"
//     }
//   ],
//   // tokens that were destroyed in the creation of this token 
//   // (helps on wallet state transitions)
//   "del": [ "token-event-id-1", "token-event-id-2" ]
// }),
aa.mk.k7375 =async(o={})=>
{
  // o = string (mint url or empty for all) or {mint,url,del}
  if (typeof o === 'string') o = {mint:o.trim() || undefined};
  let mints = [];
  if (o.mint || o.url) mints.push(o.mint || o.url);
  else mints.push(...Object.keys(aa.w.o.ls.mints));

  if (!mints.length)
  {
    aa.log('mk7375: no mints found');
    return
  }

  let old_ids = aa.w.o?.processed_proofs || [];
  let new_ids = [];

  for (const mint of mints)
  {
    let proofs = await aa.w.proofs_get(mint);
    if (!proofs.length)
    {
      aa.log('mk7375: no proofs for ' + mint);
      continue
    }

    let content = {mint,proofs};
    if (old_ids.length) content.del = old_ids;
    content = await aa.fx.encrypt44(JSON.stringify(content));
    let event = aa.e.normalise({kind:7375,content,tags:[]});
    await aa.e.finalize(event);
    if (event.id) new_ids.push(event.id);
    aa.log('mk7375: published proofs for ' + mint);
  }

  // delete old proof events
  if (old_ids.length && new_ids.length)
  {
    let del_tags = old_ids.map(id=> ['e',id]);
    del_tags.push(['k','7375']);
    let del_event = aa.e.normalise(
    {
      kind:5,
      content:'wallnut: rotated proofs',
      tags:del_tags
    });
    await aa.e.finalize(del_event);
    aa.log('mk7375: deleted ' + old_ids.length + ' old proof events');
  }

  // update processed list
  aa.w.o.processed_proofs = new_ids;
  await aa.w.save();
};


// kind: 9321,
// content: "Thanks for this great idea.",
// pubkey: "sender-pubkey",
// tags: [
//     [ "amount", "1" ],
//     [ "proof", "{
//       \"amount\":1,
//       \"C\":\"02277c66191736eb72fce9d975d08e3191f8f96afb73ab1eec37e4465683066d3f\",
//       \"id\":\"000a93d6f8a1d2c4\",
//       \"secret\":\"[
//         \\\"P2PK\\\",{
//           \\\"nonce\\\":\\\"b00bdd0467b0090a25bdf2d2f0d45ac4e355c482c1418350f273a04fedaaee83\\\",
//           \\\"data\\\":\\\"02eaee8939e3565e48cc62967e2fde9d8e2a4b3ec0081f29eceff5c64ef10ac1ed\\\"
//      }]\"}" ],
//     [ "u", "https://stablenut.umint.cash" ],
//     [ "e", "<zapped-event-id>", "<relay-hint>" ],
//     [ "p", "e9fbced3a42dcf551486650cc752ab354347dd413b307484e4fd1818ab53f991" ], // recipient of nut zap
// ]
aa.mk.k9321 =async(string='')=>
{
  // s = amount_n pubkey_s_key memo_s_q id_s_key
  const err =str=>{aa.log('w nzap: '+str)};
  let amount,pubkey,memo,id;
  
  [amount,string] = string.split(aa.regex.fw);
  if (!amount) { err('no amount'); return }
  [pubkey,string] = string.split(aa.regex.fw);
  if (!aa.fx.is_key(pubkey)) { err('no pubkey'); return };
  [memo,id] = aa.fx.split_str(string);
  if (id && !aa.fx.is_key(id)) { err('invalid id'); return };
  await aa.e.get(id);

  let p = await aa.p.get(pubkey);
  
  // fetch recipient's 10019 if needed
  if (!p.mints?.length || !p.p2pk)
  {
    let res = await aa.r.get(
    {
      id:'w_nzap_10019',
      filter:{authors:[pubkey],kinds:[10019],limit:1},
      options:{db:false}
    });
    for (const [,dat] of res.events)
    {
      if (dat.event.kind === 10019)
      {
        p.mints = aa.fx.tags_values(dat.event.tags,'mint');
        p.p2pk = aa.fx.tag_value(dat.event.tags,'pubkey');
        if (p.mints?.length) aa.p.save(p);
      }
    }
  }
  if (!p.mints?.length) { err('recipient has no mints'); return }

  // p2pk: use recipient's declared key, fall back to their pubkey
  let p2pk = p.p2pk?.length ? p.p2pk : pubkey;
  if (p2pk.length === 64) p2pk = '02'+p2pk;

  // find a shared mint (recipient's mint that we also have)
  let mint_url;
  for (const m of p.mints)
  {
    if (aa.w.get_mint(m)) { mint_url = m; break }
  }
  if (!mint_url) { err('no shared mint with recipient'); return }

  let {wallet:active} = await aa.w.get_active(mint_url);
  if (!active) { err('no active wallnut'); return }

  let proofs = await aa.w.proofs_get(mint_url);
  const {keep,send} = await active.ops.send(parseInt(amount),proofs)
    .asP2PK({pubkey:p2pk})
    .includeFees()
    .run();

  let tags =
  [
    ['p',pubkey],
    ['u',mint_url],
    ['unit','sat'],
    ...send.map(i=> ['proof',JSON.stringify(i)])
  ];
  if (id?.length)
  {
    let dat = await aa.e.get(id);
    tags.push(aa.fx.tag_e(id));
    if (dat) tags.push(['k',dat.event.kind+'']);
  }

  let event = aa.e.normalise({kind:9321,content:memo,tags});
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  let signed = await aa.e.sign(event);
  if (!signed)
  {
    err('signing cancelled, no funds moved');
    return
  }
  aa.bus.emit('db:save',signed);
  aa.e.print(aa.mk.dat({event:signed}));
  aa.r.send_event({event:signed});
  await aa.w.tx_out(keep,mint_url);
};


//   "kind": 17375,
//   "content": nip44_encrypt([
//     [ "privkey", "hexkey" ],
//     [ "mint", "https://mint1" ],
//     [ "mint", "https://mint2" ],
//     [ "mint", "https://mint3" ],
//     [ "relay", "wss://relay1" ],
//     [ "relay", "wss://relay2" ],
//   ]),
aa.mk.k17375 =async(s='')=>
{
  const w = aa.w.o.ls;
  if (!w) 
  {
    aa.log('unable to create event, walLNut not found');
    return
  }

  let event = {kind:17375,tags:[]};
  let data = [];
  let p2pk = aa.w.o.ls.p2pk;
  let privkey;
  if (p2pk) privkey = await aa.u.decrypt_cache.get_key(p2pk);
  // fall back to first cached key (pre-p2pk migration)
  if (!privkey)
  {
    await aa.u.decrypt_cache.load();
    let entries = Object.entries(aa.u.decrypt_cache._data.keys);
    if (entries.length)
    {
      [p2pk,privkey] = entries[entries.length - 1];
      aa.w.o.ls.p2pk = p2pk;
      aa.w.save();
    }
  }
  if (privkey) data.push(['privkey',privkey]);
  for (const mint of Object.keys(aa.w.o.ls.mints)) data.push(['mint',mint]);
  
  event.content = await aa.fx.encrypt44(JSON.stringify(data));
  event = aa.e.normalise(event);
  await aa.e.finalize(event);

  // update active wallet reference
  if (event.id)
  {
    aa.w.o.kind_17375 = event;
    await aa.w.save();
  }
};


aa.actions.push(
  {
    action:['k','10019'],
    description:'create kind:10019 (nip60)',
    exe:aa.mk.k10019
  },
  {
    action:['k','9321'],
    required:['<amount>','<pubkey>'],
    optional:['<memo>','<id>'],
    description:'nut zap pubkey and/or events',
    exe:aa.mk.k9321
  },
  {
    action:['k','17375'],
    description:'create kind:17375 from walLNut',
    exe:aa.mk.k17375
  },
  {
    action:['k','7375'],
    optional:['<mint_url>'],
    description:'publish proof backup for mint (or all mints)',
    exe:aa.mk.k7375
  },
);


aa.mk.w_mints =(key,value)=>
{
  let item = make('li',{cla:`item item_${key}`});
  let df = new DocumentFragment();
  let total = 0;
  for (const url in value)
  {
    let dis = value[url];
    let mint_amount = dis.amount || 0;
    total = total + mint_amount;
    let amount = `${mint_amount} ${aa.fx.plural(mint_amount,'sat')}`;
    df.append(make('p',{con:`${amount} in ${url}`}));
  }
  let mint_count = Object.keys(value).length;
  let summary = `${total} ${aa.fx.plural(total,'sat')} in ${mint_count} ${aa.fx.plural(mint_count,'mint')}`;
  item.append(aa.mk.details(summary,df,false,'mod_details'));
  return item
}


aa.mk.w_history =value=>
{
  if (!value?.length) return;
  let item = make('li',{cla:'item item_history'});
  let df = new DocumentFragment();
  let entries = value.slice(-20).reverse();
  for (const h of entries)
  {
    let time = aa.fx.time_display(h.ts);
    let sign = h.amount >= 0 ? '+' : '';
    let line = `${time} ${h.type} ${sign}${h.amount}`;
    if (h.memo) line += ` ${h.memo}`;
    df.append(make('p',{con:line}));
  }
  item.append(aa.mk.details(`activity (${value.length})`,df,false,'mod_details'));
  return item
}