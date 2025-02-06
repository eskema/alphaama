/*

alphaama
mod    w
walLNuts

*/

if (!localStorage.hasOwnProperty('zap')) localStorage.zap = '21';
if (!localStorage.hasOwnProperty('zap_memo')) localStorage.zap_memo = 'walLNut';

aa.w =
{
  name:'walLNuts',
  desc:'the best kind of nuts',
  def:{id:'w',ls:{},def:'',redeemed:[],redeemable:[]},
  requires:['r'],
  active:{},
};


// add walLNut
aa.w.add =(s='')=>
{
  // s = wid mint mint...
  let a = s.split(' ');
  let wid = aa.fx.an(a.shift());
  let w = aa.w.o.ls[wid];
  if (!w) w = aa.w.o.ls[wid] = aa.w.w();

  // mints
  if (a.length) 
  {
    for (let url of a)
    {
      url = aa.is.url(url.trim())?.href;
      if (url) aa.fx.a_add(w.mints,[url]);
    }
  }
  aa.w.save(wid);
  return wid
};


aa.fx.amount_display =(num,unit)=> num+aa.fx.plural(num,unit);


// delete walLNut(s)
aa.w.del =s=>
{
  aa.log('disabled until walLNuts are persisted to nostr to avoid loss of funds')
  
  // const work =a=>
  // {
  //   let k = a.shift();
  //   if (aa.w.o.ls.hasOwnProperty(k)) 
  //   {
  //     delete aa.w.o.ls[k];

  //     document.getElementById(aa.w.def.id+'_'+aa.fx.an(k)).remove();
  //     aa.log(aa.w.def.id+' walLNut deleted: '+k);
  //   }
  //   else aa.log(aa.w.def.id+' '+k+' not found')
  // };
  // aa.fx.loop(work,s);
  // aa.mod_save(aa.w);
};


aa.fx.plural =(n,s)=>
{
  return n === 1 ? s : s+'s';
};


// get active wallet from id
// if no wallet id is provided
// first found is returned
aa.w.get_active =async(id,mints=[])=>
{
  let w;
  let wallet;
  if (id)
  {
    w = aa.w.o.ls[id];
    if (!w) return [];
    wallet = aa.w.active[id]?.w;
    if (!wallet) 
    {
      let mint;
      let mints_o = aa.fx.a_ab(w.mints,mints);
      if (mints_o.inc.length) mint = mints_o.inc[0];
      else return [];

      let active = aa.w.active[id] = {};
      active.mint = new cashuts.CashuMint(mint);
      active.w = new cashuts.CashuWallet(active.mint);
      await active.w.loadMint();
      wallet = active.w;
    }
  }
  else 
  {
    id = aa.w.o.def || Object.keys(aa.w.active)[0];
    if (id) return id;
    else 
    {
      id = Object.keys(aa.w.o.ls)[0];
      if (id) return await aa.w.get_active(id,mints);
    }
  }
  return [wallet,w,id]
};


// import walLNut from k37375
aa.w.import =async(s='')=>
{
  if (!s) return;
  const id = s.trim();
  let dat = await aa.db.get_e(id);
  if (!dat) 
  {
    aa.log('w import: event not found');
    return
  }
  let event = dat.event;

  let wid = aa.fx.tag_value(event.tags,'d');
  let w = aa.w.o.ls[wid];
  if (!w)
  {
    w = aa.w.o.ls[aa.w.add(wid)];
    if (!w) 
    {
      aa.log('k37375 import failed');
      return 
    }
  }

  let a = await aa.fx.decrypt_parse(event.pubkey,event.content,event.id);
  a.push(...event.tags);

  aa.fx.a_add(w.mints,aa.fx.tags_values(a,'mint'));
  aa.fx.a_add(w.relays,aa.fx.tags_values(a,'relay'));

  for (const i of ['name','description','privkey']) 
  {
    let v = aa.fx.tag_value(a,i);
    if (v) w[i] = v;
  }
  if (w.privkey.length) w.pubkey = aa.fx.keypair(w.privkey)[1];
  aa.log(`k37375 imported ${event.id}`);

  let filter =
  {
    '#a':[`37375:${aa.u.p.xpub}:${wid}`],
    kinds:[],
    authors:[aa.u.p.xpub]
  };
  
  let haz_proofs = await aa.w.import_7375(wid);
  if (!haz_proofs) filter.kinds.push(7375);
  else aa.log(`7375 imported: ${aa.fx.amount_display(aa.fx.sum_amounts(haz_proofs))}`)

  // let haz_history = await aa.w.import_7376(wid);
  // if (!haz_history) filter.kinds.push(7375);
  
  // if (haz_history && haz_proofs 
  //   && haz_history === haz_proofs) aa.log('7376 import: all good');
  // else aa.log(`7376 import: proofs missing ${haz_proofs} ${haz_history}`);

  aa.w.save(wid);
  if (filter.kinds.length) aa.r.demand(['REQ','w',filter],w.relays,{eose:'close'});
};


