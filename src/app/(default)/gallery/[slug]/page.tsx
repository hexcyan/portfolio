import { getImagesFromFolder } from "@/lib/cdn";
import GalleryGrid from "@/components/Gallery/GalleryGrid";
import styles from "../../blog/page.module.css";

interface GalleryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
    const { slug } = await params;

    try {
        const images = await getImagesFromFolder(`gallery/${slug}`);

        return (
            <div className="explorer">
                <h1 className={styles.blogTitle}>
                    Photos from {slug.charAt(0).toUpperCase() + slug.slice(1)}
                </h1>
                <GalleryGrid images={images} />
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
