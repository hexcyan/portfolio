"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "./Gallery.module.css";
import GalleryViewer from "./GalleryViewer";
import Spinner from "@/components/Spinner";
import { getCDNConfig } from "@/lib/cdn";
import type { AlbumMetadata } from "@/lib/gallery-metadata";

interface GalleryGridProps {
    images: {
        id: string;
        path: string;
        lastModified: string;
    }[];
    folderName: string;
    metadata?: AlbumMetadata | null;
}

const ROW_HEIGHT = 4; // matches grid-auto-rows
const GAP = 3; // rows of gap between items

export default function GalleryGrid({ images, folderName, metadata }: GalleryGridProps) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [spans, setSpans] = useState<Record<string, number>>({});
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
    const gridRef = useRef<HTMLDivElement>(null);

    const { pullZone } = getCDNConfig();

    // Collect all unique image-level tags
    const allImageTags = useMemo(() => {
        if (!metadata?.images) return [];
        const tagSet = new Set<string>();
        Object.values(metadata.images).forEach((img) => {
            img.tags?.forEach((t) => tagSet.add(t));
        });
        return Array.from(tagSet).sort();
    }, [metadata]);

    // Filter images by active tags
    const filteredImages = useMemo(() => {
        if (activeTags.size === 0) return images;
        return images.filter((img) => {
            const imgMeta = metadata?.images?.[img.id];
            if (!imgMeta?.tags) return false;
            return imgMeta.tags.some((t) => activeTags.has(t));
        });
    }, [images, activeTags, metadata]);

    function toggleTag(tag: string) {
        setActiveTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else next.add(tag);
            return next;
        });
    }

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

    useEffect(() => {
        images.forEach((image) => {
            const img = new window.Image();
            img.src = `${pullZone}/${image.path}`;
            img.onload = () => {
                computeSpan(image.id, img.naturalWidth, img.naturalHeight);
            };
        });
    }, [images, pullZone, computeSpan]);

    function openViewer(index: number) {
        const image = filteredImages[index];
        const fullIndex = images.indexOf(image);
        setViewerIndex(fullIndex);
        setViewerOpen(true);
    }

    function imageUrl(path: string) {
        return `${pullZone}/${path}`;
    }

    const hasAnySpan = Object.keys(spans).length > 0;

    return (
        <>
            {allImageTags.length > 0 && (
                <div className={styles.tagBar}>
                    <span className={styles.tagBarLabel}>filter:</span>
                    {allImageTags.map((tag) => (
                        <button
                            key={tag}
                            className={`${styles.tagPill} ${activeTags.has(tag) ? styles.tagPillActive : ""}`}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                    {activeTags.size > 0 && (
                        <button
                            className={styles.tagClear}
                            onClick={() => setActiveTags(new Set())}
                        >
                            clear all
                        </button>
                    )}
                </div>
            )}

            {!hasAnySpan && (
                <div className={styles.gridLoading}>
                    <Spinner size={22} />
                    <span>Loading gallery...</span>
                </div>
            )}
            <div className={styles.galleryGrid} ref={gridRef}>
                {filteredImages.map((image, i) => {
                    const imgMeta = metadata?.images?.[image.id];
                    const caption = imgMeta?.caption;
                    const imgTags = imgMeta?.tags;
                    const hasOverlay = caption || (imgTags && imgTags.length > 0);
                    return (
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
                                <img
                                    src={imageUrl(image.path)}
                                    alt={image.id}
                                    className={styles.gridImage}
                                    loading="lazy"
                                />
                                {hasOverlay && (
                                    <div className={styles.imageCaption}>
                                        {caption && <span className={styles.imageCaptionText}>{caption}</span>}
                                        {imgTags && imgTags.length > 0 && (
                                            <span className={styles.imageCaptionTags}>
                                                {imgTags.map((tag) => (
                                                    <span key={tag} className={styles.imageCaptionTag}>{tag}</span>
                                                ))}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {viewerOpen && (
                <GalleryViewer
                    images={images}
                    initialIndex={viewerIndex}
                    folderName={folderName}
                    metadata={metadata}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
}