aa.w.import_7375 =async(wid,id)=>
{
  if (!id) id = aa.p.events_last(aa.u.p,'k7375',wid);
  if (!id) return;
  let dat = await aa.db.get_e(id);
  if (!dat) return;
  let decrypted = await aa.fx.decrypt(dat.event.content);
  if (!decrypted) return;
  let {proofs} = aa.parse.j(decrypted);
  if (proofs?.length) aa.w.proofs_in(proofs,wid);
  return proofs
};


aa.w.import_7376 =async(wid,ids)=>
{
  if (!ids) 
  {
    let events = aa.u.p.events.k7376;
    if (!events) return;
    let w_events = events[wid];
    if (!w_events) return;
    ids = w_events?.map(i=>i[0]).reverse();
  }
  let created;
  if (window.confirm(`decrypt all ${ids.length} transactions?`))
  {
    await aa.e.events(ids);
    for (const id of ids)
    {
      let dat = aa.db.e[id];
      if (dat)
      {
        let tags = await aa.fx.decrypt(dat.event.content);
        if (tags) tags = aa.parse.j(tags);
        if (tags?.length) 
        {
          tags.push(...dat.event.tags);
          let direction = aa.fx.tag_value(tags,'direction')==='in'?'+':'-';
          let amount = aa.fx.tag_value(tags,'amount');
          created = tags.find(i=>i[0]==='e'&&i[3]==='created');
          if (created && created[1]) created = created[1];
          let w = aa.w.o.ls[wid];
          if (w) w.history.unshift([dat.event.created_at,direction+amount,'7376:'+id]);
        }
      }
    }
    if (ids.length) aa.w.save(wid)
  }
  return created
};


// add keypair to walLNut
aa.w.key =(s='')=>
{
  let [wid,privkey] = s.split(' ').map(i=>i.trim());
  let w = aa.w.o.ls[wid];
  if (!w)
  {
    aa.log('w key: wallet not found');
    return
  }
  let pub;
  if (!privkey)
  {
    if (window.confirm('generate new keypair?'))
    {
      let [sec,pub] = aa.fx.keypair();
      w.privkey = aa.fx.bytes_to_x(sec);
      w.pubkey = pub;
      upd = true;
      // aa.w.save(wid);
      // return pub
    }
    else return
  }
  else
  {
    if (!aa.is.key(privkey))
    {
      aa.log('w key: key invalid');
      return
    }
    if (window.confirm('replace privkey?'))
    {
      w.privkey = privkey;
      w.pubkey = pub = aa.fx.keypair(privkey)[1];
      upd = true;
    }
    // aa.w.save(wid);
    // return w.pubkey;
  }
  if (upd) 
  {
    aa.w.save(wid);
    // aa.mk.k10019();
    // aa.mk.k37375(wid);
  }
  return pub
};


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
  let event = { kind:10019, tags:[]};
  let mints = [];
  let relays = [];
  let pubkeys = [];
  for (const id in aa.w.o.ls)
  {
    const w = aa.w.o.ls[id];

    if (w.mints.length) aa.fx.a_add(mints,w.mints);
    if (w.relays.length) aa.fx.a_add(relays,w.relays)
    if (w.pubkey?.length) aa.fx.a_add(pubkeys,[w.pubkey]);
  }
  
  for (const i of mints) event.tags.push(['mint',i,'sat']);
  for (const i of relays) event.tags.push(['relay',i]);
  for (const i of pubkeys) event.tags.push(['pubkey',i]);

  // aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
  aa.e.finalize(aa.e.normalise(event));
};


// "kind": 7375,
// "content": nip44_encrypt({
//   "mint": "https://stablenut.umint.cash",
//   "proofs": [
//     {
//       "id": "005c2502034d4f12",
//       "amount": 1,
//       "secret": "z+zyxAVLRqN9lEjxuNPSyRJzEstbl69Jc1vtimvtkPg=",
//       "C": "0241d98a8197ef238a192d47edf191a9de78b657308937b4f7dd0aa53beae72c46"
//     }
//   ]
// }),
// "tags": [
//   [ "a", "37375:<pubkey>:my-wallet" ]
// ]
aa.mk.k7375 =async(o={})=>
{
  const wid = o.wid||Object.keys(aa.w.o.ls)[0];
  const w = aa.w.o.ls[wid];
  if (!w) 
  {
    aa.log('unable to create event, walLNut not found');
    return
  }

  let mint = o.mint||w.mints[0];
  let proofs = w.proofs;
  let del = [];
  let last = aa.p.events_last(aa.u.p,'k7375');
  if (last) del.push(last);
  if (o.del) aa.fx.a_add(del,o.odel);
  let pubkey = aa.u.p.xpub;
  let event = {kind:7375,tags:[['a',`37375:${pubkey}:${wid}`]]};
  let private = {mint,proofs,del};
  event.content = await aa.fx.encrypt44(JSON.stringify(private));
  aa.e.finalize(aa.e.normalise(event));
  
  // let created = [[event.id]];
  // let amount = o.amount || aa.fx.sum_amounts(proofs);
  // let options = {wid,created,amount};
  aa.w.save(wid);
  if (del.length) aa.mk.k5('"poof" '+del.join());
  
  return options
};


