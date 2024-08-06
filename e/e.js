/*

alphaama
event

*/

document.head.append(aa.mk.l('link',{rel:'stylesheet',ref:'/e/e.css'}));

aa.e = {};


// append note to notes section
aa.e.append_to_notes =(note)=>
{ 
  let notes = document.getElementById('notes');
  const last = [...notes.children].filter(i=>note.dataset.stamp > i.dataset.stamp)[0];
  if (!note.classList.contains('rendered')) 
  {
    note.classList.add('root');
    note.querySelector('.replies').removeAttribute('open');
    note.classList.add('not_yet');
    aa.e.note_observer.observe(note);
  }
  notes.insertBefore(note,last);

  aa.to(()=>
  {
    let butt = document.querySelector('.pagination .butt');
    if (!butt) document.getElementById('e').append(aa.mk.pagination());
    else 
    {
      let n = aa.l.dataset.pagination;
      if (n 
      && butt.classList.contains('done') 
      && document.getElementById('notes').childNodes.length > n
      ) butt.textContent = 'moar dan '+n;
    }
  },300,'pagination');
};


// append to another note as reply
aa.e.append_to_rep =(note,rep)=>
{
  const last = [...rep.children].filter(i=> 
    i.tagName === 'ARTICLE' 
    && i.dataset.created_at > note.dataset.created_at)[0];
  rep.insertBefore(note,last?last:null);
  note.classList.add('reply');
  note.classList.remove('root');
  rep.parentNode.classList.add('haz_reply'); 
  if (note.classList.contains('is_new')) rep.parentNode.classList.add('haz_new_reply');
  aa.e.upd_note_path(rep,note.dataset.stamp,aa.is.u(note.dataset.pubkey));
};


// decides where to append a reply
aa.e.append_to_replies =(dat,note,reply_tag)=>
{
  const reply_id = reply_tag[1];
  const reply_nid = aa.fx.encode('nid',reply_id);
  let reply = document.getElementById(reply_nid);
  if (!reply)
  {
    reply = aa.e.note_blank(reply_tag,dat,1);
    aa.e.append_to_rep(note,reply.querySelector('.replies'));

    let root_tag = aa.get.root_tag(dat.event.tags);
    if (root_tag && root_tag[1] !== reply_id)
    {
      reply.classList.add('reply');
      let root_id = root_tag[1];
      let root_nid = aa.fx.encode('nid',root_id);
      let root = document.getElementById(root_nid);
      if (!root)
      { 
        root = aa.e.note_blank(root_tag,dat,10);
        root.classList.add('root');
        aa.e.append_to_notes(root);
        aa.e.miss_print(root_tag);
      }
      aa.e.append_to_rep(reply,root.querySelector('.replies'));
    }
    else
    {
      reply.classList.add('root');
      aa.e.append_to_notes(reply);
    }
    aa.e.miss_print(reply_tag);
  }
  else
  {
    if (reply.classList.contains('blank'))
    {
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
    }
    aa.e.append_to_rep(note,reply.querySelector('.replies'))
  }
};


// clear notes from section
aa.e.clear =s=>
{
  document.getElementById('notes').textContent = '';
  it.butt_count('e','.note');
  aa.log('events cleared')
};


// clone note
aa.e.clone =note=>
{
  let clone = note.cloneNode(true);
  clone.removeAttribute('id');
  let rm = clone.querySelectorAll('.details,.sig,.replies,.actions');
  for (const l of rm) l.remove();
  clone.className = 'note quoted';
  return clone
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
      action:['e','view'],
      required:['hex_id'],
      description:'view event by hex_id',
      exe:(s)=>{ aa.state.view(aa.fx.encode('nid',s)) }
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
  section.append(notes);
  aa.e.section_observer.observe(notes,{attributes:false,childList:true});
};


// add to missing event list
aa.e.miss_e =(xid,relays)=>
{
  if (!aa.miss.e[xid]) aa.miss.e[xid] = {nope:[],relays:[]};
  for (const rel of relays)
  {
    const r = aa.is.url(rel);
    if (r && !aa.miss.e[xid].relays.includes(r.href)) aa.miss.e[xid].relays.push(r.href);
  }
};


