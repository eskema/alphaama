// make elements and stuff


// make video element

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
    if (playin) av.pause(playin);
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
    const percentage = Math.floor((100 / l.duration) * l.currentTime);
    trols.dataset.elapsed = Math.ceil(l.currentTime);
    trols.dataset.remains = Math.round(l.duration - l.currentTime);
    trols.dataset.duration = Math.floor(l.duration);
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
    if (e.target.paused) play(e.target);
    else pause(e.target);
  };

  const av = document.createElement('div');
  av.classList.add('av');

  const l = document.createElement('video');
  l.classList.add('mf','content-video');
  l.setAttribute('loop','');
  l.setAttribute('playsinline','');
  l.setAttribute('preload','metadata');  
  l.setAttribute('src',src);
  if (poster) l.setAttribute('poster',poster);
  l.onclick = vip;

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


// make action button

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


// make expand button

aa.mk.butt_expand =id=>
{
  const butt = aa.mk.l('button',
  {
    con:id,
    cla:'butt',
    id:'butt_'+id,
    clk:aa.clk.expanded
  });
  butt.dataset.controls = id
  return butt
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
  if (l.classList.contains('empty')) details.classList.add('empty');
  else if (l.classList.contains('list')) 
  summary.dataset.after = l.childNodes.length;
  return details;
};


// make generic image

aa.mk.img =(src)=>
{
  const l = aa.mk.l('img',{cla:'content-img',src:src});
  l.loading = 'lazy';
  return l
};


// make generic list item from key / value

aa.mk.item =(k,v,tag_name='li')=>
{
  let l = aa.mk.l(tag_name,{cla:'item item_'+k});
  if (Array.isArray(v)) l.append(
    aa.mk.l('span',{cla:'key',con:k}),
    aa.mk.l('span',{cla:'val',con:v.join(', ')})
  );
  else if (typeof v==='object') l.append(
    aa.mk.details(k,aa.mk.ls({ls:v}))
  );
  else l.append(
    aa.mk.l('span',{cla:'key',con:k}),
    aa.mk.l('span',{cla:'val',con:v})
  );
  return l
};


// make a regular link

aa.mk.link =(url,text=false,title=false)=>
{
  if (!text) text = url;
  let l = aa.mk.l('a',{cla:'content_link',ref:url,con:text});
  if (title) l.title = title;
  l.rel = 'noreferrer noopener';
  l.target = '_blank';
  return l
};


// make list element from object
// o = { id:string,cla:array,ls:object,sort:string,mk:function };

aa.mk.ls =o=>
{
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


// make mod u

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
    aa.log(mod_l)
    // document.getElementById('view')?.append(mod_l);
  }
};


// make a nostr link

aa.mk.nostr_link =(dis,con=false)=>
{
  return aa.mk.l('a',
  {
    cla:'nostr_link',
    con:con||dis.slice(0,12),
    ref:'#'+dis,
    clk:aa.clk.a
  });
};


// make section element

aa.mk.section =(id,expanded=false,l=false)=>
{
  const section = aa.mk.l('section',{id:id});
  aa.fx.expanded(id,expanded,section);
  const section_header = aa.mk.l('header');
  section_header.append(aa.mk.butt_expand(id))
  section.append(section_header);
  
  let view = document.getElementById('view');
  if (view) view.append(section);
  
  if (l) section.append(l);

  return section
};


// make tag list item

aa.mk.tag =(a,i,li=false)=>
{
  let l = li ? li : aa.mk.l('li',{cla:'tag tag_'+a[0]});
  
  l.textContent = '';
  l.append(aa.mk.l('button',
  {
    con:''+i,
    clk:e=>
    {
      const mom = e.target.parentElement;
      mom.classList.toggle('parsed');
      aa.mk.tag(a,i,mom)
    }
  }));

  if (l.classList.contains('parsed')) l.append(aa.fx.tag_a(a));
  else l.append(a.join(', '));
  if (!li) 
  {
    l.dataset.tag = a[1];
    if (aa.is.x(a[1])) aa.fx.color(a[1],l);
    return l
  }
};


// make tag list

aa.mk.tag_list =tags=>
{
  const l = aa.mk.l('ol',{cla:'tags'});
  l.start = 0;
  const times = tags.length;
  for (let i=0;i<times;i++) l.append(aa.mk.tag(tags[i],i));
  return l
};


// make time element from timestamp

aa.mk.time =timestamp=>
{
  const d = aa.t.to_date(timestamp);
  const l = aa.mk.l('time',
  {
    cla:'created_at',
    tit:aa.t.elapsed(d),
    con:aa.t.display(timestamp)+' '+timestamp,
    clk:e=> e.target.title = aa.t.elapsed(aa.t.to_date(e.target.dataset.timestamp))
  });   
  
  l.dataset.timestamp = timestamp;
  l.setAttribute('datetime', d.toISOString());
  return l
};

