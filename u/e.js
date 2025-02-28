// draft event
aa.e.draft =async dat=>
{
  aa.fx.a_add(dat.clas,['draft']);
  dat.event.tags = [...new Set(dat.event.tags)];
  if (!dat.event.id) dat.event.id = aa.fx.hash(dat.event);
  aa.db.e[dat.event.id] = dat;
  aa.e.print(dat);
  
  let target = document.getElementById('e');
  if (target && !target.classList.contains('expanded')) aa.clk.expand({target});
};


// finalize event creation
aa.e.finalize =async(event,relays)=>
{
  event.tags = aa.fx.a_u(event.tags);
  if (!event.id) event.id = aa.fx.hash(event);
  const signed = await aa.u.sign(event);
  if (signed)
  {
    let dat = aa.db.e[event.id] = aa.mk.dat({event:signed});
    aa.db.upd_e(dat);
    aa.e.print(dat);
    aa.r.broadcast(signed,relays);
  }
};


// event complete
aa.e.normalise =event=>
{
  if (!event.pubkey) event.pubkey = aa.u.p.xpub;
  if (!event.kind) event.kind = 1;
  if (!event.created_at) event.created_at = aa.now;
  if (!event.tags) event.tags = [];
  if (!event.content) event.content = '';
  return event
};


// decrypt kind-4 from id
aa.e.note_decrypt =async s=>
{ 
  if (!window.nostr) 
  {
    aa.log('no extension found');
    return
  }

  let x = s.trim();
  if (!aa.is.x(x))
  {
    aa.log('invalid id');
    return
  }
  
  let dat = await aa.db.get_e(x);
  if (!dat) 
  {
    aa.log('event not found');
    return
  }

  let decrypted;
  if (dat.event.kind === 4) 
  {
    let p_x = dat.event.tags.find(t=>t[0]==='p')[1];
    if (aa.u.p.xpub !== p_x)
    {
      aa.log('content not for you');
      return
    }
    decrypted = await window.nostr.nip04.decrypt(dat.event.pubkey,dat.event.content);
  }
  else decrypted = await window.nostr.nip44.decrypt(dat.event.pubkey,dat.event.content);
  if (!decrypted)
  {
    aa.log('decrypt failed');
    return
  }
  
  aa.e.note_decrypted_content(x,decrypted);
  return decrypted
};


aa.e.note_decrypted_content =async(x,decrypted)=>
{
  let l = document.getElementById(aa.fx.encode('note',x));
  if (!l) 
  {
    aa.log('decrypted cyphertext:');
    aa.log(decrypted);
  }
  else
  {
    let content = l.querySelector('.content');
    content.classList.remove('encrypted');
    content.classList.add('decrypted');
    content.querySelector('.butt.decrypt').remove();
    l.querySelector('.content').append(aa.parse.content(decrypted));
  }
};

aa.actions.push(
  {
    action:['e','decrypt'],
    required:['nid'],
    description:'decrypt note',
    exe:aa.e.note_decrypt
  },
)