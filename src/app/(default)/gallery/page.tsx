import { Suspense } from "react";
import { getFolders, getImagesFromFolder, thumbUrl } from "@/lib/cdn";
import { getAlbumMetadata, getGalleryGlobalMeta } from "@/lib/gallery-metadata";
import { getWorksGlobalMeta } from "@/lib/works-metadata";
import StickyHeader from "@/components/Gallery/StickyHeader";
import GalleryIndex from "@/components/Gallery/GalleryIndex";

import styles from "@/components/Gallery/Gallery.module.css";

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

    return (
        <div className="explorer">
            <StickyHeader
                className={styles.indexHeader}
                stuckClass={styles.stuck}
            >
                <span className={styles.indexHeaderTitle}>
                    <span>📁</span>
                    <span>Gallery</span>
                </span>
                <span className={styles.indexHeaderCount}>
                    {folders.length + linkAlbums.length} folder
                    {folders.length + linkAlbums.length !== 1 ? "s" : ""}
                </span>
            </StickyHeader>

            <Suspense>
                <GalleryIndex
                    folders={folders}
                    linkAlbums={linkAlbums}
                    globalTags={globalTags}
                />
            </Suspense>
        </div>
    );
}
