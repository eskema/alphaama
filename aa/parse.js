// parse JSON
aa.parse.j =(son='')=>
{
  let o;
  son = son.trim();
  if(son.length > 2)
  {
    try{ o = JSON.parse(son) }
    catch(er){ console.log('aa.parse.j error',son) }
  }
  return o
};


// parse url as link or media given trust
aa.parse.url =(match,is_trusted)=>
{
  let url = aa.fx.url(match[0]);
  if (!url) return;

  const [src,type] = aa.fx.src_type(url);
  if (!is_trusted || !type) return aa.mk.link(src);
  if (type === 'img') return aa.mk.img(src);
  else if (type === 'audio' || type === 'video')
  {
    let l = aa.mk.av(src,false,type==='audio'?true:false);
    // setTimeout(()=>{aa.lazy_god.observe(l.querySelector('.mf'))},200);
    return l
  }
  return
};


// wrapper for aa.parse functions
aa.parser =(parse_id,s,is_trusted,regex_id)=>
{
  const df = new DocumentFragment();
  if (!regex_id) regex_id = parse_id;
  const matches = [...s.matchAll(aa.fx.regex[regex_id])];
  let index = 0;
  for (const match of matches) 
  {
    df.append(match.input.slice(index,match.index));
    let parsed = aa.parse[parse_id](match,is_trusted);
    let childs = parsed.childNodes.length;
    if (childs > 2) index = match.index + match.input.length;
    else index = match.index + match[0].length;
    df.append(parsed);
  }
  if (index < s.length) df.append(s.slice(index));
  return df
};