// "kind": 7376,
// "content": nip44_encrypt([
//     [ "direction", "in" ], // in = received, out = sent
//     [ "amount", "1", "sat" ],
//     [ "e", "<event-id-of-spent-token>", "<relay-hint>", "created" ],
// ]),
// "tags": [
//     [ "a", "37375:<pubkey>:my-wallet" ],
// ]
aa.mk.k7376 =async o=>
{
  // {
  //   'amount':amount,
  //   'direction':'in',
  //   'created':[[id]],
  //   'destroyed':[[id,relay]],
  //   'redeemed':[],
  //   'pubkeys:[],
  //   'memo':'',
  //   'wid':'',
  // }
  
  let pubkey = aa.u.p.xpub;
  let direction = o.direction || 'in';
  let event = {kind:7376,tags:[['a',`37375:${pubkey}:${o.wid}`]]};
  let private = 
  [
    ['direction',direction],
    ['amount',''+o.amount,aa.fx.plural(o.amount,'sat')]
  ];

  if (o.destroyed?.length) for (const i of o.destroyed)
  {
    private.push(aa.fx.tag_e(i[0],'destroyed'));
  }
  if (o.created?.length) for (const i of o.created)
  {
    private.push(aa.fx.tag_e(i[0],'created'));
  }
  if (o.redeemed?.length) for (const i of o.redeemed)
  {
    dat.event.tags.push(aa.fx.tag_e(i[0],'redeemed'));
  }
  if (o.pubkeys?.length) for (const i of o.pubkeys)
  {
    dat.event.tags.push(aa.fx.tag_p(i[0]))
  }
  event.content = await aa.fx.encrypt44(JSON.stringify(private));
  aa.e.finalize(aa.e.normalise(event));

  let w = aa.w.o.ls[o.wid];
  if (!w) return;
  if (!w.history) w.history = [];
  w.history.unshift(
  [
    event.id,
    aa.now,
    (direction==='in'?'+':'-')+o.amount,
    o.created[0][0],
    o.memo
  ]);
  aa.w.save(o.wid);
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


// s = amount_n pubkey_s_key memo_s_q id_s_key wid_s_an
aa.mk.k9321 =async(s='')=>
{
  const err =str=>{aa.log('mk.k9321: '+str)};
  let amount,pubkey,memo,id,w_id;
  [amount,s] = s.split(aa.fx.regex.fw);
  if (!amount) { err('no amount'); return}
  [pubkey,s] = s.split(aa.fx.regex.fw);
  if (!aa.is.key(pubkey)) { err('no pubkey'); return};
  [memo,s] = aa.fx.split_str(s);
  [id,w_id] = s.split(' ');
  await aa.db.events([id]);  

  let p = await aa.db.get_p(pubkey);
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
  
  let [wallet,w,wid] = await aa.w.get_active(w_id,p.mints);
  if (!wallet) {err('no wallet');return}
  
  let mint = wallet.mint._mintUrl;
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
  let opts = {};
  if (p2pk) opts.pubkey = p2pk;
  const {keep,send} = await wallet.send(parseInt(amount),w.proofs,opts);
  aa.w.tx_out(keep,wid);
  event.tags.push(...send.map(i=>['proof',JSON.stringify(i)]));
  event = aa.e.normalise(event);
  aa.e.finalize(event);
  // aa.e.draft(aa.mk.dat({event}));
  // console.log(event);
};


//   "kind": 37375,
//   "content": nip44_encrypt([
//       [ "balance", "100", "sat" ],
//       [ "privkey", "hexkey" ] // explained in NIP-61
//   ]),
//   "tags": [
//     [ "d", "my-wallet" ],
//     [ "mint", "https://mint1" ],
//     [ "mint", "https://mint2" ],
//     [ "mint", "https://mint3" ],
//     [ "name", "my shitposting wallet" ],
//     [ "unit", "sat" ],
//     [ "description", "a wallet for my day-to-day shitposting" ],
//     [ "relay", "wss://relay1" ],
//     [ "relay", "wss://relay2" ],
//   ]
// update kind-37375 
aa.mk.k37375 =async(s='')=>
{
  let id = s.trim();
  if (!id) id = Object.keys(aa.w.o.ls)[0];
  const w = aa.w.o.ls[id];
  if (!w) 
  {
    aa.log('unable to create event, walLNut not found');
    return
  }

  let event = { kind:37375, tags:[['d',id]] };
  let private = [];
  private.push(['balance',''+w.balance,w.unit]);
  for (const mint of w.mints) private.push(['mint',mint]);
  for (const relay of w.relays) private.push(['relay',relay]);
  if (w.name?.length) private.push(['name',w.name]);
  if (w.description?.length) private.push(['description',w.description]);
  if (w.privkey?.length) private.push(['privkey',w.privkey]);
  // todo: show modal to confirm before encrypting
  event.content = await aa.fx.encrypt44(JSON.stringify(private));
  // aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
  aa.e.finalize(aa.e.normalise(event));
};


aa.kinds[5] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('tiny');
  note.querySelector('.tags_wrapper').setAttribute('open','');
  // let ids = aa.fx.tags_values(dat.event.tags,'e');
  // let ida = aa.fx.tags_values(dat.event.tags,'a');
  // const x = dat.event.pubkey;
  // if (aa.is.u(x))
  // {
  //   let p = aa.u.p;
  //   let tag_a = aa.fx.tag_value(dat.event.tags,'a');
  //   let wid = tag_a.split(':')[2];
  //   if (aa.p.events_newer(p,dat.event,wid))
  //   {
  //     aa.p.save(p);
  //     // aa.log(`k7376: walLNut tx from ${wid}`);
  //   }
  // }
  // aa.e.append_check(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};


// event template for walLNut proofs
aa.kinds[7375] =dat=>
{
  // {
  //   "kind": 7375,
  //   "content": nip44_encrypt({
  //     "mint": "https://stablenut.umint.cash",
  //     "proofs": [
  //       {
  //         "id": "005c2502034d4f12",
  //         "amount": 1,
  //         "secret": "z+zyxAVLRqN9lEjxuNPSyRJzEstbl69Jc1vtimvtkPg=",
  //         "C": "0241d98a8197ef238a192d47edf191a9de78b657308937b4f7dd0aa53beae72c46"
  //       }
  //     ]
  //   }),
  //   "tags": [
  //     [ "a", "37375:<pubkey>:my-wallet" ]
  //   ]
  // }

  const note = aa.e.note(dat);
  // aa.mk.note_encrypted(dat,note);
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  note.querySelector('.tags_wrapper').setAttribute('open','');
  const x = dat.event.pubkey;
  if (aa.is.u(x))
  {
    let p = aa.u.p;
    let tag_a = aa.fx.tag_value(dat.event.tags,'a');
    let wid = tag_a.split(':')[2];
    if (aa.p.events_newer(p,dat.event,wid))
    {
      aa.p.save(p);
      // aa.log(`k7375: walLNut proofs from ${wid}`);
    }
  }
  // aa.e.append_to_notes(note);
  aa.e.append_check(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};


// event template for walLNut proofs
aa.kinds[7376] =dat=>
{
// {
//     "kind": 7376,
//     "content": nip44_encrypt([
//         [ "direction", "in" ], // in = received, out = sent
//         [ "amount", "1", "sat" ],
//         [ "e", "<event-id-of-spent-token>", "<relay-hint>", "created" ],
//     ]),
//     "tags": [
//         [ "a", "37375:<pubkey>:my-wallet" ],
//     ]
// }

  const note = aa.e.note(dat);
  //aa.mk.note_encrypted(dat,note);
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  note.querySelector('.tags_wrapper').setAttribute('open','');
  const x = dat.event.pubkey;
  if (aa.is.u(x))
  {
    let p = aa.u.p;
    let tag_a = aa.fx.tag_value(dat.event.tags,'a');
    let wid = tag_a.split(':')[2];
    if (aa.p.events_newer(p,dat.event,wid))
    {
      aa.p.save(p);
      // aa.log(`k7376: walLNut tx from ${wid}`);
    }
  }
  aa.e.append_check(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};

aa.w.is_redeemed =x=>
{
  if (!aa.w.o.redeemed) 
  {
    aa.w.o.redeemed = [];
    aa.w.save();
    return false
  }
  if (aa.w.o.redeemed.includes(x)) return true;
  return false
};

// event template for nutzap
aa.kinds[9321] =dat=>
{
  const note = aa.e.note(dat);
  const x = dat.event.pubkey;
  let p_x = aa.fx.tag_value(dat.event.tags,'p');
  if (aa.is.u(p_x) && !aa.w.is_redeemed(dat.event.id)) 
  {
    if (!aa.w.o.hasOwnProperty('redeemable')) aa.w.o.redeemable = [];
    if (!aa.w.o.redeemable.find(i=>i[0]===dat.event.id))
    {
      let amount = aa.fx.tag_value(dat.event.tags,'amount');
      aa.w.o.redeemable.push([dat.event.id,amount]);
      a.w.save();
      aa.log('nut zap +'+amount+' '+dat.event.id);
      //aa.log(redeem_butt)
    }
  }
  aa.e.append_to(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};


// event template for walLNut discovery
aa.kinds[10019] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root');
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.events_newer(p,dat.event))
    {
      let relays = {};
      let sets = ['k10019'];
      let tags = dat.event.tags.filter(i=>i[0]==='relay');
      for (const tag of tags)
      {
        const [type,url,permission] = tag;
        const href = aa.is.url(url)?.href;
        if (!href) continue;
        relays[href] = {sets};
      }
      aa.p.relays_add(relays,p);
      if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
      p.mints = aa.fx.tags_values(dat.event.tags,'mint');
      p.p2pk = aa.fx.tag_value(dat.event.tags,'pubkey');
      aa.p.save(p);
    }
  });

  let tags = note.querySelector('.tags_wrapper');
  tags.setAttribute('open','');
  
  return note
};


