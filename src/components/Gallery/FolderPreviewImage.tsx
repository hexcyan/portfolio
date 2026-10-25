import styles from "./Gallery.module.css";

interface FolderPreviewImageProps {
    thumbSrc: string;
    /** Blur placeholder: a data URI from the deploy-time manifest, or the micro thumb URL */
    blurSrc: string;
    alt: string;
}

/** Cover photo over its blur placeholder. The photo paints over the blur as soon as it loads; nothing waits for JS. */
export default function FolderPreviewImage({ thumbSrc, blurSrc, alt }: FolderPreviewImageProps) {
    return (
        <>
            <img
                src={blurSrc}
                alt=""
                aria-hidden="true"
                className={styles.folderPreviewPlaceholder}
            />
            <img
                src={thumbSrc}
                alt={alt}
                className={styles.folderPreviewThumb}
                loading="lazy"
            />
        </>
    );
}
