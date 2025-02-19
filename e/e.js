/*

alphaama
mod    e
events notes

*/

aa.mk.styleshit('/e/e.css');


aa.e = 
{
  renders:
  {
    content:[1,9802,30023],
    encrypted:[4],
    image:[20],
    object:[0],
    video:[21,22,1063,34235,34236],
  },
  requires:['o'],
  root_count:0,
  butts_for:
  {
    na:[[localStorage.reaction,'react'],'req','bro','parse','tiny'],
    // k4:['encrypt'],
    draft:['yolo','sign','pow','edit','cancel'],
    not_sent:['post','cancel'],
    blank:['fetch']
  }
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
aa.e.append_to =async(dat,l,a)=>
{
  if (a && a.length) aa.e.append_check(dat,l,a);
  else aa.e.append_to_notes(l);
};


// append note to notes section
aa.e.append_to_notes =note=>
{ 
  let notes = document.getElementById('notes') || aa.e.l;
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
    aa.e.append_in_order(notes,note);
    // const last = [...notes.children]
    // .filter(i=>note.dataset.stamp > i.dataset.stamp)[0];
    // notes.insertBefore(note,last)
  }
  if (history.state?.view === '#'+note.id) setTimeout(()=>{aa.e.view(note)},1000);
  aa.get.note_refs(note);
};


// order note by stamp order
aa.e.append_in_order =(notes,note)=>
{
  const l = [...notes.children].find(i=>note.dataset.stamp > i.dataset.stamp);
  // notes.insertBefore(note,l)
  fastdom.mutate(()=>
  {
    notes.insertBefore(note,l)
  })
};



// append to another note as reply
aa.e.append_to_rep =(note,rep)=>
{
  const last = [...rep.children]
  .find(i=> i.tagName === 'ARTICLE' 
  && i.dataset.created_at > note.dataset.created_at);
  note.classList.add('reply','not_yet');
  note.classList.remove('root');
  if (note.classList.contains('in_path')) rep.parentNode.classList.add('in_path')
  rep.parentNode.classList.add('haz_reply'); 
  if (!sessionStorage[note.dataset.id]) 
  {
    note.classList.add('is_new');
    rep.parentNode.classList.add('haz_new_reply');
  }
  fastdom.mutate(()=>
  {
    rep.insertBefore(note,last?last:null);
    aa.e.upd_note_path(rep,note.dataset.stamp,aa.is.u(note.dataset.pubkey));
  });
  aa.e.note_observer.observe(note);
  if (history.state?.view === '#'+note.id) setTimeout(()=>{aa.e.view(note)},100);
  aa.get.note_refs(note);
};


