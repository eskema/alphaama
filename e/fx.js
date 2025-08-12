
// gets all p tags from array 
// and checks if metadata is available or if it needs to fetch it
aa.fx.authors_load_from_tags =async tags=>
{
  if (!aa.temp.pubs) aa.temp.pubs = new Map();
  const authors = tags.filter(aa.fx.is_tag_p);
  for (const tag of authors)
  {
    const pubkey = tag[1];
    if (!aa.db.p[pubkey] || !aa.db.p[pubkey].events.k0?.length)
    {
      if (!aa.temp.pubs.has(pubkey)) aa.temp.pubs.set(pubkey,new Set());
      let url = aa.fx.url(tag[2])?.href;
      if (url) aa.temp.pubs.get(pubkey).add(url);
      // aa.fx.a_add(aa.temp.pubs[pubkey],[url]);
    }
  }
  // let pubkeys = Object.keys(aa.temp.pubs);
  if (!aa.temp.pubs.size) return
  
  aa.fx.to(()=>
  {
    let get_a = {store:'authors',a:[...aa.temp.pubs.keys()]}
    aa.db.ops('idb',{get_a}).then(pubs=>
    {
      if (!pubs)
      {
        console.log('aa.fx.authors_load_from_tags',tags,pubs);
        return;
      }
      for (const p of pubs) 
      {
        if (p.events.k0?.length)
        {
          aa.temp.pubs.delete(p.pubkey);
          aa.db.p[p.pubkey] = p;
          aa.p.links_upd(p);
        }
      }
      for (const [pubkey,rset] of aa.temp.pubs)
      {
        aa.e.miss_set('p',pubkey,[...rset.values()])
        // aa.temp.pubs.delete(pubkey);
      }
      aa.temp.pubs.clear()
      // aa.e.miss_get('p');
    });
  },420,'get_pubs');
  
};


aa.fx.dataset =async(element,data)=>
{
  for (const key in data)
  {
    let dis = data[key];
    if (Array.isArray(dis)) dis = dis.join(' ');
    if (!element.dataset[key] 
    || element.dataset[key] !== dis) 
      element.dataset[key] = dis;
  }
};


aa.fx.follow =p=>
{
  let follow = [p.pubkey];
  let relay = aa.p.relay(p);
  if (relay) follow.push(relay);
  let petname;
  if (p.metadata?.name) petname = p.metadata.name;
  else if (p.petnames.length) petname = p.petnames[0];
  if (petname) 
  {
    if (!relay) follow.push('-')
    follow.push(aa.fx.an(petname));
  }
  return follow.join(' ')
};


aa.fx.id_a =o=>
{
  if (!o.kind || typeof o.kind !== 'number') return;
  if (!o.pubkey || !aa.fx.is_key(o.pubkey)) return;
  if (!o.identifier || typeof o.identifier !== 'string') return;
  return `${o.kind}:${o.pubkey}:${o.identifier}`;
};


aa.fx.id_ae =event=>
{
  return aa.fx.id_a(
  {
    kind:event.kind,
    pubkey:event.pubkey,
    identifier:aa.fx.tag_value(event.tags,'d'),
  })
};

// make request filter from addressable string
aa.fx.id_af =string=>
{
  let [kind,pubkey,identifier] = aa.fx.split_ida(string);
  return {
    kinds:[parseInt(kind)],
    authors:[pubkey],
    '#d':[identifier]
  }
};


// checks if element is empty
aa.fx.is_empty =element=>
{
  if (!element) return true;
  if (!element.childNodes.length) return true;
  if (element.firstChild.nodeType === 3)
  {
    const text = (element.textContent+'').trim();
    if (!text || text === ' ') return true
  }
  return false
};


// is tag conditions
aa.fx.is_tag_e =array=> array[0]==='e' && aa.fx.is_hex(array[1]);
aa.fx.is_tag_p =array=> array[0]==='p' && aa.fx.is_hex(array[1]);
aa.fx.is_tag_q =array=> array[0]==='q' && aa.fx.is_hex(array[1]);



// adds classes to notes up the parent tree starting from element
// if a string is given, it will be added to a dataset array 
aa.fx.path =(l,s=false)=>
{
  for (;l&&l!==document;l=l.parentNode) 
  {
    if (l.classList.contains('note'))
    {
      if (!aa.view.in_path.find(i=>i.dataset.id===l.dataset.id))
        aa.view.in_path.push(l);
      
      l.classList.add('in_path');
      if (s)
      {
        let a = l.dataset.path ? l.dataset.path.trim().split(' ') : [];
        let added = aa.fx.a_add(a,[s]);
        if (added) l.dataset.path = a.join(' ');
      }
    }
  }
};


// removes path class and dataset from element
aa.fx.path_remove =l=>
{
  fastdom.mutate(()=>
  {
    l.classList.remove('in_path');
    l.removeAttribute('data-path');
  })
};


