// 21,'sat' => 21sats
aa.fx.units =(num,unit='sat')=> num+aa.fx.plural(num,unit);

// calculate balance from proofs
aa.w.sum_amounts =a=>
{
  let total = 0;
  for (const i of a) total = total + i.amount;
  return total
};