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
  def:
  {
    id:'w',
    ls:
    {
      balance:0,
      def:'',
      mints:{},
      privkey:'',
      pubkey:'',
      redeemable:[],
      redeemed:[],
      relays:[]
    },
  },
  requires:['r'],
  active:{},
};


// add walLNut
aa.w.add =(s='')=>
{
  // s = mint mint...
  let a = s.split(' ');
  if (a.length) 
  {
    for (let url of a)
    {
      url = aa.is.url(url.trim())?.href;
      if (url && !aa.w.o.ls.mints[url]) aa.w.o.ls.mints[url] = {proofs:[],quotes:[]};
      if (aa.w.o.def === '') aa.w.o.def = url;
    }
  }
  aa.w.save();
  return aa.w.o
};


// 21,'sat => 21sats
aa.fx.amount_display =(num,unit)=> num+aa.fx.plural(num,unit);


// get active wallet from mint
// if no mint is provided
// def is returned
aa.w.get_active =async(id)=>
{
  if (!id) id = aa.w.get_def();
  if (!id) return [];
  let w = aa.w.o;
  let active = aa.w.active[id] || {};
  if (!active.wallet)
  {
    active.mint = new cashuts.CashuMint(id);
    let haz_keys;
    let options = {};
    if (w.ls.mints[id].keys) 
    {
      options.keys = w.ls.mints[id].keys;
      options.keysets = w.ls.mints[id].keysets;
      haz_keys = true;
    }
    active.wallet = new cashuts.CashuWallet(active.mint,options);
    if (!haz_keys)
    {
      await active.wallet.loadMint();
      w.ls.mints[id].keys = active.wallet.keys;
      w.ls.mints[id].keysets = active.wallet.keysets;
      aa.w.save();
    }
  }
  return [active.wallet,w.ls.mints[id],id]
};


// get default mint
// fallback to first active
// fallback to first added
aa.w.get_def =()=>
{
  let id = aa.w.o.def || Object.keys(aa.w.active)[0];
  if (!id) id = Object.keys(aa.w.o.ls.mints)[0];
  return id
};


// get mint object
aa.w.get_mint =s=> aa.w.o.ls.mints[s];


// import walLNut from k17375
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

  let w = aa.w.o;
  

  let a = await aa.fx.decrypt_parse(dat.event);
  a.push(...tags);
  for (const url of aa.fx.tags_values(a,'mint')) 
  {
    if (!w.ls.mints[url]) w.ls.mints[url] = {proofs:[],quotes:[]};
  }
  let relays = aa.fx.tags_values(a,'relay');
  let privkey = aa.fx.tag_value(a,'privkey');
  let pubkey = aa.fx.keypair(w.privkey)[1];
  w.ls = {mints,relays,privkey,pubkey};
  
  //let haz_proofs = await aa.w.import_7375(wid);
  //if (!haz_proofs) filter.kinds.push(7375);
  //else aa.log(`7375 imported: ${aa.fx.amount_display(aa.fx.sum_amounts(haz_proofs))}`)

  // let haz_history = await aa.w.import_7376(wid);
  // if (!haz_history) filter.kinds.push(7375);
  
  // if (haz_history && haz_proofs 
  //   && haz_history === haz_proofs) aa.log('7376 import: all good');
  // else aa.log(`7376 import: proofs missing ${haz_proofs} ${haz_history}`);

  aa.w.save();
  // if (filter.kinds.length) aa.r.demand(['REQ','w',filter],w.relays,{eose:'close'});
};


aa.w.import_7375 =async(id)=>
{
  if (!id) return;
  let dat = await aa.db.get_e(id);
  if (!dat) return;
  let {proofs} = await aa.fx.decrypt_parse(dat.event);
  if (proofs?.length) aa.w.proofs_in(proofs);
  return proofs
};


// nutzap has been redeemed
aa.w.is_redeemed =id=>
{
  if (aa.w.o.ls.redeemed.includes(id)) return true;
  else 
  {
    let event = aa.db.e[id].event;
    let amount = aa.fx.tag_value(event.tags,'amount');
    aa.w.o.ls.redeemable.push([amount,id]);  
  }
  return false
};


