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
  let pubkey = aa.w.o.ls.pubkey;
  if (pubkey.length) tags.push(['pubkey',pubkey]);
  
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
  // o = {mint,url,del}
  let mint = o.mint||o.url;
  if (!mint) 
  {
    aa.log('mk7375: mint not found');
    return
  }
  let proofs = w.ls.mints[mint].proofs;

  let del = [];
  let last = aa.p.events_last(aa.u.p,'k7375');
  if (last) del.push(last);
  if (o.del) aa.fx.a_add(del,o.del);
  let content = {mint,proofs};
  if (del.length) content.del = del;
  content = await aa.fx.encrypt44(JSON.stringify(content));
  let event = aa.e.normalise({kind:7375,content});
  aa.e.finalize(event);
  
  if (del.length) setTimeout(()=>{ aa.mk.k5(`"poof" ${del.join(' ')}`) },200);
  
  return event.id
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
  const err =str=>{aa.log('mk.k9321: '+str)};
  let amount,pubkey,memo,id;
  
  [amount,string] = string.split(aa.fx.regex.fw);
  if (!amount) { err('no amount'); return}
  [pubkey,string] = s.split(aa.fx.regex.fw);
  if (!aa.fx.is_key(pubkey)) { err('no pubkey'); return};
  [memo,id] = aa.fx.split_str(string);
  if (id && !aa.fx.is_key(id)) { err('invalid id'); return};
  await aa.e.get(id);

  let p = await aa.p.get(pubkey);
  
  // need to upd user nut data first

  let p2pk = p.p2pk?.length ? p.p2pk : pubkey;
  if (p2pk.length === 64) p2pk = '02'+p2pk;

  if (!p.mints?.length)
  {
    let last_id = aa.p.events_last(p,'k10019');
    let dat = await aa.e.get(last_id);
    if (dat)
    {
      p.mints = aa.fx.tags_values(dat.event.tags,'mint');
      if (p.mints?.length) aa.p.save(p);
      else {err('no mints');return}
    }
  }
  
  let [wallnut,w] = await aa.w.get_active();
  if (!wallnut) {err('no walLNut');return}
  
  let event = 
  {
    kind:9321,
    content:memo,
    tags:[
      aa.fx.tag_p(pubkey),
      ['amount',amount],
      ['u',w.url],
    ]
  };
  if (id?.length) event.tags.push(aa.fx.tag_e(id));
  let opts = {pubkey:p2pk};
  const {keep,send} = await wallnut.send(parseInt(amount),w.proofs,opts);
  
  event.tags.push(...send.map(i=>['proof',JSON.stringify(i)]));
  aa.e.finalize(aa.e.normalise(event));

  aa.w.tx_out(keep,w.url);
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
    description:'create kind:10019 (nip60)',
    exe:aa.mk.k10019
  },
  {
    action:['mk','9321'],
    required:['<amount>','<pubkey>'],
    optional:['<memo>','<id>'],
    description:'nut zap pubkey and/or events',
    exe:aa.mk.k9321
  },
  {
    action:['mk','17375'],
    description:'create kind:17375 from walLNut',
    exe:aa.mk.k17375
  },
);