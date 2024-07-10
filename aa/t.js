/*

alphaama
time / date stuff

*/


// timestamp to date
aa.t.to_date =s=> new Date(s*1000);


// timestamp from date string
aa.t.d =s=>
{
  try { return Date.parse(s) / 1000 } 
  catch (er) { return false }
};


// timestamp from n days ago 
aa.t.n =days=>
{
  const d = new Date();
  d.setDate(d.getDate() - days);
  return Math.floor(d.getTime()/1000)
};


// nice format date to string
aa.t.nice =d=>
{ 
  return d.getFullYear()
  +'/'+ (d.getMonth()+1+'').padStart(2,'0') 
  +'/'+ (d.getDate()  + '').padStart(2,'0') 
  +' '+ (d.getHours() + '').padStart(2,'0') 
  +':'+ (d.getMinutes()+'').padStart(2,'0') 
  +':'+ (d.getSeconds()+'').padStart(2,'0')
};


// time elapsed from date to string
aa.t.elapsed =date=>
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


// timestamp from string variable
aa.t.convert =s=>
{
  if (s === 'now') return aa.t.now; 
  if (s.startsWith('n_')) return aa.t.n(s.slice(2));
  if (s.startsWith('d_')) return aa.t.d(s.slice(2));  
  return parseInt(s)
};


// for display
aa.t.display =timestamp=> aa.t.nice(aa.t.to_date(timestamp));
aa.t.display_ext =ts=>aa.t.display(ts)+' ~'+aa.t.elapsed(aa.t.to_date(ts));