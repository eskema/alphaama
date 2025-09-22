/*

alphaama
mod    i
index filtering

*/





aa.i =
{
  def:{id:'i',ls:{}},
  clk:{},
  dex:{},
  head:
  {
    'id':{},
    'pubkey':{},
    'kind':{},
    'subs':{},
    'seen':{},
    // 'clas':{},
    'tag_t':{},
    'tag_d':{},
    'tag_subject':{},
    'tag_nonce':{},
    'since':0,
    'until':0,
  },
  ls:['pubkey','kind','subs','seen','tag_t','tag_d','tag_subject','tag_nonce'],
};


// index dat
aa.i.d =dat=>
{
  if (aa.i.head.id.hasOwnProperty(dat.event.id)){ aa.i.head.id[dat.event.id]++; return }
  aa.i.head.id[dat.event.id] = 1;
  if (dat.subs) for (const sub of dat.subs) aa.i.dex.e('subs',sub);
  if (dat.seen) for (const seen of dat.seen) aa.i.dex.e('seen',seen);
  // if (dat.clas) for (const clas of dat.clas) aa.i.dex.e('clas',clas);
  if (dat.event.pubkey) aa.i.dex.e('pubkey',dat.event.pubkey);
  if (dat.event.hasOwnProperty('kind')) aa.i.dex.e('kind',dat.event.kind);
  if (dat.event.created_at) aa.i.dex.at(dat.event.created_at,dat.event.id);
  if (dat.event.tags?.length) aa.i.dex.tags(dat.event.tags);
};


// index oldest and newest timestamp
aa.i.dex.at =(v,id)=> 
{
  let h = aa.i.head;
  let l;
  let s;
  if (!h.since || v < h.since) 
  {
    h.since = v;
    l = document.querySelector('#i_since a');
    s = 'since ';
  }
  if (!h.until || v > h.until)
  {
    h.until = v;
    l = document.querySelector('#i_until a');
    s = 'until ';
  }
  if (l)
  {
    l.textContent = s+aa.fx.time_display(v);
    l.href = '#'+aa.fx.encode('note',id);
    l.classList.remove('empty');
  }
};


// index key value pair
aa.i.dex.e =(k,v)=>
{
  let h = aa.i.head;
  if (!h[k]) h[k] = {};
  let item;
  let list = document.getElementById('i_list_'+k);
  if (!list)
  {
    console.log(k);
  }
  if (!h[k][v])
  {
    h[k][v] = 1;
    if (!list.previousElementSibling.dataset.after)
      list.previousElementSibling.dataset.after = 0;
    list.previousElementSibling.dataset.after++;
    item = aa.mk.hasOwnProperty('i_'+k) ? aa.mk['i_'+k](v,1,k) : aa.mk.i_item(v,1,k);
    list.append(item);
  } 
  else 
  {
    h[k][v]++;
    item = aa.i.l.querySelector('#i_item_'+aa.fx.an(v)+' .val');
    item.textContent = h[k][v];
    aa.fx.sort_l(list,'i_desc');
  }
};


// index tags
aa.i.dex.tags =tags=>
{
  let dis = ['t','d','nonce','subject'];
  for (const tag of tags)
  {
    const [k,v,b] = tag;
    if (!dis.includes(k)) continue;
    switch (k)
    {
      case 'nonce': aa.i.dex.e('tag_'+k,b); break;
      default: aa.i.dex.e('tag_'+k,v);
    }
  }
};


// remove class 'out' from items
aa.i.filter_out_rm =(items,k_v)=>
{
  for (const l of items)
  {
    let a = l.dataset.out ? l.dataset.out.trim().split(' ') : [];
    a = aa.fx.a_rm(a,[k_v]);
    if (a.length) l.dataset.out = a.join(' ');
    else
    {
      l.dataset.out = '';
      l.classList.remove('out');
    }
  }
};


// remove class 'solo' from items
aa.i.filter_solo_rm =(items,k_v,scope)=>
{
  if (!scope) scope = aa.e.l;
  // fastdom.mutate(()=>
  // {
    let a = scope.dataset.solo ? aa.fx.a_rm(scope.dataset.solo.trim().split(' '),[k_v]) : [];
    if (a.length) scope.dataset.solo = a.join(' ');
    else
    {
      scope.dataset.solo = '';
      scope.classList.remove('haz_solo');
    }
    for (const l of items)
    {
      l.classList.remove('solo');
      aa.fx.path_rm(k_v);
    }
  // })
};


// apply class 'out' to items
aa.i.filter_out_apply =(items,k_v)=>
{
  for (const l of items)// aa.i.filter_out(l,k_v);
  {
    let a = l.dataset.out ? l.dataset.out.trim().split(' ') : [];
    aa.fx.a_add(a,[k_v]);
    l.dataset.out = a.join(' ');
    l.classList.add('out');
  }
};


