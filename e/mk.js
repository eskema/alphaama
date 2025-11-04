aa.mk.event_header =dat=>
{
  const id = dat.event.id;
  const kind = dat.event.kind;

  return make('header',
  {
    cla:'by',
    app:
    [
      make('div',
      {
        cla:'id',
        app:
        [
          make('a',
          {
            cla:'a nid',
            ref:`#${aa.fx.encode('note',id)}`,
            app:make('span',
            {
              con:aa.e.kinds_list[kind],
              dat:{kind}
            }),
            clk:aa.clk.a
          }),
          ' ',make('span',{cla:'xid',con:id})
        ]
      }),
      ' ',aa.mk.author_link(dat.event.pubkey),
      ' ',aa.e.note_actions(dat),
      ' ',aa.mk.time(dat.event.created_at),
      ' ',aa.mk.butt_clk(['x','tiny'])
    ]
  });
};



// parse nip19 to render as mention or quote
aa.mk.nip19 =string=>
{
  let decoded = aa.fx.decode(string);
  if (!decoded) return string;
  
  if (string.startsWith('npub1')
  || string.startsWith('nprofile1')) 
  {
    // return p_link
    let pubkey = typeof decoded === 'string' ? decoded 
    : decoded.pubkey;
    return aa.mk.p_link(pubkey);
  }
  else if (string.startsWith('note1')
  || string.startsWith('nevent1')
  || string.startsWith('naddr1'))
  {
    // return quote_note
    let dis = {};
    if (string.startsWith('note1')) dis.id= decoded;
    else if (string.startsWith('nevent1'))
    {
      if (decoded.id) dis = decoded;
    }
    else if (string.startsWith('naddr1'))
    {
      decoded.id_a = aa.fx.id_a(decoded);
      if (decoded.id_a) dis = decoded;
    }
    
    if (dis.id || dis.id_a)
    {
      dis.entity = string;
      return aa.e.quote(dis)
    }
    else return make('span',
    { con:`${string}:\n${JSON.stringify(decoded)}`})
  }
  return aa.mk.nostr_link(string)
};


// make generic note element
aa.mk.note =dat=>
{
  const {
    id,
    pubkey,
    kind,
    created_at,
    tags,
    // sig
  } = dat.event;
  
  if (!id) console.log('no id',dat);
  if (!pubkey) console.log('no pubkey',dat);
  aa.p.get(pubkey);

  if (typeof kind !== 'number') console.log('no kind',dat);

  const nid = aa.fx.encode('note',id);
  const stamp = aa.now < created_at ? aa.now : created_at;
  const cla = ['note',...dat.clas].join(' ');
  const seen = dat?.seen?.join(' ')||'db';
  const subs = dat?.subs?.join(' ')||'db';

  const app = new DocumentFragment();

  const clicker = make('a',
  {
    cla:'a clicker',
    ref:'#'+nid,
    con:'k'+kind+' '+aa.e.kinds_list[kind],
    clk:aa.clk.a
  });

  const header = aa.mk.event_header(dat);

  app.append(clicker,header);

  if (tags?.length)
  {
    let opened = dat.event.content.length ? false : true;
    const tags_section = aa.mk.details('tags',aa.mk.tag_list(tags),opened);
    tags_section.classList.add('tags_wrapper');
    tags_section.querySelector('summary').dataset.count = tags.length;
    app.append(tags_section);
  }

  const replies_section = aa.mk.replies_section(id)
  app.append(replies_section);

  const note = make('article',
  {
    id:nid,
    cla,
    dat:{id,pubkey,kind,created_at,stamp,seen,subs},
    app
  });
  

  let stored = sessionStorage[id];
  if (stored && stored === 'tiny') note.classList.add('tiny');
  
  setTimeout(()=>{ aa.fx.color(pubkey,note) },0);
  // setTimeout(()=>{ aa.e.render(note) },10);
  aa.e.render(dat).then(content=>
  {
    fastdom.mutate(()=>{note.insertBefore(content,header.nextElementSibling)})
  });

  return note
};


