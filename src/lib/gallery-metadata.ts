import { getCDNConfig } from "./cdn";

export interface ImageMetadata {
    tags: string[];
    caption: string;
}

export interface AlbumMetadata {
    description: string;
    tags: string[];
    images: Record<string, ImageMetadata>;
}

export interface LinkAlbum {
    id: string;
    name: string;
    url: string;
    coverPath?: string;       // CDN path for cover image (e.g. "gallery/_links/my-link.jpg")
    description?: string;
    tags: string[];
    order?: number;
}

export interface GalleryGlobalMeta {
    linkAlbums: LinkAlbum[];
}

const { storageZone, apiKey } = getCDNConfig();

export async function getGalleryGlobalMeta(): Promise<GalleryGlobalMeta> {
    if (!storageZone || !apiKey) return { linkAlbums: [] };

    const url = `https://la.storage.bunnycdn.com/${storageZone}/gallery/metadata.json`;
    try {
        const res = await fetch(url, {
            headers: { AccessKey: apiKey, Accept: "application/json" },
            next: { tags: ["gallery", "gallery-global-meta"] },
        });
        if (!res.ok) return { linkAlbums: [] };
        return (await res.json()) as GalleryGlobalMeta;
    } catch {
        return { linkAlbums: [] };
    }
}

export async function putGalleryGlobalMeta(
    data: GalleryGlobalMeta
): Promise<boolean> {
    const writeKey = process.env.CDN_WRITE_KEY || apiKey;
    if (!storageZone || !writeKey) return false;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/gallery/metadata.json`;
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

export async function getAlbumMetadata(
    folder: string
): Promise<AlbumMetadata | null> {
    if (!storageZone || !apiKey) return null;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/gallery/${folder}/metadata.json`;

    try {
        const res = await fetch(url, {
            headers: { AccessKey: apiKey, Accept: "application/json" },
            next: { tags: ["gallery", `gallery-meta-${folder}`] },
        });
        if (!res.ok) return null;
        return (await res.json()) as AlbumMetadata;
    } catch {
        return null;
    }
}

export async function putAlbumMetadata(
    folder: string,
    data: AlbumMetadata
): Promise<boolean> {
    const writeKey = process.env.CDN_WRITE_KEY || apiKey;
    if (!storageZone || !writeKey) return false;

    const url = `https://la.storage.bunnycdn.com/${storageZone}/gallery/${folder}/metadata.json`;

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
