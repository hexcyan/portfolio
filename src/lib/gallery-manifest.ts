import manifest from "@/generated/gallery-manifest.json";

/** Size and blur placeholder of a gallery image, precomputed at deploy by scripts/gallery-manifest.mjs. */
export interface GalleryImageInfo {
    w: number;
    h: number;
    /** 30px micro thumb as a data URI */
    blur: string;
}

const entries = manifest as Record<string, GalleryImageInfo>;

/** Undefined for images added after the last deploy; those size themselves in the browser. */
export function getImageInfo(path: string): GalleryImageInfo | undefined {
    return entries[path];
}
