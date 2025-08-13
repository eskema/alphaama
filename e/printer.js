// decides where to append a note
aa.e.append_to =async(dat,note,tag)=>
{
  if (tag?.length) aa.e.append_check(dat,note,tag);
  else aa.e.append_as_root(note);
};


// append note to notes section
aa.e.append_as_root =note=>
{
  if (!note.classList.contains('rendered'))
  {
    note.querySelector('.replies').removeAttribute('open');
    note.classList.add('root','not_yet');
  }

  if (!note.parentElement) aa.e.note_observer.observe(note);
  
  if (note.classList.contains('blank')) 
    aa.e.l.append(note);
  else 
  {
    let last = [...aa.e.l.children]
      .find(i=> note.dataset.stamp > i.dataset.stamp) 
      || null;

    if (!note.parentElement
    || !('moveBefore' in Element.prototype))
      aa.e.l.insertBefore(note,last);
    else aa.e.l.moveBefore(note,last);
  }

  // aa.e.get(note.dataset.id).then(dat=>
  // {
  //   let reply = dat.event.tags.find(i=>
  //     i[0]==='e' 
  //     && i[3] !== 'mention'
  //   );
  //   if (reply) 
  //   {
  //     console.trace('not root',
  //       dat.event.tags,
  //       aa.fx.tag_reply(dat.event.tags)
  //     );
  //   }
  // });

  aa.e.view_check(note);
};


// append note to another note as reply
aa.e.append_as_rep =(note,rep)=>
{
  note.classList.remove('root','orphan');
  const note_add = ['reply','not_yet'];
  const rep_add = [];
  
  if (!sessionStorage[note.dataset.id]) 
  {
    note_add.push('is_new');
    rep_add.push('haz_new_reply');
  }
  
  if (note.classList.contains('in_path')) 
    rep_add.push('in_path');

  let last = [...rep.children]
    .find(i=>
      i.tagName==='ARTICLE' 
      && i.dataset.created_at > note.dataset.created_at)
    || null;
  // fastdom.mutate(()=>
  // {
  rep_add.push('haz_reply');
  rep.insertBefore(note,last);
  rep.parentElement.classList.add(...rep_add);
  note.classList.add(...note_add);
  
  
  aa.e.upd_note_path(rep,note.dataset.stamp,aa.fx.is_u(note.dataset.pubkey));
  // });

  aa.e.note_observer.observe(note);

  if (history.state?.view === '#'+note.id) setTimeout(()=>{aa.e.view(note)},1000);
};


// decides where to append a reply
aa.e.append_check =async(dat,note,tag)=>
{
  const [type,id] = tag;
  let reply = type === 'a' 
  ? aa.e.by_ida(id)
  : aa.e.printed.get(id);

  if (reply) 
  {
    aa.e.append_as_rep(note,reply.querySelector('.replies'));
    return
  }

  let p = await aa.p.get(dat.event.pubkey);
  let relays = aa.fx.in_set(p?.relays,'write');
  switch(type)
  {
    case 'a':
      aa.e.miss_print_a(tag,relays);
      break;
    case 'e':
      aa.e.miss_print(tag,relays);
      break;
  }
  aa.e.orphan(dat,note,tag);
};


aa.e.append_as_orphan =(dat,note,reply_id)=>
{
  if (note.parentElement) return;
  let root;
  let tag_root = aa.fx.tag_comment_root(dat.event.tags)
  || aa.fx.tag_root(dat.event.tags);
  if (tag_root && tag_root[1] !== reply_id)
  {
    let root_kind = tag_root[0].toLowerCase();
    if (root_kind === 'e')
    {
      root = aa.e.printed.get(tag_root[1]);
      if (!root) aa.e.miss_print(tag_root);
    }
    else if (root_kind === 'a')
    {
      root = aa.e.by_ida(tag_root[1]); 
      if (!root) aa.e.miss_print_a(tag_root);
    }
  }
  note.classList.add('orphan');
  if (root) aa.e.append_as_rep(note,root.querySelector('.replies'));
  else aa.e.append_as_root(note);
};


