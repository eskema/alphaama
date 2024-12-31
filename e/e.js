/*

alphaama
mod    e
events notes

*/

aa.styleshit('/e/e.css');

aa.e = 
{
  root_count:0,
  requires:['o'],
};


// append stashed orphans from refs 
aa.e.append_from_refs =()=>
{
  for (const i in aa.temp.refs)
  {
    for (const e in aa.temp.refs[i]) aa.e.append_check(...e);
  }
};


aa.e.append_to =(dat,note,reply_tag)=>
{
  if (reply_tag && reply_tag.length) 
  {
    aa.e.append_check(dat,note,reply_tag) 
  }
  else aa.e.append_to_notes(note);
};


// append note to notes section
aa.e.append_to_notes =note=>
{ 
  let notes = document.getElementById('notes');
  if (!note.classList.contains('rendered')) 
  {
    note.querySelector('.replies').removeAttribute('open');
    note.classList.add('root','not_yet');
    aa.e.note_observer.observe(note);
  }
  if (note.classList.contains('blank')) 
  {
    notes.append(note)
  }
  else 
  {
    const last = [...notes.children]
    .filter(i=>note.dataset.stamp > i.dataset.stamp)[0];
    notes.insertBefore(note,last)
  }

  // setTimeout(()=>
  // {
  aa.e.note_refs(note.dataset.id);
  if (note.dataset.id_a) aa.e.note_refs(note.dataset.id_a);
  // },100)
};


// append to another note as reply
aa.e.append_to_rep =(note,rep)=>
{
  const last = [...rep.children]
  .filter(i=> i.tagName === 'ARTICLE' 
  && i.dataset.created_at > note.dataset.created_at)[0];
  note.classList.add('reply');
  note.classList.remove('root');
  if (note.classList.contains('in_path')) rep.parentNode.classList.add('in_path')
  rep.parentNode.classList.add('haz_reply'); 
  if (!sessionStorage[note.dataset.id]) 
  {
    note.classList.add('is_new');
    rep.parentNode.classList.add('haz_new_reply');
  }
  rep.insertBefore(note,last?last:null)
  aa.e.upd_note_path(rep,note.dataset.stamp,aa.is.u(note.dataset.pubkey));
  aa.e.note_refs(note.dataset.id);
  if (note.dataset.id_a) aa.e.note_refs(note.dataset.id_a);
};


// decides where to append a reply
aa.e.append_check =(dat,note,reply_tag)=>
{
  const reply_id = reply_tag[1];
  let p = aa.db.p[dat.event.pubkey];
  let relays = aa.fx.in_set(p?.relays,'write');
  
  if (reply_tag[0] === 'a')
  {
    let a_note = document.querySelector('.note[data-id_a="'+reply_tag[1]+'"]');
    if (!a_note)
    {
      aa.e.refs(dat,note,reply_tag);
      aa.e.miss_print_a(reply_tag,relays);
    }
    else aa.e.append_to_rep(note,a_note.querySelector('.replies'));
    return;
  }
  
  const reply_nid = aa.fx.encode('note',reply_id);
  let reply = document.getElementById(reply_nid);
  if (!reply)
  {
    aa.e.refs(dat,note,reply_tag);
    let root_tag = aa.get.root_tag(dat.event.tags);
    if (root_tag && root_tag[1] !== reply_id)
    {
      let root_id = root_tag[1];
      let root_nid = aa.fx.encode('note',root_id);
      let root = document.getElementById(root_nid);
      if (!root) aa.e.miss_print(root_tag);
    }
    aa.e.miss_print(reply_tag,relays);
  }
  else
  {
    if (reply.classList.contains('blank'))
    {
      aa.e.reply_blank(note,reply,reply_tag);
    }
    aa.e.append_to_rep(note,reply.querySelector('.replies'));
  }
};


// clear notes from section
aa.e.clear =s=>
{
  document.getElementById('notes').textContent = '';
  document.getElementById('butt_e').dataset.count = 0;
  // aa.fx.data_count(document.getElementById('butt_e'),'.note');
  aa.log('events cleared');
  aa.cli.fuck_off();
};


//parse content as object
aa.parse.content_o =async(data,note)=>
{
  if (data && typeof data === 'object')
  {
    let content = note.querySelector('.content');
    content.textContent = '';
    content.append(aa.mk.ls({ls:data}));
  }
};


// toggle parsed content on note
aa.parse.context =(note,event,trust)=>
{
  const content = note.querySelector('.content');
  content.textContent = '';
  content.classList.toggle('parsed');
  if (content.classList.contains('parsed'))
  {
    content.append(aa.parse.content(event.content,trust));
  }
  else content.append(aa.mk.l('p',{cla:'paragraph',con:event.content}));
};


// make details section
aa.mk.det =(cla='',id='')=>
{
  let l = aa.mk.details('',false,true);
  if (cla) l.classList.add(cla);
  if (id)
  {
    l.id = id;
    aa.fx.expanded(id,1,l);
  }
  let summary = l.querySelector('summary');
  summary.append(aa.mk.l('button',{cla:'butt mark_read',clk:aa.clk.mark_read}));
  return l 
};



// load event list from db into memory
aa.e.events =async a=>
{
  const a_to_get = [];
  for (const x of a) if (!aa.db.e[x]) a_to_get.push(x);
  if (a_to_get.length)
  {
    let stored = await aa.db.get('idb',{get_a:{store:'events',a:a_to_get}});
    for (const dat of stored) aa.db.e[dat.event.id] = dat;
  } 
};


// parse hashtag
aa.parse.hashtag =(match)=>
{
  return aa.mk.l('span',
  {
    cla:'hashtag',
    con:match[0],
    lab:match[0].slice(1).toLowerCase()
  })
};


// on load
aa.e.load =()=>
{
  aa.actions.push(
    {
      action:['e','clear'],
      description:'clear e section',
      exe:aa.e.clear
    },
    {
      action:['e','s'],
      required:['value'],
      description:'search notes content for value',
      exe:aa.e.search
    },
    {
      action:['e','json'],
      required:['hex_id'],
      description:'return event JSON',
      exe:aa.e.json
    },
    {
      action:['e','view'],
      required:['hex_id'],
      description:'view event by hex_id',
      exe:(s)=>{ aa.state.view('#'+aa.fx.encode('note',s)) }
    },
    {
      action:['db','some'],
      required:['number'],
      optional:['oldest'],
      description:'request n events from db',
      exe:aa.db.some
    },
    {
      action:['db','view'],
      required:['id'],
      description:'view event',
      exe:aa.state.view
    }
  );
  const section = aa.mk.section('e');
  const notes = aa.mk.l('div',{id:'notes'});
  aa.e.section_observer.observe(notes,{attributes:false,childList:true});
  setTimeout(()=>{section.append(notes,aa.mk.pagination())},200);
};


