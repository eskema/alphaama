// 21,'sat' => 21sats
aa.fx.amount_display =(num,unit)=> num+aa.fx.plural(num,unit);

// calculate balance from proofs
aa.fx.sum_amounts =a=>
{
  let total = 0;
  for (const i of a) total = total + i.amount;
  return total
};