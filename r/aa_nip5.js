onmessage = e => { console.log(e); fetch_nip5(e.data[0],e.data[1],e.data[2]) };

function fetch_nip5(username,domain,k)
{  //https://<domain>/.well-known/nostr.json?name=<local-part>
   let nip5 = username + '@' + domain;
   const url = new URL('https://'+domain+'/.well-known/nostr.json?name='+username);
   if (url) 
   {
      console.log(url.href);
      fetch(url.href)
      .then(async response => 
      {
         if (!response.ok) 
         {
            const error = (data && data.message) || response.status;
            return Promise.reject(error)
         }
         return await response.json()
      })
      .then((json)=> 
      {
         if (json && typeof json === 'object') 
         {
            if (k === json.names[username]) postMessage([nip5,k,true,json]);
            else postMessage([nip5,k,false,json])
         }
      });
   }
   else postMessage([nip5,k,false])
}