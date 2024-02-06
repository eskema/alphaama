const av = {};

av.pause =video=>
{ 
  video.pause();
  video.classList.remove('playin');
};

av.play =video=>
{
  let video_playin = document.querySelector('.playin');
  if (video_playin) av.pause(video_playin);
  video.classList.add('started','playin');
  video.play();
};
	        
av.vip =e=>
{
  if (e.target.paused) av.play(e.target);
  else av.pause(e.target);
};

av.rewind =e=>
{
  const dad = e.target.closest('.av');
  const video = dad.querySelector('video');
  video.currentTime = 0;
};

av.mute =e=>
{
  const dad = e.target.closest('.av');
  const video = dad.querySelector('video');
  if (video.muted) 
  {
    video.muted = false;
    video.classList.remove('muted')
  }
  else 
  {
    video.muted = true;
    video.classList.add('muted')
  }
};

av.mk =(src,poster=false)=>
{
  const video_player = document.createElement('div');
  video_player.classList.add('av');

  const video = document.createElement('video');
  video.classList.add('content-video');
  video.setAttribute('loop','');
  video.setAttribute('playsinline','');
  video.setAttribute('preload','metadata');  
  video.setAttribute('src',src);
  if (poster) video.setAttribute('poster',poster);
  video.onclick = av.vip;
  // video.addEventListener('click',av.vip);

  const controls = document.createElement('p');
  controls.classList.add('controls');

  const url = document.createElement('span');
  url.classList.add('url');
  url.textContent = src;

  const progress = document.createElement('progress');
  progress.textContent = '0% played';
  progress.setAttribute('min', 0);
  progress.setAttribute('max', 100);
  progress.setAttribute('value', 0);

  const rewind = document.createElement('button');
  rewind.classList.add('rewind');
  rewind.textContent = 'rewind';
  rewind.onclick = av.rewind;

  const mute = document.createElement('button');
  mute.classList.add('mute');
  mute.textContent = 'mute';
  mute.onclick = av.mute;
  
  controls.append(rewind,mute,url,progress);
  // controls.addEventListener('click',av.rewind);

  video_player.append(video,controls);

  video.addEventListener('timeupdate',e=> 
  {
    const percentage = Math.floor((100 / video.duration) * video.currentTime);
    
    controls.dataset.elapsed = Math.ceil(video.currentTime);
    controls.dataset.remains = Math.round(video.duration - video.currentTime);
    controls.dataset.duration = Math.floor(video.duration);
    
    progress.value = percentage;
    // progress.style.width = percentage + '%';
    // progress.textContent = percentage + '%';
  });

  video.addEventListener('loadedmetadata',e=>
  {
    controls.dataset.duration = Math.ceil(video.duration);
  });

  return video_player
};