// make a note from text input
aa.mk.post =async(s='')=>
{
  if (!aa.temp.dat) aa.e.draft_upd(s);
  if (aa.temp.dat)
  {
    aa.temp.dat.event.created_at = aa.now;
    if (aa.temp.dat.event.kind === 1)
    {
      aa.fx.tags_add(aa.temp.dat.event.tags,aa.fx.hashtags(s));
      const mentions = await aa.fx.mentions(s);
      aa.fx.tags_add(aa.temp.dat.event.tags,mentions);
    }
    aa.e.draft(aa.temp.dat);
    delete aa.temp.dat;
    aa.cli.fuck_off();
  }
  else
  {
    aa.log(s);
    let log_text = 'unable to create note';
    if (!aa.u?.p?.pubkey)
    {
      log_text += ', login first using the command: ';
      log_text += localStorage.ns+' u login';
    }
    aa.log(log_text);
  }
};

// restrict amount of root events displayed at once, 
aa.mk.pagination =()=>  
{
  let n = parseInt(localStorage.pagination??'0');
  
  const style = make('style',
  {
    id:'e_pagination',
    con:`.pagin .notes > .note:not(:nth-child(-n+${n})):not(.in_path){display:none;}`
  });

  document.head.append(style);

  let pagination = make('p',{cla:'pagination'});
  let butt_more = make('button',
  {
    cla:'butt',
    con:'moar',
    clk:e=>
    {
      fastdom.mutate(()=>
      {
        if (aa.l.classList.contains('pagin'))
        {
          let position = aa.l.scrollTop;
          aa.l.classList.remove('pagin');
          e.target.textContent = 'less';
          aa.l.scrollTop = position;
        }
        else 
        {
          aa.l.classList.add('pagin');
          e.target.textContent = 'moar';
        }
      });
    }
  });
  pagination.append(butt_more);
  fastdom.mutate(()=>{aa.l.classList.add('pagin')});
  return pagination
};


aa.mk.replies_section =id=>
{
  // aa.mk.det =(cla='',id='')=>
  // {
  //   let l = aa.mk.details('',false,true);
  //   if (cla) l.classList.add(cla);
  //   if (id) l.id = id;
  //   let summary = l.querySelector('summary');
  //   summary.append(make('button',
  //   {
  //     cla:'butt mark_read',
  //     clk:aa.clk.mark_read
  //   }));
  //   return l 
  // };
  // let replies_section = aa.mk.det('replies');
  const replies_id = `${id}_replies`;
  let section_id = `section_${replies_id}`;
  
  let replies_section = aa.mk.section(
  {
    id: replies_id,
    classes: 'replies',
    collapse: true,
    filter: true,
    clk:aa.clk.mark_read
  });
  let butt = replies_section.firstElementChild.firstElementChild;
  butt.classList.add('mark_read');
  // butt.removeEventListener('click',aa.clk.expand);
  // butt.addEventListener('click',aa.clk.mark_read);
  
  
  if (!sessionStorage.hasOwnProperty(section_id)
  || sessionStorage[section_id] === 'expanded')
    replies_section.classList.add('expanded');
  return replies_section
};


// make tag list
aa.mk.tag_list =(tags,options)=>
{
  const times = tags.length;
  const l = make('ol',{cla:'tags'});
  l.start = 0;
  
  for (let i=0;i<times;i++) 
  {
    let con = tags[i].join(', ');
    let cla = 'tag tag_'+tags[i][0];
    if (options?.cla) cla += ' '+options.cla;
    let li = make('li',{cla,con});
    li.dataset.i = i;
    l.append(li);//aa.mk.tag(tags[i],i));
  }
  return l
};


// make event from JSON string, autocompletes missing fields
aa.mk.e =(s='')=>
{
  let event = aa.pj(s);
  if (event)
  {
    aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
    aa.cli.fuck_off();
  }
};