// mark replies as read
aa.clk.mark_read =e=>
{
  e.stopPropagation();
  const classes = ['haz_new_reply','haz_new','is_new'];
  const replies = e.target.closest('.replies');
  const note = e.target.closest('.note');
  const root = e.target.closest('.root');
  const new_stuff = replies.querySelectorAll('.'+classes.join(',.'));
  note.classList.remove(...classes);
  
  if (new_stuff.length)
  {
    e.preventDefault();
    for (const l of new_stuff) 
    {
      sessionStorage[l.dataset.id] = 'is_read';
      requestAnimationFrame(e=>
      {
        l.classList.remove(...classes);
      });
    }
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[replies.id] = '';
      requestAnimationFrame(e=>
      {
        replies.classList.remove('expanded');
      });
    }
  }
  else 
  {
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[replies.id] = '';
      requestAnimationFrame(e=>
      {
        replies.classList.remove('expanded');
      });

    }
    else 
    {
      sessionStorage[replies.id] = 'expanded';
      requestAnimationFrame(e=>
      {
        replies.classList.add('expanded');
      });
    }
  }
  let top = root.offsetTop + (3 * parseFloat(getComputedStyle(document.documentElement).fontSize));
  if (top < aa.l.scrollTop) aa.l.scrollTo(0,top);
};


// add event id to missing event list
aa.e.miss_e =(xid,relays=[])=>
{
  if (!aa.miss.e[xid]) aa.miss.e[xid] = {nope:[],relays:[]};
  relays.push(...aa.fx.in_set(aa.r.o.ls,aa.r.o.r));
  for (const rel of relays)
  {
    const r = aa.is.url(rel);
    if (r && !aa.miss.e[xid].relays.includes(r.href)) aa.miss.e[xid].relays.push(r.href);
  }
};

// add event id to missing event list
aa.e.miss_a =(id,relays=[])=>
{
  const [kind,pubkey,ds] = id.split(':');
  // let ur = aa.fx.in_set(aa.db.p[pubkey]?.relays,'write');
  relays.push(...aa.fx.in_set(aa.db.p[pubkey]?.relays,'write'));
  // let p = aa.db.p[pubkey];
  // let relays = aa.fx.in_set(p?.relays,'write');

  if (!aa.miss.a[id]) aa.miss.a[id] = {nope:[],relays:[]};
  relays.push(...aa.fx.in_set(aa.r.o.ls,aa.r.o.r));
  for (const rel of relays)
  {
    const r = aa.is.url(rel)?.href;
    if (r && !aa.miss.a[id].relays.includes(r)) aa.miss.a[id].relays.push();
  }
};


// get event from tag and prints it,
// otherwise add to missing list
aa.e.miss_print =(tag,relays=[])=>
{
  const xid = tag[1];
  if (tag[2]) relays.push(tag[2]);
  aa.db.get_e(xid).then(dat=>
  {
    if (dat) aa.e.to_printer(dat);
    else aa.e.miss_e(xid,relays);
  });
};


// get event from tag and prints it,
// otherwise add to missing list
aa.e.miss_print_a =(tag,relays=[])=>
{
  const id = tag[1];
  if (tag[2]) relays.push(tag[2]);
  aa.db.get_a(id).then(dat=>
  {
    if (dat) aa.e.to_printer(dat); //aa.e.print(dat);
    else aa.e.miss_a(id,relays);
  });
};


// get missing e or p from def relays
aa.get.missing =async type=>
{
  aa.to(()=>
  {
    let miss = {};
    
    let def_relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
    for (const xid in aa.miss[type])
    {
      let v = aa.miss[type][xid];
      aa.e.nope(xid,def_relays,v.nope,miss);
      aa.e.nope(xid,v.relays,v.nope,miss);
    }

    if (Object.keys(miss).length)
    {
      let filter;
      let [url,ids] = Object.entries(miss).sort((a,b)=>a.length - b.length)[0];
      for (const id of ids) aa.fx.a_add(aa.miss[type][id].nope,[url]);
      
      if (type === 'e' || type === 'p')
      {
        if (type === 'p') filter = {authors:ids,kinds:[0]};
        else
        {
          // for (const id of ids)
          // {
          //   let notes = document.querySelectorAll('[data-id="'+id+'"]');
          //   for (const note of notes) note.dataset.nope = aa.miss[type][id].nope.join(' ');
          // }
          filter = {ids:ids};
        }
        setTimeout(()=>{aa.r.demand(['REQ',type,filter],[url],{})},0)
      }
      else if (type === 'a')
      {
        for (const id of ids)
        {
          let [k,x,s] = id.split(':');
          filter = {kinds:[parseInt(k)],authors:[x],'#d':[s]};
          let req = ['REQ',id.slice(0,12),filter];
          setTimeout(()=>{aa.r.demand(req,[url],{'eose':'close'})},0);
        }
        
        
        // let chunks = aa.fx.chunks(ids,21);
        // for (const chunk of chunks)
        // {
        //   let req = ['REQ','ida_'+aa.fx.random_s('12')];
        //   // console.log('missing a:',ids);
          
        //   for (const id of chunk)
        //   {
        //     let [k,x,s] = id.split(':');
        //     filter = {kinds:[parseInt(k)],authors:[x],'#d':[s]};
        //     req.push(filter);
        //     // let notes = document.querySelectorAll('[data-id_a="'+id+'"]');
        //     // for (const note of notes) note.dataset.nope = aa.miss[type][id].nope.join(' ');
        //   }
        //   setTimeout(()=>{aa.r.demand(req,[url],{'eose':'close'})},0);
        // }
      }
    }
  },500,'miss_'+type);
};


// parse nip19 to render as mention or quote
aa.parse.nip19 =s=>
{
  let d = aa.fx.decode(s);
  if (!d) return s;
  let l;
  if (s.startsWith('npub1'))  l = aa.mk.p_link(d);
  else if (s.startsWith('nprofile1')) l = aa.mk.p_link(d.pubkey);
  else if (s.startsWith('note1')) l = aa.e.quote({"id":d});
  else if (s.startsWith('nevent1'))
  {
    if (d.id) 
    {
      d.s = s;
      l = aa.e.quote(d);
    }
    else l = aa.mk.l('span',{con:s+': '+JSON.stringify(d)})
  }
  else if (s.startsWith('naddr1'))
  {
    if (d.kind && d.pubkey && d.identifier) 
    {
      d.s = s;
      d.id_a = `${d.kind}:${d.pubkey}:${d.identifier}`;
      l = aa.e.quote_a(d);
    }
    else l = aa.mk.l('span',{con:s+':'+JSON.stringify(d)})
  }
  else l = aa.mk.nostr_link(s);
  return l
};


