const kin ={};

kin.note =dat=>
{
  const note = it.mk.l('article',{cla:'note'}); 
  const by = it.mk.l('header',{cla:'by'});
  let p,trusted;
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
    // console.log(p);
    note.dataset.pubkey = o.pubkey;
    trusted = it.s.trusted(p?.trust ?? 0);
    note.dataset.trust = trusted;
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
    note.append(it.parse.content(o,trusted)); 
  }

  if (o.sig) note.append(it.mk.l('p',{cla:'sig',con:o.sig}));

  // let replies = it.mk.l('ul',{cla:'replies expanded',clk:v_u.mark_read});
  // let replies = it.mk.l('ul',{cla:'replies expanded',clk:v_u.mark_read});
  let replies = it.mk.details('',false,true);
  replies.classList.add('replies','expanded');
  let summary = replies.querySelector('summary');
  summary.append(it.mk.l('button',{cla:'butt mark_read',clk:v_u.mark_read}));
  // summary.addEventListener('click',v_u.mark_read);
  // console.log(replies);
  note.append(replies,kin.note_actions(dat.clas));  
  return note
};

kin.quote =o=>
{
  if (!o.id) return false;
  const quote = it.mk.l('blockquote',{cla:'note_quote'});
  if (o.dis) quote.cite = o.dis;
  quote.dataset.id = o.id;
  let by = it.mk.l('p',{cla:'note_quote_by'});
  by.append(it.mk.nostr_link(it.fx.nid(o.id)));
  quote.append(by);
  // console.log(e);
  let pubkey = o.author ?? o.pubkey;
  if (pubkey) 
  {
    pubkey  = it.mk.author(o.id);
    by.prepend(pubkey);
  }
  
  aa.db.get_e(o.id).then(dat=>
  {
    
    if (dat) 
    {
      if (!pubkey) pubkey = it.mk.author(dat.event.pubkey);
      content = it.parse.content_quote(dat.event);
      // quote.append(it.parse.content_quote(e.event));
    }
    else
    {
      quote.classList.add('blank_quote');
      if (!pubkey) pubkey = it.mk.l('span',{con:'?'});
      // pubkey = o.author ?? o.pubkey ?? '?';
      content = it.mk.l('p',{cla:'paragraph'});
      
      let req = {ids:[o.id]};
      if (o.relays) 
      {
        req.relays = o.relays;
        let relay_content = it.mk.l('p',{con:'relays: '+o.relays});
        content.append(relay_content);
      }
      
      // q_e.req.ids(req);
    }
    by.prepend(pubkey);
    quote.append(content)
    
  }); 
  return quote
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
  else v_u.log('not ok: '+reason+' '+id);
};

kin.eose =message=>
{
  // message.data ["EOSE", <sub_id>]
  const sub_id = message.data[1];
  let sub = rel.active[message.origin].q[sub_id];
  if (sub.eose === 'close') rel.close(message.origin,sub_id)
};

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
    aa.db.upd(dat);
    if (dat.subs?.length && dat.seen?.length)
    {
      let sub = rel.active[dat.seen[0]].q[dat.subs[0]];
      if (!sub?.stamp || sub.stamp < dat.event.created_at) sub.stamp = dat.event.created_at;
    }
    
    
    aa.print(dat);
  }
  else console.log('invalid event',message);
};

kin.e =s=>
{
  let event = it.parse.j(s);;
  if (event)
  {
    if (!event.pubkey) event.pubkey = aka.o.ls.xpub;
    if (!event.kind) event.kind = 1;
    if (!event.created_at) event.created_at = it.tim.now();
    if (!event.tags) event.tags = [];
    kin.draft(event);
  }
  cli.fuck_off();
  console.log(event)
};

kin.draft =event=>
{
  if (!event.id) event.id = it.fx.hash(event);
  aa.e[event.id] = {event:event,clas:['draft'],seen:[],subs:[]};
  // console.log(event);
  aa.print(aa.e[event.id]);
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
    content:tag[1]+'\n'+it.fx.nid(tag[1])
  }
  const seen = rel.in_set('read');
  let r;
  if (tag[2])
  {
    const url = it.s.url(tag[2]);
    if (url) 
    {
      it.a_set(seen,[url.href]);
      blank_event.content = blank_event.content+'\n'+url.href;
      r = url.href;
    }
    else console.log('malformed tag on',dat);
  }
  const note = kin.note({event:blank_event,seen:seen,subs:dat.subs,clas:['blank']});
  note.classList.add('blank','is_new');
  if (r) note.dataset.r = r;
  return note
};

