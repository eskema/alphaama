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
  printed:new Map(),
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
  styles:['/e/e.css'],
  butts:
  {
    na:[[localStorage.reaction,'react'],'req','bro','render','tiny','quote'],
    // k4:['encrypt'],
    draft:['yolo','sign','pow','edit','cancel'],
    not_sent:['post','bro','cancel'],
    blank:['fetch']
  }
};


aa.e.by_ida =dis=>
{
  for (const [id,event] of aa.e.printed)
  {
    if (event.dataset.id_a === dis) return event
  }
  return
};


// clear notes from section
aa.e.clear =s=>
{
  fastdom.mutate(()=>
  {
    aa.e.l.textContent = '';
    aa.el.get('butt_e').dataset.count = 0;
    aa.log('events cleared');
    aa.cli.fuck_off();
  });
};


// splits a string into paragraphs, then into lines and then into words 
// and process each part separately
aa.e.content =(s,trusted)=>
{
  const df = new DocumentFragment();
  let l = aa.mk.l('p',{cla:'paragraph'});
  // checks if element has no children and is empty, ignores trailing spaces
  const another_l =last_l=>
  {
    last_l.normalize();
    if (aa.fx.is_empty(last_l)) last_l.remove();
    else 
    {
      df.append(last_l);
      l = aa.mk.l('p',{cla:'paragraph'});
    }
  };
  let paragraphs = s.split(/\n\s*\n/);
  if (paragraphs.length === 1) paragraphs = s.split(/\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;    
    
    const lines = paragraph.trim().split(/\n/);
    for (let li=0;li<lines.length;li++)
    {
      if (l.childNodes.length) l.append(aa.mk.l('br'));

      const words = lines[li].trim().split(' ');
      for (let i=0;i<words.length;i++)
      {
        let word = words[i].trim();
        if (!word.length) continue;

        if (aa.fx.regex.url.test(word)) 
        {
          let dis_node = aa.parser('url',word,trusted);
          l.append(dis_node,' ');
        }
        else if (aa.fx.regex.nostr.test(word)) 
        {
          let parsed = aa.parser('nostr',word);
          let quote = parsed.querySelector('blockquote');
          if (quote)
          {
            another_l(l); 
            df.append(quote)
          }
          else l.append(parsed);
        }
        else if (aa.fx.regex.hashtag.test(word)) 
        {
          let dis_node = aa.parser('hashtag',word);
          l.append(dis_node,' ');
        }
        else 
        {
          if (i === words.length-1) l.append(word);
          else l.append(word,' ');
        }
      }
    }
    another_l(l);
  }
  return df
};


// parse content as object
aa.e.content_o =async(content,data,options)=>
{
  if (!data && typeof data !== 'object') return;

  content.textContent = '';
  content.append(aa.mk.ls({ls:data,sort:options.sort||''}));
};


// toggle parsed content on note
aa.e.context =(content,event,trust)=>
{
  content.classList.add('parsed');
  content.textContent = '';
  content.append(aa.e.content(event.content,trust))
};


