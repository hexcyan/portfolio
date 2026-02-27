"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Gallery.module.css";
import GalleryViewer from "./GalleryViewer";
import Spinner from "@/components/Spinner";
import { getCDNConfig } from "@/lib/cdn";

interface GalleryGridProps {
    images: {
        id: string;
        path: string;
        lastModified: string;
    }[];
    folderName: string;
}

const ROW_HEIGHT = 4; // matches grid-auto-rows
const GAP = 3; // rows of gap between items

export default function GalleryGrid({ images, folderName }: GalleryGridProps) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [spans, setSpans] = useState<Record<string, number>>({});
    const [loaded, setLoaded] = useState<Record<string, boolean>>({});
    const gridRef = useRef<HTMLDivElement>(null);

    const { pullZone } = getCDNConfig();

    const computeSpan = useCallback(
        (id: string, naturalWidth: number, naturalHeight: number) => {
            if (!gridRef.current) return;
            const gridStyles = window.getComputedStyle(gridRef.current);
            const columnWidth =
                parseInt(
                    gridStyles
                        .getPropertyValue("grid-template-columns")
                        .split(" ")[0]
                ) || 280;
            const aspectRatio = naturalHeight / naturalWidth;
            const imageHeight = columnWidth * aspectRatio;
            const span = Math.ceil(imageHeight / ROW_HEIGHT) + GAP;
            setSpans((prev) => ({ ...prev, [id]: span }));
        },
        []
    );

    // Load micro-thumbnails for instant aspect ratio + blur placeholder
    useEffect(() => {
        images.forEach((image) => {
            const img = new window.Image();
            img.src = `${pullZone}/${image.path}?width=30&quality=10`;
            img.onload = () => {
                computeSpan(image.id, img.naturalWidth, img.naturalHeight);
            };
        });
    }, [images, pullZone, computeSpan]);

    function openViewer(index: number) {
        setViewerIndex(index);
        setViewerOpen(true);
    }

    function microUrl(path: string) {
        return `${pullZone}/${path}?width=30&quality=10`;
    }

    function thumbUrl(path: string) {
        return `${pullZone}/${path}?width=400&quality=45`;
    }

    function markLoaded(id: string) {
        setLoaded((prev) => ({ ...prev, [id]: true }));
    }

    const hasAnySpan = Object.keys(spans).length > 0;

    return (
        <>
            {!hasAnySpan && (
                <div className={styles.gridLoading}>
                    <Spinner size={22} />
                    <span>Loading gallery...</span>
                </div>
            )}
            <div className={styles.galleryGrid} ref={gridRef}>
                {images.map((image, i) => (
                    <div
                        key={image.id}
                        className={`${styles.gridItem} ${spans[image.id] ? styles.gridItemReady : styles.gridItemPending}`}
                        style={{
                            gridRowEnd: spans[image.id]
                                ? `span ${spans[image.id]}`
                                : "span 1",
                        }}
                        onClick={() => openViewer(i)}
                    >
                        <div className={styles.gridImageWrapper}>
                            {/* Blurred micro placeholder */}
                            {spans[image.id] && (
                                <img
                                    src={microUrl(image.path)}
                                    alt=""
                                    aria-hidden="true"
                                    className={`${styles.gridImage} ${styles.gridPlaceholder}`}
                                />
                            )}
                            {/* Real thumbnail — fades in on load */}
                            <img
                                src={thumbUrl(image.path)}
                                alt={image.id}
                                className={`${styles.gridImage} ${styles.gridThumb} ${loaded[image.id] ? styles.gridThumbLoaded : ""}`}
                                loading="lazy"
                                onLoad={() => markLoaded(image.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {viewerOpen && (
                <GalleryViewer
                    images={images}
                    initialIndex={viewerIndex}
                    folderName={folderName}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
}
