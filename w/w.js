/*

alphaama
mod    w
walLNuts
walLNut
wall_ut
wallut
...
nutsack

*/

aa.w = 
{
  def:{id:'w',ls:{}},
  requires:['r'],
  active:{},
};


// add walLNut
aa.w.add =(s='')=>
{
  // wid mint mint...
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
      if (url) w.mints.push(url);
    }
  }
  aa.w.save(wid);
  return wid
};


// calculate balance from proofs
aa.fx.sum_amounts =a=>
{
  let total = 0;
  for (const i of a) total = total + i.amount;
  return total
};


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


// get active wallet from id
// if no wallet id is provided
// first found is returned
aa.w.get_active =id=>
{
  let w;
  let wallet;
  if (id)
  {
    w = aa.w.o.ls[id];
    if (!w) return false;
    wallet = aa.w.active[id]?.w;
    if (!wallet) 
    {
      let active = aa.w.active[id] = {};
      active.mint = new cashuts.CashuMint(w.mints[0]);
      active.w = new cashuts.CashuWallet(active.mint);
      active.w.loadMint();
      wallet = active.w;
    }
  }
  else 
  {
    id = Object.keys(aa.w.active)[0];
    if (id) return aa.w.get_active(id);
    else 
    {
      id = Object.keys(aa.w.o.ls)[0];
      if (id) return aa.w.get_active(id);
    }
  }
  return [wallet,w,id]
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
    if (w.public?.length) aa.fx.a_add(pubkeys,[w.public]);
  }
  
  for (const i of mints) event.tags.push(['mint',i[0],i[1]]);
  // if (!relays.length) relays = aa.fx.in_sets(aa.r.o.ls,['write']);
  for (const i of relays) event.tags.push(['relay',i]);
  for (const i of pubkeys) event.tags.push(['pubkey',i]);

  event = aa.e.normalise(event);
  aa.e.draft(aa.mk.dat({event:event}));
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
  event.content = await aa.fx.encrypt44(JSON.stringify(private));
  aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
};

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
  let proofs = o.proofs||w.proofs;
  
  let previous = aa.p.events_last(aa.u.p,'k7375');
  let pubkey = aa.u.p.xpub;
  let event = {kind:7375,tags:[['a',`37375:${pubkey}:${wid}`]]};
  let private = {mint:mint,proofs:proofs};
  
  event.content = await aa.fx.encrypt44(JSON.stringify(private));
  event = aa.e.normalise(event);
  aa.e.draft(aa.mk.dat({event:event}));

  let options = 
  {
    wid:wid,
    created:[[event.id]]
  };
  if (o.amount) options.amount = o.amount;
  else options.amount = aa.fx.sum_amounts(proofs);
  // check for previous
  
  if (previous) 
  {
    aa.mk.k5('"" '+previous);
    options.destroyed = [[previous]];
  }

  return options
};


aa.mk.k7376 =async o=>
{
  // {
  //   'amount':amount,
  //   'direction':'in',
  //   'created':[[id]],
  //   'destroyed':[[id,relay]],
  //   'redeemed':[]
  //   'wid':''
  // }
  
  let pubkey = aa.u.p.xpub;
  let direction = o.direction || 'in';
  let event = {kind:7376,tags:[['a',`37375:${pubkey}:${o.wid}`]]};
  private = [['direction',direction]];
  private.push(['amount',''+o.amount,o.amount===1?'sat':'sats']);
  if (o.destroyed) for (const i of o.destroyed) 
  {
    private.push(['e',i[0],i[1]||aa.get.seen(i[0]),'destroyed']);
  }
  if (o.created) for (const i of o.created) 
  {
    private.push(['e',i[0],i[1]||aa.get.seen(i[0]),'created']);
  }
  if (o.redeemed) for (const i of o.redeemed) 
  {
    private.push(['e',i[0],i[1]||aa.get.seen(i[0]),'redeemed']);
  }
  // console.log(private);
  event.content = await aa.fx.encrypt44(JSON.stringify(private));
  // event = aa.e.normalise(event);
  // console.log(event);
  aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
  // aa.e.finalize(event);

  let w = aa.w.o.ls[o.wid];
  if (!w) return;
  if (!w.history) w.history = [];
  w.history.unshift(
  [
    aa.t.now,
    (direction==='in'?'+':'-')+o.amount,
    o.created[0][0]
  ]);
  aa.w.save(o.wid);

//     "kind": 7376,
//     "content": nip44_encrypt([
//         [ "direction", "in" ], // in = received, out = sent
//         [ "amount", "1", "sat" ],
//         [ "e", "<event-id-of-spent-token>", "<relay-hint>", "created" ],
//     ]),
//     "tags": [
//         [ "a", "37375:<pubkey>:my-wallet" ],
//     ]
};

