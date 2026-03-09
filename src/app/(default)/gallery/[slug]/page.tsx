import { Suspense } from "react";
import { getImagesFromFolder, getFolders } from "@/lib/cdn";
import { getAlbumMetadata } from "@/lib/gallery-metadata";
import { getWorksGlobalMeta } from "@/lib/works-metadata";
import GalleryGrid from "@/components/Gallery/GalleryGrid";
import StickyHeader from "@/components/Gallery/StickyHeader";
import styles from "@/components/Gallery/Gallery.module.css";
import Link from "next/link";

// ISR: serve static, revalidate in background every hour as fallback
export const revalidate = 3600;

// Pre-build all known album pages at build time
export async function generateStaticParams() {
    try {
        const folders = await getFolders("gallery");
        return folders.map((f) => ({ slug: f.title }));
    } catch {
        return [];
    }
}

interface GalleryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
    const { slug } = await params;
    const folderName = slug.charAt(0).toUpperCase() + slug.slice(1);

    try {
        const [allImages, metadata, worksGlobalMeta] = await Promise.all([
            getImagesFromFolder(`gallery/${slug}`),
            getAlbumMetadata(slug),
            getWorksGlobalMeta(),
        ]);
        const images = allImages.filter(
            (img) => img.id.replace(/\.[^.]+$/, "").toLowerCase() !== "_cover"
        );

        const globalTags = worksGlobalMeta?.tags ?? [];

        return (
            <div className="explorer">
                <StickyHeader
                    className={styles.galleryHeader}
                    stuckClass={styles.stuck}
                >
                    <div className={styles.galleryHeaderLeft}>
                        <Link href="/gallery" className={styles.backLink}>
                            ← Back
                        </Link>
                        <span className={styles.galleryTitle}>
                            📁 {folderName}
                        </span>
                    </div>
                    <span className={styles.galleryCount}>
                        {images.length} image{images.length !== 1 ? "s" : ""}
                    </span>
                </StickyHeader>
                {metadata && (metadata.description || metadata.tags?.length > 0) && (
                    <div className={styles.albumInfoBar}>
                        {metadata.description && (
                            <span className={styles.albumInfoDesc}>
                                {metadata.description}
                            </span>
                        )}
                        {metadata.tags?.length > 0 && (
                            <>
                                <span className={styles.albumInfoDivider} />
                                <span className={styles.albumInfoLabel}>tags:</span>
                                {metadata.tags.map((tag) => {
                                    const tagDef = globalTags.find((t) => t.id === tag);
                                    return (
                                        <span
                                            key={tag}
                                            className={styles.albumInfoTag}
                                            style={
                                                tagDef?.color
                                                    ? { borderColor: tagDef.color, color: tagDef.color }
                                                    : undefined
                                            }
                                        >
                                            {tagDef?.label ?? tag}
                                        </span>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}
                <Suspense>
                    <GalleryGrid
                        images={images}
                        folderName={folderName}
                        metadata={metadata}
                        globalTags={globalTags}
                    />
                </Suspense>
            </div>
        );
    } catch {
        return (
            <div>
                <h1>Error Loading Gallery</h1>
                <p>Unable to load images. Please try again later.</p>
            </div>
        );
    }
}
