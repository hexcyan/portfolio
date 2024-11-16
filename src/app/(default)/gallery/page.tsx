"use client";

import GalleryImage from "@/components/GalleryImage";

export default function Gallery() {
    return (
        <GalleryImage
            imageId="shanghai/DSC01622.jpg"
            alt="daniel_happy"
            thumbnailWidth={300}
            thumbnailHeight={200}
            modalWidth={1200}
            modalHeight={800}
        />
    );
}
