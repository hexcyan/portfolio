"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { thumbUrl } from "@/lib/cdn";
import type { WorksBlock, WorksTagDef } from "@/lib/works-metadata";

interface ImageBlockProps {
    block: WorksBlock;
    tagDefs: WorksTagDef[];
    onClick: () => void;
}

export default function ImageBlock({ block, tagDefs, onClick }: ImageBlockProps) {
    const [span, setSpan] = useState<number | null>(null);
    const [thumbLoaded, setThumbLoaded] = useState(false);
    const cellRef = useRef<HTMLDivElement>(null);

    const imagePath = block.folder
        ? `works/${block.folder}/${block.filename}`
        : `works/${block.filename}`;

    const microSrc = thumbUrl(imagePath, "micro");
    const thumbSrc = thumbUrl(imagePath, "thumb");

    const cols = block.cols ?? 1;

    const computeSpan = useCallback(() => {
        const grid = cellRef.current?.parentElement;
        if (!grid) return;
        const gridStyles = window.getComputedStyle(grid);
        const colWidths = gridStyles.getPropertyValue("grid-template-columns").split(" ");
        const columnWidth = parseInt(colWidths[0]) || MASONRY.columnFallback;
        const colGap = parseInt(gridStyles.getPropertyValue("column-gap")) || 0;
        const totalWidth = columnWidth * cols + colGap * (cols - 1);
        const img = new window.Image();
        img.src = microSrc;
        img.onload = () => {
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            const imageHeight = totalWidth * aspectRatio;
            setSpan(Math.ceil(imageHeight / MASONRY.rowHeight) + MASONRY.gap);
        };
    }, [microSrc, cols]);

    useEffect(() => {
        computeSpan();
        window.addEventListener("resize", computeSpan);
        return () => window.removeEventListener("resize", computeSpan);
    }, [computeSpan]);

    function getTagColor(tagId: string): string | undefined {
        return tagDefs.find((t) => t.id === tagId)?.color;
    }

    function getTagLabel(tagId: string): string {
        return tagDefs.find((t) => t.id === tagId)?.label ?? tagId;
    }

    const isLink = !!block.url;
    const hasOverlay = block.caption || block.tags.length > 0 || block.date;

    function handleLinkClick(e: React.MouseEvent) {
        e.stopPropagation();
        window.open(block.url, "_blank", "noopener,noreferrer");
    }

    return (
        <div
            ref={cellRef}
            className={`${styles.imageCell} ${span ? styles.imageCellReady : styles.imageCellPending
                }`}
            style={{
                gridRowEnd: span ? `span ${span}` : "span 1",
                ...(cols > 1 ? { gridColumn: `span ${cols}` } : {}),
            }}
            onClick={onClick}
        >
            <div className={styles.imageCellInner}>
                {/* Blur-up micro placeholder */}
                <img
                    src={microSrc}
                    alt=""
                    aria-hidden="true"
                    className={`${styles.blurPlaceholder} ${thumbLoaded ? styles.blurHidden : ""}`}
                />
                {/* Thumb image */}
                <img
                    src={thumbSrc}
                    alt={block.caption || block.filename || ""}
                    className={`${styles.imageCellImg} ${thumbLoaded ? styles.imageCellImgLoaded : ""}`}
                    loading="lazy"
                    ref={(el) => {
                        if (el?.complete && el.naturalWidth > 0 && !thumbLoaded) setThumbLoaded(true);
                    }}
                    onLoad={() => { if (!thumbLoaded) setThumbLoaded(true); }}
                />
                {isLink && <span className={styles.linkBadge} onClick={handleLinkClick}>&#x2197;</span>}
                {hasOverlay && (
                    <div className={styles.imageOverlay}>
                        {block.caption && (
                            <span className={styles.overlayCaption}>
                                {block.caption}
                            </span>
                        )}
                        {block.date && (
                            <span className={styles.overlayDate}>{block.date}</span>
                        )}
                        {block.tags.length > 0 && (
                            <span className={styles.overlayTags}>
                                {block.tags.map((tagId) => (
                                    <span
                                        key={tagId}
                                        className={styles.overlayTag}
                                        style={
                                            getTagColor(tagId)
                                                ? {
                                                    borderColor: getTagColor(tagId),
                                                    color: getTagColor(tagId),
                                                }
                                                : undefined
                                        }
                                    >
                                        {getTagLabel(tagId)}
                                    </span>
                                ))}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
