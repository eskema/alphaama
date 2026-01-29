/*

alphaama
aa . mod
modules

*/

aa.mod_l = make('div',{id:'mods'});

aa.mod = {};


aa.mod.butts =mod=>
{
  if (!mod?.butts) return;

  let butts = make('p',{cla:'mod_butts'});
  if (mod.used)
  {
    if (mod.butts.mod)
    {
      if (Object.hasOwn(mod,'add')) butts.append(aa.mk.butt_action(`${mod.def.id} add `,'add'),' ');
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
  let readme = await aa.fx.readme(path,mod);
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
    let ops = {get:{store:'stuff',key:mod.def.id}};
    mod.o = await aa.db.ops('idb',ops);
    if (!mod.o && mod.old_id)
    {
      // in case the db key path changes
      // load mod from old_id and upgrade it
      ops.get.key = mod.old_id;
      mod.o = await aa.db.ops('idb',ops);
      if (mod.o)
      {
        mod.o.id = mod.def.id;
        aa.mod.save(mod);
      }
    }
    if (mod.o) mod.used = true;
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

  mod.mod_li = new Map();
  options.fun.push((k,v,l)=>{mod.mod_li.set(k,l)});
  mod.mod_ul = aa.mk.ls(options);
  
  let mod_l_o =
  {
    id: `mod_${mod.def.id}`,
    name: mod.name,
    element: mod.mod_ul,
    tagname: 'div',
    classes: 'mod'
  };
  
  let mod_l = aa.mk.section(mod_l_o);

  let mod_header = mod_l.firstElementChild;
  let mod_info = make('div',{cla:'mod_info'});
  let about = make('p',{con:mod.about,cla:'mod_about'});
  let butts = aa.mod.butts(mod);
  mod_info.append(about,' ',butts);

  let summary = mod_header.firstElementChild;
  summary.dataset.mod = mod.def.id;
  
  let pop = make('button',
  {
    cla:'butt exe',
    con:'pop',
    clk:e=>
    {
      e.preventDefault();
      let dialog = e.target.closest('dialog');
      if (dialog) dialog.close();
      else aa.mod.dialog(mod.def.id)
    }
  });
  pop.setAttribute('autofocus',true)
  mod_header.append(' ',pop);
  mod_l.insertBefore(mod_info,mod_header.nextElementSibling);
  
  if (mod.mod_l) mod.mod_l.replaceWith(mod_l);
  else aa.mod.append(mod_l);
  mod.mod_l = mod_l;
};

aa.mod.append =mod_l=>
{
  if (aa.mod_l) 
  {
    // insert alphabetically
    const last = [...aa.mod_l.children]
    .find(i=> mod_l.dataset.id < i.dataset.id) || null;
    fastdom.mutate(()=>{ sift.move(mod_l,last,aa.mod_l) });
  }
  else aa.log(mod_l)
};


aa.mod.dialog =(id='')=>
{
  let element = aa[id]?.mod_l;
  if (!element) 
  {
    aa.log('aa.mod.pop: mod not found')
    return
  }

  const dialog = aa.el.get('dialog');
  if (!dialog)
  {
    aa.log('aa.mod.pop: dialog not found')
    return
  }

  if (!element.hasAttribute('open')) 
  {
    element.toggleAttribute('open');
    element.dataset.was = 'closed';
  }

  aa.temp.mod_dialog_close =e=>
  {
    if (element.dataset.was==='closed') 
      element.toggleAttribute('open',false);
    aa.mod.append(element);
    dialog.removeEventListener('close',aa.temp.mod_dialog_close);
    delete aa.temp.mod_dialog_close
  };
  dialog.addEventListener('close',aa.temp.mod_dialog_close)

  dialog.append(element);
  dialog.showModal();
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


// save mod time out
aa.mod.save_to =async mod=>
{
  debt.add(()=>{aa.mod.save(mod)},200,`mod_save_${mod.def.id}`)
};


// update mod item element
aa.mod.ui =(mod,keys)=>
{
  let ul = mod.mod_ul;
  if (!ul) return;
  
  if (keys && !Array.isArray(keys)) keys = [keys];
  for (const k of keys)
  {
    let v = mod.o.ls[k];
    let cur = mod.mod_li.get(k);
    let l = mod.hasOwnProperty('mk') 
    ? mod.mk(k,v)
    : aa.mk.item(k,v);
    if (!l) continue;
    mod.mod_li.set(k,l);
    fastdom.mutate(()=>
    {
      if (!cur) ul.append(l);
      else  cur.replaceWith(l);
    })
  }
  
  if (ul.classList.contains('empty'))
  {
    ul.classList.remove('empty');
    ul.parentElement.classList.remove('empty');
  }
};

// mod actions
aa.actions.push(
  {
    action:['fx','pop'],
    required:['<mod_id>'],
    description:'view mod in a modal',
    exe:aa.mod.dialog
  }
);