// get event from tag and prints it,
// otherwise add to missing list
aa.e.miss_print =(tag)=>
{
  const xid = tag[1];
  const relay = tag[2];
  aa.db.get_e(xid).then(dat=>
  {
    if (dat) aa.e.print(dat);
    else aa.e.miss_e(xid,[relay]);
  });
};


// get missing e or p from def relays
aa.get.missing =async type=>
{
  aa.to(()=>
  {
    let miss = {};
    const nope =(xid,a,b)=>
    {
      for (const url of a) 
      {
        if (!b.includes(url))
        {
          if (!miss[url]) miss[url] = [];
          aa.fx.a_add(miss[url],[xid]);
        }
      }
    };
    let def_relays = aa.r.in_set(aa.r.o.r);
    for (const xid in aa.miss[type])
    {
      let v = aa.miss[type][xid];
      nope(xid,def_relays,v.nope);
      nope(xid,v.relays,v.nope);
    }

    if (Object.keys(miss).length)
    {
      let [url,ids] = Object.entries(miss).sort((a,b)=>a.length - b.length)[0];
      for (const id of ids) aa.fx.a_add(aa.miss[type][id].nope,[url]);
      
      let filter;
      if (type === 'p') filter = {authors:ids,kinds:[0]};
      else if (type === 'e')
      {
        for (const id of ids)
        {
          let notes = document.querySelectorAll('[data-id="'+id+'"]');
          for (const note of notes) note.dataset.nope = aa.miss.e[id].nope.join(' ');
        }
        filter = {ids:ids};
      }
      aa.r.demand(['REQ',type,filter],[url],{});
    }
  },1000,'miss_'+type);
};


// restrict amount of root events displayed at once
aa.mk.pagination =()=>  
{
  let style = document.getElementById('e_pagination');
  if (!style) 
  {
    style = aa.mk.l('style',{id:'e_pagination'});
    document.head.append(style);
  }
  let pagination = aa.mk.l('p',{cla:'pagination'});
  let butt_more = aa.mk.l('button',{cla:'butt',con:'moar',clk:aa.e.pagination_upd});
  pagination.append(butt_more);
  butt_more.click();
  return pagination;
};

// update pagination 
aa.e.pagination_upd =async e=>
{
  let style = document.getElementById('e_pagination');
  let total = document.getElementById('notes').childNodes.length;
  if (!aa.l.dataset.pagination) aa.l.dataset.pagination = localStorage.pagination
  let n = aa.l.dataset.pagination;
  if (n < total)
  {
    if (!aa.l.dataset.pagination) aa.l.dataset.pagination = n;
    else aa.l.dataset.pagination = n * 2;
    if (e.target) e.target.textContent = 'moar '+n;
    style.textContent = '#notes > .note:not(:nth-child(-n+'+n+')):not(.in_path){display:none;';
    setTimeout(()=>
    {
      let last = document.querySelector('#notes > .note:nth-child('+Math.floor(n/2)+')');
      if (last) aa.fx.scroll(last)
    },200);
  }
  else 
  {
    if (n > total && e.target.classList.contains('done'))
    {
      n = localStorage.pagination;
      if (e.target)
      {
        let n = aa.l.dataset.pagination;
        e.target.textContent = 'moar '+n;
        e.target.classList.remove('done');
      } 
    } 
    else if (e.target)
    {
      e.target.textContent = 'no moar :)';
      e.target.classList.add('done');
    }
    style.textContent = '#notes > .note:not(:nth-child(-n+'+n+')):not(.in_path){display:none;';
  }
};


// parse nip19 to render as mention or quote
aa.parse.nip19 =s=>
{
  let decoded = aa.fx.decode(s);
  if (!decoded) return s;
  let l;
  if (s.startsWith('npub1'))  l = aa.mk.p_link(decoded);
  else if (s.startsWith('nprofile1')) l = aa.mk.p_link(decoded.pubkey);
  else if (s.startsWith('note1')) l = aa.e.quote({"id":decoded});
  else if (s.startsWith('nevent1') || s.startsWith('naddr1'))
  {
    if (decoded.id) 
    {
      decoded.s = s;
      l = aa.e.quote(decoded);
    }
    else l = aa.mk.l('span',{con:JSON.stringify(decoded)})
  }
  else l = aa.mk.nostr_link(s);
  return l
};


// parse nostr:stuff
// use with aa.parser('nostr',s)
// aa.parse.nostr =(match)=>
// {
//   let df = new DocumentFragment();
  
