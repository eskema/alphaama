/*

alphaama
fx: string manipulation

*/


// converts string to alphanumeric,
// replaces everything else with underscore
// to be used as valid element ids
aa.fx.an =s=>
{
  s = s+'';
  s = s.replace(/[^a-z_0-9]/gi,'_').toLowerCase();
  while (s.includes('__')) { s = s.replace('__','_') }
  if (s.startsWith('_')) s = s.slice(1);
  if (s.endsWith('_')) s = s.slice(0,-1);
  return s
};


// convert string to base64
aa.fx.base64 =string=>
{
  const bytes = new TextEncoder().encode(string);
  string = Array.from(bytes, b=> String.fromCodePoint(b))
    .join('');
  return btoa(string)
};


// shorten string to only <start>…<end>
aa.fx.short_key =(key,len=6,separator='…')=>
{
  return `${key.slice(0,len)}${separator}${key.slice(-len)}`
};


// truncate string to start and end
// with given length and a separator in between (000…000)
aa.fx.trunk =(s,len=3,sep='…')=> s.slice(0,len)+sep+s.slice(-len);


// trim split and trim more
// returns array
aa.fx.splitr =(string,at=' ')=>
{
  let array = string.trim().split(at).map(item=>item.trim());
  if (array.length === 1 && array[0] === '') return [];
  return array
};


// splits string, given '"quoted text" and something else'
// returns ['quoted text','and something else']
aa.fx.split_str =(s='')=>
{
  if (s.startsWith('"" ')) return ['',s.slice(3)];
  else if (s.startsWith('""')) return ['',s.slice(2)];
  let dis = s?.match(aa.regex.str);
  if (dis && dis.length) return [dis[1],s.slice(dis.index+dis[0].length).trim()]
  return [s]
};


// split addressable id string
aa.fx.split_ida =ida=>
{
  let a = ida.split(':');
  let kind = a.shift();
  let pubkey = a.shift();
  let identifier = a.length > 1 ? a.join(':') : a[0];
  return [kind,pubkey,identifier]
};


// return single or plural string
aa.fx.plural =(n,s)=> n === 1 ? s : s+'s';


// (1,'unit') => 1unit
// (21,'unit') => 21units
aa.fx.units =(amount,unit='sat')=>
{
  return `${amount}${aa.fx.plural(amount,unit)}`
}


// random string
aa.fx.rands =(length=6,sample)=>
{
  const chars = sample
  || 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  for (let i=0; i<length; i++)
  {
    const index = Math.floor(Math.random() * chars.length);
    result += chars.charAt(index);
  }
  return result;
};


aa.fx.format_bytes =(bytes,decimals=2)=>
{
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes','KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

  const i = Math.floor(Math.log(bytes)/Math.log(k))

  return `${parseFloat((bytes/Math.pow(k,i)).toFixed(dm))} ${sizes[i]}`
};
