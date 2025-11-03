aa.em = new Map();
aa.em_a = new Map();

// define which events are to be stored
aa.db.event_is_allowed =dat=>
{
  let is_allowed;
  let kinds = [0,3,10002,10019,17375];

  if (aa.u.is_u(dat.event.pubkey)) is_allowed = true;
  else if (aa.p.following(dat.event.pubkey))
  {
    if (kinds.includes(dat.event.kind)) is_allowed = true;
  }
  // else
  // {
  //   // 
  // }

  return is_allowed
};