// stash orphan
aa.e.orphan =(dat,note,tag)=>
{
  const id = tag[1];//.split(':').join('_');
  
  if (!aa.temp.refs.has(id)) aa.temp.refs.set(id,new Map());
  let refs = aa.temp.refs.get(id);
  if (!refs.has(dat.event.id))
  {
    refs.set(dat.event.id,[dat,note,tag]);
    aa.temp.orphan.set(dat.event.id,id);
    
    // setTimeout(()=>
    // {
    //   if (!note.parentElement) 
    //   {
    //     console.log(note)
    //     aa.e.append_as_orphan(dat,note,id)
    //   }
    // },21000);
  }

  // if (!aa.temp.refs[id]) aa.temp.refs[id] = {};
  // if (!aa.temp.refs[id][dat.event.id])
  // {
  //   aa.temp.refs[id][dat.event.id] = [dat,note,tag];
  //   aa.temp.orphan[dat.event.id] = id;
  // }
  
};


// print event
aa.e.print =dat=>
{
  // console.log(dat);
  const id = aa.e.em(dat);
  let note = aa.e.printed.get(id);
  if (!note)
  {
    note = aa.e.note_by_kind(dat);
    if (!note) 
    {
      console.log(dat);
      return
    }
    else aa.e.printed.set(dat.event.id,note);
    if (dat.clas.includes('miss')) dat.clas = aa.fx.a_rm(dat.clas,['miss']);
    if (note.classList.contains('draft'))
    {
      aa.fx.scroll(note,{behavior:'smooth',block:'center'});
    }
    let k_v = 'pubkey_'+dat.event.pubkey;
    if (aa.p.viewing && aa.p.viewing[1] === k_v) 
    {
      aa.p.viewing[0].push(note);
    }
    aa.fx.count_upd(aa.el.get('butt_e'));
    // check for quotes to update with new data
    aa.e.quote_update(dat);
    // get all stashed references
    aa.e.note_refs_get(note);
  }
  else
  {
    if (note.classList.contains('blank') 
    || note.classList.contains('draft')) 
    {
      note = aa.e.note_replace(l,dat);
    }
    else
    {
      aa.fx.dataset(note,{seen:dat.seen,subs:dat.subs})
      // let seen = dat.seen.join(' ');
      // if (note.dataset.seen !== seen) note.dataset.seen = seen;
      // let subs = dat.subs.join(' ');
      // if (note.dataset.subs !== subs) note.dataset.subs = subs;
    }
  }
};


// printer queue handler
aa.e.printer =()=>
{
  let to_print = [...aa.temp.prints.values()]
  .sort(aa.fx.sorts.ca_asc);
  aa.temp.prints.clear();

  for (const dat of to_print) setTimeout(()=>{aa.e.print(dat)},0);
  
  setTimeout(()=>
  {
    aa.e.miss_get('p');
    aa.e.miss_get('a');
    aa.e.miss_get('e');
  },0);
};


// send data to print
aa.e.to_printer =dat=>
{
  aa.temp.prints.set(dat.event.id,dat);
  if (aa.temp.miss.e?.has(dat.event.id)) 
  {
    aa.temp.miss.e.delete(dat.event.id);
    dat.clas.push('miss');
  }
  else if (dat.id_a 
  && aa.temp.miss.a?.has(dat.id_a))
  {
      aa.temp.miss.a.delete(dat.id_a);
      dat.clas.push('miss');
  }
  aa.fx.to(aa.e.printer,0,'printer');
};


// update note path when appending
aa.e.upd_note_path =(l,stamp,is_u=false)=> 
{
  let root;
  let og;
  let levels = 0;
  let stamped;
  for (; l && l !== document; l = l.parentNode)
  {
    if (!levels) og = l;
    if (!l.classList.contains('note')) continue;
    stamped = false;
    if (l.dataset.stamp < stamp && !is_u) 
    {
      l.dataset.stamp = stamp;
      stamped = true;
    }
    if (l.querySelector('.note.is_new')) l.classList.add('haz_new');
    aa.clk.time({target:l.querySelector('.by .created_at')});
    aa.e.replies_summary_upd(l);
    root = l;
  }
  if (root?.parentElement === aa.e.l && stamped)
    aa.e.append_as_root(root);
};


