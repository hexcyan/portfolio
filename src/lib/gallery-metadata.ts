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

const { storageZone, apiKey } = getCDNConfig();

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
