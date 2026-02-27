import { getImagesFromFolder } from "@/lib/cdn";
import GalleryGrid from "@/components/Gallery/GalleryGrid";
import StickyHeader from "@/components/Gallery/StickyHeader";
import styles from "@/components/Gallery/Gallery.module.css";
import Link from "next/link";

interface GalleryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
    const { slug } = await params;
    const folderName = slug.charAt(0).toUpperCase() + slug.slice(1);

    try {
        const allImages = await getImagesFromFolder(`gallery/${slug}`);
        const images = allImages.filter(
            (img) => img.id.replace(/\.[^.]+$/, "").toLowerCase() !== "_cover"
        );

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
                <GalleryGrid images={images} folderName={folderName} />
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