// event template for walLNut 
aa.kinds[37375] =dat=>
{
  const note = aa.e.note_pre(dat);
  //aa.mk.note_encrypted(dat,note);
  note.querySelector('.tags_wrapper').setAttribute('open','');
  if (aa.is.u(dat.event.pubkey))
  {
    let p = aa.u.p;
    if (p && aa.p.events_newer(p,dat.event))
    {
      aa.p.save(p);
    }

    let butt = aa.mk.butt_action(aa.w.def.id+' import '+dat.event.id,'import');
    note.querySelector('.content').append(butt)
  }
  
  return note
};


// on load
aa.w.load =()=>
{
  aa.fx.a_add(aa.q.ls.a.kinds,[10019,37375]);
  aa.q.ls.w = {"authors":["u"],"kinds":[7375,10019,37375]};
  aa.fx.a_add(aa.e.renders.encrypted,[7375,7376,37375]);
  aa.temp.quotes = {};
  let mod = aa.w;
  let id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['wid','mint'],
      optional:['mint'],
      description:'add walLNut',
      exe:mod.add
    },
    // {
    //   action:[id,'del'],
    //   required:['wid'],
    //   description:'delete walLNut',
    //   exe:mod.del
    // },
    {
      action:[id,'key'],
      required:['wid','hex_privkey'],
      description:'set private key to decrypt p2pk tokens',
      exe:mod.key
    },
    {
      action:[id,'unit'],
      required:['unit','wid'],
      description:'set unit to walLNut',
      exe:mod.unit
    },
    {
      action:[id,'relays'],
      required:['wid','relset'],
      optional:['relset'],
      description:'set relay sets to walLNut',
      exe:mod.relays
    },
    {
      action:['mk','10019'],
      description:'create kind:10019 from walLNut(s)',
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
      action:['mk','37375'],
      optional:['wid'],
      description:'create kind:37375 from walLNut',
      exe:aa.mk.k37375
    },
    {
      action:[id,'import'],
      required:['nid'],
      description:'create walLNut from kind:37375',
      exe:mod.import
    },
    // {
    //   action:['mk','7375'],
    //   optional:['wid'],
    //   description:'create kind:7375 proofs from walLNut',
    //   exe:aa.mk.k7375
    // },
    {
      action:['mk','5'],
      required:['reason','nid'],
      optional:['nid','nid'],
      description:'request notes to be deleted',
      exe:aa.mk.k5
    },
    {
      action:['cashu','quote'],
      required:['amount'],
      optional:['wid'],
      description:'mint quote',
      exe:mod.quote
    },
    {
      action:['cashu','check'],
      required:['quote'],
      optional:['wid'],
      description:'keeps checking quote state',
      exe:mod.quote_re_check
    },
    {
      action:['cashu','mint'],
      required:['quote_id'],
      optional:['wid'],
      description:'mint proofs from quote',
      exe:mod.mint
    },
    {
      action:['cashu','melt'],
      required:['invoice'],
      optional:['wid'],
      description:'pay ln invoice from wallet proofs',
      exe:mod.melt
    },
    {
      action:[id,'send'],
      required:['amount'],
      optional:['wid','pubkey'],
      description:'create a token',
      exe:mod.send
    },
    {
      action:[id,'receive'],
      required:['token'],
      optional:['wid'],
      description:'receive a token',
      exe:mod.receive
    },
    {
      action:[id,'redeem'],
      required:['id:sx64'],
      description:'redeem a nut zap',
      exe:mod.redeem
    },
  );
  aa.e.butts_for?.na?.push('nzap');
  aa.mod_load(mod).then(mod.start);
};


