import { getImagesFromFolder } from "@/lib/cdn";
import GalleryGrid from "@/components/Gallery/GalleryGrid";

interface GalleryPageProps {
    params: {
        location: string;
    };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
    const { location } = params;

    const images = await getImagesFromFolder(location);
    console.log(images);
    try {
        return (
            <div>
                <h1>
                    {location.charAt(0).toUpperCase() + location.slice(1)}{" "}
                    Gallery
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
