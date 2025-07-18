/*

alphaama
mod    e
events notes

*/

aa.e = 
{
  name:'events',
  def:{id:'e'},
  scripts:
  [
    '/e/clk.js',
    '/e/db.js',
    '/e/fx.js',
    '/e/get.js',
    '/e/is.js',
    '/e/kinds.js',
    '/e/mk.js',
    '/e/parse.js',
    '/e/views.js'
  ],
  styles:['/e/e.css'],
};


// buttons
aa.e.butts =
{
  na:[[localStorage.reaction,'react'],'req','bro','render','tiny'],
  // k4:['encrypt'],
  draft:['yolo','sign','pow','edit','cancel'],
  not_sent:['post','bro','cancel'],
  blank:['fetch']
};

// append stashed orphans from refs 
aa.e.append_from_refs =()=>
{
  for (const i in aa.temp.refs)
  {
    for (const e in aa.temp.refs[i]) aa.e.append_check(...e);
  }
};


// decides where to append a note
aa.e.append_to =async(dat,note,tag)=>
{
  if (tag?.length) aa.e.append_check(dat,note,tag);
  else aa.e.append_as_root(note);
};


// append note to notes section
aa.e.append_as_root =l=>
{
  if (!l.classList.contains('rendered'))
  {
    l.querySelector('.replies').removeAttribute('open');
    l.classList.add('root','not_yet');
  }

  if (!l.parentElement) aa.e.note_observer.observe(l);
  
  const notes = aa.e.l;
  let previous = [...notes.children]
  .find(i=>l.dataset.stamp > i.dataset.stamp)||null;
  
  if (l.classList.contains('blank')) notes.append(l);
  else notes.insertBefore(l,previous);

  aa.e.view_check(l);
};


// append note to another note as reply
aa.e.append_as_rep =(note,rep)=>
{
  const previous = [...rep.children]
  .find(i=>i.tagName==='ARTICLE' 
    && i.dataset.created_at > note.dataset.created_at)||null;

  // fastdom.mutate(()=>
  // {
    note.classList.add('reply','not_yet');
    note.classList.remove('root');
    if (!sessionStorage[note.dataset.id]) 
    {
      note.classList.add('is_new');
      rep.parentNode.classList.add('haz_new_reply');
    }
    
    if (note.classList.contains('in_path')) 
      rep.parentNode.classList.add('in_path');

    rep.insertBefore(note,previous);
    rep.parentNode.classList.add('haz_reply');
    aa.e.upd_note_path(rep,note.dataset.stamp,aa.is.u(note.dataset.pubkey));
    aa.e.note_observer.observe(note);
    // aa.get.note_refs(note);
  // });
  if (history.state?.view === '#'+note.id) setTimeout(()=>{aa.e.view(note)},1000);
};


// decides where to append a reply
aa.e.append_check =(dat,note,tag)=>
{
  const reply_id = tag[1];
  let p = aa.db.p[dat.event.pubkey];
  let relays = aa.fx.in_set(p?.relays,'write');
  let reply;

  if (tag[0] === 'a')
  {
    reply = aa.temp.printed.find(i=>i.dataset.id_a === reply_id);
    if (!reply)
    {
      aa.e.orphan(dat,note,tag);
      aa.e.miss_print_a(tag,relays);
    }
    else 
    {
      aa.e.append_as_rep(note,reply.querySelector('.replies'));
      if (note.classList.contains('orphan')) note.classList.remove('orphan');
    }
    return;
  }
  
  reply = aa.temp.printed.find(i=>i.dataset.id === reply_id);
  
  if (!reply)
  {
    aa.e.orphan(dat,note,tag);
    // let tag_root = aa.get.tag_root(dat.event.tags);
    // if (tag_root && tag_root[1] !== reply_id)
    // {
    //   let root = aa.temp.printed.find(i=>i.dataset.id === tag_root[1]);
    //   if (!root) aa.e.miss_print(tag_root);
    // }
    aa.e.miss_print(tag,relays);
    setTimeout(()=>{aa.e.append_as_orphan(dat,note,reply_id)},6666)
  }
  else
  {
    aa.e.append_as_rep(note,reply.querySelector('.replies'));
    if (note.classList.contains('orphan')) note.classList.remove('orphan');
  }
};


