// make event from JSON string, autocompletes missing fields
aa.mk.e =s=>
{
  let event = aa.parse.j(s);
  if (event)
  {
    aa.e.draft(aa.mk.dat({event:aa.e.normalise(event)}));
    aa.cli.fuck_off();
  }
};


// set your metadata (kind-0)
aa.mk.k0 =async s=>
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


// new reaction event (kind-7)
// should go to aa.e
aa.mk.k7 =async s=>
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


aa.actions.push(
  {
    action:['mk','e'],
    required:['JSON'],
    description:'mk event from JSON',
    exe:aa.mk.e
  },
  {
    action:['mk','0'],
    required:['{JSON}'], 
    description:'set metadata (kind-0)',
    exe:aa.mk.k0
  },
  {
    action:['mk','7'],
    required:['id','reaction'], 
    description:'react to a note',
    exe:aa.mk.k7
  },
  {
    action:['mk','4'],
    required:['pubkey','text'],
    description:'encrypt text to pubkey',
    exe:aa.mk.k4
  },
);