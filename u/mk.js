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
        pubkey:aa.u.p.xpub,
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
  let [xid,reaction] = s.trim().split(' ');
  if (!aa.is.x(xid) || !aa.is.one(reaction))
  {
    aa.log('reaction failed');
    return
  }
  
  aa.cli.fuck_off();
    
  const event = 
  {
    pubkey:aa.u.p.xpub,
    kind:7,
    created_at:aa.now,
    content:reaction,
    tags:[]
  };

  let reply_dat = await aa.db.get_e(xid);
  if (reply_dat) event.tags.push(...aa.get.tags_for_reply(reply_dat.event));
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