// returns user trust
aa.is.trust_x =x=> 
{
  let p = aa.db.p[x];
  if (!p) return false;
  return aa.is.trusted(p.score);
}