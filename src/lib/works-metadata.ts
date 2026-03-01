import { getCDNConfig } from "./cdn";

// ── Global metadata (works/metadata.json) — tags only ──

export interface WorksTagDef {
    id: string;
    label: string;
    color?: string;
}

export interface WorksGlobalMeta {
    tags: WorksTagDef[];
}

// ── Per-folder metadata (works/<folder>/metadata.json) ──

export interface WorksImageMeta {
    caption?: string;
    tags: string[];
    date?: string;
    url?: string;
}

export interface ContentBlock {
    type: "image" | "text" | "youtube" | "tweet";
    filename?: string;    // for image blocks
    content?: string;     // for text blocks
    videoId?: string;     // for youtube blocks
    tweetId?: string;     // for tweet blocks
    caption?: string;     // for youtube/tweet blocks
    tags?: string[];      // per-block tags (youtube/tweet)
    span?: number;        // grid row span override (each unit = 4px)
    cols?: number;        // grid column span (1 or 2, default varies by type)
}

export interface WorksSubsectionMeta {
    id: string;
    title: string;
    description?: string;
    dateRange?: string;
    date?: string;
    tags?: string[];
    blocks: ContentBlock[];
}

export interface WorksFolderMeta {
    title?: string;
    description?: string;
    dateRange?: string;
    order?: number;
    tags?: string[];
    subsections?: WorksSubsectionMeta[];
    images: Record<string, WorksImageMeta>;
}

// ── Assembled types passed to components ──

export interface WorksImage {
    filename?: string;
    path?: string;
    folder?: string;
    url?: string;
    caption?: string;
    tags: string[];
    date?: string;
}

export interface WorksBlock {
    type: "image" | "text" | "youtube" | "tweet";
    // Image fields (resolved from images dict)
    filename?: string;
    folder?: string;
    caption?: string;
    tags: string[];
    date?: string;
    url?: string;
    // Text fields
    content?: string;
    // Embed fields
    videoId?: string;
    tweetId?: string;
    // Layout
    span?: number;        // grid row span override (each unit = 4px)
    cols?: number;        // grid column span (1 or 2)
}

export interface WorksSubsection {
    id: string;
    title: string;
    description?: string;
    dateRange?: string;
    date?: string;
    sectionId: string;
    sectionTitle: string;
    blocks: WorksBlock[];
}

export interface WorksSection {
    id: string;
    title: string;
    description?: string;
    dateRange?: string;
    order: number;
    images: WorksImage[];
    subsections: WorksSubsection[];
}

export interface WorksMetadata {
    tags: WorksTagDef[];
    sections: WorksSection[];
}

// ── CDN fetch/put helpers ──

const { storageZone, apiKey } = getCDNConfig();

export async function getWorksGlobalMeta(): Promise<WorksGlobalMeta | null> {
    if (!storageZone || !apiKey) return null;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/works/metadata.json`;

    try {
        const res = await fetch(url, {
            headers: { AccessKey: apiKey, Accept: "application/json" },
            next: { tags: ["works"] },
        });
        if (!res.ok) return null;
        return (await res.json()) as WorksGlobalMeta;
    } catch {
        return null;
    }
}

export async function putWorksGlobalMeta(
    data: WorksGlobalMeta
): Promise<boolean> {
    const writeKey = process.env.CDN_WRITE_KEY || apiKey;
    if (!storageZone || !writeKey) return false;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/works/metadata.json`;

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

export async function getWorksFolderMeta(
    folder: string
): Promise<WorksFolderMeta | null> {
    if (!storageZone || !apiKey) return null;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/works/${folder}/metadata.json`;

    try {
        const res = await fetch(url, {
            headers: { AccessKey: apiKey, Accept: "application/json" },
            next: { tags: ["works", `works-${folder}`] },
        });
        if (!res.ok) return null;
        return (await res.json()) as WorksFolderMeta;
    } catch {
        return null;
    }
}

export async function putWorksFolderMeta(
    folder: string,
    data: WorksFolderMeta
): Promise<boolean> {
    const writeKey = process.env.CDN_WRITE_KEY || apiKey;
    if (!storageZone || !writeKey) return false;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/works/${folder}/metadata.json`;

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

export function getWorksImagePath(image: WorksImage): string {
    if (image.path) return image.path;
    if (image.folder) return `works/${image.folder}/${image.filename}`;
    return `works/${image.filename}`;
}
