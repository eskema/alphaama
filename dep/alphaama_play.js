const player = {};

player.pause =video=>
{ 
  video.pause();
  video.classList.remove('playin');
};

player.play =video=>
{
  let video_playin = document.querySelector('.playin');
  if (video_playin) player.pause(video_playin);
  video.classList.add('started','playin');
  video.play();
};
	        
player.vip =e=>
{
  if (e.target.paused) player.play(e.target);
  else player.pause(e.target);
};

player.rewind =e=>
{
  const dad = e.target.closest('.yo');
  const video = dad.querySelector('video');
  video.currentTime = 0;
};

player.mk =(src,poster=false)=>
{
  const video = document.createElement('video');
  video.classList.add('content-video');
  video.setAttribute('loop','');
  video.setAttribute('playsinline','');
  video.setAttribute('preload','metadata');  
  video.setAttribute('src',src);
  if (poster) video.setAttribute('poster',poster);
  video.addEventListener('click',player.vip);

  const url = document.createElement('span');
  url.classList.add('url');
  url.textContent = src;

  const progress = document.createElement('progress');
  progress.textContent = '0% played';
  progress.setAttribute('min', 0);
  progress.setAttribute('max', 100);
  progress.setAttribute('value', 0);

  const controls = document.createElement('figcaption');
  controls.classList.add('controls');
  controls.append(url,progress);
  controls.addEventListener('click',player.rewind);

  const rapper = document.createElement('figure');
  rapper.classList.add('yo');
  rapper.append(video,controls);

  video.addEventListener('timeupdate',e=> 
  {
    const percentage = Math.floor((100 / video.duration) * video.currentTime);
    
    controls.dataset.elapsed = Math.ceil(video.currentTime);
    controls.dataset.remains = Math.round(video.duration - video.currentTime);
    controls.dataset.duration = Math.floor(video.duration);
    
    progress.value = percentage;
    progress.style.width = percentage + '%';
    progress.textContent = percentage + '%';
  });

  video.addEventListener('loadedmetadata',e=>
  {
    controls.dataset.duration = Math.ceil(video.duration);
  });

  return rapper
};

// player.rap =video=>
// {
//   const controls = video.nextSibling;
//   const progress = controls.querySelector('progress');
  
//   video.addEventListener('click',player.vip);
//   controls.addEventListener('click',player.rewind);
  
//   video.addEventListener('timeupdate', function(e) 
//   {
//     const percentage = Math.floor((100 / this.duration) * this.currentTime);
    
//     controls.dataset.elapsed = Math.ceil(this.currentTime);
//     controls.dataset.remains = Math.round(this.duration - this.currentTime);
//     controls.dataset.duration = Math.floor(this.duration);
    
//     progress.value = percentage;
//     progress.style.width = percentage + '%';
//     progress.textContent = percentage + '%';
    
//   });
  
//   video.addEventListener('loadedmetadata', function(e) 
//   {
//     controls.dataset.duration = Math.ceil(video.duration);
  
//   }, false);
// };