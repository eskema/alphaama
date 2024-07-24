/*

alphaama
aa parse stuff

*/


// splits a string into paragraphs, then into lines and then into words 
// and process each part separately
aa.parse.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  let l = aa.mk.l('p',{cla:'paragraph'});
  const another_l =last_l=>
  {
    if (aa.is.empty(last_l) || last_l.textContent === '/n') last_l.remove();
    else 
    {
      last_l.normalize();
      df.append(last_l);
      l = aa.mk.l('p',{cla:'paragraph'});
    }
  };
  const paragraphs = s.split(/\n\s*\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;    
    const lines = paragraph.trim().split(/\n/);
    for (let li=0;li<lines.length;li++)
    {
      if (li!==0) l.append(aa.mk.l('br'));
      const words = lines[li].trim().split(' ');
      for (let i=0;i<words.length;i++)
      {
        let word = words[i].trim();
        if (!word.length) continue;
        if (aa.regx.url.test(word)) l.append(aa.parser('url',word,trusted),' ');
        else if (aa.regx.nostr.test(word)) 
        {
          let parsed = aa.parser('nostr',word);
          while (parsed.childNodes.length)
          {
            let node = parsed.firstChild;
            if (node.tagName !== 'BLOCKQUOTE') l.append(node);
            else { another_l(l); df.append(node)}
          }        
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
  let last_child = df.lastChild;
  if (last_child && aa.is.empty(last_child))
  {
    let last_text = (last_child.textContent+'').trim();
    if (!last_text.length) last_child.remove();
  } 
  return df
};


// toggle parsed content on note
aa.parse.context =(note,event,trust)=>
{
  const content = note.querySelector('.content');
  content.textContent = '';
  content.classList.toggle('parsed');
  if (content.classList.contains('parsed'))
    content.append(aa.parse.content(event.content,trust));
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
}


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
    index = match.index + match[0].length;
    df.append(aa.parse[parse_id](match,trust));
  }
  if (index < s.length) df.append(s.slice(index));
  return df
};