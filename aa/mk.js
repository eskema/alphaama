// make button
aa.mk.butt =sa=> 
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
  return aa.mk.l('button',{con:con,cla:'butt '+cla,clk:aa.clk[clk]});
};


// button that toggles the class 'expanded'
aa.mk.butt_expand =(id,con=false)=>
{
  const butt = aa.mk.l('button',
  {
    con:con||id,
    cla:'butt',
    id:'butt_'+id,
    clk:aa.clk.expand
  });
  butt.dataset.controls = id
  return butt
};


// make event wrapper object
aa.mk.dat =(o={})=>
{
  const dat ={};
  dat.event = o.event ?? {};
  dat.seen = o.seen ?? [];
  dat.subs = o.subs ?? [];
  dat.clas = o.clas ?? [];
  dat.refs = o.refs ?? [];
  return dat
};


// make details element
aa.mk.details =(con,l=false,open=false)=>
{ 
  const details = aa.mk.l('details');
  if (open) details.open = true;
  const summary = aa.mk.l('summary',{con});
  details.append(summary);
  if (!l) return details;
  if (l.classList.contains('list'))
    summary.dataset.count = l.childNodes.length;
  details.append(l);
  return details
};


aa.mk.dialog =async o=>
{
  const dialog = aa.dialog;
  if (!dialog || dialog.open) return false;
  if (o.title) dialog.title = o.title;
  if (o.hasOwnProperty('l')) dialog.append(o.l);
  
  const dialog_options = aa.mk.l('p',{id:'dialog_options'});
  
  const dialog_no = aa.mk.l('button',
  {
    con:o.no.title ?? 'cancel',
    cla:'butt cancel',
    clk:e=>{ o.no.exe(); dialog.close()}
  });
  dialog_no.setAttribute('autofocus',true);
  
  const dialog_yes = aa.mk.l('button',
  {
    con:o.yes.title ?? 'confirm',
    cla:'butt confirm',
    clk:e=>{ o.yes.exe(); dialog.close()}
  });

  dialog_options.append(dialog_no,dialog_yes);
  dialog.append(dialog_options);
  dialog.showModal();
  if (o.scroll) dialog.scrollTop = dialog.scrollHeight;
};


// make document (ex: read_me)
aa.mk.doc =text=>
{
  if (!text) return;
  let article = aa.mk.l('article',
  {
    cla:'content parsed',
    app:aa.parse.content(text,aa.is.trusted(4))
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
    clk:aa.clk.a
  });
  const state = aa.mk.l('h1',{id:'state',con:'dickbutt'});
  state.dataset.pathname = location.pathname;
  aa.state.l = state;
  header.append(caralho,state);
  return header
};


// make generic image
aa.mk.img =(src)=>
{
  const l = aa.mk.l('img',{cla:'content-img'});
  l.dataset.src = src;
  l.loading = 'lazy';
  l.addEventListener('click',e=>{aa.mk.img_modal(src)});
  aa.lazy_god.observe(l);
  return l
};


// show image in modal on click
aa.mk.img_modal =(src,cla=false)=>
{
  const dialog = aa.dialog;
  const img = aa.mk.l('img',
  {
    cla:'modal-img contained'+(cla?' '+cla:''),
    src:src,
    clk:e=>{dialog.close()}
  });
  dialog.append(
    aa.mk.l('button',
    {
      con:'full',
      cla:'butt modal',
      clk:e=>
      {
        let text = e.target.textContent;
        e.target.textContent = e.target.textContent === 'full' 
        ? 'contained' 
        : 'full';
        img.classList.toggle('contained')
      }
    }),
    img
  );
  dialog.showModal();
};


