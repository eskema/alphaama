


// parse url as link or media given trust
aa.parse.url =(match,is_trusted)=>
{
  let url = aa.fx.url(match[0]);
  if (!url) return;

  // checks if string is valid url and then checks extension for media file types.
  // returns false if no media found or array with extension,URL
  const src_type =url=>
  {
    const extensions = 
    {
      image:['gif','heic','jpeg','jpg','png','webp'],
      video:['mp4','webm'], // fuck mov 
      audio:['3ga','aac','aiff','flac','m4a','mp3','ogg','wav']
    } 
    const src_ext =(url,extensions)=>
    {
      const src = (url.origin + url.pathname).toLowerCase();
      for (const ext of extensions)
      {
        if (src.endsWith('.'+ext)
        || url.searchParams.get('format') === ext) return true
      }
      return false
    };

    let dis = [url.href];
    if (src_ext(url,extensions.image)) dis.push('image');
    if (src_ext(url,extensions.audio)) dis.push('audio');
    if (src_ext(url,extensions.video)) dis.push('video');
    return dis
  };

  const [src,type] = src_type(url);

  if (!is_trusted || !type) return aa.mk.link(src);
  if (type === 'image') return aa.mk.img(src);
  else if (type === 'audio' || type === 'video')
  {
    let options = {};
    if (type === 'audio') options.audio = true;
    else options.on_grab = s=>aa.log(aa.mk.img(s));
    let l = aa.mk.av(src,options);
    return l
  }
  return match[0]
};


// wrapper for aa.parse functions
aa.parser =(parse_id,s,is_trusted,regex_id)=>
{
  const df = new DocumentFragment();
  if (!regex_id) regex_id = parse_id;
  const matches = [...s.matchAll(aa.regex[regex_id])];
  let index = 0;
  for (const match of matches) 
  {
    df.append(match.input.slice(index,match.index));
    let parsed = aa.parse[parse_id](match,is_trusted);
    if (!parsed)
    {
      console.log(parse_id,s,match);
      return
    }
    let childs = parsed?.childNodes.length;
    if (childs > 2) index = match.index + match.input.length;
    else index = match.index + match[0].length;
    df.append(parsed);
  }
  if (index < s.length) df.append(s.slice(index));
  return df
};


// wrapper for aa.parse functions