// append a note comment
aa.e.append_as_comment =(dat,note)=>
{
  let tag = aa.get.tag_comment_reply(dat.event.tags);
  const reply_id = tag[1];
  let p = aa.db.p[dat.event.pubkey];
  let relays = aa.fx.in_set(p?.relays,'write');
  let reply;

  if (tag[0] === 'a')
  {
    reply = aa.temp.printed.find(i=>i.dataset.id_a === reply_id);
    if (!reply)
    {
      aa.e.orphan(dat,note,tag);
      aa.e.miss_print_a(tag,relays);
    }
    else aa.e.append_as_rep(note,reply.querySelector('.replies'));
    return;
  }
  
  reply = aa.temp.printed.find(i=>i.dataset.id === reply_id);
  
  if (!reply)
  {
    aa.e.orphan(dat,note,tag);
    aa.e.miss_print(tag,relays);
    setTimeout(()=>{aa.e.append_as_orphan(dat,note,reply_id)},6666)
  }
  else
  {
    aa.e.append_as_rep(note,reply.querySelector('.replies'));
  }
};


aa.e.append_as_orphan =(dat,note,reply_id)=>
{
  if (note.parentElement) return;
  let root;
  let tag_root = aa.get.tag_comment_root(dat.event.tags);
  if (tag_root && tag_root[1] !== reply_id)
  {
    let root_kind = tag_root[0];
    if (root_kind === 'e')
    {
      root = aa.temp.printed.find(i=>i.dataset.id === tag_root[1]);
      if (!root) aa.e.miss_print(tag_root);
    }
    else if (root_kind === 'a')
    {
      root = aa.temp.printed.find(i=>i.dataset.id_a === tag_root[1]);
      if (!root) aa.e.miss_print_a(tag_root);
    }
  }

  note.classList.add('orphan');
  if (root) aa.e.append_as_rep(note,root.querySelector('.replies'));
  else aa.e.append_as_root(note);
};


// clear notes from section
aa.e.clear =s=>
{
  fastdom.mutate(()=>
  {
    document.getElementById('notes').textContent = '';
    document.getElementById('butt_e').dataset.count = 0;
    aa.log('events cleared');
    aa.cli.fuck_off();
  });
};


// load event list from db into memory
aa.e.events =async a=>
{
  const a_to_get = [];
  for (const x of a) if (!aa.db.e[x]) a_to_get.push(x);
  if (a_to_get.length)
  {
    let stored = await aa.db.ops('idb',{get_a:{store:'events',a:a_to_get}});
    for (const dat of stored) aa.db.e[dat.event.id] = dat;
  }
};


aa.e.get =async(key)=>
{
  if (!aa.is.key(key)) return;
  if (aa.db.e[key]) return aa.db.e[key];
  let e = await aa.db.ops('idb',{get:{store:'events',key}});
  if (e) aa.db.e[key] = e;
  return e
};


// returns event raw json
aa.e.json =async(s='')=>
{
  let dat = await aa.db.get_e(s);
  if (dat) return JSON.stringify(dat.event)
  else return 'event not found '+s
};


// on load
aa.e.load =async()=>
{
  let mod = aa.e;
  let id = mod.def.id;
  await aa.mk.scripts(mod.scripts);

  aa.temp.orphan = {};
  aa.temp.print = {};
  aa.temp.printed = [];
  aa.temp.refs = {};

  aa.actions.push(
    {
      action:[id,'clear'],
      description:'clear events section',
      exe:mod.clear
    },
    {
      action:[id,'s'],
      required:['<value>'],
      description:'search notes content for value',
      exe:mod.search
    },
    {
      action:[id,'json'],
      required:['<id>'],
      description:'return event JSON by id (hex)',
      exe:mod.json
    },
    {
      action:[id,'view'],
      required:['<id>'],
      description:'view event by id (hex)',
      exe:(s)=>{ aa.view.state('#'+aa.fx.encode('note',s)) }
    },
  );
  mod.l = aa.mk.l('div',{id:'notes'});
  mod.section_observer = new MutationObserver(mod.section_mutated);
  mod.section_observer.observe(mod.l,{attributes:false,childList:true});
  aa.help_setup(aa.e,'/e/README.adoc');
};


