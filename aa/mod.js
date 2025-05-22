/*

alphaama
mod
// plugin expansion modules 

*/


aa.mod = {}


// load mod
aa.mod.load =async mod=>
{
  if (!mod.o)
  {
    mod.o = await aa.db.ops('idb',{get:{store:'stuff',key:mod.def.id}});
    if (mod.o) mod.used = true;
    if (!mod.o && mod.old_id)
    {
      // in case the db key path changes
      // load mod from old_id and upgrade it
      mod.o = await aa.db.ops('idb',{get:{store:'stuff',key:mod.old_id}});
      if (mod.o)
      {
        mod.o.id = mod.def.id;
        aa.mod.save(mod);
      }
    }
    if (!mod.o && mod.def) mod.o = mod.def;
  }
  if (mod.o && !mod.o.ls) mod.o.ls = {};
  return mod
};


// make mod
aa.mod.mk =mod=>
{
  let o = {id:mod.def.id,ls:mod.o.ls,sort:'a',fun:[]};
  if (mod.hasOwnProperty('mk')) o.mk = mod.mk;
  mod.li = new Map();
  o.fun.push((k,v,l)=>{mod.li.set(k,l)});
  mod.ul = aa.mk.ls(o);
  let mod_l = aa.mk.details(mod.def.id,mod.ul);
  mod_l.classList.add('mod');
  if (mod.l)
  {
    mod.l.replaceWith(mod_l);
    mod.l = mod_l;
  }
  else
  {
    mod.l = mod_l;
    if (aa.mod_l) 
    {
      const last = [...aa.mod_l.children]
      .filter(i=> o.id < i.querySelector('summary').textContent)[0];
      fastdom.mutate(()=>{aa.mod_l.insertBefore(mod_l,last)});
    }
    else aa.log(mod_l)
  }
};


// save mod
aa.mod.save =async mod=>
{
  return new Promise(resolve=>
  {
    if (mod && mod.o && mod.o.id)
    {
      aa.db.idb.postMessage({put:{store:'stuff',a:[mod.o]}});
    }
    resolve(mod)
  })
};


aa.mod.servers_add_details =cla=>
{
  // let id = 'servers_add_'+cla;
  let l = aa.el.get(cla);
  if (!l) 
  {
    l = aa.mk.details(cla,0,0,'base'); // ,aa.mk.l('div',{cla:'list'})
    aa.el.set(cla,l)
  }
  return l
};


// add server item with sets to mod
aa.mod.servers_add =(mod,s='',cla='server')=>
{
  const valid = [];
  const invalid = [];
  const off = [];
  const all = [valid,invalid,off];
  const as = s.split(',');
  if (!as.length) return all;

  
  // let ul = l.lastElementChild;
  let haz;
  for (const i of as) 
  {
    let a = i.trim().split(' ').map(n=>n.trim());
    let url_string = a.shift();
    const url = aa.is.url(url_string)?.href;
    if (!url)
    {
      haz = true;
      aa.fx.a_add(invalid,[url_string]);
      // con = `\ninvalid: ${url_string}`;
      // ul.prepend(aa.mk.l('li',{con}));
      continue;
    }

    if (!mod.o.ls[url]) mod.o.ls[url] = {sets:[]};
    let updd = aa.fx.a_add(mod.o.ls[url].sets,a);
    if (!updd) continue;
    
    haz = true;
    // let sets = aa.r.o.ls[url].sets.join(' ');
    aa.mod.ui(mod,url);
    
    if (a.includes('off')) 
    {
      aa.fx.a_add(off,[url]);
      // con = `\noff: ${url} ${sets}`;
    }
    else
    {
      aa.fx.a_add(valid,[url]);
      // con = `\nadded: ${url} ${sets}`;
    }
    
    let con = `${localStorage.ns} ${mod.def.id} add ${url} ${a.join(' ')}`;
    dis = aa.mk.l('p',{con});
    aa.log(dis)
    // ul.prepend(aa.mk.l('li',{con}))
  }
  
  if (invalid.length) aa.log(`invalid urls: ${invalid}`);
  
  if (haz)
  {
    // let l = aa.mod.servers_add_details(cla);
    // let log = l.parentElement;
    // if (log) aa.logs.append(log);
    // else aa.log(l)
    aa.mod.save(mod);
    // let dis;
    // for (const url of [...off,...valid])
    // {
    //   let sets = mod.o.ls[url].sets.join(' ');
    //   let con = `${localStorage.ns} ${mod.def.id} add ${url} ${sets}`;
    //   dis = aa.mk.l('p',{con});
    //   aa.log(dis)
    //   let li = l.querySelector(`[data-id="${url}"]`);
    //   if (!li) li = aa.mk.l('p',{con:`${url} ${mod.o.ls[url].sets.join(' ')}`})
    //   l.append(li);
    // }
    // aa.fx.scroll(dis)
  }
  return [valid,invalid,off]
};


// append buttons to server item
aa.mod.servers_butts =(mod,l,o)=>
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
aa.mod.setrm =(mod,s)=>
{
  const as = s.split(',');
  if (as.length)
  {
    for (const i of as) 
    {
      let a = i.trim().split(' ').map(n=>n.trim());
      let url_string = a.shift();
      const url = aa.is.url(url_string)?.href;
      const server = mod.o.ls[url];
      if (!server) return;
      server.sets = aa.fx.a_rm(server.sets,a);
      aa.mod.ui(mod,url);
    }
  }
  aa.mod.save(mod)
};


// update mod item element
aa.mod.ui =(mod,k)=>
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
