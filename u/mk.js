// make event from JSON string, autocompletes missing fields
aa.mk.e =(s='')=>
{
  let event = aa.parse.j(s);
  if (event)
  {
    aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
    aa.cli.fuck_off();
  }
};



// set your metadata (kind-0)
aa.mk.k0 =async(s='')=>
{
  let md = aa.parse.j(s);
  if (!md) return;
  aa.mk.dialog(
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



// Encrypted direct Message
aa.mk.k4 =async(s='')=>
{
  let [pubkey,text] = s.split(aa.fx.regex.fw);
  let event = {kind:4,tags:[['p',pubkey]]};
  event.content = await window.nostr.nip04.encrypt(pubkey,text);
  aa.e.draft(aa.mk.dat(
  {
    event:aa.e.normalise(event),
    clas:['encrypted']
  }));
};


aa.mk.k5 =(s='')=>
{
  let [reason,rest] = aa.fx.split_str(s);
  if (!rest) return;
  
  const event = {kind:5,content:reason,tags:[]};
  const relays = [];
  
  let ids = [...new Set(aa.fx.splitr(rest))];
  for (const id of ids)
  {
    let tag = [id];
    let kind;
    if (aa.is.key(id)) 
    {
      tag.unshift('e');
      let dat = aa.db.e[id];
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
  }
  if (window.confirm('confirm delete request for these events:\n'+ids))
    aa.e.finalize(aa.e.normalise(event),relays);
};


// new reaction event (kind-7)
// should go to aa.e
aa.mk.k7 =async(s='')=>
{
  let [id,content] = s.trim().split(' ');
  if (!aa.is.x(id) || !aa.is.one(content))
  {
    aa.log('invalid reaction');
    return
  }
  let dat = await aa.db.get_e(id);
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


// a reload button
aa.mk.reload_butt =()=> aa.mk.l('button',
{
  con:'reload the page',
  cla:'butt exe',
  clk:e=>{location.reload()}
});


aa.mk.setup_butt =()=>
{
  let setup_butt = aa.mk.l('p',
  {
    con:"let's get ",
    id:'u_setup',
    app:
    [
      aa.mk.butt_action('u setup'),
      ' or ',
      aa.mk.l('button',
      {
        cla:'butt exe',
        con:'else',
        clk:aa.u.setup_quick
      })
    ]
  });
  setTimeout(()=>{aa.log(setup_butt)},500);
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