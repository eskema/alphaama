// make button with a clk
aa.mk.butt_clk =sa=>
{
  let con,cla,clk;
  if (Array.isArray(sa))
  {
    con = sa[0];
    if (sa[1])
    {
      cla = sa[1];
      if (sa[2]) clk = sa[2];
      else clk = cla;
    }
    else clk = cla = con;
  }
  else clk = cla = con = sa;
  cla = 'butt '+cla;
  clk = aa.clk[clk];
  return make('button',{con,cla,clk});
};


// button to copy text to clipboard
aa.mk.butt_clip =(content,options)=>
{
  if (typeof content !== 'string') 
    content = JSON.stringify(content);

  return make('button',
  {
    content: 'copy to clipboard',
    classes: 'butt clip',
    title: 'copy to clipboard',
    clk: async e=>
    {
      try
      {
        await navigator.clipboard.writeText(content);
        let l = e.target;
        fastdom.mutate(()=>
        {
          l.classList.remove('copied','failed');
          l.classList.add('copied')
        })
        
        // setTimeout(()=>{l.classList.add('copied')},100);
      }
      catch (er) 
      {
        e.target.classList.add('failed');
      }
    }
  })
};


// make event wrapper object
aa.mk.dat =(o={})=>
{
  const dat = {};
  if (o.event)
  {
    dat.event = o.event;
    if (aa.fx.kind_type(dat.event.kind) === 'parameterized')
    {
      let id_a = aa.fx.id_ae(dat.event);
      if (id_a) dat.id_a = id_a;
    }
  }
  dat.seen = o.seen || [];
  dat.subs = o.subs || [];
  dat.clas = o.clas || [];
  dat.refs = o.refs || [];
  
  return dat
};


// make details element
aa.mk.details =(con,l=false,open=false,cla='')=>
{ 
  const details = make('details',{cla});
  if (open) details.open = true;
  // cla = 'base' + cla?' '+cla:'';
  const summary = make('summary',{con});
  details.append(summary);
  if (!l) return details;
  if (l instanceof HTMLElement)
    summary.dataset.count = l.children.length;
  details.append(l);
  return details
};


aa.mk.dialog =(id='dialog')=>
{
  let dialog = make(id);
  
  dialog.addEventListener('close',e=>
  {
    dialog.removeAttribute('title');
    dialog.textContent = '';
  });

  return dialog
};


// 
aa.mk.confirm =async options=>
{
  const dialog = aa.el.get('dialog');
  if (!dialog || dialog.open) return false;
  
  const dialog_options = make('p',{cla:'dialog_options'});
  
  const dialog_no = make('button',
  {
    con:options.no.title || 'cancel',
    cla:'butt cancel',
    clk:e=>
    { 
      if (Object.hasOwn(options.no,'exe'))
        options.no.exe(); 
      dialog.close() 
    }
  });
  dialog_no.setAttribute('autofocus',true);
  dialog_options.append(dialog_no);
  
  if (Object.hasOwn(options,'yes'))
  {
    const dialog_yes = make('button',
    {
      con:options.yes.title || 'confirm',
      cla:'butt confirm',
      clk:e=>
      { 
        if (Object.hasOwn(options.yes,'exe')) 
          options.yes.exe(); 
        dialog.close()
      }
    });
    dialog_options.append(dialog_yes);
  }

  const has_title = Object.hasOwn(options,'title');
  const has_l = Object.hasOwn(options,'l');
  const has_scroll = Object.hasOwn(options,'scroll');

  let df = new DocumentFragment();
  if (has_l) df.append(options.l);
  df.append(dialog_options);

  fastdom.mutate(()=>
  {
    dialog.title = has_title ? options.title : '';
    dialog.append(df);
    dialog.showModal();
    
    if (has_l && has_scroll) 
      setTimeout(()=>{ aa.fx.scroll(options.l,options.scroll) },200);
  })
};


// make document (ex: read_me)
aa.mk.doc =text=>
{
  if (!text) return;
  let article = make('article',
  {
    cla:'content parsed',
    app:aa.fx.parse(text,aa.fx.is_trusted(4))
  });

  let title = text.slice(0,text.indexOf('\n'));
  if (title.startsWith('=') || title.startsWith('#')) 
    title = title.slice(1).trim();
  
  let details = aa.mk.details(title,article);
  details.id = 'aa_read_me';
  return details
};


