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
  let b = [];
  if (a.length)
  {
    for (let url of a)
    {
      url = aa.is.url(url.trim())?.href;
      let w = aa.w.get_mint(url);
      if (!w && url)
      {
        w = aa.w.o.ls.mints[url] = {proofs:[],quotes:[]};
        if (aa.w.o.ls.def === '') aa.w.o.ls.def = url;
        b.push(w);
      }
    }
  }
  aa.w.save();
  return b
};



aa.w.balance =()=>
{
  let balance = aa.fx.sum_amounts(Object.values(aa.w.o.ls.mints));
  aa.w.o.ls.balance = balance;
  aa.mod.mk(aa.w);
  return balance
}

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
  let id = aa.w.o.ls.def || Object.keys(aa.w.active)[0];
  if (!id) id = Object.keys(aa.w.o.ls.mints)[0];
  return id
};


// get mint object
aa.w.get_mint =s=> aa.w.o.ls.mints[s];


// import wallnut from kind 17375 / 37375
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

  let w = aa.w.o.ls;
  let a = await aa.fx.decrypt_parse(dat.event);
  a.push(...dat.event.tags);

  let mints = aa.fx.tags_values(a,'mint');
  let privkey = aa.fx.tag_value(a,'privkey');
  
  if (mints.length) aa.w.add(mints.join(' '));
  if (privkey.length) aa.w.key(privkey);
  aa.q.run('w');
  
};


aa.w.import_7375 =async(id='')=>
{
  if (!id) return;
  let dat = await aa.db.get_e(id);
  if (!dat) return;
  let {mint,proofs} = await aa.fx.decrypt_parse(dat.event);
  mint = aa.is.url(mint)?.href;
  if (!mint) return;
  let w = aa.w.o.ls.mints[mint];
  if (!w)
  {
    w = aa.w.add(mint)[0];
    if (!w) return;
  }
  if (proofs?.length) aa.w.proofs_in(proofs,mint);
  aa.w.save();
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
aa.w.key =(privkey='',confirm=true)=>
{
  let w = aa.w.o.ls;
  if (!w)
  {
    aa.log('w key: wallet not found');
    return
  }
  if (confirm && w.privkey?.length && !window.confirm('replace walLNut keys?')) return;

  let keys = aa.fx.keypair(privkey);
  if (keys)
  {
    w.privkey = keys[2];
    w.pubkey = keys[1];
    aa.w.save();
    // aa.mk.k10019();
    // aa.mk.k17375();
  }
  return keys
};


// on load
aa.w.load =async()=>
{
  await aa.mk.scripts([
    '/w/clk.js',
    '/w/fx.js',
    '/w/kinds.js',
    '/w/mk.js',
  ]);

  let mod = aa.w;
  let id = mod.def.id;

  // extend queries
  if (aa.q?.ls)
  {
    aa.q.ls.w = {"authors":["u"],"kinds":[7374,7375,7376,10019,17375,37375]};

    if (aa.q.ls.a) aa.fx.a_add(aa.q.ls.a.kinds,[10019,17375]);
    if (aa.q.ls.b) aa.fx.a_add(aa.q.ls.b.kinds,[10019]);
    if (aa.q.ls.c) aa.fx.a_add(aa.q.ls.c.kinds,[10019]);
    if (aa.q.ls.f) aa.fx.a_add(aa.q.ls.f.kinds,[10019]);
    if (aa.q.ls.n) aa.fx.a_add(aa.q.ls.n.kinds,[9321,9735]);
  }
  // extend renders
  aa.fx.a_add(aa.e.renders.encrypted,[7374,7375,7376,17375,37375]);
  // extend actions
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
      description:'set private key to walLNut',
      exe:mod.key
    },
    {
      action:[id,'relays'],
      required:['url'],
      description:'set relay sets to walLNut',
      exe:mod.relays
    },
    {
      action:[id,'import'],
      required:['nid'],
      description:'create walLNut from kind:17375/37375',
      exe:mod.import
    },
    {
      action:[id,'proofs'],
      required:['nid'],
      description:'import proofs from kind:7375',
      exe:mod.import_7375
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
  // extend butt actions
  aa.e.butts_for?.na?.push('nzap');
  // load
  await aa.mod.load(mod);
  await mod.start(mod);
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
  let item = aa.mk.item(k,v);
  if (k === 'privkey' && !item.classList.contains('empty')) 
  {
    let val = item.querySelector('.val');
    if (val) val.textContent = '******';
  }
  // aa.w.upg(k,v);
  return item;
};


// save proofs from tx in
aa.w.proofs_in =(proofs,mint)=>
{
  let w = aa.w.get_mint(mint);
  if (!w) return;
  const amount = aa.fx.sum_amounts(proofs);
  w.proofs.push(...proofs);
  w.amount = aa.fx.sum_amounts(w.proofs);
  aa.w.balance();
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
  // w.balance = new_balance;
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
  aa.w.tx_in({mint:proofs});
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



// define relays to walLNut
aa.w.relays =(s='')=>
{
  let a = s.split(' ').map(i=>aa.is.url(i.trim())?.href);
  aa.fx.a_add(aa.w.o.ls.relays,a);
  //aa.mk.k10019()
  aa.w.save();
};


// save walLNut
aa.w.save =()=>
{
  aa.mod.save(aa.w);
  aa.mod.mk(aa.w);
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
  aa.mod.mk(mod);
  if (aa.w.used)
  {
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'+');
    let upd_butt = aa.mk.butt_action(`mk 10019`,'k10019');
    fastdom.mutate(()=>
    {
      mod.l.insertBefore(add_butt,mod.l.lastChild);
      mod.l.insertBefore(upd_butt,mod.l.lastChild)
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


aa.w.tx_in =async({proofs,mint,o})=>
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
  aa.log(`${aa.w.def.id} -${amount} = ${w.balance} in ${mint}`);
  aa.w.save();

  aa.mk.k7375({mint})
  // .then(o=>{aa.mk.k7376({direction:'out',...o})});
};


aa.w.upg =(k,v)=>
{
  let upd;
  if (upd) setTimeout(()=>{aa.w.save()},200);
};