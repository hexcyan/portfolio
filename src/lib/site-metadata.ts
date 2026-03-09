import { getCDNConfig } from "./cdn";
import { IIcon } from "./consts";

// ── Status (site/status.json) ──

export interface SiteStatus {
    lines: string[];
}

const STATUS_DEFAULTS: SiteStatus = { lines: [] };

// ── Tools & Projects (site/tools.json) ──

export interface SiteTools {
    tools: IIcon[];
    projects: IIcon[];
}

const TOOLS_DEFAULTS: SiteTools = { tools: [], projects: [] };

// ── CDN helpers ──

const { storageZone, apiKey } = getCDNConfig();

export async function getSiteStatus(): Promise<SiteStatus> {
    if (!storageZone || !apiKey) return STATUS_DEFAULTS;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/site/status.json`;
    try {
        const res = await fetch(url, {
            headers: { AccessKey: apiKey, Accept: "application/json" },
            next: { tags: ["site", "site-status"] },
        });
        if (!res.ok) return STATUS_DEFAULTS;
        const data = (await res.json()) as Partial<SiteStatus>;
        return { ...STATUS_DEFAULTS, ...data };
    } catch {
        return STATUS_DEFAULTS;
    }
}

export async function putSiteStatus(data: SiteStatus): Promise<boolean> {
    const writeKey = process.env.CDN_WRITE_KEY || apiKey;
    if (!storageZone || !writeKey) return false;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/site/status.json`;
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                AccessKey: writeKey,
                "Content-Type": "application/octet-stream",
            },
            body: JSON.stringify(data),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function getSiteTools(): Promise<SiteTools> {
    if (!storageZone || !apiKey) return TOOLS_DEFAULTS;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/site/tools.json`;
    try {
        const res = await fetch(url, {
            headers: { AccessKey: apiKey, Accept: "application/json" },
            next: { tags: ["site", "site-tools"] },
        });
        if (!res.ok) return TOOLS_DEFAULTS;
        const data = (await res.json()) as Partial<SiteTools>;
        return { ...TOOLS_DEFAULTS, ...data };
    } catch {
        return TOOLS_DEFAULTS;
    }
}

export async function putSiteTools(data: SiteTools): Promise<boolean> {
    const writeKey = process.env.CDN_WRITE_KEY || apiKey;
    if (!storageZone || !writeKey) return false;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/site/tools.json`;
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                AccessKey: writeKey,
                "Content-Type": "application/octet-stream",
            },
            body: JSON.stringify(data),
        });
        return res.ok;
    } catch {
        return false;
    }
}