aa.mk.help =async(s='')=>
{
  let o;
  if (!s?.length) 
  {
    s = 'aa';
    o = aa;
    await aa.fx.readme('/aa/README.adoc',aa);
  }
  else o = aa[s];

  let id = `help ${s}`;
  if (aa.el.has(id))
  {
    fastdom.mutate(()=>
    {
      let l = aa.el.get(id);
      l.toggleAttribute('open',true);
      // aa.logs.append(l.parentElement);
      aa.fx.scroll(l)
    })
    return
  }
  // let mod = s==='aa'?aa:aa[s];
  // if (!mod) mod = aa;
  if (!o?.readme)
  {
    aa.log('cannot help with that :/ '+s)
    return
  }

  // if (!text) return;

  let article = make('article',
  {
    cla:'content parsed',
    app:aa.fx.parse(o.readme,1)
  });

  // let title = text.slice(0,text.indexOf('\n'));
  // if (title.startsWith('=') || title.startsWith('#')) 
  //   title = title.slice(1).trim();
  
  let details = aa.mk.details(id,article,1);
  aa.el.set(id,details);
  view.append(details);
  // let log = aa.log(details);
  setTimeout(()=>{aa.fx.scroll(details)},200);
  // return details
};


// make generic image
aa.mk.img =(src,thumb=false)=>
{
  const l = make('img');
  l.loading = 'lazy';
  l.src = src;
  if (!thumb) 
  {
    l.addEventListener('click',e=>{aa.mk.img_modal(src)});
    l.classList.add('content-img');
  }
  else
  {
    l.classList.add('thumb');
    l.height = 80;
  }
  return l
};


// reusable drop zone — on_drop receives FileList
aa.mk.drop =(on_drop, text='drop files here')=>
{
  let el = make('div', {cla: 'drop', con: text});
  el.addEventListener('dragover', e =>
  {
    e.preventDefault();
    el.classList.add('over');
  });
  el.addEventListener('dragleave', () =>
  {
    el.classList.remove('over');
  });
  el.addEventListener('drop', e =>
  {
    e.preventDefault();
    el.classList.remove('over');
    if (e.dataTransfer.files.length) on_drop(e.dataTransfer.files);
  });
  return el
};


// show image in modal on click
aa.mk.img_modal =(src,cla=false)=>
{
  const dialog = aa.el.get('dialog');
  
  const img = make('img',
  {
    src,
    cla:'img_modal contained'+(cla?' '+cla:''),
    clk:()=>{ dialog.close() }
  });
  
  const butt = make('button',
  {
    con:'bigger',
    cla:'butt modal',
    clk:e=>
    {
      let text = e.target.textContent;
      if (text === 'bigger') e.target.textContent = 'smaller';
      else e.target.textContent = 'bigger';
      img.classList.toggle('contained');
    }
  });
  fastdom.mutate(()=>
  {
    dialog.append(butt,' ',img);
    dialog.showModal();
  })
};


// make generic list item from key : value
aa.mk.item =(key='',value,options)=>
{
  let tag_name = options?.tag_name || 'li';
  let cla = 'item';
  if (key) cla += ` item_${key}`;

  let element = make(tag_name,{cla});
  let item;

  if (Array.isArray(value))
  {
    item = aa.mk.item_arr(key,value);
    element.classList.add('ls_arr');
  }
  else if (typeof value==='object')
  {
    let dis = {ls:value}; 
    item = aa.mk.details(key,aa.mk.ls(dis));
    element.classList.add('ls_obj');
  }
  else
  {
    if (typeof value === 'number')
      element.classList.add('ls_num')
    else if (typeof value === 'boolean')
      element.classList.add('ls_bool')
    else element.classList.add('ls_str');
    
    value = value+'';
    if (!value.length) element.classList.add('empty');
    if (value === null) value = 'null';

    if (key) item = make('span',{cla:'key',con:key});

    element.append(make('span',{cla:'val',con:value}));
  }
  if (item)
  {
    if (item.classList.contains('empty')) 
      element.classList.add('empty');
    element.prepend(item);
  }
  return element
};


aa.mk.item_arr =(k,v)=>
{
  let list = aa.mk.ls({});
  if (!v.length) list.classList.add('empty');
  else list.classList.remove('empty');
  for (let i=0;i<v.length;i++) list.append(aa.mk.item('',v[i]));
  return aa.mk.details(k,list);
}

