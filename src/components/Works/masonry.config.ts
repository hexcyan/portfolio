/** Shared masonry grid constants — single source of truth. */
export const MASONRY = {
    /** Height of each implicit grid row (px). Smaller = finer span granularity. */
    rowHeight: 1,
    /** Extra rows added to each span calculation (breathing room). */
    gap: 0,
    /** Minimum column width before the grid wraps to fewer columns (px). */
    columnMinWidth: 320,
    /** Minimum column width on mobile (px). */
    columnMinWidthMobile: 220,
    /** Fallback column width used when getComputedStyle isn't available (px). */
    columnFallback: 320,
    /** Default column-span for embed blocks (YouTube, Tweet). */
    defaultEmbedCols: 1,
    /** Minimum width for text blocks before they expand columns (px). */
    textMinWidth: 200,
    /** Minimum width for tweet blocks before they expand columns (px). */
    tweetMinWidth: 250,
    /** Default maximum grid columns for a subsection. */
    maxColumns: 6,
} as const;
