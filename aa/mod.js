/*

alphaama
aa . mod
modules

*/


aa.mod = {}


aa.mod.butts =mod=>
{
  if (!mod?.butts) return;

  let butts = aa.mk.l('p',{cla:'mod_butts'});
  if (mod.used)
  {
    if (mod.butts.mod)
    {
      if (Object.hasOwn(mod,'add')) butts.append(aa.mk.butt_action(`${mod.def.id} add`,'add'),' ');
      for (const i of mod.butts.mod) butts.append(aa.mk.butt_action(...i),' ') 
    }
  }
  else if (mod.butts.init)
  {
    for (const i of mod.butts.init) butts.append(aa.mk.butt_action(...i),' ')
  }
  return butts
};


aa.mod.help_setup =async(mod,path)=>
{
  if (!path) path = mod.readme_src || `/${mod.def.id}/README.adoc`;
  let readme = await aa.readme_setup(path,mod);
  if (!readme) return;
  let exe = ()=>{aa.mk.help(mod.def.id)};
  let description = `help with ${mod.name} (${mod.def.id})`;
  aa.actions.push(
    {
      action:['help',mod.name],
      description,
      exe
    },
    {
      action:[mod.def.id,'help'],
      description,
      exe
    }
  );
};


// load mod
aa.mod.load =async mod=>
{
  if (!mod.o)
  {
    let store = 'stuff';
    let key = mod.def.id;
    mod.o = await aa.db.ops('idb',{get:{store,key}});
    if (mod.o) mod.used = true;
    if (!mod.o && mod.old_id)
    {
      // in case the db key path changes
      // load mod from old_id and upgrade it
      key = mod.old_id;
      mod.o = await aa.db.ops('idb',{get:{store,key}});
      if (mod.o)
      {
        mod.o.id = mod.def.id;
        aa.mod.save(mod);
      }
    }
    if (!mod.o && mod.def) mod.o = mod.def;
  }
  if (mod.o && !mod.o.ls) mod.o.ls = {};

  // add mod readme
  aa.mod.help_setup(mod);
  return mod
};


// make mod
aa.mod.mk =async mod=>
{
  let options = {ls:mod.o.ls,sort:'a',fun:[]};
  if (mod.hasOwnProperty('mk')) options.mk = mod.mk;

  mod.li = new Map();
  options.fun.push((k,v,l)=>{mod.li.set(k,l)});
  mod.ul = aa.mk.ls(options);

  let mod_header = aa.mk.l('header',{cla:'mod_header'});
  // let name = aa.mk.l('h2',{con:mod.name,cla:'mod_name'});
  let about = aa.mk.l('p',{con:mod.about,cla:'mod_about'});
  let butts = aa.mod.butts(mod);
  mod_header.append(about,' ',butts);
  
  let mod_layout = new DocumentFragment();
  mod_layout.append(mod_header,mod.ul);
  
  let mod_l = aa.mk.details(mod.name,mod_layout);
  mod_l.classList.add('mod');
  let summary = mod_l.querySelector('summary');
  summary.dataset.id = mod.def.id;
  
  let pop = aa.mk.l('button',{cla:'butt exe',con:'pop',clk:e=>
  {
    e.preventDefault();
    let dialog = e.target.closest('dialog');
    if (dialog) dialog.close();
    else aa.mod.dialog(mod.def.id)
  }});
  pop.setAttribute('autofocus',true)
  summary.append(pop,' ');
  
  if (mod.l) mod.l.replaceWith(mod_l);
  else aa.mod.append(mod_l);
  mod.l = mod_l;
};

aa.mod.append =mod_l=>
{
  if (aa.mod_l) 
  {
    let name = mod_l.querySelector('summary').textContent;
    // insert alphabetically
    const last = [...aa.mod_l.children]
    .find(i=> name < i.querySelector('summary').textContent);
    fastdom.mutate(()=>{aa.mod_l.insertBefore(mod_l,last||null)});
  }
  else aa.log(mod_l)
};


aa.mod.dialog =(id='')=>
{
  let mod_l = aa[id]?.l;
  if (!mod_l) 
  {
    aa.log('aa.mod.pop: mod not found')
    return
  }
  if (!mod_l.hasAttribute('open')) 
  {
    mod_l.toggleAttribute('open');
    mod_l.dataset.was = 'closed';
  }
  const dialog = aa.el.get('dialog');
  dialog.append(mod_l);
  dialog.showModal();
};


// aa.mod.modal_close =e=>
// {
//   const dialog = aa.el.get('dialog');
//   const mod_l = dialog.querySelector('.mod');
//   if (mod_l.dataset.was==='closed') mod_l.toggleAttribute('open',false);
//   aa.mod.append(mod_l);
//   dialog.close();
// };


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


// update mod item element
aa.mod.ui =(mod,keys)=>
{
  let mod_l = mod.l; //document.getElementById(mod.def.id);
  if (keys && !Array.isArray(keys)) keys = [keys];
  for (const k of keys)
  {
    let v = mod.o.ls[k];
    let cur = mod.li.get(k);
    // let cur = document.getElementById(mod.def.id+'_'+aa.fx.an(k));
    let l = mod.hasOwnProperty('mk') ? mod.mk(k,v) : aa.mk.item(k,v);
    mod.li.set(k,l);
    fastdom.mutate(()=>
    {
      if (!cur) mod_l.append(l);
      else  cur.replaceWith(l);
    })
  }
  
  if (mod_l.classList.contains('empty'))
  {
    mod_l.classList.remove('empty');
    mod_l.parentElement.classList.remove('empty');
  }
};

aa.actions.push(
  {
    action:['fx','pop'],
    required:['<mod_id>'],
    description:'view mod in a modal',
    exe:aa.mod.dialog
  }
);