// add event id to missing event list
aa.e.miss_e =(id,relays=[])=>
{
  if (!aa.is.x(id))
  {
    console.log(id);
    return
  }
  if (!aa.miss.e[id]) aa.miss.e[id] = {nope:[],relays:[]}
  aa.fx.a_add(relays,aa.fx.in_set(aa.r.o.ls,aa.r.o.r));
  aa.fx.a_add(aa.miss.e[id].relays,relays);
  // if (!aa.miss.e[xid]) aa.miss.e[xid] = {nope:[],relays:[]};
  // relays.push(...aa.fx.in_set(aa.r.o.ls,aa.r.o.r));
  // for (const rel of relays)
  // {
  //   const r = aa.is.url(rel);
  //   if (r && !aa.miss.e[xid].relays.includes(r.href)) aa.miss.e[xid].relays.push(r.href);
  // }
};


// add event id to missing event list
aa.e.miss_a =(id,relays=[])=>
{
  const [kind,pubkey,identifier] = aa.fx.split_ida(id);
  // let ur = aa.fx.in_set(aa.db.p[pubkey]?.relays,'write');
  relays.push(...aa.fx.in_set(aa.db.p[pubkey]?.relays,'write'));
  // let p = aa.db.p[pubkey];
  // let relays = aa.fx.in_set(p?.relays,'write');

  if (!aa.miss.a[id]) aa.miss.a[id] = {nope:[],relays:[]};
  relays.push(...aa.fx.in_set(aa.r.o.ls,aa.r.o.r));
  for (const rel of relays)
  {
    const r = aa.is.url(rel)?.href;
    if (r) aa.fx.a_add(aa.miss.a[id].relays,[r]);
  }
  aa.miss.a[id].relays = [...new Set(aa.miss.a[id].relays)]
};


// get event from tag and prints it,
// otherwise add to missing list
aa.e.miss_print =(tag,relays=[])=>
{
  const xid = tag[1];
  if (tag[2]) relays.push(tag[2]);

  if (!aa.temp.db_get_events) aa.temp.db_get_events = {};
  let dis = aa.temp.db_get_events[xid];
  if (!dis) dis = aa.temp.db_get_events[xid] = [];
  aa.fx.a_add(dis,relays);
  aa.fx.to(aa.e.miss_to,500,'db_get_events');

  // aa.db.get_e(xid).then(dat=>
  // {
  //   if (dat) aa.e.to_printer(dat);
  //   else aa.e.miss_e(xid,relays);
  // });
};


aa.e.miss_to =async()=>
{
  let ids = Object.keys(aa.temp.db_get_events);
  let events = await aa.db.events(ids);
  for (const dat of events)
  {
    let id = dat.event.id;
    ids = ids.filter(i=>i!==id);
    delete aa.temp.db_get_events[id];
    aa.e.to_printer(dat)
  }
  for (const id of ids) 
  {
    aa.e.miss_e(id,aa.temp.db_get_events[id]);
    delete aa.temp.db_get_events[id];
  }
};


// event missing in action
aa.e.mia =(tag,relays=[])=>
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





// note actions
aa.e.note_actions =dat=>
{ 
  const l = aa.mk.l('p',{cla:'actions expanded'});
  let a = [];
  if (dat.clas.includes('draft')) 
  {
    switch (dat.event.kind)
    {
      case 4: 
        if (!dat.clas.includes('encrypted'))
        {
          aa.fx.a_add(a,aa.e.butts.k4);
          break;
        }
      default: 
        aa.fx.a_add(a,aa.e.butts.draft);
    }
    l.setAttribute('open','')
  }
  else if (dat.clas.includes('not_sent')) aa.fx.a_add(a,aa.e.butts.not_sent);
  else if (dat.clas.includes('blank')) aa.fx.a_add(a,aa.e.butts.blank);
  else
  {
    aa.fx.a_add(a,[['…','na']]);
    l.classList.add('empty');
    l.classList.remove('expanded');
  }
  if (a.length) for (const s of a) l.append(aa.mk.butt_clk(s),' ');
  return l
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
    case 'parameterized': return aa.e.note_pre(dat);
    default: return aa.e.note_regular(dat);
  }
};


