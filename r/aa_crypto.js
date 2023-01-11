function bytes_to_hex(bytes) 
{
   return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function hex_to_bytes(hex) 
{
   return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function zero_bits(b)
{
   let n = 0;
   if (b == 0) return 8;
   while (b >>= 1) n++;
   return 7-n;
}

function count_leading_zero_bits(bytes)
{
   let bits, total, i;
   for (i = 0, total = 0; i < 32; i++) 
   {
      bits = zero_bits(bytes[i]);
      total += bits;
      if (bits !== 8) break;
   }
   return total
}

function base64_to_hex(str) 
{
   const raw = atob(str);
   let i, result = ''; 
   for (i = 0; i < raw.length; i++) 
   {
      const hex = raw.charCodeAt(i).toString(16);
      result += (hex.length === 2 ? hex : '0' + hex);
   }
   return result
}

function hexToBech32(hex, prefix) 
{
   const words = bech32.bech32.toWords(buffer.Buffer.from(hex,'hex'));
   return bech32.bech32.encode(prefix, words)
}

function bech32ToHex(bech32string) 
{
   const decoded = bech32.bech32.fromWords(bech32.bech32.decode(bech32string).words);   
   return buffer.Buffer.from(decoded).toString('hex')
}

async function hash(str) 
{
   return bytes_to_hex(await nobleSecp256k1.utils.sha256(buffer.Buffer.from(str)))
}

async function new_keypair(password = false)
{
   const keys = {};
   const private_k = await nobleSecp256k1.utils.randomPrivateKey();
   keys.sec = bytes_to_hex(private_k);
   keys.pub = bytes_to_hex(nobleSecp256k1.getPublicKey(private_k, true)).substring(2);
   if (password) keys.sec = encrypt(await hash(password), keys.pub, keys.sec);
   return keys
}

function keys_to_bech32(keys) 
{
   if (keys.sec) keys.nsec = hexToBech32(keys.sec,'nsec');
   if (keys.pub) keys.npub = hexToBech32(keys.pub,'npub');
   return keys
}

async function sign_event(event, privateKey) 
{
   const eventData = JSON.stringify([
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content
   ]);
   event.id  = bytes_to_hex(await nobleSecp256k1.utils.sha256(buffer.Buffer.from(eventData)));
   event.sig = await nobleSecp256k1.schnorr.sign(event.id, privateKey);
   return event
}

function encrypt(privkey, pubkey, text) 
{
   const 
      key = hex_to_bytes(nobleSecp256k1.getSharedSecret(privkey, '02' + pubkey, true).substring(2)),
      iv = window.crypto.getRandomValues(new Uint8Array(16)),
      cipher = browserifyCipher.createCipheriv('aes-256-cbc', key, iv),
      em = cipher.update(text,'utf8','base64') + cipher.final('base64');
      
   return em + "?iv=" + btoa(String.fromCharCode.apply(null, new Uint8Array(iv.buffer)))
}
		
function decrypt(privkey, pubkey, cipher) 
{
   const 
      key = hex_to_bytes(nobleSecp256k1.getSharedSecret(privkey, '02' + pubkey, true).substring(2)),
      [em, iv] = cipher.split('?iv='),
      decipher = browserifyCipher.createDecipheriv('aes-256-cbc',key, hex_to_bytes(base64_to_hex(iv)));
   
   return decipher.update(em, 'base64') + decipher.final('utf8')
}