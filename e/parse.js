// parse hashtag
aa.parse.hashtag =match=>
{
  return aa.mk.l('span',
  {
    cla:'hashtag',
    con:match[0],
    dat:{label:match[0].slice(1).toLowerCase()}
  })
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
      let mm = a[1].match(aa.regex.bech32);
      if (mm[0] && mm.index === 0)
      {
        let s = a[0] + '1' + mm[0];
        let decoded = aa.fx.decode(s);
        if (decoded)
        {
          df.append(aa.mk.nip19(s),' ');
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