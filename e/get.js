// returns array of tags with all #hashtags in string
aa.get.hashtag =s=>
{
  const tags = [];
  const hashtags = s.match(aa.fx.regex.hashtag);
  if (hashtags) for (const h of hashtags) tags.push(['t',h.slice(1).toLowerCase()])
  return tags
};


// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
aa.get.mentions =async s=>
{
  const mentions = [];
  const matches = [...s.matchAll(aa.fx.regex.nostr)];
  for (const m of matches)
  {
    let dis = m[0].slice(6);
    if (dis.startsWith('npub')) 
    {
      let p_x = aa.fx.decode(dis);
      if (p_x) mentions.push(aa.fx.tag_p(p_x));
    }
    else if (dis.startsWith('note'))
    {
      const e_x = aa.fx.decode(dis);
      if (e_x) 
      {
        mentions.push(aa.fx.tag_q(e_x));
        let dat = await aa.db.get_e(e_x);
        if (dat && dat.event.pubkey !== aa.u.p.pubkey) mentions.push(aa.fx.tag_p(dat.event.pubkey));
      }
    }
  }
  return mentions
};


// get missing a, e or p
aa.get.missing =async type=>
{
  aa.fx.to(()=>
  {
    let miss = {};
    
    let def_relays = aa.fx.in_set(aa.r.o.ls,aa.r.o.r);
    for (const xid in aa.miss[type])
    {
      let v = aa.miss[type][xid];
      aa.e.nope(xid,def_relays,v.nope,miss);
      aa.e.nope(xid,v.relays,v.nope,miss);
    }

    if (Object.keys(miss).length)
    {
      let options = {eose:'close'};
      let filter;
      let req;
    
      let [url,ids] = Object.entries(miss)
        .sort((a,b)=>a.length - b.length)[0];
      let relays = [url];
      for (const id of ids) aa.fx.a_add(aa.miss[type][id].nope,relays);
      
      if (type === 'e' || type === 'p')
      {
        if (type === 'p') filter = {authors:ids,kinds:[0]};
        else filter = {ids:ids};
      }
      else if (type === 'a')
      {
        for (const id of ids)
        {
          let [n,x,s] = aa.fx.split_ida(id);
          filter = {kinds:[parseInt(n)],authors:[x],'#d':[s]};
        }
      }
      if (filter)
      {
        let keys = Object.keys(filter).sort();
        let tags = [];
        for (const key of keys)
        {
          let item = [key];
          let i = filter[key];
          if (Array.isArray(i)) 
            item.push(...i.map(b=>typeof b==='string'?b:b.toString())
              .sort());
          else item.push(i);
          tags.push(item);
        }
        
        let req_id = type+'_'+aa.fx.hash(aa.e.normalise({tags,created_at:1})).slice(0,12);
        // aa.r.on_sub.set(req_id,aa.r.dat);
        // request = ['REQ',req_id,filter];
        aa.r.def_req(req_id,filter,relays);
        setTimeout(()=>
        {
          if (Object.keys(aa.miss[type]).length) aa.get.missing(type);
        },420);
      }
    }
  },420,'miss_'+type);
};



aa.get.note_refs =note=>
{
  setTimeout(()=>
  {
    aa.e.note_refs(note.dataset.id);
    if (note.dataset.id_a) aa.e.note_refs(note.dataset.id_a);
  },210)
};



aa.get.quotes =async id=>
{
  const q_id = 'get_quotes';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.temp[q_id].push(id);
  aa.fx.to(aa.e.quotes_to,100,q_id);
};


// returns a relay that has event x or empty string
aa.get.seen =x=>
{
  const dat = aa.db.e[x];
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
};


// gets last e tag
aa.get.tag_e_last =tags=>
{
  let tag = tags.filter(t=>t[0]==='e').pop();
  if (tag && aa.is.tag_e(tag)) return tag;
  return false
};


// gets a or e tag marked 'reply' or the last not marked 'mention'
aa.get.tag_reply =tags=>
{
  let tag = tags.find(t=>t[0]==='e'&&t[3]==='reply')
  || tags.find(t=>t[0]==='a'&&t[3]==='reply')
  || tags.find(t=>t[0]==='a'&&t[3]!=='mention')
  || tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop();
  return tag
};


