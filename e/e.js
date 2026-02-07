/*

alphaama
mod    e
events notes

*/

aa.e = 
{
  name:'events',
  about:'view and manage events',
  def:{id:'e'},
  kinds:{},
  printed:new Map(),
  sheet:new Map(),
  scripts:
  [
    '/e/clk.js',
    '/e/db.js',
    '/e/fx.js',
    '/e/kinds.js',
    '/e/mk.js',
    '/e/parse.js',
    '/e/printer.js',
    '/e/miss.js',
    '/e/render.js',
    '/e/views.js'
  ],
  styles:
  [
    '/e/e.css',
    '/e/by.css',
    '/e/content.css',
    '/e/tags.css',
    '/e/replies.css',
    '/e/quote.css',
    '/e/highlight.css',
    '/e/actions.css',
    '/e/kind_7.css',
    '/e/follows.css',
  ],
  butts:
  {
    na:[[localStorage.reaction,'react'],'req','bro','render','quote'],
    // k4:['encrypt'],
    draft:['yolo','sign','pow','edit','cancel'],
    not_sent:['post','bro','cancel'],
    blank:['fetch']
  }
};


aa.e.by_ida =dis=>
{
  let last = aa.em_a.get(dis);
  if (!last) return;
  return aa.e.printed.get(last.event.id)
};


// clear notes from section
aa.e.clear_events =s=>
{
  fastdom.mutate(()=>
  {
    aa.e.l.textContent = '';
    aa.el.get('butt_e').dataset.count = 0;
    aa.log('events cleared');
  });
};


aa.e.content =(content,is_trusted)=>
{
  let items =
  [
    {id:'url', regex:aa.regex.url, exe:aa.parse.url},
    {id:'nostr', regex:aa.regex.nostr, exe:aa.parse.nostr},
    {id:'hashtag', regex:aa.regex.hashtag, exe:aa.parse.hashtag},
  ];

  return parse_all({ content, items, is_trusted })
};


// parse content as object
aa.e.content_o =async(element,ls,options)=>
{
  if (!ls && typeof ls !== 'object') return;
  let sort = options.sort || '';
  element.textContent = '';
  element.append(aa.mk.ls({ls, sort}));
};


// toggle parsed content on note
aa.e.context =(element,event,is_trusted)=>
{
  element.classList.add('parsed');
  element.textContent = '';
  element.append(aa.e.content(event.content,is_trusted))
};


aa.e.em =dat=>
{
  // console.log(dat);
  const id = dat?.event?.id;  
  if (!aa.em.has(id))
  {
    aa.em.set(id,dat);
    if (dat.id_a)
    {
      if (aa.em_a.has(dat.id_a))
      {
        let last = aa.em_a.get(dat.id_a).event.created_at;
        if (last < dat.event.created_at)
          aa.em_a.set(dat.id_a,dat)
      }
      else aa.em_a.set(dat.id_a,dat);
    }
  }
  return id
};


// decrypt event from id
aa.e.decrypt =async id=>
{
  if (!aa.fx.is_hex(id))
  {
    aa.log('invalid id');
    return
  }

  let dat = await aa.e.get(id);
  if (!dat)
  {
    aa.log('event not found');
    return
  }

  let {kind,tags,content,pubkey} = dat.event;
  if (kind === 4)
  {
    let pub_to = aa.fx.tag_value(tags,'p');
    if (aa.u.is_u(pub_to))
    {
      aa.log('content not for you');
      return
    }
  }

  let decrypted = await aa.fx.decrypt(content+' '+pubkey, id);
  if (!decrypted)
  {
    aa.log('decrypt failed');
    return
  }

  aa.e.decrypted_content(id,decrypted);
  return decrypted
};


aa.e.decrypted_content =async(id,decrypted)=>
{
  let note = aa.e.printed.get(id);
  if (!note) 
  {
    aa.log('decrypted cyphertext:');
    aa.log(decrypted);
  }
  else
  {
    fastdom.mutate(()=>
    {
      let content = note.querySelector('.content');
      content.classList.remove('encrypted');
      content.classList.add('decrypted');
      content.querySelector('.butt.decrypt')?.remove();
      
      content.append('\n',aa.e.content(decrypted));
    })
  }
};


