// parse stuff

aa.parse = {};


// parse event.content
// splits a string into lines and then into words 
// and process each part acoording to it's content

aa.parse.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  const paragraphs = s.split(/\n\s*\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;
    let l = aa.mk.l('p',{cla:'paragraph'});
    const another_l =(last)=>
    {
      if (!aa.is.empty(last)) 
      {
        last.normalize();
        df.append(last);
        l = aa.mk.l('p',{cla:'paragraph'});
      }
    };

    const words = paragraph.trim().split(' ');
    for (let i=0;i<words.length;i++)
    {
      let word = words[i].trim();
      if (!word.length) continue;
      if (aa.regx.url.test(word)) l.append(aa.parse.url(word,trusted),' ');
      else if (aa.regx.nostr.test(word)) 
      {
        let parsed = aa.parse.nostr(word);
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
    another_l(l);
  } 
  return df
};


// toggles parsed content on note from event

aa.parse.context =(note,event,trust)=>
{
  const content = note.querySelector('.content');
  content.textContent = '';
  content.classList.toggle('parsed');
  if (content.classList.contains('parsed'))
    content.append(aa.parse.content(event.content,trust));
  else content.append(aa.mk.l('p',{cla:'paragraph',con:event.content}));
};


// returns array of tags with all #hashtags in string

aa.parse.hashtags =s=>
{
  const tags = [];
  const hashtags = s.match(aa.regx.hashtag);
  if (hashtags) for (const h of hashtags) tags.push(['t',h.slice(1).toLowerCase()])
  return tags
};


// parse JSON

aa.parse.j =s=>
{
  let o;
  s = s.trim();
  if (s.length > 2)
  {
    try {o = JSON.parse(s)}
    catch (er) { console.log('aa.parse.j',s); console.error(er)}
  }
  return o
};


// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
// requires aa.fx,aa.mk,aa.regx

aa.parse.mentions =async s=>
{
  return new Promise(async resolve=>
  {
    const mentions = [];
    const matches = [...s.matchAll(aa.regx.nostr)];
    console.log(matches);
    for (const m of matches)
    {
      const tags = [];
      let dis = s.slice(6);
      if (m[0].startsWith('nostr:npub')) 
      {
        let p_x = aa.fx.decode(dis);
        if (p_x) tags.push(aa.fx.tag.p(p_x));
      }
      else if (s.startsWith('nostr:note'))
      {
        const e_x = aa.fx.decode(dis);
        if (e_x) 
        {
          tags.push(aa.fx.tag.e(e_x,'mention'));
          let dat = await aa.db.get_e(e_x);
          if (dat) p_x = dat.event.pubkey;
          if (p_x) tags.push(aa.fx.tag.p(p_x));
        }
      }
      if (tags.length) mentions.push(...tags);
    }
    resolve(mentions)
  })
};


// parse nip19 to mention / quote

aa.parse.nip19 =(s)=>
{
  let l;
  let decoded = aa.fx.decode(s);
  if (!decoded) return s;
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

aa.parse.nostr =s=>
{
  const df = new DocumentFragment();
  const matches = [...s.matchAll(aa.regx.nostr)];
  let last_i = 0;
  for (const m of matches)
  {
    df.append(m.input.slice(last_i,m.index));
    last_i = m.index + m[0].length;
    let dis = m[0].slice(6);
    let decoded = aa.fx.decode(dis);
    if (!decoded) df.append(dis,' ');
    else df.append(aa.parse.nip19(dis),' ')    
  }
  if (last_i < s.length) df.append(s.slice(last_i));
  return df
};


// get all url elements from string as link or media given trust
// requires aa.fx,aa.mk,aa.regx,aa.mk.av

aa.parse.url =(s,tru)=>
{
  const df = new DocumentFragment();
  const matches = [...s.matchAll(aa.regx.url)];
  let last_i = 0;
  for (const m of matches)
  {
    df.append(m.input.slice(last_i,m.index));
    
    last_i = m.index + m[0].length;
    let link;
    const type = aa.is.url_type(m[0]);
    if (tru && type[0] === 'img') link = aa.mk.img(type[1].href);
    else if (tru && type[0] === 'av') link = aa.mk.av(type[1].href);
    else if (type) link = aa.mk.link(type[1].href);

    df.append(link);
  }
  if (last_i < s.length) df.append(s.slice(last_i));

  return df
}


// trying to wrap the parse functions to avoid repetition
// wip

aa.parser =(s,regex,fun)=>
{
  const l = new DocumentFragment();
  const matches = [...s.matchAll(aa.regx[regex])];
  let i = 0;
  for (const m of matches) 
  {
    l.append(m.input.slice(i,m.index));
    i = fun(l,m,i);
  }
  if (i < s.length) l.append(s.slice(i));
  return l
};

aa.parse.test =(l,match,index)=>
{
  l.append(match.input.slice(index,match.index));
  index = match.index + match[0].length;
  let link;
  const type = aa.is.url_type(match[0]);
  if (tru && type[0] === 'img')
  {
    link = aa.mk.l('img',{cla:'content-img',src:type[1].href});
    link.loading = 'lazy';
  }
  else if (tru && type[0] === 'av' && av) link = aa.mk.av(type[1].href);
  else if (type) link = aa.mk.link(type[1].href);
  l.append(link);
  return index
};
