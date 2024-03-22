// parse stuff
it.parse = {};

// parse event.content
// splits a string into lines and then into words 
// and process each part acoording to it's content
it.parse.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  const paragraphs = s.split(/\n\s*\n/);

  
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;

    const words = paragraph.trim().split(' ');
    let l = it.mk.l('p',{cla:'paragraph'});
    const another_l =(dis_l)=>
    {
      if (!it.s.empty(dis_l)) 
      {
        dis_l.normalize();
        df.append(dis_l);
        l = it.mk.l('p',{cla:'paragraph'});
      }
    };
    for (let i=0;i<words.length;i++)
    {
      let word = words[i].trim();
      if (!word.length) continue;
      
      if (it.regx.url.test(word)) l.append(it.parse.url(word,trusted),' ');
      else if (it.regx.nostr.test(word)) 
      {
        let parsed = it.parse.nostr(word);
        while (parsed.childNodes.length)
        {
          let node = parsed.firstChild;
          if (node.tagName !== 'BLOCKQUOTE') l.append(node);
          else
          {
            another_l(l);
            df.append(node);
          }
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
it.parse.context =(note,event,trust)=>
{
  const content = note.querySelector('.content');
  content.textContent = '';
  if (content.classList.contains('parsed'))
  {
    content.classList.remove('parsed');
    content.append(it.mk.l('p',{cla:'paragraph',con:event.content}));
  }
  else 
  {
    content.classList.add('parsed');
    content.append(it.parse.content(event.content,trust));
  }
};

// returns array of tags with all #hashtags in string
it.parse.hashtags =s=>
{
  const tags = [];
  const hashtags = s.match(/(\B[#])\w+/g);
  if (hashtags) for (const hashtag of hashtags) tags.push(['t',hashtag.slice(1).toLowerCase()])
  return tags
};

// parse JSON
it.parse.j =s=>
{
  let o;
  s = s.trim();
  if (s.length > 2)
  {
    try {o = JSON.parse(s)}
    catch (er) 
    {
      console.log('it.parse.j',s);
      console.error(er);
    }
  }
  return o
};

// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
// requires it.fx,it.mk,it.regx
it.parse.mentions =async s=>
{
  return new Promise(async resolve=>
  {
    const mentions = [];
    const matches = [...s.matchAll(it.regx.nostr)];
    for (const m of matches)
    {
      const tags = [];
      let tag = [];
      if (s.startsWith('npub')) 
      {
        let p_x = it.fx.decode(s);
        if (p_x) tags.push(it.fx.tag.p(p_x));
      }
      else if (s.startsWith('note'))
      {
        const e_x = it.fx.decode(s);
        if (e_x) 
        {
          tags.push(it.fx.tag.e(e_x,'mention'));
          let dat = await aa.db.get_e(e_x);
          if (dat) p_x = dat.event.pubkey;
          if (p_x) tags.push(it.fx.tag.p(p_x));
        }
      }
      if (tags.length) mentions.push(...tags);
    }
    resolve(mentions)
  })
};

// parse quote from a bech32 string
it.parse.nip19 =(s)=>
{
  let l;
  let decoded = it.fx.decode(s);
  if (!decoded) return s;
  if (s.startsWith('npub1'))  l = it.mk.author(decoded);
  else if (s.startsWith('nprofile1')) l = it.mk.author(decoded.pubkey);
  else if (s.startsWith('note1')) l = kin.quote({"id":decoded});
  else if (s.startsWith('nevent1') || s.startsWith('naddr1'))
  {
    if (decoded.id) 
    {
      decoded.s = s;
      l = kin.quote(decoded);
    }
    else l = it.mk.l('span',{con:JSON.stringify(decoded)})
  }
  else l = it.mk.nostr_link(s);
  return l
};

it.parse.nostr =s=>
{
  const df = new DocumentFragment();
  const matches = [...s.matchAll(it.regx.nostr)];
  let last_i = 0;
  for (const m of matches)
  {
    df.append(m.input.slice(last_i,m.index));
    last_i = m.index + m[0].length;
    let dis = m[0].slice(6);
    let decoded = it.fx.decode(dis);
    if (!decoded) df.append(dis,' ');
    else df.append(it.parse.nip19(dis),' ')    
  }
  if (last_i < s.length) df.append(s.slice(last_i));
  return df
};

// get all url elements from string as link or media given trust
// requires it.fx,it.mk,it.regx,av.mk
it.parse.url =(s,tru)=>
{
  const df = new DocumentFragment();
  const matches = [...s.matchAll(it.regx.url)];
  let last_i = 0;
  for (const m of matches)
  {
    df.append(m.input.slice(last_i,m.index));
    
    last_i = m.index + m[0].length;
    let link;
    const type = it.s.url_type(m[0]);
    if (tru && type[0] === 'img')
    {
      link = it.mk.l('img',{cla:'content-img',src:type[1].href});
      link.loading = 'lazy';
    }
    else if (tru && type[0] === 'av' && av) link = av.mk(type[1].href);
    else if (type) link = it.mk.link(type[1].href);

    df.append(link);
  }
  if (last_i < s.length) df.append(s.slice(last_i));

  return df
}