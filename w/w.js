/*

alphaama
mod    w
walLNuts

*/





// w default options
if (!Object.hasOwn(localStorage,'zap')) localStorage.zap = '21';
if (!Object.hasOwn(localStorage,'zap_memo')) localStorage.zap_memo = '<3';


// w
aa.w =
{
  name:'walLNut',
  about:'nip60/61 cashu',
  def:
  {
    id:'w',
    ls:
    {
      def:'',
      mints:{},
      privkey:'',
      pubkey:'',
      redeemable:[],
      redeemed:[],
    },
  },
  active:{},
  scripts:
  [
    '/w/clk.js',
    '/w/kinds.js',
    '/w/mk.js',
  ],
  butts:
  {
    mod:
    [
      [`mk 10019`,'k10019']
    ],
    init:
    [
      [`w import`,'import']
    ]
  }
};

// aa.w.mod_butts =async(used)=>
// {
//   if (used)
//   {
//     let df = new DocumentFragment();
//     let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
//     let upd_butt = aa.mk.butt_action(`mk 10019`,'k10019');
//     df.append(add_butt,' ',upd_butt);
//     fastdom.mutate(()=>
//     {
//       mod.l.insertBefore(df,mod.l.lastChild);
//     })
//   }
//   else
//   {
//     fastdom.mutate(()=>
//     {
//       mod.l.append(aa.mk.butt_action(`${mod.def.id} import`,'import'))
//     })
//   }
// };


// add mint to walLNut
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
      url = aa.is.url(url.trim())?.href;
      let mint = aa.w.get_mint(url);
      if (!mint && url)
      {
        mint = aa.w.o.ls.mints[url] = {proofs:[],quotes:[],url};
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
  if (!url) return [];
  
  let w = aa.w.o;
  let active = aa.w.active[url] || {};
  
  if (!active.wallet)
  {
    active.mint = new cashuts.CashuMint(url);
    let haz_keys;
    let options = {};
    let mint = aa.w.o.ls.mints[url];
    if (mint?.keys)
    {
      options.keys = mint.keys;
      options.keysets = mint.keysets;
      haz_keys = true;
    }
    active.wallet = new cashuts.CashuWallet(active.mint,options);
    if (!haz_keys)
    {
      await active.wallet.loadMint();
      mint.keys = active.wallet.keys;
      mint.keysets = active.wallet.keysets;
      aa.w.save();
    }
    aa.w.active[url] = active;
  }
  return [active.wallet,mint]
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

  let dat = await aa.db.get_e(id);
  if (!dat) 
  {
    aa.log('w import: event not found');
    return
  }

  let decrypted_tags = await aa.fx.decrypt_parse(dat.event);
  decrypted_tags.push(...dat.event.tags);

  let mints = aa.fx.tags_values(decrypted_tags,'mint');
  let privkey = aa.fx.tag_value(decrypted_tags,'privkey');
  
  if (mints.length) aa.w.add(mints.join(' '));
  if (privkey.length) aa.w.key(privkey);
  // aa.r.def_req('w_import',aa.q.ls.w);
  // let l = aa.e.printed.get(id);
  // aa.q.run(aa.q.ls.w);
};


//
aa.w.import_7375 =async(id='')=>
{  
  if (!id)
  {
    aa.log('w import: no id provided');
    return
  }

  let dat = await aa.db.get_e(id);
  if (!dat) 
  {
    aa.log('w import: event not found');
    return
  }
  
  let {mint,proofs} = await aa.fx.decrypt_parse(dat.event);
  url = aa.is.url(mint)?.href;
  if (!url) 
  {
    aa.log('w import: invalid mint url');
    return
  }
  
  mint = aa.w.o.ls.mints[url];
  if (!mint) mint = aa.w.add(url)[0];
  
  if (proofs?.length) aa.w.proofs_in(proofs,url);
  aa.w.save();
  return proofs
};


// nutzap has been redeemed
aa.w.is_redeemed =id=>
{
  let ls = aa.w.o.ls;
  if (ls.redeemed.includes(id)) return true;
  else
  {
    let event = aa.db.e[id].event;
    let amount = aa.fx.tag_value(event.tags,'amount');
    ls.redeemable.push([amount,event]);
    aa.w.save();
  }
  return false
};


// add keypair to walLNut
aa.w.key =(privkey='',confirm=true)=>
{
  let ls = aa.w.o.ls;
  if (!ls)
  {
    aa.log('w key: wallet not found');
    return
  }
  if (ls.privkey?.length && !window.confirm('replace walLNut keys?')) return;

  let keys = aa.fx.keypair(privkey);
  if (keys)
  {
    w.privkey = keys[2];
    w.pubkey = keys[1];
    aa.w.save();
  }
  return keys
};


