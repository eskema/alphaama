/*

alphaama
make stuff

*/

aa.styleshit('/aa/av.css');

// video element
aa.mk.av =(src,poster=false)=>
{
  // toggle sound
  const mute =e=>
  {
    const l = e.target.closest('.av').querySelector('.mf');
    l.muted = !l.muted;
    l.classList.toggle('muted')
  };
  // pause video
  const pause =l=>
  { 
    l.pause();
    l.classList.remove('playin');
  };
  // play video
  const play =l=>
  {
    let playin = document.querySelector('.playin');
    if (playin) pause(playin);
    l.classList.add('started','playin');
    l.play();
  };
  // picture-in-picture
  const pip =e=>
  {
    const l = e.target.closest('.av').querySelector('.mf');
    if (document.pictureInPictureElement) document.exitPictureInPicture();
    else if (document.pictureInPictureEnabled) l.requestPictureInPicture();
  };
  // update progress
  const progress =e=>
  { 
    const l = e.target;
    const trols = l.closest('.av').querySelector('.controls');
    const duration = Math.floor(l.duration||0);
    const percentage = Math.floor((100 / duration) * l.currentTime);
    trols.dataset.elapsed = Math.ceil(l.currentTime);
    trols.dataset.remains = Math.round(duration - l.currentTime);
    trols.dataset.duration = duration;
    trols.querySelector('progress').value = percentage;
  };
  // rewind video
  const rewind =e=>
  {
    const l = e.target.closest('.av').querySelector('.mf');
    l.currentTime = 0;
  };
  // toggle play / pause
  const vip =e=>
  {
    e.preventDefault();
    if (e.target.paused) play(e.target);
    else pause(e.target);
  };

  const av = document.createElement('div');
  av.classList.add('av');

  const l = document.createElement('video');
  l.classList.add('mf','content-video','muted');
  l.muted = true;
  l.loop = true;
  l.setAttribute('playsinline','');
  // l.setAttribute('preload','metadata');
  l.setAttribute('src',src)
  if (poster) l.setAttribute('poster',poster);
  l.onclick = vip;

  // if (Hls.isSupported()) 
  // {
  //   const hls = new Hls();
  //   hls.loadSource(src);
  //   hls.attachMedia(l);
  // }
  // else if (l.canPlayType('application/vnd.apple.mpegurl')) l.setAttribute('src',src);

  const trols = document.createElement('p');
  trols.classList.add('controls');
  l.onloadedmetadata =e=>{ trols.dataset.duration = Math.ceil(l.duration)};
  
  const url = document.createElement('span');
  url.classList.add('url');
  url.textContent = src;

  const progressbar = document.createElement('progress');
  progressbar.textContent = '0% played';
  progressbar.setAttribute('min', 0);
  progressbar.setAttribute('max', 100);
  progressbar.setAttribute('value', 0);
  l.ontimeupdate = progress;
  
  const rewind_butt = document.createElement('button');
  rewind_butt.classList.add('rewind');
  rewind_butt.textContent = 'rewind';
  rewind_butt.onclick = rewind;
  
  const mute_butt = document.createElement('button');
  mute_butt.classList.add('mute');
  mute_butt.textContent = 'mute';
  mute_butt.onclick = mute;
  
  const pip_butt = document.createElement('button');
  pip_butt.classList.add('pip');
  pip_butt.textContent = 'pip';
  pip_butt.onclick = pip;
  
  trols.append(rewind_butt,mute_butt,pip_butt,url,progressbar);
  av.append(l,trols);
  
  return av
};


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


