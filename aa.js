const aa = 
{
  miss:{e:{},p:{}},
  l:document.documentElement,
  // v:{},
  e:{},
  p:{},
  q:{},
  state:{},
  ct:{},
  mk:{},
  clk:{},
};

aa.login =async()=>  
{
  return new Promise(resolve=>
  {
    if (window.nostr && aka)
    {
      window.nostr.getPublicKey().then(x=>
      {
        aka.set(x);
        if (rel) rel.ext().then(()=>{resolve('login done')});
      });
      cli.fuck_off()
    }
    else 
    {
      v_u.log('enable extension first and try again');
      resolve('login done');
    }
  });
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

aa.stuff =async()=>
{
  let loggedin = await aa.login();
  if (loggedin)
  {
    o_p.set('trust 4');
    q_e.stuff();
    q_e.run('a');
    // setTimeout(()=>{q_e.run('a')},200);
    setTimeout(()=>{q_e.run('b')},2000);
  }
  // if 
  // aa.login().then(()=>
  // {
    
  //   // location.reload()
  // });
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
  },
  'stuff':
  {
    description:'does a bunch of stuff to get you started',
    exe:aa.stuff
  },
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

aa.base_ui =a=>{ for (const s of a) aa.mk[s]() };

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
  l.append(it.mk.l('ul',{id:'logs',cla:'list'}));
  
  const p = it.mk.section('p');
  p.append(it.mk.l('div',{id:'authors'}))

  const e = it.mk.section('e');
  e.append(it.mk.l('div',{id:'notes'}))
  
  main.append(l,p,e);
  document.body.insertBefore(main,document.body.lastChild);
};

// if (localStorage.cash === 'yes' && 'serviceWorker' in navigator)
// { aa.cash = navigator.serviceWorker.register('/cash.js') }

aa.clk.yolo =e=>
{
  let dat = aa.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    aa.sign(dat.event).then(signed=>
    {
      if (signed)
      {
        dat.event = signed;
        dat.clas = it.a_rm(dat.clas,['draft']);
        it.a_set(dat.clas,['not_sent']);
        aa.post(dat);
      }      
    })
  }
  else v_u.log('nothing to sign')
};

aa.clk.sign =e=>
{
  let dat = aa.e[e.target.closest('.note').dataset.id];
  if (dat)
  {
    aa.sign(dat.event).then(signed=>
    {
      if (signed)
      {
        dat.event = signed;
        dat.clas = it.a_rm(dat.clas,['draft']);
        it.a_set(dat.clas,['not_sent']);
        aa.db.upd(dat);
        aa.print(dat);
      }
    })
  }
  else v_u.log('nothing to sign')
};

aa.sign =async event=>
{
  return new Promise(resolve=>
  {
    if (window.nostr) 
    {
      window.nostr.signEvent(event)
      .then(signed=> resolve(signed));
    } 
    else 
    {
      v_u.log('you need a signer');
      resolve(false)
    }
  });
};

aa.clk.post =e=>
{
  let dat = aa.e[e.target.closest('.note').dataset.id];
  if (dat) aa.post(dat);
};

aa.post =dat=>
{
  // if (dat.clas?.includes('not_sent')) dat.clas = it.a_rm(dat.clas,['not_sent']);
  q_e.broadcast(dat.event);
};

aa.clk.edit =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  cli.v(aa.e[xid].event.content);
  delete aa.e[xid];
  note.remove();
};

aa.clk.cancel =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  delete aa.e[xid];
  note.remove();
  it.butt_count('e','.note');
};

aa.clk.react =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  console.log('react',xid);
  cli.v(localStorage.ns+' aka react '+xid+' '+localStorage.reaction);
};

aa.clk.hide =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
};

aa.clk.parse =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.e[xid].event;
  const content = note.querySelector('.content');
  if (content.classList.contains('parsed'))
  {
    content.replaceWith(it.parse.content_basic(event));
  }
  else 
  {
    content.replaceWith(it.parse.content(event,true));
  }
  // console.log(parsed);
};

aa.clk.editor =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.e[xid].event;
  it.confirm(
  {
    description:'event editor',
    l:it.note_editor(event),
    no:()=>{},
    yes:()=>{},
  });
  // console.log(parsed);
};

aa.f_it =async event=>
{
  const signed = await aa.sign(event);
  if (signed)
  {
    aa.e[event.id] = dat = {event:signed,seen:[],subs:[],clas:[]};
    aa.db.upd(dat);
    aa.print(dat);
    q_e.broadcast(signed);
  }
};

aa.clk.fetch =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const request = ['REQ','ids',{ids:[xid]}];
  let relays = [];
  let r = note.dataset.r?.split(' ');
  if (r.length) relays.push(...r);
  else relays.push(...rel.in_set(rel.o.r));
  q_e.demand(request,relays,{eose:'done'});
};

aa.replace_note =(l,dat)=>
{
  l.id = 'temp-'+dat.event.id;
  let b = kin.da(dat);
  let childs = l.querySelector('.replies').childNodes;
  if (childs.length)
  {
    let b_rep = b.querySelector('.replies');
    for (const c of childs) if (c.tagName !== 'SUMMARY') v_u.append_to_rep(c,b_rep);
  }
  let is_root = b.classList.contains('root');
  let is_reply = b.classList.contains('reply');
  b.className = l.className;
  l.remove();
  b.classList.remove('blank','draft','not_sent');
  if (dat.clas) b.classList.add(...dat.clas);
  if (!is_root && b.parentElement.closest('.note')) b.classList.remove('root','not_yet');
  else if (is_root) b.classList.add('root');
  if (!is_reply && !b.parentElement.closest('.note')) b.classList.remove('reply');
  else if (is_reply) b.classList.add('reply');
  b.classList.add('replaced');
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
  },50,q_id);
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
        it.a_dataset(l,'nope',[url]);
      });
      q_e.demand(['REQ','ids',{ids:ids}],[url],{eose:'done'});
    }
    if (rest && Object.keys(rest).length) aa.moar()
  }
  it.to(f,1000,'moar');
};