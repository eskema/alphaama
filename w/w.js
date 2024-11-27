/*

alphaama
mod    w
wallnuts
wallnut
wall_ut
wallut
...
nutsack

*/

aa.w = 
{
  def:{id:'w',ls:{}},
  requires:['r','m'],
  active:{},
};


// add nutsack
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
  aa.cli.clear();
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// 
aa.mk.nutsack =(k,v)=>
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


// make w mod item
aa.w.mk =(k,v)=>
{
  const id = aa.w.def.id;

  // nutsack mod item
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});

  // nutsack list
  const ul = aa.mk.nutsack(k,v);

  // nutsack details
  const details = aa.mk.details(k,ul,1);
  
  details.append(
    aa.mk.butt_action(`${id} del ${k}`,'del','del'),
    ' ',
    // aa.mk.butt_action(`${id} upd ${k}`,'upd','upd'),
    // ' ',
    // aa.mk.butt_action(`${id} upd ${k}`,'upd','upd')
  );
  l.append(details);
  return l
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
      description:'add nutsack',
      exe:mod.add
    },
    {
      action:[id,'del'],
      required:['wid'],
      description:'delete nutsack',
      exe:mod.del
    },
    {
      action:[id,'pubkey'],
      required:['wid','hex_pubkey'],
      description:'set pubkey to nutsack',
      exe:mod.pubkey
    },
    {
      action:[id,'unit'],
      required:['wid','unit'],
      description:'set unit to nutsack',
      exe:mod.unit
    },
    {
      action:[id,'relays'],
      required:['wid','relset'],
      optional:['relset'],
      description:'set relay sets to nutsack',
      exe:mod.relays
    },
    {
      action:[id,'mint'],
      required:['wid','mint_url'],
      description:'set mint to nutsack',
      exe:mod.mint
    },
    // {
    //   action:[id,'mints'],
    //   required:['wid','mintset'],
    //   optional:['mintset'],
    //   description:'set mint sets to nutsack',
    //   exe:mod.mints
    // },
    {
      action:[id,'k10019'],
      description:'create kind:10019 from nutsacks',
      exe:mod.k10019
    },
    {
      action:[id,'quote_mint'],
      required:['amount'],
      optional:['mint_url'],
      description:'mint quote',
      exe:mod.quote_mint
    },
    // {
    //   action:['cashu','meltq'],
    //   required:['n'],
    //   optional:['mint_url'],
    //   description:'mint quote',
    //   exe:mod.melt_quote
    // },
    {
      action:[id,'quote_check'],
      required:['quote'],
      description:'check quote',
      exe:mod.quote_check
    },

  );
  aa.mod_load(mod).then(mod.start);
};

aa.w.start =mod=>
{
  if (aa.mods_required(mod)) 
  {
    aa.mk.mod(mod);
    let add_butt = aa.mk.butt_action(`${mod.def.id} add `,'add nutsack');
    let upd_butt = aa.mk.butt_action(`${mod.def.id} k10019 `,'k10019');
    
    mod.l.insertBefore(upd_butt,document.getElementById(mod.def.id));
    mod.l.insertBefore(add_butt,upd_butt);
  }
  else setTimeout(()=>{aa.w.start(mod)}, 200);
};


// remove nutsack(s)
aa.w.del =s=>
{
  aa.cli.clear();
  
  const work =a=>
  {
    let k = a.shift();
    if (aa.w.o.ls.hasOwnProperty(k)) 
    {
      delete aa.w.o.ls[k];

      document.getElementById(aa.w.def.id+'_'+aa.fx.an(k)).remove();
      aa.log(aa.w.def.id+' nutsack deleted: '+k);
    }
    else aa.log(aa.w.def.id+' '+k+' not found')
  };
  aa.fx.loop(work,s);
  aa.mod_save(aa.w);
};


// define mint sets to nutsack
// aa.w.mints =s=>
// {
//   aa.cli.clear();
//   let a = s.trim().split(' ');
//   let wid = a.shift();
//   aa.w.o.ls[wid].mint = a[0];
//   aa.mod_ui(aa.w,wid);
//   aa.mod_save(aa.w);
// };


// define relay sets to nutsack
aa.w.relays =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].relays = a;
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// define unit of nutsack
aa.w.unit =s=>
{
  aa.cli.clear();
  let a = s.trim().split(' ');
  let wid = a.shift();
  aa.w.o.ls[wid].unit = a.shift();
  aa.mod_ui(aa.w,wid);
  aa.mod_save(aa.w);
};


// update kind-10019 
aa.w.k10019 =s=>
{
  aa.cli.clear();
  // let a = s.trim().split(' ');
  // let wid = a.shift();
  // let nutsack = aa.w.o.ls[wid];
  // if (!nutsack) return;
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
  
  for (const i of mints) 
  {
    // let mint = 
    event.tags.push(['mint',i[0],i[1]]);
  }
  // let relays = aa.fx.in_sets(aa.r.o.ls,nutsack.relays);
  if (!relays.length) relays = aa.fx.in_sets(aa.r.o.ls,['write']);
  for (const i of relays) event.tags.push(['relay',i]);
  for (const i of pubkeys) event.tags.push(['pubkey',i]);

  event = aa.u.event_normalise(event);
  console.log(event);
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
  // aa.log('w '+wid);
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
  }
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
      // let relays = aa.r.from_tags(dat.event.tags,['k10002']);
      // aa.p.relays_add(relays,p);
      // if (aa.is.u(dat.event.pubkey)) aa.r.add_from_o(relays);
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
  
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (aa.p.new_replaceable_param(p,dat.event))
    {
      aa.p.save(p);
    }
  });

  let tags = note.querySelector('.tags_wrapper');
  tags.setAttribute('open','');
  
  return note
};



