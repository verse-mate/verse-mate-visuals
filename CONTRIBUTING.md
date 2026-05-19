# Contributing

This repo is a **published data package** consumed by [verse-mate-web](https://github.com/verse-mate/verse-mate-web) and [verse-mate-mobile](https://github.com/verse-mate/verse-mate-mobile). The bulk of it (`src/registry.ts`, ~514 KB) is **generated** — don't edit it by hand.

## What changes go where

| You want to… | Edit | Then |
|---|---|---|
| Add or remove an image / chart for a book | `verse-mate-web/public/visuals/<slug>/` + ingest scripts | Re-run `build_manifests.py`, commit the regenerated `registry.ts` here, bump SHA in mobile |
| Edit a card title, caption, or attribution | `verse-mate-web/scripts/visuals-ingest/build_manifests.py` (`book_cards()`) | Re-run + push + bump SHA in mobile |
| Change a video's YouTube ID or chapter range | `verse-mate-web/scripts/visuals-ingest/bibleproject_videos.py` | Re-run + push + bump SHA in mobile |
| Change the registry shape (add a field on `VisualCard`, etc.) | `src/types.ts` **here** + `verse-mate-web` writer + web/mobile consumers, in one PR per repo | Coordinate the merge order: types → web → mobile |
| Add a lookup helper | `src/index.ts` **here** | Bump SHA in consumers |
| Curate / audit which images survive | `verse-mate-web/scripts/visuals-ingest/curate_precept_chapters.py` (denylists) + ingest pipeline | Re-run + push + bump SHA in mobile |

## Regeneration workflow

Standard flow whenever curated content changes:

```sh
# 1. In verse-mate-web — regenerate everything in lockstep
cd verse-mate-web
python3 scripts/visuals-ingest/build_manifests.py
# Writes:
#   src/data/visuals/registry.ts          (web's local copy)
#   src/data/visuals/booksWithVisuals.ts  (light slug-set)
#   ../verse-mate-visuals/src/registry.ts (THIS package, if directory exists)
git add -A && git commit -m "chore(visuals): regenerate registry"
git push   # → web PR

# 2. In verse-mate-visuals — commit + push the regenerated file
cd ../verse-mate-visuals
git add src/registry.ts
git commit -m "chore: regenerate registry from web ingest"
git push origin main
git rev-parse HEAD   # capture the new SHA

# 3. In verse-mate-mobile — bump the dependency SHA
cd ../verse-mate-mobile
# Edit package.json:
#   "@versemate/visuals": "github:verse-mate/verse-mate-visuals#<new-sha>"
bun install
git commit -am "chore(visuals): bump @versemate/visuals to <sha>"
git push   # → mobile PR
```

Same convention as [@versemate/studies](https://github.com/verse-mate/verse-mate-studies) — no new tooling to learn.

## Branch + PR conventions

- **Branch from `main`**, no merge bases.
- **One concern per PR.** Either "regenerate registry" or "shape change", not both.
- **Don't squash a registry regen into an unrelated PR** — the diff dwarfs everything else and makes review impossible.
- **PR title prefix**:
  - `chore: regenerate registry…` for content-only updates
  - `feat:` for shape changes (new fields, new helpers)
  - `fix:` for bugs in the helpers
- **Pin consumers by SHA**, not by branch. `github:verse-mate/verse-mate-visuals#<sha>` — explicit, reviewable, reproducible across CI/EAS.

## Code style

- Match the surrounding TypeScript style. Strict mode, no `any`, prefer named exports.
- The generated `src/registry.ts` is `eslint-disable`-d at the top — don't touch its formatting; let `build_manifests.py` own its shape.
- `src/types.ts` and `src/index.ts` are hand-authored and lint-clean.

## What NOT to do

- **Don't edit `src/registry.ts` directly.** Any hand-edit is overwritten on the next ingest run. Edit the ingest script instead.
- **Don't add runtime dependencies.** This package is pure data + tiny helpers; consumers bring their own image/video infra.
- **Don't add a build step.** The TS source is the published artifact. A build step would force consumers to re-pin on every regen — that's already painful enough.
- **Don't bump the package version on every regen.** `0.1.0` is fine until the shape changes; consumers pin by SHA, not by version.

## Issues + bug reports

This repo doesn't have a user-facing surface — bugs in the **rendering** of visuals belong on the consuming app repos:

- Web visuals bugs → [verse-mate-web/issues](https://github.com/verse-mate/verse-mate-web/issues)
- Mobile visuals bugs → [verse-mate-mobile/issues](https://github.com/verse-mate/verse-mate-mobile/issues)

Bugs that are about **the data itself** (wrong attribution, broken image URL, off-by-one chapter range) — open here. Include the book slug, chapter, and card id from the registry.