aa.mk.k5 =(s='')=>
{
  let [reason,rest] = aa.fx.split_str(s);
  if (!rest) return;
  let ids = rest.split(',');
  const relays = [];
  const event = {kind:5,content:reason,tags:[]};
  for (const i of ids)
  {
    let a = i.split(' ');
    let id = a.shift();
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
    else 
    {
      tag.unshift('a');
    }
    event.tags.push(tag);
    if (kind) event.tags.push(['k',kind])
  }
  if (window.confirm('you sure you want to delete this?')) 
  {
    console.log(aa.e.normalise(event))
    // aa.e.finalize(aa.e.normalise(event),relays)
  }
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
      aa.p.save(p);
    }
    // let profile = document.getElementById(p.npub);
    // if (!profile) profile = aa.p.profile(p);
  });

  let tags = note.querySelector('.tags_wrapper');
  tags.setAttribute('open','');
  
  return note
};


// event template for walLNut 
aa.kinds[37375] =dat=>
{
  const note = aa.e.note_pre(dat);
  aa.mk.note_encrypted(dat,note);
  // if (!dat.clas.includes('draft')) note.classList.add('tiny');
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
    // setTimeout(()=>
    // {
    //   let content = note.querySelector('.content');
    //   content.append(butt);
    //   aa.log(butt);
    // },2000);
  }
  
  return note
};


aa.w.import =async(s='')=>
{
  if (!s) return;
  let event = aa.db.e[s.trim()]?.event;
  if (!event) return;

  let wid = aa.fx.tag_value(event.tags,'d');
  let w = aa.w.o.ls[wid];
  if (!w)
  {
    w = aa.w.o.ls[aa.w.add(wid)];
    if (!w) 
    {
      aa.log('37375 import failed');
      return 
    }
  }

  // if (!w.k37375.includes(event.id)) w.k37375.push(event.id)
  // else return;

  let a = await window.nostr.nip44.decrypt(event.pubkey,event.content);
  if (!a)
  {
    aa.log('decrypt failed');
    return
  }
  a = aa.parse.j(a);
  if (!a)
  {
    aa.log('37375 content is malformed');
    return
  }
  a.push(...event.tags);

  aa.fx.a_add(w.mints,aa.fx.tags_value(a,'mint'));
  aa.fx.a_add(w.relays,aa.fx.tags_value(a,'relay'));

  for (const i of ['name','description','privkey']) w[i] = aa.fx.tag_value(a,i);
  // w.history.unshift([event.created_at,'wallnut imported','37375:'+event.id]);
  aa.log(`k37375 imported ${event.id}`);

  let filter = {'#a':[`37375:${aa.u.p.xpub}:${wid}`],kinds:[],authors:[aa.u.p.xpub]}
  
  let proofs_id = aa.p.events_last(aa.u.p,'k7375',wid);
  if (proofs_id)
  {
    let dat = await aa.db.get_e(proofs_id);
    if (dat)
    {
      let decrypted = await aa.fx.decrypt(dat.event.content);
      if (decrypted)
      {
        let o = aa.parse.j(decrypted);
        if (o?.proofs?.length) 
        {
          let amount = aa.w.proofs_in(o.proofs,w);
          // w.history.unshift([dat.event.created_at,'proofs imported','7375:'+proofs_id]);
        }
      }
    }
    else
    {
      // w.history.unshift(['?','7375 not_found',proofs_id]);
      filter.kinds.push(7375);
    }
  }
  else filter.kinds.push(7375);

  let tx_ids = aa.u.p.events.k7376;
  if (tx_ids) tx_ids = tx_ids[wid]?.map(i=>i[0]).reverse();
  if (tx_ids?.length)
  {
    let created;
    if (window.confirm(`decrypt all ${tx_ids.length} transactions?`))
    {
      await aa.e.events(tx_ids);
      for (const id of tx_ids)
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
            w.history.unshift([dat.event.created_at,direction+amount,'7376:'+id]);
          }
        }
      }
    }
    else 
    {
      // only decrypt last tx
    }

    if (created && created === proofs_id) aa.log('7376 import: all good');
    else aa.log('7376 import: proofs missing'+(created||''));
  } 
  else filter.kinds.push(7376);

  aa.w.save(wid);
  if (filter.kinds.length) aa.r.demand(['REQ','w',filter],w.relays,{eose:'close'});
};

