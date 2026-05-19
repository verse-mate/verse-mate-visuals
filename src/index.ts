/**
 * @versemate/visuals — shared visual-aids registry for VerseMate apps.
 *
 * Exports the full per-book registry (`VISUALS_REGISTRY`), the slug set
 * for tab-visibility gating (`BOOKS_WITH_VISUALS`), and lookup helpers
 * (`getVisualsForBook`, `getCardsForChapter`, `getVideoForChapter`,
 * `absolutizeVisualUrl`).
 *
 * Path convention: image URLs in the registry are root-relative
 * (`/visuals/<slug>/<file>`). The web app consumes them directly; the
 * mobile app pipes them through `absolutizeVisualUrl` which prefixes
 * `VISUALS_ORIGIN` (defaults to `https://app.versemate.org`).
 */

export type { VisualCard, VideoEntry, VisualsManifest } from './types';
import type { VisualCard, VideoEntry, VisualsManifest } from './types';

export { VISUALS_REGISTRY, BOOKS_WITH_VISUALS } from './registry';
import { VISUALS_REGISTRY } from './registry';

/**
 * Origin used by `absolutizeVisualUrl` to turn root-relative registry
 * paths into fully-qualified URLs. Defaults to production. Mobile apps
 * pointing at a staging build can re-export from a wrapper module.
 */
export const VISUALS_ORIGIN = 'https://app.versemate.org';

/**
 * Turn a root-relative visuals path (`/visuals/genesis/foo.png`) into a
 * fully-qualified URL suitable for React Native `Image source.uri`.
 * Idempotent — already-absolute URLs pass through unchanged.
 */
export function absolutizeVisualUrl(path: string, origin: string = VISUALS_ORIGIN): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return origin + (path.startsWith('/') ? path : '/' + path);
}

/** Look up the full manifest for a book by URL slug ("song-of-solomon"). */
export function getVisualsForBook(slug: string): VisualsManifest | null {
  return VISUALS_REGISTRY[slug.toLowerCase()] ?? null;
}

/**
 * Pick the video whose chapterStart/chapterEnd contains `chapter`.
 * Falls back to the first entry when nothing matches (chapter ranges
 * should be exhaustive for every book with videos).
 */
export function getVideoForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VideoEntry | null {
  if (!manifest) return null;
  for (const v of manifest.videos) {
    if (chapter >= v.chapterStart && chapter <= v.chapterEnd) return v;
  }
  return manifest.videos[0] ?? null;
}

/**
 * Cards relevant for the given chapter. Book-level cards (no `chapters`
 * field) pass for every chapter; chapter-scoped cards (Precept Austin
 * per-chapter charts) only show when the chapter is in their list.
 */
export function getCardsForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VisualCard[] {
  if (!manifest) return [];
  return manifest.cards.filter((c) => !c.chapters || c.chapters.includes(chapter));
}