//   let s = match[0].slice(6);
//   let decoded = aa.fx.decode(s);
//   if (!decoded)
//   {
//     let matches = (match.input).split('nostr:').join(' ').trim().split(' ');
//     for (const m of matches)
//     {
//       // let s = match[0].slice(6);
//       let decoded = aa.fx.decode(m);
//       let dis = decoded ? aa.parse.nip19(m) : m;
//       df.append(dis,' ');
//     }
//   }
//   else
//   {
//     df.append(aa.parse.nip19(s),' ');
//   }

//   return df
// };

aa.parse.nostr =(match)=>
{
  let df = new DocumentFragment();
  df.append(match.input.slice(0,match.index)); 

  let matches = (match[0]).split('nostr:').join(' ').trim().split(' ');
  for (const m of matches)
  {
    let a = m.split('1');
    if (a[1])
    {
      let mm = a[1].match(aa.regx.bech32);
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
    else
    {
      console.log(match)
    }
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
    const nid = aa.fx.encode('nid',dat.event.id);
    note.id = nid;
    note.dataset.id = dat.event.id;
    const h1 = aa.mk.l('h1',{cla:'id'});
    const h1_nid = aa.mk.l('a',
    {
      cla:'a nid',
      ref:'#'+nid,
      con:nid,
      clk:aa.clk.a
    });
    const h1_xid = aa.mk.l('span',{cla:'xid',con:dat.event.id});
    h1.append(h1_nid,h1_xid);
    by.prepend(h1);
    replies_id = dat.event.id+'_replies';
  }

  if ('pubkey' in dat.event)
  {
    const x = dat.event.pubkey;
    note.dataset.pubkey = x;
    aa.fx.color(x,note);
    aa.db.get_p(x).then(p=>
    {
      if (!p && !aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
      if (!p) p = aa.p.p(x);
      note.dataset.trust = p.trust;
      by.append(aa.mk.p_link(x));
    });    
  }
  
  if ('kind' in dat.event) 
  {
    note.dataset.kind = dat.event.kind;
  }

  if ('created_at' in dat.event)
  {
    note.dataset.created_at = dat.event.created_at;
    note.dataset.stamp = dat.event.created_at;
    by.append(aa.mk.time(dat.event.created_at));
  }

  if ('tags' in dat.event && dat.event.tags.length)
  {
    let tags = aa.mk.tag_list(dat.event.tags);
    let tags_wall = aa.mk.details('#['+dat.event.tags.length+']',tags);
    tags_wall.classList.add('tags_wall');
    note.append(tags_wall);      
  }

  if ('content' in dat.event)
  {
    note.append(aa.mk.l('section',
    {
      cla:'content',
      app:aa.mk.l('p',{cla:'paragraph',con:dat.event.content})
    }));
  }

  if ('sig' in dat.event) 
  {
    note.append(aa.mk.l('p',{cla:'sig',con:dat.event.sig}));
  }

  let replies = aa.mk.details('',false,true);
  replies.classList.add('replies');
  if (replies_id)
  {
    replies.id = replies_id;
    aa.fx.expanded(replies_id,1,replies);
  }
  let summary = replies.querySelector('summary');
  summary.append(aa.mk.l('button',{cla:'butt mark_read',clk:aa.clk.mark_read}));
  note.append(replies,aa.e.note_actions(dat.clas));  
  return note
};


// note actions
aa.e.note_actions =clas=>
{ 
  // const l = aa.mk.l('p',{cla:'actions'});
  const l = aa.mk.details('<3');
  l.classList.add('actions');
  let a = [];
  if (!clas) clas = [];
  if (clas.includes('draft')) a.push('yolo','sign','edit','cancel');
  else if (clas.includes('not_sent')) a.push('post','cancel');
  else if (clas.includes('blank')) a.push('fetch','tiny');
  else a.push('react','req','parse','tiny');
  if (a.length) for (const s of a) l.append(aa.mk.butt(s),' ');
  return l
};


// process note by kind if available, otherwise default
aa.e.note_by_kind =dat=>
{
  let k = dat.event.kind;
  
  if (aa.kinds.hasOwnProperty(k)) return aa.kinds[k](dat);
  // need to work on all these types, only regular for now...
  switch (true)
  {
    case k >= 1000  && k <= 9999: // regular
    case k >= 10000 && k <= 19999: // replaceable
    case k >= 20000 && k <= 29999: // ephemeral
    case k >= 30000 && k <= 39999: // parameterized_replaceable
    default: return aa.e.note_regular(dat);
  }
};


// blank note
aa.e.note_blank =(tag,dat,seconds)=>
{
  const id = tag[1];
  const blank_event = 
  {
    id:id,
    created_at:dat.event.created_at - seconds,
    tags:[tag],
    content:id+'\n'+aa.fx.encode('nid',id)
  }
  const seen = aa.r.in_set('read');
  let r;
  if (tag[2])
  {
    const url = aa.is.url(tag[2]);
    if (url) 
    {
      aa.fx.a_add(seen,[url.href]);
      blank_event.content = blank_event.content+'\n'+url.href;
      r = url.href;
    }
    else console.log('malformed tag on',dat);
  }
  const note = aa.e.note({event:blank_event,seen:seen,subs:dat.subs,clas:['blank']});
  note.classList.add('blank','tiny');
  if (!sessionStorage[id]) note.classList.add('is_new');
  if (r) note.dataset.r = r;
  return note
};


// regular note
aa.e.note_regular =dat=>
{
  let note = aa.e.note(dat);
  aa.e.append_to_notes(note);
  return note
};


// note replace
aa.e.note_replace =(l,dat)=>
{
  l.id = 'temp-'+dat.event.id;
  let b = aa.e.note_by_kind(dat);
  let b_rep = b.querySelector('.replies');
  let childs = l.querySelector('.replies').childNodes;
  if (childs.length)
  {
    for (const c of childs) if (c.tagName === 'ARTICLE') aa.e.append_to_rep(c,b_rep);
  }
  let is_root = b.classList.contains('root');
  let is_reply = b.classList.contains('reply');
  b.className = l.className;
  l.remove();
  b.classList.remove('blank','tiny','draft','not_sent');
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
    aa.e.note_observer.observe(b);
  }
};


// print event
aa.e.print =async dat=>
{
  const xid = dat.event.id;
  if (!aa.db.e[xid]) aa.db.e[xid] = dat;

  let nid = aa.fx.encode('nid',xid);
  let l = document.getElementById(nid);
  if (!l)
  {
    l = aa.e.note_by_kind(dat);
    aa.fx.data_count(document.getElementById('butt_e'),'.note');
    if (!l) console.log(dat);
    if (l?.classList.contains('draft')) aa.fx.scroll(l,{behavior:'smooth',block:'center'});
  }
  else
  {
    if (l.classList.contains('blank') || l.classList.contains('draft')) 
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

  aa.get.quotes(xid);
  aa.get.missing('e');
  aa.get.missing('p');
  aa.i.d(dat);
  if (l && history.state.view === '#'+nid) setTimeout(()=>{aa.e.view(l)},200);
};


// create note intersection observer
aa.e.note_observer = new IntersectionObserver(a=>
{
  for (const b of a)
  {
    if (b.isIntersecting) aa.e.note_intersect(b.target)
  }
},{root:null,threshold:.9});
// on observed note intersection
aa.e.note_intersect =l=>
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
  by.append(aa.mk.nostr_link(aa.fx.encode('nid',o.id)));
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
  aa.e.quote_upd(quote,o);
  return quote
};


// new quote event, still wip
aa.e.quote_new =o=>
{
  if (!o.id) return false;
  const quote = aa.mk.l('blockquote',{cla:'note_quote'});
  quote.dataset.id = o.id;
  
  let nid = aa.fx.encode('nid',o.id);
  let note = document.getElementById(nid);
  if (note) quote.append(aa.e.clone(note));
  else aa.db.get_e(o.id).then(dat=>
  {
    if (dat) 
    {
      aa.e.print(dat);
      note = document.getElementById(nid);
      if (note) quote.append(aa.e.clone(note));
    }
    else
    {
      quote.classList.add('blank_quote');
      let by = aa.mk.l('p',{cla:'note_quote_by'});
      let pubkey = o.author ?? o.pubkey;
      if (pubkey) by.append(pubkey);
      else by.append(aa.mk.l('span',{con:'?'}));
      by.append(aa.mk.nostr_link(nid));
      content = aa.mk.l('p',{cla:'paragraph'});
      
      let req = {ids:[o.id]};
      let relays = [];
      if (o.relays?.length) 
      {
        req.relays = o.relays;
        let relay_content = aa.mk.l('p',{con:'relays: '+o.relays});
        content.append(relay_content);
        for (const r of o.relays) relays.push(r);
      }
      aa.e.miss_e(o.id,relays);
      quote.append(content)
    }
  }); 
  return quote
};


// update blank quotes
aa.e.quote_upd =async(quote,o)=>
{
  let dat = await aa.db.get_e(o.id);
  let by = quote.querySelector('.note_quote_by');
  let has_pub = by.querySelector('a.author') ? true : false;
  let content;
  if (dat) 
  {
    aa.db.get_p(dat.event.pubkey).then(pp=>
    {
      if (!pp) pp = aa.p.p(dat.event.pubkey);
      if (!has_pub) 
      {
        by.prepend(aa.mk.p_link(pp.xpub));
        aa.fx.color(pp.xpub,quote);
      }
      aa.get.pubs([['p',dat.event.pubkey]]);
      content = aa.parse.content(dat.event.content,aa.is.trusted(pp.trust));
      quote.append(content);
      quote.classList.add('parsed');
    })
  }
  else
  {
    quote.classList.add('blank_quote');
    if (!has_pub) by.prepend(aa.mk.l('span',{con:'?'}));
    content = aa.mk.l('p',{cla:'paragraph'});
    
    let req = {ids:[o.id]};
    let relays = [];
    if (o.relays?.length) 
    {
      req.relays = o.relays;
      let relay_content = aa.mk.l('p',{con:'relays: '+o.relays});
      content.append(relay_content);
      for (const r of o.relays) relays.push(r);
    }
    quote.append(content)
    aa.e.miss_e(o.id,relays);
  }  
};


// gets all blank quotes and replaces with actual data
aa.get.quotes =async id=>
{
  let quotes = document.querySelectorAll('.blank_quote[data-id="'+id+'"]');
  if (quotes.length)
  {
    let dat = await aa.db.get_e(id);
    if (!dat) dat = {event:{"id":id}};
    let quote = aa.e.quote(dat.event);
    setTimeout(()=>{ for(const q of quotes) q.replaceWith(quote)},100);
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
    const section = mutation.target.closest('section');
    let butt = section.querySelector('section > header > .butt');
    aa.fx.data_count(butt,'.note');
  }
};
aa.e.section_observer = new MutationObserver(aa.e.section_mutated);


// update note path when appending
aa.e.upd_note_path =(l,stamp,is_u=false)=> 
{
  let root,updated;
  for (;l && l !== document; l = l.parentNode ) 
  {
    if (l.classList.contains('note')) 
    {
      updated = false;
      root = l;
      if (l.dataset.stamp < stamp && !is_u)
      {
        l.dataset.stamp = stamp;
        updated = true;
      }
      let haz_new = l.querySelector('.note.is_new');
      if (haz_new) l.classList.add('haz_new');
      aa.clk.time({target:l.querySelector('.by time')});
      const replies = l.querySelector('.replies');
      const some = replies.childNodes.length - 1;
      const all = l.querySelectorAll('.note').length;
      const summary = replies.querySelector('summary');
      const sum_butt = summary.querySelector('.mark_read');
      if (summary && some > 0) sum_butt.textContent = some + (all > some ? '.' + all : '')
    }
	}
  if (root && updated) aa.e.append_to_notes(root)
}


// view event
aa.e.view =l=>
{
  aa.l.classList.add('viewing','view_e');
  l.classList.add('in_view');
  aa.fx.path(l);
  if (l.classList.contains('not_yet')) aa.e.note_intersect(l);
  aa.fx.scroll(l);
};


// plain note
aa.kinds[1] =dat=>
{
  let note = aa.e.note(dat);
  if (!sessionStorage[dat.event.id]) note.classList.add('is_new');
  let reply_tag = aa.get.reply_tag(dat.event.tags);
  if (reply_tag && reply_tag.length) aa.e.append_to_replies(dat,note,reply_tag);
  else aa.e.append_to_notes(note);
  aa.get.pubs(dat.event.tags);
  aa.parse.context(note,dat.event,aa.is.trust_x(dat.event.pubkey));
  return note
};


// repost of kind-1 note
aa.kinds[6] =dat=>
{
  let note = aa.e.note(dat);
  note.classList.add('is_new','tiny');
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
        else aa.e.print(dat_e);
      });
      
    }
    aa.e.append_to_replies(dat,note,reply_tag);
  }
  else aa.e.append_to_notes(note);
  aa.get.pubs(dat.event.tags);
  return note
};


