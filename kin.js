const kin ={};

kin.note =dat=>
{
  const note = it.mk.l('article',{cla:'note'}); 
  const by = it.mk.l('header',{cla:'by'});
  let p;
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
    p = aa.p[o.pubkey];
    note.dataset.pubkey = o.pubkey;
    it.fx.color(o.pubkey,note);
    by.append(it.mk.author(o.pubkey));
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
    let content;
    if (p && it.s.trusted(p.trust)) 
    {
      content = it.parse.content(o);
    }
    else 
    {
      content = it.parse.content_basic(o);
    }
    note.append(content); 
  }
  if (o.sig) note.append(it.mk.l('p',{cla:'sig',con:o.sig}));

  let replies = it.mk.l('ul',{cla:'replies expanded',clk:v_u.mark_read});
  
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
  const [type,id,is_ok,reason] = message.data;
  if (is_ok) 
  {
    console.log('ok',id,message.origin);
    let dat = aa.e[id];
    dat.clas = it.a_rm(dat.clas,['not_sent','draft']);
    it.a_set(dat.seen,[message.origin]);
    aa.db.upd(dat);

    const l = document.getElementById(it.fx.nid(id));
    if (l) 
    {
      l.classList.remove('not_sent','draft');
      it.a_dataset(l,'seen',[message.origin]);
      let actions = l.querySelector('.actions');
      actions.replaceWith(kin.note_actions(dat.clas))
    }
    
  }
  else console.log('not ok',id,reason)
};

kin.eose =message=>
{
  // message.data ["EOSE", <sub_id>]
  const sub_id = message.data[1];
  let sub = rel.active[message.origin].q[sub_id];
  if (sub.eose === 'close')
  {
    rel.close(message.origin,sub_id)
    // console.log(sub.eose,message.data[1],rel.active[message.origin].q[message.data[1]]);
    // rel.active[message.origin].ws.send(JSON.stringify(['CLOSE',message.data[1]]));
    // delete rel.active[message.origin].q[message.data[1]];
  }
};

kin

kin.event =message=>
{ // message = {data,origin}
  // console.log(message);
  const sub_id = message.data[1];
  const event = message.data[2];

  if (it.fx.verify(event)) 
  {
    const dat = 
    {
      event:event,
      seen:[message.origin],
      subs:[sub_id],
      clas:[],
      refs:[]
    };
    if (aa.miss.e[event.id]) delete aa.miss.e[event.id];
    if (!aa.e[event.id]) 
    {
      aa.e[event.id] = dat;
      aa.db.upd(dat);
    }
    else 
    {
      const dis = it.fx.merge(aa.e[event.id],dat);
      if (dis) aa.e[event.id] = dis;
    }
    let sub = rel.active[dat.seen[0]].q[dat.subs[0]];
    if (!sub.stamp || sub.stamp < dat.event.created_at) sub.stamp = dat.event.created_at;
    
    aa.print(dat);
  }
  else console.log('invalid event',message);
};

kin.da =dat=>
{
  let note;
  if (kin.hasOwnProperty('d'+dat.event.kind)) note = kin['d'+dat.event.kind](dat);
  else note = kin.def(dat);
  // kin.dex(dat);
  return note
};

kin.def =dat=>
{
  let note = kin.note(dat);
  v_u.append_to_notes(note);
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
    content:'blank xid: '+tag[1]+'\nnid:'+it.fx.nid(tag[1])
  }
  const seen = rel.in_set('read');
  if (tag[2])
  {
    const url = it.s.url(tag[2]);
    if (url) 
    {
      it.a_set(seen,[url.href]);
      blank_event.content = blank_event.content+'\n'+url.href;
    }
    else console.log('malformed tag on',dat);
  }
  const note = kin.note({event:blank_event,seen:seen,subs:dat.subs});
  note.classList.add('blank','is_new');
  const butt = it.mk.l('button',{cla:'butt blank',con:'fetch',clk:e=>
  {
    console.log(e.target.closest('.note').dataset.id)
  }});
  // console.log(note)
  const content = note.querySelector('.content');
  content.append(butt);
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
      if (!p) p = author.p(dat.event.pubkey);
      const c_at = dat.event.created_at;
      if (!p.pastdata.k0.length || p.pastdata.k0[0][1] < c_at) 
      {
        p.pastdata.k0.unshift([dat.event.id,c_at]);
        if (c_at > p.updated) p.updated = c_at;
        p.metadata = metadata;
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
  let reply_tag = it.get_reply_tag(dat.event.tags);
  if (reply_tag && reply_tag.length)
  {
    note.classList.add('reply');
    v_u.append_to_replies(dat,note,reply_tag);
    // v_u.append_as_reply(dat,note,reply_tag);
  }
  else 
  {
    note.classList.add('root');
    v_u.append_to_notes(note);
    // v_u.append(note,document.getElementById('notes'),1);
  }
  return note
};

