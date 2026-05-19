# @versemate/visuals

Per-book visual aids for the VerseMate Bible reading apps — BibleProject _Read Scripture_ posters, BibleProject animated overview videos (chapter-aware), Precept Austin commentary charts (book- and chapter-scoped), Insight for Living's Swindoll structural charts, and VerseMate originals.

Single source of truth, shared by **[verse-mate-web](https://github.com/verse-mate/verse-mate-web)** (Vite SPA) and **[verse-mate-mobile](https://github.com/verse-mate/verse-mate-mobile)** (Expo React Native).

> ⚠️ **Generated package — do not edit `src/registry.ts` by hand.** The registry is produced by [`scripts/visuals-ingest/build_manifests.py`](https://github.com/verse-mate/verse-mate-web/blob/main/scripts/visuals-ingest/build_manifests.py) in verse-mate-web. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the regeneration workflow.

## Coverage

- **66 books** (all canonical OT + NT)
- **~2,000 curated images** after audit + cross-book MD5 dedup
- All Precept Austin charts attributed CC BY-SA 4.0 (BibleProject) / "Insight for Living Ministries" (Swindoll)

## Exports

| Export | Type | What it does |
|---|---|---|
| `VISUALS_REGISTRY` | `Record<string, VisualsManifest>` | Full per-book manifest, keyed by URL slug (`'genesis'`, `'song-of-solomon'`) |
| `BOOKS_WITH_VISUALS` | `ReadonlySet<string>` | Slug set for tab-visibility gating — importable without pulling in the full registry |
| `getVisualsForBook(slug)` | `(slug: string) => VisualsManifest \| null` | Lookup helper, case-insensitive slug |
| `getCardsForChapter(manifest, chapter)` | `(m, c) => VisualCard[]` | Filters cards to a specific chapter (book-level cards always pass; chapter-scoped Precept charts only show on their chapters) |
| `getVideoForChapter(manifest, chapter)` | `(m, c) => VideoEntry \| null` | Picks the BibleProject overview whose `chapterStart`/`chapterEnd` covers the current chapter (e.g. Genesis 5 → Part 1, Genesis 25 → Part 2) |
| `absolutizeVisualUrl(path, origin?)` | `(string, string?) => string` | Turns a root-relative registry path into a fully-qualified URL. Idempotent. Mobile uses this; web doesn't need to. |
| `VISUALS_ORIGIN` | `string` | Default origin (`https://app.versemate.org`) used by `absolutizeVisualUrl` when no override is passed |

Types: `VisualCard`, `VideoEntry`, `VisualsManifest` (also re-exported from `./types`).

## Tech stack

| Tool | Why |
|---|---|
| TypeScript (ES2022, Bundler module resolution) | Single-file TS module, tree-shaken by both Vite and Metro |
| No runtime dependencies | Pure data + helpers; consumers bring their own image/video infra |
| No build step | TS source is the published artifact (matches `@versemate/studies`) |

## Project structure

```
.
├── src/
│   ├── types.ts         # VisualCard / VideoEntry / VisualsManifest
│   ├── index.ts         # Public API + lookup helpers + URL absolutizer
│   └── registry.ts      # GENERATED — 66 books × ~2,000 cards (~514 KB)
├── package.json         # @versemate/visuals@0.1.0, private, TS-source main
├── tsconfig.json        # strict, ES2022, Bundler resolution
├── README.md
├── CONTRIBUTING.md      # Regeneration workflow
└── CHANGELOG.md
```

## Getting started

### Consuming the package

```sh
# Web (already wired)
# Web reads its own local src/data/visuals/registry.ts — no install needed.

# Mobile
cd verse-mate-mobile
bun install   # picks up "@versemate/visuals": "github:verse-mate/verse-mate-visuals#<sha>"
```

### Using the API

```ts
import {
  getVisualsForBook,
  getCardsForChapter,
  getVideoForChapter,
  absolutizeVisualUrl,
  BOOKS_WITH_VISUALS,
} from '@versemate/visuals';

// Tab-visibility gate — keeps the registry off the critical render path.
if (BOOKS_WITH_VISUALS.has(slug)) {
  // show Visuals tab
}

const manifest = getVisualsForBook('genesis');   // null if no entry
const cards   = getCardsForChapter(manifest, 1); // book-level + ch.1-scoped
const video   = getVideoForChapter(manifest, 1); // BibleProject overview for ch.1

// React Native: prefix root-relative paths before <Image source={{ uri }} />
const uri = absolutizeVisualUrl(cards[0].thumb);
// → https://app.versemate.org/visuals/genesis/precept_chapter_1.png

// Override origin for staging
const stagingUri = absolutizeVisualUrl(cards[0].thumb, 'https://staging.versemate.org');
```

## Path convention

Image URLs in the registry are **root-relative** (`/visuals/<slug>/<file>`). The web app serves them directly from its `public/` directory. Mobile prefixes them with `VISUALS_ORIGIN` via `absolutizeVisualUrl()` at render time.

This keeps a single source of truth and lets the web app's CDN remain canonical for both clients.

## How updates flow

```
verse-mate-web/public/visuals/<slug>/*
                │
                │ probe + curate + ingest + dedup
                ▼
verse-mate-web/scripts/visuals-ingest/build_manifests.py
                │
                ├──→ verse-mate-web/src/data/visuals/registry.ts        (web's local copy)
                ├──→ verse-mate-web/src/data/visuals/booksWithVisuals.ts (light slug-set)
                └──→ verse-mate-visuals/src/registry.ts                  (this package)
                          │
                          │ commit + push, bump SHA in mobile package.json
                          ▼
                  verse-mate-mobile (consumes via Metro)
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full regeneration workflow.

## Why a separate package?

Mirrors `@versemate/studies`: shared TypeScript data, two clients (web + mobile), tree-shaken by both bundlers, pinned by GitHub SHA so changes are explicit and reviewable. The registry is ~514 KB — small enough to ship as a single file with no per-chapter dynamic splitting (unlike Studies, which has to split per-chapter to stay under Cloudflare Workers' 25 MiB per-file limit at full coverage).

If the registry grows past a few MB, the natural next step is JSON + API-served fetches; the package's shape stays canonical regardless of transport.

## Related repos

- [verse-mate-web](https://github.com/verse-mate/verse-mate-web) — Vite SPA, owns the ingest pipeline
- [verse-mate-mobile](https://github.com/verse-mate/verse-mate-mobile) — Expo React Native app, consumes via Metro
- [verse-mate-studies](https://github.com/verse-mate/verse-mate-studies) — sibling pattern: same convention, different data (inductive Bible studies)

## License

Private — see consuming repos' license terms. Curated content credits:

- BibleProject Read Scripture posters + overview videos — CC BY-SA 4.0
- Precept Austin commentary charts — Bruce Hurt / Precept Ministries
- Swindoll structural charts — Insight for Living Ministries
- VerseMate originals — © VerseMate