// regular note
aa.e.note_regular =dat=>
{
  let note = aa.mk.note(dat);
  aa.e.append_as_root(note);
  return note
};


// replaceable parameterized note
aa.e.note_pre =dat=>
{
  // console.log('pre',dat);
  let note = aa.mk.note(dat);

  let d_tag = dat.event.tags.filter(t=>t[0] === 'd')[0];
  if (d_tag?.length > 1) 
  {
    let ds = d_tag[1];
    let id_a = [dat.event.kind,dat.event.pubkey,ds].join(':');
    note.dataset.d = ds;
    note.dataset.id_a = id_a;
    let og = document.querySelector(`[data-id_a="${id_a}"]`);
    let versions = og?.querySelector('.versions');
    if (versions) 
    {
      if (og.dataset.created_at < dat.event.created_at)
      {
        aa.e.append_as_rep(note,og.parentElement);
        note.append(versions);
        versions.append(og);
      }
      else aa.e.append_as_rep(note,versions);
    }
    else 
    {
      let details = aa.mk.details('versions',false,true);
      details.classList.add('versions');
      note.append(details);
      aa.e.append_as_root(note);
    }
  }
  return note
};


// get all note refs stashed and append them to note
aa.e.note_refs =id=>
{
  let refs = aa.temp.refs[id];
  if (!refs) return;
  for (const i in refs) aa.e.append_check(...refs[i]);
  delete refs;
  if (id in aa.temp.orphan) delete aa.temp.orphan[id];
};


// note replace
aa.e.note_replace =(l,dat)=>
{
  console.log('note replaced');
  dat.clas = aa.fx.a_rm(dat.clas,['draft']);
  let note = aa.e.note_by_kind(dat);
  // l.id = 'temp-'+dat.event.id;
  let note_replies = note.querySelector('.replies');
  // let l_rep = l.querySelector('.replies');
  let childs = l.querySelector('.replies').childNodes;
  let in_path;
  if (childs.length)
  {
    for (const c of childs) 
    {
      if (c.tagName === 'ARTICLE')
      {
        aa.e.append_as_rep(c,note_replies);
        if (c.classList.contains('in_path')) in_path = true;
      }
    }
  }
  let is_root = note.classList.contains('root');
  let is_reply = note.classList.contains('reply');
  note.className = l.className;
  aa.temp.printed = aa.temp.printed.filter(i=>i.dataset.id!==dat.event.id);
  l.remove();
  aa.temp.printed.push(note);
  note.classList.remove('blank','tiny','draft','not_sent');
  if (in_path) note.classList.add('in_path');
  if (!sessionStorage.getItem(dat.event.id)) note.classList.add('is_new');
  else note.classList.remove('is_new');
  if (dat.clas) note.classList.add(...dat.clas);
  if (!is_root && note.parentElement?.closest('.note')) 
  {
    note.classList.remove('root','not_yet');
  }
  else if (is_root) note.classList.add('root');
  if (!is_reply && !note.parentElement?.closest('.note')) note.classList.remove('reply');
  else if (is_reply) note.classList.add('reply');
  note.classList.add('replaced');
  if (note.classList.contains('not_yet')) 
  {
    note_replies.removeAttribute('open');
    aa.e.note_observer.observe(b);
  }
  aa.e.render(note);
  return note
};


// remove note
aa.e.note_rm =note=>
{
  if (aa.view.active === note.id) aa.view.clear()
  delete aa.db.e[note.dataset.id];
  note.remove();
  aa.fx.count_upd(document.getElementById('butt_e'),false);
};


// on observed note intersection
aa.e.note_intersect =l=>
{
  if (!l.classList.contains('rendered'))
  {
    l.classList.remove('not_yet');
    l.classList.add('rendered');
    l.querySelector('.replies').setAttribute('open','');
    aa.e.note_observer.unobserve(l);
  }
};


// create note intersection observer
aa.e.note_observer = new IntersectionObserver(a=>
{
  for (const b of a)
  {
    if (b.isIntersecting) 
    {
      aa.e.note_intersect(b.target);
      // b.target.classList.add('in_viewport');
    }
    // else b.target.classList.remove('in_viewport');
  }
},{root:null,threshold:.9});


