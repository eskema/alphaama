// index stuff

aa.i =
{
  clk:{},
  ls:['pubkey','kind','tag_t','tag_d','tag_subject','subs','seen','clas'],
  head:
  {
    "id":{},
    "pubkey":{},
    "kind":{},
    "tag_t":{},
    "tag_d":{},
    "tag_subject":{},
    "subs":{},
    "seen":{},
    "since":0,
    "until":0,
  }
};


// on load

aa.i.load =()=>
{
  // const index = aa.mk.l('nav',{id:'index',cla:'empty',clk:aa.clk.expanded});
  // document.getElementById('u').append(index);
  // const section = aa.mk.section('i');
  aa.i.l = aa.mk.l('ul',{id:'i',cla:'list'});
  const app_u = ()=>
  {
    console.log('app_u', document.getElementById('u_u'))
    let u = document.getElementById('u_u');
    if (u) u.append(aa.i.l);
    else setTimeout(()=>{app_u()}, 100);
  };
  app_u();
  
  
  // section.append(aa.i.l);
  
  aa.i.run();
};




// index dat

aa.i.d =dat=>
{
  if (!aa.i.head.id.hasOwnProperty(dat.event.id))
  {
    aa.i.head.id[dat.event.id] = 1;
    if (dat.subs) for (const sub of dat.subs) aa.i.dex.e('subs',sub);
    if (dat.seen) for (const seen of dat.seen) aa.i.dex.e('seen',seen);
    if (dat.clas) for (const clas of dat.clas) aa.i.dex.e('clas',clas);
    
    aa.i.dex.e('pubkey',dat.event.pubkey);
    aa.i.dex.e('kind',dat.event.kind);
    aa.i.dex.at(dat.event.created_at);
    aa.i.dex.tags(dat.event.tags);
  }
  else aa.i.head.id[dat.event.id]++
};


// build index

aa.i.run =()=>
{
  aa.i.l.classList.remove('empty');
  aa.i.l.textContent = '';
  
  for (const k of aa.i.ls)
  {
    let li = aa.mk.l('li',{cla:'item',id:'i_'+k});
    let list = aa.mk.l('ul',{id:'i_list_'+k});
    // let list = aa.mk.ls({id:'i_list_'+k});
    li.append(
      aa.mk.details(k,list)
    );

    aa.i.l.append(li);
  }
  aa.i.l.append(aa.mk.i_item('since',0,'since'));
  aa.i.l.append(aa.mk.i_item('until',0,'until'));
}; 


// make index author item

aa.mk.i_pubkey =(k,v,id)=>
{
  let li = aa.mk.i_item(k,v,id);
  let p_name = aa.mk.p_link(k).querySelector('.name');
  let key = li.querySelector('.key');
  // let p = aa.db.p[k];
  // if (p)
  // key.textContent = aa.db.p[k]?.metadata?.name ?? aa.fx.encode('npub',k).slice(0,12);

  key.textContent = '';
  key.append(p_name||aa.fx.encode('npub',k).slice(0,12));
  return li
};

// make index seen item

aa.mk.i_seen =(k,v,id)=>
{
  let ank = aa.fx.an(k);
  let li = aa.mk.l('li',{cla:'item',id:'i_item_'+ank});
  li.dataset.v = k;
  if (id) li.dataset.k = id;
  let key = aa.mk.l('button',{cla:'key',con:k,clk:aa.clk.key});
  let val = aa.mk.l('button',{cla:'val',con:v,clk:aa.clk.val});
  li.append (key,val);
  return li
};

aa.mk.i_tag_subject =(k,v,id)=>
{
  return aa.mk.i_seen(k,v,id)
};


// make index item

aa.mk.i_item =(k,v,id)=>
{
  let ank = aa.fx.an(k);
  let li = aa.mk.l('li',{cla:'item',id:'i_item_'+ank});
  li.dataset.v = k;
  if (id) li.dataset.k = id;
  let key = aa.mk.l('button',{cla:'key',con:k,clk:aa.clk.key});
  let val = aa.mk.l('button',{cla:'val',con:v,clk:aa.clk.val});
  li.append (key,val);
  return li
};


// returns all the notes that have a tag with value

aa.get.notes_with_tag =(k,v)=>
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
    // let is_new = aa.fx.a_add(ids,[note.dataset.id]);
    // if (is_new) notes.push(note);
  }
  return notes
};


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