// melt proofs
aa.w.melt =async(s='')=>
{
  let [invoice,w_id] = s.split(aa.fx.regex.fw);
  let [wallet,w,wid] = await aa.w.get_active(w_id);
  if (!wallet) 
  {
    aa.log('w melt: no walLNut found')
    return
  }
  const quote = await wallet.createMeltQuote(invoice);
  const amount = quote.amount + quote.fee_reserve;
  const options = {includeFees:true};
  const proofs = await wallet.send(amount,w.proofs,options);
  console.log(proofs);
  const melt_response = await wallet.meltProofs(quote,proofs.to_send);
  aa.log(aa.mk.ls({ls:melt_response}));
  console.log(melt_response);
  proofs.to_keep.push(...melt_response.change);
  aa.w.tx_out(proofs.to_keep,wid);
};


// mint proofs from quote
aa.w.mint =async(s='')=>
{
  let a = s.split(' ');
  let quote_id = a.shift();
  // let amount = a.length ? parseInt(a.shift()) : 0;
  let w_id = a.length ? a.shift() : false;
  let [wallet,w,wid] = await aa.w.get_active(w_id);
  if (!wallet) 
  {
    aa.log('no walLNut found')
    return
  }
  let amount = w.quotes[quote_id].amount;
  if (!amount) return;
  let mint = wallet.mint.mintUrl;
  let units = aa.fx.amount_display(amount,'sat');
  aa.log(`minting proofs for ${units} from ${quote_id}`);
  
  let proofs = await wallet.mintProofs(amount,quote_id);
  aa.w.tx_in(proofs,wid,{mint});
};