// make a regular link
aa.mk.link =(url,text=false,title=false)=>
{
  let l;
  if (!text) text = url;
  if (aa.fx.url(url))
  {
    l = make('a',{cla:'content_link',ref:url,con:text});
    l.rel = 'noreferrer noopener';
    l.target = '_blank';
  }
  else l = make('span',{cla:'content_link',con:text});
  if (title) l.title = title;
  
  return l
};



// make list element from object
aa.mk.ls =o=>
{
  // o = 
  // { 
  //   id:string,
  //   cla:string,
  //   l:element,
  //   ls:object,
  //   sort:string,
  //   mk:function to make element
  //   exes:[...(k,v,l)=>{})] 
  // }

  let l = o.l;
  if (!l)
  {
    l = make('ul',{cla:'list'});
    if (o.id) l.id = o.id;
    if (o.cla) l.classList.add(...o.cla.split(' '));
  }
  l.textContent = '';
  
  if (o.ls) 
  {
    let keys = Object.keys(o.ls);
    if (keys?.length)
    {
      if (o.sort) keys = keys.sort(aa.fx.sorts[o.sort]);
      for (const k of keys)
      {
        const v = o.ls[k];
        const item = o.hasOwnProperty('mk') 
        ? o.mk(k,v) 
        : aa.mk.item(k,v);
        if (!item) continue;
        l.append(item);
        if (Object.hasOwn(o,'fun')) for (const exe of o.fun) exe(k,v,item);
      }
    }
  }
  else l.classList.add('empty');
  return l
};


// make list element from object
aa.mk.list =dis=>
{
  let l = make('ul',{cla:'list ls'});
  if (typeof dis !== 'object') return l;

  if (Array.isArray(dis))
  {
    l.classList.add('ls_arr')
    for (const i of dis)
    {
      l.append(aa.mk.item(0,i));
    }
  }
  else
  {
    l.classList.add('ls_obj')
    for (const i in dis)
    {
      l.append(aa.mk.item(i,dis[i]));
    }
  }
  if (!l.children.length) l.classList.add('empty');
  return l
};


aa.mk.sift_input =(options={})=>
{
  const name = options.name || `list_filter_${aa.fx.rands()}`;
  const classes = options.classes || 'list_filter';
  const placeholder = options.placeholder || '(Y)';
  const input = make('input',
  {
    name,
    classes,
    placeholder
  });

  input.addEventListener('keyup',e=>
  {
    debt.add(()=>
    {
      fastdom.mutate(()=>
      {
        options.value = e.target.value;
        sift.content(options) 
      })
    }, 420, name)
  });
  
  return input
};


aa.mk.sift_input_map =options=>
{
  const name = options.name || `sift_filter_${aa.fx.rands()}`;
  const input = make('input',
  {
    name,
    classes: 'list_filter',
    placeholder: '(Y)',
  });

  input.addEventListener('keyup',e=>
  {
    debt.add(()=>
    {
      fastdom.mutate(()=> 
      { 
        options.value = e.target.value;
        sift.map(options)
      })
    }, 420, name)
  });
  
  return input
};


// get meta data from manifest
aa.mk.manifest =()=>
{
  const ref = '/site.webmanifest';
  fetch(ref).then(dis=>dis.json())
  .then(manifest=>
  {
    let df = new DocumentFragment();
    df.append(make('link',{rel:'manifest',ref}));
    for (const icon of manifest.icons)
    {
      let link = make('link');
      if (icon.src.includes('apple-touch-icon'))
      {
        link.rel = 'apple-touch-icon';
        link.sizes = icon.sizes;
      }
      else if (icon.src.includes('safari-pinned-tab'))
      {
        link.rel = 'mask-icon';
        link.color = manifest.theme_color
      }
      else
      {
        link.rel = 'icon';
        if ('sizes' in icon) link.sizes = icon.sizes;
        if ('type' in icon) link.type = icon.type;
      }
      link.href = icon.src;
      df.append(link);
    }
    fastdom.mutate(()=>{document.head.append(df)})
  });
};


// check for nip7 extension (window.nostr) availability
// and log the result
aa.mk.nip7_butt =()=>
{
  let s = 'window.nostr: ok';
  if (window.nostr) return true

  aa.log(make('button',
  {
    con:'window.nostr: not found, you need it for signing',
    cla:'butt nip07_check',
    clk:e=>
    {
      aa.clk.clkd(e);
      if (window.nostr)
      {
        let parent = e.target.parentElement;
        parent.textContent = '';
        parent.append(make('p',{con:s}));
      }
    }
  }),0,0);

  return false
};