// update blank note not found on relays
aa.e.nope =(id,a,b,miss)=>
{
  for (const url of a) 
  {
    if (!b.includes(url))
    {
      if (!miss[url]) miss[url] = [];
      aa.fx.a_add(miss[url],[id]);
    }
  }
};


// parse nostr:stuff
// use with aa.parser('nostr',s)
aa.parse.nostr =match=>
{
  let df = new DocumentFragment();
  df.append(match.input.slice(0,match.index)); 

  let matches = (match[0]).split('nostr:').join(' ').trim().split(' ');
  for (const m of matches)
  {
    let a = m.split('1');
    if (a[1])
    {
      let mm = a[1].match(aa.regex.bech32);
      if (mm[0] && mm.index === 0)
      {
        let s = a[0] + '1' + mm[0];
        let decoded = aa.fx.decode(s);
        if (decoded)
        {
          df.append(aa.parse.nip19(s),' ');
          if (mm[0].length < mm.input.length)
          {
            df.append(mm.input.slice(mm[0].length),' ');
          }
        }
        else df.append(m,' ');
      }
    }
    // else
    // {
    //   console.log(match)
    // }
  }
  if (match[0].length < match.input.length)
  {
    df.append(match.input.slice(match[0].length),' ');
  }
  return df
};


// make generic note element
aa.e.note =dat=>
{
  const note = aa.mk.l('article',{cla:'note'});
  const by = aa.mk.l('header',{cla:'by'});

  note.append(by);
  if (dat.seen) note.dataset.seen = dat.seen.join(' ');
  if (dat.subs) note.dataset.subs = dat.subs.join(' ');
  if (dat.clas) note.classList.add(...dat.clas);
  
  let replies_id;
  if ('id' in dat.event)
  {
    const nid = aa.fx.encode('note',dat.event.id);
    note.id = nid;
    note.dataset.id = dat.event.id;
    const h1 = aa.mk.l('h1',{cla:'id'});
    const h1_nid = aa.mk.l('a',
    {
      cla:'a nid',
      ref:'#'+nid,
      con:'k'+dat.event.kind+' '+aa.k[dat.event.kind],
      clk:aa.clk.a
    });
    const h1_xid = aa.mk.l('span',{cla:'xid',con:dat.event.id});
    h1.append(h1_nid,h1_xid);
    by.prepend(h1);
    replies_id = dat.event.id+'_replies';
    
    let stored = sessionStorage[dat.event.id];
    if (stored && stored === 'tiny') note.classList.add('tiny');
    // by.append(aa.mk.butt(['x','tiny']));
  }

  if ('pubkey' in dat.event)
  {
    const x = dat.event.pubkey;
    note.dataset.pubkey = x;
    let p_link = aa.mk.p_link(dat.event.pubkey);
    by.append(p_link);
    aa.db.get_p(x).then(p=>
    {
      if (!p && !aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
      if (!p) p = aa.p.p(x);
      aa.fx.color(x,note);
      note.dataset.trust = p.score;
      aa.p.p_link_data_upd(p_link,aa.p.p_link_data(p));
      by.append(aa.e.note_actions(dat));
    });
  }
  else by.append(aa.e.note_actions(dat));
  
  if ('kind' in dat.event) 
  {
    note.dataset.kind = dat.event.kind;
  }

  if ('created_at' in dat.event)
  {
    let ca = dat.event.created_at;
    let stamp = aa.t.now < ca ? aa.t.now : ca
    note.dataset.created_at = ca;
    note.dataset.stamp = stamp;
    by.append(aa.mk.time(ca));
  }

  if ('content' in dat.event)
  {
    note.append(aa.mk.l('section',
    {
      cla:'content',
      app:aa.mk.l('p',{cla:'paragraph',con:dat.event.content})
    }));
  }

  if ('tags' in dat.event && dat.event.tags.length)
  {
    let tags_list = aa.mk.tag_list(dat.event.tags);
    let tags_wrapper = aa.mk.details('tags',tags_list);
    tags_wrapper.classList.add('tags_wrapper');
    tags_wrapper.querySelector('summary').dataset.count = dat.event.tags.length;
    note.append(tags_wrapper);
  }

  if ('sig' in dat.event) 
  {
    note.append(aa.mk.l('p',{cla:'sig',con:dat.event.sig}));
  }

  let replies = aa.mk.det('replies',replies_id);
  note.append(replies);
  return note
};


// note actions
aa.e.note_actions =dat=>
{ 
  const l = aa.mk.l('p',{cla:'actions'});
  let a = [];
  if (dat.clas.includes('draft')) 
  {
    switch (dat.event.kind)
    {
      case 4: 
        if (!dat.clas.includes('encrypted'))
        {
          a.push('encrypt','edit','cancel');
          break;
        }
      default: 
        a.push('yolo','sign','pow','edit','cancel');
    }
    l.setAttribute('open','')
  }
  else if (dat.clas.includes('not_sent')) a.push('post','cancel');
  else if (dat.clas.includes('blank')) a.push('fetch');
  else 
  {
    a.push(['…','na']);
  }
  if (a.length) for (const s of a) l.append(aa.mk.butt(s),' ');
  return l
};

aa.clk.na =e=>
{
  let l = e.target.closest('.actions');
  e.target.remove();
  let a = [
    [localStorage.reaction,'react'],
    ['req','req'],
    ['bro','bro'],
    ['parse','parse'],
    ['tiny','tiny']
  ];
  if (a.length) for (const s of a) l.append(aa.mk.butt(s),' ');
};


// process note by kind if available, otherwise default
aa.e.note_by_kind =dat=>
{
  let k = dat.event.kind;
  // k>=1000  && k<=9999 : regular
  // k>=10000 && k<=19999 || k===0 || k===3: replaceable
  // k>=20000 && k<=29999 : ephemeral
  // k>=30000 && k<=39999 : replaceable_parameterized
  let type = aa.fx.kind_type(dat.event.kind); 
  if (aa.kinds.hasOwnProperty(k)) return aa.kinds[k](dat);
  switch (type)
  {
    case 'parameterized': return aa.e.note_pre(dat);break;
    default: return aa.e.note_regular(dat);
  }
};


// blank note
// aa.e.note_blank =(tag,dat,seconds)=>
// {
//   const id = tag[1];
//   const blank_event = 
//   {
//     id:id,
//     created_at:dat.event.created_at - seconds,
//     tags:[tag],
//     content:id+'\n'+aa.fx.encode('note',id)
//   }
//   const seen = aa.fx.in_set(aa.r.o.ls,'read');
//   let r;
//   if (tag[2])
//   {
//     const url = aa.is.url(tag[2]);
//     if (url) 
//     {
//       aa.fx.a_add(seen,[url.href]);
//       blank_event.content = blank_event.content+'\n'+url.href;
//       r = url.href;
//     }
//     else console.log('malformed tag on',dat);
//   }
//   const note = aa.e.note({event:blank_event,seen:seen,subs:dat.subs,clas:['blank']});
//   note.classList.add('blank','is_new');
//   if (r) note.dataset.r = r;
//   return note
// };


// blank note
// aa.e.note_blank_pre =(tag,dat,seconds)=>
// {
//   const id = tag[1];
//   const [kind,pubkey,ds] = id.split(':');
//   let timestamp = dat?.event?.created_at ?? aa.t.now - 1000;
//   const blank_event = 
//   {
//     kind:kind,
//     pubkey:pubkey,
//     created_at:timestamp - seconds,
//     tags:[tag],
//     content:id
//   }
//   const seen = aa.fx.in_set(aa.r.o.ls,'read');
//   let r;
//   if (tag[2])
//   {
//     const url = aa.is.url(tag[2]);
//     if (url) 
//     {
//       aa.fx.a_add(seen,[url.href]);
//       blank_event.content = blank_event.content+'\n'+url.href;
//       r = url.href;
//     }
//     else console.log('malformed tag on',tag);
//   }
//   const subs = dat?.subs ?? [];
//   const note = aa.e.note({event:blank_event,seen:seen,subs:dat.subs,clas:['blank']});
//   note.classList.add('blank');
//   note.dataset.id_a = id;
//   if (r) note.dataset.r = r;
//   return note
// };


// regular note
aa.e.note_regular =dat=>
{
  let note = aa.e.note(dat);
  aa.e.append_to_notes(note);
  return note
};

// replaceable parameterized note
aa.e.note_pre =dat=>
{
  // console.log('pre',dat);
  let note = aa.e.note(dat);

  let d_tag = dat.event.tags.filter(t=>t[0] === 'd')[0];
  if (d_tag?.length > 1) 
  {
    let ds = d_tag[1];
    let id_a = `${dat.event.kind}:${dat.event.pubkey}:${ds}`;
    note.dataset.d = ds;
    note.dataset.id_a = id_a;
    let og = document.querySelector(`[data-id_a="${id_a}"]`);
    let versions = og?.querySelector('.versions');
    if (versions) 
    {
      if (og.dataset.created_at < dat.event.created_at)
      {
        aa.e.append_to_rep(note,og.parentElement);
        note.append(versions);
        versions.append(og);
      }
      else aa.e.append_to_rep(note,versions);
    }
    else 
    {
      let details = aa.mk.details('versions',false,true);
      details.classList.add('versions');
      note.append(details);
      aa.e.append_to_notes(note);
    }
  }
  return note
};


// get all note refs stashed and append them to note
aa.e.note_refs =id=>
{
  if (!aa.temp.refs) return;
  if (!aa.temp.refs.hasOwnProperty(id)) return;

  if (aa.temp.orphan[id]) delete aa.temp.orphan[id];

  for (const i in aa.temp.refs[id]) 
  {
    let dis = aa.temp.refs[id];
    if (i && dis?.hasOwnProperty(i)) 
    {
      setTimeout(()=>{aa.e.append_check(...dis[i])},0);
    }
    else console.log(dis);
  }
  delete aa.temp.refs[id];
};


// note replace
aa.e.note_replace =(l,dat)=>
{
  dat.clas = aa.fx.a_rm(dat.clas,['draft']);
  let b = aa.e.note_by_kind(dat);
  l.id = 'temp-'+dat.event.id;
  let b_rep = b.querySelector('.replies');
  // let l_rep = l.querySelector('.replies');
  let childs = l.querySelector('.replies').childNodes;
  let in_path;
  if (childs.length)
  {
    for (const c of childs) 
    {
      if (c.tagName === 'ARTICLE') 
      {
        aa.e.append_to_rep(c,b_rep);
        if (c.classList.contains('in_path')) in_path = true;
      }
    }
  }
  let is_root = b.classList.contains('root');
  let is_reply = b.classList.contains('reply');
  b.className = l.className;
  l.remove();
  b.classList.remove('blank','tiny','draft','not_sent');
  if (in_path) b.classList.add('in_path');
  if (!sessionStorage.getItem(dat.event.id)) b.classList.add('is_new');
  else b.classList.remove('is_new');
  if (dat.clas) b.classList.add(...dat.clas);
  if (!is_root && b.parentElement?.closest('.note')) 
  {
    b.classList.remove('root','not_yet');
  }
  else if (is_root) b.classList.add('root');
  if (!is_reply && !b.parentElement?.closest('.note')) b.classList.remove('reply');
  else if (is_reply) b.classList.add('reply');
  b.classList.add('replaced');
  if (b.classList.contains('not_yet')) 
  {
    b_rep.removeAttribute('open');
    aa.e.note_observer.observe(b);
  }
};


// remove note
aa.e.note_rm =note=>
{
  if (aa.viewing === note.id) aa.state.clear()
  delete aa.db.e[note.dataset.id];
  note.remove();
  aa.fx.count_upd(document.getElementById('butt_e'),false);
  // let counter = document.getElementById('butt_e');
  // counter.dataset.count = counter.dataset.count--;
  // aa.fx.data_count(document.getElementById('butt_e'),'.note')
};


// restrict amount of root events displayed at once, 
aa.mk.pagination =()=>  
{
  let n = parseInt(localStorage.pagination??'0');
  
  const style = aa.mk.l('style',
  {
    id:'e_pagination',
    con:`.pagin #notes > .note:not(:nth-child(-n+${n})):not(.in_path){display:none;}`
  });

  document.head.append(style);

  let pagination = aa.mk.l('p',{cla:'pagination'});
  let butt_more = aa.mk.l('button',{cla:'butt',con:'moar',
  clk:e=>
  {
    if (aa.l.classList.contains('pagin'))
    {
      aa.l.classList.remove('pagin');
      e.target.textContent = 'less';
    }
    else 
    {
      aa.l.classList.add('pagin');
      e.target.textContent = 'moar';
    }
  }});
  pagination.append(butt_more);
  aa.l.classList.add('pagin');
  return pagination
};


// toggle parsed content
aa.clk.parse =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.db.e[xid].event;
  aa.parse.context(note,event,true);
};


