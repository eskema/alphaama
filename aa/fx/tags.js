/*

alphaama
fx: tag creation & access

*/


// image dimensions for a url, as [w,h]
// NIP-92: ["imeta","url <url>","dim <w>x<h>"] — matched by url
// NIP-94: separate top-level ["url",...] and ["dim","<w>x<h>"] tags
aa.fx.dim_from_tags =(tags,url)=>
{
  if (!tags || !url) return;
  let dim;
  for (const tag of tags)
  {
    if (tag[0] !== 'imeta') continue;
    const o = aa.fx.a_o(tag);
    if (o.dim && aa.fx.url(o.url)?.href === url)
    {
      dim = o.dim;
      break
    }
  }
  if (!dim && aa.fx.url(aa.fx.tag_value(tags,'url'))?.href === url)
    dim = aa.fx.tag_value(tags,'dim');
  if (!dim) return;
  const [w,h] = String(dim).split('x').map(i=>parseInt(i,10));
  if (w > 0 && h > 0) return [w,h]
};


// create a tag from event
aa.fx.tag_a =o=>
{
  let s = aa.fx.tag_value(o.tags,'d');
  let ida = `${o.kind}:${o.pubkey}:${s}`;
  let tag = ['a',ida];
  return tag
};


// create p tag from hex pubkey
aa.fx.tag_p =x=>
{
  let tag = [];
  tag.push('p',x);
  let p = aa.db.p[x];
  if (p)
  {
    let relay = aa.fx.in_sets_all(p.relays,['k10002','write']).sort((a,b)=>{})[0];
    if (relay) tag.push(relay);
    if (p.petname.length)
    {
      if (tag.length === 2) tag.push('');
      tag.push(p.petname);
    }
  }
  return tag
};


// create e tag from hex id
aa.fx.tag_e =(x,mark=false)=>
{
  let tag = [];
  tag.push('e',x);
  let relay = aa.fx.seen(x);
  if (relay) tag.push(relay);
  if (mark)
  {
    if (tag.length===2) tag.push('');
    tag.push(mark);
  }

  return tag
};

// create q tag from hex id
aa.fx.tag_q =(x)=>
{
  let tag = [];
  tag.push('q',x);
  let relay = aa.fx.seen(x);
  if (relay) tag.push(relay);
  return tag
};

aa.fx.tag_value =(a,s)=>
{
  let value,tag = a.find(i=>i[0]===s);
  if (tag && tag.length > 1 && tag[1]) value = tag[1].trim();
  return value;
}


aa.fx.tags_add =(a,b)=>
{
  for (const i of b)
  {
    if (!a.some(t=>t[0] === i[0] && t[1] === i[1])) a.push(i)
  }
};


aa.fx.tags_values =(a,s)=>
{
  return a.filter(t=>t[0]===s).map(r=>r[1].trim())
};


aa.fx.url_from_tags =tags=>
{
  let url;
  let tag = tags.find(t=>t[0] === 'url');
  if (!tag || tag.length < 2)
  {
    tag = tags.find(t=>t[0] === 'imeta');
    if (tag) url = aa.fx.url(aa.fx.a_o(tag).url)?.href;
  }
  else url = aa.fx.url(tag[1])?.href;
  return url
};
