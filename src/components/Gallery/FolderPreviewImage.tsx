"use client";

import { useState } from "react";
import styles from "./Gallery.module.css";

interface FolderPreviewImageProps {
    src: string;
    microSrc: string;
    alt: string;
}

export default function FolderPreviewImage({ src, microSrc, alt }: FolderPreviewImageProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            <img
                src={microSrc}
                alt=""
                aria-hidden="true"
                className={`${styles.folderPreviewImage} ${styles.folderPreviewPlaceholder}`}
            />
            <img
                ref={(el) => {
                    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
                }}
                src={src}
                alt={alt}
                className={`${styles.folderPreviewImage} ${styles.folderPreviewThumb} ${loaded ? styles.folderPreviewLoaded : ""}`}
                loading="lazy"
                onLoad={() => setLoaded(true)}
            />
        </>
    );
}
