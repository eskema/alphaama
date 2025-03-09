aa.mk.styles(['/av/av.css']);

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
    let note = l.closest('.note');
    if (note) note.classList.remove('av_playin');
  };
  // play video
  const play =l=>
  {
    let playin = document.querySelector('.playin');
    if (playin) pause(playin);
    l.classList.add('started','playin');
    l.play();
    let note = l.closest('.note');
    if (note) note.classList.add('av_playin');
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
  l.setAttribute('preload','metadata');
  l.dataset.src = src;
  // l.setAttribute('src',src);
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