// on load
aa.w.load =async()=>
{
  let mod = aa.w;
  let id = mod.def.id;

  await aa.mk.scripts(mod.scripts);


  // extend queries
  if (aa.q?.ls)
  {
    aa.q.ls.w = {"authors":["u"],"kinds":[7374,7375,7376,10019,17375,37375]};
    if (!aa.q.o.ls.w) aa.q.reset(['w']);

    if (aa.q.ls.a) aa.fx.a_add(aa.q.ls.a.kinds,[10019,17375,37375]);
    if (aa.q.ls.b) aa.fx.a_add(aa.q.ls.b.kinds,[10019]);
    if (aa.q.ls.c) aa.fx.a_add(aa.q.ls.c.kinds,[10019]);
    if (aa.q.ls.f) aa.fx.a_add(aa.q.ls.f.kinds,[10019]);
    if (aa.q.ls.n) aa.fx.a_add(aa.q.ls.n.kinds,[9321,9735]);
  }
  // extend renders
  aa.fx.a_add(aa.e.rnd.encrypted,[7374,7375,7376,17375,37375]);
  // extend actions
  aa.actions.push(
    {
      action:[id,'add'],
      required:['<mint_url>'],
      description:'add mint to walLNut',
      exe:mod.add
    },
    {
      action:[id,'key'],
      optional:['<privkey>'],
      description:'set private key to walLNut',
      exe:mod.key
    },
    {
      action:[id,'import'],
      required:['<event_id>'],
      description:'create walLNut from kind:17375/37375',
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
      description:'pay lightning invoice from walLNut proofs',
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
  );
  // extend note actions
  aa.e.butts?.na?.push(['nzap']);
  // extend profile actions
  aa.p.butts?.pa?.push(['nzap']);
  // load
  await aa.mod.load(mod);
  await aa.mod.mk(mod);
  mod.start(mod);
};


// melt proofs
aa.w.melt =async(invoice='')=>
{
  // let [invoice,w_id] = s.split(aa.fx.regex.fw);
  let [wallnut,w] = await aa.w.get_active();
  if (!wallnut)
  {
    aa.log('w melt: no walLNut found')
    return
  }
  const quote = await wallnut.createMeltQuote(invoice);
  if (!quote)
  {
    aa.log('w melt: no quote created')
    return
  }
  const amount = quote.amount + quote.fee_reserve;
  const {keep,send} = await wallnut.send(amount,w.proofs,{includeFees:true});
  const melt_response = await wallnut.meltProofs(quote,send);
  aa.log(aa.mk.ls({ls:melt_response}));
  console.log(melt_response);
  keep.push(...melt_response.change);

  aa.w.tx_out(keep,w.url);
};


// mint proofs from quote
aa.w.mint =async(quote_id='')=>
{
  let [wallet,w] = await aa.w.get_active();
  if (!wallet) 
  {
    aa.log('no walLNut found');
    return
  }
  let amount = w.quotes[quote_id]?.amount;
  if (!amount) 
  {
    aa.log('no amount for quote')
    return;
  }
  aa.log(`minting proofs for ${aa.fx.units(amount)} from ${quote_id}`);
  
  let proofs = await wallet.mintProofs(amount,quote_id);
  aa.w.tx_in({proofs,url:w.url});
};


// make w mod item
aa.w.mk =(k,v)=>
{
  if (k === 'privkey') v = '******';
  let item = aa.mk.item(k,v);
  return item;
};


aa.w.mod_butts =async(used)=>
{
  if (used)
  {
    let df = new DocumentFragment();
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
    let upd_butt = aa.mk.butt_action(`mk 10019`,'k10019');
    df.append(add_butt,' ',upd_butt);
    fastdom.mutate(()=>
    {
      mod.l.insertBefore(df,mod.l.lastChild);
    })
  }
  else
  {
    fastdom.mutate(()=>
    {
      mod.l.append(aa.mk.butt_action(`${mod.def.id} import`,'import'))
    })
  }
};


// save proofs from tx in
aa.w.proofs_in =(proofs,url)=>
{
  let mint = aa.w.get_mint(url);
  if (!mint) return;
  const amount = aa.w.sum_amounts(proofs);
  mint.proofs.push(...proofs);
  mint.amount = aa.w.sum_amounts(mint.proofs);
  aa.w.balance();
  return amount
};


// save proofs from tx out
aa.w.proofs_out =(proofs,url)=>
{
  let mint = aa.w.get_mint(url);
  if (!mint) return;
  let old_balance = aa.w.sum_amounts(mint.proofs);
  let new_balance = aa.w.sum_amounts(proofs);
  mint.proofs = [...proofs];
  aa.w.balance();
  // w.balance = new_balance;
  return old_balance - new_balance;
};


// mint quote
aa.w.quote =async(string='')=>
{
  let [amount,url] = aa.fx.splitr(string)//string.split(' ');
  amount = parseInt(amount);
  let [wallnut,w] = await aa.w.get_active(url);
  if (!wallnut)
  {
    aa.log('no wallnut found');
    return ''
  }
  
  const quote = await wallnut.createMintQuote(amount);
  if (quote)
  {
    quote.amount = amount;
    w.quotes[quote.quote] = quote;//{amount:amount,quote:quote};
    aa.w.save();
    aa.log('quote for '+aa.fx.units(amount)+' from mint '+url);
    return quote.quote
  }
  return ''
};


// check quote state
aa.w.quote_check =async(string='')=>
{
  let [quote_id,url] = aa.fx.splitr(string);
  let [wallnut,w] = await aa.w.get_active(url);
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
aa.w.receive =async(string='')=>
{
  let [token,url] = string.split(aa.fx.regex.fw);
  let [wallnut,w] = await aa.w.get_active(url);
  if (!wallnut)
  {
    aa.log('no wallnut found');
    return ''
  }
  const proofs = await wallnut.receive(token,{privkey:w.privkey});
  aa.w.tx_in({proofs,url});
};


// wip
// redeem nutzap events
aa.w.redeem =async(string='')=>
{
  let ids = aa.fx.splitr(string).filter(aa.is.key);
  return ids

};


// save walLNut
aa.w.save =async()=>
{
  await aa.mod.save(aa.w);
  aa.mod.mk(aa.w);
};


// instantiate walLNut
aa.w.start =async mod=>
{
  // aa.w.mod_butts(mod.used);
  if (!mod.used) return;
  // if (mod.o.events) delete mod.o.events;
  let id = 'w_start';
  let filter = {...aa.q.ls.w};
  let old_since = mod.o.since;
  if (old_since) filter.since = mod.o.since + 1;
  [filter] = aa.q.filter(JSON.stringify(filter));
  
  if (!mod.o.events?.size) mod.o.events = new Map();
  else if (old_since) filter.since = mod.o.since + 1;

  let {events} = await aa.r.get({id,filter});
  
  let new_since = old_since || 1;
  for (const [id,dat] of events)
  {
    if (!mod.o.events[id])
    {
      mod.o.events[id] = dat;
      if (dat.event.created_at > new_since) 
        new_since = dat.event.created_at;
    }
    aa.r.dat(dat)
  }
  if (new_since !== old_since) 
  {
    mod.o.since = new_since;
    mod.save()
  }
  // mod.o.test = new Map();
  // mod.o.test.set('yo','sup');
  // mod.save()
  // console.log(ls);
  // aa.log(aa.mk.ls({ls}))
  // for (const dat of req.events.values()) aa.e.to_printer(dat)
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
  let [amount,s] = aa.fx.splitr(string,aa.fx.regex.fw);
  amount = parseInt(amount);
  let pubkey,memo;
  if (s) [pubkey,memo] = aa.fx.splitr(s,aa.fx.regex.fw);
  let [wallet,w] = await aa.w.get_active();
  let opts = {};

  if (pubkey && aa.is.key(pubkey)) opts.pubkey = '02'+pubkey;
  if (!memo) memo = localStorage.zap_memo;
  
  const {keep,send} = await wallet.send(amount,w.proofs,opts);
  
  const mint = w.url;
  aa.w.tx_out(keep,mint);
  
  return cashuts.getEncodedTokenV4(
  {
    memo,
    mint,
    proofs:send,
    unit:'sat',
  })
};


// start mod
// aa.w.start =mod=>
// {
//   aa.mod.mk(mod);
//   aa.w.mod_butts();
// };


aa.w.tx_in =async({proofs,url,o})=>
{
  const mod = aa.w;
  const id = mod.def.id;
  if (!proofs || !proofs.length) 
  {
    aa.log(id+' tx_in no proofs');
    return
  }
  if (!mod.o.ls.mints[url]) 
  {
    aa.log(id+' walLNut not found');
    return
  }

  let redeemed = o?.redeemed?.length ? o.redeemed : [];

  const amount = aa.w.proofs_in(proofs,url);
  aa.log(`${id} +${amount} in ${url} = ${aa.w.o.ls.balance}`);
  aa.w.save();
  aa.mk.k7375({url,amount,redeemed})
};


aa.w.tx_out =(proofs,url)=>
{
  if (!proofs || !proofs.length) 
  {
    aa.log(aa.w.def.id+' tx_out no proofs');
    return
  }

  const w = aa.w.o.ls.mints[url];
  if (!w) 
  {
    aa.log(aa.w.def.id+' walLNut not found');
    return
  }
  if (!url) url = aa.w.get_def();

  let amount = aa.w.proofs_out(proofs,url);
  aa.log(`${aa.w.def.id} -${amount} = ${w.balance} in ${url}`);
  aa.w.save();

  aa.mk.k7375({url,amount})
  // .then(o=>{aa.mk.k7376({direction:'out',...o})});
};



// zap pubkey
aa.w.zap_pub =async(amount,pubkey)=>
{
  let p = await aa.p.get(pubkey);
  let id = aa.p.events_last(p,'k0');
  let dat = await aa.e.get(id);
  if (!dat) 
  {
    aa.log('unable to zap, no metadata found for pubkey: '+pubkey);
    return
  }
  let endpoint = await NostrTools.nip57.getZapEndpoint(dat.event);
  return `${endpoint}?amount=${amount}`;
};


// w css styles
aa.mk.styles(['/w/w.css']);