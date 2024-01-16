const kin ={};

kin.note =dat=>
{
  const note = it.mk.l('article',{cla:'note'}); 
  const by = it.mk.l('header',{cla:'by'});
  
  note.append(by);
  if (dat.seen) note.dataset.seen = dat.seen.join(' ');
  if (dat.subs) note.dataset.subs = dat.subs.join(' ');
  if (dat.clas) note.classList.add(...dat.clas);
  let o = dat.event;
  if (o.id)
  {
    const nid = it.fx.nid(o.id)
    note.id = nid;
    note.dataset.id = o.id;
    const h1 = it.mk.l('h1',{cla:'id'});
    const h1_nid = it.mk.l('a',
    {
      cla:'a nid',
      ref:'#'+nid,
      con:it.fx.trunk(o.id),
      clk:it.clk.a
    });
    const h1_xid = it.mk.l('span',{cla:'xid',con:o.id});
    h1.append(h1_nid,h1_xid);
    by.prepend(h1);
  }
  if (o.pubkey)
  {
    note.dataset.pubkey = o.pubkey;
    it.fx.color(o.pubkey,note);
    it.mk.author(o.pubkey).then(pubkey=> by.append(pubkey));
  }
  if (o.kind || o.kind === 0) 
  {
    note.dataset.kind = o.kind;
  }
  if (o.created_at)
  {
    note.dataset.created_at = o.created_at;
    note.dataset.stamp = o.created_at;
    by.append(it.mk.time(o.created_at));
  }

  if (o.tags && o.tags.length)
  {
    let tags = kin.tags(o.tags);
    let tags_details = it.mk.details('#['+o.tags.length+']',tags);
    tags_details.classList.add('details');
    note.append(tags_details);      
  }
  if (o.content) 
  {
    note.append(it.mk.l('section',{cla:'content',app:it.mk.l('p',{cla:'paragraph',con:o.content})})); 
  }
  if (o.sig) note.append(it.mk.l('p',{cla:'sig',con:o.sig}));

  let replies = it.mk.l('ul',{cla:'replies expanded',clk:e=>
  {
    e.stopPropagation();
    const dis = e.target;  
    if (dis.classList.contains('replies'))
    { 
      e.preventDefault();
      dis.classList.toggle('expanded');
      if (dis.classList.contains('expanded')
      || dis.parentNode.classList.contains('haz_new'))
      {
        dis.parentNode.classList.remove('haz_new','is_new');
        replies = dis.querySelectorAll('.note');
        if (replies)
        {
          for (const l of replies) l.classList.remove('haz_new_reply','haz_new','is_new');
        }
        v_u.scroll(dis,{behavior:'smooth',block:'center'});
      }
    } 
  }});
  
  note.append(replies,kin.note_actions(dat.clas));  
  return note
};

kin.notice =message=>
{
  // message.data ["NOTICE", <sub_id>, <message>]
  console.log(message)
};

kin.auth =message=> 
{
  // message.data ["AUTH", ?]
  console.log(message)
};

kin.ok =message=>
{
  // message.data ["OK", <event_id>, <true|false>, <message>]
  console.log(message)
};

kin.eose =message=>
{
  // message.data ["EOSE", <sub_id>]
  let sub = rel.active[message.origin].q[message.data[1]];
  if (sub.eose === 'close')
  {
    // console.log(sub.eose,message.data[1],rel.active[message.origin].q[message.data[1]]);
    rel.active[message.origin].ws.send(JSON.stringify(['CLOSE',message.data[1]]));
    delete rel.active[message.origin].q[message.data[1]];
  }
};

kin.o =dat=>
{
  let sub = rel.active[dat.seen[0]].q[dat.subs[0]];
  if (!sub.stamp || sub.stamp < dat.event.created_at) sub.stamp = dat.event.created_at;
  aa.print(dat);
  aa.db.upd(dat);
};

kin.event =message=>
{ // message = {data,origin}
  // console.log(message);
  const sub_id = message.data[1];
  const event = message.data[2];
  const o = {event:event,seen:[message.origin],subs:[sub_id]};
  
  if (NostrTools.verifyEvent(event)) kin.o(o); 
  else console.log('invalid event',message);
};

