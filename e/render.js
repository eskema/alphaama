
// render event type kinds
aa.e.rnd =
{
  content:[1,11,1111,30023],
  emojii:[7],
  encrypted:[4],
  highlight:[9802],
  image:[20],
  object:[0,30166],
  video:[21,22,1063,34235,34236],
};


// do additional ui enhancements  to event element
// based on kind
aa.e.render =async(dat,options)=>
{
  let content = aa.mk.l('div',{cla:'content'});
  let renders = 0;
  for (const key in aa.e.rnd)
  {
    if (aa.e.rnd[key].includes(dat.event.kind))
    {
      let fid = 'render_'+key;
      if (Object.hasOwn(aa.e,fid))
      {
        renders++;
        aa.e[fid](content,dat,options);
      }
    }
  }

  content.classList.add('e_render');
  
  if (!renders)
  {
    if (dat.event.content.length)
    {
      content.append(aa.mk.l('p',
      {
        cla:'paragraph',
        con:dat.event.content
      }))
    }
    else
    {
      content.classList.add('no_content');
      content.append(aa.mk.tag_list(dat.event.tags))
    }
  }

  return content
};


// render content as rich text
aa.e.render_content =async(content,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.fx.is_trusted(o.trust||p?.score);
  aa.e.context(content,dat.event,is_trusted);
};


// render content as emoji
aa.e.render_emojii =async(content,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.fx.is_trusted(o.trust||p?.score);
  if (!is_trusted) return;

  let emoji = dat.event.tags.find(t=>t[0]==='emoji');
  if (!emoji) 
  {
    content.append(aa.mk.l('p',
    {
      cla:'paragraph',
      con:dat.event.content
    }));
    return
  }

  emoji = aa.fx.url(emoji[2])?.href;
  if (!emoji) return;

  let emojii = aa.mk.img(emoji);
  emojii.classList.add('emojii');
  content.textContent = '';
  content.append(emojii)
};


// render content encrypted cyphertext
aa.e.render_encrypted =async(content,dat)=>
{
  content.classList.add('encrypted');
  let paragraph = aa.mk.l('p',
  {
    cla:'paragraph cypher',
    con:dat.event.content
  });
  // if (!dat.clas.includes('draft'))
  // {
  //   l.querySelector('.actions .butt.react')?.remove();
  //   l.querySelector('.actions .butt.req')?.remove();
  // }
  let p_x = aa.fx.tag_value(dat.event.tags,'p') || dat.event.pubkey;
  if (aa.u.o.ls.pubkey === p_x)
  {
    content.classList.add('for_u');
    content.append(aa.mk.butt_action('e decrypt '+dat.event.id,'decrypt','decrypt'));
  }
};


// render content as rich text
aa.e.render_highlight =async(content,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.fx.is_trusted(o.trust||p?.score);
  
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
        let relay = aa.fx.url(h_s[2])?.href;
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
  if (comment) comment = aa.e.content(comment,is_trusted);
  let highlight = aa.mk.l('div',{cla:'highlight',app:aa.e.content(dat.event.content,is_trusted)});
  if (highlight.childNodes.length) 
  {
    fastdom.mutate(()=>
    {
      content.textContent = '';
      content.classList.add('parsed');
      content.append(highlight,source);
      if (comment) content.insertBefore(comment,highlight);
    });
  }
};


// renders image from tags
aa.e.render_image =async(content,dat)=>
{
  let p = await aa.p.get(dat.event.pubkey);
  let trusted = aa.fx.is_trusted(p?.score||0);
  aa.e.context(content,dat.event,trusted);
  let url = aa.fx.url_from_tags(dat.event.tags);
  if (!url) return;
  
  let app = trusted ? aa.mk.img(url) : aa.mk.link(url);
  content.prepend(aa.mk.l('p',{cla:'paragraph',app}))
};


// render content as object
aa.e.render_object =async(content,dat)=>
{
  aa.e.content_o(content,aa.parse.j(dat.event.content),'a');
};


// renders video from tags
aa.e.render_video =async(content,dat)=>
{
  let p = await aa.p.get(dat.event.pubkey);
  let trusted = aa.fx.is_trusted(p?.score||0);
  aa.e.context(content,dat.event,trusted);
  let url = aa.fx.url_from_tags(dat.event.tags);
  if (url)
  {
    let app = trusted?aa.mk.av(url):aa.mk.link(url);
    content.prepend(aa.mk.l('p',{cla:'paragraph',app}));
  }
};