aa.e.em =dat=>
{
  // console.log(dat);
  const id = dat?.event?.id;
  // if (!id) console.trace(dat);
  if (!aa.em.has(id))
  {
    aa.em.set(id,dat);
    if (dat.id_a)
    {
      if (aa.em_a.has(dat.id_a))
      {
        if (aa.em_a.get(dat.id_a).event.created_at
        < dat.event.created_at) aa.em_a.set(dat.id_a,dat)
      }
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

  let wn = window.nostr;
  if (!wn)
  {
    aa.log('no extension found');
    return
  }

  let decrypted;
  let {kind,tags,content,pubkey} = dat.event;
  if (kind === 4) 
  {
    let pub_to = aa.fx.tag_value(tags,'p');
    if (aa.fx.is_u(pub_to))
    {
      aa.log('content not for you');
      return
    }
    decrypted = await wn.nip04.decrypt(pubkey,content);
  }
  else decrypted = await wn.nip44.decrypt(pubkey,content);
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
  let note = aa.e.printed.get(id); //document.getElementById(aa.fx.encode('note',x));
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


// add key to follow list (kind:3)
aa.e.follows_add =async s=>
{
  if (!aa.u.p) 
  {
    aa.log('login first')
    return
  }
  let tag = ['p'];

  let [key,rest] = s.split(aa.fx.regex.fw);

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
  tag.push(key);
  
  let [relay,petname] = rest.trim().split(aa.fx.regex.fw);
  relay = aa.fx.url(relay)?.href || '';
  petname = aa.fx.an(petname);

  if (relay) tag.push(relay);
  if (petname)
  {
    if (!relay) tag.push('');
    tag.push(petname)
  }
  
  let dat = await aa.p.events_last(aa.u.p,'k3');
  if (!dat) return false;
  dat = await aa.e.get(dat);
  if (!dat)
  {
    aa.log('no k3 found, create one first');
    return
  }

  // const event = aa.fx.list_add([tag],dat.event);

  const event = aa.e.normalise(
  {
    kind:3,
    content:dat.event.content,
    tags:[...dat.event.tags,tag]
  });

  aa.mk.confirm(
  {
    title:'new follow list',
    l:aa.mk.tag_list(event.tags),
    scroll:{behaviour:'smooth',block:'end'},
    no:{exe:()=>{}},
    yes:{exe:()=>
    { 
      aa.e.finalize(event);
      setTimeout(()=>{aa.p.author(a[0]).then(p=>{aa.p.profile_upd(p)});},500);
    }}
  });
};

aa.mk.new_list =(tags,kind)=>
{

};



aa.fx.list_add =(new_tags,event)=>
{
  let {kind,content,tags} = event;
  for (const tag of new_tags)
  {
    // check if already in list
    if (tags.find(t=>t[0]===tag[0] && t[1]===tag[1]))
    {
      aa.log('value already in list');
      continue;
    }
    tags.push(tag)
  }
  // const event = aa.e.normalise({kind,content,tags});
  // aa.e.finalize(aa.e.normalise(event));
};


// delete keys from follow list (kind:3)
aa.e.follows_del =async string=>
{
  if (!aa.u.p)
  {
    aa.log('no user found, set one first');
    return
  }
  
  let id = await aa.p.events_last(aa.u.p,'k3');
  if (!id) return;
  dat = await aa.e.get(id);
  if (!dat) return;
  aa.cli.fuck_off();

  let {kind,content,tags} = dat.event;

  const old_len = tags.length;
  let keys_to_unfollow = aa.fx.splitr(string,',');

  let removed_list = aa.mk.l('ul',{cla:'list removed_tags'});
  for (let key of keys_to_unfollow)
  {
    if (key.startsWith('npub')) key = aa.fx.decode(key);
    if (aa.fx.is_hex(key)) 
    {
      removed_list.append(aa.mk.l('li',{con:key,cla:'disabled'}));
      tags = tags.filter(tag=>tag[1]!==key);
      aa.p.score(`${key} 4`);
    }
    else aa.log('invalid pubkey to unfollow')
  }

  if (tags.length)
  {
    const event = aa.e.normalise({ kind,content,tags });
    aa.mk.confirm(
    {
      title:'new follow list:'+old_len+'->'+tags.length,
      l:aa.mk.l('div',{cla:'wrap',app:[aa.mk.tag_list(tags),removed_list]}),
      scroll:{behaviour:'smooth',block:'end'},
      no:{ exe:()=>{} },
      yes:{ exe:()=> aa.e.finalize(event) },
    });
  }
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
    let [get_id,events,missing] = await aa.r.get_events([...want.values()]);
    if (events.length)
    {
      for (const dat of events)
      {
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
    let filters = [...want.values()].map(aa.fx.id_af);
    for (const filter of filters)
    {
      let [get_id,events,missing] = await aa.r.get_filter(filter);
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
  
  await aa.mk.scripts(mod.scripts);

  aa.actions.push(
    {
      action:[id,'clear'],
      description:'clear events section',
      exe:mod.clear
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
  mod.l = aa.mk.l('div',{id:'notes'});
  mod.section_observer = new MutationObserver(mod.section_mutated);
  mod.section_observer.observe(mod.l,{attributes:false,childList:true});
  aa.mod.help_setup(aa.e);
  aa.cli.on_upd.push(aa.e.draft_upd);
};


// note actions
aa.e.note_actions =dat=>
{
  // console.log(dat);
  const l = aa.mk.l('p',{cla:'actions expanded'});
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
    aa.fx.a_add(butts,[['…','na']]);
    l.classList.add('empty');
    l.classList.remove('expanded');
  }
  if (butts.length) for (const s of butts) l.append(aa.mk.butt_clk(s),' ');
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
  const quote_note = aa.mk.l('blockquote',
  {
    cla:'note_quote',
    dat:
    {
      id:data.id,
      id_a:data.id_a
    },
    app:aa.mk.l('div',
    {
      cla:'content parsed',
      app:aa.mk.ls({ls:data})
    }),
  });
  aa.e.quote_note_replace(quote_note,data);
  return quote_note
};

aa.e.quote_note =async(element,dat)=>
{
  let p = await aa.p.author(dat.event.pubkey);
  aa.e.authors(dat.event);
  aa.fx.color(p.pubkey,element);
  let header = aa.mk.event_header(dat);
  let content = await aa.e.render(dat);
  // let content = aa.mk.l('div',{cla:'content',con:dat.event.content});
  element.textContent = '';
  element.append(header,content);
  element.dataset.kind = dat.event.kind;
  if (!element.dataset.id) element.dataset.id = dat.event.id;
  // aa.e.render(element);
};

aa.e.quote_note_replace =async(element,data)=>
{
  let dat;
  
  if (data.id_a) dat = await aa.e.get_a(data.id_a);
  else dat = await aa.e.get(data.id);
  
  if (dat) aa.e.quote_note(element,dat);
  else aa.e.miss_quote(element,data);
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
      df.append(aa.mk.l('p',{con,app}),' ');
    }
  }
  aa.log(aa.mk.details(`e (s)earch results for ${s}`,df,1))
};


// mutation observer for notes section
aa.e.section_mutated =a=>
{
  let threshold = parseInt(localStorage.pagination)||0;
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
aa.e.view =l=>
{
  fastdom.mutate(()=>
  {
    if (l.classList.contains('not_yet')) aa.e.note_observer_intersect(l);
    aa.l.classList.add('viewing','view_e');
    l.classList.add('in_view');
    aa.view.in_view = l;
    aa.clk.time({target:l.querySelector('.by .created_at')});
    aa.fx.path(l);
    setTimeout(()=>{aa.fx.scroll(l)},200);
  });
};


// checks if added element should be in_view
aa.e.view_check =l=>
{
  if ((history.state?.view === '#'+l.id 
    || aa.view.id_a && aa.view.id_a === l.dataset.id_a)
  && !l.classList.contains('in_view'))
    setTimeout(()=>{aa.e.view(l)},100);
};

aa.mk.styles(aa.e.styles);



// draft event
aa.e.draft =async dat=>
{
  aa.fx.a_add(dat.clas,['draft']);
  dat.event.tags = [...new Set(dat.event.tags)];
  if (!dat.event.id) dat.event.id = aa.fx.hash(dat.event);
  aa.em.set(dat.event.id,dat);
  aa.e.print(dat);
  
  let target = document.getElementById('e');
  if (target && !target.classList.contains('expanded')) aa.clk.expand({target});
};



// creates new dat object (event)
aa.e.draft_dat =async(s,reply_to)=>
{
  aa.temp.dat = aa.mk.dat(
  {
    event: aa.e.normalise({content:s}),
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


// event complete
aa.e.normalise =event=>
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