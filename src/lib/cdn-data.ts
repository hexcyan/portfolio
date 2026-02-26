/**
 * Fetch palette/paint data from BunnyCDN with ISR-style caching.
 * Falls back to static data if CDN is unavailable.
 */

import { Paint, hbPaints, myStock as staticStock, paintFamily as staticPaintFamily } from "./paints";
import { PaletteLayout, CuratedPalette, paletteLayouts as staticLayouts, curatedPalettes as staticCurated } from "./palettes";
import type { Bit } from "./paints";

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL || "https://x65535.b-cdn.net";
const REVALIDATE = 60; // seconds

interface FetchResult<T> {
    data: T;
    live: boolean;
}

async function fetchJSON<T>(path: string, fallback: T): Promise<FetchResult<T>> {
    try {
        const res = await fetch(`${CDN_BASE}/paints/data/${path}`, {
            next: { revalidate: REVALIDATE },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        return { data: (await res.json()) as T, live: true };
    } catch (e) {
        console.warn(`cdn-data: failed to fetch ${path}, using static fallback`, e);
        return { data: fallback, live: false };
    }
}

export async function checkCDNHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${CDN_BASE}/paints/data/my-stock.json`, {
            method: "HEAD",
            next: { revalidate: REVALIDATE },
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function fetchPaints(): Promise<FetchResult<Paint[]>> {
    return fetchJSON("hb-paints.json", hbPaints);
}

export async function fetchStock(): Promise<FetchResult<Record<number, [Bit, Bit, Bit, Bit]>>> {
    return fetchJSON("my-stock.json", staticStock);
}

export async function fetchPaintFamily(): Promise<FetchResult<Record<string, number[]>>> {
    return fetchJSON("paint-family.json", staticPaintFamily);
}

export async function fetchLayouts(): Promise<FetchResult<PaletteLayout[]>> {
    return fetchJSON("palette-layouts.json", staticLayouts);
}

export async function fetchCuratedPalettes(): Promise<FetchResult<CuratedPalette[]>> {
    return fetchJSON("curated-palettes.json", staticCurated);
}