aa.i.filter_solo_rm =(items,k_v)=>
{
  for (const l of items)
  {
    let a = aa.l.dataset.solo ? aa.fx.a_rm(aa.l.dataset.solo.trim().split(' '),[k_v]) : [];
    if (a.length) aa.l.dataset.solo = a.join(' ');
    else
    {
      aa.l.dataset.solo = '';
      aa.l.classList.remove('haz_solo');
    }
    l.classList.remove('solo')
    aa.fx.path_rm(k_v);
  }
};




aa.i.filter_out_apply =(items,k_v)=>
{
  for (const l of items)
  {
    let a = l.dataset.out ? l.dataset.out.trim().split(' ') : [];
    aa.fx.a_add(a,[k_v]);
    l.dataset.out = a.join(' ');
    l.classList.add('out');
  }
};


aa.i.filter_solo_apply =(items,k_v)=>
{ 
  aa.l.classList.add('haz_solo');
  if (!aa.l.dataset.solo) aa.l.dataset.solo = k_v;
  else 
  {
    let a = aa.l.dataset.solo.trim().split(' ');
    aa.fx.a_add(a,[k_v]);
    aa.l.dataset.solo = a.join(' ');
  }

  for (const l of items) 
  { 
    l.classList.add('solo'); 
    aa.fx.path(l,k_v)
  }
};


// filter events by key

aa.i.filter_out =(dis,items,k,v)=>
{
  const k_v = k+'_'+v;
  if (items)
  {
    if (dis.classList.contains('out')) aa.i.filter_out_rm(items,k_v)
    else aa.i.filter_out_apply(items,k_v);
    dis.classList.toggle('out');
  }
};


// filter events by value

aa.i.filter_solo =(dis,items,k,v)=>
{
  const k_v = k+'_'+v;
  if (dis.classList.contains('solo')) aa.i.filter_solo_rm(items,k_v)
  else aa.i.filter_solo_apply(items,k_v);
  dis.classList.toggle('solo')
};


// get elements with key:value

aa.get.index_items =(k,v)=>
{
  let items;
  switch (k)
  {
    case 'seen':
    case 'subs': 
      items = document.querySelectorAll('.note[data-'+k+']');
      items = Array.from(items).filter(i=>i.dataset[k].includes(v));
      break;
    case 'pubkey': 
      items = document.querySelectorAll('.note[data-pubkey="'+v+'"]');
      break;
    case 'kind': 
      items = document.querySelectorAll('.note[data-kind="'+v+'"]');
      break;
    case 'tag_t':
    case 'tag_subject': 
    case 'tag_d': 
      items = aa.get.notes_with_tag(k,v); break;
    // case 'since': 
    //   items = document.querySelectorAll(' .note[data-pubkey="'+v+'"]'); 
    //   break;
    // case 'until': 
    //   items = document.querySelectorAll(' .note[data-pubkey="'+v+'"]'); 
    //   break;
  }
  return items
};


// click event for index items

aa.clk.i_head =e=>
{
  const k = e.target.closest('details').querySelector('summary').innerText;
  const v = e.target.parentElement.dataset.v;

  let items = aa.get.index_items(k,v);
  if (e.target.classList.contains('key')) aa.i.filter_by_key(e,items,k);
  else aa.i.filter_by_val(e,items,k);
}

aa.clk.key =e=>
{
  let l = e.target.closest('.item');
  const k = l.dataset.k;
  const v = l.dataset.v;
  let dis = e.target.classList.contains('.key') ? e.target : e.target.closest('.key');
  let items = aa.get.index_items(k,v);
  aa.i.filter_solo(dis,items,k,v);
}

aa.clk.val =e=>
{
  let l = e.target.closest('.item');
  const k = l.dataset.k;
  const v = l.dataset.v;
  let dis = e.target.classList.contains('.val') ? e.target : e.target.closest('.val');
  let items = aa.get.index_items(k,v);
  aa.i.filter_out(dis,items,k,v);
}


aa.i.dex = {};

// index key value pair

aa.i.dex.e =(k,v)=>
{
  let h = aa.i.head;
  let list = document.getElementById('i_list_'+k);
  let item;
  if (!h[k]) h[k] = {};
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


// index oldest and newest timestamp

aa.i.dex.at =(v)=> 
{
  let h = aa.i.head;
  if (!h.since || v < h.since) h.since = v;
  if (!h.until || v > h.until) h.until = v;
};


// index tags

aa.i.dex.tags =(tags)=>
{
  for (const tag of tags)
  {
    const [k,v] = tag;
    switch (k)
    {
      case 't': aa.i.dex.e('tag_'+k,v); break;
      case 'd': aa.i.dex.e('tag_'+k,v); break;
      case 'subject': aa.i.dex.e('tag_'+k,v); break;
    }
  }
};

window.addEventListener('load',aa.i.load);