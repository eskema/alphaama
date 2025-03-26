
aa.mk.k5 =(s='')=>
{
  let [reason,rest] = aa.fx.split_str(s);
  if (!rest) return;
  
  const event = {kind:5,content:reason,tags:[]};
  const relays = [];
  
  let ids = rest.split(',');
  for (const i of ids)
  {
    // let a = i.split(' ');
    let id = i.trim();
    let tag = [id];
    let kind;
    if (aa.is.key(id)) 
    {
      tag.unshift('e');
      let dat = aa.db.e[id];
      if (dat)
      {
        kind = dat.event.kind+'';
        aa.fx.a_add(relays,dat.seen);
        dat.clas.push('k5');
        aa.db.upd_e(dat);
      }
    }
    else tag.unshift('a');
    event.tags.push(tag);
    if (kind) event.tags.push(['k',kind])
  }
  if (window.confirm('confirm delete request for these events:\n'+ids))
    aa.e.finalize(aa.e.normalise(event),relays);
};


//   "kind": 10019,
//   "tags": [
//       [ "relay", "wss://relay1" ],
//       [ "relay", "wss://relay2" ],
//       [ "mint", "https://mint1", "usd", "sat" ],
//       [ "mint", "https://mint2", "sat" ],
//       [ "pubkey", "<p2pk-pubkey>" ]
//   ]
// update kind-10019 
aa.mk.k10019 =(s='')=>
{
  let w = aa.w.o.ls;
  let event = {kind:10019,tags:[]};
  for (const i of Object.keys(w.mints)) event.tags.push(['mint',i,'sat']);
  for (const i of w.relays) event.tags.push(['relay',i]);
  if (w.pubkey.length) event.tags.push(['pubkey',w.pubkey]);
  aa.e.finalize(aa.e.normalise(event));
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
//   // tokens that were destroyed in the creation of this token (helps on wallet state transitions)
//   "del": [ "token-event-id-1", "token-event-id-2" ]
// }),
aa.mk.k7375 =async(o={})=>
{
  // o = {mint,del}
  const w = aa.w.o;
  if (!w) 
  {
    aa.log('unable to make event k7375, walLNut not found');
    return
  }

  let mint = o.mint||aa.w.get_def();
  let proofs = w.ls.mints[mint].proofs;

  let del = [];
  let last = aa.p.events_last(aa.u.p,'k7375');
  if (last) del.push(last);
  if (o.del) aa.fx.a_add(del,o.del);

  let content = await aa.fx.encrypt44(JSON.stringify({mint,proofs,del}));
  let event = aa.e.normalise({kind:7375,content});
  aa.e.finalize(event);
  
  if (del.length) setTimeout(()=>{ aa.mk.k5('"poof" '+del.join()) },200);
  
  return event.id
};


// kind: 9321,
// content: "Thanks for this great idea.",
// pubkey: "sender-pubkey",
// tags: [
//     [ "amount", "1" ],
//     [ "unit", "sat" ],
//     [ "proof", "{\"amount\":1,\"C\":\"02277c66191736eb72fce9d975d08e3191f8f96afb73ab1eec37e4465683066d3f\",\"id\":\"000a93d6f8a1d2c4\",\"secret\":\"[\\\"P2PK\\\",{\\\"nonce\\\":\\\"b00bdd0467b0090a25bdf2d2f0d45ac4e355c482c1418350f273a04fedaaee83\\\",\\\"data\\\":\\\"02eaee8939e3565e48cc62967e2fde9d8e2a4b3ec0081f29eceff5c64ef10ac1ed\\\"}]\"}" ],
//     [ "u", "https://stablenut.umint.cash", ],
//     [ "e", "<zapped-event-id>", "<relay-hint>" ],
//     [ "p", "e9fbced3a42dcf551486650cc752ab354347dd413b307484e4fd1818ab53f991" ], // recipient of nut zap
// ]

// s = amount_n pubkey_s_key memo_s_q id_s_key
aa.mk.k9321 =async(s='')=>
{
  const err =str=>{aa.log('mk.k9321: '+str)};
  let amount,pubkey,memo,id;
  [amount,s] = s.split(aa.fx.regex.fw);
  if (!amount) { err('no amount'); return}
  [pubkey,s] = s.split(aa.fx.regex.fw);
  if (!aa.is.key(pubkey)) { err('no pubkey'); return};
  [memo,id] = aa.fx.split_str(s);
  if (id && !aa.is.key(id)) { err('invalid id'); return};
  await aa.db.events([id]);

  let p = await aa.p.get(pubkey);
  let p2pk = p.p2pk?.length ? p.p2pk : pubkey;
  if (p2pk.length === 64) p2pk = '02'+p2pk;

  if (!p.mints?.length)
  {
    let last_id = aa.p.events_last(p,'k10019');
    let dat = await aa.db.get_e(last_id);
    if (dat)
    {
      p.mints = aa.fx.tags_values(dat.event.tags,'mint');
      if (p.mints?.length) aa.p.save(p);
      else {err('no mints');return}
    }
  }
  
  let [wallnut,w,mint] = await aa.w.get_active();
  if (!wallnut) {err('no walLNut');return}
  
  let event = 
  {
    kind:9321,
    content:memo,
    tags:[
      ['amount',amount],
      ['unit','sat'],
      ['u',mint],
      aa.fx.tag_p(pubkey)
    ]
  };
  if (id?.length) event.tags.push(aa.fx.tag_e(id));
  let opts = {pubkey:p2pk};
  const {keep,send} = await wallnut.send(parseInt(amount),w.proofs,opts);
  aa.w.tx_out(keep,mint);
  event.tags.push(...send.map(i=>['proof',JSON.stringify(i)]));
  aa.e.finalize(aa.e.normalise(event));
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
  let data = [['privkey',w.privkey]];
  for (const mint of Object.keys(aa.w.o.ls.mints)) data.push(['mint',mint]);
  
  // todo: show modal to confirm before encrypting
  event.content = await aa.fx.encrypt44(JSON.stringify(data));
  aa.e.finalize(aa.e.normalise(event));
};


aa.actions.push(
  {
    action:['mk','10019'],
    description:'create kind:10019 from walLNut',
    exe:aa.mk.k10019
  },
  {
    action:['mk','9321'],
    required:['amount:n','pubkey:sx64'],
    optional:['memo:sq','nid:sx64','wid:sa'],
    description:'nut zap pubkey and/or events',
    exe:aa.mk.k9321
  },
  {
    action:['mk','17375'],
    description:'create kind:17375 from walLNut',
    exe:aa.mk.k17375
  },
  {
    action:['mk','5'],
    required:['reason','nid'],
    optional:['nid','nid'],
    description:'request notes to be deleted',
    exe:aa.mk.k5
  },
);