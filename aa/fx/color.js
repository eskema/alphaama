/*

alphaama
fx: color utilities

*/


// adds css color in rgb to element from hex string
// and also sets luma
aa.fx.color =async(x,l)=>
{
  const rgb = aa.fx.color_xrgb(aa.fx.color_hex(x));
  fastdom.mutate(()=>
  {
    l.style.setProperty('--c',rgb);
    l.dataset.luma = aa.fx.color_luma(rgb);
  });
};


// removes leading zeroes from beginning of hexstring
// to be used as a hex color from pubkeys
// but not too dark if pow/mined
aa.fx.color_hex =x=>
{
  try { return x.replace(/^0*([1-9a-f][0-9a-f]{5}).*$/,(x0,x_x)=>x_x) }
  catch(er) { return x }
};


// returns if color is dark or light
aa.fx.color_luma =rgb=>
{
  const [r,g,b] = rgb.split(',');
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128 ? 'dark' : 'light';
};


// converts hex to rgb
aa.fx.color_xrgb =x=>
{
  return parseInt(x.slice(0,2),16)
    +','+parseInt(x.slice(2,4),16)
    +','+parseInt(x.slice(4,6),16)
};


// converts hsl to hex
aa.fx.color_hslx =(h,s,l)=>
{
  s /= 100;
  l /= 100;
  const k =n=> (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1,Math.min(k(n) - 3,9 - k(n),1));
  const rgb = [255 * f(0), 255 * f(8), 255 * f(4)];
  const to_x =x=>
  {
    const hex = x.toString(16);
    return hex.length===1?'0'+hex:hex;
  };
  return rgb.map(to_x).join('');
};
