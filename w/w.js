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
aa.w.add =s=>
{
  // required:['wid','mint'],
  // optional:['relset','pubkey','unit'],
  
  let a = s.trim().split(' ');
  let wid = aa.fx.an(a.shift());
  let invalid = !wid || aa.w.o.ls.hasOwnProperty(wid) || wid === 'off';
  if (invalid) 
  {
    aa.log('invalid wid: '+wid);
    return
  }
  const w = aa.w.o.ls[wid] = aa.w.w();

  // mint
  if (a.length) 
  {
    let url = aa.is.url(a.shift().trim())?.href;
    if (url) w.mint = url;
    else 
    {
      aa.log(aa.w.def.id+' add: invalid mint url '+url)
      return
    }
  }
  // relay set
  if (a.length) 
  {
    let relset = a.shift().trim();
    if (relset) w.relays.push(relset);
  }
  // pubkey
  if (a.length)
  {
    let pubkey = a.shift().trim();
    if (aa.is.key(pubkey)) w.pubkey = pubkey;
  }
  // unit. sat is the standard
  if (a.length) w.unit = a.shift().trim();

  // if (a.length) w.mints.push(a.shift().trim());
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// calculate balance from proofs
aa.w.balance =a=>
{
  let total = 0;
  for (const proof of a) total = total + proof.amount;
  return total
};


// check quote state
aa.w.check_quote =async s=>
{
  let a = s.trim().split(' ');
  let quote_id = a.shift();
  let wallet_id = a.length ? a.shift() : false;
  let [wallet,w,wid] = aa.w.get_active(wallet_id);
  const quote = await wallet.checkMintQuote(quote_id);
  if (!w.quotes[quote_id]) w.quotes[quote_id] = {amount:'',quote:quote};
  else w.quotes[quote_id].quote = quote;
  aa.mod_save(aa.w);
  aa.mod_ui(aa.w,wid);
  aa.log('w quote_check '+quote_id+': '+quote.state);
  if (quote.state === 'UNPAID') 
  {
    aa.log(aa.mk.qr(quote.request));
    aa.log(aa.mk.butt_action('w quote_check '+quote.quote))
  }
  if (quote.state === 'PAID') 
  {
    aa.log(aa.mk.butt_action('w mint '+quote.quote))
  }
  return quote.state
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
  //     aa.log(aa.w.def.id+' nutsack deleted: '+k);
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
      active.mint = new cashuts.CashuMint(w.mint);
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


// update kind-10019 
aa.w.k10019 =s=>
{
  let event = { kind:10019, tags:[]};
  let mints = [];
  let relays = [];
  let pubkeys = [];
  for (const id in aa.w.o.ls)
  {
    const w = aa.w.o.ls[id];
    aa.fx.a_add(mints,[[w.mint,w.unit]]);
    if (w.relays) 
    {
      let w_relays = aa.fx.in_sets(aa.r.o.ls,[w.relays]);
      if (w_relays.length) aa.fx.a_add(relays,w_relays);
    }
    if (w.pk && w.pk !== '') aa.fx.a_add(pubkeys,[w.pk]);
  }
  
  for (const i of mints) event.tags.push(['mint',i[0],i[1]]);
  if (!relays.length) relays = aa.fx.in_sets(aa.r.o.ls,['write']);
  for (const i of relays) event.tags.push(['relay',i]);
  for (const i of pubkeys) event.tags.push(['pubkey',i]);

  event = aa.u.event_normalise(event);
  aa.u.event_draft(aa.mk.dat({event:event}));
  
  // aa.dialog(
  // {
  //   title:'new nutsack data',
  //   l:aa.mk.tag_list(event.tags),
  //   no:{exe:()=>{}},
  //   yes:{exe:()=>
  //   {
  //     aa.draft(event);
  //     console.log(event);
  //     // .then(aa.u.event.finalize);
  //   }},
  // });

  //   "kind": 10019,
  //   "tags": [
  //       [ "relay", "wss://relay1" ],
  //       [ "relay", "wss://relay2" ],
  //       [ "mint", "https://mint1", "usd", "sat" ],
  //       [ "mint", "https://mint2", "sat" ],
  //       [ "pubkey", "<p2pk-pubkey>" ]
  //   ]
  // }
};


// update kind-37375 
aa.w.k37375 =async(s='')=>
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
  private.push(['mint',w.mint],['unit','sat']);
  let relays = aa.fx.in_sets(aa.r.o.ls,[w.relays]);
  for (const r of relays) private.push(['relay',r]);
  event.content = await window.nostr.nip44.encrypt(aa.u.p.xpub,JSON.stringify(private));
  event = aa.u.event_normalise(event);
  aa.u.event_draft(aa.mk.dat({event:event}));
  
  // aa.dialog(
  // {
  //   title:'new nutsack data',
  //   l:aa.mk.tag_list(event.tags),
  //   no:{exe:()=>{}},
  //   yes:{exe:()=>
  //   {
  //     aa.draft(event);
  //     console.log(event);
  //     // .then(aa.u.event.finalize);
  //   }},
  // });



// {
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
// }
};

aa.w.k7375 =async(s='')=>
{
  let id = s.trim();
  if (!id) id = Object.keys(aa.w.o.ls)[0];
  const w = aa.w.o.ls[id];
  if (!w) 
  {
    aa.log('unable to create event, walLNut not found');
    return
  }
  let pubkey = aa.u.p.xpub;

  let event = { kind:7375, tags:[['a',`37375:${pubkey}:${id}`]] };
  let private = {};
  private.mint = w.mint;
  private.proofs = w.proofs;
  console.log(private);
  event.content = await window.nostr.nip44.encrypt(pubkey,JSON.stringify(private));
  event = aa.u.event_normalise(event);
  console.log(event);
  aa.u.event_draft(aa.mk.dat({event:event}));

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
};


// event template for nutsack discovery
aa.kinds[10019] =dat=>
{
  const note = aa.e.note_regular(dat);
  note.classList.add('root');
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.new_replaceable(p,dat.event))
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


// event template for nutsack 
aa.kinds[37375] =dat=>
{
  const note = aa.e.note_pre(dat);
  if (!dat.clas.includes('draft')) note.classList.add('tiny');
  note.querySelector('.tags_wrapper').setAttribute('open','');
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    const x = dat.event.pubkey;
    if (!p) p = aa.p.p(x);
    if (aa.p.new_replaceable_param(p,dat.event))
    {
      aa.p.save(p);

      if (aa.is.u(x))
      {
        let wid = dat.event.tags.filter(t=>t[0]==='d')[0][1];
        if (aa.w.o.ls[wid])
        {
          
        }
        else
        {

        }

        aa.log('new nutsack '+wid);
      }
    }
  });

  // let tags = note.querySelector('.tags_wrapper');
  // tags.setAttribute('open','');

  
  
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
      optional:['relset','pubkey','unit'],
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
      required:['wid','unit'],
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
      action:['k','10019'],
      description:'create kind:10019 from walLNut(s)',
      exe:mod.k10019
    },
    {
      action:['k','37375'],
      optional:['wid'],
      description:'create nutsack kind:37375 from walLNut',
      exe:mod.k37375
    },
    {
      action:[id,'quote'],
      required:['amount'],
      optional:['wid'],
      description:'mint quote',
      exe:mod.mint_quote
    },
    {
      action:[id,'check'],
      required:['quote'],
      optional:['wid'],
      description:'check quote',
      exe:mod.check_quote
    },
    {
      action:[id,'mint'],
      required:['quote_id'],
      optional:['wid'],
      description:'mint proofs from quote',
      exe:mod.mint
    },
  );
  aa.mod_load(mod).then(mod.start);
};


