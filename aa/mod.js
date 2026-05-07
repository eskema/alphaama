/*

alphaama
aa . mod
modules

*/

aa.mod_l = make('div',{id:'mods'});

aa.mod = {};

// module readiness hooks
// aa.mod.ready(key, fn) — register callback for when key fires
// if key already fired, fn runs immediately
// aa.mod.fire_ready(key) — fire all callbacks for key
aa.mod._ready = new Map();
aa.mod._ready_fired = new Set();

aa.mod.ready =(key, fn)=>
{
  if (aa.mod._ready_fired.has(key))
  {
    fn();
    return
  }
  if (!aa.mod._ready.has(key)) aa.mod._ready.set(key, []);
  aa.mod._ready.get(key).push(fn);
};

aa.mod.fire_ready =key=>
{
  aa.mod._ready_fired.add(key);
  let cbs = aa.mod._ready.get(key);
  if (!cbs) return;
  for (let fn of cbs) fn();
  aa.mod._ready.delete(key);
};


aa.mod.butts =mod=>
{
  if (!mod?.butts) return;

  let butts = make('p',{cla:'mod_butts'});
  if (mod.used)
  {
    if (mod.butts.mod)
    {
      if (Object.hasOwn(mod,'add')) butts.append(aa.mk.butt_action(`${mod.def.id} add `,'add'),' ');
      for (const i of mod.butts.mod)
      {
        if (i instanceof Element) butts.append(i,' ')
        else butts.append(aa.mk.butt_action(...i),' ')
      }
    }
  }
  else if (mod.butts.init)
  {
    for (const i of mod.butts.init)
    {
      if (i instanceof Element) butts.append(i,' ')
      else butts.append(aa.mk.butt_action(...i),' ')
    }
  }
  // mods can opt out (e.g. h itself — no point pointing help back at help)
  if (!mod.no_help_butt)
    butts.append(aa.mk.butt_action(`${mod.def.id} help`,'?'),' ');
  return butts
};


// per-module help aliases — both `.help <fullname>` and `.<modid> help` are
// registered so they show up directly in cli autocomplete (clickable). they
// route to the h module's view. readme is prefetched (best-effort, may 404)
// so h's nav can filter modules without one; the cli aliases stay
// registered regardless and produce a clear log via h.show on misses.
//
// h itself is skipped: the generic `.help` (and `.h` alias) already cover
// it, so `[help, help]` and `[h, help]` would just be redundant clutter.
aa.mod.help_setup =async mod=>
{
  if (mod.def.id === 'h') return;
  let path = mod.readme_src || `/${mod.def.id}/README.adoc`;
  await aa.fx.readme(path, mod);
  let description = `help with ${mod.name} (${mod.def.id})`;
  let slug = mod.name || mod.def.id;
  let exe = ()=> aa.view.state(`#help_${slug}`);
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
  mod.mod_li = new Map();
  mod.mod_ul = aa.mk.ls({});
  let keys = Object.keys(mod.o.ls).sort(aa.fx.sorts.a);
  const on_ui_done =()=> aa.mod.fire_ready(`${mod.def.id}:ui`);
  if (keys.length) aa.mod.ui(mod,keys,on_ui_done);
  else on_ui_done();
  
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
  
  // guard replaceWith: only valid if mod.mod_l actually has a parent — an
  // orphan replaceWith is a silent no-op and the new section would never make
  // it into the tree. don't use isConnected here: during module load aa.mod_l
  // itself hasn't been attached to document yet, so every child reports
  // isConnected=false and we'd end up appending duplicates each time.
  if (mod.mod_l?.parentElement) mod.mod_l.replaceWith(mod_l);
  else aa.mod.append(mod_l);
  mod.mod_l = mod_l;
  mod.on_mk?.();
};

// synchronous — fastdom batching here caused a race: on rapid re-renders the
// first append's mod_l would flush into the DOM after a subsequent replaceWith
// had already run on the (still-orphan) reference, leaving the stale element
// visible while aa.el pointed at a detached one.
aa.mod.append =mod_l=>
{
  if (aa.mod_l)
  {
    // insert alphabetically
    const last = [...aa.mod_l.children]
      .find(i=> mod_l.dataset.id < i.dataset.id) || null;
    sift.move(mod_l, last, aa.mod_l);
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
  if (mod && mod.o && mod.o.id)
  {
    await aa.db.ops('idb', {put:{store:'stuff',a:[mod.o]}});
  }
  return mod;
};


// save mod time out
aa.mod.save_to =async mod=>
{
  debt.add(()=>{aa.mod.save(mod)},200,`mod_save_${mod.def.id}`)
};


// update mod item element
aa.mod.ui =(mod,keys,on_done)=>
{
  let ul = mod.mod_ul;
  if (!ul) return;

  if (keys && !Array.isArray(keys)) keys = [keys];

  let i = 0;
  const step =()=>
  {
    // mod was rebuilt (aa.mod.mk called again) — our ul is stale, abort
    if (mod.mod_ul !== ul) return;

    let end = Math.min(i + 5, keys.length);
    while (i < end)
    {
      let k = keys[i++];
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
    if (i < keys.length) requestAnimationFrame(step);
    else
    {
      if (on_done) on_done();
      mod.on_ui?.();
    }
  };
  requestAnimationFrame(step);

  if (ul.classList.contains('empty'))
  {
    ul.classList.remove('empty');
    ul.parentElement?.classList.remove('empty');
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