// make w mod item
aa.w.mk =(k,v)=>
{
  const id = aa.w.def.id;
  let upg = aa.w.upg(k,v);
  if (upg) setTimeout(()=>{aa.w.save(k)},200);
  // walLNut mod item
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  // walLNut list
  const ul = aa.mk.walLNut(k,v);
  // walLNut details
  const details = aa.mk.details(k,ul,1);
  details.append(
    // aa.mk.butt_action(`${id} del ${k}`,'del','del'),
    // ' ',
    aa.mk.butt_action('mk 37375 '+k,'k37375'),
    // ' ',
    // aa.mk.butt_action(`${id} upd ${k}`,'upd','upd')
  );
  l.append(details);
  return l
};


// nutzap butt clk event
aa.clk.nzap =e=>
{
  const note = e.target.closest('.note');
  const pub = note.dataset.pubkey;
  const xid = note.dataset.id;
  let t = `${localStorage.ns} mk 9321 ${localStorage.zap}`;
  t = `${t} ${pub} "${localStorage.zap_memo}" ${xid}`;
  aa.cli.v(t);
};


// save proofs from tx in
aa.w.proofs_in =(proofs,wid)=>
{
  let w = aa.w.o.ls[wid];
  if (!w) return;
  const amount = aa.fx.sum_amounts(proofs);
  w.proofs.push(...proofs);
  w.balance = aa.fx.sum_amounts(w.proofs);
  return amount
};


// save proofs from tx out
aa.w.proofs_out =(proofs,wid)=>
{
  let w = aa.w.o.ls[wid];
  if (!w) return;
  let old_balance = aa.fx.sum_amounts(w.proofs);
  let new_balance = aa.fx.sum_amounts(proofs);
  w.proofs = [...proofs];
  w.balance = new_balance;
  return old_balance - new_balance;
};


// mint quote
aa.w.quote =async s=>
{
  const a = s.split(' ');
  let amount = parseInt(a.shift());
  
  let w_id = a.shift();
  let [wallet,w,wid] = await aa.w.get_active(w_id);
  if (!wallet)
  {
    aa.log('no wallet found');
    return ''
  }
  
  const quote = await wallet.createMintQuote(amount);
  if (quote) 
  {
    quote.amount = amount;
    // aa.temp.quotes[quote.quote] = {amount:amount,quote:quote};
    if (!w.quotes) w.quotes = {};
    // w.quotes.push(quote);
    w.quotes[quote.quote] = quote;//{amount:amount,quote:quote};
    aa.w.save(wid);
    aa.log('quote for '+amount+' from mint '+wallet?.mint?.mintUrl);
    return quote.quote
  }
  return '';
};


// check quote state
aa.w.quote_check =async(s='')=>
{
  let a = s.split(' ');
  let quote_id = a.shift();
  let wid = a.length ? a.shift() : false;
  let [wallet] = await aa.w.get_active(wid);
  if (!wallet) return;
  const quote = await wallet.checkMintQuote(quote_id);
  return quote.state
};


// check quote state
aa.w.quote_re_check =async(s='')=>
{
  let a = s.split(' ');
  let quote_id = a.shift();
  let w_id = a.length ? a.shift() : false;
  let [wallet,w,wid] = await aa.w.get_active(w_id);
  let checks = 0;
  let log = aa.mk.l('div',{cla:'quote_check'});
  let butt = aa.mk.l('button',
  {
    con:'stop checking '+quote_id,
    clk:e=>{log.remove()}
  });

  const re_check =async(quote_id)=>
  {
    if (!log || checks > 21) return;
    let amount = w.quotes[quote_id].amount;
    const quote = await wallet.checkMintQuote(quote_id);
    quote.amount = amount;
    let state = quote.state.toLowerCase();
    switch (state)
    {
      case 'unpaid':
        if (!log.classList.contains(state)) 
        {
          log.append(state);
          log.append(aa.mk.qr(quote.request));
        }
        setTimeout(()=>{re_check(quote_id)},3000);
        break;
      case 'paid':
        if (!log.classList.contains(state)) 
        {
          log.classList.remove('unpaid');
          aa.w.mint(quote_id+' '+wid);
          // log.append(aa.mk.butt_action('w quote_check '+quote.quote))
        }
        setTimeout(()=>{re_check(quote_id)},5000);
        break;
      case 'issued':
        log.remove();
        aa.log(quote_id+' '+state);
        break;
    }
    log.classList.add(state);
  };
  log.append(butt);
  aa.log(log);
  re_check(quote_id);

  // const quote = await wallet.checkMintQuote(quote_id);
  // // if (!w.quotes[quote_id]) w.quotes[quote_id] = {amount:'',quote:quote};
  // // else w.quotes[quote_id].quote = quote;
  // // aa.w.save(wid);
  // aa.log('w quote_check '+quote_id+': '+quote.state);
  // if (quote.state === 'UNPAID') 
  // {
  //   aa.log(aa.mk.qr(quote.request));
  //   aa.log(aa.mk.butt_action('w quote_check '+quote.quote))
  // }
  // if (quote.state === 'PAID') 
  // {
  //   aa.log(aa.mk.butt_action('w mint '+quote.quote))
  // }
  // return quote.state
};


