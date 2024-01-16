const v_u =
{
  upd:{},
};

v_u.pop =()=>
{
  if (!history.state
  || !history.state.hasOwnProperty('view')
  || history.state === '') 
  {
    v_u.state(location.hash.split('?')[0].substring(1));
  }
  else 
  {
    v_u.clear();
    const state = history.state.view;
    aa.state.l.textContent = state;
    if (state.length) 
    {
      document.title = 'A<3 '+state;
      v_u.view(state);  
    }
    else document.title = 'alphaama';
  }
};
window.addEventListener('popstate',v_u.pop);

v_u.view =s=>
{
  if (s.startsWith('npub')) v_u.p(s);
  else if (s.startsWith('note')) v_u.e(s);
  else if (s.startsWith('nevent')) v_u.nevent(s);
  else if (s.startsWith('nprofile')) v_u.nprofile(s);
  else if (s.startsWith('naddress')) v_u.naddress(s);
  else v_u.log('no view for '+s);
};

v_u.clear =()=>
{
  if (aa.l.classList.contains('viewing'))
  {
    const in_view = aa.l.querySelector('.in_view');
    if (in_view) in_view.classList.remove('in_view');
    const in_path = aa.l.querySelectorAll('.in_path');
    if (in_path) for (const l of in_path) l.classList.remove('in_path')
  }
  aa.state.l.textContent = '';
  aa.l.classList.remove('viewing','view_e','view_p');
};

v_u.state =s=>
{
  if (!history.state || history.state.view !== s)
  {
    const last = history.state&&history.state.view?history.state.view:'';
    const dis = {view:s,last:last}
    const hash_is_h = dis.view.length ? '#'+dis.view : '';
    const pat = location.origin+location.pathname+hash_is_h;
    history.pushState(dis,'',pat);
    v_u.pop()
  }
  else history.back();
};

v_u.replace =s=>
{
  const dis = history.state;
  dis.view = s;
  const hash_is_h = dis.view.length ? '#'+dis.view : '';
  const pat = location.origin+location.pathname+hash_is_h;
  history.replaceState(dis,'',pat);
  // v_u.pop();
};

v_u.scroll =(l,options={})=>
{
  setTimeout(()=>{l.scrollIntoView(options)},50)
}

v_u.log =s=>
{
  const log = it.mk.l('li',{cla:'l'});
  if (typeof s === 'string') s = it.mk.l('p',{con:s});
  log.append(s);
  
  const logs = document.getElementById('logs');
  logs.append(log);
  document.getElementById('butt_l').dataset.count = logs.childNodes.length;
};
  
v_u.p =async npub=>
{
  let p,xpub;
  let l = document.getElementById(npub);  
  if (!l)
  {
    xpub = it.fx.decode(npub);
    p = await aa.db.get_p(xpub);
    l = author.profile(p);
  }
  if (!p) p = await aa.db.get_p(xpub ?? it.fx.decode(npub));

  if (p && l.classList.contains('simp')) author.update(l,p);
  l.classList.add('in_view');
  aa.l.classList.add('viewing','view_p');
  v_u.scroll(l);
};

v_u.e =async nid=>
{
  let l = document.getElementById(nid);
  if (!l)
  {
    let x = it.fx.decode(nid);
    let dat = await aa.db.get_e(x);
    if (dat) aa.print(dat);
    else v_u.req_e(x);
    // l = document.getElementById(nid);
  }
  // if (l) kin.view(l)
};

v_u.req_e =x=>
{
  if (window.confirm('fetch dis note?'))
  {
    const request = ['REQ','ids',{ids:[x]}];
    const relays = rel.in_set(rel.o.r);
    const options = {eose:'close'};
    console.log(request,relays,options);
    q_e.demand(request,relays,options);
  }
};

v_u.nprofile =async nprofile=>
{

};