// add keypair to walLNut
aa.w.key =(privkey='')=>
{
  let w = aa.w.o.ls;
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

    pub = aa.fx.keypair(privkey)[1];
    let sdo = w.privkey.length ? window.confirm('replace privkey?') : true;
    if (sdo)
    {
      w.privkey = privkey;
      w.pubkey = pub;
      upd = true;
    }
  }
  if (upd) 
  {
    aa.w.save();
    // aa.mk.k10019();
    // aa.mk.k17375(wid);
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
  let o = aa.w.o.ls;
  let event = {kind:10019,tags:[]};
  for (const i of Object.keys(o.mints)) event.tags.push(['mint',i,'sat']);
  for (const i of o.relays) event.tags.push(['relay',i]);
  if (o.pubkey.length) event.tags.push(['pubkey',o.pubkey]);
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
    aa.log('unable to create event, walLNut not found');
    return
  }

  let mint = o.mint||aa.w.def();
  let proofs = w.ls.mints[mint].proofs;
  let del = [];
  let last = aa.p.events_last(aa.u.p,'k7375');
  if (last) del.push(last);
  if (o.del) aa.fx.a_add(del,o.del);
  let event = {kind:7375};
  event.content = await aa.fx.encrypt44(JSON.stringify({mint,proofs,del}));
  aa.e.finalize(aa.e.normalise(event));
  if (del.length) aa.mk.k5('"poof" '+del.join());
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

// s = amount_n pubkey_s_key memo_s_q id_s_key wid_s_an
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
  aa.w.tx_out(keep,wid);
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
//   "tags": [

//   ]
// update kind-17375 
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


// event template for event deletion requests
aa.kinds[5] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('tiny');
  return note
};


