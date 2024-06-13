// get stuff from stuff

// get the dialog element or create it if not found
aa.get.dialog =()=>
{
  let dialog = document.getElementById('dialog');
  if (!dialog) 
  {
    dialog = aa.mk.l('dialog',{id:'dialog'});
    document.body.insertBefore(dialog,document.body.lastChild);
    dialog.addEventListener('close',e=>
    {
      dialog.removeAttribute('title');
      dialog.textContent = '';
    });
  }
  return dialog
};


// get and log src

aa.get.md =async src=>
{
  return new Promise(resolve=>
  {
    fetch(src).then(dis=>dis.text()).then(dis=>
    {
      let text = aa.parse.content(dis);
      let l = aa.mk.l('article',{cla:'content parsed',app:text});
      resolve(aa.mk.details('readme',l));
    })
  })
};


// get missing e or p

aa.get.missing =async type=>
{
  aa.to(()=>
  {
    let miss = {};
    const nope =(xid,a,b)=>
    {
      for (const url of a) 
      {
        if (!b.includes(url))
        {
          if (!miss[url]) miss[url] = [];
          aa.fx.a_add(miss[url],[xid]);
        }
      }
    };
    let def_relays = aa.r.in_set(aa.r.o.r);
    for (const xid in aa.miss[type])
    {
      let v = aa.miss[type][xid];
      nope(xid,def_relays,v.nope);
      nope(xid,v.relays,v.nope);
    }

    if (Object.keys(miss).length)
    {
      let [url,ids] = Object.entries(miss).sort((a,b)=>a.length - b.length)[0];
      for (const id of ids) aa.fx.a_add(aa.miss[type][id].nope,[url]);
      let filter;
      if (type === 'p') 
      {
        filter = {authors:ids,kinds:[0]};
      }
      else if (type === 'e')
      {
        for (const id of ids)
        {
          let notes = document.querySelectorAll('[data-id="'+id+'"]');
          for (const note of notes) note.dataset.nope = aa.miss.e[id].nope;
        }
        filter = {ids:ids};
      }
      aa.r.demand(['REQ',type,filter],[url],{});
    }
  },1000,'miss_'+type);
};

// // get missing e or p

// aa.get.missing =async type=>
// {
//   const nope =(xid,a,b)=>
//   {
//     for (const url of a) 
//     {
//       if (!b.includes(url))
//       {
//         if (!miss[url]) miss[url] = [];
//         aa.fx.a_add(miss[url],[xid]);
//       }
//     }
//   };

//   let miss = {};
    
//   let def_relays = aa.r.in_set(aa.r.o.r);
//   for (const xid in aa.miss[type])
//   {
//     let v = aa.miss[type][xid];
//     nope(xid,def_relays,v.nope);
//     nope(xid,v.relays,v.nope);
//   }
  
//   let filter,url,ids;
//   if (Object.keys(miss).length)
//   {
//     [url,ids] = Object.entries(miss).sort((a,b)=>a.length - b.length)[0];
//     for (const id of ids) aa.fx.a_add(aa.miss[type][id].nope,[url]);
//     if (type === 'p') 
//     {
//       filter = {authors:ids,kinds:[0]};
//     }
//     else if (type === 'e')
//     {
//       for (const id of ids)
//       {
//         let notes = document.querySelectorAll('[data-id="'+id+'"]');
//         for (const note of notes) note.dataset.nope = aa.miss.e[id].nope;
//       }
//       filter = {ids:ids};
//     }
//     // aa.r.demand(['REQ',type,filter],[url],{});
//   }

//   aa.to(()=>
//   {
//     aa.r.demand(['REQ',type,filter],[url],{});    
//   },1000,'miss_'+type);
// };

// nip05 (wip)

aa.get.nip05 =async s=>
{
  let nip05 = await NostrTools.nip05.queryProfile(s);
  console.log(nip05);
};


// returns a relay that has event x or empty string

aa.get.seen =(x)=>
{
  const dat = aa.db.e[x];
  if (dat && dat.seen.length) return dat.seen[0];
  return ''
};


// returns tags of type from event

aa.get.tags =(event,type)=> event.tags.filter(tag=>tag[0]===type);


// returns tags for building a reply

aa.get.tags_for_reply =(event)=>
{  
  // needs to account for "a" tag
  const tags = [];
  const seen = aa.get.seen(event.id);
  let tag = aa.get.root_tag(event.tags);
  if (tag) 
  {
    tag[2] = aa.is.url(tag[2])?.href || seen;
    tag[3] = 'root';
    tag.splice(4);
    tags.push(tag,['e',event.id,seen,'reply']);
  }
  else tags.push(['e',event.id,seen,'root']);

  const p_tags = event.tags.filter(t=>aa.is.tag.p(t) && t[1] !== aa.u.o.ls.xpub);
  let dis_p_tags = [...new Set(p_tags)];
  if (event.pubkey !== aa.u.o.ls.xpub 
  && !dis_p_tags.some(t=>t[1] === event.pubkey)) dis_p_tags.push(['p',event.pubkey]);
  // needs to do more here...
  tags.push(...dis_p_tags);
  return tags
};


// gets e tag marked 'reply' or the last not marked mention

aa.get.reply_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='reply')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention').pop();
  if (tag && aa.is.tag.e(tag)) return tag;
  return false
};


// gets e tag marked 'root' or the first not marked mention

aa.get.root_tag =tags=>
{
  let tag = tags.filter(t=>t[0]==='e'&&t[3]==='root')[0];
  if (!tag) tag = tags.filter(t=>t[0]==='e'&&t[3]!=='mention')[0];
  if (tag && aa.is.tag.e(tag)) return tag;
  return false
};