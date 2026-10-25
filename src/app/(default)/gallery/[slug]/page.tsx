import { getImagesFromFolder, getFolders } from "@/lib/cdn";
import { getAlbumMetadata } from "@/lib/gallery-metadata";
import { getWorksGlobalMeta } from "@/lib/works-metadata";
import GalleryGrid from "@/components/Gallery/GalleryGrid";
import { getImageInfo } from "@/lib/gallery-manifest";

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
        const images = allImages
            .filter((img) => img.id.replace(/\.[^.]+$/, "").toLowerCase() !== "_cover")
            .map((img) => ({ ...img, ...getImageInfo(img.path) }));

        const globalTags = worksGlobalMeta?.tags ?? [];

        return (
            <GalleryGrid
                images={images}
                folderName={folderName}
                metadata={metadata}
                globalTags={globalTags}
            />
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
