aa.add_styles(['/av/av.css']);

// audio/video player element
aa.mk.av =(src,poster=false,audio=false)=>
{
  // save screenshot
  const grab =e=>
  {
    var canvas = document.createElement("canvas");
    const l = e.target.closest('.av').querySelector('.mf');
    canvas.width = l.videoWidth;
    canvas.height = l.videoHeight;
    var canvasContext = canvas.getContext("2d");
    canvasContext.drawImage(l, 0, 0);
    let src = canvas.toDataURL('image/png');
    aa.log(aa.mk.img(src));
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

  const grab_butt = document.createElement('button');
  grab_butt.classList.add('grab');
  grab_butt.textContent = 'grab';
  grab_butt.onclick = grab;
  
  trols.append(rewind_butt,mute_butt,pip_butt,grab_butt,url,progressbar);
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

aa.mk.file_input =()=>
{
  let dialog = aa.el.get('dialog');
  let input = aa.mk.l('input',{typ:'file'});
  input.onclick = aa.clk.file_input;
  // let butt = aa.mk.butt_clk('file_input');
  dialog.append(input);
  dialog.showModal();
};

aa.clk.file_input =e=>
{
  console.log(e)
};