aa.e.anal =()=>
{
  let authors = new Map();
  for (const dat of aa.em.values())
  {
    if (!authors.has(dat.event.pubkey))
    {
      authors.set(dat.event.pubkey,new Set());
    }
   authors.get(dat.event.pubkey).add(dat.event.id);
  }
  let array = [...authors.entries()]
    .sort((a,b)=>a[1].size < b[1].size ? 1 : -1 )
    .map(i=>
    {
      let pubkey = i[0];
      let name = aa.temp.p_link.get(pubkey)?.data.name
        || aa.db.p[pubkey]?.metadata?.name;
      return [name,...i]
    })
    
  return array
};

// build p tag from string
aa.e.follow_tag =string=>
{
  let [key,rest] = string.split(aa.regex.fw);
  if (key.startsWith('npub')) key = aa.fx.decode(key);
  if (!aa.fx.is_key(key)) 
  {
    aa.log('invalid key to follow '+key);
    return false
  }

  if (aa.p.following(key)) 
  {
    aa.log('already following '+key);
    return false
  }

  let tag = ['p',key];
  
  let [relay,petname] = rest.trim().split(aa.regex.fw);
  relay = aa.fx.url(relay)?.href || '';
  if (relay) tag.push(relay);
  
  petname = aa.fx.an(petname);
  if (petname)
  {
    if (!relay) tag.push('');
    tag.push(petname)
  }
  
  return tag
};


// add key to follow list (kind:3)
aa.e.follows_add =async string=>
{
  if (!aa.u.p) 
  {
    aa.log('follows_add: login first')
    return
  }

  let tag = aa.e.follow_tag(string);
  if (!tag) return;
  
  let dat = await aa.p.events_last(aa.u.p,'k3');
  if (!dat) return false;
  dat = await aa.e.get(dat);
  if (!dat)
  {
    aa.log('follows_add: no list found, create one first');
    return
  }

  // if (aa.e.tags_has_tag(dat.event.tags,tag))
  if (dat.event.tags.find(t=> t[0]===tag[0] && t[1]===tag[1]))
  {
    aa.log('follows_add: already in list');
    return
  }

  const {kind,content,tags} = dat.event;
  tags.push(tag);

  let l = make('div',
  {
    cla:'follows_add',
    app:
    [
      make('h2',{con:'item to add'}),
      aa.mk.tag_list([tag]),
      ' ',aa.mk.details(`preview (${tags.length})`,aa.mk.tag_list(tags),0,'base')
    ]
  });

  aa.mk.confirm(
  {
    title:`list update (kind:${kind})`,
    l,
    no:{exe:()=>{}},
    yes:{exe:()=>
    {
      aa.e.finalize(aa.e.normalise({kind,content,tags}));
      setTimeout(()=>
      {
        aa.p.author(tag[1]).then(p=>{aa.p.profile_upd(p)})
      },500);
    }}
  });
};


aa.mk.new_list =(tags,kind)=>
{

};


// check if already in list
aa.e.tags_has_tag =(tags,tag)=>
{
  if (!tag || !tags.length) return false;
  return tags.find(t=> t[0]===tag[0] && t[1]===tag[1])
};


// delete keys from follow list (kind:3)
aa.e.follows_del =async string=>
{
  if (!aa.u.p)
  {
    aa.log('follows_del: login first');
    return
  }
  
  let id = await aa.p.events_last(aa.u.p,'k3');
  if (!id) return;
  dat = await aa.e.get(id);
  if (!dat) 
  {
    aa.log('follows_del: no list found, create one first');
    return
  }

  aa.cli.fuck_off();

  let {kind,content,tags} = dat.event;

  let keys_to_unfollow = aa.fx.splitr(string,',')
    .map(key=> key.startsWith('npub')
      ? aa.fx.decode(key) 
      : key)
    .filter(key=>aa.fx.is_key(key));

  // for (let key of keys_to_unfollow)
  // {
  //   if (key.startsWith('npub')) key = aa.fx.decode(key);
  //   if (aa.fx.is_hex(key)) 
  //   {
  //     removed_list.append(make('li',{con:key,cla:'disabled'}));
  //     tags = tags.filter(tag=>tag[1]!==key);
  //     aa.p.score(`${key} 4`);
  //   }
  //   else aa.log('follows_del: invalid pubkey to delete')
  // }
  const is_excluded = tag=> keys_to_unfollow.includes(tag[1]);
  removed_tags = tags.filter(is_excluded);
  tags = tags.filter(i=>!is_excluded(i));

  let l = make('div',
  {
    cla:'follows_del',
    app:
    [
      make('h2',{con:`items to remove: (${removed_tags.length})`}),
      aa.mk.tag_list(removed_tags,{cla:'disabled'}),
      ' ',aa.mk.details(`preview (${tags.length})`,aa.mk.tag_list(tags),0,'base')
    ]
  });

  aa.mk.confirm(
  {
    title:`list update (kind:${kind})`,
    l, //:make('div',{cla:'wrap',app:[aa.mk.tag_list(tags),removed_list]}),
    // scroll:{behaviour:'smooth',block:'end'},
    no:{ exe:()=>{} },
    yes:
    { exe:()=> 
      {
        aa.e.finalize(aa.e.normalise({kind,content,tags}));
        setTimeout(()=>
        {
          for (let key of keys_to_unfollow) 
            aa.p.score(`${key} 4`);
        },200)
      }
    },
  });
};


