/*

alphaama
parse stuff

*/


// splits a string into paragraphs, then into lines and then into words 
// and process each part separately
aa.parse.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  let l = aa.mk.l('p',{cla:'paragraph'});
  const another_l =last_l=>
  {
    last_l.normalize();
    if (aa.is.empty(last_l)) 
    {
      last_l.remove();
    }
    else 
    {
      df.append(last_l);
      l = aa.mk.l('p',{cla:'paragraph'});
    }
  };
  let paragraphs = s.split(/\n\s*\n/);
  if (paragraphs.length === 1) paragraphs = s.split(/\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;    
    
    const lines = paragraph.trim().split(/\n/);
    for (let li=0;li<lines.length;li++)
    {
      if (l.childNodes.length) l.append(aa.mk.l('br'));

      const words = lines[li].trim().split(' ');
      for (let i=0;i<words.length;i++)
      {
        let word = words[i].trim();
        if (!word.length) continue;

        if (aa.regx.url.test(word)) 
        {
          let dis_node = aa.parser('url',word,trusted);
          l.append(dis_node,' ');
        }
        else if (aa.regx.nostr.test(word)) 
        {
          let parsed = aa.parser('nostr',word);
          let quote = parsed.querySelector('blockquote');
          if (quote)
          {
            another_l(l); 
            df.append(quote)
          }
          else l.append(parsed);
          // while (parsed.childNodes.length)
          // {
          //   let node = parsed.firstChild;
          //   if (node.tagName !== 'BLOCKQUOTE') l.append(node);
          //   else 
          //   { 
          //     another_l(l); 
          //     df.append(node)
          //   }
          // }        
        }
        else if (aa.regx.hashtag.test(word)) 
        {
          let dis_node = aa.parser('hashtag',word);
          l.append(dis_node,' ');
        }
        else 
        {
          if (i === words.length-1) l.append(word);
          else l.append(word,' ');
        }
      }
    }
    another_l(l);
  }
  return df
};


//parse content as object
aa.parse.content_o =async(data,note)=>
{
  if (data && typeof data === 'object')
  {
    let content = note.querySelector('.content');
    content.textContent = '';
    content.append(aa.mk.ls({ls:data}));
  }
};


// toggle parsed content on note
aa.parse.context =(note,event,trust)=>
{
  const content = note.querySelector('.content');
  content.textContent = '';
  content.classList.toggle('parsed');
  if (content.classList.contains('parsed'))
  {
    content.append(aa.parse.content(event.content,trust));
  }
  else content.append(aa.mk.l('p',{cla:'paragraph',con:event.content}));
};


// parse JSON
aa.parse.j =son=>
{
  let o;
  son = son.trim();
  if (son.length > 2)
  {
    try { o = JSON.parse(son) }
    catch (er) 
    { 
      console.log('aa.parse.j',son); 
      console.error(er) 
    }
  }
  return o
};


// parse url as link or media given trust
aa.parse.url =(match,tru)=>
{
  let link;
  const type = aa.fx.url_type(match[0]);
  if (tru && type[0] === 'img') link = aa.mk.img(type[1].href);
  else if (tru && type[0] === 'av') link = aa.mk.av(type[1].href);
  else if (type) link = aa.mk.link(type[1].href);
  return link
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


// wrapper for aa.parse functions
aa.parser =(parse_id,s,trust,regex_id)=>
{
  const df = new DocumentFragment();
  if (!regex_id) regex_id = parse_id;
  const matches = [...s.matchAll(aa.regx[regex_id])];
  let index = 0;
  for (const match of matches) 
  {
    df.append(match.input.slice(index,match.index));
    let parsed = aa.parse[parse_id](match,trust);
    let childs = parsed.childNodes.length;
    if (childs > 2) index = match.index + match.input.length;
    else index = match.index + match[0].length;
    df.append(parsed);
  }
  if (index < s.length) df.append(s.slice(index));
  return df
};