aa.e.replies_summary_upd =async element=>
{
  if (!element) return;

  fastdom.mutate(()=>
  {
    const replies = element.querySelector('.replies');
    const direct = replies.childNodes.length - 1;
    const all = replies.querySelectorAll('.note').length;
    const button = replies.firstChild.firstChild;//querySelector('.mark_read');
    if (button && direct > 0)
      button.textContent = direct+(all>direct?'.'+all:'')
  })
};


// get all note refs stashed and append them to note
aa.e.note_refs =id=>
{
  if (!aa.temp.refs.has(id)) return;
  
  for (const [i,a] of aa.temp.refs.get(id))
  {
    aa.e.append_check(...a);
    if (aa.temp.orphan.has(i)) aa.temp.orphan.delete(i);
  }
  // if (aa.temp.orphan.has(id)) aa.temp.orphan.delete(id);
  aa.temp.refs.delete(id);
};


aa.e.note_refs_get =note=>
{
  // setTimeout(()=>
  // {
    aa.e.note_refs(note.dataset.id);
    if (note.dataset.id_a) aa.e.note_refs(note.dataset.id_a);
  // },210)
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



// note replace
aa.e.note_replace =(old_note,dat)=>
{
  console.log('note replaced');
  dat.clas = aa.fx.a_rm(dat.clas,['draft']);
  let note = aa.e.note_by_kind(dat);
  note.querySelector('.replies').replaceWith(old_note.querySelector('.replies'));
  // let in_path;
  // // move replies from old note to new note
  // for (const child of old_note.querySelector('.replies').children()) 
  // {
  //   if (child.tagName !== 'ARTICLE') continue;

  //   aa.e.append_as_rep(child,note_replies);
  //   if (child.classList.contains('in_path')) in_path = true;
  // }
  
  note.className = old_note.className;
  // aa.e.printed.delete(dat.event.id);
  old_note.remove();
  aa.e.printed.set(dat.event.id,note);
  
  note.classList.remove('blank','tiny','draft','not_sent');
  if (in_path) note.classList.add('in_path');
  if (!sessionStorage.getItem(dat.event.id)) note.classList.add('is_new');
  else note.classList.remove('is_new');
  if (dat.clas) note.classList.add(...dat.clas);
  
  let is_root = note.classList.contains('root');
  if (!is_root && note.parentElement?.closest('.note')) 
  {
    note.classList.remove('root','not_yet');
  }
  // else if (is_root) note.classList.add('root');
  
  let is_reply = note.classList.contains('reply');
  if (!is_reply && !note.parentElement?.closest('.note')) note.classList.remove('reply');
  // else if (is_reply) note.classList.add('reply');
  note.classList.add('replaced');
  if (note.classList.contains('not_yet')) 
  {
    note_replies.removeAttribute('open');
    aa.e.note_observer.observe(b);
  }
  
  // let content = note.querySelector('.content');

  // aa.e.render(note);
  return note
};


// remove note
aa.e.note_rm =note=>
{
  if (aa.view.active === note.id) aa.view.clear();
  aa.em.delete(note.dataset.id);
  if (note.dataset.id_a) aa.em_a.delete(note.dataset.id_a);
  note.remove();
  aa.fx.count_upd(aa.el.get('butt_e'),false);
};


// on observed note intersection
aa.e.note_intersect =l=>
{
  if (!l.classList.contains('rendered'))
  {
    aa.e.note_observer.unobserve(l);
    fastdom.mutate(()=>
    {
      l.classList.remove('not_yet');
      l.classList.add('rendered');
      l.querySelector('.replies').setAttribute('open','');
    });
  }
};