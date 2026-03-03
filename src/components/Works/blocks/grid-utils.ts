import type { MasonryMeasurements } from "../MasonryContext";

/**
 * Compute how many grid columns a block should span.
 *
 * Pure function — accepts pre-measured grid values, zero DOM access.
 *
 * Handles three concerns:
 *  1. Expand to meet a minimum pixel width
 *  2. Expand to fill awkward leftover columns (e.g. 2-col in 3-col grid -> 3)
 *  3. Cap at maxCols / total grid columns
 */
export function computeBlockCols(
    m: MasonryMeasurements,
    baseCols: number,
    minWidth: number = 0,
    maxCols?: number,
): number {
    const { columnWidth, colGap, totalGridCols } = m;

    let needed = baseCols;

    // Expand to meet minimum width
    while (needed < totalGridCols && columnWidth * needed + colGap * (needed - 1) < minWidth) {
        needed++;
    }

    // Expand if remaining columns would be an awkward gap
    // (fewer leftover columns than what the block itself takes).
    // Only applies to blocks explicitly set to span multiple columns —
    // single-col blocks that expanded for min-width shouldn't fill the row.
    if (baseCols > 1) {
        const remainder = totalGridCols - needed;
        if (remainder > 0 && remainder < needed) {
            needed = totalGridCols;
        }
    }

    // Cap at maxCols
    if (maxCols && needed > maxCols) {
        needed = maxCols;
    }

    // Never exceed total grid columns
    return Math.min(needed, totalGridCols);
}
