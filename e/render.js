
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
  let element = make('div',{cla:'content'});
  let renders = 0;
  let classes = ['e_render'];
  for (const key in aa.e.rnd)
  {
    if (aa.e.rnd[key].includes(dat.event.kind))
    {
      let fid = 'render_'+key;
      if (Object.hasOwn(aa.e,fid))
      {
        renders++;
        aa.e[fid](element,dat,options);
        classes.push(fid);
      }
    }
  }
  
  if (!renders)
  {
    if (dat.event.content.length)
    {
      element.append(make('p',
      {
        cla:'paragraph',
        con:dat.event.content
      }))
    }
    else
    {
      classes.push('no_content');
    }
  }

  element.classList.add(...classes);
  return element
};


// render content as rich text
aa.e.render_content =async(element,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.fx.is_trusted(o.trust||p?.score);
  aa.e.context(element,dat.event,is_trusted);
};


// render content as emoji
aa.e.render_emojii =async(element,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.fx.is_trusted(o.trust||p?.score);
  let emoji = dat.event.tags.find(i=>i[0]==='emoji');
  if (!emoji || !is_trusted)
  {
    element.append(make('p',
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
  element.textContent = '';
  element.append(emojii);
};


// render content encrypted cyphertext
aa.e.render_encrypted =async(element,dat)=>
{
  element.classList.add('encrypted');
  let paragraph = make('p',
  {
    cla:'paragraph cypher',
    con:dat.event.content
  });
  element.append(paragraph);

  let p_x = aa.fx.tag_value(dat.event.tags,'p') || dat.event.pubkey;
  if (aa.u.is_u(p_x))
  {
    element.classList.add('for_u');
    element.append(
      ' ',
      aa.mk.butt_action('e decrypt '+dat.event.id,'decrypt')
    );
  }
};


// render content as rich text
aa.e.render_highlight =async(element,dat,o={})=>
{
  let p = await aa.p.author(dat.event.pubkey);
  let is_trusted = aa.fx.is_trusted(o.trust||p?.score);
  
    // highlighted stuff
  let h_s = dat.event.tags.find(i=>i[0]==='a');
  if (!h_s) h_s = dat.event.tags.find(i=>i[0]==='e');
  if (!h_s) h_s = dat.event.tags.find(i=>i[0]==='r');
  let source = make('p',{con:'source ',cla:'source'});
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

        source.append(aa.mk.nostr_link(naddr));
        let source_p = await aa.p.author(pubkey);
        let name = aa.p.author_name(source_p);
        source.append(` from ${name}`);
        break;

      case 'e':
        let event_id = h_s[1];
        source.append(aa.mk.nostr_link(aa.fx.encode('note',event_id)));
        let dat = await aa.e.get(event_id);
        if (dat)
        {
          let source_p = await aa.p.author(dat.event.pubkey);
          let name = aa.p.author_name(source_p);
          source.append(` from ${name}`);
        }
        break;

      case 'r':
        source.append(aa.mk.link(h_s[1]));
        break;
    }
  }

  let comment = aa.fx.tag_value(dat.event.tags,'comment');
  if (comment) comment = aa.e.content(comment,is_trusted);
  let highlight = make('div',{cla:'highlight',app:aa.e.content(dat.event.content,is_trusted)});
  if (highlight.childNodes.length) 
  {
    fastdom.mutate(()=>
    {
      element.textContent = '';
      element.classList.add('parsed');
      if (comment) element.append(comment);
      element.append(highlight,source);
    });
  }
};


// renders image from tags
aa.e.render_image =async(element,dat)=>
{
  let p = await aa.p.get(dat.event.pubkey);
  let trusted = aa.fx.is_trusted(p?.score||0);
  aa.e.context(element,dat.event,trusted);
  let url = aa.fx.url_from_tags(dat.event.tags);
  if (!url) return;
  
  let app = trusted ? aa.mk.img(url) : aa.mk.link(url);
  element.prepend(make('p',{cla:'paragraph',app}))
};


// render content as object
aa.e.render_object =async(element,dat)=>
{
  aa.e.content_o(element,aa.pj(dat.event.content),'a');

  // let ls = aa.pj(dat.event.content);
  // if (!ls || typeof ls !== 'object') return;

  // element.textContent = '';
  // element.append(aa.mk.ls({ls,sort:'a'}));
};


// renders video from tags
aa.e.render_video =async(element,dat)=>
{
  let p = await aa.p.get(dat.event.pubkey);
  let trusted = aa.fx.is_trusted(p?.score||0);
  aa.e.context(element,dat.event,trusted);
  let url = aa.fx.url_from_tags(dat.event.tags);
  if (url)
  {
    let app = trusted
      ? aa.mk.av(url,{on_grab:s=>aa.log(aa.mk.img(s))})
      : aa.mk.link(url);
    element.prepend(make('p',{cla:'paragraph',app}));
    setTimeout(()=>
    {
      element.parentElement
        ?.querySelector('tags_wrapper')
        ?.toggleAttribute('open',true)
    },200);
  }
};