// decides where to append a reply
aa.e.append_check =(dat,note,tag_reply)=>
{
  const reply_id = tag_reply[1];
  let p = aa.db.p[dat.event.pubkey];
  let relays = aa.fx.in_set(p?.relays,'write');
  let notes = document.getElementById('notes') || aa.e.l;
  let reply;

  if (tag_reply[0] === 'a')
  {
    reply = notes.querySelector('.note[data-id_a="'+reply_id+'"]');
    if (!reply)
    {
      aa.e.refs(dat,note,tag_reply);
      aa.e.miss_print_a(tag_reply,relays);
    }
    else aa.e.append_to_rep(note,reply.querySelector('.replies'));
    return;
  }
  
  const reply_nid = aa.fx.encode('note',reply_id);
  reply = notes.querySelector(`.note[data-id="${reply_id}"`);
  if (!reply)
  {
    aa.e.refs(dat,note,tag_reply);
    let tag_root = aa.get.tag_root(dat.event.tags);
    if (tag_root && tag_root[1] !== reply_id)
    {
      let root_id = tag_root[1];
      // let root_nid = aa.fx.encode('note',root_id);
      let root = notes.querySelector(`.note[data-id="${root_id}"`); // document.getElementById(root_nid);
      if (!root) aa.e.miss_print(tag_root);
    }
    aa.e.miss_print(tag_reply,relays);
  }
  else
  {
    if (reply.classList.contains('blank'))
    {
      aa.e.reply_blank(note,reply,tag_reply);
    }
    aa.e.append_to_rep(note,reply.querySelector('.replies'));
  }
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


//parse content as object
aa.parse.content_o =async(ls,note,sort='')=>
{
  if (ls && typeof ls === 'object')
  {
    let content = note.querySelector('.content');
    content.textContent = '';
    content.append(aa.mk.ls({ls,sort}));
  }
};


// toggle parsed content on note
aa.parse.context =(l,event,trust)=>
{
  let content = l.querySelector('.content');
  if (!content) content = l;
  else 
  {
    content.textContent = '';
    content.classList.toggle('parsed');
  }
  if (content.classList.contains('parsed'))
  {
    let parsed = aa.parse.content(event.content,trust);
    if (parsed.childNodes.length) content.append(parsed);
  }
  else content.append(aa.mk.l('p',{cla:'paragraph',con:event.content}));
};


// make details section
aa.mk.det =(cla='',id='')=>
{
  let l = aa.mk.details('',false,true);
  if (cla) l.classList.add(cla);
  if (id) l.id = id;
  let summary = l.querySelector('summary');
  summary.append(aa.mk.l('button',{cla:'butt mark_read',clk:aa.clk.mark_read}));
  return l 
};


// returns events if already loaded or get them from database
aa.db.events =async a=>
{
  // return await aa.db.get_pa(a)
  const events = [];
  const to_get = [];
  for (const x of a) 
  {
    if (!aa.db.e[x]) to_get.push(x);
    else events.push(aa.db.e[x])
  }
  if (to_get.length)
  {
    let stored = await aa.db.get('idb',{get_a:{store:'events',a:to_get}});
    for (const i of stored) aa.db.e[i.event.id] = i;
    events.push(...stored);
  }
  return events
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
    // console.log('no id from '+id_a);
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


// returns event if already loaded or get it from database
aa.db.get_e =async xid=>
{
  if (aa.db.e[xid]) return aa.db.e[xid];  
  let dat = await aa.db.idb.ops({get:{store:'events',key:xid}});
  if (dat) aa.db.e[xid] = dat;
  return dat
};


// returns array of tags with all #hashtags in string
aa.get.hashtag =s=>
{
  const tags = [];
  const hashtags = s.match(aa.fx.regex.hashtag);
  if (hashtags) for (const h of hashtags) tags.push(['t',h.slice(1).toLowerCase()])
  return tags
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


// 
aa.e.json =async(s='')=>
{
  let dat = await aa.db.get_e(s);
  if (dat) return JSON.stringify(dat.event)
  else return 'event not found '+s
};


// on load
aa.e.load =()=>
{
  aa.temp.orphan = {};
  aa.temp.print = {};
  aa.temp.printed = new Map();
  aa.temp.refs = {};
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
  aa.e.l = aa.mk.l('div',{id:'notes'});
  aa.e.section_observer.observe(aa.e.l,{attributes:false,childList:true});
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
      l.classList.remove(...classes);
    }
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[replies.id] = '';
      replies.classList.remove('expanded');
    }
  }
  else 
  {
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[replies.id] = '';
      replies.classList.remove('expanded');
    }
    else 
    {
      sessionStorage[replies.id] = 'expanded';
      replies.classList.add('expanded');
    }
  }
  if (!aa.viewing)
  {
    let top = root.offsetTop + (3 * parseFloat(getComputedStyle(document.documentElement).fontSize));
    if (top < aa.l.scrollTop) aa.l.scrollTo(0,top);
  }
};


// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
aa.get.mentions =async s=>
{
  const mentions = [];
  const matches = [...s.matchAll(aa.fx.regex.nostr)];
  for (const m of matches)
  {
    let dis = m[0].slice(6);
    if (dis.startsWith('npub')) 
    {
      let p_x = aa.fx.decode(dis);
      if (p_x) mentions.push(aa.fx.tag_p(p_x));
    }
    else if (dis.startsWith('note'))
    {
      const e_x = aa.fx.decode(dis);
      if (e_x) 
      {
        mentions.push(aa.fx.tag_q(e_x));
        let dat = await aa.db.get_e(e_x);
        if (dat && dat.event.pubkey !== aa.u.p.xpub) mentions.push(aa.fx.tag_p(dat.event.pubkey));
      }
    }
  }
  return mentions
};


