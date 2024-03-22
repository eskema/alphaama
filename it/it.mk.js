// make elements and stuff
it.mk ={};
// make generic element
it.mk.l =(tag_name,o=false)=>
{
  const l = document.createElement(tag_name);
  if (!o || typeof o !== 'object') return l;
  else for (const k in o)
  {
    let v = o[k];
    switch (k)
    {
      case 'con': l.textContent = v; break;
      case 'id':  l.id = v; break;
      case 'cla': l.className = v; break;
      case 'bef': l.dataset.before = v; break;
      case 'aft': l.dataset.after = v; break;
      case 'ref': l.href = v; break;
      case 'src': l.src = v; break;
      case 'tit': l.title = v; break;
      case 'app': l.append(v); break;
      case 'clk': l.addEventListener('click',v); break;
      case 'nam': l.name = v; break;
      case 'val': l.value = v; break;
      case 'pla': l.placeholder = v; break;
    }
  }
  return l
}; 
// make mod ui
it.mk.mod =mod=>
{
  let o = {id:mod.sn,ls:mod.o.ls};
  if (mod.hasOwnProperty('mk')) o.mk = mod.mk;
  let mod_ls = it.mk.ls(o);
  let mod_l = it.mk.details(mod.sn,mod_ls,1);
  if (mod.l) 
  {
    mod.l.replaceWith(mod_l);
    mod.l = mod_l;
  }
  else 
  {
    mod.l = mod_l;
    const u = document.getElementById('u');
    if (u) u.append(mod_l)
  }
};
// make a regular link
it.mk.link =(url,text=false,title=false)=>
{
  if (!text) text = url;
  let l = it.mk.l('a',{cla:'content_link',ref:url,con:text});
  if (title) l.title = title;
  l.rel = 'noreferrer noopener';
  l.target = '_blank';
  return l
};
// make a nostr link
it.mk.nostr_link =(dis)=>
{
  return it.mk.l('a',
  {
    cla:'nostr_link',
    con:dis.slice(0,12),
    ref:'#'+dis,clk:it.clk.a
  });
};
// make details element
it.mk.details =(s,l=false,open=false)=>
{  
  const details = it.mk.l('details');
  const summary = it.mk.l('summary',{con:s});
  details.append(summary);
  if (open) details.open = true;
  if (!l) return details;
  details.append(l);
  if (l.classList.contains('empty')) details.classList.add('empty');
  else if (l.classList.contains('list')) 
  summary.dataset.after = l.childNodes.length;
  return details;
};
// make list element from object
// o = { id:string,cla:array,ls:object,sort:string,mk:function };
it.mk.ls =o=>
{
  const l = o.l ? o.l : it.mk.l('ul',{cla:'list'});
  l.textContent = '';
  if (o.id) l.id = o.id;
  if (o.cla) l.classList.add(...o.cla.split(' '));
  if (o.ls && Object.keys(o.ls).length) 
  {
    const entries = Object.entries(o.ls);
    if (o.sort) it.fx.sort_by(entries,o.sort);
    for (let i=0;i<entries.length;i++)
    {
      const [k,v] = entries[i];
      l.append( o.hasOwnProperty('mk') ? o.mk(k,v) : it.mk.item(k,v));
    }
  }
  else l.classList.add('empty');
  return l
};
// make generic item from key value
it.mk.item =(k,v,tag_name='li')=>
{
  let l = it.mk.l(tag_name,{cla:'item item_'+k});
  if (Array.isArray(v)) l.append(
    it.mk.l('span',{cla:'key',con:k}),
    it.mk.l('span',{cla:'val',con:v.join(', ')})
  );
  else if (typeof v==='object') l.append(
    it.mk.details(k,it.mk.ls({ls:v}))
  );
  else l.append(
    it.mk.l('span',{cla:'key',
    con:k}),it.mk.l('span',{cla:'val',con:v})
  );
  return l
};
// make time element from timestamp
it.mk.time =timestamp=>
{
  const d = it.t.to_date(timestamp);
  const l = it.mk.l('time',
  {
    cla:'created_at',
    tit:it.t.ago(d),
    con:it.t.nice(d)+' '+timestamp,
    clk:e=> e.target.title = it.t.ago(it.t.to_date(e.target.dataset.timestamp))
  });   
  
  l.dataset.timestamp = timestamp;
  l.setAttribute('datetime', d.toISOString());
  return l
};
// make expand button
it.mk.butt_expand =id=>
{
  const butt = it.mk.l('button',
  {
    con:id,
    cla:'butt',
    id:'butt_'+id,
    clk:it.clk.expanded
  });
  butt.dataset.controls = id
  return butt
};
// make action button
it.mk.butt_action =s=>
{
  const butt = it.mk.l('button',
  {
    con:s,
    cla:'butt',
    clk:e=>{ cli.v(s) }
  });
  return butt
};
// make section element
it.mk.section =(id,expanded=false)=>
{
  const section = it.mk.l('section',{id:id});
  if (expanded) section.classList.add('expanded');
  section.append(it.mk.butt_expand(id))
  return section
};