// gets e tag marked 'root' or the first not marked 'mention'
aa.get.tag_root =tags=>
{
  let tag = tags.find(t=>t[0]==='e'&&t[3]==='root')
  || tags.find(t=>t[0]==='a'&&t[3]!=='root')
  || tags.find(t=>t[0]==='e'&&t[3]!=='mention');
  return tag
};


aa.get.tag_comment_reply =tags=>
{
  return tags.find(t=>t[0]==='a') 
  || tags.find(t=>t[0]==='e')
  || tags.find(t=>t[0]==='i');
};


aa.get.tag_comment_root =tags=>
{
  let tag = tags.find(t=>t[0]==='A')
  || tags.find(t=>t[0]==='E')
  || tags.find(t=>t[0]==='I');
  return tag
};


// returns tags for building a reply
aa.get.tags_for_reply =event=>
{  
  const tags = [];
  const seen = aa.get.seen(event.id);
  let tag = aa.get.tag_root(event.tags);
  // if (!tag) tag = event.tags.find(t=>t[0]==='a'&&t[3]!=='mention');
  if (tag) 
  {
    let root = aa.db.e[tag[1]]?.event;
    tag[2] = aa.get.seen(tag[1]) || aa.is.url(tag[2])?.href || seen;
    tag[3] = 'root';
    if (root) tag[4] = root.pubkey
    tag.splice(4);
    tags.push(tag);
    if (root 
    && aa.fx.kind_type(event.kind) !== 'parameterized'
    && event.kind !== 1)
    {
      tags.push(['K',''+root.kind]);
    }
    tags.push(['e',event.id,seen,'reply',event.pubkey]);
    if (event.kind !== 1) tags.push(['k',`${event.kind}`]);
  }
  else
  {
    if (aa.fx.kind_type(event.kind) === 'parameterized')
    {
      let tag_a = aa.fx.tag_a(event);
      if (tag_a) 
      {
        tag_a.push(seen,'root');
        tags.push(tag_a);
      }
    }
    tags.push(['e',event.id,seen,'root',event.pubkey]);
    if (event.kind !== 1) tags.push(['K',`${event.kind}`]);
  }

  const dis_p_tags = aa.fx.a_u(event.tags.filter(t=>aa.is.tag_p(t) && t[1] !== aa.u.p.pubkey));
  if (event.pubkey !== aa.u.p.pubkey 
  && !dis_p_tags.some(t=>t[1] === event.pubkey)) dis_p_tags.push(aa.fx.tag_p(event.pubkey));
  // needs to do more here...
  tags.push(...dis_p_tags);
  return tags
};


// returns tags for building a reply
aa.get.tags_for_comment =async event=>
{
  
  const seen = aa.get.seen(event.id);
  const is_reply =kind=>[11,1111].includes(kind);
 
  let reply_tag = ['e',event.id,seen,event.pubkey];
  let reply_kind = ['k',event.kind];

  let root_tag = aa.get.tag_comment_root(event.tags);
  let root_kind = ['K',event.kind];

  
  const p_tags = [];
  
  if (is_reply(event.kind))
  {
    let og_root_tag = aa.get.tag_comment_root(event.tags);
    if (!og_root_tag)
    {
      aa.log('error');
      return
    }
    // should rebuild root tag but for now it just copies
    // from replied event
    root_tag = og_root_tag;
    let og_root_kind = event.tags.find(i=>i[0]==='K');
    if (og_root_kind) root_kind = og_root_kind;
    p_tags.push(...aa.get.p_tags(event));
  }
  else
  {
    if (aa.fx.kind_type(event.kind) === 'parameterized')
    {
      reply_tag = aa.fx.tag_a(event);
      if (!reply_tag)
      {
        aa.log('error')
        return
      }
      reply_tag.push(seen);
      root_tag = ['A',...reply_tag.slice(1)];

    }
    p_tags.push(aa.fx.tag_p(event.pubkey));
  }
  return [root_tag,root_kind,reply_tag,reply_kind,...p_tags];
  //return tags_for_comment
};


aa.get.p_tags =(event)=>
{
  let condition =t=> t[1]!==aa.u.p.pubkey && aa.is.tag_p(t);
  const tags = aa.fx.a_u(event.tags.filter(condition));
  
  const not_u = event.pubkey !== aa.u.p.pubkey;
  const not_in_tags = !tags.some(t=> t[0]==='p' && t[1]===event.pubkey);
  
  if (not_u && not_in_tags) tags.push(aa.fx.tag_p(event.pubkey));
  return tags
};