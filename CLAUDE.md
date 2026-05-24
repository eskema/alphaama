# Alphaama (A<3)

A minimalistic Nostr client in vanilla JS. Built for the author first, no compromises for user acquisition. Exposes the protocol rather than abstracting it.

- **Stable**: alphaama.com
- **Dev/WIP**: wip.alphaama.com (tracks repo, may have breaking changes)

## Philosophy

- Vanilla JS by design: no build step for the app itself. Learning the language deeply matters more than convenience.
- Dependencies are vendored in `dep/` as pre-built bundles. Only things that don't make sense to reimplement (crypto, protocol tooling, streaming, ratchet, OPFS store).
- Slow ES module migration: most code still hangs off the global `aa.*` namespace. `aa/regex.js`, `o/o.js`, `b/b.js`, and `av/av.js` are the only true ES modules so far.

## Conventions

- **snake_case** everywhere
- Opening brace on its own line (Allman style):
  ```js
  function foo()
  {
    // ...
  }
  ```
- Short module/directory names mirror Nostr single-letter tags (e, p, q, r, m, d, b, w) — less typing, shorter URLs
- Funny/weird names are intentional. Examples: `caralho` (home button — Portuguese for "go fuck yourself"), `tits` (title-and-state setter in `aa/view.js`), `yolo` (sign+mine+broadcast button in drafts), `dickbutt` (placeholder state text)
- Service worker file is `cash.js` at the repo root
- CLI prefix is `.` (was `.aa` historically — see commit d4d1fc6)

## Architecture

Everything hangs off a single global `aa` object. Each module extends it. Inter-module communication increasingly goes through a small **event bus** (`aa.bus`) and a **readiness gate** system (`aa.mod.ready` / `aa.mod.fire_ready`) instead of direct calls — both are framework-level facilities introduced to break circular deps and replace timing-based delays.

### Modules

