// parse hashtag
aa.parse.hashtag =match=>
{
  const parsed = make('span',
  {
    cla: 'hashtag',
    con: match[0],
    dat: { label: match[0].slice(1).toLowerCase() }
  });

  return { parsed, type: 'inline' }
};


// parse nostr:stuff
// use with aa.parser('nostr',s)
aa.parse.nostr =match=>
{
  let fragment = new DocumentFragment();
  
  let result = { parsed: fragment, type: 'inline'};
  // might be more than one…
  let entities = match[0].split('nostr:')
    .join(' ')
    .trim()
    .split(' ');
  
  let block_types = new Set(['note','nevent','naddr']);
  let has_block_type = new Set(entities.map(i=>i.split('1')[0]))
    .intersection(block_types).size;
  if (has_block_type)
  {
    result.type = 'block'
  }

  const contente =content=>
  {
    if (result.type === 'block')
      content = make('p',{classes:'paragraph',content});
    return content
  };
  
  if (match.index)
  {
    fragment.append(contente(match.input.slice(0,match.index)))
  }

  for (const entity of entities)
  {
    let [type,rest] = entity.split('1');
    if (!rest) continue;

    let rest_match = rest.match(aa.regex.bech32);
    let is_ok = rest_match[0] && rest_match.index === 0;
    if (!is_ok) continue;

    let whole = `${type}1${rest_match[0]}`;
    let decoded = aa.fx.decode(whole);
    if (decoded)
    {
      fragment.append(aa.mk.nip19(whole));
      
      if (rest_match[0].length < rest_match.input.length)
        fragment.append(contente(rest_match.input.slice(rest_match[0].length)),' ');
    }
    else fragment.append(contente(entity));
  }
  if (match[0].length < (match.input.length - match.index))
  {
    fragment.append(contente(match.input.slice(match[0].length + match.index)),' ')
  }
  return result
};


// parse url as link or media given trust
aa.parse.url =(match,is_trusted)=>
{
  let url = aa.fx.url(match[0]);
  if (!url) return;
  let result = { parsed: match[0], type: 'inline' };

  const [src,type] = aa.fx.src_type(url);

  if (!is_trusted || !type) result.parsed = aa.mk.link(src);
  else if (type === 'image') result.parsed = aa.mk.img(src);
  else if (type === 'audio' || type === 'video')
    result.parsed = aa.mk.av(src,false,type==='audio'?true:false);
  
  return result
};


// wrapper for aa.parse functions
// aa.parser =(parse_id,s,is_trusted,regex_id)=>
// {
//   const df = new DocumentFragment();
//   if (!regex_id) regex_id = parse_id;
//   const matches = [...s.matchAll(aa.regex[regex_id])];
//   let index = 0;
//   for (const match of matches) 
//   {
//     df.append(match.input.slice(index,match.index));
//     let {parsed,type} = aa.parse[parse_id](match,is_trusted);
//     if (!parsed)
//     {
//       console.log(parse_id,s,match);
//       return
//     }
//     let childs = parsed?.childNodes.length;
//     if (childs > 2) index = match.index + match.input.length;
//     else index = match.index + match[0].length;
//     df.append(parsed);
//   }
//   if (index < s.length) df.append(s.slice(index));
//   return df
// };