// removes path dataset from element and class if empty dataset 
aa.fx.path_rm =s=>
{
  // let in_path = document.querySelectorAll('.in_path');
  const to_rm = [];
  if (aa.view.in_path.length) for (const l of aa.view.in_path)
  {
    let dis;
    if (s && l.dataset.path)
    {
      let a = aa.fx.a_rm(l.dataset.path.trim().split(' '),[s]);
      if (a.length) l.dataset.path = a.join(' ');
      else
      {
        to_rm.push(l.dataset.id);
        aa.fx.path_remove(l);
      }
    }
    else 
    {
      to_rm.push(l.dataset.id);
      aa.fx.path_remove(l);
    }
  }
  if (to_rm.length) 
  {
    aa.view.in_path = aa.view.in_path
      .filter(i=>!to_rm.includes(i.dataset.id));
  }
};


// merge two dat objects
aa.fx.merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let merged,sets = ['seen','subs','clas','refs'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set]=[]; merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (aa.fx.a_add(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false
};


// returns array of tags with all #hashtags in string
aa.fx.hashtags =(string='')=>
{
  const tags = [];
  const hashtags = string.match(aa.fx.regex.hashtag);
  if (hashtags) 
    for (const h of [...new Set(hashtags)]) 
      tags.push(['t',h.slice(1).toLowerCase()])
  return tags
};


// gets all nostr:stuff from string 
// and returns array of tags
// to use when creating a new note
aa.fx.mentions =async(string='')=>
{
  const mentions = [];
  const matches = [...string.matchAll(aa.fx.regex.nostr)];
  for (const match of matches)
  {
    let dis = match[0].slice(6);
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
        let dat = await aa.e.get(e_x);
        if (dat && dat.event.pubkey !== aa.u.p.pubkey) 
          mentions.push(aa.fx.tag_p(dat.event.pubkey));
      }
    }
  }
  return mentions
};


// proof of work abort
aa.fx.pow_abort =(id)=>
{
  let m = aa.temp.mining[id]
  if (!m) return;

  m.ww.terminate();

  let log = document.getElementById('pow_log_'+id);

  let note = document.querySelector('.note[data-id="'+id+'"]');
  if (note) note.classList.remove('mining');

  if (m.ended)
  {
    let t = m.ended - m.start;
    log.textContent = `${m.started} -> done in ${t} ms`;
  }
  else 
  {
    log.textContent = 'pow aborted';
  }
  aa.log_read(log.parentElement);
};


// proof of work
aa.fx.pow =async(event,dif)=>
{
  return new Promise(resolve=>
  {
    if (!aa.temp.mining) aa.temp.mining = {};
    
    const m = aa.temp.mining[event.id] = 
    {
      ended:false,
      dif:dif,
      start:Date.now(),
      started:false,
      ww:new Worker('/e/pow.js'),
    };

    m.start_date = new Date(m.start);
    m.started = `mining pow (${dif}) started ${m.start_date}`;
    
    const log = aa.mk.l('p',{id:'pow_log_'+event.id,con:m.started});
    
    const kill =()=>
    {
      setTimeout(()=>{aa.fx.pow_abort(event.id)},200);
    };
    let butt_cancel = aa.mk.l('button',{con:'abort',cla:'butt no',clk:kill});
    log.append(butt_cancel);
    aa.log(log);

    m.ww.onmessage =message=>
    {
      aa.temp.mining[event.id].ended = Date.now();
      kill();
      resolve(message.data);
    };
    m.ww.postMessage({event:event,difficulty:dif});
  });
};



// pow from nid with target difficulty
aa.fx.pow_note =async(nid,difficulty=0)=>
{
  return new Promise(async resolve=>
  {
    let dat = await aa.e.get(nid);
    let event = dat.event;
    let pow = difficulty;
    if (!pow)
    {
      let nonce = event.tags.filter(t=>t[0] === 'nonce');
      if (!nonce.length) pow = parseInt(localStorage.pow);
    }
    if (pow && aa.fx.clz(nid) < pow) 
    {
      let note = document.querySelector(`.note[data-id="${nid}"]`);
      if (note) note.classList.add('mining');
      let mined = await aa.fx.pow(event,pow);
      let [pow_e,r] = mined;
      if (pow_e)
      {
        if (note) aa.e.note_rm(note)
        event = pow_e;
        aa.e.draft(aa.mk.dat({event}));
      }
      else aa.log('pow failed')
    }
    resolve(event.id)
  });
};


aa.fx.quotes =async id=>
{
  const q_id = 'get_quotes';
  if (!aa.temp.hasOwnProperty(q_id)) aa.temp[q_id] = [];
  aa.temp[q_id].push(id);
  aa.fx.to(aa.e.quotes_to,100,q_id);
};


