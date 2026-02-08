/*

alphaama
fx: nostr protocol — crypto, encode/decode, kinds

*/


// decodes nip19 (bech32)
aa.fx.decode =string=>
{
  let decoded;
  try
  {
    decoded = NostrTools.nip19
      .decode(string.toLowerCase()).data
  }
  catch (er) { console.error('aa.fx.decode',string,er) }
  return decoded
};


// encodes to bech32 (nip19)
aa.fx.encode =(s,data)=>
{
  let encoded;
  try {encoded = NostrTools.nip19[s+'Encode'](data)}
  catch (er) {console.error('aa.fx.encode',s,data,er)};
  return encoded
};


// decrypt nip4/44
aa.fx.decrypt =async(s='',event_id)=>
{
  // check cache first
  if (event_id)
  {
    let cached = await aa.u.decrypt_cache.get(event_id);
    if (cached) return cached;
  }

  let [text,pubkey] = s.split(aa.regex.fw);
  if (text) text = text.trim();
  if (!pubkey) pubkey = aa.u.p.pubkey;
  let result;
  if (aa.fx.is_nip4(text)) result = await window.nostr.nip04.decrypt(pubkey,text);
  else result = await window.nostr.nip44.decrypt(pubkey,text);

  // cache result
  if (event_id && result) await aa.u.decrypt_cache.add(event_id, result, pubkey);

  return result
};


// decript and parse
aa.fx.decrypt_parse =async event=>
{
  // check cache first
  let cached = await aa.u.decrypt_cache.get(event.id);
  if (cached) return aa.pj(cached);

  if (!window.nostr)
  {
    aa.log('signer not found');
    return
  }
  let {pubkey,content} = event;
  let a = await window.nostr.nip44.decrypt(pubkey,content);
  if (!a)
  {
    aa.log(event.id+' decrypt failed');
    return
  }

  // cache raw decrypted string
  await aa.u.decrypt_cache.add(event.id, a, pubkey);

  a = aa.pj(a);
  if (!a)
  {
    aa.log(event.id+' decrypt parse failed');
    return
  }

  return a
};


// encrypt
aa.fx.encrypt44 =async(text,pubkey)=>
{
  if (!pubkey) pubkey = aa.u.p.pubkey;
  if (window.nostr)
    return await window.nostr.nip44.encrypt(pubkey,text)
  else
  {
    aa.log('you need a signer');
    return false
  }
};


// hash event
aa.fx.hash =ish=> NostrTools.getEventHash(ish);


// generate keypair
aa.fx.keypair =(xsec='')=>
{
  if (xsec && !aa.fx.is_key(xsec))
  {
    aa.log('fx keypair: invalid key provided');
    return false
  }

  let secret, public, nsec;
  if (!xsec?.length)
  {
    secret = NostrTools.generateSecretKey();
    xsec = NostrTools.utils.bytesToHex(secret)
  }
  else secret = NostrTools.utils.hexToBytes(xsec);
  if (secret)
  {
    public = NostrTools.getPublicKey(secret);
    nsec = NostrTools.nip19.nsecEncode(secret);
  }
  return [secret,public,xsec,nsec]
};


// verify event object
aa.fx.verify_event =async o=>
{
  let verified;
  try {verified = NostrTools.verifyEvent(o)}
  catch (er){aa.log('unable to verify:' +JSON.stringify(o))};
  return verified
};


// return kind information
aa.fx.kind_type =kind=>
{
  if (typeof kind === 'string') kind = parseInt(kind.trim());
  return NostrTools.kinds.classifyKind(kind);
}


aa.fx.kinds_type =kind=>
{
  if (typeof kind === 'string') kind = parseInt(kind.trim());
  let kinds = Object.entries(NostrTools.kinds);
  let result = kinds.filter(k=>typeof k[1]==='number'&&k[1]===kind).map(i=>i[0]);
  return result.length ? result[0] : 'unknown'
};


// SHA256 from blob
aa.fx.blob_sha256 =async blob=>
{
  const buffer = await blob.arrayBuffer();
  const hash_buffer = await crypto.subtle.digest('SHA-256',buffer);
  return Array.from(new Uint8Array(hash_buffer))
    .map(b=> b.toString(16).padStart(2,'0')).join('')
};


// count leading zeroes
aa.fx.clz =x=>
{
  let c = 0;
  for (let i = 0; i < x.length; i++)
  {
    const n = parseInt(x[i],16);
    if (n === 0) c += 4;
    else
    {
      c += Math.clz32(n) - 28;
      break
    }
  }
  return c
};


// fill missing event fields
aa.fx.normalise_event =(event={})=>
{
  if (!event.pubkey) event.pubkey = aa.bus.request('u:pubkey');
  if (!event.kind) event.kind = 1;
  if (!event.created_at) event.created_at = aa.now;
  if (!event.tags) event.tags = [];
  if (!event.content) event.content = '';
  return event
};
