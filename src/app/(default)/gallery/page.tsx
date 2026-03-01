import Link from "next/link";
import { getFolders, getImagesFromFolder, getCDNConfig, thumbUrl } from "@/lib/cdn";
import { getAlbumMetadata } from "@/lib/gallery-metadata";
import StickyHeader from "@/components/Gallery/StickyHeader";
import FolderPreviewImage from "@/components/Gallery/FolderPreviewImage";

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
    const folders = await getFoldersWithPreviews();

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
                    {folders.length} folder
                    {folders.length !== 1 ? "s" : ""}
                </span>
            </StickyHeader>

            <div className={styles.folderGrid}>
                {folders.map((folder) => (
                    <Link
                        key={folder.name}
                        href={folder.route}
                        className={styles.folderCard}
                    >
                        <div className={styles.folderPreview}>
                            {folder.previewPath ? (
                                <FolderPreviewImage
                                    thumbSrc={thumbUrl(folder.previewPath, "thumb")}
                                    microSrc={thumbUrl(folder.previewPath, "micro")}
                                    alt={folder.name}
                                />
                            ) : (
                                <div className={styles.folderPreviewEmpty}>
                                    📂
                                </div>
                            )}
                            {folder.imageCount > 0 && (
                                <span className={styles.folderPreviewCount}>
                                    {folder.imageCount} image
                                    {folder.imageCount !== 1 ? "s" : ""}
                                </span>
                            )}
                            {(folder.description || folder.tags.length > 0) && (
                                <div className={styles.folderMeta}>
                                    {folder.description && (
                                        <span className={styles.folderDescription}>
                                            {folder.description}
                                        </span>
                                    )}
                                    {folder.tags.length > 0 && (
                                        <span className={styles.folderTags}>
                                            {folder.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={styles.folderTag}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.folderInfo}>
                            <span className={styles.folderIcon}>📁</span>
                            <span className={styles.folderName}>
                                {folder.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