// event template for walLNut proofs
aa.kinds[7375] =dat=>
{
  const note = aa.e.note_regular(dat);
  // aa.mk.note_encrypted(dat,note);
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  note.querySelector('.tags_wrapper')?.setAttribute('open','');
  if (aa.is.u(dat.event.pubkey))
  {
    let p = aa.u.p;
    // let tag_a = aa.fx.tag_value(dat.event.tags,'a');
    // let wid = tag_a.split(':')[2];
    if (aa.p.events_newer(p,dat.event))
    {
      aa.p.save(p);
    }
  }
  // aa.e.append_to_notes(note);
  // aa.e.append_check(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};


// event template for nutzap
aa.kinds[9321] =dat=>
{
  const note = aa.e.note(dat);
  let p_x = aa.fx.tag_value(dat.event.tags,'p');
  let e_id = aa.fx.tag_value(dat.event.tags,'e');
  if (aa.is.u(p_x) && !aa.w.is_redeemed(dat.event.id))
  {
    aa.w.save();
    setTimeout(async()=>
    {
      let log = `nutzapped +${amount} by `;
      log += await aa.p.author(dat.event.pubkey);
      if (e_id) log += ` for ${e_id}`;
      aa.log(log);
    },0);
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
  note.querySelector('.tags_wrapper')?.setAttribute('open','');
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
  return note
};


// event template for walLNut 
aa.kinds[17375] =dat=>
{
  const note = aa.e.note_pre(dat);
  //aa.mk.note_encrypted(dat,note);
  note.querySelector('.tags_wrapper')?.setAttribute('open','');
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
  if (aa.q?.ls)
  {
    aa.q.ls.w = {"authors":["u"],"kinds":[7375,10019,17375]};

    if (aa.q.ls.a) aa.fx.a_add(aa.q.ls.a.kinds,[10019,17375]);
    if (aa.q.ls.b) aa.fx.a_add(aa.q.ls.b.kinds,[10019]);
    if (aa.q.ls.c) aa.fx.a_add(aa.q.ls.c.kinds,[10019]);
    if (aa.q.ls.f) aa.fx.a_add(aa.q.ls.f.kinds,[10019]);
    if (aa.q.ls.n) aa.fx.a_add(aa.q.ls.n.kinds,[9321,9735]);
  }

  aa.fx.a_add(aa.e.renders.encrypted,[7375,7376,17375]);
  aa.temp.quotes = {};
  let mod = aa.w;
  let id = mod.def.id;
  aa.actions.push(
    {
      action:[id,'add'],
      required:['mint'],
      description:'add walLNut',
      exe:mod.add
    },
    {
      action:[id,'key'],
      optional:['hex_privkey'],
      description:'set private key to decrypt p2pk tokens',
      exe:mod.key
    },
    {
      action:[id,'relays'],
      required:['url'],
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
      exe:mod.quote_check
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
  // let [invoice,w_id] = s.split(aa.fx.regex.fw);
  let [wallnut,w,mint] = await aa.w.get_active();
  if (!wallnut)
  {
    aa.log('w melt: no walLNut found')
    return
  }
  const quote = await wallnut.createMeltQuote(s);
  if (!quote)
  {
    aa.log('w melt: no quote created')
    return
  }
  const amount = quote.amount + quote.fee_reserve;
  const options = {includeFees:true};
  const {keep,send} = await wallnut.send(amount,w.proofs,options);
  console.log(proofs);
  const melt_response = await wallnut.meltProofs(quote,send);
  aa.log(aa.mk.ls({ls:melt_response}));
  console.log(melt_response);
  keep.push(...melt_response.change);
  aa.w.tx_out(keep);
};


// mint proofs from quote
aa.w.mint =async(s='')=>
{
  // let a = s.split(' ');
  // let quote_id = a.shift();
  // let amount = a.length ? parseInt(a.shift()) : 0;
  // let w_id = a.length ? a.shift() : false;
  let [wallet,w,mint] = await aa.w.get_active();
  if (!wallet) 
  {
    aa.log('no walLNut found')
    return
  }
  let amount = w.quotes[s]?.amount;
  if (!amount) return;
  let units = aa.fx.amount_display(amount,'sat');
  aa.log(`minting proofs for ${units} from ${s}`);
  
  let proofs = await wallet.mintProofs(amount,s);
  aa.w.tx_in(proofs,mint);
};


// make w mod item
aa.w.mk =(k,v)=>
{
  const id = aa.w.def.id;
  // aa.w.upg(k,v);
  return aa.mk.item(k,v);
  
  // // walLNut mod item
  // const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  // // walLNut list
  // const ul = aa.mk.walLNut(k,v);
  // // walLNut details
  // const details = aa.mk.details(k,aa.mk.ls({ls:ul,1);
  // details.append(
  //   // aa.mk.butt_action(`${id} del ${k}`,'del','del'),
  //   // ' ',
  //   aa.mk.butt_action('mk 17375 '+k,'k17375'),
  //   // ' ',
  //   // aa.mk.butt_action(`${id} upd ${k}`,'upd','upd')
  // );
  // l.append(details);
  // return l
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
aa.w.proofs_in =(proofs,mint)=>
{
  let w = aa.w.get_mint(mint);
  if (!w) return;
  const amount = aa.fx.sum_amounts(proofs);
  w.proofs.push(...proofs);
  w.balance = aa.fx.sum_amounts(w.proofs);
  return amount
};


// save proofs from tx out
aa.w.proofs_out =(proofs,mint)=>
{
  let w = aa.w.get_mint(mint);
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
  let [amount,url] = s.split(' ');
  amount = parseInt(amount);
  let [wallnut,w,mint] = await aa.w.get_active(url);
  if (!wallnut)
  {
    aa.log('no wallnut found');
    return ''
  }
  
  const quote = await wallnut.createMintQuote(amount);
  if (quote)
  {
    quote.amount = amount;
    // aa.temp.quotes[quote.quote] = {amount:amount,quote:quote};
    // w.quotes.push(quote);
    w.quotes[quote.quote] = quote;//{amount:amount,quote:quote};
    aa.w.save();
    aa.log('quote for '+aa.fx.amount_display(amount,'sat')+' from mint '+mint);
    return quote.quote
  }
  return '';
};


// check quote state
aa.w.quote_check =async(s='')=>
{
  let [quote_id,url] = s.split(' ');
  let [wallnut,w,mint] = await aa.w.get_active(url);
  if (!wallnut)
  {
    aa.log('no wallnut found');
    return ''
  }
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
    const quote = await wallnut.checkMintQuote(quote_id);
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
          aa.w.mint(quote_id+' '+mint);
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
};


// receive token
aa.w.receive =async(s='')=>
{
  let [token,url] = s.split(aa.fx.regex.fw);
  let [wallnut,w,mint] = await aa.w.get_active(url);
  if (!wallnut)
  {
    aa.log('no wallnut found');
    return ''
  }
  const proofs = await wallnut.receive(token,{privkey:w.privkey});
  aa.w.tx_in(proofs,mint);
};


aa.w.redeem =async(s='')=>
{
  let ids = s.split(' ').map(i=>i.trim()).filter(aa.is.key);
  return ids
  // const o = {sat:{}};

  // for (const id of ids)
  // {
  //   let dat = aa.db.e[id];
  //   if (!dat) continue;
    
  //   let proofs = aa.fx.tags_values(dat.event.tags,'proof')
  //     .map(i=>aa.parse.j(i));
  //   if (!proofs.length) continue;

  //   let unit = aa.fx.tag_value(dat.event.tags,'unit');
  //   if (!unit) continue;
  //   if (!o[unit]) o[unit] = {};

  //   let mint = aa.is.url(aa.fx.tag_value(dat.event.tags,'u'))?.href;
  //   if (!mint) continue;
  //   if (!o[unit][mint]) o[unit][mint] = [];
  //   let pubkey = dat.event.pubkey;
  //   o[unit][mint].push({proofs,id,pubkey});
  // }
  // for (const unit in o)
  // {
  //   for (const mint in o[unit])
  //   {
  //     let [wallnut,w] = await aa.w.get_active(mint);
  //     if (!wallnut) continue;
  //     let swap_options = {privkey:aa.w.o.ls.privkey};
  //     let redeemed = [];
  //     let pubkeys = [];
  //     let c_proofs = [];
  //     for (const i of o[unit][mint])
  //     {
  //       let amount = aa.fx.sum_amounts(i.proofs);
  //       const {keep,send} = await wallnut.swap(amount,i.proofs,swap_options);
  //       c_proofs.push(...keep,...send);
  //       aa.fx.a_add(redeemed,i.id);
  //       aa.fx.a_add(pubkeys,i.pubkey);
  //     }
  //     aa.w.tx_in(c_proofs,{redeemed,pubkeys,mint});
  //   }
  // }
};



// define relay sets to walLNut
aa.w.relays =(s='')=>
{
  let a = s.split(' ').map(i=>aa.is.url(i.trim())?.href);
  aa.fx.a_add(aa.w.o.ls.relays,a)
  aa.w.save();
};


// save walLNut
aa.w.save =id=>
{
  if (id) aa.mod_ui(aa.w,id);
  aa.mod_save(aa.w);
};


// returns token to send
aa.w.send =async(s='')=>
{
  let [amount,w_id,pubkey] = s.split(' ');
  amount = parseInt(amount);
  let [wallnut,w,mint] = await aa.w.get_active();
  let opts = {};
  if (pubkey)
  {
    pubkey = pubkey.trim();
    if (aa.is.key(pubkey)) opts.pubkey = '02'+pubkey;
  }
  const {keep,send} = await wallnut.send(amount,w.proofs,opts);
  aa.w.tx_out(keep,mint);
  // return send
  // const o = 
  // {
  //   memo:'yo',
  //   mint:mint,
  //   proofs:send,
  //   unit:'sat',
  // };
  return cashuts.getEncodedTokenV4(
  {
    memo:'yo',
    mint:mint,
    proofs:send,
    unit:'sat',
  })
};


// start mod
aa.w.start =mod=>
{
  aa.mk.mod(mod);
  let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
  let upd_butt = aa.mk.butt_action(`mk 10019`,'k10019');
  
  // let ids = mod.o.ls.redeemable.map(i=>i[0]).join(' ');
  // let amount = mod.o.redeemable.map(i=>i[i]).reduce((a,b)=>a+b,0);
  // let redeem_butt = aa.mk.butt_action(`${mod.def.id} redeem ${ids}`,'🐿️['+amount+']');
  
  mod.l.insertBefore(upd_butt,document.getElementById(mod.def.id));
  mod.l.insertBefore(add_butt,upd_butt);
  // mod.l.insertBefore(redeem_butt,upd_butt);
};


// calculate balance from proofs
aa.fx.sum_amounts =a=>
{
  let total = 0;
  for (const i of a) total = total + i.amount;
  return total
};


aa.w.tx_in =async(proofs,mint,o)=>
{
  if (!proofs || !proofs.length) 
  {
    aa.log(aa.w.def.id+' tx_in no proofs');
    return
  }

  const w = aa.w.o.ls[mint];
  if (!w) 
  {
    aa.log(aa.w.def.id+' walLNut not found');
    return
  }

  // let mint = o?.mint || w.mints[0];
  let redeemed = o?.redeemed?.length ? o.redeemed : [];

  const amount = aa.w.proofs_in(proofs,mint);
  aa.log(`${aa.w.def.id} +${amount} = ${aa.w.o.ls.balance}`);
  aa.w.save();
  aa.mk.k7375({mint,amount,redeemed})
};




aa.w.tx_out =(proofs,mint)=>
{
  if (!proofs || !proofs.length) 
  {
    aa.log(aa.w.def.id+' tx_out no proofs');
    return
  }

  const w = aa.w.o.ls[mint];
  if (!w) 
  {
    aa.log(aa.w.def.id+' walLNut not found');
    return
  }
  if (!mint) mint = aa.w.get_def();

  let amount = aa.w.proofs_out(proofs,mint);
  aa.log(`${aa.w.def.id} -${amount} = ${w.balance} in ${wid}`);
  aa.w.save();

  aa.mk.k7375({mint})
  // .then(o=>{aa.mk.k7376({direction:'out',...o})});
};



aa.w.upg =(k,v)=>
{
  let upd;
  // let to_rm = ['e','k37375','k7375','change'];
  // for (const i of to_rm)
  // {
  //   if (v.hasOwnProperty(i))
  //   {
  //     delete v[i];
  //     upd=1
  //   }
  // }
  // if (!v.hasOwnProperty('history'))
  // {
  //   v.history = [];
  //   upd=1
  // }
  // if (!v.hasOwnProperty('mints'))
  // {
  //   v.mints = {};
  //   upd=1
  // }
  // if (v.hasOwnProperty('mint'))
  // {
  //   if (v.mint.length) aa.fx.a_add(v.mints,[v.mint]);
  //   delete v.mint;
  //   upd=1
  // }
  if (upd) setTimeout(()=>{aa.w.save()},200);
};

// window.addEventListener('load',aa.w.load);