| Dir | Namespace | Loaded as | What | Key files |
|-----|-----------|-----------|------|-----------|
| `aa/` | `aa.*` | scripts | Core framework: init, element registry (Map), utilities, event bus, readiness, log, view, mod loader | aa.js, bus.js, mk.js, mod.js, view.js, clk.js, log.js, parse.js, regex.js (ESM), wakelock.js, fx/ (array, color, dom, nostr, string, tags, time, util, validate) |
| `cli/` | `aa.cli` | mod | CLI input (`.` prefix, customizable), command parsing, history, autocomplete, `&&` chaining, `\|` piping | cli.js |
| `o/` | `aa.o` | mod (esm) | Options w/ Proxy-backed session overrides over localStorage (`o ss`), cross-tab sync via storage events | o.js |
| `e/` | `aa.e` | mod | Events: creation, signing, rendering, threading, orphan handling, mute system, draft editor, analytics | e.js, kinds.js, printer.js, render.js, parse.js, mk.js, miss.js, miner.js, db.js, fx.js, clk.js, anal.js, views.js |
| `p/` | `aa.p` | mod | Profiles: metadata, follows/followers, Web-of-Trust scoring, NIP-05, relay hints | p.js, mk.js, clk.js, view.js |
| `q/` | `aa.q` | mod | Queries: filter templates, variable expansion, subscriptions, outbox, NIP-A7 spells, URL-driven views | q.js, spells.js, views.js |
| `r/` | `aa.r` | mod | Relays: WebSocket mgmt via worker, scoring, batching, outbox model, NIP-42 auth, progressive backoff | r.js, manager.js (worker), msg.js, fx.js, mk.js |
| `u/` | `aa.u` | mod | User: auth, **signer abstraction** (NIP-07 + NIP-46 unified), bootstrap, decrypt cache, variable system | u.js |
| `m/` | `aa.m` | mod | NIP-17 gift-wrap DMs (rumor/seal/wrap, kind 1059) | m.js, mk.js, clk.js, view.js |
| `d/` | `aa.d` | mod | Double Ratchet DMs (Signal-style, vendored from mmalmi's nostr-double-ratchet) | d.js, mk.js, view.js |
| `b/` | `b` (esm default) | mod (esm) | Blossom: kind 24242 auth, kind 10063 server lists, BUD-01..06 | b.js, mk.js, kinds.js |
| `w/` | `aa.w` | mod | walLNut: zaps (NIP-57), NWC (NIP-47), Cashu (NIP-60/61) with AES-GCM proof vault. **Experimental** | w.js, mk.js, clk.js, fx.js, kinds.js |
| `h/` | `aa.h` | mod (esm) | Help — renders all module READMEs in a unified view; nav auto-built from modules with a prefetched `mod.readme` | h.js |
| `db/` | `aa.db` | scripts | DB orchestration: persistent IDB worker, request_id tracking, service-worker registration | db.js, idb.js, sdb.js |
| `av/` | — | dynamic ESM | Audio/video player; loaded inline by `aa.load`, exposes only `aa.mk.av` and `aa.fx.generate_waveform` | av.js |

Mod load order in `aa/aa.js`: `cli, o, p, e, m, r, q, u, b, w, d, h`. Order matters — later modules can depend on earlier ones being loaded. `o`, `b`, and `h` are loaded as ESM via `import()`; the rest are script tags.

### Module file convention

Modules typically have some subset of:
- `X.js` — core logic + `load()` init
- `mk.js` — DOM element creators (factories)
- `clk.js` — click handlers
- `fx.js` — utility functions
- `kinds.js` — Nostr event kind-specific handlers
- `view.js` / `views.js` — URL hash view handlers
- `README.adoc` — module docs (each module has one)

Vary in practice: `e/` is the biggest with 14 files; `b/` and `d/` are leaner.

### Supporting code

| Dir/File | What |
|----------|------|
| `scripts/make.js` | Element factory `make(tag, options)` |
| `scripts/sift.js` | Filtering, sorting, pagination engine. Supports keyword filters (`kind:1 by:alice text`) — see `sift.matchers` |
| `scripts/parse.js` | Markdown/text content parser |
| `scripts/debt.js` | Debounce/timeout manager (`debt.add(fn, ms, key)`) |
| `dep/` | Vendored libs (pre-built bundles): nostr-tools, fastdom, qrcode, redstore (WASM/OPFS), redstore-worker, ratchet, cashu-ts, hls, webtorrent, math, blurhash, bolt11, asciidoctor |
| `ma/` | Standalone tools: PoW miner, note builder, filter builder, ratchet test harness, ws_test |
| `stuff/` | Static assets (logos, favicons, font, images) |
| `cash.js` | Service worker (root, registered from `db/db.js`) |

## Key Data Flows

### Startup
```
index.html → aa.js loads deps/scripts/modules → index.js build_page()
→ u.setup() → q.stuff() (or u.on_load_sub on reload) → r.send_req()
→ events arrive → e.print()
```

### Event creation
```
CLI input → cli.exe() → e.draft() → e.sign() (via aa.signer)
→ e.finalize() → r.send_event() → relays
```

### Incoming events
```
Relay WS → r/manager.js worker (batches via microtask)
→ postMessage → r.on_event → bus 'e:print_q' → kind handler → DOM
```

### Query bootstrap (`q.stuff`)
Staged pipeline gated on readiness signals (no more hardcoded delays):
```
1   your k10002 (relay list)         — wait('u:k10002')
2a  your k0 + k3 on your relays      — wait('u:k0') + wait('u:follows')
2b  your other list kinds (background) — kinds 10000–10063
3   follows' k10002                   — needed for stage 4 outbox routing
4   follows' k0/k3/k10050 via outbox  — fans out per-relay queries
finalize → fire_ready('u:ready') so non-critical modules (d, etc.) can start
```

On normal reload (not first-time setup), `aa.u.on_load_sub` runs whatever's in `o.on_load_sub` (default `'a + b out'`) instead of the full `q.stuff` pipeline.

## Key Design Decisions

### Event bus (aa/bus.js)
`aa.bus.on/emit` for fire-and-forget; `aa.bus.provide/request` for synchronous data. Used to break circular dependencies (`r → e:get`, `r → e:sign`, `q → cli:value`, `e → cli:dismiss`, `u → u:pubkey`, `db → db:save`). New cross-module calls should prefer the bus over direct `aa.foo.bar()`.

### Module readiness (aa/mod.js)
`aa.mod.ready(key, fn)` — register callback, runs immediately if key already fired. `aa.mod.fire_ready(key)` — flush. Replaces the old timing-based bootstrap. Common keys: `r:manager`, `r:ui`, `u:pubkey`, `u:k0`, `u:k10002`, `u:follows`, `u:ready`, `page:ready`, `<mod_id>:ui`.

### Help system (h/)
The `h` module renders every module's README from one place. Nav is auto-built from any mod with a `mod.readme` field; `aa.mod.help_setup` (called from inside `aa.mod.load`) prefetches each module's README into `mod.readme` and registers two CLI aliases per module: `[help, <mod.name>]` and `[<mod.def.id>, help]`. Both route to `aa.view.state('#help_<slug>')`.

Three things to know when adding or changing a module:
- **`mod.name` is user-facing** — it's the slug in `#help_<name>` URLs and the header label in the side panel. Use a readable name (`'profiles'`, `'messages'`, `'double_ratchet'`), not the single-letter id. The single letter is `mod.def.id`.
- **`no_help_butt: true`** opts the mod out of the per-section `?` button (used by `h` itself to avoid pointing back at help from help).
- **Modules without a README are auto-skipped** from h's nav. `cli/` deliberately has none; if you add a new mod and don't want it in help, just don't write a README.

Routes registered: `.help` (all readmes), `.help <modname>` (one), `.<modid> help` (one, reverse form). `h.resolve(s)` accepts both id and friendly name so `.help p` and `.help profiles` both work.

### Signer abstraction (u/u.js)
`aa.signer.{signEvent,nip04,nip44,getPublicKey}` routes to either `window.nostr` (NIP-07) or a `BunkerSigner` (NIP-46). Bunker config persists in `aa.u.o.signer` and reconnects on reload. All signing should go through this — never call `window.nostr.*` directly.

### Decrypt cache (u/u.js)
`aa.u.decrypt_cache` stores decrypted event bodies and per-conversation private keys. Persistent layer is NIP-44-encrypted blob in IDB; sessionStorage holds plaintext copy for fast access. Has a `fail` marker so failed decrypts aren't retried each session.

### Mute system (e/e.js)
Per-pubkey muting with optional kind scoping. `aa.e.o.ls.muted[pubkey] = []` mutes all kinds; `[1, 6]` mutes only those kinds. CLI: `e mute <pubkey> [kinds...]` / `e unmute`. Sweeps already-printed notes on toggle.

### DB workers (persistent)
Event storage uses RedEventStore (`@nostr/gadgets/redstore`) — WASM-backed via OPFS. The manager worker spawns a nested module worker (`dep/redstore-worker.js`) that owns the WASM/OPFS file handle. Leader election via BroadcastChannel ensures only one tab writes. Old IndexedDB store code is commented out in `r/manager.js` for rollback. Request tracking in `db/db.js` uses incrementing `request_id` matched to pending Promise resolvers (6.6s timeout).

### Relay scoring (0–100)
Born from real-world unreliability: users put bad relays in their kind-10002 lists, and the outbox model needs to choose which to actually use. Baseline 100, -20/termination with 24h decay, error-rate × 30 down, success-rate × 20 up. No-history relays get 50. Reset via `r score_reset [url]`. Progressive backoff layered on top — `retry_after` / `retry_backoff` skip relays during backoff windows.

### Outbox model
When querying for specific authors, use *their* declared relays (kind-10002), not yours. Authors grouped by relay for efficient batching. Capped at `localStorage.outbox_max` (default 3). Pubkeys with no k10002 fall into a `none` bucket appended to all selected relays. Read relays always added so they're asked for everything regardless. Generalized for `authors`, `#p`, and `#P` filters.

### `q sub` resumption
Subscriptions track `created_at` of last received event in `aa.q.o.subs[fid_sub]`. Next sub starts from `last + 1`. Avoids duplicate downloads across sessions.

### `q view` (URL-driven queries)
Saves filters as URL hash + search params: `#req?req=<fid>&kinds=1,6&p=u&relays=read`. Single-letter param keys auto-convert to `#tag` filters. Persisted to `aa.q.o.reqs`. See `q/views.js`.

### NIP-A7 spells (q/spells.js)
Kind 777 events that encode a query filter as portable Nostr events. Variable substitution: `$me` ↔ `u`, `$contacts` ↔ `k3`. Time tokens: `1d` ↔ `n_1`, `12h` ↔ `h_12`. Bidirectional (`spell_filter` and `filter_to_spell`). CLI: `k 777 <fid>` builds and broadcasts; receiving renders an "import spell" button via the registered render fn.

### Trust scoring
Manual score (0–9+). Controls media embedding (images/video/audio shown as links for untrusted authors). Logged-in user is hardcoded to score=9 in `aa.u.load_u`. Threshold configurable via `o score`. CLI: `p score <npub> <n>`.

### DOM performance
All DOM mutations batched via `fastdom.mutate()`. Lazy rendering via IntersectionObserver in `e/printer.js` (90% threshold). `debt.js` for debouncing. `sift.js` for filter-by-CSS-class. Note observers track section growth for pagination class toggling.

### Variable system
Query filters use shortcuts: `"u"` = your pubkey, `"k3"` = your follows. Time shortcuts: `"n_7"` = 7 days ago, `"h_12"` = 12 hours, `"d_<date>"` = specific date. Custom variables via `u add <key> <value>`.

### Telemetry-driven debugging
Recurring "read/write set vanished from a relay" mystery has live instrumentation: the `aa.r.r` getter logs once if all relays lose their `read` set, and `aa.r.setrm` traces the stack on read/write removal. Don't strip these — they're catching it.

## Storage Strategy

- **localStorage**: Options only — user preferences managed via `o/` (`theme`, `score`, `pow`, `pagination`, `ns`, `outbox_max`, `cash`, `ext_*`, etc.). Survive reloads, shared across tabs. Never use localStorage for arbitrary app state — module persistent state belongs in IDB via `aa.mod.save`.
- **sessionStorage**: Tab-specific UI state (expanded sections, active queries, last query, decrypt cache plaintext mirror)
- **OPFS (RedEventStore)**: Persistent event storage via WASM. Replaces IndexedDB for events
- **IndexedDB**: Module persistent state (the `stuff` store keyed by mod id), wallnut vault blob, encrypted decrypt cache blob
- **Memory Maps**: Session cache (events in `aa.em`/`aa.em_a`, profiles in `aa.db.p`, printed elements in `aa.e.printed`)

## Database

### RedEventStore (current)
WASM/OPFS-backed via `@nostr/gadgets/redstore`. Bundled in `dep/` as three files: `redstore.js` (IIFE), `redstore-worker.js` (ESM nested worker), `gadgets_redstore_bg.wasm`. API: `queryEvents(filter)`, `saveEvent(event)`, `deleteEvents(ids)`, `loadReplaceables(specs)`.

### IndexedDB (legacy + module storage)
Old event-store schema is commented out in `r/manager.js`. Active IDB usage:
- **stuff** store: keyPath `id`, holds module persistent state keyed by mod id (`r`, `e`, `q`, `u`, `m`, `d`, etc.)
- Wallnut vault: AES-GCM encrypted proofs blob (sidesteps NIP-44 size limits)
- Decrypt cache: NIP-44 encrypted JSON blob

Storage policy: always store user's events; store follows' events for kinds 0, 3, 10002, 10019, 17375.

## Nostr NIPs Used

- NIP-01: Basic protocol (events, subs, filters)
- NIP-04: Encrypted DMs (legacy, displayed but new ones go via NIP-17)
- NIP-05: Login lookup (`name@domain`)
- NIP-07: Browser extension signing
- NIP-09: Event deletion (`kind 5`)
- NIP-10: Reply threading
- NIP-11: Relay information document
- NIP-13: Proof of work (miner worker, `e pow`)
- NIP-17: Private DMs via gift wrap (rumor / seal / wrap, kinds 14/13/1059) — implemented in `m/`
- NIP-19: Bech32 encoding (npub, note, nevent, naddr, nprofile)
- NIP-42: Relay authentication
- NIP-44: Encrypted content
- NIP-46: Remote signing (bunker://, via `aa.signer`)
- NIP-47: NWC — outbound zaps in `w/`
- NIP-50: Search (`r s <query>`, kind-aware via NIP-50 search relay set)
- NIP-51: Lists — mute (10000), pin (10001), bookmarks (10003), blocked relays (10006), search relays (10007)
- NIP-57: Zaps (read + send via `w zap`)
- NIP-59: Gift wrap timestamp randomization (0–48h past)
- NIP-60/61: Cashu + nutzaps (kinds 7375/7376/9321/10019/17375)
- NIP-A7: Spell events (kind 777) — `q/spells.js`
- NIP-B7 / Blossom: media servers (kinds 24242 auth, 10063 server list)
- Double Ratchet DMs (vendored, not yet a finalized NIP — wire format v1, kinds 1060 message / 30078 invite / 1059 invite response)

## walLNut — Experimental

Cashu ecash. Has been a forcing function for architectural improvements (vault, signer abstraction, decrypt cache) but is unfinished. Not core to alphaama's identity.

- **Vault**: AES-GCM encrypted proofs blob in IDB; the AES key lives in `decrypt_cache._data.keys`. Bypasses NIP-44 size limits for big proof bags.
- **NWC fallback**: when Cashu auto-melt fails, wallnut falls back to NIP-47 NWC for outbound payments, then to a manual dialog.
- **Sync**: pulls replaceable wallnut config (17375), proof events (7375), nutzaps (9321) and dedupes by proof secret. Tracks redeemable/redeemed sets.
- **Send-zap is functional** (`w zap <amount> <pubkey> [memo] [event_id]`). Read-only zap rendering also handled in `e/render.js`.
- Cashu lib is `cashu-ts` (vendored as `w/cashu-ts.iife.js`, also in `dep/`).

## DMs: m vs d

Two separate modules with two protocols, sharing the same chat UI shell (`aa.mk.chat_list`):

- **`m/` — NIP-17 gift wrap.** Stateless after decrypt: ECDH derives the conversation key, decrypted bodies cached in `decrypt_cache`. Pending (undecrypted) wraps persisted across sessions. Timestamps randomized 0–48h into the past on send.
- **`d/` — Double Ratchet.** Stateful: each peer has a serialized ratchet state in `aa.d.o.sessions`. Forward secrecy and post-compromise recovery. Append-only audit log in `aa.d.o.log`. Export/import history with `d export <peer>` / `d import <peer> <blob>` for state recovery. Invite flow: `d invite` → ship URL → peer `d join <url>` → adopt-or-merge confirm dialog if a session already exists.

Identity binding happens at session setup; per-message encryption uses derived ratchet keys, not your nostr signer — so no signer prompt per send.

## When Working on This Codebase

- Respect the vanilla JS approach. Don't suggest frameworks or build tools for the app; the `dep/` files are pre-built bundles.
- Use snake_case. Allman braces (opening brace on new line).
- Keep the `aa.*` global namespace pattern (until ES module migration happens).
- Modules are loaded dynamically — order matters in `aa.js` `mods` and `scripts` arrays.
- Cross-module communication: prefer `aa.bus.emit` / `aa.bus.provide` over direct calls. Prefer `aa.mod.ready('<key>', fn)` over timed delays.
- Signer access: always go through `aa.signer`, never `window.nostr` directly.
- DOM mutations: batch via `fastdom.mutate()`. Long-running work: spread via `debt.add(fn, ms, key)`.
- Save mod state: `aa.mod.save(mod)` writes to IDB via the persistent worker. Use `aa.mod.save_to(mod)` for debounced saves.
- New CLI commands: register via `aa.actions.push({action:[id,subcmd], required:[...], optional:[...], description, exe})` inside `<mod>.load`.
- Adding a new module: write a `README.adoc` (it'll show up in `h` automatically), give the mod a readable `name` (not the single-letter id — that's `def.id`), and don't call `aa.mod.help_setup` manually — `aa.mod.load` handles it. Set `no_help_butt: true` if the mod shouldn't have a `?` button on its section header.
- Test by serving locally and checking browser console. No test framework.
- Short, descriptive commit messages focused on what changed. Recent style is "Add X, fix Y, …" or "Refactor Z".
- When asked for a commit message: check the diff, bump `aa_version` in `aa/aa.js` if the changes are user-facing (any deployable code or asset; pure docs / READMEs don't need it), produce a short message in the recent style. Don't commit. Don't mention Claude. Keep it general — top-level themes, not a per-file changelog.

## Things to Know About

- `aa_version` (in `aa/aa.js`) is bumped on releases for cache-busting. Currently 86.
- The CLI prefix is stored in `localStorage.ns`. Commands are chained with `&&`; only the *first* segment carries the prefix (`.cmd_a && cmd_b`) — `aa.cli.exe` strips it once from the start and splits the remainder on ` && `. `aa.cmd(s)` prepends the prefix.
- Funny-name grep: `caralho`, `tits`, `yolo`, `dickbutt` are intentional. Don't rename them.
- Outbox connection batching: 20 connections per batch with ~3-second gaps to work around Chrome/Brave's ~28-handshake cap on concurrent WebSockets.
- NIP-46 connect: bunker:// URLs are parsed via `NostrTools.nip46.parseBunkerInput`. The signer reconnects across reloads from `aa.u.o.signer`.
- Service worker (`cash.js`) handles offline cache. Disable via `o add cash off`.