// stash orphan
aa.e.orphan =(dat,note,tag)=>
{
  const id = tag[1];//.split(':').join('_');
  if (!aa.temp.refs[id]) aa.temp.refs[id] = {};
  if (!aa.temp.refs[id][dat.event.id])
  {
    aa.temp.refs[id][dat.event.id] = [dat,note,tag];
    aa.temp.orphan[dat.event.id] = id;
  }
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
  aa.fx.to(aa.e.printer,0,'printer');
};


// printer queue handler
aa.e.printer =()=>
{
  let to_print = Object.values(aa.temp.print);
  aa.temp.print = {};
  to_print.sort(aa.fx.sorts.ca_asc);

  for (const dat of to_print) setTimeout(()=>{aa.e.print(dat)},0);
  aa.fx.to(()=>
  {
    aa.get.missing('p');
    aa.get.missing('e');
    aa.get.missing('a');
  },420,'missing')
  // setTimeout(()=>
  // {
  //   aa.get.missing('p');
  //   aa.get.missing('e');
  //   aa.get.missing('a');
  // },500);
};


// print event
aa.e.print =dat=>
{
  // console.log(dat);
  const id = dat.event.id;
  if (!aa.db.e[id]) aa.db.e[id] = dat;
  if (aa.temp.orphan[id]) return;
  
  let id_a = dat.id_a?.length ? dat.id_a : id;
  let l = aa.temp.printed.find(i=>i.dataset.id === id);
  if (!l)
  {
    aa.fx.count_upd(document.getElementById('butt_e'));
    l = aa.e.note_by_kind(dat);
    aa.temp.printed.push(l);
    aa.get.note_refs(l);
    // setTimeout(()=>{aa.e.render(l)},0);
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
      }
    }
  }
  else
  {
    if (l.classList.contains('blank') 
    || l.classList.contains('draft')) 
    {
      l = aa.e.note_replace(l,dat);
    }
    else
    {
      let seen = dat.seen.join(' ');
      let subs = dat.subs.join(' ');
      if (l.dataset.seen !== seen) l.dataset.seen = seen;
      if (l.dataset.subs !== subs) l.dataset.subs = subs;
    }
  }

  
  if (dat.clas.includes('miss')) dat.clas = aa.fx.a_rm(dat.clas,['miss']);
   //.split(':').join('_')
  setTimeout(()=>{aa.get.quotes(id_a)},200);
  // if (l && history.state?.view === '#'+nid) setTimeout(()=>{aa.e.view(l)},1000);
};


// quote event
aa.e.quote =o=>
{
  if (!o.id) return false;
  const quote = aa.mk.l('blockquote',{cla:'note_quote'});
  if (o.dis) quote.cite = o.dis;
  quote.dataset.id = o.id;
  let by = aa.mk.l('p',{cla:'note_quote_by'});
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
  setTimeout(()=>{aa.e.quote_upd(quote,o)},0);
  return quote
};

// quote PRE event
aa.e.quote_a =o=>
{
  const quote = aa.mk.l('blockquote',{cla:'note_quote'});
  quote.dataset.id_a = o.id_a;
  setTimeout(()=>{aa.e.quote_a_upd(quote,o)},0);
  return quote
};


