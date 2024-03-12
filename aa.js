const aa = 
{
  miss:{e:{},p:{}},
  l:document.documentElement,
  // v:{},
  e:{},
  p:{},
  q:{},
  state:{},
  actions:[],
  mk:{},
  clk:{},
};

aa.reset =()=>
{
  v_u.log('bbbb');
  aa.db.clear(['stuff','authors','events']).then(()=>
  {
    v_u.log('boom biddy bye bye');
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(()=>{location.reload()},1000)
  });
};

aa.login =async s=>  
{
  return new Promise(resolve=>
  {
    if (window.nostr && aka)
    {
      window.nostr.getPublicKey().then(x=>
      {
        aka.set(x);
        if (rel) rel.ext().then(()=>
        {
          s.trim();
          if (s === 'easy') aa.easy();
          else if (s === 'hard') aa.hard();
          else aa.normal();
          resolve('login done')
        });
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

aa.easy =async()=>
{
  let butt_u = document.getElementById('butt_u');
  if (!butt_u.parentElement.classList.contains('.expanded')) butt_u.click();
  o_p.set('mode easy');
  q_e.stuff();
  // q_e.run('a')
  // .then(()=>{setTimeout(()=>{q_e.run('b')},2000)})
  // .then(()=>{setTimeout(()=>{o_p.set('trust 4')},9000)})
};

aa.normal =async()=>
{
  o_p.set('mode normal')
};

aa.hard =async()=>
{
  o_p.set('mode hard')
};

aa.load_mod =async mod=>
{
  const saved_mod = await aa.db.get({get:{store:'stuff',key:mod.def.id}});
  if (saved_mod) mod.o = saved_mod;
  else if (mod.def) mod.o = mod.def;
  if (!mod.o.ls) mod.o.ls = {};
  return mod
};

aa.base_ui =a=>{ for (const s of a) aa.mk[s]() };

aa.save = async mod=>
{
  return new Promise(resolve=>
  {
    if (mod && mod.o && mod.o.id)
    {
      aa.db.put({put:{store:'stuff',a:[mod.o]}});
    }
    resolve(mod)
  })  
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
  if (v_u.viewing === note.id) v_u.clear()
  note.remove();
  it.butt_count('e','.note');
  
  cli.v(aa.e[xid].event.content);
  delete aa.e[xid];
};

aa.clk.cancel =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  delete aa.e[xid];
  if (v_u.viewing === note.id) v_u.clear()
  note.remove();
  it.butt_count('e','.note');
};

aa.clk.react =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  // console.log('react',xid);
  cli.v(localStorage.ns+' e react '+xid+' '+localStorage.reaction);
};

aa.clk.decrypt =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  // console.log('react',xid);
  cli.v(localStorage.ns+' e decrypt '+xid);
};

aa.clk.hide =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
};

aa.clk.req =e=>
{
  const note = e.target.closest('.note');
  cli.v(localStorage.ns+' '+q_e.sn+' raw read {"#e":["'+note.dataset.id+'"],"kinds":[1],"limit":100}');
};

aa.clk.zap =e=>
{
  v_u.log('soon™')
};

aa.clk.parse =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.e[xid].event;
  it.parse.context(note,event,true);
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
};

aa.clk.fetch =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const request = ['REQ','ids',{ids:[xid]}];
  let relays = [];
  if (note.dataset.r?.length)
  {
    let r = note.dataset.r?.split(' ');
    if (r.length) relays.push(...r);
  }
  else relays.push(...rel.in_set(rel.o.r));
  it.a_dataset(note,'nope',relays);
  q_e.demand(request,relays,{eose:'done'});
  setTimeout(()=>{v_u.scroll(document.getElementById(note.id))},200);
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

aa.replace_note =(l,dat)=>
{
  l.id = 'temp-'+dat.event.id;
  let b = kin.da(dat);
  let b_rep = b.querySelector('.replies');
  let childs = l.querySelector('.replies').childNodes;
  if (childs.length)
  {
    for (const c of childs) if (c.tagName !== 'SUMMARY') v_u.append_to_rep(c,b_rep);
  }
  let is_root = b.classList.contains('root');
  let is_reply = b.classList.contains('reply');
  b.className = l.className;
  l.remove();
  b.classList.remove('blank','draft','not_sent');
  if (dat.clas) b.classList.add(...dat.clas);
  if (!is_root && b.parentElement.closest('.note')) 
  {
    b.classList.remove('root','not_yet');
  }
  else if (is_root) b.classList.add('root');
  if (!is_reply && !b.parentElement.closest('.note')) b.classList.remove('reply');
  else if (is_reply) b.classList.add('reply');
  b.classList.add('replaced');
  if (b.classList.contains('not_yet')) 
  {
    b_rep.removeAttribute('open');
    e_observer.observe(b);
  }
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

aa.missing =async s=>
{
  it.to(()=>
  {
    let miss = {};
    const nope =(xid,a,b)=>
    {
      for (const url of a) 
      {
        if (!b.includes(url))
        {
          if (!miss[url]) miss[url] = [];
          it.a_set(miss[url],[xid]);
        }
      }
    };
    let def_relays = rel.in_set(rel.o.r);
    for (const xid in aa.miss[s])
    {
      let v = aa.miss[s][xid];
      nope(xid,def_relays,v.nope);
      nope(xid,v.relays,v.nope);
    }

    if (Object.keys(miss).length)
    {
      let [url,ids] = Object.entries(miss).sort((a,b)=>a.length - b.length)[0];
      for (const id of ids) it.a_set(aa.miss[s][id].nope,[url]);
      let filter;
      if (s === 'p') 
      {
        filter = {authors:ids,kinds:[0]};
      }
      else if (s === 'e')
      {
        for (const id of ids)
        {
          let notes = document.querySelectorAll('[data-id="'+id+'"]');
          for (const note of notes) note.dataset.nope = aa.miss.e[id].nope;
        }
        filter = {ids:ids};
      }
      q_e.demand(['REQ',s,filter],[url],{});
    }
  },1000,'miss_'+s);
};

aa.print =async dat=>
{
  const xid = dat.event.id;
  if (!aa.e[xid]) aa.e[xid] = dat;

  let nid = it.fx.nid(xid);
  let l = document.getElementById(nid);
  if (!l)
  {
    l = kin.da(dat);
    it.butt_count('e','.note');
    if (!l) console.log(dat);
    if (l?.classList.contains('draft')) v_u.scroll(l,{behavior:'smooth',block:'center'});
  }
  else
  {
    if (l.classList.contains('blank') 
    || l.classList.contains('draft')) aa.replace_note(l,dat);
  }

  it.get_quotes(xid);

  
  
  aa.missing('e');
  aa.missing('p');
  // aa.dex();
  if (l && history.state.view === nid) setTimeout(()=>{v_u.dis(l)},500);
};

aa.actions.push(
  {
    action:['u','login'],
    optional:['easy || hard'],
    description:'load aka and relays from ext with optional mode, leave blank for default',
    exe:aa.login
  },
  {
    action:['u','reset'],
    description:'resets everything',
    exe:aa.reset
  }
);