// apply class 'solo' to items
aa.i.filter_solo_apply =(items,k_v,scope)=>
{
  // if (!scope) scope = aa.l;
  if (!scope) scope = aa.e.l;
  // fastdom.mutate(()=>
  // {
    scope.classList.add('haz_solo');
    if (!scope.dataset.solo) scope.dataset.solo = k_v;
    else 
    {
      let a = scope.dataset.solo.trim().split(' ');
      aa.fx.a_add(a,[k_v]);
      scope.dataset.solo = a.join(' ')
    }
  // });

  for (const l of items) // solo item
  {
    l.classList.add('solo'); 
    aa.fx.path(l,k_v);
  };
};


// hides specific items
aa.i.filter_out =(dis,items,k,v)=>
{
  const k_v = k+'_'+aa.fx.an(v);
  if (items)
  {
    if (dis.classList.contains('out')) aa.i.filter_out_rm(items,k_v);
    else aa.i.filter_out_apply(items,k_v);
    dis.classList.toggle('out');
  }
};


// hides all but specific items
aa.i.filter_solo =(dis,items,k,v)=>
{
  const k_v = k+'_'+aa.fx.an(v);
  if (dis.classList.contains('solo')) aa.i.filter_solo_rm(items,k_v);
  else aa.i.filter_solo_apply(items,k_v);
  dis.classList.toggle('solo')
};


aa.i.filter =({dis,items,k,v,cla})=>
{
  // let {dis,items,k,v,cla} = o;
  // const k_v = k+'_'+aa.fx.an(v);
  // if (dis.classList.contains(cla)) aa.i.filter_rm(items,k_v);
  // else aa.i.filter_apply(items,k_v);
  // dis.classList.toggle(cla)
};


// make index items
aa.mk.i_at =(k,v,id)=> aa.mk.l('li',{cla:'item',id:'i_'+k,app:aa.mk.nostr_link(id,k)});
aa.mk.i_item =(k,v,id)=>
{
  let ank = aa.fx.an(k);
  let li = aa.mk.l('li',{cla:'item',id:'i_item_'+ank});
  li.dataset.v = k;
  if (id) li.dataset.k = id;
  let key = aa.mk.l('button',{cla:'key',con:k,clk:aa.clk.key});
  let val = aa.mk.l('button',{cla:'val',con:v,clk:aa.clk.val});
  li.append(key,val);
  return li
};
aa.mk.i_pubkey =(k,v,id)=>
{
  let li = aa.mk.i_item(k,v,id);
  let p_link = aa.mk.p_link(k);
  p_name = p_link?.querySelector('.name');
  let key = li.querySelector('.key');
  key.textContent = '';
  key.append(p_name||aa.fx.encode('npub',k).slice(0,12));
  return li
};


// on load
aa.i.load =async()=>
{
  aa.add_styles(['/i/i.css']);
  aa.i.l = aa.mk.l('ul',{id:'i',cla:'list'});
  // const app_i = ()=>
  // {
  //   let l = document.querySelector('#e > header');
  //   if (l) l.append(aa.i.l);
  //   else setTimeout(app_i, 100);
  // };
  // app_i();
  // aa.i.run();
};


// returns all the notes that have a tag with value
aa.fx.notes_with_tag =(k,v)=>
{
  let ids = [];
  let notes = [];
  let tagged = document.querySelectorAll('.'+k+'[data-tag="'+v+'"]');
  for (const tag of tagged)
  {
    let note = tag.closest('.note');
    if (ids.includes(note.dataset.id)) continue;
    ids.push(note.dataset.id);
    notes.push(note);
  }
  return notes
};


// click on key
aa.clk.key =e=>
{
  let l = e.target.closest('.item');
  const k = l.dataset.k;
  const v = l.dataset.v;
  let dis = e.target.classList.contains('.key') ? e.target : e.target.closest('.key');
  let items = aa.fx.index_items(k,v);
  aa.i.filter_solo(dis,items,k,v);
}


// click on val
aa.clk.val =e=>
{
  let l = e.target.closest('.item');
  const k = l.dataset.k;
  const v = l.dataset.v;
  let dis = e.target.classList.contains('.val') ? e.target : e.target.closest('.val');
  let items = aa.fx.index_items(k,v);
  aa.i.filter_out(dis,items,k,v);
}

// get elements with key:value
// aa.fx.index_items =(k,v)=>
// { 
//   switch (k)
//   {
//     // case 'clas':
//     case 'seen':
//     case 'subs': 
//       let items = document.querySelectorAll('.note[data-'+k+']');
//       return Array.from(items).filter(i=>i.dataset[k].includes(v));
//     case 'pubkey': 
//       return Array.from(document.querySelectorAll('.note[data-pubkey="'+v+'"]'));
//     case 'kind': 
//       return Array.from(document.querySelectorAll('.note[data-kind="'+v+'"]'));
//     case 'tag_t':
//     case 'tag_subject': 
//     case 'tag_d': 
//       return aa.fx.notes_with_tag(k,v);
//   }
//   return []
// };