// log a notice
aa.mk.notice =(o,inverted)=>
{
// o =
// {
//   id:'',
//   title:'',
//   butts:
//   [
//    {tit:'',cla:'',exe:()=>{}},
//   ]
// }
  // console.log(o);
  let cla = 'notice';
  let l = make('div',{cla});
  if (Object.hasOwn(o,'id')) l.id = o.id;
  
  // cla = 'description';
  // if (Object.hasOwn(o,cla)) l.append(make('p',{cla,con:o.description}));
  for (const butt of o.butts)
  {
    cla = 'butt'+(' '+butt.cla||'');
    const con = butt.con;
    const clk = butt.exe;
    l.append(make('button',{cla,con,clk}));
  }

  cla = 'title';
  con = o.title;
  if (Object.hasOwn(o,cla)) 
  {
    const dis = make('p',{cla,con});
    if (!inverted) l.prepend(dis);
    else l.append(dis);
  }

  return l
};



// make a nostr link
aa.mk.nostr_link =(s='',con=false)=>
{
  const a = make('a',
  {
    cla:'nostr_link',
    con:con||s.slice(0,12),
    ref:'#'+s,
    // clk:aa.clk.a
  });
  

  setTimeout(()=>{
    a.addEventListener('click',aa.clk.a)
  },200);

  if (s && !con) a.classList.add('sliced');
  if (!s) 
  {
    a.removeAttribute('href');
    a.classList.add('empty');
  }
  
  return a
};


// restrict amount of root events displayed at once, 
aa.mk.pagination =options=>
{
  let {
    element,
    order,
    max
  } = options;

  let pagination = make('p',{cla:'pagination'});

  if (!options.page) options.page = 1;
  
  let page_input = make('input',
  {
    type: 'number',
    classes: 'pagination_page',
    min: 1,
    value: 1,
    listeners:
    {
      'change': async e=>
      {
        options.page = parseInt(e.target.value);
        sift.paginate(options)
      }
    }
  });

  let total_span = make('span',{classes:'pagination_total'});
  options.page_input = page_input;
  options.total_pages_el = total_span;

  let prev_butt = make('button',
  {
    classes: 'butt pagination_previous', 
    content: 'previous page'
  });

  let next_butt = make('button',
  {
    classes: 'butt pagination_next', 
    content: 'next page',
  });

  const order_toggle =order=>
  {
    return order === 'asc'
      ? 'desc'
      : 'asc'
  };

  const order_text =order=>
  {
    return order === 'asc'
      ? 'oldest'
      : 'newest'
  };

  let order_butt = make('button',
  {
    classes: 'butt order',
    content: order_text(options.order),
  });

  let max_input = make('input',
  {
    type: 'number',
    classes: 'pagination_max',
    min: 1,
    value: max,
  });

  prev_butt.addEventListener('click',async e=>
  {
    let new_page = options.page - 1;
    if (new_page < 1) new_page = 1;
    page_input.value = options.page = new_page;
    sift.paginate(options);
    setTimeout(()=>{element.scrollIntoView()},200);
  });

  next_butt.addEventListener('click',async e=>
  {
    let new_page = options.page + 1;
    let total_pages = options.counts?.pages;
    if (total_pages && new_page > total_pages) new_page = total_pages;
    page_input.value = options.page = new_page;
    sift.paginate(options);
    setTimeout(()=>{element.scrollIntoView()},200);
  });

  order_butt.addEventListener('click',async e=>
  {
    options.order = order_toggle(options.order);
    e.target.textContent = order_text(options.order);
    sift.paginate(options);
  });

  max_input.addEventListener('change',async e=>
  {
    options.max = parseInt(e.target.value);
    sift.paginate(options);
  });

  let page_controls = make('span',
  {
    classes: 'page_controls',
    app: ['page ',page_input,' / ',total_span,' showing ',max_input,' root notes ordered by ', order_butt]
  });
  
  pagination.append( 
    prev_butt,' ',page_controls,' ',next_butt
  );

  return pagination
};