// receive token
aa.w.receive =async(s='')=>
{
  let [token,w_id] = s.split(aa.fx.regex.fw);
  let [wallet,w,wid] = await aa.w.get_active(w_id);
  let opts = {};
  if (w.privkey) opts.privkey = w.privkey;
  const proofs = await wallet.receive(token,opts);
  aa.w.tx_in(proofs,wid);
};


aa.w.redeem =async(s='')=>
{
  let ids = s.split(' ').map(i=>i.trim()).filter(aa.is.key);
  const o = {sat:{}};

  for (const id of ids)
  {
    let dat = aa.db.e[id];
    if (!dat) continue;
    
    let proofs = aa.fx.tags_values(dat.event.tags,'proof')
      .map(i=>aa.parse.j(i));
    if (!proofs.length) continue;

    let unit = aa.fx.tag_value(dat.event.tags,'unit');
    if (!unit) continue;
    if (!o[unit]) o[unit] = {};

    let mint = aa.is.url(aa.fx.tag_value(dat.event.tags,'u'))?.href;
    if (!mint) continue;
    if (!o[unit][mint]) o[unit][mint] = [];
    let pubkey = dat.event.pubkey;
    o[unit][mint].push({proofs,id,pubkey});
  }
  for (const unit in o)
  {
    for (const mint in o[unit])
    {
      let [wallet,w,wid] = await aa.w.get_active('',[mint]);
      if (!wallet) continue;
      let swap_options = {};
      if (w.privkey) swap_options.privkey = w.privkey;

      let redeemed = [];
      let pubkeys = [];
      let c_proofs = [];
      for (const i of o[unit][mint])
      {
        let proofs = i.proofs;
        let amount = aa.fx.sum_amounts(proofs);
        const {keep,send} = await wallet.swap(amount,proofs,swap_options);
        c_proofs.push(...keep,...send);
        aa.fx.a_add(redeemed,i.id);
        aa.fx.a_add(pubkeys,i.pubkey);
      }
      aa.w.tx_in(c_proofs,wid,{redeemed,pubkeys,mint});
    }
  }
};



// define relay sets to walLNut
aa.w.relays =s=>
{
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].relays = a;
  aa.w.save(wid);
};


