/*

alphaama
mod    h
help — navigate all module readmes from one place

minimal vertical slice: full ESM. side-panel section uses the standard
aa.mod.load + aa.mod.mk machinery so it gets data-mod, mod_about, and
the default mod_butts (incl. `?`) for free. main-view section renders
readmes as stacked aa.mk.doc(...) details — no-arg `help` shows all,
with-arg appends (or scrolls to existing). count reflects what's
actually printed in the main section.

cli surface:
  .help              — render every available readme    (#help)
  .help <modname>    — append that readme               (#help_<modid>)
  .<modid> help      — per-module reverse form          (#help_<modid>)

*/


const h =
{
  name: 'help',
  about: 'help index — navigate readmes for all modules in one place',
  def:
  {
    id: 'h',
    ls:{},
  },
  styles: ['/h/h.css'],
  // empty butts so aa.mod.butts() returns a real element (not undefined,
  // which mod_info.append would stringify into a literal 'undefined' text)
  butts: { init: [], mod: [] },
  // skip the default `?` help butt on h's section header — the canonical
  // entry point IS the h module, no need to point back at itself.
  no_help_butt: true,
};


// resolve a free-form string ("p", "profiles", "aa", "") to a known modid;
// returns null if nothing matches.
h.resolve =(s = '')=>
{
  const target = s.trim().toLowerCase();
  if (!target) return null;
  const ids = ['aa', ...aa.mods.map(m => m[0])];
  if (ids.includes(target)) return target;
  for (const id of ids)
  {
    const mod = id === 'aa' ? aa : aa[id];
    if (mod?.name?.toLowerCase() === target) return id;
  }
  return null
};


// list of [id, mod] pairs for every module that actually has a readme,
// in stable order: aa first, then mods array order.
const docs_available =()=>
{
  const out = [];
  const ids = ['aa', ...aa.mods.map(m => m[0])];
  for (const id of ids)
  {
    const mod = id === 'aa' ? aa : aa[id];
    if (mod?.readme) out.push([id, mod]);
  }
  return out
};


// build a fresh <details> for one module's readme. mk.doc hardcodes
// id=aa_read_me on its result; strip it so multiple per-module docs
// don't collide and don't pick up the readme grid-area.
//
// the summary acts as a view trigger: opening enters #help_<name>,
// collapsing returns to home (cleared view). _programmatic guards the
// initial open (and any open done by h.show) from firing a redundant
// view.state. URLs use the human-readable mod.name (e.g. 'profiles',
// 'events') with the short id as fallback.
const make_doc =(modid, mod)=>
{
  const doc = aa.mk.doc(mod.readme);
  if (!doc) return null;
  doc.removeAttribute('id');
  doc.dataset.hId = modid;
  const slug = mod.name || modid;

  doc.addEventListener('toggle', () =>
  {
    if (doc._programmatic) { doc._programmatic = false; return }
    if (doc.open) aa.view.state(`#help_${slug}`);
    else aa.view.state('');
  });

  doc._programmatic = true;
  doc.toggleAttribute('open', true);
  return doc
};


// fill the (empty) mod_ul that aa.mod.mk creates with one row per module
// that actually has a readme; modules without one (e.g. cli) are skipped.
// structure mirrors o's items (li > .key + .val) but uses .butt.exe so the
// click navigates immediately instead of staging a cli command.
const populate_nav =ul =>
{
  for (const [id, mod] of docs_available())
  {
    const item = make('li', {cla:'item h_item', dat:{id}});
    const butt = make('button',
    {
      cla: 'butt exe key',
      con: `${id} — ${mod.name || ''}`,
      clk: ()=> aa.view.state(`#help_${mod.name || id}`)
    });
    item.append(butt, ' ', make('span', {cla:'val', con:mod.about || ''}));
    ul.append(item);
  }
};


// build the main-view section that holds rendered readmes. body is a
// stack — h.show appends a fresh aa.mk.doc(...) per call (deduped).
const build_main_section =()=>
{
  const body = make('div', {cla:'h_body'});
  const section = aa.mk.section(
  {
    id: 'h',
    name: h.name,
    element: body,
    classes: 'h_view'
  });
  return { section, body }
};


// count = number of readmes currently printed in the main body. CSS gates
// the section header's visibility on this attr being present.
h.count_upd =()=>
{
  if (!h.main_butt) return;
  const count = h.body.children.length;
  if (count) h.main_butt.dataset.count = count;
  else delete h.main_butt.dataset.count;
};


// reflect which modids are present in the main body on the side-nav items
const refresh_active =()=>
{
  const present = new Set(
    [...h.body.querySelectorAll('[data-h-id]')].map(d => d.dataset.hId)
  );
  for (const it of h.mod_ul.querySelectorAll('.h_item'))
    it.classList.toggle('active', present.has(it.dataset.id));
};


// programmatically collapse every doc except `keep_modid`. _programmatic
// suppresses each one's toggle handler so they don't fire spurious
// aa.view.state('') calls (which, when URL is already empty, triggers
// history.back via aa.view.state's same-state check).
const close_others =keep_modid =>
{
  for (const doc of h.body.querySelectorAll('details[open]'))
  {
    if (doc.dataset.hId === keep_modid) continue;
    doc._programmatic = true;
    doc.toggleAttribute('open', false);
  }
};


