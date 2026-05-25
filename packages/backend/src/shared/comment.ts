// Shape of a single stored article comment, as fetched from Luogu's
// /article/{lid}/replies endpoint (the `replySlice` array entries).
export interface LuoguComment {
    id: number;
    authorId: number;
    time: number; // unix seconds, as returned by Luogu
    content: string; // plain text, may contain newlines
}

// Comments are re-fetched on access when older than this. Mirrors the
// profile TTL pattern. 6 hours: comments change more often than profiles.
export const COMMENTS_TTL_MS = 6 * 60 * 60 * 1000;

// Defensive cap on pagination to avoid unbounded fetching on pathological
// articles with tens of thousands of comments.
export const COMMENTS_MAX_PAGES = 200;
