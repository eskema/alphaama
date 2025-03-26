aa.db.p = {};
// returns profile if already loaded or get it from database
aa.db.get_p =async pubkey=>
{
  if (!aa.is.key(pubkey)) return;
  if (aa.db.p[pubkey]) return aa.db.p[pubkey];
  let p = await aa.db.ops('idb',{get:{store:'authors',key:pubkey}});
  if (p) 
  {
    aa.db.p[pubkey] = p;
    aa.p.links_upd(p)
  }
  return p
};


// aa.db.miss_profiles =async()=>
// {
//   let pubkeys = Object.keys(aa.temp.profiles);
//   let profiles = await aa.db.profiles(pubkeys);
//   for (const p of profiles)
//   {
//     let id = p.xpub;
//     pubkeys = pubkeys.filter(i=>i!==id);
//     delete aa.temp.profiles[id];
//     aa.db.p[id] = p;
//   }
//   for (const id of pubkeys)
//   {
//     aa.p.miss_p(id,aa.temp.profiles[id]);
//     delete aa.temp.profiles[id];
//   }
// };