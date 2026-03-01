/** Shared masonry grid constants — single source of truth. */
export const MASONRY = {
    /** Height of each implicit grid row (px). Smaller = finer span granularity. */
    rowHeight: 1,
    /** Extra rows added to each span calculation (breathing room). */
    gap: 0,
    /** Minimum column width before the grid wraps to fewer columns (px). */
    columnMinWidth: 320,
    /** Fallback column width used when getComputedStyle isn't available (px). */
    columnFallback: 320,
    /** Default column-span for embed blocks (YouTube, Tweet). */
    defaultEmbedCols: 1,
} as const;