// update blank quotes
aa.e.quote_a_upd =async(quote,o)=>
{
  let id = o.id_a;
  let pub = o.pubkey;
  let p = await aa.p.get(pub);
  if (!p) p = aa.p.p(pub);

  let by = aa.mk.l('p',{cla:'note_quote_by'});
  quote.append(by);
  by.append(aa.mk.p_link(pub));
  aa.fx.color(pub,quote);

  let a_note = aa.temp.printed.find(i=>i.dataset.id_a === o.id_a);
  // let a_note = document.querySelector('.note[data-id_a="'+o.id_a+'"]');
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
    if (!aa.temp.note_quotes) aa.temp.note_quotes = {};
    if (!aa.temp.note_quotes[id]) aa.temp.note_quotes[id] = [];
    aa.temp.note_quotes[id].push(quote);
    quote_classes.push('blank_quote');
    content = aa.mk.l('p',{cla:'paragraph'});
    
    // let req = {ids:[o.id]};
    let relays = [];
    if (o.relays?.length) 
    {
      content.append(`\nrelays: ${o.relays}`);
      relays = o.relays
    }
    aa.e.miss_a(o.id_a,relays);
  }
  quote.append(content)
  quote.classList.add(...quote_classes);
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
    let p = await aa.p.get(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (!has_pub) 
    {
      by.prepend(aa.mk.p_link(p.pubkey));
      aa.fx.color(p.pubkey,quote);
    }
    by.append(aa.mk.nostr_link(aa.fx.encode('note',o.id)));
    aa.e.render(quote,dat);
    // content = aa.parse.content(dat.event.content,aa.is.trusted(p.score));
    quote_classes.push('parsed');
    aa.p.from_tags([['p',dat.event.pubkey]]);
  }
  else
  {
    if (!aa.temp.note_quotes) aa.temp.note_quotes = {};
    if (!aa.temp.note_quotes[o.id]) aa.temp.note_quotes[o.id] = [];
    aa.temp.note_quotes[o.id].push(quote);
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
    let filter = '{"ids":["'+o.id+'"],"eose":"close"}';
    by.append(aa.mk.butt_action(`${command} ${relay} ${filter}`,'req'));
  }
  if (content) quote.append(content)
  quote.classList.add(...quote_classes);
};


// gets all blank quotes and replaces with actual data
aa.e.quotes_to =async q_id=>
{
  let ids = [...new Set(aa.temp[q_id])];
  aa.temp[q_id] = [];
  for (const id of ids)
  {
    if (!aa.temp.note_quotes?.hasOwnProperty(id)) continue;
    let quotes = aa.temp.note_quotes[id];
    if (!quotes?.length) continue;
    if (aa.is.key(id))
    {
      let dat = await aa.db.get_e(id);
      if (dat)
      {
        delete aa.temp.note_quotes[id];
        setTimeout(()=>{for(const q of quotes) q.replaceWith(aa.e.quote(dat.event))},10);
      }
    }
    else
    {
      let [kind,pubkey,identifier] = aa.fx.split_ida(id);
      let dis = {kind,pubkey,identifier,id_a:id};
      setTimeout(()=>{ for(const q of quotes) q.replaceWith(aa.e.quote_a(dis))},10);
    }
  }
};


// render event type kinds
aa.e.rnd =
{
  content:[1,11,1111,30023],
  emojii:[7],
  encrypted:[4],
  highlight:[9802],
  image:[20],
  object:[0],
  video:[21,22,1063,34235,34236],
};


// do additional ui enhancements  to event element
// based on kind
aa.e.render =async(l,options)=>
{
  let dat = aa.db.e[l?.dataset.id];
  if (!dat) return;
  if (l.classList.contains('e_render'))
  {
    fastdom.mutate(()=>
    {
      l.classList.remove('e_render');
      let content = l.querySelector('.content');
      content.textContent = dat.event.content;
    })
  }
  else
  {
    let times = 0;
    for (const key in aa.e.rnd)
    {
      if (aa.e.rnd[key].includes(dat.event.kind))
      {
        times++;
        let fid = 'render_'+key;
        if (aa.e.hasOwnProperty(fid)) aa.e[fid](l,dat,options);
      }
    }
    fastdom.mutate(()=>
    {
      if (!times && !dat.event.content.trim().length)
      {
        l.classList.add('no_content');
        l.querySelector('.tags_wrapper')?.toggleAttribute('open',true);
      }
      l.classList.add('e_render');
    })
  }
};


// render content as rich text
aa.e.render_content =async(note,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.is.trusted(o.trust||p?.score);
  aa.parse.context(note,dat.event,is_trusted);
};


// render content as rich text
aa.e.render_emojii =async(note,dat)=>
{
  // let p = await aa.p.author(dat.event.pubkey);
  aa.parse.emojii(note,dat.event);
};


// render content encrypted cyphertext
aa.e.render_encrypted =async(l,dat)=>
{
  let content = l.querySelector('.content');
  if (!content) return;

  content.classList.add('encrypted');
  content.querySelector('.paragraph').classList.add('cypher');
  if (!dat.clas.includes('draft'))
  {
    l.querySelector('.actions .butt.react')?.remove();
    l.querySelector('.actions .butt.req')?.remove();
  }
  let p_x = aa.fx.tag_value(dat.event.tags,'p') || dat.event.pubkey;
  if (aa.u.o.ls.pubkey === p_x)
  {
    l.classList.add('for_u');
    content.append(aa.mk.butt_action('e decrypt '+dat.event.id,'decrypt','decrypt'));
  }
  return p_x
};


