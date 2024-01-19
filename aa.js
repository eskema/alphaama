const aa = 
{
  miss:{e:{},p:{}},
  l:document.documentElement,
  v:{},
  e:{},
  p:{},
  q:{},
  state:{},
  ct:{},
  mk:{},
};



aa.login =()=>  
{
  if (window.nostr && aka)
  {
    window.nostr.getPublicKey().then(x=>
    {
      aka.set(x);
      if (rel) rel.ext();
    });
    cli.fuck_off()
  }
  else v_u.log('enable extension first and try again')
};

aa.reset =()=>
{
  aa.db.clear(['stuff','authors','events']).then(()=>
  {
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(()=>{location.reload()},500)
  });
};

aa.ct.u = 
{
  'login': 
  {
    description:'load aka and relays from ext',
    exe:aa.login
  },
  'reset':
  {
    description:'resets everything',
    exe:aa.reset
  }
};

aa.load_mod =async mod=>
{
  const saved_mod = await aa.db.get({get:{store:'stuff',key:mod.def.id}});
  if (saved_mod) mod.o = saved_mod;
  else if (mod.def) mod.o = mod.def;
  if (!mod.o.ls) mod.o.ls = {};
  it.mk.mod(mod);
  return mod
};

aa.base_ui =a=>
{
  for (const s of a) aa.mk[s]();
};

aa.save =mod=>
{
  if (mod && mod.o && mod.o.id)
  {
    aa.db.put({put:{store:'stuff',a:[mod.o]}});
    let o = {ls:mod.o.ls};
    if (mod.hasOwnProperty('mk')) o.mk = mod.mk;
    if (mod.l) o.l = mod.l;
    mod.l = it.mk.ls(o);
  }
};

aa.mk.u =()=>
{
  const u = it.mk.l('aside',{id:'u'});
  document.body.insertBefore(u,document.body.lastChild);
  u.append(it.mk.butt(u))
}

aa.mk.header =()=>
{
  if (it.s.rigged()) aa.l.classList.add('rigged');
 
  const header = it.mk.l('header',{id:'header'});
  const caralho =  it.mk.l('a',{id:'caralho',ref:'#',con:'A<3',tit:'vai pró caralho',clk:it.clk.a});
  const state = it.mk.l('h1',{id:'state',con:'dickbutt'});
  const description = it.mk.l('p',{id:'description',cla:'paragraph'});
  const alphaama = it.mk.link('https://github.com/eskema/alphaama','alphaama','alphaama repo');
  const nostr = it.mk.link('https://github.com/nostr-protocol/nostr','nostr','notes and other stuff transmitted by relays');
  description.append(alphaama,' is just a ',nostr,' fucking client');
  header.append(caralho,state,description);
  document.body.prepend(header);

  state.dataset.pathname = location.pathname;
  aa.state.l = state;
};

aa.mk.view =()=>
{
  const main = it.mk.l('main',{id:'view'});
  
  const l = it.mk.section('l',1);
  l.append(it.mk.l('ul',{id:'logs'}));
  
  const p = it.mk.section('p');
  p.append(it.mk.l('div',{id:'authors'}))

  const e = it.mk.section('e');
  e.append(it.mk.l('div',{id:'notes'}))
  
  main.append(l,p,e);
  document.body.insertBefore(main,document.body.lastChild);
};

// if (localStorage.cash === 'yes' && 'serviceWorker' in navigator)
// { aa.cash = navigator.serviceWorker.register('/cash.js') }

aa.yolo =e=>
{
  console.log(e.target)
};

aa.post =e=>
{
  let dat = aa.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    console.log(e.target);
    if (dat.clas?.includes('not_sent')) it.a_rm(dat.clas,['not_sent']);
  }
};

aa.sign =e=>
{
  let dat = aa.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    if (window.nostr) 
    {
      window.nostr.signEvent(dat.event)
      .then(signed=> 
      {
        dat = {event:signed,clas:['not_sent']};
        aa.e[signed.id] = dat;
        aa.db.upd(dat);
        aa.print(dat);
        // console.log(signed);
      })
    } else v_u.log('you need a signer')
  }
  else v_u.log('nothing to sign')
};

aa.edit =e=>
{console.log(e.target)};

aa.cancel =e=>
{console.log(e.target)};

aa.draft =draft=>
{
  if (!aa.drafts) aa.drafts = [];
  delete cli.prep;

  draft.id = it.fx.hash(draft);
  aa.e[draft.id] = {event:draft,clas:['draft']};
  aa.print(aa.e[draft.id]);
};

aa.replace_note =(l,dat)=>
{
  if (aa.miss.e[dat.event.id]) delete aa.miss.e[dat.event.id];
  l.id = 'temp-'+dat.event.id;
  let b = kin.da(dat);
  let childs = l.querySelector('.replies').childNodes;
  if (childs.length)
  {
    let b_rep = b.querySelector('.replies');
    for (const c of childs) v_u.append(c,b_rep);
  }
  let is_root = b.classList.contains('root');
  let is_reply = b.classList.contains('reply');
  b.className = l.className;
  l.remove();
  b.classList.remove('blank','draft');
  if (dat.clas) b.classList.add(...dat.clas);
  if (!is_root && b.parentElement.closest('.note')) b.classList.remove('root');
  else if (is_root) b.classList.add('root');
  if (!is_reply && !b.parentElement.closest('.note')) b.classList.remove('reply');
  else if (is_reply) b.classList.add('reply');
};

aa.to_print =dat=>
{
  const q_id = 'print';
  if (!aa.q.hasOwnProperty(q_id)) aa.q[q_id] = [];
  aa.q[q_id].push(dat);
  
  it.to(()=>
  {
    // console.log('it.to print',aa.q.print);
    for (const dis of aa.q[q_id]) aa.print(dis);
    aa.q[q_id] = [];
  },50,'print');
};

aa.mia_relays =a=>
{
  let relays = {};
  for (const l of a)
  {
    let nope = l.dataset.nope ? l.dataset.nope.trim().split(' ') : [];
    
    const f =set=>
    {
      set.split(' ').map((url)=>
      {
        if (!nope.includes(url))
        {
          if (!relays[url]) relays[url] = [];
          it.a_set(relays[url],[l.dataset.id]);
        }
      });
    };
    
    if (l.dataset.seen) f(l.dataset.seen);
    if (l.dataset.r) f(l.dataset.r);
  }

  return relays;
};

aa.get_mia =()=>
{
  let mia = document.querySelectorAll('.blank');
  if (mia)
  {
    let relays = aa.mia_relays(mia);
    if (relays && Object.keys(relays).length)
    {
      let [url,tranche] = Object.entries(relays).sort((a,b)=>a.length - b.length)[0];
      delete relays[url];
      return [url,tranche,relays]
    }
    else return [0,0]
  }
};

aa.moar =()=>
{
  const f =()=>
  {
    let [url,ids,rest] = aa.get_mia();
    // console.log('moar',url,ids,rest);
    if (ids.length)
    {
      ids.map((id)=>
      {
        let l = document.getElementById(it.fx.nid(id));
        it.a_dataset('nope',l,[url]);
      });
      q_e.demand(['REQ','ids',{ids:ids}],[url],{eose:'done'});
    }
    if (rest && Object.keys(rest).length) aa.moar()
  }
  it.to(f,500,'moar');
};