v_u.nevent =async nevent=>
{
  let data = it.fx.decode(nevent);
  if (data)
  {
    let nid = it.fx.nid(data.id);
    // v_u.replace(nid);
    let l = document.getElementById(nid);
    if (!l)
    {
      let x = it.fx.decode(nid);
      let dat = await aa.db.get_e(x);
      if (dat) 
      {
        aa.print(dat);
      }
      else 
      {
        console.log(data);
        
        dat = 
        {
          event:{id:data.id,created_at:it.tim.now() - 10},
          seen:[],subs:[]
        };
        if (data.author) dat.event.pubkey = data.author;
        if (data.kind) dat.event.kind = data.kind;
        if (data.relays)
        {
          for (let url of data.relays)
          {
            url = it.s.url(url);
            if (url) it.a_set(dat.seen,[url.href]);
          }
        }
        console.log(dat);
        let blank = kin.note(dat);
        blank.classList.add('blank','root');
        document.getElementById('notes').append(blank);
        kin.view(blank);
        // console.log({ids:[dat.event.id]},dat.seen);
        // q_e.demand(['REQ','ids',{ids:[dat.event.id]}],dat.seen,{eose:'done'});
      }
    }
  }
};

v_u.append =(l,mom,reverse=false)=>
{ 
  const ma = mom.parentElement;
  const classes = ['haz_reply','haz_new_reply'];
  if (ma.classList.contains('note')) ma.classList.add(...classes);

  const f =(i)=> reverse ? l.dataset.stamp > i.dataset.stamp 
  : l.dataset.stamp < i.dataset.stamp;

  const last = [...mom.children].filter(f)[0];
  mom.insertBefore(l, last ? reverse ? last : last.nextSibling : null);
  v_u.upd.path(mom,l.dataset.stamp);
};

v_u.append_as_reply =(dat,note,reply_tag)=>
{
  note.classList.add('reply');
  const reply_id = reply_tag[1];
  const reply_nid = it.fx.nid(reply_id);
  let reply = document.getElementById(reply_nid);
  if (!reply)
  {
    reply = kin.blank(reply_tag,dat,1);
    v_u.append(note,reply.querySelector('.replies'));

    let root_tag = rep.root(dat.event.tags);
    if (root_tag && root_tag[1] !== reply_id)
    {
      reply.classList.add('reply');
      let root_id = root_tag[1];
      let root_nid = it.fx.nid(root_id);
      let root = document.getElementById(root_nid);
      if (!root)
      { 
        root = kin.blank(root_tag,dat,10);
        root.classList.add('root');
        v_u.append(root,document.getElementById('notes'),1);
        kin.der(root_tag,dat.subs);
      }
      v_u.append(reply,root.querySelector('.replies'));
    }
    else
    {
      reply.classList.add('root');
      v_u.append(reply,document.getElementById('notes'),1);
    }
    kin.der(reply_tag,dat.subs);
  }
  else
  {
    if (reply.classList.contains('blank'))
    {
      it.fx.merge_datasets(['seen','subs'],note,reply);
      if (reply_tag[2])
      {
        let relay = it.s.url(reply_tag[2]);
        if (relay)
        {
          let a = reply.dataset.r ? reply.dataset.r.trim().split(' ') : [];
          it.a_set(a,[relay]);
          reply.dataset.r = a.join(' ');
        }
      }
    }
    v_u.append(note,reply.querySelector('.replies'));
  }
};

v_u.upd.path =(l,stamp)=> 
{
  let root,updated;
  for (;l && l !== document; l = l.parentNode ) 
  {
    if (l.classList.contains('note')) 
    {
      updated = false;
      root = l;
      if (l.dataset.stamp < stamp)
      {
        l.dataset.stamp = stamp;
        updated = true;
      }
      l.classList.add('haz_new');
      let time = l.querySelector('.by time');
      time.title = it.tim.ago(it.tim.std(time.dataset.timestamp))
      const replies = l.querySelector('.replies');
      const some = replies.childNodes.length;
      const all = l.querySelectorAll('.note').length;
      replies.dataset.count = some + (all > some ? '.' + all : '')
    }
	}
  if (root && updated) v_u.append(root,document.getElementById('notes'),1)
}

v_u.upd.butt_count =(id,cla)=>
{
  it.to(()=>
  {
    let butt = document.getElementById('butt_'+id);
    butt.dataset.count = document.querySelectorAll(cla).length;
  },100,id+'_count');
};

v_u.trusted_src =(l)=>
{
  let trust = l.dataset.trust;
  let trust_needed = parseInt(localStorage.trust);
  if (trust && trust_needed && trust >= trust_needed)
  {
    let srcs = l.querySelectorAll('[data-src]');
    if (srcs)
    {
      for (const src of srcs)
      {
        src.src = src.dataset.src;
        src.removeAttribute('data-src');
      }
    }
  }
};

aa.ct.db.view =
{
  required:['id'],
  description:'load event',
  exe: v_u.view
};