// reaction
aa.kinds[7] =dat=>
{
  let note = aa.e.note(dat);
  if (!sessionStorage[dat.event.id]) note.classList.add('is_new');
  let reply_tag = aa.get.last_e_tag(dat.event.tags);
  if (reply_tag && reply_tag.length) aa.e.append_to_replies(dat,note,reply_tag);
  else aa.e.append_to_notes(note);
  aa.get.pubs(dat.event.tags);
  note.classList.add('tiny');
  let content = note.querySelector('.content');
  let con_t = content.textContent;

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
  
  return note
};


// repost of generic note
aa.kinds[16] = aa.kinds[6];

// zap template
aa.kinds[9735] = aa.kinds[1];

// long-form template
aa.kinds[30023] = aa.kinds[1];


aa.views.note1 =async nid=>
{
  aa.viewing = nid;
  let l = document.getElementById(nid);
  if (l) aa.e.view(l);
  else
  {
    let x = aa.fx.decode(nid);
    let dat = await aa.db.get_e(x);
    if (dat) aa.e.print(dat);
    else 
    {
      let blank = aa.e.note({event:{id:x},clas:['blank','root']});
      aa.e.append_to_notes(blank);
      aa.e.view(blank);
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
    let nid = aa.fx.encode('nid',data.id);
    let l = document.getElementById(nid);
    if (!l)
    {
      let dat = await aa.db.get_e(data.id);
      if (dat) aa.e.print(dat);
      else 
      {
        dat = 
        {
          event:{id:data.id,created_at:aa.t.now - 10},
          seen:[aa.r.in_set(aa.r.o.r)],subs:[],clas:[]
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


// returns tags of type from event
aa.get.tags =(event,type)=> event.tags.filter(tag=>tag[0]===type);


// returns tags for building a reply
aa.get.tags_for_reply =event=>
{  
  // wip... needs to account for "a" tag
  const tags = [];
  const seen = aa.get.seen(event.id);
  let tag = aa.get.root_tag(event.tags);
  if (tag) 
  {
    tag[2] = aa.is.url(tag[2])?.href || seen;
    tag[3] = 'root';
    tag.splice(4);
    tags.push(tag,['e',event.id,seen,'reply']);
  }
  else tags.push(['e',event.id,seen,'root']);

  const p_tags = event.tags.filter(t=>aa.is.tag.p(t) && t[1] !== aa.u.p.xpub);
  let dis_p_tags = [...new Set(p_tags)];
  if (event.pubkey !== aa.u.p.xpub 
  && !dis_p_tags.some(t=>t[1] === event.pubkey)) dis_p_tags.push(['p',event.pubkey]);
  // needs to do more here...
  tags.push(...dis_p_tags);
  return tags
};


// gets e tag marked 'reply' or the last not marked mention
aa.get.reply_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='reply')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop();
  if (tag && aa.is.tag.e(tag)) return tag;
  return false
};


// gets e tag marked 'root' or the first not marked mention
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
  const hashtags = s.match(aa.regx.hashtag);
  if (hashtags) for (const h of hashtags) tags.push(['t',h.slice(1).toLowerCase()])
  return tags
};



// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
aa.get.mentions =s=>
{
  const mentions = [];
  const matches = [...s.matchAll(aa.regx.nostr)];
  console.log(matches);
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
      if (e_x) mentions.push(aa.fx.tag.q(e_x));
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
aa.db.upd_e =async dat=>
{
  const id = 'upd_e';
  if (!aa.db.q[id]) aa.db.q[id] = {};
  let merged = aa.db.merge_e(dat);
  if (merged) aa.db.q[id][dat.event.id] = merged;

  aa.to(()=>
  {
    const q = Object.values(aa.db.q[id]);
    aa.db.q[id] = {};
    if (q.length) aa.db.idb.worker.postMessage({upd_e:{store:'events',a:q}});
  },2000,id);
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
  for (const dat of events) aa.e.print(dat);
};


window.addEventListener('load',aa.e.load);