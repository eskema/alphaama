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


// make generic note element
aa.mk.note =dat=>
{
  const note = aa.mk.l('article',{cla:'note'});
  // const heading = aa.mk.l('h1',{cla:'heading'});
  // `a ${aa.k[dat.event.kind]} by`
  // heading.textContent = 'k'+dat.event.kind+' '+aa.k[dat.event.kind];
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
    const h1 = aa.mk.l('span',{cla:'id'});
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
    
    const clicker = aa.mk.l('a',
    {
      cla:'a clicker',
      ref:'#'+nid,
      con:'k'+dat.event.kind+' '+aa.k[dat.event.kind],
      clk:aa.clk.a
    });
    note.prepend(clicker);
  }

  if ('pubkey' in dat.event)
  {
    const x = dat.event.pubkey;
    note.dataset.pubkey = x;
    let p_link = aa.mk.p_link(dat.event.pubkey);
    by.append(p_link);
    aa.p.get(x).then(p=>
    {
      if (!p && !aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]};
      if (!p) p = aa.p.p(x);
      aa.fx.color(x,note);
      note.dataset.trust = p.score;
      // setTimeout(()=>{
        aa.p.link_data_upd(p_link,aa.p.link_data(p))
      // },500);
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
  setTimeout(()=>{aa.e.render(note)},500);
  return note
};


// make a note from text input
aa.mk.post =async(s='')=>
{
  if (!aa.cli.dat) aa.cli.dat_upd(s);
  if (aa.cli.dat)
  {
    aa.cli.dat.event.created_at = aa.now;
    if (aa.cli.dat.event.kind === 1)
    {
      aa.fx.tags_add(aa.cli.dat.event.tags,aa.get.hashtag(s));
      const mentions = await aa.get.mentions(s);
      aa.fx.tags_add(aa.cli.dat.event.tags,mentions);
    }
    aa.e.draft(aa.cli.dat);
    delete aa.cli.dat;
    aa.cli.fuck_off();
  }
  else
  {
    aa.log(s);
    let log_text = 'unable to create note';
    if (!aa.u?.p?.pubkey)
    {
      log_text += ', login first using the command: ';
      log_text += localStorage.ns+' u login';
    }
    aa.log(log_text);
  }
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