// batch send data to print
aa.e.to_printer =dat=>
{
  aa.temp.print[dat.event.id] = dat;
  // if (aa.e.root_count === 0) 
  // {
  //   aa.log('... incoming events');
  //   aa.e.root_count = 1;
  // }
  aa.to(aa.e.printer,200,'printer');
};

aa.e.printer =()=>
{
  let to_print = Object.values(aa.temp.print);
  aa.temp.print = {};
  to_print.sort(aa.fx.sorts.ca_asc);
  // if (aa.e.root_count === 1)
  // {
    // aa.log('printing '+to_print.length+' events');
  // }
  for (const dat of to_print) 
  {
    setTimeout(()=>
    {
      aa.e.print(dat)
    },0);
  }
  setTimeout(()=>
  {
    aa.get.missing('p');
    aa.get.missing('e');
    aa.get.missing('a');
  },200);
};


// print event
aa.e.print =dat=>
{
  // console.log(dat);
  const xid = dat.event.id;
  if (!aa.db.e[xid]) aa.db.e[xid] = dat;
  if (aa.temp.orphan[xid]) return;

  let nid = aa.fx.encode('note',xid);
  let l = document.getElementById(nid);
  if (!l)
  {
    aa.fx.count_upd(document.getElementById('butt_e'));
    l = aa.e.note_by_kind(dat);
    if (!l) console.log(dat);
    else 
    {
      if (l.classList.contains('draft'))
      {
        aa.fx.scroll(l,{behavior:'smooth',block:'center'});
      }
      let k_v = 'pubkey_'+dat.event.pubkey;
      if (aa.p.viewing && aa.p.viewing[1] === k_v) 
      {
        aa.p.viewing[0].push(l);
        // aa.i.solo(l,k_v);
      }
      // setTimeout(()=>{aa.i.d(dat)},300);
    }
  }
  else
  {
    if (l.classList.contains('blank') 
    || l.classList.contains('draft')) 
    {
      aa.e.note_replace(l,dat);
    }
    else
    {
      let seen = dat.seen.join(' ');
      let subs = dat.subs.join(' ');
      if (l.dataset.seen !== seen) l.dataset.seen = seen;
      if (l.dataset.subs !== subs) l.dataset.subs = subs;
    }
  }

  if (l && history.state?.view === '#'+nid)
  {
    setTimeout(()=>{aa.e.view(l)},200);
  }

  if (dat.clas.includes('miss')) 
  {
    dat.clas = aa.fx.a_rm(dat.clas,['miss']);
    if (dat.id_a) 
    {
      aa.get.quotes(dat.id_a);
    }
    else 
    {
      aa.get.quotes(xid);
    }
  }
};