kin.d3 =dat=>
{
  const tags = dat.event.tags;
  if (tags.length) //  && !dat.clas?.includes('draft')
  {
    const x = dat.event.pubkey;
    const c_at = dat.event.created_at;
    aa.db.get_p(x).then(p=>
    {   
      if (!p) p = author.p(dat.event.pubkey);   
      if (!p.pastdata.k3.length || p.pastdata.k3[0][1] < c_at) 
      {
        p.pastdata.k3.unshift([dat.event.id,c_at]);
        if (c_at > p.updated) p.updated = c_at;
        const old_bff = [...p.extradata.bff];
        p.extradata.bff = author.bff_from_tags(tags);        
        author.process_k3_tags(tags,x);

        for (const k of old_bff)
        {
          if (!p.extradata.bff.includes(k))
          {

            // handle unfollowed k

          }
        }

        

        rel.add_from_k3(rel.from_k3(dat.event.content),p);

        author.save(p);
      }
      
      let profile = document.getElementById(p.npub);
      if (!profile) profile = author.profile(p);
      author.update(profile,p,true);

      if (p.sets.includes('aka')) aka.load_bff(p);

      
    });
  }
  const note = kin.def(dat);
  note.classList.add('root');
  return note
};

kin.d10002 =dat=>
{
  const tags = dat.event.tags;
  if (tags.length) 
  {
    const x = dat.event.pubkey;
    const c_at = dat.event.created_at;
    aa.db.get_p(x).then(p=>
    {
      if (!p) p = author.p(dat.event.pubkey);
      if (!p.pastdata.k10002.length || p.pastdata.k10002[0][1] < c_at) 
      {
        p.pastdata.k10002.unshift([dat.event.id,c_at]);
        if (c_at > p.updated) p.updated = c_at;
        // p.extradata.bff = author.bff_from_tags(tags);
        // author.process_k3_tags(tags,x);

        
        rel.add_from_k10002(tags,p);
        // const relays = kin.extract_relays_from_content(dat.event.content);
        // if (relays)
        // {
        //   console.log(relays);
        //   if (!p.rels) p.rels = {};
        //   for (const url in relays)
        //   {
        //     const dis = it.s.url(url);
        //     if (dis)
        //     {
        //       const relay = p.rels[dis.href] = {sets:[]};
        //       if (relays[url].read === true) it.a_set(relay.sets,['read']);
        //       if (relays[url].write === true) it.a_set(relay.sets,['write']);
        //       it.a_set(relay.sets,['k3']);
        //     }
        //   }
        // }

        author.save(p);
      }

      let profile = document.getElementById(p.npub);
      if (!profile) profile = author.profile(p);
      author.update(profile,p,true);

      // if (p.sets.includes('aka')) aka.load_bff(p);

      
    });
  }
  const note = kin.def(dat);
  note.classList.add('root');
  return note
};

kin.d7 =dat=>
{
  const note = kin.d1(dat);
  return note
};



kin.note_actions =clas=>
{
  const l = it.mk.l('p',{cla:'actions'});
  if (!clas) clas = [];
  if (clas.includes('draft'))
  {
    l.append(
      it.mk.l('button',{con:'yolo',cla:'butt yolo',clk:aa.clk.yolo}),
      ' ',
      it.mk.l('button',{con:'sign',cla:'butt sign',clk:aa.clk.sign}),      
      ' ',
      it.mk.l('button',{con:'edit',cla:'butt edit',clk:aa.clk.edit}),
      ' ',
      it.mk.l('button',{con:'cancel',cla:'butt cancel',clk:aa.clk.cancel})
    );
  }
  else
  {
    if (clas.includes('not_sent'))
    {
      l.append( 
        it.mk.l('button',{con:'post',cla:'butt post',clk:aa.clk.post}),
        ' ',
        it.mk.l('button',{con:'cancel',cla:'butt cancel',clk:aa.clk.cancel})  
      );
    }
    else
    {
      l.append(
        it.mk.l('button',{con:'<3',tit:'react',cla:'butt react',clk:aa.clk.react}),
        ' ',
        it.mk.l('button',{con:':',tit:'parse content',cla:'butt parse',clk:aa.clk.parse}),
        ' ',
        it.mk.l('button',{con:'x',tit:'hide note',cla:'butt hide',clk:aa.clk.hide}),
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
    // let butt = document.getElementById('butt_e');
    // butt.dataset.count = document.querySelectorAll('.note').length;
    if (!l) console.log(dat);
    if (l?.classList.contains('draft')) v_u.scroll(l,{behavior:'smooth',block:'center'});
  }
  else
  {
    if (l.classList.contains('blank') 
    || l.classList.contains('draft')) aa.replace_note(l,dat);
  } 

  if (l && history.state.view === nid) v_u.dis(l);
  

  aa.moar();
  // aa.dex();
};
