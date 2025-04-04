// splits a string into paragraphs, then into lines and then into words 
// and process each part separately
aa.parse.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  let l = aa.mk.l('p',{cla:'paragraph'});
  const another_l =last_l=>
  {
    last_l.normalize();
    if (aa.is.empty(last_l)) last_l.remove();
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

        if (aa.fx.regex.url.test(word)) 
        {
          let dis_node = aa.parser('url',word,trusted);
          l.append(dis_node,' ');
        }
        else if (aa.fx.regex.nostr.test(word)) 
        {
          let parsed = aa.parser('nostr',word);
          let quote = parsed.querySelector('blockquote');
          if (quote)
          {
            another_l(l); 
            df.append(quote)
          }
          else l.append(parsed);
        }
        else if (aa.fx.regex.hashtag.test(word)) 
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


// parse JSON
aa.parse.j =son=>
{
  let o;
  son = son.trim();
  if(son.length > 2)
  {
    try{ o =JSON.parse(son) }
    catch(er){ console.log('aa.parse.j error',son) }
  }
  return o
};


// parse nip19 to render as mention or quote
aa.parse.nip19 =s=>
{
  let d = aa.fx.decode(s);
  if (!d) return s;
  let l;
  if (s.startsWith('npub1'))  l = aa.mk.p_link(d);
  else if (s.startsWith('nprofile1')) l = aa.mk.p_link(d.pubkey);
  else if (s.startsWith('note1')) l = aa.e.quote({"id":d});
  else if (s.startsWith('nevent1'))
  {
    if (d.id) 
    {
      d.s = s;
      l = aa.e.quote(d);
    }
    else l = aa.mk.l('span',{con:s+': '+JSON.stringify(d)})
  }
  else if (s.startsWith('naddr1'))
  {
    if (d.kind && d.pubkey && d.identifier)
    {
      d.s = s;
      d.id_a = `${d.kind}:${d.pubkey}:${d.identifier}`;
      l = aa.e.quote_a(d);
    }
    else l = aa.mk.l('span',{con:s+':'+JSON.stringify(d)})
  }
  else l = aa.mk.nostr_link(s);
  return l
};


// parse nostr:stuff
// use with aa.parser('nostr',s)
aa.parse.nostr =match=>
{
  let df = new DocumentFragment();
  df.append(match.input.slice(0,match.index)); 

  let matches = (match[0]).split('nostr:').join(' ').trim().split(' ');
  for (const m of matches)
  {
    let a = m.split('1');
    if (a[1])
    {
      let mm = a[1].match(aa.fx.regex.bech32);
      if (mm[0] && mm.index === 0)
      {
        let s = a[0] + '1' + mm[0];
        let decoded = aa.fx.decode(s);
        if (decoded)
        {
          df.append(aa.parse.nip19(s),' ');
          if (mm[0].length < mm.input.length)
          {
            df.append(mm.input.slice(mm[0].length),' ');
          }
        }
        else df.append(m,' ');
      }
    }
  }
  if (match[0].length < match.input.length)
  {
    df.append(match.input.slice(match[0].length),' ');
  }
  return df
};


// parse url as link or media given trust
aa.parse.url =(match,tru)=>
{
  let url = aa.is.url(match[0]);
  if (!url) return;

  const [src,type] = aa.fx.src_type(url);
  if (!tru || !type) return aa.mk.link(src);
  if (type === 'img') return aa.mk.img(src);
  else if (type === 'audio' || type === 'video')
  {
    let l = aa.mk.av(src,false,type==='audio'?true:false);
    setTimeout(()=>{aa.lazy_god.observe(l.querySelector('.mf'))},200);
    return l
  }
  return
};


// wrapper for aa.parse functions
aa.parser =(parse_id,s,trust,regex_id)=>
{
  const df = new DocumentFragment();
  if (!regex_id) regex_id = parse_id;
  const matches = [...s.matchAll(aa.fx.regex[regex_id])];
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