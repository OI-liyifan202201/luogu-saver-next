# Legal Pages Specification

## 1. Overview

The legal pages are static, read-only informational pages served by the frontend at `/privacy`, `/disclaimer`, and `/deletion`. They present, respectively, the privacy agreement (隐私协议), the disclaimer (免责声明), and the data deletion policy (数据移除政策).

The pages introduce NO new backend endpoints, NO new database tables, and NO new shared types. All content is static Simplified Chinese legal text rendered client-side. The text is ported from the predecessor project `laikit-dev/luogu-saver` (`views/legal/*.njk`).

The footer in `App.vue` already links to `/privacy`, `/disclaimer`, and `/deletion`. Before these pages existed, those links were plain `<a href>` elements that triggered full-page navigation and resolved to the catch-all `NotFound` view. This specification defines the routes and view that satisfy the existing footer links, and requires the footer links to use client-side `<router-link>` navigation.

## 2. Content Source

All legal text lives in a single data module `packages/frontend/src/views/legal/legal-content.ts`, which exports `LEGAL_DOCUMENTS: Record<LegalKey, LegalDocument>` where `LegalKey` is `'privacy' | 'disclaimer' | 'deletion'`.

Each `LegalDocument` has:

- `icon`: one of `'privacy' | 'disclaimer' | 'deletion'`, resolved by the view to a fixed icon component.
- `title`: the page title.
- `updatedAt`: a human-readable last-updated date string.
- `sections`: an ordered list of `{ heading, segments }`, where each segment is either a `paragraph` (single HTML string) or a `list` (array of HTML strings).

Segment HTML may contain inline emphasis markup (e.g. `<strong>`). This HTML is a hard-coded static constant, never user input, and is rendered via `v-html`; this is the only sanctioned `v-html` usage for these pages.

## 3. Routes

Three routes are registered through the frontend router module auto-loader (`packages/frontend/src/routers/index.ts`, which globs `./modules/*.ts`). All three resolve to the same component, differing only by a static `props.docKey`.

| Path          | Name         | `props.docKey` | `meta.activeMenu` |
| ------------- | ------------ | -------------- | ----------------- |
| `/privacy`    | `privacy`    | `privacy`      | `''`              |
| `/disclaimer` | `disclaimer` | `disclaimer`   | `''`              |
| `/deletion`   | `deletion`   | `deletion`     | `''`              |

`meta.activeMenu` is the empty string because these pages are reached from the footer, not the primary sidebar menu, and therefore highlight no menu entry.

## 4. View

A single component `packages/frontend/src/views/legal/LegalView.vue` renders any legal document.

- It accepts one prop, `docKey: LegalKey`, supplied by the route's static `props`.
- It looks up `LEGAL_DOCUMENTS[docKey]` and renders a header card (icon, title, last-updated date) followed by a body card containing each section's heading and segments.
- The icon is selected from a fixed allow-list: `privacy → UserShield`, `disclaimer → ExclamationCircle`, `deletion → TrashAlt` (all from `@vicons/fa`, wrapped with `@vicons/utils` `Icon`), matching the icons already used by the footer links.
- The layout reuses the shared `Card` component and theme variables, consistent with `AboutView`.

## 5. Footer Integration

The three footer links in `App.vue` MUST use `<router-link :to="...">` rather than `<a href="...">`, so navigation stays within the SPA and does not trigger a full-page reload. Their visible labels and icons are unchanged.

## 6. Invariants

1. The pages are purely presentational: they trigger no network requests and mutate no state.
2. No authentication is required; the pages are accessible to anonymous visitors.
3. The three routes share exactly one view component; adding a fourth legal page requires only a new `LEGAL_DOCUMENTS` entry plus a new route.
4. `v-html` is used solely to render the static, trusted strings in `legal-content.ts`.