kin.da =dat=>
{
  let note;
  if (kin.hasOwnProperty('d'+dat.event.kind)) note = kin['d'+dat.event.kind](dat);
  else note = kin.def(dat);
  kin.dex(dat);
  return note
};

kin.def =dat=>
{
  let note = kin.note(dat);
  v_u.append(note,document.getElementById('notes'),1);
  return note
};

kin.der =(tag,subs)=>
{
  const xid= tag[1];
  aa.db.get_e(xid).then(dat=>
  {
    if (dat) aa.print(dat);
    else 
    {
      const relay = tag[2];
      if (!aa.miss.e[xid]) aa.miss.e[xid] = {nope:[],relays:[relay],subs:[]};
      if (relay && !aa.miss.e[xid].relays.includes(relay)) aa.miss.e[xid].relays.push(relay);
      if (subs && subs.length)
      {
        let times = subs.length;
        for (let i=0;i<times;i++)
        {
          const sub = subs[i];
          if (!aa.miss.e[xid].subs.includes(sub)) aa.miss.e[xid].subs.push(sub);
        }
      }
    }
  });
};

kin.dex =dat=>
{
  let header = dex.head;
  if (dat.subs) for (const sub of dat.subs) aa.index.e('subs',sub);
  if (dat.seen) for (const seen of dat.seen) aa.index.e('seen',seen);
  aa.index.e('authors',dat.event.pubkey);
  aa.index.e('kinds',dat.event.kind);
  aa.index.at(header,dat.event.created_at);
  aa.index.tags(header,dat.event.tags);
};

kin.blank =(tag,dat,seconds)=>
{
  const blank_event = 
  {
    id:tag[1],
    created_at:dat.event.created_at - seconds,
    tags:[tag],
  }
  const seen = rel.in_set('read');
  if (tag[2])
  {
    const url = it.s.url(tag[2]);
    if (url) it.a_set(seen,[url.href]);
    else v_u.log(tag);
  }
  const note = kin.note({event:blank_event,seen:seen,subs:dat.subs});
  note.classList.add('blank');
  return note
};

kin.d0_compare =(p,dat=false)=>
{
  console.log(p,dat);
};

kin.d0 =dat=>
{
  const er = 'invalid kind:0 metadata';
  let metadata;
  try { metadata = JSON.parse(dat.event.content) } 
  catch (err) { v_u.log(er) } 
  
  if (metadata)
  {
    aa.db.get_p(dat.event.pubkey).then(p=>
    {
      const cat = dat.event.created_at;
      let k0 = p.pastdata.k0;
      if (!k0.length || (k0.length && k0[0][1] < cat)) 
      {
        p.pastdata.k0.unshift([dat.event.id,cat]);
        
        p.metadata = metadata;
        
        if (cat > p.updated) p.updated = cat;
        author.save(p);
      }
      let profile = document.getElementById(p.npub);
      if (!profile) profile = author.profile(p);

      author.update(profile,p,true);
    });
  }
  const note = kin.def(dat);
  note.classList.add('root');
  let content = note.querySelector('.content');
  content.textContent = '';
  content.append(metadata ? it.mk.ls({ls:metadata}) : er);
    
  return note
};

kin.d1 =dat=>
{
  let note = kin.note(dat);
  note.classList.add('is_new');
  let reply_tag = rep.ly(dat.event.tags);
  if (reply_tag && reply_tag.length)
  {
    v_u.append_as_reply(dat,note,reply_tag);
  }
  else 
  {
    note.classList.add('root');
    v_u.append(note,document.getElementById('notes'),1);
  }
  return note
};

kin.d3 =dat=>
{
  const tags = dat.event.tags;
  if (tags.length && !dat.clas?.includes('draft'))
  {
    const xpub = dat.event.pubkey;
    const cat = dat.event.created_at;
    aa.db.get_p(xpub).then(p=>
    {      
      let k3 = p.pastdata.k3;
      if (!k3.length || k3[0][1] < cat) 
      {
        p.pastdata.k3.unshift([dat.event.id,cat]);
        console.log('old bff from '+xpub,p.extradata.bff);

        p.extradata.bff = author.bff(tags,xpub);

        if (cat > p.updated) p.updated = cat;
        author.save(p);
      }
      if (!p.extradata.bff.length)
      {
        p.extradata.bff = author.bff(tags,xpub);
        author.save(p);
      }

      let profile = document.getElementById(p.npub);
      if (!profile) profile = author.profile(p);
      author.update(profile,p,true);
    });
  }
  const note = kin.def(dat);
  note.classList.add('root');
  return note
};

