// reusable regex
export default
{
  get an(){ return /^[A-Z_0-9]+$/i },
  get hashtag(){ return /(\B[#])[\w_-]+/g },
  get hex(){ return /^[A-F0-9]+$/i },
  //get lnbc(){ return /((lnbc)[A-Z0-9]*)\b/gi },
  //get magnet(){ return /(magnet:\?xt=urn:btih:.*)/gi },
  get nostr(){ return /((nostr:)[A-Z0-9]{12,})\b/gi }, 
  get bech32(){ return /^[AC-HJ-NP-Z02-9]*/i },
  get url(){ return /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g },
  get str(){ return /"([^"]+)"/ }, // text in quotes ""
  get fw(){ return /(?<=^\S+)\s/ }, // first word
};