// merge two dat objects
aa.fx.merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let merged,sets = ['seen','subs','clas','refs'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set]=[]; merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (aa.fx.a_add(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false
};


// add event id to missing event list
aa.e.miss_e =(id,relays=[])=>
{
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
  const [kind,pubkey,identifier] = id.split(':');
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
    // if (r && !aa.miss.a[id].relays.includes(r)) aa.miss.a[id].relays.push(r);
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


// get missing e or p from def relays
aa.get.missing =async type=>
{
  aa.fx.to(()=>
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
      let options = {eose:'close'};
      let filter;
      let req;
    
      let [url,ids] = Object.entries(miss).sort((a,b)=>a.length - b.length)[0];
      for (const id of ids) aa.fx.a_add(aa.miss[type][id].nope,[url]);
      
      if (type === 'e' || type === 'p')
      {
        if (type === 'p') filter = {authors:ids,kinds:[0]};
        else filter = {ids:ids};
      }
      else if (type === 'a')
      {
        for (const id of ids)
        {
          let [n,x,s] = aa.fx.split_ida(id);
          filter = {kinds:[parseInt(n)],authors:[x],'#d':[s]};
        }
      }
      if (filter)
      {
        let keys = Object.keys(filter).sort();
        let tags = [];
        for (const key of keys)
        {
          let item = [key];
          let i = filter[key];
          if (Array.isArray(i)) item.push(...i.map(b=>typeof b==='string'?b:b.toString()).sort());
          else item.push(i);
          tags.push(item);
        }
        
        let req_id = type+'_'+aa.fx.hash(aa.e.normalise({tags,created_at:1})).slice(32);

        req = ['REQ',req_id,filter];
        setTimeout(()=>
        {
          aa.r.demand(req,[url],options);
          setTimeout(()=>
          {
            if (Object.keys(aa.miss[type]).length) aa.get.missing(type);
          },500)
        },0);
      }
    }
  },200,'miss_'+type);
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
        dat = aa.mk.dat(
        {
          event:{id:data.id,created_at:aa.now - 10},
          seen:[aa.fx.in_set(aa.r.o.ls,aa.r.o.r)]
        });

        if (data.author) dat.event.pubkey = data.author;
        if (data.kind) dat.event.kind = data.kind;
        if (data.relays)
        {
          for (let url of data.relays)
          {
            url = aa.is.url(url)?.href;
            if (url) aa.fx.a_add(dat.seen,[url]);
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
      let mm = a[1].match(aa.fx.regex.bech32);
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
    });
  }

  by.append(aa.e.note_actions(dat))
  
  if ('kind' in dat.event) 
  {
    note.dataset.kind = dat.event.kind;
  }

  if ('created_at' in dat.event)
  {
    let ca = dat.event.created_at;
    let stamp = aa.now < ca ? aa.now : ca
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

  // if ('sig' in dat.event) 
  // {
  //   note.append(aa.mk.l('p',{cla:'sig',con:dat.event.sig}));
  // }

  let replies = aa.mk.det('replies');
  if (sessionStorage.hasOwnProperty(replies_id))
  {
    if (sessionStorage[replies_id] === 'expanded') 
      replies.classList.add('expanded');
  }
  else replies.classList.add('expanded');
  note.append(replies);
  return note
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
          aa.fx.a_add(a,aa.e.butts_for.k4);
          break;
        }
      default: 
        aa.fx.a_add(a,aa.e.butts_for.draft);
    }
    l.setAttribute('open','')
  }
  else if (dat.clas.includes('not_sent')) aa.fx.a_add(a,aa.e.butts_for.not_sent);
  else if (dat.clas.includes('blank')) aa.fx.a_add(a,aa.e.butts_for.blank);
  else
  {
    aa.fx.a_add(a,[['…','na']]);
    l.classList.add('empty');
    l.classList.remove('expanded');
  }
  if (a.length) for (const s of a) l.append(aa.mk.butt(s),' ');
  return l
};

