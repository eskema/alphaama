const v_u =
{
  upd:{},
  viewing:false
};

v_u.pop =()=>
{
  if (!history.state
  || !history.state.hasOwnProperty('view')
  || history.state === '') 
  {
    v_u.state(location.hash.split('?')[0].slice(1));
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
  // console.log(history.state)
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
  v_u.viewing = false;
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
  const path = location.origin+location.pathname+hash_is_h;
  history.replaceState(dis,'',path);
  v_u.view(dis.view)
  // v_u.pop();
};


// Create a new observer
const e_observer = new IntersectionObserver((a)=>
{
	// console.log(a);
  for (const b of a)
  {
    const l = b.target;
    if (b.isIntersecting)
    {
      l.classList.add('is_viewable');
      e_observer.unobserve(l);
    }
    // else 
    // {
    //   l.classList.remove('is_viewable');
    // }
  }
},{root:null,threshold:0.1});

// // The elements to observe
// let div1 = document.querySelector('#div-1');
// let div2 = document.querySelector('#div-2');

// // Attach them to the observer
// e_observer.observe(div1);
// e_observer.observe(div2);








v_u.scroll =(l,options={})=>
{
  setTimeout(()=>{l.scrollIntoView(options)},50)
}

v_u.log =s=>
{
  const log = it.mk.l('li',{cla:'l item'});
  if (typeof s === 'string') s = it.mk.l('p',{con:s});
  log.append(s);
  
  const logs = document.getElementById('logs');
  logs.append(log);
  document.getElementById('butt_l').dataset.count = logs.childNodes.length;
};
  
v_u.p =async npub=>
{
  let xpub = it.fx.decode(npub);
  let p = await aa.db.get_p(xpub);
  if (!p) 
  {
    p = author.p(xpub);
    // v_u.req_p([xpub]);
  }
  
  let l = document.getElementById(npub);  
  if (!l)
  {
    l = author.profile(p);
  }

  if (l.classList.contains('simp')) author.update(l,p);
  l.classList.add('in_view');
  aa.l.classList.add('viewing','view_p');
  v_u.scroll(l);
  v_u.viewing = npub;
};

v_u.e =async nid=>
{
  let l = document.getElementById(nid);
  if (l) v_u.dis(l);
  else
  {
    let x = it.fx.decode(nid);
    let dat = await aa.db.get_e(x);
    if (dat) 
    {
      aa.print(dat);
      if (!aa.p[dat.event.pubkey])
      {
        
      }
    }
    // else v_u.req_e([x]);
  }
  v_u.viewing = nid;
};

v_u.dis =l=>
{
  l.classList.add('in_view');   
  // it.to(()=>{it.fx.in_path(l)},100,'in_path');
  it.fx.in_path(l);
  aa.l.classList.add('viewing','view_e');
  v_u.scroll(l);
};

v_u.req_e =a=>
{
  const request = ['REQ','e',{ids:a}];
  const relays = rel.in_set(rel.o.r);
  const options = {eose:'close'};
  console.log(request,relays,options);
  q_e.demand(request,relays,options);
};

v_u.req_p =a=>
{
  const request = ['REQ','p',{authors:a,kinds:[0,3,10002]}];
  const relays = rel.in_set(rel.o.r);
  const options = {eose:'close'};
  console.log(request,relays,options);
  q_e.demand(request,relays,options);
};

v_u.nprofile =async nprofile=>
{

};

v_u.nevent =async nevent=>
{
  let data = it.fx.decode(nevent);
  if (data && data.id)
  {
    let nid = it.fx.nid(data.id);
    let l = document.getElementById(nid);
    if (!l)
    {
      let dat = await aa.db.get_e(data.id);
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
          seen:[],subs:[],clas:[]
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
        v_u.append_to_notes(blank);
        q_e.demand(['REQ','ids',{ids:[dat.event.id]}],dat.seen,{eose:'done'});
      }
    }
    else 
    {
      v_u.replace(nid);
    }
    
  }
};

// v_u.append =(l,mom,reverse=false)=>
// { 
//   const ma = mom.parentElement;
//   const classes = ['haz_reply','haz_new_reply'];
//   if (ma.classList.contains('note')) ma.classList.add(...classes);

//   const f =(i)=> reverse ? l.dataset.stamp > i.dataset.stamp 
//   : l.dataset.stamp < i.dataset.stamp;

//   const last = [...mom.children].filter(f)[0];
//   mom.insertBefore(l, last ? reverse ? last : last.nextSibling : null);
//   v_u.upd.path(mom,l.dataset.stamp);
// };

v_u.append_to_notes =(note)=>
{ 
  let notes = document.getElementById('notes');
  const last = [...notes.children].filter(i=>note.dataset.stamp > i.dataset.stamp)[0];
  notes.insertBefore(note,last);
  e_observer.observe(note);
};