// creates a link from tag array
// requires it.mk,it.clk
it.fx.tag_a =a=>
{
  const tail =(a,l,i=1)=>{if (a.length>i)l.dataset.tail=a.slice(i).join(', ')};
  const type = a[0];
  const value = a[1];
  let relay;
  const l = it.mk.l('a',{cla:'tag_a_'+type,clk:it.clk.a});
  switch(type)
  {
    case 'e':
      relay = a[2];
      const nid = it.fx.encode('nid',value);
      l.textContent = nid;
      l.href = '#'+nid;
      if (relay) l.dataset.relay = relay;
      tail(a,l,3);
      break;
    case 'p':
      relay = a[2];
      const petname = a[3];
      const npub = it.fx.encode('npub',value);
      l.textContent = npub;
      l.href = '#'+npub;
      if (relay) l.dataset.relay = relay;
      if (petname) l.dataset.petname = petname;
      tail(a,l,4);
      break;
    default:
      l.textContent = value;
      l.href = '#'+it.fx.an(value);
      tail(a,l,2);
  }
  return l
};
// make tag list item
it.mk.tag =(a,i,li=false)=>
{
  let l = li ? li : it.mk.l('li',{cla:'tag tag_'+a[0]});
  
  l.textContent = '';
  l.append(it.mk.l('button',
  {
    con:''+i,
    clk:e=>
    {
      const mom = e.target.parentElement;
      mom.classList.toggle('parsed');
      it.mk.tag(a,i,mom)
    }
  }));

  if (l.classList.contains('parsed')) l.append(it.fx.tag_a(a));
  else l.append(a.join(', '));
  if (!li) 
  {
    l.dataset.tag = a[1];
    if (it.s.x(a[1])) it.fx.color(a[1],l);
    return l
  }
};
// make tag list
it.mk.tags =tags=>
{
  const l = it.mk.l('ol',{cla:'tags'});
  l.start = 0;
  const times = tags.length;
  for (let i=0;i<times;i++) l.append(it.mk.tag(tags[i],i));
  return l
};

it.mk.input =(type,name,value,placeholder)=>
{
  const input = it.mk.l('input',{cla:'ee_input'});
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  return input
};

it.mk.add_input =()=>
{
  const button = it.mk.l('button',{cla:'ee_add_tag',con:'add',clk:e=>
  {
    const l = e.target.previousSibling;
    const input = it.mk.input('ee_tag_'+l.length,'','');
    l.append(input);
  }})
  return button
};



it.note_editor =o=>
{
  const e_e = it.mk.l('ul',{id:'e_e'}); 
  for (const k in o)
  {
    const li = it.mk.l('li',{cla:'ee_'+k});
    li.dataset.label = k;
    if (k==='kind'||k==='created_at')
    {
      li.append(it.mk.input('number',k,o[k],''));
      if (k==='created_at') li.append('now');
    }
    else if (k==='content')
    {
      const content = it.mk.l('textarea',{id:'content'});
      content.name = 'content';
      content.placeholder = 'whatever the fuck u want';
      content.contentEditable = true;
      content.value = o.content;
      li.append(content); 
    }
    else if (k==='tags')
    {
      const tags = it.mk.l('ol',{cla:'ee_tags'});
      tags.start = 0;
      li.append(tags);
      if (o.tags.length)
      {
        for (let i=0;i<o.tags.length;i++)
        {
          const tag_li = it.mk.l('li',{cla:'ee_tag'});
          tag_li.append(it.mk.input('text','ee_tag_'+i,''));
          tags.append(tag_li);
        }     
      }
      li.append(it.mk.add_input())
    }
    e_e.append(li);
  }
  return e_e
};

it.notice =o=>
{
  let notice = it.mk.l('div',{cla:'notice'});
  notice.append(it.mk.l('p',{cla:'title',con:o.title}));
  notice.append(it.mk.l('p',{cla:'description',con:o.description}));
  if (o.hasOwnProperty('yes'))
  {
    const notice_no = it.mk.l('button',
    {
      con:o.no.title,
      cla:'butt no',
      clk:e=>
      {
        o.no.exe(e);
      }
    });
    notice.append(notice_no)
  }
  if (o.hasOwnProperty('no'))
  {
    const notice_yes = it.mk.l('button',
    {
      con:o.yes.title,
      cla:'butt yes',
      clk:e=>
      {
        o.yes.exe(e);
      }
    });
    notice.append(notice_yes)
  }

  v_u.log(notice);

};

it.confirm =o=>
{
  const dialog = document.getElementById('dialog');
  const dialog_close =()=>
  {
    dialog.close();
    dialog.textContent = '';
  };
  const dialog_stuff = it.mk.l('header',{cla:'dialog_stuff'});
  if (o.description) dialog.dataset.label=o.description;
  const dialog_cancel = it.mk.l('button',
  {
    con:'cancel',
    cla:'butt cancel',
    clk:e=>
    {
      dialog_close();
      if (o.hasOwnProperty('no')) o.no();
    }
  });
  const dialog_confirm = it.mk.l('button',
  {
    con:'confirm',
    cla:'butt confirm',
    clk:e=>
    {
      dialog_close();
      if (o.hasOwnProperty('yes')) o.yes();
    }
  });
  dialog_stuff.append(dialog_cancel,dialog_confirm);
  dialog.append(o.l,dialog_stuff);
  dialog.showModal();
  if (o.scroll) dialog.scrollTop = dialog.scrollHeight;
};