// a button that will populate the input with a command text
aa.mk.butt_action =(s,con=false,cla=false)=>
{
  const butt = aa.mk.l('button',
  {
    con:con?con:s,
    cla:'butt',
    clk:e=>{ aa.cli.v(localStorage.ns+' '+s) }
  });
  if (cla) butt.classList.add(cla);
  return butt
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
aa.mk.details =(s,l=false,open=false)=>
{ 
  const details = aa.mk.l('details');
  if (open) details.open = true;
  const summary = aa.mk.l('summary',{con:s});
  details.append(summary);
  if (!l) return details;
  details.append(l);
  // let is_empty = l.classList.contains('empty'); 
  // if (is_empty) details.classList.add('empty');
  if (open) details.open = true;
  else if (l.classList.contains('list')) summary.dataset.after = l.childNodes.length;
  return details;
};


// get the dialog element or create it if not found
aa.mk.dialog =()=>
{
  let dialog = document.getElementById('dialog');
  if (!dialog) 
  {
    dialog = aa.mk.l('dialog',{id:'dialog'});
    document.body.insertBefore(dialog,document.body.lastChild);
    dialog.addEventListener('close',e=>
    {
      dialog.removeAttribute('title');
      dialog.textContent = '';
    });
  }
  return dialog
};


// make generic image
aa.mk.img =(src)=>
{
  const l = aa.mk.l('img',{cla:'content-img',src:src});
  l.loading = 'lazy';
  l.addEventListener('click',e=>{aa.mk.img_modal(src)});
  return l
};


// show image in modal on click
aa.mk.img_modal =(src,cla=false)=>
{
  const dialog = aa.mk.dialog();
  let img = aa.mk.l('img',{cla:'modal-img',src:src});
  if (cla) img.classList.add(cla);
  img.addEventListener('click',e=>{dialog.close()});
  // dialog.title = img.src;
  dialog.append(img);
  dialog.showModal();
};


// make generic list item from key : value
aa.mk.item =(k='',v,tag_name='li')=>
{
  let l = aa.mk.l(tag_name,{cla:'item item_'+k});
  if (Array.isArray(v))  
  {
    if (typeof v[0]!=='object')
    {
      if (k) l.append(aa.mk.l('span',{cla:'key',con:k}),' ');
      l.append(aa.mk.l('span',{cla:'val',con:v.join(', ')}));
    }
    else 
    {
      let list = aa.mk.ls({});
      if (v.length) list.classList.remove('empty');
      for (let i=0;i<v.length;i++) 
      {
        list.append(aa.mk.item(''+i,v[i]));
      }
      l.append(aa.mk.details(k,list));
    }
  }
  else if (v && typeof v==='object') 
  {
    l.append(aa.mk.details(k,aa.mk.ls({ls:v})))
  }
  else 
  {
    if (v === null) v = 'null';
    if (k) l.append(aa.mk.l('span',{cla:'key',con:k}),' ');
    l.append(aa.mk.l('span',{cla:'val',con:v}));
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
  
  if (o.ls && Object.keys(o.ls).length) 
  {
    const entries = Object.entries(o.ls);
    if (o.sort) aa.fx.sort_by(entries,o.sort);
    for (let i=0;i<entries.length;i++)
    {
      const [k,v] = entries[i];
      l.append( o.hasOwnProperty('mk') ? o.mk(k,v) : aa.mk.item(k,v));
    }
  }
  else l.classList.add('empty');
  return l
};


// make mod
aa.mk.mod =mod=>
{
  let o = {id:mod.def.id,ls:mod.o.ls};
  if (mod.hasOwnProperty('mk')) o.mk = mod.mk;
  let mod_l = aa.mk.details(mod.def.id,aa.mk.ls(o));
  if (mod.l) 
  {
    mod.l.replaceWith(mod_l);
    mod.l = mod_l;
  }
  else 
  {
    mod.l = mod_l;
    mod.l.classList.add('mod');
    if (aa.mod_l) 
    {
      const last = [...aa.mod_l.children]
      .filter(i=> o.id < i.querySelector('summary').textContent)[0];
      aa.mod_l.insertBefore(mod_l,last);

      // aa.mod_l.append(mod_l);
    }
    else aa.log(mod_l).then(()=> { mod.l.classList.add('mod') });
  }
};


// log a notice
aa.mk.notice =o=>
{
// o =
// {
//   title:'',
//   description:'',
//   butts:
//   {
//    no:{title:'',exe:()=>{}},
//    yes:{title:'',exe:()=>{}},
//   }
// }

  let l = aa.mk.l('div',{cla:'notice'});
  if (o.hasOwnProperty('id')) 
  {
    l.id = o.id;
  }
  if (o.hasOwnProperty('title')) 
  {
    l.append(aa.mk.l('p',{cla:'title',con:o.title}));
  }
  if (o.hasOwnProperty('description')) 
  {
    l.append(aa.mk.l('p',{cla:'description',con:o.description}));
  }
  for (const b in o.butts)
  {
    let bt = o.butts[b];
    l.append(aa.mk.l('button',{con:bt.title,cla:'butt '+b,clk:bt.exe}));
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
  
  let view = document.getElementById('view');
  if (view) view.append(section);
  if (l) section.append(l);

  return section
};


// make tag list item
// aa.mk.tag =(a,i,li=false)=>
// {
//   let l = li ? li : aa.mk.l('li',{cla:'tag tag_'+a[0]});
  
//   l.textContent = '';
//   l.append(aa.mk.l('button',
//   {
//     con:''+i,
//     clk:e=>
//     {
//       const mom = e.target.parentElement;
//       mom.classList.toggle('parsed');
//       aa.mk.tag(a,i,mom)
//     }
//   }));

//   if (l.classList.contains('parsed')) l.append(aa.fx.tag_a(a));
//   else l.append(a.join(', '));
//   if (!li) 
//   {
//     l.dataset.tag = a[1];
//     if (aa.is.x(a[1])) aa.fx.color(a[1],l);
//     return l
//   }
// };


// make tag list
aa.mk.tag_list =tags=>
{
  const times = tags.length;
  const l = aa.mk.l('ol',{cla:'tags'});
  l.start = 0;
  
  for (let i=0;i<times;i++) 
  {
    let tent = tags[i].join(', ');
    let li = aa.mk.l('li',{cla:'tag tag_'+tags[i][0],con:tent});
    li.dataset.i = i;
    l.append(li);//aa.mk.tag(tags[i],i));
  }
  return l
};


// make time element from timestamp
aa.mk.time =timestamp=>
{
  const d = aa.t.to_date(timestamp);
  const title = aa.t.display(timestamp);
  const l = aa.mk.l('time',
  {
    cla:'created_at',
    con:timestamp,
    clk:aa.clk.time
  });
  l.setAttribute('datetime', d.toISOString());
  l.title = title;
  l.dataset.elapsed = aa.t.elapsed(d);
  return l
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