aa.w.upd_v_as_id =(dat,k)=>
{
  const tag = dat.event.tags.filter(t=>t[0]==='d')[0];
  if (!tag) return '';
  let wid = tag[1]?.trim();
  if (!wid) return '';
  let w = aa.w.o.ls[wid];
  if (w) w[k] = dat.event.id;
  
  return wid
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
  aa.mk.note_encrypted(dat,note);
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
      aa.log(`k7375: walLNut proofs from ${wid}`);
    }
  }
  // aa.e.append_to_notes(note);
  aa.e.append_check(dat,note,aa.get.reply_tag(dat.event.tags));
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
  aa.mk.note_encrypted(dat,note);
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
      aa.log(`k7376: walLNut tx from ${wid}`);
    }
  }
  aa.e.append_check(dat,note,aa.get.reply_tag(dat.event.tags));
  return note
};


// on load
aa.w.load =()=>
{
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
      action:[id,'pubkey'],
      required:['wid','hex_pubkey'],
      description:'set pubkey to walLNut',
      exe:mod.pubkey
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
      optional:['aid','nid'],
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
    // {
    //   action:['cashu','check'],
    //   required:['quote'],
    //   optional:['wid'],
    //   description:'check quote',
    //   exe:mod.quote_check
    // },
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
      action:['cashu','token'],
      required:['amount'],
      optional:['wid'],
      description:'create a token',
      exe:mod.token
    },
    {
      action:['cashu','receive'],
      required:['token'],
      optional:['wid'],
      description:'receive a token',
      exe:mod.receive
    },
  );
  aa.mod_load(mod).then(mod.start);
};


// melt proofs
aa.w.melt =async(s='')=>
{
  let [invoice,w_id] = s.split(aa.regex.fw);
  let [wallet,w,wid] = aa.w.get_active(w_id);
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
  let [wallet,w,wid] = aa.w.get_active(w_id);
  if (!wallet) 
  {
    aa.log('no walLNut found')
    return
  }
  let amount = w.quotes[quote_id].amount;
  if (!amount) return;
  let units = amount.length > 1 ? 'sats':'sat';
  aa.log('minting proofs for '+amount+units+' from '+quote_id);
  
  wallet.mintProofs(amount,quote_id)
  .then(proofs=>
  {
    aa.w.tx_in(proofs,wid,wallet.mint.mintUrl)
  });

  let proofs;

  // let check = await aa.w.quote_check(quote_id);
  // if (check === 'PAID')
  // {
    
  //   // proofs = await wallet.mintProofs(amount,quote_id);
  //   // aa.w.tx_in(proofs);s
  // }
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

  let amount = aa.w.proofs_out(proofs,w);
  aa.log(`${aa.w.def.id} -${amount} = ${w.balance} in ${wid}`);
  aa.w.save(wid);

  aa.mk.k7375({mint:mint,proofs:proofs,wid:wid,amount:amount})
  .then(o=>{aa.mk.k7376({direction:'out',...o})});
};


aa.w.tx_in =async(proofs,wid,mint)=>
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

  if (!mint) mint = w.mints[0];

  const amount = aa.w.proofs_in(proofs,w);
  aa.log(`${aa.w.def.id} ${wid} +${amount} = ${w.balance}`);
  aa.w.save(wid);
  aa.mk.k7375({mint:mint,proofs:proofs,wid:wid,amount:amount})
  .then(o=>{aa.mk.k7376({direction:'in',...o})});
};


