/**
 * Album masonry: photos in album order, each in the column that ends earliest; landscapes span two columns.
 *
 * Everything is measured in units of 1/200 of a column width, so a placement is the same at any
 * pixel width with the same column count. The server computes it for every column count and CSS
 * container queries pick one (Gallery.module.css .albumGrid), so the grid is right on first paint.
 *
 * Rules (tuned in the album layout preview):
 * - a landscape (w/h >= 1.25) spans two columns
 * - a landscape lands where every gap under it can be closed by stretching the photo above
 *   (object-fit: cover crops it by at most STRETCH of its height), within ~one portrait of the
 *   earliest spot; among such spots it zig-zags away from the previous landscape
 * - if no spot is clean, a landscape waits up to 3 photos for one
 */

/** Column width in units, and the gap between photos (5% of a column, ~11px at 227px) */
export const UNIT_COL = 200;
export const UNIT_GAP = 10;
/** Column counts the CSS has container-query breakpoints for */
export const ALBUM_COLUMNS = [2, 3, 4, 5, 6, 7] as const;

const WIDE_RATIO = 1.25;
const STRETCH = 0.25;
const MAX_WAIT = 3;

export interface AlbumPlacement {
    /** 1-based grid column and span (1 or 2) */
    col: number;
    span: number;
    /** 1-based grid row and height, in units */
    row: number;
    height: number;
}

interface Box { c: number; s: number; y: number; h: number; grown: boolean }

/** `ratios` are width/height per photo, in album order. */
export function layoutAlbum(ratios: number[], n: number): AlbumPlacement[] {
    const W = UNIT_COL, G = UNIT_GAP, tol = Math.max(G, W * 0.08);
    const tops = new Array<number>(n).fill(0);
    const last = new Array<number>(n).fill(-1); // photo currently ending each column
    const boxes: Box[] = new Array(ratios.length);
    let lastWide = -1;

    const spanOf = (i: number) => (n >= 2 && ratios[i] >= WIDE_RATIO ? 2 : 1);
    const stretchRoom = (k: number) => {
        const j = last[k];
        return j >= 0 && boxes[j].s === 1 && !boxes[j].grown ? boxes[j].h * STRETCH : 0;
    };

    function best(s: number) {
        const cands = [];
        for (let c = 0; c + s <= n; c++) {
            const part = tops.slice(c, c + s), y = Math.max(...part), step = y - Math.min(...part);
            let unfill = 0; // gap height that stretching can't absorb
            for (let k = c; k < c + s; k++) unfill += Math.max(0, y - tops[k] - stretchRoom(k));
            cands.push({ c, y, step, unfill });
        }
        type Cand = (typeof cands)[number];
        const earliest = (list: Cand[]) =>
            list.reduce<Cand | null>((b, k) => (!b || k.y < b.y || (k.y === b.y && k.step < b.step) ? k : b), null)!;
        let b = earliest(cands);
        if (s > 1) {
            const clean = cands.filter((k) => k.unfill <= 0 && k.y <= b.y + W * 1.2);
            if (clean.length) {
                b = earliest(clean);
                if (lastWide >= 0) {
                    for (const k of clean) if (k.y <= b.y + tol && Math.abs(k.c - lastWide) > Math.abs(b.c - lastWide)) b = k;
                }
            } else {
                b = cands.reduce((m, k) => (k.unfill < m.unfill || (k.unfill === m.unfill && k.y < m.y) ? k : m));
            }
        }
        return b;
    }

    function put(i: number) {
        const s = spanOf(i), p = best(s);
        const h = Math.round((s * W + (s - 1) * G) / ratios[i]);
        for (let k = p.c; k < p.c + s; k++) {
            const gap = p.y - tops[k];
            if (gap > 0 && gap <= stretchRoom(k)) {
                const j = last[k];
                boxes[j].h += gap;
                boxes[j].grown = true;
                tops[k] = p.y;
            }
        }
        boxes[i] = { c: p.c, s, y: p.y, h, grown: false };
        for (let k = p.c; k < p.c + s; k++) { tops[k] = p.y + h + G; last[k] = i; }
        if (s > 1) lastWide = p.c;
    }

    const waiting: { i: number; held: number }[] = [];
    const flush = (force: boolean) => {
        while (waiting.length && (force || waiting[0].held >= MAX_WAIT || best(2).unfill <= 0)) put(waiting.shift()!.i);
    };
    ratios.forEach((_, i) => {
        if (spanOf(i) === 1) {
            put(i);
            waiting.forEach((w) => w.held++);
            flush(false);
        } else if (!waiting.length && best(2).unfill <= 0) {
            put(i);
        } else {
            waiting.push({ i, held: 0 });
        }
    });
    flush(true);

    return boxes.map((b) => ({ col: b.c + 1, span: b.s, row: b.y + 1, height: b.h }));
}

/** Inline CSS variables for one photo across every column count (read by .albumCell). */
export function placementVars(placements: AlbumPlacement[][], index: number): Record<string, string | number> {
    const vars: Record<string, string | number> = {};
    ALBUM_COLUMNS.forEach((n, k) => {
        const p = placements[k][index];
        vars[`--c${n}`] = `${p.col} / span ${p.span}`;
        vars[`--r${n}`] = `${p.row} / span ${p.height}`;
    });
    return vars;
}
