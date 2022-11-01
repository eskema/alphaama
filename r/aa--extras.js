function yt(ur_l) 
{ // fuck youtube but here it is anyway
   
   let id = ur_l.searchParams.get('v');
   if (!id) 
   {
      let domain = ur_l.hostname.split('.').reverse().splice(0,2).reverse().join('.');
      if (domain === 'youtu.be') id = ur_l.pathname.substring(1);
   }
   
   if (!id) return false;
   return '<figure class="yt"><iframe src="https://www.youtube.com/embed/'+ id + '" title="yt" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>'   
}

function spotify(ur_l) 
{ // fuck spofify but here it is anyway
   const paths = ur_l.pathname.split('/');
   if (paths[paths.length - 2] == 'track') 
   {
      return '<figure class="spotify"><iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/'+ paths[paths.length - 1] + '" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></figure>'
   }
   return false
}

function orient(l) 
{ // rotates an element towards another, unused at the moment
   if (l) 
   {
      const to = document.querySelector('.was-interesting');
      
      if (to) 
      {
         const 
            rect = l.getBoundingClientRect(),
            center = window.getComputedStyle(l).transformOrigin,
            centers = center.split(" "),
            lx = rect.left + parseInt(centers[0]) - window.pageXOffset,
            ly = rect.top  + parseInt(centers[1]) - window.pageYOffset;
         const 
            torect = to.getBoundingClientRect(),
            tox = torect.left - window.pageXOffset,
            toy = torect.top - window.pageYOffset;
         const 
            radians = Math.atan2(tox - lx, toy - ly),
            degree = (radians * (180 / Math.PI) * -1) + 180;
         
         l.style.transform = "rotate("+degree+"deg)";
      
      } else { l.style.transform = "rotate(0)" }
   }
}

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

function player(src, poster)
{  
   const 
      rapper = document.createElement('figure'),
      video = document.createElement('video'),
      controls = document.createElement('figcaption'),
      url = document.createElement('span'),
      progress = document.createElement('progress');

   let postr = poster ? poster : '';
   if (postr) video.setAttribute('poster', postr);
   
   video.classList.add('content-video');
   video.setAttribute('loop', '');
   video.setAttribute('playsinline', '');
   video.setAttribute('preload', 'metadata');  
   video.setAttribute('src', src); 
   
   rapper.classList.add('yo');
      
   url.classList.add('vhs'); 
   url.innerHTML = src;
   
   progress.innerHTML = '0% played';
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
      progress.innerHTML = percentage + '%';
      
   });
   
   video.addEventListener('loadedmetadata', function(e) 
   {
      controls.dataset.duration = Math.ceil(video.duration);
   
   }, false);
}

let pubcrawl = [], counts = {};
function crawl()
{ // make a list of all your follows and their follows and count them
   pubcrawl.forEach(function(pub) 
   {
      if (counts[pub]) {
         counts[pub] = counts[pub] + 1;
      } else {
         counts[pub] = 1;
      }
   });
   
   let sortable = [];
   for (var pub in counts) {
      sortable.push([pub, counts[pub]]);
   }

   sortable.sort(function(a, b) {
      return a[1] - b[1];
   });
   
   return sortable;
}