// get stored events
aa.e.get =async ids=>
{
  let multi = Array.isArray(ids);
  if (!multi) ids = [ids];
  
  ids = ids.filter(aa.fx.is_key);
  if (!ids.length) return;
  let want = new Set(ids);
  
  let result = [];
  for (const id of want)
  {
    if (aa.em.has(id)) 
    {
      result.push(aa.em.get(id));
      want.delete(id);
    }
  }
  if (want.size)
  {
    let [ get_id, events ] = await aa.r.get_events([...want]);
    if (events?.length)
    {
      for (const dat of events)
      {
        if (!dat?.event)
        {
          console.log(dat)
          continue
        }
        aa.e.em(dat);
        result.push(dat)
      }
    }
  }
  return multi ? result : result[0]
};


// returns event if already loaded or get it from database
aa.e.get_a =async ids=>
{
  let multi = Array.isArray(ids);
  if (!multi) ids = [ids];
  if (!ids.length) return;
  let want = new Set(ids);
  
  let result = [];
  for (const id of want)
  {
    if (aa.em_a.has(id))
    {
      result.push(aa.em_a.get(id));
      want.delete(id);
    }
  }
  if (want.size)
  {
    let filters = [...want].map(aa.fx.id_af);
    for (const filter of filters)
    {
      let [get_id,events] = await aa.r.get_filter(filter);
      if (events.length)
      {
        for (const dat of events)
        {
          aa.e.em(dat);
          result.push(dat)
        }
      }
    }
  }
  return multi ? result : result[0]
};


// inbox relays from tagged users in event
aa.e.inboxes =(event,relays=[])=>
{
  let relays_set = new Set(relays);
  let pubs = event.tags.filter(aa.fx.is_tag_p).map(i=>i[1]);
  for (const x of pubs)
  {
    let read_relays = new Set(aa.fx.in_set(aa.db.p[x].relays,'read'));
    let common = read_relays.intersection(relays_set);
    if (common.size < 3)
    {
      let unc = relays_set.difference(read_relays);
      relays.push([...unc].slice(0,3 - common.size))
    }
  }
  return new Set(relays);
};


// returns event raw json
aa.e.json =async(s='')=>
{
  let dat = await aa.e.get(s);
  if (dat) return JSON.stringify(dat.event)
  else return 'event not found '+s
};


// on load
aa.e.load =async()=>
{
  let mod = aa.e;
  let id = mod.def.id;
  
  aa.temp.miss = {};
  aa.temp.orphan = new Map();
  aa.temp.prints = new Map();
  aa.temp.refs = new Map();
  aa.temp.note_quotes = new Map();
  aa.view.clears.push(aa.e.view_clear);
  fetch('/e/nostr_kinds.json')
    .then(dis=> dis.json())
    .then(dis=> mod.kinds_list = dis);
  
  // await aa.add_scripts(mod.scripts);

  aa.actions.push(
    {
      action:[id,'clear'],
      description:'clear events section',
      exe:mod.clear_events
    },
    {
      action:[id,'decrypt'],
      required:['<id>'],
      description:'decrypt note',
      exe:mod.decrypt
    },
    {
      action:[id,'s'],
      required:['<value>'],
      description:'search notes content for value',
      exe:mod.search
    },
    {
      action:[id,'json'],
      required:['<id>'],
      description:'return event JSON by id (hex)',
      exe:mod.json
    },
    {
      action:[id,'view'],
      required:['<id>'],
      description:'view event by id (hex)',
      exe:(s)=>{ aa.view.state('#'+aa.fx.encode('note',s)) }
    },
  );
  mod.l = make('div',{cla:'notes'});
  mod.section_observer = new MutationObserver(mod.section_mutated);
  mod.section_observer.observe(mod.l,{attributes:false,childList:true});
  aa.mod.help_setup(aa.e);
  aa.cli.on_upd.push(aa.e.draft_upd);
};


