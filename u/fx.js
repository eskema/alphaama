// make p tag array from array
aa.fx.tag_k3 =a=>
{
  let tag = ['p'];
  let k,relay,petname;
  
  if (a.length) k = a.shift().trim();
  if (!k) return false;
  if (k.startsWith('npub')) k = aa.fx.decode(k);
  if (!aa.is.key(k)) 
  {
    aa.log('invalid key to follow '+k);
    return false
  }
  if (aa.is.following(k)) 
  {
    aa.log('already following '+k);
    return false
  }
  tag.push(k);

  if (a.length) 
  {
    relay = a.shift().trim();
    let url = aa.is.url(relay);
    if (url) tag.push(url.href);
    else tag.push('')
  }

  if (a.length) 
  {
    petname = a.shift().trim();
    tag.push(aa.fx.an(petname));
  }
  while (tag[tag.length - 1].trim() === '') tag.pop();
  return tag
};