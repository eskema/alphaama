aa.add_styles(['/av/av.css']);

// audio/video player element
aa.mk.av =(src,poster=false,audio=false)=>
{
  const play_butt = document.createElement('button');


  // save screenshot
  const grab =e=>
  {
    const canvas = document.createElement("canvas");
    const l = e.target.closest('.av').querySelector('.mf');
    canvas.width = l.videoWidth;
    canvas.height = l.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(l, 0, 0);
    let src = canvas.toDataURL('image/png');
    aa.log(aa.mk.img(src));
    canvas.remove();
  };
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
    play_butt.textContent = 'play';
  };
  // play video
  const play =l=>
  {
    let playin = document.querySelector('.playin');
    if (playin) pause(playin);
    l.classList.add('started','playin');
    play_butt.textContent = 'pause';
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
    const seeker = trols.querySelector('.seeker');
    const duration = Math.floor(l.duration||0);
    const percentage = Math.floor((100 / duration) * l.currentTime);
    fastdom.mutate(()=>
    {
      trols.dataset.elapsed = Math.ceil(l.currentTime);
      trols.dataset.remains = Math.ceil(duration - l.currentTime);
      trols.dataset.duration = duration;
      trols.dataset.percentage = percented = `${percentage}%`;
      let style = 'linear-gradient(';
      style += 'to right,';
      style += `var(--color-front) ${percented},`;
      style += `var(--color-back) ${percented}`;
      style += ') no-repeat';
      seeker.style.background = style;
      seeker.value = l.currentTime;
    });
  };

  // rewind video
  // const rewind =e=>
  // {
  //   const l = e.target.closest('.av').querySelector('.mf');
  //   l.currentTime = 0;
  // };

  // rewind video
  // const seekback =e=>
  // {
  //   const l = e.target.closest('.av').querySelector('.mf');
  //   let new_time = l.currentTime - 5;
  //   l.currentTime = new_time > 0 ? new_time : 0;
  // };
  // // rewind video
  // const seekforward =e=>
  // {
  //   const l = e.target.closest('.av').querySelector('.mf');
  //   let new_time = l.currentTime + 10;
  //   l.currentTime = new_time < l.duration ? new_time : l.duration;
  // };

  // toggle play / pause
  const vip =e=>
  {
    e.preventDefault();
    const l = e.target.closest('.av').querySelector('.mf');
    if (l.paused) play(l);
    else pause(l);
  };
  // make av wrapper
  const av = document.createElement('div');  
  av.classList.add('av');
  // make av element
  let l = document.createElement('video');
  if (audio)
  {
    l.classList.add('content-audio');
    av.classList.add('audio');
  }
  else
  {
    l.classList.add('content-video');
    av.classList.add('video');
  }
  l.classList.add('mf','muted');
  l.muted = true;
  l.loop = true;
  l.setAttribute('playsinline','');
  l.setAttribute('preload','metadata');
  l.setAttribute('crossorigin','anonymous');
  // l.dataset.src = src;
  l.setAttribute('src',src);
  if (poster) l.setAttribute('poster',poster);
  l.onclick = vip;

  play_butt.classList.add('play');
  play_butt.textContent = 'play';
  play_butt.onclick = vip;
  
  const seeker = document.createElement('input');
  // if (Hls.isSupported()) 
  // {
  //   const hls = new Hls();
  //   hls.loadSource(src);
  //   hls.attachMedia(l);
  // }
  // else if (l.canPlayType('application/vnd.apple.mpegurl')) l.setAttribute('src',src);

  const trols = document.createElement('p');
  trols.classList.add('controls');
  
  
  const url = document.createElement('span');
  url.classList.add('url');
  url.textContent = src;

  // const progressbar = document.createElement('progress');
  // progressbar.textContent = '0% played';
  // progressbar.setAttribute('min', 0);
  // progressbar.setAttribute('max', 100);
  // progressbar.setAttribute('value', 0);
  l.ontimeupdate = progress;

  
  seeker.type = 'range';
  seeker.classList.add('seeker');
  seeker.name = `seeker_${aa.fx.an(src)}`;
  seeker.setAttribute('min', 0);
  // seeker.setAttribute('max', 100);
  seeker.setAttribute('value', 0);
  seeker.setAttribute('step', 'any');
  seeker.addEventListener('input',e=>
  {
    // l.pause();
    l.currentTime = e.target.value; //Math.floor((l.duration * e.target.value) / 100);
    progress({target:l})
  });
  // seeker.addEventListener('change',e=>
  // {
  //   if (l.duration)
  //   {
  //     // l.pause();
  //     l.currentTime = Math.floor((l.duration * e.target.value) / 100);
  //     // l.play();
  //   } else console.log(e.target.value)}
  // );



  // const rewind_butt = document.createElement('button');
  // rewind_butt.classList.add('rewind');
  // rewind_butt.textContent = 'rewind';
  // rewind_butt.onclick = rewind;

  // const seekback_butt = document.createElement('button');
  // seekback_butt.classList.add('seekback');
  // seekback_butt.textContent = '-5';
  // seekback_butt.onclick = seekback;

  // const seekforward_butt = document.createElement('button');
  // seekforward_butt.classList.add('seekforward');
  // seekforward_butt.textContent = '+10';
  // seekforward_butt.onclick = seekforward;
  
  const mute_butt = document.createElement('button');
  mute_butt.classList.add('mute');
  mute_butt.textContent = 'mute';
  mute_butt.onclick = mute;
  
  const pip_butt = document.createElement('button');
  pip_butt.classList.add('pip');
  pip_butt.textContent = 'pip';
  pip_butt.onclick = pip;

  const grab_butt = document.createElement('button');
  grab_butt.classList.add('grab');
  grab_butt.textContent = 'grab';
  grab_butt.onclick = grab;
  
  trols.append(
    url,
    // play_butt,
    // rewind_butt,
    // seekback_butt,
    // seekforward_butt,
    mute_butt,
    pip_butt,
    grab_butt,
    
    
    // progressbar,
    // range_seek
  );
  l.onloadedmetadata =e=>
  {
    seeker.setAttribute('max', l.duration);
    trols.append(seeker, mute_butt, pip_butt, grab_butt);
    progress({target:l})
    // trols.dataset.duration = duration;
  };
  av.append(l,trols);
  return av
};