// make w mod item
aa.w.mk =(k,v)=>
{
  const id = aa.w.def.id;
  // walLNut mod item
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  // walLNut list
  if (v.mint)
  {
    if (!v.mints) v.mints = [];
    v.mints.push(v.mint);
    v.mints = [...new Set(v.mints)];
    delete v.mint;
    aa.mod_save(aa.w);
  }
  const ul = aa.mk.walLNut(k,v);
  // walLNut details
  const details = aa.mk.details(k,ul,1);
  details.append(
    // aa.mk.butt_action(`${id} del ${k}`,'del','del'),
    // ' ',
    // aa.mk.butt_action(`${id} upd ${k}`,'upd','upd'),
    // ' ',
    // aa.mk.butt_action(`${id} upd ${k}`,'upd','upd')
  );
  l.append(details);
  return l
};


aa.w.proofs_in =(proofs,w)=>
{
  const amount = aa.fx.sum_amounts(proofs);
  w.proofs.push(...proofs);
  w.balance = aa.fx.sum_amounts(w.proofs);
  return amount
};


aa.w.proofs_out =(proofs,w)=>
{
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
  let [wallet,w,wid] = aa.w.get_active(w_id);
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
  let [wallet] = aa.w.get_active(wid);
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
  let [wallet,w,wid] = aa.w.get_active(w_id);
  let checks = 0;
  let log = aa.mk.l('div',{cla:'quote_check'});
  let butt = aa.mk.l('button',
  {
    con:'stop checking '+quote_id,
    clk:e=>
    {
      log.remove();
    }
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
      case 'redeemed':
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


// start mod
aa.w.start =mod=>
{
  if (aa.mods_required(mod)) 
  {
    aa.mk.mod(mod);
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
    let upd_butt = aa.mk.butt_action(`${mod.def.id} k10019 `,'k10019');
    
    mod.l.insertBefore(upd_butt,document.getElementById(mod.def.id));
    mod.l.insertBefore(add_butt,upd_butt);
  }
  else 
  {
    if (!mod.attempts) mod.attempts = 1;
    else mod.attempts++;
    if (mod.attempts < 20) setTimeout(()=>{aa.w.start(mod)}, 100 * mod.attempts);
  }
};



aa.w.token =async(s='')=>
{
  let [amount,w_id] = s.split(aa.regex.fw);
  amount = parseInt(amount);
  let [wallet,w,wid] = aa.w.get_active(w_id);
  const {keep,send} = await wallet.send(amount,w.proofs);
  aa.w.tx_out(keep,wid);
  const o = 
  {
    memo:'yo',
    mint:wallet.mint._mintUrl,
    proofs:send,
    unit:'sat',
  };
  const token = cashuts.getEncodedTokenV4(o);
  // aa.log(token);
  return token

  // const wallet2 = new CashuWallet(mint); // receiving wallet
  // const receiveProofs = await wallet2.receive(token);
};

aa.w.receive =async(s='')=>
{
  let [token,w_id] = s.split(aa.regex.fw);
  let [wallet,w,wid] = aa.w.get_active(w_id);
  const proofs = await wallet.receive(token);
  aa.w.tx_in(proofs,wid);
  // const c_token = {token:[{mint:wallet.mint._mintUrl,proofs:send}]};
  // const token = cashuts.getEncodedTokenV4({mint:wallet.mint._mintUrl,proofs:send});
  // aa.log(token);

  // const wallet2 = new CashuWallet(mint); // receiving wallet
  // const receiveProofs = await wallet2.receive(token);
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


// walLNut object template
aa.w.w =()=>
{
  return  {
    balance:0,
    unit:'sat',
    mints:[],
    proofs:[],
    history:[],
    // k37375:[],
    // k7375:[],
    // k7376:[],
    quotes:{},
    privkey:'',
    public:'',
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
      let unit = v.unit?v.unit:'sat';
      li.append(
        aa.mk.l('span',{cla:'key',con:key}),
        // aa.mk.butt_action(`${id} unit ${k} ${unit}`,key,'key'),
        ' ',
        aa.mk.l('span',{cla:'val',con:val+' '+unit})
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


window.addEventListener('load',aa.w.load);