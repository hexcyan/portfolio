"use client";

import { useState } from "react";
import styles from "./Gallery.module.css";

interface FolderPreviewImageProps {
    thumbSrc: string;
    microSrc: string;
    alt: string;
}

export default function FolderPreviewImage({ thumbSrc, microSrc, alt }: FolderPreviewImageProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            <img
                src={microSrc}
                alt=""
                aria-hidden="true"
                className={`${styles.folderPreviewPlaceholder} ${loaded ? styles.folderPreviewPlaceholderHidden : ""}`}
            />
            <img
                src={thumbSrc}
                alt={alt}
                className={`${styles.folderPreviewThumb} ${loaded ? styles.folderPreviewLoaded : ""}`}
                loading="lazy"
                ref={(el) => {
                    if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
                }}
                onLoad={() => { if (!loaded) setLoaded(true); }}
            />
        </>
    );
}
