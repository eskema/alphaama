# Alphaama (A<3)

A minimalistic Nostr client in vanilla JS. Built for the author first, no compromises for user acquisition. Exposes the protocol rather than abstracting it.

- **Stable**: alphaama.com
- **Dev/WIP**: wip.alphaama.com (tracks repo, may have breaking changes)

## Philosophy

- Vanilla JS by design: no frameworks, no build step for the app. Learning the language deeply matters more than convenience.
- Dependencies are vendored in `dep/` and pre-bundled via esbuild (from `_local/`). Only things that don't make sense to reimplement (crypto, protocol tooling, streaming).
- Future goal: migrate from global `aa.*` namespace to proper ES modules for better compartmentalization. `aa/regex.js` is the first ES module.

## Conventions

- **snake_case** everywhere
- Opening brace on its own line (not same-line):
  ```js
  function foo()
  {
    // ...
  }
  ```
- Short module/directory names mirror Nostr single-letter tags (e, p, q, r) - less typing, shorter URLs
- Funny/weird names are intentional but can be confusing. Examples: `caralho` (home button), `tits` (title/state update), `yolo` (sign+mine+broadcast)

## Architecture

Everything hangs off a single global `aa` object. Each module extends it.

### Modules

| Dir | Namespace | What | Key files |
|-----|-----------|------|-----------|
| `aa/` | `aa.*` | Core framework, init, element registry (Map), utilities | aa.js, mk.js, fx/ (array, string, color, time, nostr, tags, validate, dom, util), clk.js, view.js, mod.js, log.js |
| `cli/` | `aa.cli` | CLI input (`.` prefix, customizable), command parsing, history, autocomplete | cli.js, mk.js |
| `e/` | `aa.e` | Events: creation, signing, rendering, threading, orphan handling | e.js, kinds.js, printer.js, render.js, parse.js, mk.js, miss.js, miner.js |
| `p/` | `aa.p` | Profiles: metadata, follows/followers, Web-of-Trust, relay hints | p.js, mk.js, clk.js, view.js |
| `q/` | `aa.q` | Queries: filter templates, variable expansion, subscriptions, outbox | q.js |
| `r/` | `aa.r` | Relays: WebSocket mgmt via worker, scoring, batching, outbox model | r.js, manager.js (worker), msg.js, fx.js |
| `u/` | `aa.u` | User: auth (NIP-07), setup, variable system (`u`, `k3`) | u.js |
| `w/` | `aa.w` | Wallet (walLNut): Cashu ecash, mints, proofs. **Experimental/unfinished** | w.js, mk.js, kinds.js |
| `db/` | `aa.db` | Database: RedEventStore (WASM/OPFS via `@nostr/gadgets/redstore`) + Cache. Migrating from IndexedDB | db.js, cash.js (service worker) |
| `o/` | `aa.o` | Options: localStorage settings (theme, pow, score, pagination) | o.js |
| `av/` | — | Audio/video player | av.js |

### Module file convention

Each module typically has:
- `X.js` — core logic + `load()` init
- `mk.js` — DOM element creators
- `clk.js` — click handlers
- `fx.js` — utility functions
- `kinds.js` — Nostr event kind-specific handlers
- `views.js` — URL hash view handlers
- `README.adoc` — module docs

### Supporting code

| Dir/File | What |
|----------|------|
| `scripts/make.js` | Element factory (`make(tag, options)`) |
| `scripts/sift.js` | Filtering, sorting, pagination engine |
| `scripts/parse.js` | Markdown/text content parser |
| `scripts/debt.js` | Debounce/timeout manager |
| `dep/` | Vendored libs: nostr-tools, fastdom, cashu, bolt11, hls, qrcode, webtorrent, math, store |
| `_local/` | Build scripts, experiments, local dev. Not deployed. |
| `ma/` | Standalone tools: PoW miner, note builder, filter builder |
| `stuff/` | Static assets |

## Key Data Flows

### Startup
```
index.html → aa.js loads deps/scripts/modules → index.js build_page()
→ u.setup() → q.stuff() → r.send_req() → events arrive → e.print()
```

### Event creation
```
CLI input → cli.exe() → e.draft() → e.sign() (NIP-07)
→ e.finalize() → r.send_event() → relays
```

### Incoming events
```
Relay WS → r/manager.js worker (batches via microtask)
→ postMessage → r.on_event → e.print_q() → kind handler → DOM
```

### Query bootstrap (q.stuff)
```
Phase 1: Your profile (kinds 0,3,10002) on your relays
Phase 2: Retry with more relays (420ms delay)
Phase 3: Follows' profiles (666ms delay)
Phase 4: Follows via outbox model (999ms delay)
```