// is tag conditions
aa.is.tag ={};
aa.is.tag.e =a=> a[0]==='e' && aa.is.x(a[1]);
aa.is.tag.p =a=> a[0]==='p' && aa.is.x(a[1]);
aa.is.tag.q =a=> a[0]==='q' && aa.is.x(a[1]);


// create note intersection observer
aa.e.note_observer = new IntersectionObserver(a=>
{
  for (const b of a)
  {
    if (b.isIntersecting) aa.e.note_intersect(b.target)
  }
},{root:null,threshold:.9});
// on observed note intersection
aa.e.note_intersect =async l=>
{
  aa.e.note_observer.unobserve(l);
  l.classList.remove('not_yet');
  l.classList.add('rendered');
  l.querySelector('.replies').setAttribute('open','')
};


// quote event
aa.e.quote =o=>
{
  if (!o.id) return false;
  const quote = aa.mk.l('blockquote',{cla:'note_quote'});
  if (o.dis) quote.cite = o.dis;
  quote.dataset.id = o.id;
  let by = aa.mk.l('p',{cla:'note_quote_by'});
  // by.append(aa.mk.nostr_link(aa.fx.encode('note',o.id)));
  quote.append(by);
  let has_pub;
  let pubkey = o.author ?? o.pubkey;
  if (pubkey) 
  {
    has_pub = true;
    aa.fx.color(pubkey,quote);
    pubkey = aa.mk.p_link(pubkey);
    by.prepend(pubkey);
  }
  setTimeout(()=>{aa.e.quote_upd(quote,o)},200);
  return quote
};

// quote event
aa.e.quote_a =o=>
{
  const quote = aa.mk.l('blockquote',{cla:'note_quote'});
  quote.dataset.id_a = o.id_a;
  setTimeout(()=>{aa.e.quote_a_upd(quote,o)},200);
  return quote
};


