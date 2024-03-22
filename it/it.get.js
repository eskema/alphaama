// get stuff from stuff

it.get ={};


// checks array for condition 1
// if yes, check for condition 2
// if yes return it 
// else add it to array
// if no condition 2 is found return array

it.get.if_if =(a,if_1,if_2)=>
{
  const b = [];
  for (let i=0;i<a.length;i++) 
  {
    if (if_1(a[i]))
    {
      if (if_2(a[i])) return a[i];
      b.push(a[i])
    }
  }
  return b
};


// get elements with key:value

it.get.index_items =(k,v)=>
{
  let items;
  switch (k)
  {
    case 'subs': 
      items = document.querySelectorAll('.note[data-subs="'+v+'"]');
      break;
    case 'authors': 
      items = document.querySelectorAll('.note[data-pubkey="'+v+'"]');
      break;
    case 'kinds': 
      items = document.querySelectorAll('.note[data-kind="'+v+'"]');
      break;
    case 'tag_t':
    case 'tag_subject': 
    case 'tag_d':
      let tagged = {};
      let tags = document.querySelectorAll('.'+k+'[data-tag="'+v+'"]');
      tags.forEach((tag)=>
      {
        let l = tag.closest('.note');
        if (!tagged[l.id]) tagged[l.id] = l;
      });
      items = Object.values(tagged);
      break;
    case 'since': s2 = ' .note[data-pubkey="'+v+'"]'; break;
    case 'until': s2 = ' .note[data-pubkey="'+v+'"]'; break;
    // default: console.log(sect)
  }
  return items
};


// nip05 (wip)

it.get.nip05 =async s=>
{
  let nip05 = await NostrTools.nip05.queryProfile(s);
  console.log(nip05);
};


// returns a relay that has event x or empty string

it.get.seen =(x)=>
{
  const dat = aa.e[x];
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
};


// returns tags of type from event

it.get.tags =(event,type)=> event.tags.filter(tag=>tag[0]===type);


// returns tags for building a reply

it.get.tags_for_reply =(event)=>
{  
  const tags = [];
  const seen = it.get.seen(event.id);
  let relay;
  let root_tag = it.get.root_tag(event.tags);
  if (root_tag.length) 
  {
    relay = it.s.url(root_tag[2])?.href || seen;
    root_tag[2] = relay;
    root_tag[3] = 'root';
    root_tag.splice(4);
    tags.push(root_tag,['e',event.id,seen,'reply']);
  }
  else tags.push(['e',event.id,seen,'root']);
  const pubkeys_to_add = [];
  const pubkeys = event.tags.filter(t=>it.s.tag.p(t) && t[1] !== aka.o.ls.xpub);
  for (const pub of pubkeys) pubkeys_to_add.push(pub)
  let unique = [...new Set(pubkeys)];
  if (event.pubkey !== aka.o.ls.xpub && !unique.some(t=>t[1] === event.pubkey)) unique.push(['p',event.pubkey])
  tags.push(...unique);
  return tags
};

// gets e tag marked 'reply' or the last not marked mention
it.get.reply_tag =tags=>
{
  let reply_tag = tags.filter(t=>t[0]==='e'&&t[3]==='reply')[0];
  if (!reply_tag) reply_tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop();
  if (reply_tag && it.s.tag.e(reply_tag)) return reply_tag;

  // const a = it.get.if_if(tags,it.s.tag.e,it.s.tag.reply);
  // let is_a = Array.isArray(a[0]);
  // if (a && !is_a) return a;
  // while (a.length)
  // {
  //   let tag = a.pop();
  //   if (!it.s.tag.marked('mention',tag)) return tag;
  // }
  return false
};

// gets e tag marked 'root' or the first not marked mention
it.get.root_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='root')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention')[0];
  if (tag && it.s.tag.e(tag)) return tag;

  // const a = it.get.if_if(tags,it.s.tag.e,it.s.tag.root);
  // let is_a = Array.isArray(a[0]);
  // if (a && !is_a) return a;
  // while (a.length)
  // {
  //   let tag = a.shift();
  //   if (!it.s.tag.marked('mention',tag)) return tag;
  // }
  return false
};

// gets all p tags from array 
// and checks if data is available or if it needs to fetch it
it.get.pubs =async tags=>
{
  if (!aa.q.pubs) aa.q.pubs = {};
  let a = tags.filter(t=>it.s.tag.p(t));
  for (const tag of a)
  {
    let x = tag[1];
    let r = tag[2];
    if (!aa.p[x] || !aa.p[x].pastdata.k0.length)
    {
      if (!aa.q.pubs[x]) aa.q.pubs[x] = [];
      let url = it.s.url(r);
      if (url) it.fx.a_add(aa.q.pubs[x],[url.href]);
    }
  }
  let pubkeys = Object.keys(aa.q.pubs);
  if (pubkeys.length)
  {
    it.to(()=>
    {
      aa.db.get({get_a:{store:'authors',a:pubkeys}}).then(dat=>
      {
        for (const p of dat) 
        {
          if (p.pastdata.k0.length)
          {
            aa.p[p.xpub] = p;
            delete aa.q.pubs[p.xpub];
            author.links(p);
          }          
        }
        for (const x in aa.q.pubs) 
        {
          if (!aa.miss.p[x]) aa.miss.p[x] = {nope:[],relays:[]}
          it.fx.a_add(aa.miss.p[x].relays,aa.q.pubs[x]);
          delete aa.q.pubs[p.xpub];
        }
        aa.missing('p');
      });
    },500,'get_pubs');
  }
};

// gets all blank quotes and replaces with actual data
it.get.quotes =async id=>
{
  let quotes = document.querySelectorAll('.blank_quote[data-id="'+id+'"]');
  if (quotes.length)
  {
    let dat = await aa.db.get_e(id);
    if (!dat) dat = {event:{"id":id}};
    let quote = kin.quote(dat.event);
    setTimeout(()=>{ for(const q of quotes) q.replaceWith(quote)},100);
  }
};