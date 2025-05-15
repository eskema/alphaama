// returns user trust
aa.is.trust_x =x=> 
{
  let p = aa.db.p[x];
  if (!p) return false;
  return aa.is.trusted(p.score);
}

// true if p follows pubkey
// default p is u
aa.is.following =(pubkey,p)=>
{
  if (!p) p = aa.u?.p;
  if (p?.follows?.includes(pubkey)) return true;
  return false
};