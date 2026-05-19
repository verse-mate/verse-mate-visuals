/**
 * Public type surface for @versemate/visuals.
 *
 * These shapes are produced by `verse-mate-web/scripts/visuals-ingest/build_manifests.py`
 * and consumed by both the web SPA (Vite) and the mobile app (Expo / Metro).
 *
 * Image `thumb` / `full` paths are stored ROOT-RELATIVE (e.g.
 * `/visuals/genesis/precept_chapter_1.png`). The web app serves them
 * directly from its `public/` directory; the mobile app prefixes them
 * with the production origin at render time (see `absolutizeVisualUrl`
 * in this package's `index.ts`).
 */

export type VisualCard = {
  id: string;
  title: string;
  caption: string;
  /** Root-relative path. Use `absolutizeVisualUrl` on mobile. */
  thumb: string;
  /** Root-relative path. Use `absolutizeVisualUrl` on mobile. */
  full: string;
  attribution: { label: string; href: string };
  download?: { label: string; href: string };
  /** Optional chapter-scope. When present, the card is only relevant
   *  for these chapters (Precept Austin per-chapter charts). Absent for
   *  book-level cards that apply to every chapter. */
  chapters?: number[];
};

export type VideoEntry = {
  youtubeId: string;
  title: string;
  embedUrl: string;
  page: string;
  /** Inclusive chapter range this video covers. */
  chapterStart: number;
  chapterEnd: number;
};

export type VisualsManifest = {
  videos: VideoEntry[];
  cards: VisualCard[];
};