// save walLNut
aa.w.save =wid=>
{
  if (wid) aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// returns proofs to send
aa.w.send =async(s='')=>
{
  let [amount,w_id,pubkey] = s.split(' ');
  amount = parseInt(amount);
  let [wallet,w,wid] = await aa.w.get_active(w_id);
  let opts = {};
  if (pubkey)
  {
    pubkey = pubkey.trim();
    if (aa.is.key(pubkey)) opts.pubkey = '02'+pubkey;
  }
  const {keep,send} = await wallet.send(amount,w.proofs,opts);
  aa.w.tx_out(keep,wid);
  // return send
  const o = 
  {
    memo:'yo',
    mint:wallet.mint._mintUrl,
    proofs:send,
    unit:'sat',
  };
  return cashuts.getEncodedTokenV4(o)
};


// start mod
aa.w.start =mod=>
{
  if (!mod.o.hasOwnProperty('redeemable')||!mod.o.hasOwnProperty('redeemed')) 
  {
    if (!mod.o.hasOwnProperty('redeemed')) mod.o.redeemed = [];
    if (!mod.o.hasOwnProperty('redeemable')) mod.o.redeemable = [];
    aa.w.save();
  }

  aa.mk.mod(mod);
  let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
  let upd_butt = aa.mk.butt_action(`mk 10019`,'k10019');
  
  let ids = mod.o.redeemable.map(i=>i[0]).join(' ');
  let amount = mod.o.redeemable.map(i=>i[i]).reduce((a,b)=>a+b,0);
  let redeem_butt = aa.mk.butt_action(`${mod.def.id} redeem ${ids}`,'🐿️['+amount+']');
  
  mod.l.insertBefore(upd_butt,document.getElementById(mod.def.id));
  mod.l.insertBefore(add_butt,upd_butt);
  mod.l.insertBefore(redeem_butt,upd_butt);
};


// calculate balance from proofs
aa.fx.sum_amounts =a=>
{
  let total = 0;
  for (const i of a) total = total + i.amount;
  return total
};







aa.w.tx_in =async(proofs,wid,o)=>
{
  if (!proofs || !proofs.length) 
  {
    aa.log(aa.w.def.id+' tx_in no proofs');
    return
  }

  const w = aa.w.o.ls[wid];
  if (!w) 
  {
    aa.log(aa.w.def.id+' walLNut not found');
    return
  }

  let mint = o?.mint || w.mints[0];
  let redeemed = o?.redeemed?.length ? o.redeemed : [];

  const amount = aa.w.proofs_in(proofs,w);
  aa.log(`${aa.w.def.id} ${wid} +${amount} = ${w.balance}`);
  aa.w.save(wid);
  aa.mk.k7375({mint,wid,amount,redeemed})
  // .then(o=>{aa.mk.k7376({direction:'in',...o})});
};


aa.w.tx_out =(proofs,wid,mint)=>
{
  if (!proofs || !proofs.length) 
  {
    aa.log(aa.w.def.id+' tx_out no proofs');
    return
  }

  const w = aa.w.o.ls[wid];
  if (!w) 
  {
    aa.log(aa.w.def.id+' walLNut not found '+wid);
    return
  }
  if (!mint) mint = w.mints[0];

  let amount = aa.w.proofs_out(proofs,wid);
  aa.log(`${aa.w.def.id} -${amount} = ${w.balance} in ${wid}`);
  aa.w.save(wid);

  aa.mk.k7375({mint,wid,amount})
  // .then(o=>{aa.mk.k7376({direction:'out',...o})});
};


// define unit of walLNut
aa.w.unit =(s='')=>
{
  let [unit,wid] = s.split(' ');
  aa.w.o.ls[wid].unit = unit;
  // let a = s.split(' ');
  // let wid = a.shift();
  // aa.w.o.ls[wid].unit = a.shift();
  aa.w.save(wid);
};


aa.w.upg =(k,v)=>
{
  let upd;
  let to_rm = ['e','k37375','k7375','change'];
  for (const i of to_rm)
  {
    if (v.hasOwnProperty(i))
    {
      delete v[i];
      upd=1
    }
  }
  if (!v.hasOwnProperty('history'))
  {
    v.history = [];
    upd=1
  }
  if (!v.hasOwnProperty('mints'))
  {
    v.mints = [];
    upd=1
  }
  if (v.hasOwnProperty('mint'))
  {
    if (v.mint.length) aa.fx.a_add(v.mints,[v.mint]);
    delete v.mint;
    upd=1
  }
  return upd
};


// walLNut object template
aa.w.w =()=>
{
  return  {
    name:'',
    description:'',
    balance:0,
    unit:'sat',
    mints:[],
    proofs:[],
    // history:[],
    quotes:{},
    privkey:'',
    pubkey:'',
    relays:[],
  }
};


// make walLNut element
aa.mk.walLNut =(k,v)=>
{
  const id = aa.w.def.id;
  const ul = aa.mk.l('ul',{cla:'list'});
  
  for (const key in v)
  {
    let val = v[key];
    let li = aa.mk.l('li',{cla:'item item_'+key});
    if (key === 'balance')
    {
      let balance = val+' '+v.unit;
      li.append(
        aa.mk.l('span',{cla:'key',con:key}),
        ' ',aa.mk.l('span',{cla:'val',con:balance})
      );
    }
    // else if (key === 'proofs' 
    // || key === 'quotes' 
    // || key === 'k7375'
    // || key === 'k37375'
    // || key === 'change')
    else
    {
      if (key === 'unit') continue;
      if (key === 'privkey') val = '******';
      if (!val) continue;
      if (typeof val === 'object')
      {
        if (Array.isArray(val) && !val.length) continue; 
        else if (!Object.keys(val).length) continue;
      }
      li = aa.mk.item(key,val);
    }
    // else if (key === 'k37375')
    // {
    //   // li = aa.mk.item(key,val);
    //   // let k37375 = aa.mk.nostr_link(val,'k37375');
    //   // k37375.classList.add('key');
    //   li.append(
    //     // k37375,
    //     aa.mk.butt_action(`e view ${val} `,key,'key'),
    //     ' ',
    //     aa.mk.l('span',{cla:'val',con:val})
    //   );
    // }
    // else 
    // {
    //   li.append(
    //     aa.mk.butt_action(`${id} ${key} ${k} ${val}`,key,'key'),
    //     ' ',
    //     aa.mk.l('span',{cla:'val',con:val})
    //   );
    //   if (key === 'relays') li.dataset.sets = aa.fx.in_sets(aa.r.o.ls,val);
    // }
    ul.append(li);
  }
  return ul
};


// window.addEventListener('load',aa.w.load);