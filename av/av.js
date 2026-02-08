/*

alphaama
av
audio/video player

*/


// audio/video player element
const av =(src,opts={})=>
{
  const {poster,audio,on_grab,on_mute,on_play,on_pause,on_pip,on_progress} = opts;
  const type = audio ? 'audio' : 'video';
  const play_butt = document.createElement('button');


  // save screenshot
  const grab =e=>
  {
    const l = e.target.closest('.av').querySelector('.mf');
    if (!l.crossOrigin) return;
    const canvas = document.createElement("canvas");
    canvas.width = l.videoWidth;
    canvas.height = l.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(l, 0, 0);
    let img_src = canvas.toDataURL('image/png');
    if (on_grab) on_grab(img_src);
    canvas.remove();
  };
  // toggle sound
  const mute =e=>
  {
    const l = e.target.closest('.av').querySelector('.mf');
    l.muted = !l.muted;
    l.classList.toggle('muted');
    if (on_mute) on_mute(l.muted,l);
  };
  // pause video
  const pause =l=>
  {
    l.pause();
    l.classList.remove('playin');
    let note = l.closest('.note');
    if (note) note.classList.remove('av_playin');
    play_butt.textContent = 'play';
    if (on_pause) on_pause(l);
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
    if (on_play) on_play(l);
  };
  // picture-in-picture
  const pip =e=>
  {
    const l = e.target.closest('.av').querySelector('.mf');
    if (document.pictureInPictureElement) document.exitPictureInPicture();
    else if (document.pictureInPictureEnabled) l.requestPictureInPicture();
    if (on_pip) on_pip(l);
  };


  // toggle play / pause
  const vip =e=>
  {
    e.preventDefault();
    const l = e.target.closest('.av').querySelector('.mf');
    if (l.paused) play(l);
    else pause(l);
  };


  // make av wrapper
  const el = document.createElement('div');
  el.classList.add('av');
  // make av element
  let l = document.createElement('video');
  
  l.classList.add(`content-${type}`);
  el.classList.add(type);
  
  l.classList.add('mf','muted');
  l.muted = true;
  l.loop = true;
  l.setAttribute('playsinline','');
  l.setAttribute('preload','metadata');
  l.crossOrigin = 'anonymous';
  l.onerror =()=>
  {
    if (l.crossOrigin)
    {
      l.crossOrigin = null;
      l.src = src;
    }
  };
  l.src = src;
  if (poster) l.setAttribute('poster',poster);
  l.onclick = vip;

  play_butt.classList.add('play');
  play_butt.textContent = 'play';
  play_butt.onclick = vip;


  const trols = document.createElement('p');
  trols.classList.add('controls');


  const url = document.createElement('span');
  url.classList.add('url');
  url.textContent = src;


  const seeker = document.createElement('input');
  seeker.type = 'range';
  seeker.classList.add('seeker');
  seeker.name = `seeker_${btoa(src).slice(0,12)}`;
  seeker.setAttribute('min', 0);
  seeker.setAttribute('value', 0);
  seeker.setAttribute('step', 'any');

  // update progress
  const progress =e=>
  {
    const duration = Math.floor(l.duration||0);
    const percentage = Math.floor((100 / duration) * l.currentTime);
    const percented = `${percentage}%`;
    trols.dataset.elapsed = Math.ceil(l.currentTime);
    trols.dataset.remains = Math.ceil(duration - l.currentTime);
    trols.dataset.duration = duration;
    trols.dataset.percentage = percented;
    seeker.style.background = `linear-gradient(to right, var(--color-front) ${percented}, var(--color-back) ${percented}) no-repeat`;
    seeker.value = l.currentTime;
    if (on_progress) on_progress({elapsed:Math.ceil(l.currentTime),remains:Math.ceil(duration-l.currentTime),duration,percentage},l);
  };


  seeker.addEventListener('input',e=>
  {
    l.currentTime = e.target.value;
    progress({target:l})
  });

  l.ontimeupdate = progress;


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

  trols.append(url);
  l.onloadedmetadata =e=>
  {
    seeker.setAttribute('max', l.duration);
    trols.append(seeker, mute_butt, pip_butt, grab_butt);
    progress({target:l})
  };
  el.append(l,trols);
  return el
};


// generate waveform data from audio blob
const generate_waveform =async(audio_blob,samples=100)=>
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


export default
{
  styles: ['/av/av.css'],
  av,
  generate_waveform,
};