// update blank quotes
aa.e.quote_upd =async(quote,o)=>
{
  let by = quote.querySelector('.note_quote_by');
  let has_pub = by.querySelector('a.author') ? true : false;
  let content;
  let quote_classes = [];
  let dat = await aa.db.get_e(o.id);
  if (dat) 
  {
    let p = await aa.db.get_p(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (!has_pub) 
    {
      by.prepend(aa.mk.p_link(p.xpub));
      aa.fx.color(p.xpub,quote);
    }
    by.append(aa.mk.nostr_link(aa.fx.encode('note',o.id)));
    content = aa.parse.content(dat.event.content,aa.is.trusted(p.score));
    quote_classes.push('parsed');
    aa.get.pubs([['p',dat.event.pubkey]]);
  }
  else
  {
    quote_classes.push('blank_quote');
    if (!has_pub) by.prepend(aa.mk.l('span',{con:'?'}));
    content = aa.mk.l('p',{cla:'paragraph'});
    
    // let req = {ids:[o.id]};
    let relays = [];
    if (o.relays?.length) 
    {
      content.append(`\nrelays: ${o.relays}`);
      relays = o.relays
    }
    let relay = relays.length?relays[0]:'read';
    aa.e.miss_e(o.id,relays);
    let command = aa.q.def.id+' req';
    let filter = '{"ids":["'+o.id+'"]}';
    by.append(aa.mk.butt_action(`${command} ${relay} ${filter}`,'req'));
  }
  quote.append(content)
  quote.classList.add(...quote_classes);
};


// update blank quotes
aa.e.quote_a_upd =async(quote,o)=>
{
  let id = o.id_a;
  let pub = o.pubkey;
  let p = await aa.db.get_p(pub);
  if (!p) p = aa.p.p(pub);

  let by = aa.mk.l('p',{cla:'note_quote_by'});
  quote.append(by);
  by.append(aa.mk.p_link(pub));
  aa.fx.color(pub,quote);

  let a_note = document.querySelector('.note[data-id_a="'+id+'"]');
  let content = new DocumentFragment();
  let quote_classes = [];
  if (a_note) 
  {    
    by.append(aa.mk.nostr_link(a_note.id)); 
    let og_content = a_note.querySelector('.content');
    if (og_content) 
    {
      let new_content = og_content.cloneNode(true);
      for (const c of new_content.childNodes) content.append(c);
      quote_classes.push('parsed');
    }
  }
  else
  {
    quote_classes.push('blank_quote');
    content = aa.mk.l('p',{cla:'paragraph'});
    
    // let req = {ids:[o.id]};
    let relays = [];
    if (o.relays?.length) 
    {
      content.append(`\nrelays: ${o.relays}`);
      relays = o.relays
    }
    aa.e.miss_a(id,relays);
    // setTimeout(()=>
    // {
    //   aa.r.demand(['REQ','a_'+Date.now(),
    //   {
    //     kinds:[o.kind],
    //     authors:[o.pubkey],
    //     '#d':[o.identifier]
    //   }],relays,{eose:'close'})
    // },100)
  }
  quote.append(content)
  quote.classList.add(...quote_classes);
};


// gets all blank quotes and replaces with actual data
aa.e.quotes_to =async q_id=>
{
  let ids = [...new Set(aa.temp[q_id])];
  aa.temp[q_id] = [];
  
  for (const id of ids)
  { 

    let selector = '.blank_quote[data-id="'+id+'"]';
    let quotes = document.querySelector(selector);
    if (quotes) quotes = document.querySelectorAll(selector);
    if (quotes?.length)
    {
      let dat = await aa.db.get_e(id);
      if (!dat) dat = {event:{"id":id}};
      // let quote = aa.e.quote(dat.event);
      setTimeout(()=>{ for(const q of quotes) q.replaceWith(aa.e.quote(dat.event))},100);
    }
    else 
    {
      selector = '.blank_quote[data-id_a="'+id+'"]';
      quotes = document.querySelector(selector);
      if (quotes) quotes = document.querySelectorAll(selector);
      if (quotes?.length)
      {
        // let dat = await aa.db.get_e(id);
        // if (!dat) dat = {event:{"id":id}};
        let a = id.split(':');
        let dis = {kind:a[0],pubkey:a[1],identifier:a[2],id_a:id};
        // let quote = aa.e.quote_a(dis);
        setTimeout(()=>{ for(const q of quotes) q.replaceWith(aa.e.quote_a(dis))},100);
      }
    }
  }
};


aa.get.quotes =async id=>
{
  const q_id = 'get_quotes';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.temp[q_id].push(id);
  aa.to(aa.e.quotes_to,200,q_id);
};


aa.e.json =async(s='')=>
{
  let dat = await aa.db.get_e(s);
  if (dat) return JSON.stringify(dat.event)
  else return 'event not found '+s
};


// stash orphan
aa.e.refs =(dat,note,tag)=>
{
  const id = tag[1];
  if (!aa.temp.refs[id]) aa.temp.refs[id] = {};
  if (!aa.temp.refs[id][dat.event.id]) 
  {
    aa.temp.refs[id][dat.event.id] = [dat,note,tag];
    aa.temp.orphan[dat.event.id] = id;
  }
};


// updates blank note
aa.e.reply_blank =(note,reply,reply_tag)=>
{
  reply.querySelector('.replies').setAttribute('open','');
  aa.fx.merge_datasets(['seen','subs'],note,reply);
  if (reply_tag[2])
  {
    let relay = aa.is.url(reply_tag[2]);
    if (relay)
    {
      let a = reply.dataset.r ? reply.dataset.r.trim().split(' ') : [];
      aa.fx.a_add(a,[relay]);
      reply.dataset.r = a.join(' ');
    }
  }
};


// search notes content for value
aa.e.search =async s=>
{
  s = s.toLowerCase();
  let contents = document.getElementsByClassName('content');
  for (const con of contents)
  {
    let text = con.textContent.toLowerCase();
    let has = text.search(s);
    if (has !== -1) aa.log(aa.mk.nostr_link(con.parentElement.id))
  }
};


// mutation observer for notes section
aa.e.section_mutated =a=> 
{
  for (const mutation of a) 
  {
    // const section = mutation.target.closest('section');
    // aa.fx.count_upd(document.getElementById('butt_e'));
    // let butt = section.querySelector('section > header > .butt');
    // // aa.fx.data_count(butt,'.note');
    aa.e.root_count = mutation.target.childNodes.length;
    const needs = aa.e.root_count > parseInt(localStorage.pagination||0);
    if (needs && !aa.l.classList.contains('needs_pagin')) 
    {
      aa.l.classList.add('needs_pagin')
    }
    else if (!needs && aa.l.classList.contains('needs_pagin')) 
    {
      aa.l.classList.remove('needs_pagin')
    }
  }
};
aa.e.section_observer = new MutationObserver(aa.e.section_mutated);


// update elapsed time of note and parents up to root
aa.clk.time =e=> 
{
  if (!e.target) return;
  const all = e.target.closest('.root')?.querySelectorAll('time');
  if (all) for (const t of all)
  {
    const timestamp = parseInt(t.textContent);
    const date = aa.t.to_date(timestamp);
    t.dataset.elapsed = aa.t.elapsed(date);
  }
};


// toggle tiny note 
aa.clk.tiny =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
  const is_tiny = note.classList.contains('tiny');
  if (is_tiny) sessionStorage[note.dataset.id] = 'tiny';
  else sessionStorage[note.dataset.id] = '';
  aa.fx.scroll(note,{behavior:'smooth',block:is_tiny?'start':'center'});
};


// update note path when appending
aa.e.upd_note_path =(l,stamp,is_u=false)=> 
{
  let root;
  let updated;
  let og;
  let levels = 0;

  for (; l && l !== document; l = l.parentNode ) 
  {
    if (l.classList.contains('note')) 
    {
      if (!levels) og = l;
      levels++;
      updated = false;
      root = l;
      if (l.dataset.stamp < stamp && !is_u)
      {
        l.dataset.stamp = stamp;
        updated = true;
      }
      let haz_new = l.querySelector('.note.is_new');
      if (haz_new) l.classList.add('haz_new');
      aa.clk.time({target:l.querySelector('.by .created_at')});
      const replies = l.querySelector('.replies');
      const some = replies.childNodes.length - 1;
      const all = l.querySelectorAll('.note').length;
      const summary = replies.querySelector('summary');
      const sum_butt = summary.querySelector('.mark_read');
      if (summary && some > 0) sum_butt.textContent = some+(all>some?'.'+all:'')
    }
	}
  if (root && updated) aa.e.append_to_notes(root);
  if (og) og.dataset.level = levels;
}


// view event
aa.e.view =l=>
{
  aa.fx.path(l);
  if (l.classList.contains('not_yet')) aa.e.note_intersect(l);
  aa.l.classList.add('viewing','view_e');
  l.classList.add('in_view');
  aa.clk.time({target:l.querySelector('.by .created_at')});
  aa.fx.scroll(l);
};


// plain note
aa.kinds[1] =dat=>
{
  let note = aa.e.note(dat);
  aa.get.pubs(dat.event.tags);
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    let score = p ? p.score : 0;
    aa.parse.context(note,dat.event,aa.is.trusted(score));
  });
  aa.e.append_to(dat,note,aa.get.reply_tag(dat.event.tags));
  return note
};


