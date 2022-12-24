function pause(video) 
{ 
   video.pause();
   video.classList.remove('playin');
}

function play(video) 
{
   let playin = document.querySelector('.playin');
   if (playin) 
   {
      pause(playin);
      playin.classList.remove('playin');
   } 
   video.classList.add('started','playin');
   video.play();
}
	        
function vip(e) 
{ // o cão do Marinho
   if (e.target.paused) { play(e.target) }
   else { pause(e.target) }
}

function rewind(e) 
{
   const 
      container = e.target.parentElement,
      video = container.querySelector('video');
   video.currentTime = 0;
}

function player(src) 
{  
   const 
      rapper = document.createElement('figure'),
      video = document.createElement('video'),
      controls = document.createElement('figcaption'),
      url = document.createElement('span'),
      progress = document.createElement('progress');

//   if (poster) video.setAttribute('poster', poster);
   
   video.classList.add('content-video');
   video.setAttribute('loop', '');
   video.setAttribute('playsinline', '');
   video.setAttribute('preload', 'metadata');  
   video.setAttribute('src', src); 
   
   rapper.classList.add('yo');
      
   url.classList.add('vhs'); 
   url.innerText = src;
   
   progress.innerText = '0% played';
   progress.setAttribute('min', 0);
   progress.setAttribute('max', 100);
   progress.setAttribute('value', 0);
   
   controls.append(url, progress); 

   rapper.prepend(video); 
   rapper.append(controls);
   
   return rapper
}

function rap(video)
{
   let controls = video.nextSibling;
   let progress = controls.querySelector('progress');
   
   video.addEventListener('click', vip, false);
   controls.addEventListener('click', rewind, false);
   
   video.addEventListener('timeupdate', function(e) 
   {
      const percentage = Math.floor((100 / this.duration) * this.currentTime);
      
      controls.dataset.elapsed = Math.ceil(this.currentTime);
      controls.dataset.remains = Math.round(this.duration - this.currentTime);
      controls.dataset.duration = Math.floor(this.duration);
      
      progress.value = percentage;
      progress.style.width = percentage + '%';
      progress.innerText = percentage + '%';
      
   });
   
   video.addEventListener('loadedmetadata', function(e) 
   {
      controls.dataset.duration = Math.ceil(video.duration);
   
   }, false);
}