// note actions
aa.e.note_actions =dat=>
{
  // console.log(dat);
  const l = make('p',{cla:'actions expanded'});
  let butts = [];
  if (dat.clas.includes('draft'))
  {
    switch (dat.event.kind)
    {
      case 4: 
        if (!dat.clas.includes('encrypted'))
        {
          aa.fx.a_add(butts,aa.e.butts.k4);
          break;
        }
      default: 
        aa.fx.a_add(butts,aa.e.butts.draft);
    }
    l.setAttribute('open','')
  }
  else if (dat.clas.includes('not_sent')) aa.fx.a_add(butts,aa.e.butts.not_sent);
  else if (dat.clas.includes('blank')) aa.fx.a_add(butts,aa.e.butts.blank);
  else
  {
    // aa.mk.butt_clk(s)
    aa.fx.a_add(butts,[['…','action_butt','na']]);
    l.classList.add('empty');
    l.classList.remove('expanded');
  }
  if (butts.length) for (const array of butts)
    l.append(aa.mk.butt_clk(array),' ');
  return l
};


// action to add proof-of-work (pow) to a note
aa.e.pow =async(string='')=>
{
  let [id,difficulty] = aa.fx.splitr(string)
  difficulty = parseInt(difficulty);
  
  if (!aa.fx.is_hex(id) || !difficulty) 
  { 
    aa.log('pow failed'); 
    return 
  }
  return await aa.fx.pow_note(id,difficulty);
};


aa.e.quote =data=>
{
  const quote_note = make('blockquote',
  {
    cla:'note_quote',
    dat:
    {
      id:data.id,
      id_a:data.id_a
    },
    app:make('div',
    {
      cla:'content parsed',
      app:aa.mk.ls({ls:data})
    })
  });
  aa.e.quote_note_replace(quote_note,data);
  return quote_note
};


aa.e.quote_note =async(element,dat)=>
{
  let p = await aa.p.author(dat.event.pubkey);
  const authors = dat.event.tags.filter(aa.fx.is_tag_p);
  authors.push(['p',dat.event.pubkey]);
  aa.e.authors(authors);
  aa.fx.color(p.pubkey,element);
  let header = aa.mk.event_header(dat);
  let content = await aa.e.render(dat);
  if (content.classList.contains('no_content'))
    content.append(aa.mk.tag_list(dat.event.tags));
  // let content = make('div',{cla:'content',con:dat.event.content});
  element.textContent = '';
  element.append(header,content);
  element.dataset.kind = dat.event.kind;
  if (!element.dataset.id) element.dataset.id = dat.event.id;
  // aa.e.render(element);
};


aa.e.quote_note_replace =async(element,data)=>
{
  try
  {
    // let dat;
    // if (data.id_a) dat = await aa.e.get_a(data.id_a);
    // else dat = await aa.e.get(data.id);
    let dat = await aa.e.get(data.id);
    
    if (dat) aa.e.quote_note(element,dat);
    else aa.e.miss_quote(element,data);
  }
  catch(er) 
  { 
    console.error(data,er)
  }
};


aa.e.quote_update =dat=>
{
  // console.log('quote_update',dat);
  
  let id = dat?.id_a || dat?.event?.id;
  if (!id) return;

  let note_quotes = aa.temp.note_quotes.get(id);
  if (!note_quotes) return;
  
  for (const element of note_quotes)
  {
    aa.e.quote_note(element,dat)
  }
  aa.temp.note_quotes.delete(id);
};


// search notes content for value
aa.e.search =async s=>
{
  s = s.toLowerCase();
  let df = new DocumentFragment();
  let contents = document.getElementsByClassName('content');
  for (const content of contents)
  {
    let text = content.textContent.toLowerCase();
    let has = text.search(s);
    if (has !== -1) 
    {
      let l_event = content.parentElement;
      let name = l_event.querySelector('.by .name').textContent;
      let con = `${name}: ${text.slice(has,has+21)}… `;
      let app = aa.mk.nostr_link(l_event.id);
      df.append(make('p',{con,app}),' ');
    }
  }
  aa.log(aa.mk.details(`e (s)earch results for ${s}`,df,1))
};


