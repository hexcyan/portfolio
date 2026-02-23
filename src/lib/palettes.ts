import { PalettePaint, isInStockForLayout } from "./palette-paints";

// ─── Types ──────────────────────────────────────────────────

export interface PaletteLayout {
    id: string;
    name: string;
    cols: number;
    rows: number;
    xGap: number;
    yGap: number;
    panWidth: number;       // px width of each pan slot
    panHeight: number;      // px height of each pan slot
    validStockSizes: number[];  // myStock indices that work for this palette: 0=5ml, 1=15ml, 2=60ml, 3=mini
    blockedSlots?: number[];
    backgroundImage?: string;
    etsyUrl?: string;
}

export interface CuratedPalette {
    id: string;
    name: string;
    description: string;
    layoutId: string;
    paints: (string | null)[];
}

export interface PaletteState {
    layoutId: string;
    slots: (string | null)[];
    showBackground: boolean;
    minimized: boolean;
    position: { x: number; y: number };
    customCols?: number;
    customRows?: number;
}

// ─── Preset Layouts ─────────────────────────────────────────

export const paletteLayouts: PaletteLayout[] = [
    {
        id: "12-pan",
        name: "12-Pan (3×4)",
        cols: 3,
        rows: 4,
        xGap: 4,
        yGap: 4,
        panWidth: 56,
        panHeight: 56,
        validStockSizes: [0, 1, 2, 3],   // 5ml, 15ml, 60ml, mini — all sizes work
        etsyUrl: "https://www.etsy.com/listing/12pan",
    },
    {
        id: "15-pan",
        name: "15-Pan (4×4)",
        cols: 4,
        rows: 4,
        xGap: 4,
        yGap: 4,
        panWidth: 56,
        panHeight: 56,
        validStockSizes: [0, 1, 2, 3],   // 5ml, 15ml, 60ml, mini — uses minipan
        blockedSlots: [3],
        etsyUrl: "https://www.etsy.com/listing/15pan",
    },
    {
        id: "24-pan",
        name: "24-Pan (3×8)",
        cols: 3,
        rows: 8,
        xGap: 4,
        yGap: 4,
        panWidth: 48,
        panHeight: 36,
        validStockSizes: [0, 1, 2],      // 5ml, 15ml, 60ml — half pans, no mini
        etsyUrl: "https://www.etsy.com/listing/24pan",
    },
    {
        id: "custom",
        name: "Custom",
        cols: 4,
        rows: 4,
        xGap: 4,
        yGap: 4,
        panWidth: 56,
        panHeight: 56,
        validStockSizes: [0, 1, 2, 3],   // all sizes
    },
];

// ─── Curated Templates ──────────────────────────────────────

export const curatedPalettes: CuratedPalette[] = [
    {
        id: "beginners",
        name: "Beginner's Collection",
        description: "A well-rounded 15-color set with Van Gogh paints",
        layoutId: "15-pan",
        paints: [
            "vg-5", "vg-1", "vg-6", null,
            "vg-7", "vg-3", "vg-2", "vg-4",
            "vg-8", "vg-9", "vg-10", "vg-11",
            "vg-12", "vg-13", "vg-14", "vg-15",
        ],
    },
    {
        id: "nature",
        name: "Nature Palette",
        description: "Greens and earth tones for landscape painting",
        layoutId: "15-pan",
        paints: [
            "hb-34", "hb-132", "hb-131", null,
            "hb-75", "hb-61", "hb-62", "hb-65",
            "hb-66", "hb-77", "hb-74", "hb-79",
            "hb-133", "hb-134", "hb-92", "hb-94",
        ],
    },
    {
        id: "portrait",
        name: "Portrait Palette",
        description: "Warm skin tones and subtle mixes for portraiture",
        layoutId: "12-pan",
        paints: [
            "hb-26", "hb-12", "hb-19",
            "hb-34", "hb-30", "hb-132",
            "hb-134", "hb-130", "hb-133",
            "hb-94", "hb-156", "hb-2",
        ],
    },
];

// ─── Persistence ────────────────────────────────────────────

const STORAGE_KEY = "palette-builder-state";

export function getDefaultState(): PaletteState {
    const layout = paletteLayouts[0];
    return {
        layoutId: layout.id,
        slots: Array(layout.cols * layout.rows).fill(null),
        showBackground: false,
        minimized: false,
        position: { x: 20, y: 20 },
    };
}

export function savePaletteState(state: PaletteState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // localStorage may be unavailable
    }
}

export function loadPaletteState(): PaletteState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const state = JSON.parse(raw) as PaletteState;
        // Validate layout still exists
        const layout = paletteLayouts.find((l) => l.id === state.layoutId);
        if (!layout) return null;
        // Validate slot count
        const expectedSlots =
            state.layoutId === "custom"
                ? (state.customCols ?? 4) * (state.customRows ?? 4)
                : layout.cols * layout.rows;
        if (state.slots.length !== expectedSlots) return null;
        return state;
    } catch {
        return null;
    }
}

// ─── Manifest ───────────────────────────────────────────────

export function generateManifest(
    slots: (string | null)[],
    allPaints: PalettePaint[]
): string {
    const paintMap = new Map(allPaints.map((p) => [p.id, p]));
    return slots
        .filter((id): id is string => id !== null)
        .map((id) => {
            const p = paintMap.get(id);
            if (!p) return id;
            return p.code ? `${p.code} ${p.name}` : p.name;
        })
        .join(", ");
}

// ─── Stock Validation ───────────────────────────────────────

export function validateStock(
    slots: (string | null)[],
    allPaints: PalettePaint[],
    layout: PaletteLayout
): { allInStock: boolean; outOfStock: PalettePaint[] } {
    const paintMap = new Map(allPaints.map((p) => [p.id, p]));
    const outOfStock: PalettePaint[] = [];
    const seen = new Set<string>();
    for (const id of slots) {
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const p = paintMap.get(id);
        if (p && !isInStockForLayout(p, layout.validStockSizes)) outOfStock.push(p);
    }
    return { allInStock: outOfStock.length === 0, outOfStock };
}

// ─── Helpers ────────────────────────────────────────────────

export function getLayout(id: string): PaletteLayout | undefined {
    return paletteLayouts.find((l) => l.id === id);
}

export function getSlotCount(layout: PaletteLayout, state?: PaletteState): number {
    if (layout.id === "custom" && state) {
        return (state.customCols ?? layout.cols) * (state.customRows ?? layout.rows);
    }
    return layout.cols * layout.rows;
}
