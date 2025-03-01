// is nip4 cyphertext
aa.is.nip4 =s=> 
{
  let l = s.length;
  if (l < 28) return false;

  return s[l - 28] == '?' 
  && s[l - 27] == 'i'
  && s[l - 26] == 'v'
  && s[l - 25] == '='
};