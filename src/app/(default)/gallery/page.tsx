import { getFolders, getImagesFromFolder } from "@/lib/cdn";
import { getImageInfo } from "@/lib/gallery-manifest";
import { getAlbumMetadata, getGalleryGlobalMeta } from "@/lib/gallery-metadata";
import { getWorksGlobalMeta } from "@/lib/works-metadata";
import GalleryIndex from "@/components/Gallery/GalleryIndex";

// ISR: serve static, revalidate in background every hour as fallback
export const revalidate = 3600;

interface FolderWithPreview {
    name: string;
    route: string;
    previewPath: string | null;
    imageCount: number;
    description: string | null;
    tags: string[];
}

async function getFoldersWithPreviews(): Promise<FolderWithPreview[]> {
    const folders = await getFolders("gallery");

    const results = await Promise.all(
        folders.map(async (folder) => {
            try {
                const [images, metadata] = await Promise.all([
                    getImagesFromFolder(`gallery/${folder.title}`),
                    getAlbumMetadata(folder.title),
                ]);
                const cover = images.find((img) =>
                    img.id.replace(/\.[^.]+$/, "").toLowerCase() === "_cover"
                );
                const previewImage = cover ?? images[0];
                const displayImages = images.filter(
                    (img) => img.id.replace(/\.[^.]+$/, "").toLowerCase() !== "_cover"
                );
                return {
                    name: folder.title,
                    route: `/gallery/${folder.title}`,
                    previewPath: previewImage ? previewImage.path : null,
                    imageCount: displayImages.length,
                    description: metadata?.description || null,
                    tags: metadata?.tags || [],
                };
            } catch {
                return {
                    name: folder.title,
                    route: `/gallery/${folder.title}`,
                    previewPath: null,
                    imageCount: 0,
                    description: null,
                    tags: [],
                };
            }
        })
    );

    return results;
}

export default async function GalleryPage() {
    const [folders, globalMeta, worksGlobalMeta] = await Promise.all([
        getFoldersWithPreviews(),
        getGalleryGlobalMeta(),
        getWorksGlobalMeta(),
    ]);

    const linkAlbums = (globalMeta.linkAlbums || []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const globalTags = worksGlobalMeta?.tags ?? [];

    // blur placeholders for every cover, so cards render blurred on first paint
    const blurs: Record<string, string> = {};
    for (const p of [...folders.map((f) => f.previewPath), ...linkAlbums.map((la) => la.coverPath)]) {
        const blur = p ? getImageInfo(p)?.blur : undefined;
        if (p && blur) blurs[p] = blur;
    }

    return (
        <GalleryIndex
            folders={folders}
            linkAlbums={linkAlbums}
            globalTags={globalTags}
            blurs={blurs}
        />
    );
}
