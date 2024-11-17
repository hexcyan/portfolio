import styles from "./Gallery.module.css";
import GalleryImage from "./GalleryImage";

interface GalleryGridProps {
    images: {
        id: string;
        path: string;
        lastModified: string;
    }[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
    return (
        <div className={styles.galleryGrid}>
            {images.map((image) => (
                <GalleryImage
                    key={image.id}
                    imageId={`${image.path}`}
                    alt={image.id}
                    thumbnailWidth={300}
                />
            ))}
        </div>
    );
}