aa.clk.na =e=>
{
  let l = e.target.closest('.actions');
  if (l.classList.contains('empty'))
  {
    for (const s of aa.e.butts_for.na) l.append(aa.mk.butt(s),' ');
    l.classList.remove('empty');
  }
  l.classList.toggle('expanded');
  // e.target.remove();
  // let a = aa.e.butts_for.na;
  // if (a.length) for (const s of a) l.append(aa.mk.butt(s),' ');
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
//   let timestamp = dat?.event?.created_at ?? aa.now - 1000;
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
    let id_a = [dat.event.kind,dat.event.pubkey,ds].join(':');
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

  if (aa.temp.orphan.hasOwnProperty(id)) delete aa.temp.orphan[id];
  let refs = aa.temp.refs[id];
  for (const i in refs)
  {
    aa.e.append_check(...refs[i]);
    // if (i && dis?.hasOwnProperty(i)) 
    // {
    //   aa.e.append_check(...refs[i])
    // }
    // else console.log(dis);
  }
  delete refs
};


aa.get.note_refs =note=>
{
  setTimeout(()=>
  {
    aa.e.note_refs(note.dataset.id);
    if (note.dataset.id_a) aa.e.note_refs(note.dataset.id_a);
  },0)
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
  return b
};


// remove note
aa.e.note_rm =note=>
{
  if (aa.viewing === note.id) aa.state.clear()
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
  let butt_more = aa.mk.l('button',
  {
    cla:'butt',
    con:'moar',
    clk:e=>
    {
      fastdom.mutate(()=>
      {
        if (aa.l.classList.contains('pagin'))
        {
          let position = aa.l.scrollTop;
          aa.l.classList.remove('pagin');
          e.target.textContent = 'less';
          aa.l.scrollTop = position;
        }
        else 
        {
          aa.l.classList.add('pagin');
          e.target.textContent = 'moar';
        }
      });
    }
  });
  pagination.append(butt_more);
  fastdom.mutate(()=>{aa.l.classList.add('pagin')});
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
  aa.fx.to(aa.e.printer,100,'printer');
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
  },500);
};


