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
    note.classList.add('root','not_yet');
  }

  if (!note.parentElement) aa.e.note_observer.observe(note);
  
  let in_view = history.state?.view === '#'+note.id 
    || (aa.view.id_a && aa.view.id_a === note.dataset.id_a);
  let roots = [...aa.e.l.children];
  let last = 
    roots.find(i=> note.dataset.stamp > i.dataset.stamp);
  
  // if (in_view || last || !roots.length)
  // {
    fastdom.mutate(()=>
    {
      if (last && last.parentElement !== aa.e.l) last = null;
      aa.fx.move(note,last,aa.e.l);
      // roots = [...aa.e.l.children];
      // if (roots.length >= 50)
      // {
      //   for (const item of [...aa.e.l.children].slice(50))
      //     // setTimeout(()=>
      //     // {
      //       if (item?.parentElement === aa.e.l
      //         && !item.classList.contains('in_path')
      //       ) aa.e.l.removeChild(item)
      //     // },0);
      // }
    });
  // }
  
  if (in_view && !note.classList.contains('in_view'))
    setTimeout(()=>{aa.e.view(note)},100);
};


// append note to another note as reply
aa.e.append_as_rep =(note,rep)=>
{
  const note_rm = ['root','orphan','not_yet'];
  const note_add = ['reply','rendered'];
  const rep_add = ['haz_reply'];
  
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
  
  fastdom.mutate(()=>
  {
    note.classList.add(...note_add);
    note.classList.remove(...note_rm);
    rep.insertBefore(note,last);
    rep.parentElement.classList.add(...rep_add);
    aa.e.upd_note_path(note);
  })

  
  // setTimeout(()=>
  // {
  //   aa.e.upd_note_path(note)
  // },200);
  // aa.e.note_yet(note);
  // aa.e.note_observer.observe(note);

  if (history.state?.view === '#'+note.id) setTimeout(()=>{aa.e.view(note)},1000);
};


// decides where to append a reply
aa.e.append_check =async(dat,note,tag)=>
{
  const [type,id,relay] = tag;
  let is_a = type === 'a';
  let reply = is_a
  ? aa.e.by_ida(id)
  : aa.e.printed.get(id);

  if (reply)
  {
    aa.e.append_as_rep(note,reply.querySelector('.replies'));
    return
  }
  
  aa.e.orphan(dat,note,tag);
  
  let miss_dat;
  if (is_a) miss_dat = await aa.e.get_a(id);
  else miss_dat = await aa.e.get(id);

  if (miss_dat)
  {
    aa.e.print_q(miss_dat);
    return
  }

  if (relay)
  {
    let filter = is_a 
      ? aa.fx.id_af(id)
      : {ids:[id]};

    let dis = 
    {
      id:id.slice(8),
      filter,
      relays:[relay],
      options:{eose:'close'}
    }

    let {events} = await aa.r.get(dis);
    if (events.size)
    {
      for (const item of [...events.values()]) aa.e.print_q(item);
      return
    }
  }

  let p = await aa.p.get(dat.event.pubkey);
  let relays = aa.fx.in_set(p?.relays,'write');
  if (relay) aa.fx.a_add(relays,[relay]);
  relays = [...new Set([...relays,...aa.r.r])];
  aa.e.miss_set(type,id,relays);
};


// aa.e.append_as_orphan =(dat,note,reply_id)=>
// {
//   if (note.parentElement) return;
//   let root;
//   let tag_root = aa.fx.tag_comment_root(dat.event.tags)
//   || aa.fx.tag_root(dat.event.tags);
//   if (tag_root && tag_root[1] !== reply_id)
//   {
//     let root_kind = tag_root[0].toLowerCase();
//     if (root_kind === 'e')
//     {
//       root = aa.e.printed.get(tag_root[1]);
//       if (!root) aa.e.miss_print(tag_root);
//     }
//     else if (root_kind === 'a')
//     {
//       root = aa.e.by_ida(tag_root[1]); 
//       if (!root) aa.e.miss_print_a(tag_root);
//     }
//   }
//   note.classList.add('orphan');
//   if (root) aa.e.append_as_rep(note,root.querySelector('.replies'));
//   else aa.e.append_as_root(note);
// };



// create note intersection observer
aa.e.note_observer = new IntersectionObserver(a=>
{
  for (const b of a)
  {
    if (b.isIntersecting || b.boundingClientRect.top > 0)
    {
      aa.e.note_yet(b.target);
      aa.e.note_observer.unobserve(b.target);
    }
      
      // aa.e.note_observer_intersect(b.target);
    // else
    // {
    //   if (b.boundingClientRect.top > 0) 
    //   {
    //     position("BELOW") // do things if below
    //   } else {
    //     position("ABOVE") // do things if above
    //   }
    // }
  }
},{root:null,threshold:.9});


// on observed note intersection
// aa.e.note_observer_intersect =element=>
// {
//   aa.e.note_observer.unobserve(element);
//   aa.e.note_yet(element)
// };


aa.e.note_yet =element=>
{
  fastdom.mutate(()=>
  { 
    if (!element.classList.contains('rendered'))
    {
      element.classList.remove('not_yet');
      element.classList.add('rendered');
      // element.querySelector('.replies')?.toggleAttribute('open',true);
    }
  })
};