// qr code
aa.mk.qr =s=>
{
  let l = make('div',{cla:'qrcode'});
  aa.temp.qr = new QRCode(l,
  {
    text: s.trim(),
    width: 512,
    height: 512,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  let img = l.querySelector('img');
  img.classList.add('qr');
  img.addEventListener('click',e=>{aa.mk.img_modal(img.src,'qr')});
  return img
};


// a reload button
aa.mk.reload_butt =()=> 
{
  return make('button',
  {
    con:'reload the page',
    cla:'butt exe',
    clk:e=>{location.reload()}
  })
};


// make section element
aa.mk.section =options=>
{
  let 
  {
    clk,
    id,
    name,
    element,
    expanded,
    classes,
    filter,
    filter_by,
    map,
    sort_by,
    collapse,
    tagname,
    order,
    max,
  } = options;

  
  if (!tagname) tagname = 'section';
  let section_id = `section_${id}`;
  if (!name) name = id;
  
  if (!classes?.length) classes = '';
  classes += ` section ${section_id}`;
  classes = classes.trim();
  
  let section_butt = make('button',
  {
    con: name,
    cla: `butt section_butt ${section_id}_butt`,
    clk: clk || aa.clk.expand,
    dat: {id, controls: section_id}
  });
  aa.el.set(`butt_${section_id}`,section_butt);
  
  let header = make('header',{app:section_butt});
  let footer = make('footer');

  let section_options = 
  {
    cla:classes.trim(),
    dat:{id},
    app:[header]
  };
  if (expanded) section_options.cla += ' expanded';
  if (element) section_options.app.push(element);

  const section = make(tagname,section_options);
  aa.el.set(section_id,section);

  let sift_options = 
  {
    element: element || section,
    filter_by,
    items: [],
    map,
    max,
    order,
    sort_by,
  };

  aa.temp[section_id] = sift_options;
  
  if (collapse)
  {
    header.append(
      ' ',
      make('button',
      {
        con:'-',
        cla:'butt collapse',
        clk:()=>{ section.classList.toggle('collapsed') }
      })
    );
  }

  if (max)
  {
    footer.append(aa.mk.pagination(sift_options));
  }

  if (filter)
  {
    header.append(
      ' ',
      aa.mk.sift_input_map(sift_options)
    );
  }

  if (footer.children.length) section.append(' ',footer);

  return section
};


// aa.e.sift =()=>
// {

// };


// make server item
aa.mk.server =(k,v,type='li')=>
{
  url = aa.fx.url(k);
  if (!url) return false;

  return make(type,
  {
    cla:'item server',
    dat:{sets:v.sets},
    app:[
      make('span',{cla:'protocol',con:url.protocol+'//'}),
      make('span',{cla:'host',con:url.host}),
      make('span',{cla:'pathname',con:url.pathname}),
      make('span',{cla:'hashsearch',con:url.hash+url.search})
    ]
  });
};


// status element
aa.mk.status =force=>
{
  let status = aa.el.get('status');
  if (!force && status) return status;

  let on_off = aa.online ? 'on' : 'off';
  status = make('p',
  {
    con: `${on_off}line at ${location.origin} since `,
    app: aa.mk.time(aa.now)
  });
  aa.el.set('status',status);

  // verify with a real fetch — update if navigator.onLine lied
  aa.check_online().then(real=>
  {
    let new_off = real ? 'on' : 'off';
    if (new_off !== on_off)
    {
      fastdom.mutate(()=>
      {
        status.firstChild.textContent = `${new_off}line at ${location.origin} since `;
      })
    }
  });

  return status
};


// make time element from timestamp
aa.mk.time =timestamp=>
{
  const d = new Date(timestamp*1000);
  const title = aa.fx.time_display(timestamp);
  const l = make('time',
  {
    cla:'created_at',
    con:timestamp,
    clk:aa.clk.time
  });
  l.setAttribute('datetime', d.toISOString());
  l.title = title;
  l.dataset.elapsed = aa.fx.time_elapsed(d);
  return l
};


// upload images (wip)
aa.mk.file_input =()=>
{
  let dialog = aa.el.get('dialog');
  let input = make('input',{typ:'file'});
  input.toggleAttribute('multiple');

  let info = make('div');
  input.addEventListener('change',e=>
  {
    info.textContent = '';
    const file_list = e.target.files;
    if (file_list.length)
    {
      for (const file of file_list)
      {
        let img = make('img');
        img.src = URL.createObjectURL(file);
        img.height = 100;
        info.append(img, make('p',{con:JSON.stringify(file)}))
      }
    }
    console.log(file_list)
  });
  dialog.append(input,' ',info);
  dialog.showModal();
};


