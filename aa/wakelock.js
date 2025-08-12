// wakelock
aa.wakelock = 
{
  locked: null,
  get haz(){ return 'wakeLock' in navigator }
};


// prevent screen from going to sleep if tab is active
aa.wakelock.lock =async()=>
{
  if (!aa.wakelock.haz) return;
  try 
  {
    aa.wakelock.locked = await navigator.wakeLock.request();
    const wakelock_state =()=>
    {
      console.log('wake state locked:',!aa.wakelock.locked.released)
    };
    aa.wakelock.locked.addEventListener('release',wakelock_state);
    wakelock_state();
  } 
  catch(er){ console.error('failed to lock wake state:', er.message) }
};


// release screen from locked state
aa.wakelock.release =()=>
{
  if (aa.wakelock.locked) aa.wakelock.locked.release();
  aa.wakelock.locked = null;
};

window.addEventListener('load',aa.wakelock.lock)