// repost of kind-1 note
aa.kinds[6] =dat=>
{
  let note = aa.e.note(dat);
  note.classList.add('tiny'); // 'is_new',
  let reply_tag = aa.get.last_e_tag(dat.event.tags);
  if (reply_tag && reply_tag.length)
  {    
    let repost_id = reply_tag[1];
    if (repost_id) 
    {
      aa.db.get_e(repost_id).then(dat_e=>
      {
        if (!dat_e) 
        {
          let repost = aa.parse.j(dat.event.content);
          if (repost) aa.r.message_type.event({data:['EVENT','k6',repost],origin:dat.seen[0]});
        }
        else aa.e.to_printer(dat_e);//aa.e.print(dat_e);
      });
      
    }
    aa.e.append_check(dat,note,reply_tag);
  }
  else aa.e.append_to_notes(note);
  aa.get.pubs(dat.event.tags);
  return note
};


// reaction
aa.kinds[7] =dat=>
{
  let note = aa.e.note(dat);
  // if (!sessionStorage[dat.event.id]) note.classList.add('is_new');
  // let reply_tag = aa.get.last_e_tag(dat.event.tags);
  // if (reply_tag && reply_tag.length) aa.e.append_check(dat,note,reply_tag);
  // else aa.e.append_to_notes(note);
  aa.get.pubs(dat.event.tags);
  note.classList.add('tiny');
  let content = note.querySelector('.content');
  // let con_t = content.textContent;

  let emoji = dat.event.tags.filter(t=>t[0]==='emoji')[0];
  if (emoji) 
  {
    emoji = aa.is.url(emoji[2])?.href;
    if (emoji) 
    {
      aa.db.get_p(dat.event.pubkey).then(p=>
      {
        if (p && aa.is.trust_x(dat.event.pubkey))
        {
          content.textContent = '';
          content.append(aa.mk.img(emoji));
        }
      });
    }
  }

  // setTimeout(()=>
  // {
    let reply_tag = aa.get.last_e_tag(dat.event.tags);
    if (!reply_tag) reply_tag = aa.get.reply_tag(dat.event.tags);
    if (reply_tag && reply_tag.length) aa.e.append_check(dat,note,reply_tag);
    else aa.e.append_to_notes(note);
  // },0)
  
  return note
};


// repost of generic note
aa.kinds[16] = aa.kinds[6];

// zap template
aa.kinds[9735] = aa.kinds[1];

// highlight template
aa.kinds[9802] = aa.kinds[1];

// long-form template
aa.kinds[30023] =dat=>
{
  let note = aa.e.note_pre(dat);
  aa.get.pubs(dat.event.tags);
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    let score = p ? p.score : 0;
    aa.parse.context(note,dat.event,aa.is.trusted(score));
  });
  aa.e.append_to_notes(note);
  return note
};


// image template
aa.kinds[20] =dat=>
{
  aa.get.pubs(dat.event.tags);
  let note = aa.e.note(dat);
  aa.db.get_p(dat.event.pubkey)
  .then(p=>
  {
    let score = p ? p.score : 0;
    aa.parse.context(note,dat.event,aa.is.trusted(score));
    let url;
    let tag = dat.event.tags.filter(t=>t[0] === 'url')[0];
    if (!tag || tag.length < 2) 
    {
      tag = dat.event.tags.filter(t=>t[0] === 'imeta')[0];
      if (tag)
      {
        let imeta = aa.fx.a_o(tag);
        url = aa.is.url(imeta.url)?.href;
      }
    }
    else url = aa.is.url(tag[1])?.href;

    if (url)
    {
      let l;
      if (aa.is.trusted(score)) l = aa.mk.img(url);
      else l = aa.mk.link(url);
      note.querySelector('.content')
      .prepend(aa.mk.l('p',{cla:'paragraph',app:l}));
    }
    
  });
  aa.e.append_to_notes(note);
  return note
};


// video template
aa.kinds[1063] =dat=>
{
  let note = aa.e.note(dat);

  aa.get.pubs(dat.event.tags);
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    let score = p ? p.score : 0;
    let url = dat.event.tags.filter(t=>t[0] === 'url')[0];
    let vid_url = aa.is.url(url[1])?.href;
    
    if (vid_url)
    {
      let vid;
      if (aa.is.trusted(score))
      {
        vid = aa.mk.av(vid_url);
      }
      else
      {
        vid = aa.mk.link(vid_url);
      }
      note.querySelector('.content')
      .prepend(aa.mk.l('p',{cla:'paragraph',app:vid}));
    }    
  });
  aa.e.append_to_notes(note);
  return note
};


aa.kinds[34235] =dat=>
{
  let note = aa.e.note_pre(dat);

  aa.get.pubs(dat.event.tags);
  aa.db.get_p(dat.event.pubkey).then(p=>
  {
    let score = p ? p.score : 0;
    let url = dat.event.tags.filter(t=>t[0] === 'url')[0];
    let vid_url = aa.is.url(url[1])?.href;
    
    if (vid_url)
    {
      let vid;
      if (aa.is.trusted(score))
      {
        vid = aa.mk.av(vid_url);
      }
      else
      {
        vid = aa.mk.link(vid_url);
      }
      note.querySelector('.content')
      .prepend(aa.mk.l('p',{cla:'paragraph',app:vid}));
    }    
  });
  aa.e.append_to_notes(note);
  return note
};



aa.views.note1 =async nid=>
{
  aa.viewing = nid;
  let l = document.getElementById(nid);
  if (l && !l.classList.contains('blank')) aa.e.view(l);
  else
  {
    let x = aa.fx.decode(nid);
    let dat = await aa.db.get_e(x);
    if (dat) aa.e.to_printer(dat); //aa.e.print(dat);
    else 
    {
      let blank = aa.e.note({event:{id:x},clas:['blank','root']});
      aa.e.append_to_notes(blank);
      aa.e.miss_e(x);
      aa.get.missing('e');
      setTimeout(()=>{aa.e.view(blank)},500);
    }
  }
};

aa.views.naddr1 =async naddress=>
{
  let data = aa.fx.decode(naddress);
  console.log(data);
};