// print event
aa.e.print =dat=>
{
  // console.log(dat);
  const xid = dat.event.id;
  if (!aa.db.e[xid]) aa.db.e[xid] = dat;
  if (aa.temp.orphan[xid]) return;

  // let nid = aa.fx.encode('note',xid);
  let l = aa.temp.printed.get(xid);
  // let l = aa.e.l.querySelector(`[data-id="${xid}"]`);//document.getElementById(nid);
  if (!l)
  {
    aa.fx.count_upd(document.getElementById('butt_e'));
    l = aa.e.note_by_kind(dat);
    aa.temp.printed?.set(xid,l);
    aa.e.render(l);
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
  let id_a = dat.id_a?.length ? dat.id_a : xid; //.split(':').join('_')
  setTimeout(()=>{aa.get.quotes(id_a)},100);
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
  let p = await aa.db.get_p(pub);
  if (!p) p = aa.p.p(pub);

  let by = aa.mk.l('p',{cla:'note_quote_by'});
  quote.append(by);
  by.append(aa.mk.p_link(pub));
  aa.fx.color(pub,quote);

  let a_note = document.querySelector('.note[data-id_a="'+o.id_a+'"]');
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
    let p = await aa.db.get_p(dat.event.pubkey);
    if (!p) p = aa.p.p(dat.event.pubkey);
    if (!has_pub) 
    {
      by.prepend(aa.mk.p_link(p.xpub));
      aa.fx.color(p.xpub,quote);
    }
    by.append(aa.mk.nostr_link(aa.fx.encode('note',o.id)));
    aa.e.render(quote,dat);
    // content = aa.parse.content(dat.event.content,aa.is.trusted(p.score));
    quote_classes.push('parsed');
    aa.get.pubs([['p',dat.event.pubkey]]);
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


aa.get.quotes =async id=>
{
  const q_id = 'get_quotes';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.temp[q_id].push(id);
  aa.fx.to(aa.e.quotes_to,100,q_id);
};


// stash orphan
aa.e.refs =(dat,note,tag)=>
{
  const id = tag[1];//.split(':').join('_');
  if (!aa.temp.refs[id]) aa.temp.refs[id] = {};
  if (!aa.temp.refs[id][dat.event.id]) 
  {
    aa.temp.refs[id][dat.event.id] = [dat,note,tag];
    aa.temp.orphan[dat.event.id] = id;
  }
};


// if the event is in the viewport
// do additional ui enhancements
aa.e.render =async l=>
{
  let dat = aa.db.e[l?.dataset.id];
  if (!dat) return;
  for (const key in aa.e.renders)
  {
    if (aa.e.renders[key].includes(dat.event.kind))
    {
      let fid = 'render_'+key;
      if (aa.e.hasOwnProperty(fid)) aa.e[fid](l,dat);
    }
  }
};


aa.e.render_encrypted =async(l,dat)=>
{
  let content = l.querySelector('.content');
  content.classList.add('encrypted');
  content.querySelector('.paragraph').classList.add('cypher');
  if (!dat.clas.includes('draft'))
  {
    l.querySelector('.actions .butt.react')?.remove();
    l.querySelector('.actions .butt.req')?.remove();
  }
  let p_x = aa.fx.tag_value(dat.event.tags,'p') || dat.event.pubkey;
  if (aa.u.o.ls.xpub === p_x)
  {
    l.classList.add('for_u');
    content.append(aa.mk.butt_action('e decrypt '+dat.event.id,'decrypt','decrypt'));
  }
  return p_x
};


// render content as rich text
aa.e.render_content =async(l,dat)=>
{
  let p = await aa.db.get_p(dat.event.pubkey);
  let score = p ? p.score : 0;
  let trust = aa.is.trusted(score)
  fastdom.mutate(()=>
  {
    aa.parse.context(l,dat.event,trust);
  })
};

// renders video from tags
aa.e.render_video =async(l,dat)=>
{
  let p = await aa.db.get_p(dat.event.pubkey);
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


// renders image from tags
aa.e.render_image =async(l,dat)=>
{
  let p = await aa.db.get_p(dat.event.pubkey);
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


// updates blank note
aa.e.reply_blank =(note,reply,tag_reply)=>
{
  reply.querySelector('.replies').setAttribute('open','');
  aa.fx.merge_datasets(['seen','subs'],note,reply);
  if (tag_reply[2])
  {
    let relay = aa.is.url(tag_reply[2]);
    if (relay)
    {
      let a = reply.dataset.r ? reply.dataset.r.trim().split(' ') : [];
      aa.fx.a_add(a,[relay]);
      reply.dataset.r = a.join(' ');
    }
  }
};


// request replies to note
aa.clk.req =e=>
{
  const note = e.target.closest('.note');
  const filter = '{"#e":["'+note?.dataset.id+'"],"kinds":[1],"limit":100}';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req read ${filter}`);
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
    aa.e.root_count = mutation.target.childNodes.length;
    const needs = aa.e.root_count > (parseInt(localStorage.pagination)||0);
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


// returns a relay that has event x or empty string
aa.get.seen =x=>
{
  const dat = aa.db.e[x];
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
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

// is tag conditions
aa.is.tag_e =a=> a[0]==='e' && aa.is.x(a[1]);


// gets last e tag
aa.get.tag_e_last =tags=>
{
  let tag = tags.filter(t=>t[0]==='e').pop();
  if (tag && aa.is.tag_e(tag)) return tag;
  return false
};


// make tag list
aa.mk.tag_list =tags=>
{
  const times = tags.length;
  const l = aa.mk.l('ol',{cla:'tags'});
  l.start = 0;
  
  for (let i=0;i<times;i++) 
  {
    let tent = tags[i].join(', ');
    let li = aa.mk.l('li',{cla:'tag tag_'+tags[i][0],con:tent});
    li.dataset.i = i;
    l.append(li);//aa.mk.tag(tags[i],i));
  }
  return l
};

aa.is.tag_p =a=> a[0]==='p' && aa.is.x(a[1]);
aa.is.tag_q =a=> a[0]==='q' && aa.is.x(a[1]);

// gets e tag marked 'reply' or the last not marked 'mention'
aa.get.tag_reply =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='reply')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop();
  if (!tag) tag = tags.find(t=>t[0]==='a');
  if (tag) return tag;
  return false
};


// gets e tag marked 'root' or the first not marked 'mention'
aa.get.tag_root =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='root')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention')[0];
  if (tag && aa.is.tag_e(tag)) return tag;
  return false
};


// returns tags for building a reply
aa.get.tags_for_reply =event=>
{  
  // wip... needs to account for "a" tag
  const tags = [];
  const seen = aa.get.seen(event.id);
  let tag = aa.get.tag_root(event.tags);
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
      let tag_a = aa.fx.tag_a(event);
      if (tag_a) 
      {
        tag_a.push(seen,'root');
        tags.push(tag_a);
      }
    }
    tags.push(['e',event.id,seen,'root',event.pubkey],['K',''+event.kind]);
  }

  const dis_p_tags = aa.fx.a_u(event.tags.filter(t=>aa.is.tag_p(t) && t[1] !== aa.u.p.xpub));
  if (event.pubkey !== aa.u.p.xpub 
  && !dis_p_tags.some(t=>t[1] === event.pubkey)) dis_p_tags.push(aa.fx.tag_p(event.pubkey));
  // needs to do more here...
  tags.push(...dis_p_tags);
  return tags
};


// update elapsed time of note and parents up to root
aa.clk.time =e=> 
{
  if (!e.target) return;
  const all = e.target.closest('.root')?.querySelectorAll('time');
  if (all) for (const t of all)
  {
    const timestamp = parseInt(t.textContent);
    const date = aa.fx.time_to_date(timestamp);
    t.dataset.elapsed = aa.fx.time_elapsed(date);
  }
};


// make time element from timestamp
aa.mk.time =timestamp=>
{
  const d = new Date(timestamp*1000);//aa.fx.time_to_date(timestamp);
  const title = aa.fx.time_display(timestamp);
  const l = aa.mk.l('time',
  {
    cla:'created_at',
    con:timestamp,
    clk:aa.clk.time
  });
  l.setAttribute('datetime', d.toISOString());
  l.title = title;
  l.dataset.elapsed = aa.fx.time_elapsed(d);
  return l
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


// update event on database
aa.db.upd_e =async dat=>
{
  const q_id = 'upd_e';
  if (!aa.temp[q_id]) aa.temp[q_id] = {};
  aa.temp[q_id][dat.event.id] = dat;
  aa.fx.to(aa.db.upd_e_to,500,q_id);
};
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
      },times * 100);
      times++;
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
  if (root && updated && !root.classList.contains('in_viewport')) aa.e.append_to_notes(root);
  if (og) og.dataset.level = levels;
}


// view event
aa.e.view =l=>
{
  fastdom.mutate(()=>
  {
    if (l.classList.contains('not_yet')) aa.e.note_intersect(l);
    aa.l.classList.add('viewing','view_e');
    l.classList.add('in_view');
    aa.clk.time({target:l.querySelector('.by .created_at')});
    aa.fx.path(l);
    aa.fx.scroll(l);
  });

  // setTimeout(()=>
  // {
  //   aa.fx.path(l);
  //   aa.fx.scroll(l);
  // },1000);
};


// plain note
aa.kinds[1] =dat=>
{
  let note = aa.e.note(dat);
  aa.get.pubs(dat.event.tags);
  aa.e.append_to(dat,note,aa.get.tag_reply(dat.event.tags));
  return note
};


// repost of kind-1 note
aa.kinds[6] =dat=>
{
  let note = aa.e.note(dat);
  note.classList.add('tiny'); // 'is_new',
  let tag_reply = aa.get.tag_e_last(dat.event.tags);
  if (tag_reply && tag_reply.length)
  {    
    let repost_id = tag_reply[1];
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
    aa.e.append_check(dat,note,tag_reply);
  }
  else aa.e.append_to_notes(note);
  aa.get.pubs(dat.event.tags);
  return note
};


// reaction
aa.kinds[7] =dat=>
{
  let note = aa.e.note(dat);
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

  let tag_reply = aa.get.tag_e_last(dat.event.tags);
  if (!tag_reply) tag_reply = aa.get.tag_reply(dat.event.tags);
  aa.e.append_to(dat,note,tag_reply);
  
  return note
};


// image template
aa.kinds[20] =dat=>
{
  aa.get.pubs(dat.event.tags);
  let note = aa.e.note(dat);
  aa.e.append_to_notes(note);
  return note
};


// video template
aa.kinds[1063] =dat=>
{
  let note = aa.e.note(dat);
  aa.get.pubs(dat.event.tags);
  aa.e.append_to_notes(note);
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
  return note
};

// video
aa.kinds[34235] =dat=>
{
  let note = aa.e.note_pre(dat);
  aa.get.pubs(dat.event.tags);
  return note
};


// window.addEventListener('load',aa.e.load);