// make generic list item from key : value
aa.mk.item =(k='',v,tag_name='li')=>
{
  let l = aa.mk.l(tag_name,{cla:'item item_'+k});
  if (Array.isArray(v))
  {
    l.classList.add('ls_arr');
    if (!v.length) l.classList.add('empty');
    // if (typeof v[0]!=='object')
    // {
    //   if (k) l.append(aa.mk.l('span',{cla:'key',con:k}),' ');
    //   l.append(aa.mk.l('span',{cla:'val',con:v.join(', ')}));
    // }
    // else
    // {
      let list = aa.mk.ls({});
      if (v.length) list.classList.remove('empty');
      for (let i=0;i<v.length;i++) 
      {
        list.append(aa.mk.item(''+i,v[i]));
      }
      l.append(aa.mk.details(k,list));
    // }
  }
  else if (v && typeof v==='object')
  {
    l.classList.add('ls_obj');
    if (!Object.keys(v).length) l.classList.add('empty');
    l.append(aa.mk.details(k,aa.mk.ls({ls:v})))
  }
  else
  {
    if (typeof v === 'number') l.classList.add('ls_num')
    else if (typeof v === 'boolean') l.classList.add('ls_bool')
    else l.classList.add('ls_str');
    if (k) l.append(aa.mk.l('span',{cla:'key',con:k}),' ');
    v = v+'';
    if (!v || !v.length) l.classList.add('empty');  
    if (v === null) v = 'null';
    let vl = aa.mk.l('span',{cla:'val',con:v})
    l.append(vl);
  }
  return l
};


// make a regular link
aa.mk.link =(url,text=false,title=false)=>
{
  let l;
  if (!text) text = url;
  if (aa.is.url(url))
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
  //   mk:function 
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
        l.append( o.hasOwnProperty('mk') ? o.mk(k,v) : aa.mk.item(k,v));
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
  if (window.nostr)
  {
    aa.log(s,false,false);
    return true
  }

  aa.log(aa.mk.l('button',
  {
    con:'window.nostr: not found, you need it for signing',
    cla:'butt',
    clk:e=>
    {
      aa.clk.clkd(e.target);
      if (window.nostr)
      {
        let parent = e.target.parentElement;
        parent.textContent = '';
        parent.append(aa.mk.l('p',{con:s}));
      }
    }
  }),false,false);

  return false
};


// log a notice
aa.mk.notice =o=>
{
// o =
// {
//   title:'',
//   description:'',
//   butts:
//   [
//    {title:'',cla:'',exe:()=>{}},
//   ]
// }
  let cla = 'notice';
  let l = aa.mk.l('div',{cla});
  if (Object.hasOwn(o,'id')) l.id = o.id;
  
  cla = 'title';
  if (Object.hasOwn(o,cla)) l.append(aa.mk.l('p',{cla,con:o.title}));
  cla = 'description';
  if (Object.hasOwn(o,cla)) l.append(aa.mk.l('p',{cla,con:o.description}));
  for (const butt of o.butts)
  {
    const con = butt.title;
    const clk = butt.exe;
    cla = 'butt '+butt.cla;
    l.append(aa.mk.l('button',{con,cla,clk}));
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


// make section element
aa.mk.section =(id,expanded=false,l=false)=>
{
  const section = aa.mk.l('section',{id:id});
  if (expanded) section.classList.add('expanded');
  const section_header = aa.mk.l('header');
  section_header.append(aa.mk.butt_expand(id));
  section.append(section_header);
  if (l) section.append(l);
  aa.view.l?.append(section);
  return section
};


// make server item
aa.mk.server =(k,v)=>
{
  k = aa.is.url(k);
  if (!k) return false;

  const l = aa.mk.l('li',{cla:'item server'});
  const url_l = aa.mk.l('p',{cla:'url'});
  url_l.append(
    aa.mk.l('span',{cla:'protocol',con:k.protocol+'//'}),
    aa.mk.l('span',{cla:'host',con:k.host}),
    aa.mk.l('span',{cla:'pathname',con:k.pathname}),
    aa.mk.l('span',{cla:'hashsearch',con:k.hash+k.search})
  ); 
  l.append(url_l); 
  if (v.sets && v.sets.length) l.dataset.sets = v.sets;   
  return l
};