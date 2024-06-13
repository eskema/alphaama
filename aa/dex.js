const dex =
{
  clk:{},
};

dex.load =()=>
{
  const index = aa.mk.l('nav',{id:'index',cla:'empty',clk:aa.clk.expanded});
  document.getElementById('u').append(index);
};

dex.kindex =dat=>
{
  let header = dex.head;
  if (dat.subs) for (const sub of dat.subs) aa.index.e('subs',sub);
  if (dat.seen) for (const seen of dat.seen) aa.index.e('seen',seen);
  aa.index.e('authors',dat.event.pubkey);
  aa.index.e('kinds',dat.event.kind);
  aa.index.at(header,dat.event.created_at);
  aa.index.tags(header,dat.event.tags);
};

aa.dex =()=>
{
  const f = ()=>
  {
    let index = document.getElementById('index');
    index.classList.remove('empty');
    index.textContent = '';
    index.append(dex.header(dex.head));
    // let butt = document.getElementById('butt_e');
    // butt.dataset.count = document.querySelectorAll('.note').length;
    
  };
  aa.to(f,50,'index');
};

dex.header_butt_authors =(k,v)=>
{
  let li = aa.mk.l('li',{cla:'item item_'+k});
  li.dataset.v = k;
  let spanval = aa.mk.l('button',{cla:'val',con:v,clk:dex.clk.head});
  let name = aa.db.p[k]?.metadata?.name ?? aa.fx.encode('npub',k);
  // if (aa.db.p[k]?.metadata?.name && aa.db.p[k].metadata.name) name = aa.db.p[npub].metadata.name;
  let spankey = aa.mk.l('button',{cla:'key',con:name,clk:dex.clk.head});
  
  li.append (spankey,spanval);
  return li
};

dex.header_butt =(k,v)=>
{
  let li = aa.mk.l('li',{cla:'item item_'+k});
  li.dataset.v = k;
  let spankey = aa.mk.l('button',{cla:'key',con:k,clk:dex.clk.head});
  let spanval = aa.mk.l('button',{cla:'val',con:v,clk:dex.clk.head});
  li.append (spankey,spanval);
  return li
};

dex.header =(o)=>
{
  console.log('dex.header',o);
  const l = aa.mk.l('ul',{cla:'list header'});

  Object.entries(o).map(([k,v])=>
  {
    let li;
    switch (k)
    {
      case 'since':
      case 'until': 
        li = dex.header_butt(k,v);
        break;
      case 'authors': 
        li = aa.mk.l('li',{cla:'item item_'+k});
        li.append(aa.mk.details(k,aa.mk.ls({ls:v,mk:dex.header_butt_authors,sort:'desc'})));
        break;
      default:
        li = aa.mk.l('li',{cla:'item item_'+k});
        li.append(aa.mk.details(k,aa.mk.ls({ls:v,mk:dex.header_butt,sort:'desc'})));
    }
    l.append(li);
    
  });

  return l
};

const get_index_clk =(e)=>
{
  return [
    e.target.closest('details').querySelector('summary').innerText, // k
    e.target.parentElement.dataset.v, // v
    // e.target.parentElement.querySelector('.key').textContent, // v
    e.target.classList.contains('key')?'key':'val', // kv
  ]
};

const get_all_with_tag =(k,v)=>
{
  let ids = [];
  let notes = [];
  let tagged = document.querySelectorAll('.tag_'+k+'[data-tag="'+v+'"]');
  console.log(tagged.length);
  for (const tag of tagged)
  {
    let note = tag.closest('.note');
    let note_id = note.dataset.id;
    let is_new = aa.fx.a_add(ids,[note_id]);
    if (is_new)  notes.push(note);
  }
  return notes
};

const index_filter_key =(e,items,k)=>
{
  if (items)
  {
    if (e.target.classList.contains('out'))
    {
      items.forEach((l)=>
      {
        let a = aa.fx.a_rm(l.dataset.out.trim().split(' '),[k]);
        if (a.length) l.dataset.out = a.join(' ');
        else
        {
          l.dataset.out = '';
          l.classList.remove('out')
        }
      });
    }
    else
    {
      items.forEach((l)=>
      {
        let a = l.dataset.out ? l.dataset.out.trim().split(' ') : [];
        aa.fx.a_add(a,[k]);
        l.dataset.out = a.join(' ');
        l.classList.add('out')
      });
    }
    e.target.classList.toggle('out')
  }
};
const index_filter_val =(e,items,k)=>
{
  if (e.target.classList.contains('solo'))
  {
    items.forEach((l)=>
    {
      let a = aa.l.dataset.solo ? aa.fx.a_rm(aa.l.dataset.solo.trim().split(' '),[k]) : [];
      if (a.length) aa.l.dataset.solo = a.join(' ');
      else
      {
        aa.l.dataset.solo = '';
        aa.l.classList.remove('haz_solo');
      }
      l.classList.remove('solo')
      aa.fx.path_rm(k);
    });
  }
  else
  {
    if (aa.l.classList.contains('haz_solo'))
    {
      let solos = document.querySelectorAll('.solo');
      if (solos) solos.forEach((i)=>{i.classList.remove('solo')});
      aa.fx.path_rm(k);
    }
    else aa.l.classList.add('haz_solo');
    if (items) items.forEach((l)=>{ l.classList.add('solo'); aa.fx.path(l,k)});
  }
  e.target.classList.toggle('solo')
};

// get elements with key:value

aa.get.index_items =(k,v)=>
{
  let items;
  switch (k)
  {
    case 'subs': 
      items = document.querySelectorAll('.note[data-subs="'+v+'"]');
      break;
    case 'authors': 
      items = document.querySelectorAll('.note[data-pubkey="'+v+'"]');
      break;
    case 'kinds': 
      items = document.querySelectorAll('.note[data-kind="'+v+'"]');
      break;
    case 'tag_t':
    case 'tag_subject': 
    case 'tag_d':
      let tagged = {};
      let tags = document.querySelectorAll('.'+k+'[data-tag="'+v+'"]');
      for (const tag of tags)
      {
        let l = tag.closest('.note');
        if (!tagged[l.id]) tagged[l.id] = l;
      }
      items = Object.values(tagged);
      break;
    case 'since': s2 = ' .note[data-pubkey="'+v+'"]'; break;
    case 'until': s2 = ' .note[data-pubkey="'+v+'"]'; break;
  }
  return items
};

dex.clk.head =(e)=>
{
  const [k,v,kv] = get_index_clk(e);
  console.log(k,v);
  let items = aa.get.index_items(k,v,kv);
  if (kv === 'key') index_filter_key(e,items,k);
  else index_filter_val(e,items,k);
}

dex.head =
{
  "authors":{},
  "kinds":{},
  "tag_t":{},
  "tag_d":{},
  "tag_subject":{},
  "subs":{},
  "seen":{},
  "since":0,
  "until":0,
  "mia_e":{},
  "mia_p":{},
}

aa.index = {};
aa.index.e =(k,v)=>
{
  let header = dex.head;
  if (!header[k][v]) header[k][v] = 1;
  else header[k][v]++;
};
aa.index.at =(h,v)=> 
{
  if (!h.since || v < h.since) h.since = v;
  if (!h.until || v > h.until) h.until = v;
};
aa.index.tags =(h,tags)=>
{
  tags.map((tag)=>{aa.index.tag(header,tag)});
}
aa.index.tag =(h,a)=>
{
  switch (a[0])
  {
    case 't':
      aa.index.e('tag_'+a[0],a[1]);
      break;
  }
};