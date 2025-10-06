aa.clk.relset =e=>
{
  e.preventDefault();
  e.stopPropagation();
  let l = e.target;
  const k = l.dataset.k;
  const v = l.dataset.v;
  const k_v = `${k}_${v}`;
  let rels = aa.fx.in_set(aa.r.o.ls,v,false);
  aa.r.filter(rels,k_v,l);

  console.log(l)
};


// toggles relays by state
aa.clk.relstate =e=>
{
  e.preventDefault();
  e.stopPropagation();
  let l = e.target;
  const k = l.dataset.k;
  const v = l.dataset.v;
  const k_v = `${k}_${v}`;
  
  rels = [...aa.r.mod_li]
    .filter(i=>i[1].dataset.state===v)
    .map(i=>i[0]);
  aa.r.filter(rels,k_v,l);

  console.log(l)
};

aa.r.filter =(rels,k_v,l)=>
{
  let cla_active = 'active';
  if (l.classList.contains(cla_active))
  {
    fastdom.mutate(()=>
    {
      l.classList.remove(cla_active);
      aa.r.filter_out(rels,k_v,l);
    })
  }
  else
  {
    fastdom.mutate(()=>
    {
      l.classList.add(cla_active);
      aa.r.filter_rm(rels,k_v,l);
    })
  }
};

aa.r.filter_rm =(rels,k_v,l)=>
{
  for (const rel of rels)
  {
    let item = aa.r.mod_li.get(rel);
    let a = l.dataset.out 
      ? l.dataset.out.trim().split(' ') 
      : [];
    a = aa.fx.a_rm(a,[k_v]);
    if (a.length) 
      item.dataset.out = a.join(' ');
    else
    {
      item.dataset.out = '';
      item.classList.remove('out');
    }
  }
};

aa.r.filter_out =(rels,k_v,l)=>
{
  for (const rel of rels)
  {
    let item = aa.r.mod_li.get(rel);
    let a = item.dataset.out ? item.dataset.out.trim().split(' ') : [];
    aa.fx.a_add(a,[k_v]);
    item.dataset.out = a.join(' ');
    item.classList.add('out');
  }
};



// get elements with key:value
aa.fx.items =(selector,scope)=>
{
  if (!scope) scope = aa.l;
  return Array.from(scope.querySelectorAll(selector))
};


// click on key
aa.clk.l_solo =e=>
{
  let l = e.target.closest('.item');
  const k = l.dataset.k;
  const v = l.dataset.v;
  let dis = e.target.classList.contains('.key') ? e.target : e.target.closest('.key');
  let items = aa.fx.index_items(k,v);
  aa.i.filter_solo(dis,items,k,v);
}


// click on val
aa.clk.l_hide =e=>
{
  let l = e.target.closest('.item');
  const k = l.dataset.k;
  const v = l.dataset.v;
  let dis = e.target.classList.contains('.val') ? e.target : e.target.closest('.val');
  let items = aa.fx.index_items(k,v);
  aa.i.filter_out(dis,items,k,v);
}