// melt proofs
aa.w.melt =async s=>
{
  console.log(s)
};


// mint proofs from quote
aa.w.mint =async s=>
{
  let a = s.trim().split(' ');
  let quote_id = a.shift();
  // let amount = a.length ? parseInt(a.shift()) : 0;
  let wallet_id = a.length ? a.shift() : false;
  let [wallet,w,wid] = aa.w.get_active(wallet_id);
  if (!wallet) 
  {
    aa.log('no walLNut found')
    return
  }
  let proofs;

  let check = await aa.w.check_quote(quote_id);
  if (check === 'PAID')
  {
    if (!amount) amount = w.quotes[quote_id].amount;
    if (!amount) return;
    let units = amount.length > 1 ? 'sats':'sat';
    aa.log('minting proofs for '+amount+units+' from '+quote_id);

    proofs = await wallet.mintProofs(amount,quote_id);
    if (proofs?.length)
    {
      console.log(proofs);
      w.proofs.push(...proofs);
      w.balance = aa.w.balance(w.proofs);
      aa.log('proofs added: '+proofs.length);
      aa.mod_save(aa.w).then(mod=>{aa.mod_ui(mod,wid)});
    }
    else aa.log('something went wrong, check the console for more info')
  }
};


// make quote element
aa.mk.mint_quote =o=>
{
  let ul = aa.mk.l('ul',{cla:'list mint_quote'});
  for (const k in o)
  {
    let v = o[k];
    let li;
    let val = v;
    switch (k)
    {
      // case 'quote': 
      // case 'request':
      // case 'paid':
      // case 'state':  
      case 'expiry': 
        val = v+' // '+aa.t.display_ext(v);
      default: li = aa.mk.item(k,val);
    }
    if (li) ul.append(li);
  }
  return ul
};


