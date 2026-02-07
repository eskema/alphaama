/*

alphaama
fx: general utilities

*/


// await a delay
aa.fx.delay =ms=> new Promise(resolve=> setTimeout(resolve,ms));


// convert a value from a range a_min/a_max into another range b_min/b_max
aa.fx.linear_convert =(val,a_max,b_max,a_min,b_min)=>
{
  if (!a_min) a_min = 0;
  if (!b_min) b_min = 0;
  return ((val-a_min)/(a_max-a_min))*(b_max-b_min)+b_min;
};


// fetch file from path, append text to object and return text
aa.fx.readme =async(path,o={})=>
{
  if (!Object.hasOwn(o,'readme'))
  {
    let response;
    try
    {
      response = await fetch(path)
    }
    catch {}
    if (!response) return;
    let text = await response.text();
    if (text) o.readme = text;
  }
  return o.readme
};


// converts string to URL
aa.fx.url =string=>
{
  if (!string) return false;
  let url;
  try { url = new URL(string) }
  catch { return false }
  if (!url.hostname.length) return false;
  return url
};


// qr code
aa.fx.qr =s=>
{
  let qr = aa.mk.qr(s.trim());
  aa.log('fx qr: ');
  aa.log(s);
  aa.log(qr);
};
