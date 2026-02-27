import Link from "next/link";
import { getFolders, getImagesFromFolder, getCDNConfig } from "@/lib/cdn";
import StickyHeader from "@/components/Gallery/StickyHeader";
import styles from "@/components/Gallery/Gallery.module.css";

interface FolderWithPreview {
    name: string;
    route: string;
    previewUrl: string | null;
    imageCount: number;
}

async function getFoldersWithPreviews(): Promise<FolderWithPreview[]> {
    const folders = await getFolders("gallery");
    const { pullZone } = getCDNConfig();

    const results = await Promise.all(
        folders.map(async (folder) => {
            try {
                const images = await getImagesFromFolder(
                    `gallery/${folder.title}`
                );
                const cover = images.find((img) =>
                    img.id.replace(/\.[^.]+$/, "").toLowerCase() === "_cover"
                );
                const previewImage = cover ?? images[0];
                return {
                    name: folder.title,
                    route: `/gallery/${folder.title}`,
                    previewUrl: previewImage
                        ? `${pullZone}/${previewImage.path}?width=500&quality=50`
                        : null,
                    imageCount: images.length,
                };
            } catch {
                return {
                    name: folder.title,
                    route: `/gallery/${folder.title}`,
                    previewUrl: null,
                    imageCount: 0,
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
                            {folder.previewUrl ? (
                                <img
                                    src={folder.previewUrl}
                                    alt={folder.name}
                                    className={styles.folderPreviewImage}
                                    loading="lazy"
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