// make w mod item
aa.w.mk =(k,v)=>
{
  const id = aa.w.def.id;
  // walLNut mod item
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  // walLNut list
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


// mint quote
aa.w.quote =async s=>
{
  const a = s.split(' ');
  let amount = parseInt(a.shift());
  
  let wallet_id = a.shift();
  let [wallet,w] = aa.w.get_active(wallet_id);
  aa.log('quote for '+amount+' from mint '+wallet?.mint?.mintUrl);
  if (!wallet)
  {
    aa.log('no wallet found');
    return ''
  }
  const quote = await wallet.createMintQuote(amount);
  if (quote) 
  {
    aa.temp.quotes[quote.quote] = {amount:amount,quote:quote};
    // let w = aa.w.o.ls[wallet_id];
    if (!w.quotes) w.quotes = {};
    w.quotes[quote.quote] = {amount:amount,quote:quote};
    aa.mod_save(aa.w);
    aa.mod_ui(aa.w,wallet_id);
    aa.log(aa.mk.mint_quote(quote));
    aa.log(aa.mk.qr(quote.request));
    aa.log(aa.mk.butt_action('w quote_check '+quote.quote))
    
    return quote.quote
  }
  return '';
};


// define relay sets to walLNut
aa.w.relays =s=>
{
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].relays = a;
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// start walLNuts
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
  else setTimeout(()=>{aa.w.start(mod)}, 200);
};


// define unit of walLNut
aa.w.unit =s=>
{
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].unit = a.shift();
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};





// nutsack object template
aa.w.w =()=>
{
  return  {
    balance:0,
    unit:'sat',
    mint:[],
    relays:[],
    pk:'',
    e:'',
    proofs:[],
    quotes:{},
  }
};


// make walLNut element
aa.mk.walLNut =(k,v)=>
{
  const id = aa.w.def.id;
  const ul = aa.mk.l('ul',{cla:'list'});
  for (const key in v)
  {
    if (key === 'unit') continue;
    let val = v[key];
    let li = aa.mk.l('li',{cla:'item item_'+key});
    if (key === 'balance')
    {
      let unit = v.unit?v.unit:'sat';
      li.append(
        aa.mk.butt_action(`${id} unit ${k} ${unit}`,key,'key'),
        ' ',
        aa.mk.l('span',{cla:'val',con:val+' '+unit})
      );
    }
    else if (key === 'proofs' || key === 'quotes')
    {
      li = aa.mk.item(key,val);
    }
    else 
    {
      li.append(
        aa.mk.butt_action(`${id} ${key} ${k} ${val}`,key,'key'),
        ' ',
        aa.mk.l('span',{cla:'val',con:val})
      );
      if (key === 'relays') li.dataset.sets = aa.fx.in_sets(aa.r.o.ls,val);
    }
    ul.append(li);
  }
  return ul
};


window.addEventListener('load',aa.w.load);

aa.w.backup =()=>
{

};