// const mint = new cashu.CashuMint('https://mint.minibits.cash/Bitcoin');
// const wallet = new cashu.CashuWallet(mint);

aa.w.get_active =id=>
{
  let wallet;
  if (id)
  {
    if (id in aa.w.o.ls)
    {
      if (id in aa.w.active)
      {
        wallet = aa.w.active[id].w
      }
      else 
      {
        aa.w.active[id] = {};
        let url = aa.w.o.ls[id].mint;
        mint = aa.w.active[id].mint = new cashu.CashuMint(url);
        wallet = aa.w.active[id].w = new cashu.CashuWallet(mint);
      }
    }
  }
  else 
  {
    let current = Object.keys(aa.w.active)[0];
    if (current) wallet = aa.w.active[current].w;
    else 
    {
      current = Object.keys(aa.w.o.ls)[0];
      if (current) wallet = aa.w.get_active(current);
    }
  }
  return wallet
};

aa.w.quote_mint =async s=>
{
  const a = s.split(' ');
  let amount = parseInt(a.shift());
  
  let wallet_id = a.shift();
  let wallet = aa.w.get_active(wallet_id);
  aa.log('quote for '+amount+'from mint '+wallet?.mint?.mintUrl);
  if (!wallet)
  {
    aa.log('no wallet found');
    return ''
  }
  const mint_quote = await wallet.createMintQuote(amount);
  if (mint_quote) 
  {
    aa.temp.quotes[mint_quote.quote] = mint_quote;
    // aa.log(aa.mk.ls({ls:mint_quote}));
    aa.log(aa.mk.mint_quote(mint_quote));
    if (mint_quote.state === 'UNPAID') 
    {
      aa.fx.qr(mint_quote.request);
      aa.log(aa.mk.butt_action('w quote_check '+mint_quote.quote))
    }
  }
  return mint_quote ? mint_quote.quote : '';
};

aa.mk.mint_quote =(o)=>
{
// quote:14LT5mi49L215sMooVeVv4ttP9Ig_pQ5w0WUGfWO,
// request:lnbc210n1pn5xmrppp5w3cz3pl4583hr309l0ec6hvt82sye46vk2vav6p8futvpntqjmssdqdf45ku6tzd968xcqzzsxqrpcgsp53sqvpajmft7ar90qtxd4g5zrdl05lg3906gkw8quvqta2zsqlcwq9qxpqysgqdrc0t26srgnzsmcfs4grxe7wtkpj56a4leylnq467thgghee7v2styrvkxge0e7v4n3e66d87gngfclqmtjt7fs93zh5xd739fjwa3sq6dyctu,
// paid:false,
// state:UNPAID,
// expiry:1732473705,

  let ul = aa.mk.l('ul',{cla:'list mint_quote'});
  for (const k in o)
  {
    let v = o[k];
    let li;
    let val = v;
    switch (k)
    {
      // case 'request': 
      //   if (o.state !== 'PAID')
      //   {
      //     li = aa.mk.l('li',{cla:'item item_'+k});
      //     let key = aa.mk.l('span',{cla:'key',con:k});
      //     let val = aa.mk.l('span',{cla:'val',con:v});
      //     li.append(key,' ',val);
      //     li.append(aa.mk.l('br'),aa.fx.qr(v));
      //     break;
      //   }
      case 'expiry': 
        val = v+' // '+aa.t.display_ext(v);
      default: li = aa.mk.item(k,val);
    }
    if (li) ul.append(li);
    
  }
  return ul
};

aa.w.quote_check =async s=>
{
  let a = s.trim().split(' ');
  let quote = a.shift();
  let wallet_id = a.length ? a.shift() : false;
  let wallet = aa.w.get_active(wallet_id);
  const quote_check = await wallet.checkMintQuote(quote);
  aa.log('w quote_check '+quote+': '+quote_check.state);
  return quote_check.state
};

aa.w.melt =async s=>
{
  console.log(s)
};

aa.w.mint =async s=>
{
  let a = s.trim().split(' ');
  let quote = a.shift();
  let wallet_id = a.length ? a.shift() : false;
  let wallet = aa.w.get_active(wallet_id);
  let proofs;
  const quote_check = await wallet.checkMintQuote(quote);
  if (quote_check.state === 'PAID')
  {
    proofs = await wallet.mintTokens(64,quote)
  }

  if (mintQuoteChecked.state == MintQuoteState.PAID) {
    const { proofs } = await wallet.mintTokens(64, mintQuote.quote);
  }
};


window.addEventListener('load',aa.w.load);