// render content as rich text
aa.e.render_highlight =async(note,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.is.trusted(o.trust||p?.score);
  
    // highlighted stuff
  let h_s = dat.event.tags.find(i=>i[0]==='a');
  if (!h_s) h_s = dat.event.tags.find(i=>i[0]==='e');
  if (!h_s) h_s = dat.event.tags.find(i=>i[0]==='r');
  let source = aa.mk.l('p',{con:'source ',cla:'source'});
  // let from = aa.mk.details('source');
  // from.classList.add('base');
  if (h_s)
  {
    let app;
    // con += h_s[0]
    switch(h_s[0])
    {
      case 'a':
        let [kind,pubkey,identifier] = aa.fx.split_ida(h_s[1]);
        let data = {kind,pubkey,identifier};
        let relay = aa.is.url(h_s[2])?.href;
        if (relay) data.relays = [relay];
        let naddr = aa.fx.encode('naddr',data);
        // let l = aa.mk.l('p');
        // l.append(aa.mk.nostr_link(naddr));
        // for (const key in data) l.append(`\n${key} ${data[key]}`);
        // l.append('\n',naddr);
        // from.append(l)
        // let p_hi = await aa.p.author(pubkey);
        source.append(aa.mk.nostr_link(naddr));
        let source_p = await aa.p.author(pubkey);//aa.db.p[event.pubkey]
        let name = aa.p.author_name(source_p);
        source.append(` from ${name}`);
        break;
      case 'e':
        let event_id = h_s[1];
        // app = aa.mk.nostr_link(aa.fx.encode('note',h_s[1]));
        // from.append(aa.mk.l('p',{app}));
        source.append(aa.mk.nostr_link(aa.fx.encode('note',event_id)));
        let dat = await aa.db.get_e(event_id);
        if (dat)
        {
          let source_p = await aa.p.author(dat.event.pubkey);//aa.db.p[event.pubkey]
          let name = aa.p.author_name(source_p);
          source.append(` from ${name}`);
        }
        
        break;
      case 'r':
        // app = aa.mk.link(h_s[1])
        // from.append(aa.mk.l('p',{app}));
        source.append(aa.mk.link(h_s[1]));
        break;
    }
  }

  let comment = aa.fx.tag_value(dat.event.tags,'comment');
  if (comment) comment = aa.parse.content(comment,is_trusted);
  let highlight = aa.mk.l('div',{cla:'highlight',app:aa.parse.content(dat.event.content,is_trusted)});
  if (highlight.childNodes.length) 
  {
    fastdom.mutate(()=>
    {
      let note_content = note.querySelector('.content');
      if (!note_content) 
      {
        note_content = note;
        // console.trace('no content',note,dat);
        // note_content = note;
      }
      else
      {
        // console.log('fine');
        
        note_content.textContent = '';
      }
      note_content.classList.add('parsed');
      note_content.append(highlight,source);
      if (comment) note_content.insertBefore(comment,highlight);
    });
  }
};


// renders image from tags
aa.e.render_image =async(l,dat)=>
{
  let p = await aa.p.get(dat.event.pubkey);
  let trusted = aa.is.trusted(p?.score||0);
  aa.parse.context(l,dat.event,trusted);
  let url = aa.fx.url_from_tags(dat.event.tags);
  if (url)
  {
    let img = trusted?aa.mk.img(url):aa.mk.link(url);
    img = aa.mk.l('p',{cla:'paragraph',app:img})
    let content = l.querySelector('.content');
    if (content) content.prepend(img);
    else l.insertBefore(img,l.children[1])
  }
};


// render content as object
aa.e.render_object =async(l,dat)=>
{
  aa.parse.content_o(aa.parse.j(dat.event.content),l,'a');
};