aa.fx.reply =async(dat,reply_s)=>
{
  if (!reply_s) return;

  let x = aa.fx.decode(reply_s);
  // if (reply_s.startsWith('note'))
  // {
    let reply_dat = await aa.e.get(x);
    if (!reply_dat) 
    {
      console.log('reply not found')
      return
    }
    dat.replying = reply_s;
    aa.fx.reply_kinda(dat,reply_dat);
  // }
  // else if (reply_s.startsWith('npub'))
  // {
  //   aa.log('the dm feature has been disabled for now');
  //   // dat.event.kind = 4;
  //   // dat.event.tags = [['p',x]];
  // }
};


aa.fx.reply_kinda =async(dat,reply_dat)=>
{
  // let notes = new Set([1]);
  let tags;
  if (reply_dat.event.kind === 1)
  {
    tags = aa.fx.tags_for_reply(reply_dat.event)
  }
  else
  {
    switch (reply_dat.event.kind)
    {
      case 11:
      case 1111:
        dat.event.kind = reply_dat.event.kind;
        break;
      default:
        dat.event.kind = 1111;
    }
    tags = await aa.fx.tags_for_comment(reply_dat.event);
  }
  dat.event.tags.push(...tags);
};


// returns a relay that has event x or empty string
aa.fx.seen =x=>
{
  const dat = aa.em.get(x);
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
};


// gets last e tag
aa.fx.tag_e_last =tags=>
{
  let tag = tags.filter(t=>t[0]==='e').pop();
  if (tag && aa.fx.is_tag_e(tag)) return tag;
  return false
};


// gets a or e tag marked 'reply' or the last not marked 'mention'
aa.fx.tag_reply =tags=>
{
  return tags.find(t=>t[0]==='e'&&t[3]==='reply')
  || tags.find(t=>t[0]==='a'&&t[3]==='reply')
  || tags.find(t=>t[0]==='a'&&t[3]!=='mention')
  || tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop()
};


// gets e tag marked 'root' or the first not marked 'mention'
aa.fx.tag_root =tags=>
{
  return tags.find(t=>t[0]==='e'&&t[3]==='root')
  || tags.find(t=>t[0]==='a'&&t[3]!=='root')
  || tags.find(t=>t[0]==='e'&&t[3]!=='mention')
};


aa.fx.tag_comment_reply =tags=>
{
  return tags.find(t=>t[0]==='a') 
  || tags.find(t=>t[0]==='e')
  || tags.find(t=>t[0]==='i')
};


aa.fx.tag_comment_root =tags=>
{
  return tags.find(t=>t[0]==='A')
  || tags.find(t=>t[0]==='E')
  || tags.find(t=>t[0]==='I');
};


// returns tags for building a reply
aa.fx.tags_for_reply =event=>
{
  const tags = [];
  const seen = aa.fx.seen(event.id);
  let tag = aa.fx.tag_root(event.tags);
  // if (!tag) tag = event.tags.find(t=>t[0]==='a'&&t[3]!=='mention');
  if (tag) 
  {
    let root = aa.em.get(tag[1])?.event;
    tag[2] = aa.fx.seen(tag[1]) || aa.fx.url(tag[2])?.href || seen;
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

  const dis_p_tags = aa.fx.a_u(event.tags.filter(t=>aa.fx.is_tag_p(t) && t[1] !== aa.u.p.pubkey));
  if (event.pubkey !== aa.u.p.pubkey 
  && !dis_p_tags.some(t=>t[1] === event.pubkey)) dis_p_tags.push(aa.fx.tag_p(event.pubkey));
  // needs to do more here...
  tags.push(...dis_p_tags);
  return tags
};


// returns tags for building a reply
aa.fx.tags_for_comment =async event=>
{
  
  const seen = aa.fx.seen(event.id);
  const is_reply =kind=>[11,1111].includes(kind);
 
  let reply_tag = ['e',event.id,seen,event.pubkey];
  let reply_kind = ['k',event.kind];

  let root_tag = aa.fx.tag_comment_root(event.tags);
  let root_kind = ['K',event.kind];

  
  const p_tags = [];
  
  if (is_reply(event.kind))
  {
    let og_root_tag = aa.fx.tag_comment_root(event.tags);
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
    p_tags.push(...aa.fx.p_tags(event));
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


// p tags filtered for reply
aa.fx.p_tags =event=>
{
  const p_not_u =tag=> tag[1]!==aa.u.p.pubkey 
    && aa.fx.is_tag_p(tag);

  const tags = aa.fx.a_u(event.tags.filter(p_not_u));
  const not_u = event.pubkey !== aa.u.p.pubkey;
  const not_in_tags = !tags.some(tag=> aa.fx.is_tag_p(tag)
    && tag[1]===event.pubkey);
  
  if (not_u && not_in_tags) tags.push(aa.fx.tag_p(event.pubkey));
  return tags
};