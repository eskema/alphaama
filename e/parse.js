// parse

// parse content as object
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
  let parsed;
  if (content.classList.contains('parsed')) //event.tags.length < 21 && 
  {
    parsed = aa.parse.content(event.content,trust);
  }
  else parsed = aa.mk.l('p',{cla:'paragraph',con:event.content});
  if (parsed.childNodes.length) 
  {
    fastdom.mutate(()=>{content.append(parsed)});
  }
};


// parse hashtag
aa.parse.hashtag =match=>
{
  return aa.mk.l('span',
  {
    cla:'hashtag',
    con:match[0],
    dat:{label:match[0].slice(1).toLowerCase()}
  })
};


aa.parse.emojii =async(note,event)=>
{
  let content = note.querySelector('.content');
  let emoji = event.tags.find(t=>t[0]==='emoji');
  if (emoji) 
  {
    emoji = aa.is.url(emoji[2])?.href;
    if (emoji) 
    {
      aa.p.get(event.pubkey).then(p=>
      {
        if (p && aa.is.trust_x(event.pubkey))
        {
          let emojii = aa.mk.img(emoji);
          emojii.classList.add('emojii');
          content.textContent = '';
          content.append(emojii);
        }
      });
    }
  }
};