aa.views.nevent1 =async nevent=>
{
  let data = aa.fx.decode(nevent);
  if (data && data.id)
  {
    let nid = aa.fx.encode('note',data.id);
    let l = document.getElementById(nid);
    if (!l)
    {
      let dat = await aa.db.get_e(data.id);
      if (dat) aa.e.to_printer(dat); //aa.e.print(dat);
      else 
      {
        dat = 
        {
          event:{id:data.id,created_at:aa.t.now - 10},
          seen:[aa.fx.in_set(aa.r.o.ls,aa.r.o.r)],subs:[],clas:[]
        };

        if (data.author) dat.event.pubkey = data.author;
        if (data.kind) dat.event.kind = data.kind;
        if (data.relays)
        {
          for (let url of data.relays)
          {
            url = aa.is.url(url);
            if (url) aa.fx.a_add(dat.seen,[url.href]);
          }
        }
        // console.log(dat);
        let blank = aa.e.note(dat);
        blank.classList.add('blank');
        aa.e.append_to_notes(blank);
        aa.r.demand(['REQ','ids',{ids:[dat.event.id]}],dat.seen,{eose:'done'});
      }
    }
    else 
    {
      aa.state.replace(nid);
      aa.state.resolve(history.state.view);
    }
  }
};


// returns a relay that has event x or empty string
aa.get.seen =x=>
{
  const dat = aa.db.e[x];
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
};


// returns tags for building a reply
aa.get.tags_for_reply =event=>
{  
  // wip... needs to account for "a" tag
  const tags = [];
  const seen = aa.get.seen(event.id);
  let tag = aa.get.root_tag(event.tags);
  if (tag) 
  {
    let root = aa.db.e[tag[1]].event;
    tag[2] = aa.is.url(tag[2])?.href || seen;
    tag[3] = 'root';
    if (root) tag[4] = root.pubkey
    tag.splice(4);
    tags.push(tag);
    if (root && aa.fx.kind_type(event.kind) !== 'parameterized') 
    {
      tags.push(['K',''+root.kind]);
    }
    tags.push(['e',event.id,seen,'reply',event.pubkey],['k',''+event.kind]);
  }
  else 
  {
    if (aa.fx.kind_type(event.kind) === 'parameterized')
    {
      let tag_a = aa.fx.tag.a(event);
      if (tag_a) 
      {
        tag_a.push(seen,'root');
        tags.push(tag_a);
      }
    }
    tags.push(['e',event.id,seen,'root',event.pubkey],['K',''+event.kind]);
  }
  

  const p_tags = event.tags.filter(t=>aa.is.tag.p(t) && t[1] !== aa.u.p.xpub);
  let dis_p_tags = [...new Set(p_tags)];
  if (event.pubkey !== aa.u.p.xpub 
  && !dis_p_tags.some(t=>t[1] === event.pubkey)) dis_p_tags.push(['p',event.pubkey]);
  // needs to do more here...
  tags.push(...dis_p_tags);
  return tags
};


// gets e tag marked 'reply' or the last not marked 'mention'
aa.get.reply_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='reply')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop();
  if (!tag) tag = tags.find(t=>t[0]==='a');
  if (tag) return tag;
  return false
};


// gets e tag marked 'root' or the first not marked 'mention'
aa.get.root_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='root')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention')[0];
  if (tag && aa.is.tag.e(tag)) return tag;
  return false
};


// gets last e tag
aa.get.last_e_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e').pop();
  if (tag && aa.is.tag.e(tag)) return tag;
  return false
};


// returns array of tags with all #hashtags in string
aa.get.hashtag =s=>
{
  const tags = [];
  const hashtags = s.match(aa.regex.hashtag);
  if (hashtags) for (const h of hashtags) tags.push(['t',h.slice(1).toLowerCase()])
  return tags
};


// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
aa.get.mentions =async s=>
{
  const mentions = [];
  const matches = [...s.matchAll(aa.regex.nostr)];
  for (const m of matches)
  {
    let dis = m[0].slice(6);
    if (dis.startsWith('npub')) 
    {
      let p_x = aa.fx.decode(dis);
      if (p_x) mentions.push(aa.fx.tag.p(p_x));
    }
    else if (dis.startsWith('note'))
    {
      const e_x = aa.fx.decode(dis);
      if (e_x) 
      {
        mentions.push(aa.fx.tag.q(e_x));
        let dat = await aa.db.get_e(e_x);
        if (dat && dat.event.pubkey !== aa.u.p.xpub) mentions.push(aa.fx.tag.p(dat.event.pubkey));
      }
    }
  }
  return mentions
};


// returns event if already loaded or get it from database
aa.db.get_e =async xid=>
{
  if (aa.db.e[xid]) return aa.db.e[xid];  
  let dat = await aa.db.idb.ops({get:{store:'events',key:xid}});
  if (dat) aa.db.e[xid] = dat;
  return dat
};


// returns event if already loaded or get it from database
aa.db.get_a =async id_a=>
{
  const [kind,pubkey,ds] = id_a.split(':');
  let p = await aa.db.get_p(pubkey);

  let id;
  try
  {
    id = p.events['k'+kind][ds][0][0];
  } 
  catch(er)
  {
    console.log('no id from '+id_a);
  }
  if (id)
  {
    if (aa.db.e[id]) return aa.db.e[id];
    let dat = await aa.db.idb.ops({get:{store:'events',key:id}});
    if (dat) aa.db.e[id] = dat;
    return dat
  }
  return false
};


// merge event dat
aa.db.merge_e =dat=>
{
  const xid = dat.event.id;
  if (!aa.db.e[xid])
  {
    aa.db.e[xid] = dat;
    return dat;
  } 
  else 
  {
    const merged = aa.fx.merge(aa.db.e[xid],dat);
    if (merged) 
    {
      aa.db.e[xid] = merged;
      return merged
    }
    else return false
  }
};


// update event on database
aa.db.upd_e_to =()=>
{
  const q_id = 'upd_e';
  const q = Object.values(aa.temp[q_id]);
  aa.temp[q_id] = {};
  if (q.length) 
  {
    let chunks = aa.fx.chunks(q,444);
    let times = 0;
    for (const chunk of chunks)
    {
      setTimeout(()=>
      {
        aa.db.idb.worker.postMessage({put:{store:'events',a:chunk}});
      },times * 200);
      times++;
    }
  }
};
aa.db.upd_e =async dat=>
{
  const q_id = 'upd_e';
  if (!aa.temp[q_id]) aa.temp[q_id] = {};
  aa.temp[q_id][dat.event.id] = dat;
  aa.to(aa.db.upd_e_to,500,q_id);
};


// get n events from database
// default direction: newest
// other direction: oldest
aa.db.some =async s=>
{
  aa.cli.fuck_off();
  const a = s.trim().split(' ');
  const n = a.shift();
  const direction = a.shift();
  const db_op = {};
  db_op.n = n ? parseInt(n) : 1;
  db_op.direction = direction && direction === 'oldest' ? 'next' : 'prev';
  let o = {some:db_op};
  aa.log(localStorage.ns+' db some '+db_op.n);

  const events = await aa.db.get('idb',o);
  for (const dat of events) aa.e.to_printer(dat); //aa.e.print(dat);
};


window.addEventListener('load',aa.e.load);