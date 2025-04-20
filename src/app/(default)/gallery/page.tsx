import FileLinks from "@/components/FileLinks";
import { getFolders } from "@/lib/cdn";

export default async function GalleryPage() {
    const images = await getFolders("gallery");
    return (
        <div className="explorer">
            <h1>Gallery</h1>
            <FileLinks arr={images} />
        </div>
    );
}
