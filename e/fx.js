aa.fx.id_a =o=>
{
  if (!o.kind || typeof o.kind !== 'number') return;
  if (!o.pubkey || !aa.is.key(o.pubkey)) return;
  if (!o.identifier || typeof o.identifier !== 'string') return;
  return `${o.kind}:${o.pubkey}:${o.identifier}`;
};


// adds classes to notes up the parent tree starting from element
// if a string is given, it will be added to a dataset array 
aa.fx.path =(l,s=false)=>
{
  for (;l&&l!==document;l=l.parentNode) 
  {
    if (l.classList.contains('note'))
    {
      if (!aa.view.in_path.find(i=>i.dataset.id===l.dataset.id))
        aa.view.in_path.push(l);
      
      l.classList.add('in_path');
      if (s)
      {
        let a = l.dataset.path ? l.dataset.path.trim().split(' ') : [];
        let added = aa.fx.a_add(a,[s]);
        if (added) l.dataset.path = a.join(' ');
      }
    }
  }
};


// removes path class and dataset from element
aa.fx.path_remove =l=>
{
  fastdom.mutate(()=>
  {
    l.classList.remove('in_path');
    l.removeAttribute('data-path');
  })
};


// removes path dataset from element and class if empty dataset 
aa.fx.path_rm =s=>
{
  // let in_path = document.querySelectorAll('.in_path');
  const to_rm = [];
  if (aa.view.in_path.length) for (const l of aa.view.in_path)
  {
    let dis;
    if (s && l.dataset.path)
    {
      let a = aa.fx.a_rm(l.dataset.path.trim().split(' '),[s]);
      if (a.length) l.dataset.path = a.join(' ');
      else
      {
        to_rm.push(l.dataset.id);
        aa.fx.path_remove(l);
      }
    }
    else 
    {
      to_rm.push(l.dataset.id);
      aa.fx.path_remove(l);
    }
  }
  if (to_rm.length) 
  {
    aa.view.in_path = aa.view.in_path
      .filter(i=>!to_rm.includes(i.dataset.id));
  }
};


// merge two dat objects
aa.fx.merge =(dis,dat)=>
{
  dis = Object.assign({},dis);
  let merged,sets = ['seen','subs','clas','refs'];
  for (const set of sets)
  { 
    if (!dis.hasOwnProperty(set)) { dis[set]=[]; merged=true; } 
    if (!dat.hasOwnProperty(set)) dat[set]=[];
    if (aa.fx.a_add(dis[set],dat[set])) merged=true;
  }
  return merged ? dis : false
};