kin.d0 =dat=>
{
  const er = 'invalid kind:0 metadata';
  let metadata = it.parse.j(dat.event.content);
  // try { metadata = JSON.parse(dat.event.content) } 
  // catch (err) { v_u.log(er) } 
  
  if (metadata)
  {
    aa.db.get_p(dat.event.pubkey).then(p=>
    {
      if (!p) p = it.p(dat.event.pubkey);
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
    // note.classList.add('reply');
    v_u.append_to_replies(dat,note,reply_tag);
  }
  else 
  {
    // note.classList.add('root');
    v_u.append_to_notes(note);
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
      if (!p) p = it.p(dat.event.pubkey);   
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
        let relays = rel.from_o(it.parse.j(dat.event.content),['k3']);
        rel.add_to_p(relays,p);
        if (aka.is_aka(p.xpub)) rel.add_to_aka(relays);
        
        author.save(p);
      }
      
      let profile = document.getElementById(p.npub);
      if (!profile) profile = author.profile(p);
      author.update(profile,p,true);

      if (aka?.is_aka(p.xpub)) aka.load_bff(p);
    });
  }
  const note = kin.def(dat);
  note.classList.add('root');
  return note
};

kin.d6 =dat=>
{
  // console.log(dat);
  dis = Object.assign({},dat);
  dis.event.content = 'k'+dat.event.kind;
  let note = kin.note(dis);
  note.classList.add('is_new','tiny');
  let reply_tag = it.get_reply_tag(dat.event.tags);
  if (reply_tag && reply_tag.length)
  {    
    let repost_id = reply_tag[1];
    if (repost_id) 
    {
      let dat_e = aa.db.get_e(repost_id).then(dat_e=>
      {
        if (!dat_e) 
        {
          let repost = it.parse.j(dat.event.content);
          if (repost) kin.event({data:['EVENT','k6',repost],origin:dat.seen[0]});
        }
        else aa.print(dat_e);
      });
      
    }
    v_u.append_to_replies(dat,note,reply_tag);
  }
  else 
  {
    v_u.append_to_notes(note);
  }
  return note

  // let repost_id = it.get_reply_tag();
  // if (repost_id) 
  // {
  //   let e = document.querySelector('[data-id="'+repost_id+'"]');
  //   if (!e) 
  //   {
  //     let repost = it.parse.j(dat.event.content);
  //     if (repost) aa.print({event:repost});
  //   }
  // }
  
  // const note = kin.def(dat);
  // note.classList.add('root');
  // return note
};

kin.d16 =dat=>
{
  return kin.d6(dat)
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
      if (!p) p = it.p(dat.event.pubkey);
      if (!p.pastdata.k10002.length || p.pastdata.k10002[0][1] < c_at) 
      {
        p.pastdata.k10002.unshift([dat.event.id,c_at]);
        if (c_at > p.updated) p.updated = c_at;
        
        let relays = rel.from_tags(tags,['k10002']);
        rel.add_to_p(relays,p);
        if (aka.is_aka(p.xpub)) rel.add_to_aka(relays);
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
  const note = kin.d1(dat);
  note.classList.add('tiny');
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
      it.mk.l('button',{con:'cancel',cla:'butt cancel',clk:aa.clk.cancel}),
      ' ',
      it.mk.l('button',{con:'editor',cla:'butt editor',clk:aa.clk.editor})
    );
  }
  else if (clas.includes('not_sent'))
  {
    l.append( 
      it.mk.l('button',{con:'post',cla:'butt post',clk:aa.clk.post}),
      ' ',
      it.mk.l('button',{con:'cancel',cla:'butt cancel',clk:aa.clk.cancel})  
    );
  }
  else if (clas.includes('blank'))
  {
    l.append( 
      it.mk.l('button',{con:'fetch',cla:'butt fetch',clk:aa.clk.fetch})
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
    if (!l) console.log(dat);
    if (l?.classList.contains('draft')) v_u.scroll(l,{behavior:'smooth',block:'center'});
  }
  else
  {
    if (l.classList.contains('blank') 
    || l.classList.contains('draft')) aa.replace_note(l,dat);
  }

  it.get_quotes(xid);

  if (l && history.state.view === nid) v_u.dis(l);

  aa.moar();
  // aa.dex();
};

aa.ct.kin = 
{
  'e': 
  {
    required:['JSON'],
    description:'mk event from JSON',
    exe:kin.e
  },
};