// append a single module's readme (or scroll to it if already present).
// readme is fetched lazily for the rare case where prefetch missed it.
h.show =async modid =>
{
  const mod = modid === 'aa' ? aa : aa[modid];
  if (!mod) { aa.log(`h: no module "${modid}"`); return }

  if (!mod.readme)
  {
    const path = mod.readme_src || `/${modid}/README.adoc`;
    await aa.fx.readme(path, mod);
  }
  if (!mod.readme) { aa.log(`h: no readme found for ${modid}`); return }

  // already shown? re-open if collapsed and scroll, instead of duplicating.
  const existing = h.body.querySelector(`[data-h-id="${modid}"]`);
  if (existing)
  {
    fastdom.mutate(()=>
    {
      close_others(modid);
      if (!existing.open)
      {
        existing._programmatic = true;
        existing.toggleAttribute('open', true);
      }
      existing.scrollIntoView({block:'start'})
    });
    return
  }

  const doc = make_doc(modid, mod);
  if (!doc) return;
  fastdom.mutate(() =>
  {
    close_others(modid);
    h.body.append(doc);
    h.count_upd();
    refresh_active();
    doc.scrollIntoView({block:'start'});
  });
};


// render every available readme, replacing whatever's currently in the body.
// readmes are already prefetched into mod.readme by aa.mod.help_setup.
h.show_all =()=>
{
  const docs = docs_available()
    .map(([id, mod]) => make_doc(id, mod))
    .filter(Boolean);
  fastdom.mutate(() =>
  {
    h.body.replaceChildren(...docs);
    h.count_upd();
    refresh_active();
    h.main_section.scrollIntoView({block:'start'});
  });
};


h.load =async() =>
{
  // aa itself isn't a mod (no aa.mod.load call) so its readme isn't
  // prefetched by aa.mod.help_setup — fetch it here so the nav can include
  // it. also register `.help alphaama` directly since aa skips help_setup.
  await aa.fx.readme('/aa/README.adoc', aa);
  if (aa.readme)
  {
    aa.actions.push(
    {
      action:['help', aa.name],
      description:`help with ${aa.name} (aa)`,
      exe:()=> aa.view.state(`#help_${aa.name}`)
    });
  }

  // standard mod setup: idb load → ensures h.o.ls={}; help_setup is a noop
  // for h (skipped by id). aa.mod.mk builds the side-panel section with
  // the proper structure (data-mod, mod_about, mod_butts).
  await aa.mod.load(h);
  await aa.mod.mk(h);
  populate_nav(h.mod_ul);

  const { section: main_section, body } = build_main_section();
  h.main_section = main_section;
  h.body = body;
  h.main_butt = aa.el.get('butt_section_h');

  // persists in #view from page:ready onwards. hash navigation only toggles
  // the in_view class — the section never moves out of the DOM.
  aa.mod.ready('page:ready', () =>
  {
    const view = aa.el.get('view');
    if (view && !main_section.isConnected) view.append(main_section);
  });

  // generic `.help` exe — resolves the arg through h.resolve so id ('p')
  // and full name ('profiles') both work. URL canonicalises to the
  // readable `#help_<name>` form. per-module `.help <fullname>` and
  // `.<modid> help` aliases are registered by aa.mod.help_setup.
  aa.actions.push(
  {
    action: ['help'],
    optional: ['<mod>'],
    description: 'open help — no arg renders every readme; arg renders just that one',
    exe: (s = '') =>
    {
      const arg = s.trim();
      if (!arg) return aa.view.state('#help');
      const modid = h.resolve(arg);
      if (!modid) { aa.log(`h: no module "${arg}"`); return }
      const mod = modid === 'aa' ? aa : aa[modid];
      aa.view.state(`#help_${mod.name || modid}`)
    }
  });

  // on navigation away: drop view_h, and collapse every open doc so we
  // don't leave a stack of open <details> behind that would each fight the
  // toggle handler the next time they're touched.
  aa.view.clears.push(()=>
  {
    aa.l.classList.remove('view_h');
    close_others();
  });

  // #help renders the index (every readme); #help_<name> renders one.
  // <name> is resolved through h.resolve so both id ('p') and full name
  // ('profiles') survive a hard reload — the canonical form is the name.
  aa.view.ls.help =path =>
  {
    aa.mod.ready('page:ready', () =>
    {
      aa.view.active = path;
      const slug = path.startsWith('help_') ? path.slice(5) : '';
      const modid = slug ? h.resolve(slug) : null;

      fastdom.mutate(() =>
      {
        if (!main_section.classList.contains('expanded'))
          main_section.classList.add('expanded');
        main_section.classList.add('in_view');
        aa.view.in_view = main_section;
        aa.l.classList.add('viewing', 'view_h');
      });

      if (modid) h.show(modid);
      else h.show_all();
    });
  };
};


export default h;