kin.d7 =dat=>
{
  kin.d1(dat)
};

const rep = {};
rep.ly =tags=>
{
  const a = it.loopita(tags, it.tag.e, it.tag.reply);
  
  let is_array = Array.isArray(a[0]);
  if (a && !is_array) return a;
  if (is_array)
  {
    let l = a[a.length-1];
    if (it.tag.marked('mention',l)) return false;
    return l
  }
  return false
};

rep.root =tags=>
{
  const a = it.loopita(tags, it.tag.e, it.tag.root);
  
  let is_array = Array.isArray(a[0]);
  if (a && !is_array) return a;
  if (is_array)
  {
    let l = a[0];
    if (it.tag.marked('mention',l)) return false;
    return l
  }
  return false
};

kin.note_actions =clas=>
{
  const l = it.mk.l('p',{cla:'actions'});
  if (!clas) clas = [];
  if (clas.includes('draft'))
  {
    l.append(
      it.mk.l('button',{con:'yolo',cla:'butt yolo',clk:aa.yolo}),
      ' ',
      it.mk.l('button',{con:'sign',cla:'butt sign',clk:aa.sign}),      
      ' ',
      it.mk.l('button',{con:'edit',cla:'butt edit',clk:aa.edit}),
      ' ',
      it.mk.l('button',{con:'cancel',cla:'butt cancel',clk:aa.cancel}));
  }
  else
  {
    if (clas.includes('not_sent'))
    {
      l.append( it.mk.l('button',{con:'post',cla:'butt post',clk:aa.post}));
    }
    else
    {
      l.append(
        it.mk.l('button',{con:'<3',tit:'react',cla:'butt react',ckl:aa.react}),
        ' ',
        it.mk.l('button',{con:':',tit:'parse content',cla:'butt parse',ckl:aa.parse}),
        ' ',
        it.mk.l('button',{con:'x',tit:'hide note',cla:'butt hide',ckl:aa.hide}),
      );
    }
  }

  return l
};

kin.tag =(a,i,li=false)=>
{
  let l = li ? li : it.mk.l('li',{cla:'tag tag_'+a[0]});
  
  l.textContent = '';
  l.append(it.mk.l('button',
  {
    con:''+i,
    clk:e=>
    {
      const mom = e.target.parentElement;
      mom.classList.toggle('parsed');
      kin.tag(a,i,mom)
    }
  }));

  if (l.classList.contains('parsed')) l.append(it.fx.a(a));
  else l.append(a.join(', '));
  if (!li) 
  {
    l.dataset.tag = a[1];
    if (it.s.x(a[1])) it.fx.color(a[1],l);
    return l
  }
};

kin.tags =tags=>
{
  const tags_ol = it.mk.l('ol',{cla:'tags'});
  tags_ol.start = 0;
  
  const times = tags.length;
  for (let i=0;i<times;i++) tags_ol.append(kin.tag(tags[i],i));
  
  return tags_ol
};
    
kin.view =l=>
{
  l.classList.add('in_view');   
  it.fx.in_path(l);
  aa.l.classList.add('viewing','view_e');
  v_u.scroll(l)
};

aa.print =dat=>
{
  const xid = dat.event.id;
  if (aa.miss.e[xid]) delete aa.miss.e[xid];
  if (!aa.e[xid]) aa.e[xid] = dat;
  
  // if (dat.cla?.includes('not_sent') 
  // && !aa.e[dat.event.id]) aa.e[dat.event.id] = dat;

  let nid = it.fx.nid(xid);
  let l = document.getElementById(nid);
  if (!l)
  {
    l = kin.da(dat);
    let butt = document.getElementById('butt_e');
    butt.dataset.count = document.querySelectorAll('.note').length;
  }
  else
  {
    if (l.classList.contains('blank') 
    || l.classList.contains('draft')) aa.replace_note(l,dat);
  } 

  if (l && history.state.view === nid) kin.view(l);

  aa.moar();
  // aa.dex();
};