## Key Design Decisions

### DB workers (persistent)
Event storage uses RedEventStore (`@nostr/gadgets/redstore`) — a WASM-backed store using OPFS (Origin Private File System). The manager worker spawns a nested module worker (`dep/redstore-worker.js`) that owns the WASM/OPFS file handle. Leader election via BroadcastChannel ensures only one tab writes. Old IndexedDB store (`store.IDBEventStore`) code is commented out in `r/manager.js` for rollback.

### Relay scoring (0-100)
Born from real-world unreliability: users put bad relays in their kind-10002 lists, and the outbox model needs to choose which to actually use. Scores based on terminations (-20 each, 24h decay), error rates, success rates. No-history relays get 50.

### Outbox model
When querying for specific authors, use *their* declared relays (kind-10002), not yours. Authors grouped by relay for efficient batching. Relay scoring filters out unreliable ones.

### `q sub` resumption
Subscriptions track `created_at` of last received event. Next sub starts from `last + 1`. Avoids duplicate downloads across sessions.

### Trust scoring
Manual score (0-9+). Controls media embedding (images/video/audio shown as links for untrusted authors). Logged-in user gets score=9. Threshold configurable via `o score`.

### DOM performance
All DOM mutations batched via `fastdom.mutate()`. Lazy rendering via IntersectionObserver. `debt.js` for debouncing. `sift.js` for filtering with CSS class toggling.

### Variable system
Query filters use shortcuts: `"u"` = your pubkey, `"k3"` = your follows. Time shortcuts: `"n_7"` = 7 days ago, `"h_12"` = 12 hours. Custom variables via `u add`.

## Storage Strategy

- **localStorage**: User preferences that survive reloads (options, relay sets, user pubkey/variables)
- **sessionStorage**: Tab-specific UI state (expand/collapse, active queries, last query)
- **OPFS (RedEventStore)**: Persistent event storage via WASM. Replaces IndexedDB for events (migration in progress)
- **Memory Maps**: Session cache (events in `aa.e.em`/`aa.e.em_a`, profiles in `aa.p`, printed elements in `aa.e.printed`)

## Database

### RedEventStore (current)
WASM/OPFS-backed via `@nostr/gadgets/redstore`. Bundled in `dep/` as three files: `redstore.js` (IIFE, main class), `redstore-worker.js` (ESM, nested worker), `gadgets_redstore_bg.wasm`. API: `queryEvents(filter)` returns `Promise<Array>`, `saveEvent(event)`, `deleteEvents(ids)`, `loadReplaceables(specs)`. Rebuild via `npm run redstore` in `_local/`.

### IndexedDB (legacy, commented out)
Old schema ("alphaama", v16):
- **events**: keyPath `event.id`, indexes: pubkey, kind, created_at, refs (multiEntry), id_a
- **authors**: keyPath `pubkey`, indexes: npub (unique), name, nip05
- **stuff**: keyPath `id` (general module data)

Storage policy: always store user's events, store follows' events for kinds 0, 3, 10002, 10019, 17375.

## Nostr NIPs Used

- NIP-01: Basic protocol (events, subs, filters)
- NIP-04: Encrypted DMs (kind 4, deprecated but supported)
- NIP-07: Browser extension signing (window.nostr)
- NIP-10: Reply threading (e-tags with root/reply markers)
- NIP-11: Relay information document
- NIP-13: Proof of work (miner worker)
- NIP-19: Bech32 encoding (npub, note, nevent, naddr, nprofile)
- NIP-42: Relay authentication
- NIP-44: Encrypted content (wallet events)
- NIP-46: Remote signing (planned, not yet implemented)
- NIP-57: Zaps (read-only — displays zap events, no sending yet)
- NIP-60/61: Cashu wallet (kinds 7375, 9321, 10019, 17375)

## Wallet (walLNut) — Experimental

Cashu ecash wallet. Has been a forcing function for architectural improvements but is unfinished. Not core to alphaama's identity. Key kinds: 7375 (proofs), 9321 (nutzap), 10019 (wallet discovery), 17375 (wallet backup). Uses cashu-ts library.

## When Working on This Codebase

- Respect the vanilla JS approach. Don't suggest frameworks or build tools.
- Use snake_case. Opening brace on new line.
- Keep the `aa.*` global namespace pattern (until ES module migration happens).
- Modules are loaded dynamically — order matters in `aa.js` mods/scripts arrays.
- Test by serving locally and checking browser console. No test framework.
- Short, descriptive commit messages focused on what changed.