// note replace
aa.e.note_replace =(old_note,dat)=>
{
  console.log('note replaced');
  dat.clas = aa.fx.a_rm(dat.clas,['draft']);
  let note = aa.e.note_by_kind(dat);
  note.querySelector('.replies').replaceWith(old_note.querySelector('.replies'));

  note.className = old_note.className;
  
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
  
  let is_reply = note.classList.contains('reply');
  if (!is_reply && !note.parentElement?.closest('.note')) note.classList.remove('reply');
  note.classList.add('replaced');
  if (note.classList.contains('not_yet')) 
  {
    note_replies.removeAttribute('open');
    aa.e.note_observer.observe(b);
  }
  old_note.remove();
  return note
};


// remove note
aa.e.note_rm =note=>
{
  if (aa.view.active === note.id) aa.view.clear();
  aa.em.delete(note.dataset.id);
  if (note.dataset.id_a) aa.em_a.delete(note.dataset.id_a);
  note.remove();
  aa.fx.count_upd(aa.el.get('butt_section_e'),false);
};


// stash orphan
aa.e.orphan =(dat,note,tag)=>
{
  const id = tag[1];
  
  if (!aa.temp.refs.has(id)) aa.temp.refs.set(id,new Map());
  let refs = aa.temp.refs.get(id);
  if (!refs.has(dat.event.id))
  {
    refs.set(dat.event.id,[dat,note,tag]);
    aa.temp.orphan.set(dat.event.id,id);
  }
};


// print event
aa.e.print =async dat=>
{
  // console.log(dat);
  const id = aa.e.em(dat);
  let note = aa.e.printed.get(id);
  if (note)
  {
    if (note.classList.contains('blank')
    || note.classList.contains('draft'))
    {
      note = aa.e.note_replace(note,dat);
    }
    else aa.fx.dataset(note,{seen:dat.seen,subs:dat.subs});
    return
  }

  note = aa.e.note_by_kind(dat);
  if (!note)
  {
    console.log('invalid note:',dat);
    return
  }
  
  aa.e.printed.set(dat.event.id,note);
  
  if (dat.clas.includes('miss'))
    dat.clas = aa.fx.a_rm(dat.clas,['miss']);

  if (note.classList.contains('draft'))
    aa.fx.scroll(note,{behavior:'smooth',block:'center'});

  let k_v = 'pubkey_'+dat.event.pubkey;
  if (aa.p.viewing && aa.p.viewing[1] === k_v)
    aa.p.viewing[0].push(note);
  
  
  // check for quotes to update with new data
  setTimeout(()=>{ aa.e.quote_update(dat) },0);
  // get all stashed references
  setTimeout(()=>
  {
    aa.e.refs(dat.event.id);
    if (dat.id_a) aa.e.refs(dat.id_a);
  },0);
  
  setTimeout(()=>{ aa.fx.count_upd(aa.el.get('butt_section_e')) },0);
  // aa.e.anal(dat);
};


// send data to print
aa.e.print_q =dat=>
{
  if (!aa.temp.print_q) aa.temp.print_q = new Map();
  if (!dat?.event?.id || aa.temp.print_q.has(dat.event.id)) return;

  if (!dat?.event)
  {
    console.trace(dat)
    return
  }
  
  aa.temp.print_q.set(dat.event.id,dat);

  if (aa.temp.miss.e?.has(dat.event.id)) 
  {
    aa.temp.miss.e.delete(dat.event.id);
  }
  if (dat.id_a && aa.temp.miss.a?.has(dat.id_a))
  {
    aa.temp.miss.a.delete(dat.id_a);
  }

  aa.fx.to(()=>
  {
    let prints = [...aa.temp.print_q.values()]
    .sort(aa.fx.sorts.ca_asc);
    aa.temp.print_q.clear();

    for (const dat of prints)
      setTimeout(()=>{aa.e.print(dat)},0);
  },
  8,'brrrr');
};




// get all note refs stashed and append them to note
aa.e.refs =id=>
{
  if (!aa.temp.refs.has(id)) return;
  
  for (const [i,a] of aa.temp.refs.get(id))
  {
    if (aa.temp.orphan.has(i)) aa.temp.orphan.delete(i);
    aa.e.append_check(...a);
  }
  // if (aa.temp.orphan.has(id)) aa.temp.orphan.delete(id);
  aa.temp.refs.delete(id);
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


// update note path when appending
aa.e.upd_note_path =(element)=> 
{
  let target = element.querySelector('.by .created_at');
  let last;
  let stamped;
  let stamp = element.dataset.stamp;
  let is_u = aa.fx.is_u(element.dataset.pubkey);

  for (; element&&element!==document; element=element.parentNode)
  {
    if (!element.classList.contains('note')) continue;
    
    last = element;

    if (element.dataset.stamp < stamp) 
    {
      element.dataset.stamp = stamp;
      stamped = true;
    }
    else stamped = false;

    if (element.querySelector('.note.is_new'))
      element.classList.add('haz_new');

    aa.e.replies_summary_upd(element);
    
    
  }
  // update root post order
  let upd_root_stamp = stamped 
    // && !is_u
    && last?.classList.contains('root');
  if (upd_root_stamp)
    aa.e.append_as_root(last);

  setTimeout(()=>{aa.clk.time({target})})
};