// renders video from tags
aa.e.render_video =async(l,dat)=>
{
  let p = await aa.p.get(dat.event.pubkey);
  let trusted = aa.is.trusted(p?.score||0);
  aa.parse.context(l,dat.event,trusted);
  let url = aa.fx.url_from_tags(dat.event.tags);
  if (url)
  {
    let av = trusted?aa.mk.av(url):aa.mk.link(url);
    av = aa.mk.l('p',{cla:'paragraph',app:av});
    let content = l.querySelector('.content');
    if (content) content.prepend(av);
    else l.insertBefore(av,l.children[1])
  }
};


aa.e.kinda_reply =async(dat,reply_dat)=>
{
  // let notes = new Set([1]);
  let tags;
  if (reply_dat.event.kind === 1)
  {
    tags = aa.get.tags_for_reply(reply_dat.event)
  }
  else
  {
    switch (reply_dat.event.kind)
    {
      case 11:
      case 1111:
        dat.event.kind = reply_dat.event.kind;
        break;
      default:
        dat.event.kind = 1111;
    }
    tags = await aa.get.tags_for_comment(reply_dat.event);
  }
  dat.event.tags.push(...tags);
};


// updates blank note
// aa.e.reply_blank =(note,reply,tag_reply)=>
// {
//   reply.querySelector('.replies').setAttribute('open','');
//   aa.fx.merge_datasets(['seen','subs'],note,reply);
//   if (tag_reply[2])
//   {
//     let relay = aa.is.url(tag_reply[2]);
//     if (relay)
//     {
//       let a = reply.dataset.r ? reply.dataset.r.trim().split(' ') : [];
//       aa.fx.a_add(a,[relay]);
//       reply.dataset.r = a.join(' ');
//     }
//   }
// };


// search notes content for value
aa.e.search =async s=>
{
  s = s.toLowerCase();
  let df = new DocumentFragment();
  let contents = document.getElementsByClassName('content');
  for (const content of contents)
  {
    let text = content.textContent.toLowerCase();
    let has = text.search(s);
    if (has !== -1) 
    {
      let l_event = content.parentElement;
      let name = l_event.querySelector('.by .name').textContent;
      let con = `${name}: ${text.slice(has,has+21)}… `;
      let app = aa.mk.nostr_link(l_event.id);
      df.append(aa.mk.l('p',{con,app}),' ');
    }
  }
  aa.log(aa.mk.details(`e (s)earch results for ${s}`,df,1))
};


// mutation observer for notes section
aa.e.section_mutated =a=>
{
  let threshold = parseInt(localStorage.pagination)||0;
  for (const mutation of a)
  {
    let count  = mutation.target.children.length;
    const needs = count > threshold;
    const has_class = aa.l.classList.contains('needs_pagin');
    
    if (needs && !has_class)
    {
      fastdom.mutate(()=>{aa.l.classList.add('needs_pagin')})
    }
    else if (!needs && has_class)
    {
      fastdom.mutate(()=>{aa.l.classList.remove('needs_pagin')})
    }
  }
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
      if (l.querySelector('.note.is_new')) l.classList.add('haz_new');
      aa.clk.time({target:l.querySelector('.by .created_at')});
      const replies = l.querySelector('.replies');
      const some = replies.childNodes.length - 1;
      const all = l.querySelectorAll('.note').length;
      const summary = replies.querySelector('summary');
      const sum_butt = summary.querySelector('.mark_read');
      if (summary && some > 0) sum_butt.textContent = some+(all>some?'.'+all:'')
    }
  }
  if (root && updated) aa.e.append_as_root(root);
  if (og) og.dataset.level = levels;
};


// view event
aa.e.view =l=>
{
  fastdom.mutate(()=>
  {
    if (l.classList.contains('not_yet')) aa.e.note_intersect(l);
    aa.l.classList.add('viewing','view_e');
    l.classList.add('in_view');
    aa.view.in_view = l;
    aa.clk.time({target:l.querySelector('.by .created_at')});
    aa.fx.path(l);
    setTimeout(()=>{aa.fx.scroll(l)},200);
  });
};


// checks if added element should be in_view
aa.e.view_check =l=>
{
  if ((history.state?.view === '#'+l.id 
    || aa.view.id_a && aa.view.id_a === l.dataset.id_a)
  && !l.classList.contains('in_view'))
    setTimeout(()=>{aa.e.view(l)},100);
};

aa.mk.styles(aa.e.styles);