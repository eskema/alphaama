/*

alphaama
fx: array & collection utilities

*/


// checks if array includes items
// adds them if not and returns if anything was added
aa.fx.a_add =(a,items_to_add)=>
{
  const existing = new Set(a);  // O(n) once instead of O(n²)
  let b = 0;
  for (const item of items_to_add)
  {
    if (!existing.has(item))  // O(1) lookup instead of O(n)
    {
      a.push(item);
      existing.add(item);  // Keep Set in sync for subsequent checks
      b = 1;
    }
  }
  return b
};


// returns filtered array
aa.fx.a_rm =(a,items_to_rm)=>
{
  const to_remove = new Set(items_to_rm);  // O(n) once
  return a.filter(i => !to_remove.has(i))  // O(1) lookup, single pass
};


// object from array of strings
aa.fx.a_o =a=>
{
  const o = {};
  for (const i of a)
  {
    const [k,v] = i.split(' ');
    if (k && v) o[k] = v;
  }
  return o
};

// array of unique arrays
aa.fx.a_u =a=>
{
  const seen = new Map();
  const result = [];

  for (const item of a)
  {
    const key = JSON.stringify(item);  // Stringify once for lookup key
    if (!seen.has(key))
    {
      seen.set(key, true);
      result.push(item);  // Use original item - no parse needed!
    }
  }

  return result
};


// splits array into chunks of n items
// returns array of chunks
aa.fx.chunks =(a,n)=>
{
  const chunks = [];
  for (let i = 0; i < a.length; i += n) chunks.push(a.slice(i,i+n));
  return chunks;
};


// split at given index
aa.fx.split_at =(a,i=0)=> [a.slice(0,i),a.slice(i)];


// returns items in a given set
aa.fx.in_set =(o,set,filter='off')=>
{
  let a = [];
  for (const k in o)
  {
    if (o[k].sets.includes(set))
    {
      if (!filter) a.push(k);
      else if (!o[k].sets.includes(filter)) a.push(k);
    }
  }
  return a
};


// return items in any set
aa.fx.in_sets =(o,sets,filter='off')=>
{
  let a = [];
  for (const set of sets) a.push(...aa.fx.in_set(o,set,filter));
  return [...new Set(a)]
};


// return items in all sets if not 'off'
aa.fx.in_sets_all =(o,sets)=>
{
  let a = [];

  for (const k in o)
  {
    let i = o[k];
    if (!i.sets.includes('off') && sets.every(set=>i.sets.includes(set))) a.push(k);
  }
  return [...new Set(a)]
};


// intersect
aa.fx.intersect =(o={},a=[],n=2)=>
{
  if (typeof n !== 'number') n = 1;
  let dis = {};
  let items = Object.entries(o).sort(aa.fx.sorts.len);
  for (const x of a)
  {
    let i=0;
    for (const item of items)
    {
      const [k,v] = item;
      if (v.includes(x))
      {
        if (!dis[k]) dis[k] = [];
        aa.fx.a_add(dis[k],[x]);
        i++;
        if (i>=n) break;
      }
    }
  }
  return dis
};
