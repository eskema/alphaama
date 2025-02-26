// load mod
aa.mod_load =async(mod)=>
{
  if (!mod.o) 
  {
    mod.o = await aa.db.idb.ops({get:{store:'stuff',key:mod.def.id}});
    if (!mod.o && mod.old_id) mod.o = await aa.mod_load_old(mod);
    if (!mod.o && mod.def) mod.o = mod.def;
  }
  if (mod.o && !mod.o.ls) mod.o.ls = {};
  return mod
};


// in case the db key path changes
// load mod from old_id
aa.mod_load_old =async mod=>
{
  let mod_o = await aa.db.idb.ops({get:{store:'stuff',key:mod.old_id}});
  if (mod_o)
  {
    mod_o.id = mod.def.id;
    mod.o = mod_o;
    aa.mod_save(mod);
  }
  return mod_o
};


// save mod
aa.mod_save = async mod=>
{
  return new Promise(resolve=>
  {
    // console.log(mod);
    if (mod && mod.o && mod.o.id)
    {
      aa.db.idb.worker.postMessage({put:{store:'stuff',a:[mod.o]}});
    }
    resolve(mod)
  })  
};


// add server item with sets to mod
aa.mod_servers_add =(mod,s='',cla='server')=>
{
  const as = s.split(',');
  const valid = [];
  const invalid = [];
  const off = [];
  let len = as.length;
  if (len)
  {
    let pa = aa.mk.l('p');
    let details = aa.mk.details(`${len} ${aa.fx.plural(len,cla)}`,pa);
    let haz;
    for (const i of as) 
    {
      let a = i.trim().split(' ');
      let url_string = a.shift().trim();
      const url = aa.is.url(url_string)?.href;
      if (url)
      {
        if (!mod.o.ls[url]) mod.o.ls[url] = {sets:[]};
        let updd = aa.fx.a_add(mod.o.ls[url].sets,a);
        let sets = aa.r.o.ls[url].sets.join(' ');
        if (updd)
        {
          haz = true;
          aa.mod_ui(mod,url);
          aa.fx.a_add(valid,[url]);
          let text = `\nadded: ${url} ${sets}`;
          if (a.includes('off')) 
          {
            aa.fx.a_add(off,[url]);
            text = `\noff: ${url} ${sets}`;
          }
          pa.append(text)
        }
      }
      else 
      {
        haz = true;
        aa.fx.a_add(invalid,[url]);
        pa.append(`\ninvalid: ${url}`)
      }
    }
    if (haz) aa.log(details);
  }
  aa.mod_save(mod);
  return [valid,invalid,off]
};


// append buttons to server item
aa.mod_servers_butts =(mod,l,o)=>
{
  let url = l.querySelector('.url').innerText;
  l.append(' ',aa.mk.butt_action(mod.def.id+' del '+url,'del','del'));
  
  let sets = aa.mk.l('span',{cla:'sets'});
  if (o.sets && o.sets.length)
  {    
    for (const set of o.sets)
    {
      sets.append(aa.mk.butt_action(mod.def.id+' setrm '+url+' '+set,set),' ')
    }
  }
  l.append(' ',sets,' ',aa.mk.butt_action(mod.def.id+' add '+url+' off','+','add'));
};


// remove set from server
aa.mod_setrm =(mod,s)=>
{
  const as = s.split(',');
  if (as.length)
  {
    for (const i of as) 
    {
      let a = i.trim().split(' ');
      let url_string = a.shift().trim();
      const url = aa.is.url(url_string)?.href;
      const server = mod.o.ls[url];
      if (!server) return;
      server.sets = aa.fx.a_rm(server.sets,a);
      aa.mod_ui(mod,url);
    }
  }

  aa.mod_save(mod)
};


// update mod item element
aa.mod_ui =(mod,k)=>
{
  let v = mod.o.ls[k];
  let cur = document.getElementById(mod.def.id+'_'+aa.fx.an(k));
  let l = mod.hasOwnProperty('mk') ? mod.mk(k,v) : aa.mk.item(k,v);
  let mod_l = document.getElementById(mod.def.id);
  if (!cur) mod_l.append(l);
  else cur.replaceWith(l);
  if (mod_l.classList.contains('empty'))
  {
    mod_l.classList.remove('empty');
    mod_l.parentElement.classList.remove('empty');
  } 
};