// mutation observer for notes section
aa.e.section_mutated =a=>
{
  let threshold = parseInt(localStorage.pagination) || 0;
  for (const mutation of a)
  {
    let count  = mutation.target.children.length;
    const needs = count > threshold;
    const has_class = aa.l.classList.contains('needs_pagin');
    
    if (needs && !has_class)
    {
      fastdom.mutate(()=>{aa.l.classList.add('needs_pagin')})
    }
    else if (!needs && has_class)
    {
      fastdom.mutate(()=>{aa.l.classList.remove('needs_pagin')})
    }
  }
};


// view event
aa.e.view =element=>
{
  fastdom.mutate(()=>
  {
    if (element.classList.contains('not_yet')) 
      aa.e.note_yet(element);
    
    // Check if element is actually connected to the document
    if (!element.isConnected)
    {
      let root = element;
      if (!element.classList.contains('root'))
      {
        root = element.closest('.root');
      }
      aa.e.l.append(root)
    }

    aa.l.classList.add('viewing','view_e');
    element.classList.add('in_view');
    aa.view.in_view = element;
    sift.path_add(element,'note');

    aa.clk.time({target:element.querySelector('.by .created_at')});
    
    setTimeout(()=>{aa.fx.scroll(element)},200);
  });
};


// clear view from aa.e.view
aa.e.view_clear =in_view=>
{
  if (Object.hasOwn(aa.view,'id_a')) 
    delete aa.view.id_a;

  aa.l.classList.remove('view_e');
  sift.solo_clear(aa.temp[`section_e`]);
};


// draft event
aa.e.draft =async dat=>
{
  aa.fx.a_add(dat.clas,['draft']);
  dat.event.tags = [...new Set(dat.event.tags)];
  if (!dat.event.id) dat.event.id = aa.fx.hash(dat.event);
  aa.em.set(dat.event.id,dat);
  aa.e.print(dat);
  
  let section = aa.el.get('section_e');//document.getElementById('e');
  if (section && !section.classList.contains('expanded')) 
    aa.clk.expand({target:section});
  
  aa.log(make('button',
  {
    cla:'butt exe',
    con:`draft: ${dat.event.content.slice(0,12)}…`,
    clk:e=>
    {
      let draft = aa.e.printed.get(dat.event.id);
      if (draft) aa.fx.scroll(draft);
      else aa.log('draft not found');
    }
  }))
};


// creates new dat object (event)
aa.e.draft_dat =async(content,reply_to)=>
{
  aa.temp.dat = aa.mk.dat(
  {
    event: aa.e.normalise({content}),
    clas:['draft']
  });

  aa.fx.reply(aa.temp.dat,reply_to);
};


// creates / updates / deletes dat event from input
aa.e.draft_upd =async(s='')=>
{
  if (!aa.u.p)  return
  if (!s) s = aa.cli.t.value;
  if (s.length)
  {
    const reply_to = aa.view.active;
    if (reply_to 
    && aa.temp.dat?.replying !== reply_to) 
      delete aa.temp.dat;
    if (!aa.temp.dat) aa.e.draft_dat(s,reply_to)
    else aa.temp.dat.event.content = s;
  }
  else if (aa.temp.dat) delete aa.temp.dat;
};


// finalize event creation
aa.e.finalize =async(event,relays)=>
{
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  const signed = await aa.e.sign(event);
  if (signed)
  {
    event = signed;
    let dat = aa.mk.dat({event});
    // aa.em.set(event.id,dat);
    // aa.db.upd_e(dat);
    aa.e.print(dat);
    aa.r.send_event({event,relays});
  }
};


// fill missing event fields
aa.e.normalise =(event={})=>
{
  if (!event.pubkey) event.pubkey = aa.u.p.pubkey;
  if (!event.kind) event.kind = 1;
  if (!event.created_at) event.created_at = aa.now;
  if (!event.tags) event.tags = [];
  if (!event.content) event.content = '';
  return event
};


// sign event
aa.e.sign =async event=>
{
  return new Promise(resolve=>
  {
    if (!window.nostr) 
    {
      aa.log('you need a signer');
      resolve(false)
    }
    window.nostr.signEvent(event).then(resolve);
  });
};