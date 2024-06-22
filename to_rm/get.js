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




