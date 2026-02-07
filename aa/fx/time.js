/*

alphaama
fx: time utilities

*/


// timestamp from string variable
aa.fx.time_convert =s=>
{
  if (s === 'now') return aa.now;
  if (!s.includes('_')) return parseInt(s);

  let t = s.slice(2);
  if (s.startsWith('d_'))
  {
    try { return Date.parse(t) / 1000 }
    catch (er) { return aa.now }
  }
  const d = new Date();
  switch (s[0])
  {
    case 'n': d.setDate(d.getDate() - t); break;
    case 'h': d.setHours(d.getHours() - t); break;
    case 'm': d.setMinutes(d.getMinutes() - t); break;
    case 'M': d.setMonth(d.getMonth() - t); break;
    case 'y': d.setYear(d.getFullYear() - t); break;
  }
  return Math.floor(d.getTime()/1000)
};


// for display
aa.fx.time_display =ts=> aa.fx.time_nice(new Date(ts*1000));
aa.fx.time_display_ext =ts=> aa.fx.time_display(ts)+' ~'+aa.fx.time_elapsed(new Date(ts*1000));


// time elapsed from date to string
aa.fx.time_elapsed =date=>
{
  const seconds_ago = Math.floor((new Date() - date) / 1000);
  const pad =t=> (Math.floor(t)+'').padStart(2,'0');
  let t = seconds_ago / 31536000; // years
  if (t > 1) return pad(t)+'Y';
  t = seconds_ago / 2592000; // months
  if (t > 1) return pad(t)+'M';
  t = seconds_ago / 86400; // days
  if (t > 1) return pad(t)+'d';
  t = seconds_ago / 3600; // hours
  if (t > 1) return pad(t)+'h';
  t = seconds_ago / 60; // minutes
  if (t > 1) return pad(t)+'m';
  return pad(seconds_ago)+'s'; // seconds
};


// nice format date to string
aa.fx.time_nice =d=>
{
  return d.getFullYear()
  +'/'+ (d.getMonth()+1+'').padStart(2,'0')
  +'/'+ (d.getDate()  + '').padStart(2,'0')
  +' '+ (d.getHours() + '').padStart(2,'0')
  +':'+ (d.getMinutes()+'').padStart(2,'0')
  +':'+ (d.getSeconds()+'').padStart(2,'0')
};


// timestamp to date
aa.fx.time_to_date =s=> new Date(s*1000);


// update time element
aa.fx.time_upd =element=>
{
  const timestamp = parseInt(element.textContent);
  const date = aa.fx.time_to_date(timestamp);
  fastdom.mutate(()=>
  {
    element.dataset.elapsed = aa.fx.time_elapsed(date);
  })
};
