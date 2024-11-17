import GalleryGrid from "@/components/Gallery/GalleryGrid";
import FileLinks from "@/components/FileLinks";
import { getFolders } from "@/lib/cdn";
import { FileLink, files } from "@/lib/consts";
import styles from "../blog/page.module.css";

export default async function GalleryPage() {
    const images = await getFolders("gallery");
    return (
        <>
            <h1 className={styles.blogTitle}>Gallery</h1>
            <FileLinks arr={images} />
        </>
    );
}
