// button that toggles the class 'expanded'
aa.mk.butt_expand =(id,con=false)=>
{
  const butt = aa.mk.l('button',
  {
    con:con||id,
    cla:'butt',
    // id:'butt_'+id,
    clk:aa.clk.expand
  });
  butt.dataset.controls = id;
  aa.el.set('butt_'+id,butt);
  return butt
};


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
  return aa.mk.l('button',{con,cla,clk});
};


// buttons from sessionStorage state
aa.mk.butts_session =async(id,s)=>
{
  let dis = `${id}_${s}`;
  if (sessionStorage.getItem(dis))
  {
    let butt = aa.mk.butt_action(`${id} ${s} ${sessionStorage[dis]}`);
    butt.addEventListener('click',e=>{e.target.closest('.l')?.remove()});
    aa.log(butt)
  }
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
  const details = aa.mk.l('details',{cla});
  if (open) details.open = true;
  // cla = 'base' + cla?' '+cla:'';
  const summary = aa.mk.l('summary',{con});
  details.append(summary);
  if (!l) return details;
  // if (l.classList.contains('list'))
  summary.dataset.count = l.children.length;
  details.append(l);
  return details
};


// 
aa.mk.confirm =async options=>
{
  const dialog = aa.el.get('dialog');
  if (!dialog || dialog.open) return false;
  
  const dialog_options = aa.mk.l('p',{id:'dialog_options'});
  
  const dialog_no = aa.mk.l('button',
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
    const dialog_yes = aa.mk.l('button',
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
  let article = aa.mk.l('article',
  {
    cla:'content parsed',
    app:aa.e.content(text,aa.fx.is_trusted(4))
  });

  let title = text.slice(0,text.indexOf('\n'));
  if (title.startsWith('=') || title.startsWith('#')) 
    title = title.slice(1).trim();
  
  let details = aa.mk.details(title,article);
  details.id = 'aa_read_me';
  return details
};


// on load
aa.mk.header =e=>
{
  const header = aa.mk.l('header',{id:'header'});
  const caralho =  aa.mk.l('a',
  {
    id:'caralho',
    ref:'/',
    con:'A<3',
    tit:'vai pró caralho',
    clk:aa.clk.clear,//aa.clk.a
  });
  const state = aa.mk.l('h1',{id:'state',con:'dickbutt'});
  state.dataset.pathname = location.pathname;
  aa.state.l = state;
  header.append(caralho,state);
  return header
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
      aa.logs.append(l.parentElement);
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

  let article = aa.mk.l('article',
  {
    cla:'content parsed',
    app:aa.e.content(o.readme,1)
  });

  // let title = text.slice(0,text.indexOf('\n'));
  // if (title.startsWith('=') || title.startsWith('#')) 
  //   title = title.slice(1).trim();
  
  let details = aa.mk.details(id,article,1);
  aa.el.set(id,details);
  let log = aa.log(details);
  setTimeout(()=>{aa.fx.scroll(log)},200);
  // return details
};


// make generic image
aa.mk.img =(src)=>
{
  const l = aa.mk.l('img',{cla:'content-img'});
  l.src = src;
  l.loading = 'lazy';
  l.addEventListener('click',e=>{aa.mk.img_modal(src)});
  return l
};


// show image in modal on click
aa.mk.img_modal =(src,cla=false)=>
{
  const dialog = aa.el.get('dialog');
  
  const img = aa.mk.l('img',
  {
    src,
    cla:'img_modal contained'+(cla?' '+cla:''),
    clk:()=>{ dialog.close() }
  });
  
  const butt = aa.mk.l('button',
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

  let element = aa.mk.l(tag_name,{cla});
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

    if (key) item = aa.mk.l('span',{cla:'key',con:key});

    element.append(aa.mk.l('span',{cla:'val',con:value}));
  }
  if (item)
  {
    if (item.classList.contains('empty')) 
      element.classList.add('empty');
    element.prepend(item);
  }
  return element
};


aa.fx.a_red =a=> a.reduce((b,c)=>
{
  b[c]=(b[c]||0)+1;
  return b;
},{});


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
    l = aa.mk.l('a',{cla:'content_link',ref:url,con:text});
    l.rel = 'noreferrer noopener';
    l.target = '_blank';
  }
  else l = aa.mk.l('span',{cla:'content_link',con:text});
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
    l = aa.mk.l('ul',{cla:'list'});
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
  let l = aa.mk.l('ul',{cla:'list ls'});
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


aa.mk.list_filter =(element,options={})=>
{
  let fx_id = options.fx_id || `list_filter_${aa.fx.rands()}`;
  let mode = options.mode ?? 'inner';
  let delay = options.delay ?? 420;
  let pla = options.placeholder ?? '( Y )';
  let cla = options.classes ?? 'list_filter';

  const input = aa.mk.l('input',{cla,pla});
  
  input.addEventListener('keyup',()=>
  {

    aa.fx.to(()=>
    {
      fastdom.mutate(()=>
      {
      if (!input.value.length)
      {
        element.classList.remove('filtering');
        for (const l of element.children) 
          l.classList.remove('filtered_in','filtered_out');
        return
      }

      element.classList.add('filtering');
      
      for (const item of element.children) 
      {
        let text;
        switch (mode)
        {
          case 'inner': text = item.innerText; break;
          case 'full' : text = item.textContent; break
        } 

        if (text.toLowerCase().includes(input.value)) 
        {
          item.classList.add('filtered_in');
          item.classList.remove('filtered_out');
        }
        else 
        {
          item.classList.add('filtered_out');
          item.classList.remove('filtered_in');
        }
      }
    })
    },delay,fx_id)
  });

  return input
};


// get meta data from manifest
aa.mk.manifest =()=>
{
  const ref = '/site.webmanifest';
  fetch(ref).then(dis=>dis.json()).then(manifest=>
  {
    let df = new DocumentFragment();
    df.append(aa.mk.l('link',{rel:'manifest',ref}));
    for (const icon of manifest.icons)
    {
      let link = aa.mk.l('link');
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

  aa.log(aa.mk.l('button',
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
        parent.append(aa.mk.l('p',{con:s}));
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
  let l = aa.mk.l('div',{cla});
  if (Object.hasOwn(o,'id')) l.id = o.id;
  
  
  
  // cla = 'description';
  // if (Object.hasOwn(o,cla)) l.append(aa.mk.l('p',{cla,con:o.description}));
  for (const butt of o.butts)
  {
    cla = 'butt'+(' '+butt.cla||'');
    const con = butt.con;
    const clk = butt.exe;
    l.append(aa.mk.l('button',{cla,con,clk}));
  }

  cla = 'title';
  con = o.title;
  if (Object.hasOwn(o,cla)) 
  {
    const dis = aa.mk.l('p',{cla,con});
    if (!inverted) l.prepend(dis);
    else l.append(dis);
  }

  return l
};



// make a nostr link
aa.mk.nostr_link =(s='',con=false)=>
{
  const a = aa.mk.l('a',
  {
    cla:'nostr_link',
    con:con||s.slice(0,12),
    ref:'#'+s,
    // clk:aa.clk.a
  });
  setTimeout(()=>{
    a.addEventListener('click',aa.clk.a)
  },200);

  if (!s) 
  {
    a.removeAttribute('href');
    a.classList.add('empty');
  }
  return a
};


// qr code
aa.mk.qr =s=>
{
  let l = aa.mk.l('div',{cla:'qrcode'});
  aa.temp.qr = new QRCode(l,
  {
    text:s.trim(),
    width: 512,
    height: 512,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  let img = l.querySelector('img');
  img.classList.add('qr');
  img.addEventListener('click',e=>{aa.mk.img_modal(img.src,'qr')});
  return img
};


// a reload button
aa.mk.reload_butt =()=> 
{
  return aa.mk.l('button',
  {
    con:'reload the page',
    cla:'butt exe',
    clk:e=>{location.reload()}
  })
};


// make section element
aa.mk.section =(id,expanded,element_to_append,filter)=>
{
  let app = [aa.mk.butt_expand(id)];
  if (filter) 
    app.push(' ',aa.mk.list_filter(element_to_append));

  let header = aa.mk.l('header',{app});
  let options = 
  {
    id,
    app:[header]
  };
  if (expanded) options.cla ='expanded';
  if (element_to_append) options.app.push(element_to_append);

  const section = aa.mk.l('section',options);
  aa.el.set('section_'+id,section);
  aa.view.l?.append(section);
  return section
};


// make server item
aa.mk.server =(k,v,type='li')=>
{
  url = aa.fx.url(k);
  if (!url) return false;

  return aa.mk.l(type,
  {
    cla:'item server',
    dat:{sets:v.sets},
    app:[
      aa.mk.l('span',{cla:'protocol',con:url.protocol+'//'}),
      aa.mk.l('span',{cla:'host',con:url.host}),
      aa.mk.l('span',{cla:'pathname',con:url.pathname}),
      aa.mk.l('span',{cla:'hashsearch',con:url.hash+url.search})
    ]
  });
};


// make time element from timestamp
aa.mk.time =timestamp=>
{
  const d = new Date(timestamp*1000);
  const title = aa.fx.time_display(timestamp);
  const l = aa.mk.l('time',
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