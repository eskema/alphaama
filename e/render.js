
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
  let dat = await aa.e.get(l?.dataset.id); 
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
    let renders = 0;
    for (const key in aa.e.rnd)
    {
      if (aa.e.rnd[key].includes(dat.event.kind))
      {
        renders++;
        let fid = 'render_'+key;
        if (aa.e.hasOwnProperty(fid)) aa.e[fid](l,dat,options);
      }
    }
    fastdom.mutate(()=>
    {
      l.classList.add('e_render');
      let content = dat.event.content;
      // if (!content) 
      // {
      //   console.log(dat);
      //   return
      // }
      if (!renders && (!content || !content?.trim().length))
      {
        l.classList.add('no_content');
        l.querySelector('.tags_wrapper')?.toggleAttribute('open',true);
      }
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
        let dat = await aa.e.get(event_id);
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