v_u.append_to_rep =(note,mom)=>
{
  const last = [...mom.children].filter(i=>i.dataset.created_at > note.dataset.created_at)[0];
  mom.insertBefore(note,last ? last : null);
  v_u.upd.path(mom,l.dataset.stamp);
};

v_u.append_to_replies =(dat,note,reply_tag)=>
{
  const reply_id = reply_tag[1];
  const reply_nid = it.fx.nid(reply_id);
  let reply = document.getElementById(reply_nid);
  if (!reply)
  {
    reply = kin.blank(reply_tag,dat,1);
    v_u.append_to_rep(note,reply.querySelector('.replies'));
    // v_u.append(note,reply.querySelector('.replies'));

    let root_tag = it.get_root_tag(dat.event.tags);
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
        v_u.append_to_notes(root);
        // v_u.append(root,document.getElementById('notes'),1);
        kin.der(root_tag,dat.subs);
      }
      v_u.append_to_rep(reply,root.querySelector('.replies'));
      // v_u.append(reply,root.querySelector('.replies'));
    }
    else
    {
      reply.classList.add('root');
      v_u.append_to_notes(reply);
      // v_u.append(reply,document.getElementById('notes'),1);
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
    v_u.append_to_rep(note,reply.querySelector('.replies'))
    // v_u.append(note,reply.querySelector('.replies'));
  }
};

// v_u.append_as_reply =(dat,note,reply_tag)=>
// {
//   const reply_id = reply_tag[1];
//   const reply_nid = it.fx.nid(reply_id);
//   let reply = document.getElementById(reply_nid);
//   if (!reply)
//   {
//     reply = kin.blank(reply_tag,dat,1);
//     v_u.append(note,reply.querySelector('.replies'));

//     let root_tag = it.get_root_tag(dat.event.tags);
//     if (root_tag && root_tag[1] !== reply_id)
//     {
//       reply.classList.add('reply');
//       let root_id = root_tag[1];
//       let root_nid = it.fx.nid(root_id);
//       let root = document.getElementById(root_nid);
//       if (!root)
//       { 
//         root = kin.blank(root_tag,dat,10);
//         root.classList.add('root');
//         v_u.append(root,document.getElementById('notes'),1);
//         kin.der(root_tag,dat.subs);
//       }
//       v_u.append(reply,root.querySelector('.replies'));
//     }
//     else
//     {
//       reply.classList.add('root');
//       v_u.append(reply,document.getElementById('notes'),1);
//     }
//     kin.der(reply_tag,dat.subs);
//   }
//   else
//   {
//     if (reply.classList.contains('blank'))
//     {
//       it.fx.merge_datasets(['seen','subs'],note,reply);
//       if (reply_tag[2])
//       {
//         let relay = it.s.url(reply_tag[2]);
//         if (relay)
//         {
//           let a = reply.dataset.r ? reply.dataset.r.trim().split(' ') : [];
//           it.a_set(a,[relay]);
//           reply.dataset.r = a.join(' ');
//         }
//       }
//     }
//     v_u.append(note,reply.querySelector('.replies'));
//   }
// };

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
  if (root && updated) v_u.append_to_notes(root)
}

v_u.mark_read =e=>
{
  e.stopPropagation();
  const dis = e.target;  
  if (dis.classList.contains('replies'))
  { 
    e.preventDefault();
    
    dis.parentNode.classList.remove('haz_new','haz_new_reply','is_new');
    
    const new_stuff = dis.querySelectorAll('.haz_new,.haz_new_reply,.is_new');        
    if (new_stuff.length)
    {
      for (const l of new_stuff) l.classList.remove('haz_new_reply','haz_new','is_new');
      if (dis.classList.contains('expanded')) dis.classList.remove('expanded')
    }
    else dis.classList.toggle('expanded');
    
    v_u.scroll(dis,{behavior:'smooth',block:'center'});
    
  } 
};

// v_u.upd.butt_count =(id,cla)=>
// {
//   it.to(()=>
//   {
//     let butt = document.getElementById('butt_'+id);
//     if (butt) butt.dataset.count = document.querySelectorAll(cla).length;
//   },100,'butt_'+id+'_count');
// };


// v_u.trusted_src =(l)=>
// {
//   let trust = l.dataset.trust;
//   let trust_needed = parseInt(localStorage.trust);
//   if (trust && trust_needed && trust >= trust_needed)
//   {
//     let srcs = l.querySelectorAll('[data-src]');
//     if (srcs)
//     {
//       for (const src of srcs)
//       {
//         src.src = src.dataset.src;
//         src.removeAttribute('data-src');
//       }
//     }
//   }
// };