// set your metadata (kind-0)
aa.mk.k0 =async(s='')=>
{
  let md = aa.pj(s);
  if (!md) return;
  aa.mk.confirm(
  {
    title:'new metadata',
    l:aa.mk.ls({ls:md}),
    no:{exe:()=>{}},
    yes:{exe:()=>
    {
      const event = 
      {
        pubkey:aa.u.p.pubkey,
        kind:0,
        created_at:aa.now,
        content:JSON.stringify(md),
        tags:[]
      };
      aa.e.finalize(event).then(e=>{console.log(e)});
    }},
  });
};

  
aa.mk.k1 =async(s='')=>
{
  //     const mentions = await aa.fx.mentions(s);
      
  //   }
    
  //   aa.e.draft(aa.temp.dat);
  //   delete aa.temp.dat;
  //   aa.cli.fuck_off();
  // }
  // else 
  // {
  //   aa.log(s);
  //   let log_text = 'unable to create note';
  //   if (!aa.u?.p?.pubkey)
  //   {
  //     log_text += ', login first using the command: ';
  //     log_text += localStorage.ns+' u login';
  //   }
  //   aa.log(log_text);      
  // }
};


// Encrypted direct Message
aa.mk.k4 =async(s='')=>
{
  let [pubkey,text] = s.split(aa.regex.fw);
  let event = {kind:4,tags:[['p',pubkey]]};
  event.content = await window.nostr.nip04.encrypt(pubkey,text);
  aa.e.draft(aa.mk.dat(
  {
    event:aa.e.normalise(event),
    clas:['encrypted']
  }));
};


aa.mk.k5 =async(s='')=>
{
  let [content,rest] = aa.fx.split_str(s);
  if (!rest) return;
  
  const event = {kind:5,content,tags:[]};
  const relays = [];
  
  let ids = [...new Set(aa.fx.splitr(rest))];
  let dis = `confirm delete request for these events:\n${ids}`;
  if (!window.confirm(dis)) return;

  for (const id of ids)
  {
    let tag = [id];
    let kind;
    if (aa.fx.is_key(id)) 
    {
      tag.unshift('e');
      let dat = await aa.e.get(id);
      if (dat)
      {
        kind = dat.event.kind+'';
        aa.fx.a_add(relays,dat.seen);
        // dat.clas.push('k5');
        // aa.db.upd_e(dat);
      }
    }
    else tag.unshift('a');
    event.tags.push(tag);
    if (kind) event.tags.push(['k',kind])

    aa.e.finalize(aa.e.normalise(event),relays);
  }
};


// new reaction event (kind-7)
// should go to aa.e
aa.mk.k7 =async(s='')=>
{
  let [id,content] = s.trim().split(' ');
  if (!aa.fx.is_hex(id))
  {
    aa.log('invalid reaction');
    return
  }
  let dat = await aa.e.get(id);
  if (!dat) 
  {
    aa.log('reaction failed: event id not found');
    return
  }
  aa.cli.fuck_off();
  
  const seen = dat.seen[0];
  let tag_e = ['e',id];
  if (seen) tag_e.push(seen);
  let tags = [tag_e];
  if (dat.event.kind !== 1) tags.push(['k',`${dat.event.kind}`]);
  if (aa.fx.kind_type(dat.event.kind) === 'parameterized')
  {
    let tag_a = aa.fx.tag_a(dat.event);
    if (tag_a)
    {
      if (seen) tag_a.push(seen);
      tags.push(tag_a);
    }
  }
  tags.push(aa.fx.tag_p(dat.event.pubkey));
  const event = aa.e.normalise({kind:7,content,tags});
  aa.e.finalize(event);
};


aa.actions.push(
  {
    action:['mk','e'],
    required:['<JSON>'],
    description:'mk event from JSON, auto-completes missing fields',
    exe:aa.mk.e
  },
  {
    action:['mk','0'],
    required:['<JSON>'], 
    description:'set metadata (kind-0)',
    exe:aa.mk.k0
  },
  {
    action:['mk','4'],
    required:['<pubkey>','<text>'],
    description:'encrypt text to pubkey',
    exe:aa.mk.k4
  },
  {
    action:['mk','5'],
    required:['<reason>','<id>'],
    optional:['<id>'],
    description:'request note(s) to be deleted',
    exe:aa.mk.k5
  },
  {
    action:['mk','7'],
    required:['<id>','<reaction>'], 
    description:'react to a note',
    exe:aa.mk.k7
  },
);