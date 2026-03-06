import { PalettePaint, isInStockForLayout } from "./palette-paints";

// ─── Pan Sizes ──────────────────────────────────────────────

export type PanSizeId = "mini" | "half" | "full";

export interface PanSize {
    id: PanSizeId;
    label: string;
    mmWidth: number;
    mmHeight: number;
    pxWidth: number;
    pxHeight: number;
}

export const panSizes: Record<PanSizeId, PanSize> = {
    mini: { id: "mini", label: "Mini Pan", mmWidth: 10, mmHeight: 10, pxWidth: 64, pxHeight: 64 },
    half: { id: "half", label: "Half Pan", mmWidth: 16, mmHeight: 19, pxWidth: 60, pxHeight: 72 },
    full: { id: "full", label: "Full Pan", mmWidth: 30, mmHeight: 19, pxWidth: 108, pxHeight: 72 },
};

export function getPanSize(layout: PaletteLayout): PanSize {
    return panSizes[layout.panSize];
}

export function getValidSizes(panSize: PanSizeId): number[] {
    switch (panSize) {
        case "mini": return [0, 1, 2, 3];
        case "full": return [2];
        case "half":
        default:     return [1, 2];
    }
}

// ─── Types ──────────────────────────────────────────────────

export interface PaletteLayout {
    id: string;
    name: string;
    cols: number;
    rows: number;
    xGap: number;
    yGap: number;
    panSize: PanSizeId;
    blockedSlots?: number[];
    backgroundImage?: string;
    etsyUrl?: string;
    padding?: number[];
    imgWidth?: number;
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
    customPanSize?: PanSizeId;
}

// ─── Preset Layouts ─────────────────────────────────────────

export const paletteLayouts: PaletteLayout[] = [
    {
        id: "15-pan",
        name: "15-Pan Wood Palette",
        cols: 4,
        rows: 4,
        xGap: 32,
        yGap: 28,
        panSize: "mini",
        blockedSlots: [3],
        backgroundImage: "/15-pan-mini.png",
        etsyUrl: "https://candycolourshop.etsy.com/listing/1404478694",
        padding: [71, 64],
        imgWidth: 480
    },
    {
        id: "24-pan",
        name: "24-Pan (3×8)",
        cols: 8,
        rows: 3,
        xGap: 4,
        yGap: 4,
        panSize: "half",
        etsyUrl: "https://candycolourshop.etsy.com/listing/4466934563",
    },
    {
        id: "custom",
        name: "Custom",
        cols: 4,
        rows: 4,
        xGap: 4,
        yGap: 4,
        panSize: "half",
        etsyUrl: "https://candycolourshop.etsy.com/listing/4466934563",
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
            "hb-34", "hb-132", "hb-131", null,
            "hb-75", "hb-61", "hb-62", "hb-65",
            "hb-66", "hb-77", "hb-74", "hb-79",
            "hb-133", "hb-134", "hb-92", "hb-94",
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

export function getDefaultState(layouts?: PaletteLayout[]): PaletteState {
    const layout = (layouts ?? paletteLayouts)[0];
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

export function loadPaletteState(layouts?: PaletteLayout[]): PaletteState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const state = JSON.parse(raw) as PaletteState;
        // Validate layout still exists
        const layoutList = layouts ?? paletteLayouts;
        const layout = layoutList.find((l) => l.id === state.layoutId);
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
    layout: PaletteLayout,
    panSizeOverride?: PanSizeId
): { allInStock: boolean; outOfStock: PalettePaint[] } {
    const validSizes = getValidSizes(panSizeOverride ?? layout.panSize);
    const paintMap = new Map(allPaints.map((p) => [p.id, p]));
    const outOfStock: PalettePaint[] = [];
    const seen = new Set<string>();
    for (const id of slots) {
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const p = paintMap.get(id);
        if (p && !isInStockForLayout(p, validSizes)) outOfStock.push(p);
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
