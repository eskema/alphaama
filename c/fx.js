aa.fx.tags_add =(a,b)=>
{
  for (const i of b)
  {
    if (!a.some(t=>t[0] === i[0] && t[1] === i[1])) a.push(i)
    // let add = true;
    // for (const t of a)
    // {
    //   if (t[0] === i[0] && t[1] === i[1]) add = false;
    // }
    // if (add) a.push(i)
  }
};