// audioBlob: Blob, samples = 100): Promise<number[]>
aa.fx.generate_waveform =async(audio_blob,samples=100)=>
{
  const audio_context = new AudioContext();
  const array_buffer = await audio_blob.arrayBuffer();
  const audio_buffer = await audio_context.decodeAudioData(array_buffer);

  const channel_data = audio_buffer.getChannelData(0);
  const block_size = Math.floor(channel_data.length/samples)
  const waveform = [];

  for (let i=0; i<samples; i++)
  {
    const start = block_size*i;
    let sum = 0;

    for (let j=0; j<block_size; j++) 
    {
      const amplitude = channel_data[start+j];
      sum += amplitude*amplitude
    }

    const rms = Math.sqrt(sum/block_size);
    const normalized = Math.min(1,rms*3);
    waveform.push(normalized)
  }

  audio_context.close()
  return waveform
};


aa.fx.url_ext =(url,extensions)=>
{
  const src = (url.origin + url.pathname).toLowerCase();
  for (const ext of extensions)
  {
    if (src.endsWith(`.${ext}`)
    || url.searchParams.get('format') === ext) return true
  }
  return false
};


Object.defineProperty(aa,'allowed_extensions',
{
  get:()=>
  {
    return {
      image:aa.fx.splitr(localStorage.ext_image),//['gif','heic','jpeg','jpg','png','webp'],
      video:aa.fx.splitr(localStorage.ext_video),//['mp4','webm'], // fuck mov 
      audio:aa.fx.splitr(localStorage.ext_audio),//['3ga','aac','aiff','flac','m4a','mp3','ogg','wav']
    }
  },
});

// checks if string is valid url and then checks extension for media file types.
// returns false if no media found or array with extension,URL
aa.fx.src_type =url=>
{
  // const extensions = 
  // {
  //   image:aa.fx.splitr(localStorage.ext_image),//['gif','heic','jpeg','jpg','png','webp'],
  //   video:aa.fx.splitr(localStorage.ext_video),//['mp4','webm'], // fuck mov 
  //   audio:aa.fx.splitr(localStorage.ext_audio),//['3ga','aac','aiff','flac','m4a','mp3','ogg','wav']
  // };


  let result = [url.href];
  for (const id in aa.allowed_extensions)
  {
    let set = aa.allowed_extensions[id];
    if (aa.fx.url_ext(url,set)) 
    {
      result.push(id);
      break;
    }
  }
  return result
  // if (aa.fx.src_ext(url,extensions.image)) dis.push('image');
  // if (aa.fx.src_ext(url,extensions.audio)) dis.push('audio');
  // if (aa.fx.src_ext(url,extensions.video)) dis.push('video');
  // return dis
};

aa.mk.file_input =()=>
{
  let dialog = aa.el.get('dialog');
  let input = make('input',{typ:'file'});
  input.onclick = aa.clk.file_input;
  // let butt = aa.mk.butt_clk('file_input');
  dialog.append(input);
  dialog.showModal();
};

aa.clk.file_input =e=>
{
  console.log(e)
};


// media observer for lazy cache fetching
// aa.lazy_god = new IntersectionObserver(a=>
// {
//   for (const b of a)
//   {
//     if (b.isIntersecting) 
//     {
//       let l = b.target;
//       aa.lazy_god.unobserve(l);
//       fastdom.mutate(()=>
//       {
//         if (l.dataset.src) l.src = l.dataset.src;
//         l.classList.add('quick_fox');
//         l.classList.remove('lazy_dog');
//       });
//     }
//   }
// },{root:null,threshold:.1});