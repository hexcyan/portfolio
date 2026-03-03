"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { computeBlockCols } from "./grid-utils";
import { useMasonryGrid } from "../MasonryContext";
import { thumbUrl } from "@/lib/cdn";
import type { WorksBlock, WorksTagDef } from "@/lib/works-metadata";

interface ImageBlockProps {
    block: WorksBlock;
    tagDefs: WorksTagDef[];
    onClick: () => void;
    /** When true, skip masonry positioning — image fills its parent cell with object-fit: cover */
    contained?: boolean;
}

export default function ImageBlock({ block, tagDefs, onClick, contained }: ImageBlockProps) {
    const [thumbLoaded, setThumbLoaded] = useState(false);
    const m = useMasonryGrid();

    const imagePath = block.folder
        ? `works/${block.folder}/${block.filename}`
        : `works/${block.filename}`;

    const microSrc = thumbUrl(imagePath, "micro");
    const thumbSrc = thumbUrl(imagePath, "thumb");

    const baseCols = block.cols ?? 1;

    // Cache aspect ratio so resizes compute synchronously (no async onload race)
    const aspectRatioRef = useRef<number | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    // Load micro image once to get aspect ratio (skip when contained — not needed)
    useEffect(() => {
        if (contained) return;
        if (aspectRatioRef.current !== null) return;
        const img = new window.Image();
        img.src = microSrc;
        img.onload = () => {
            const ratio = img.naturalHeight / img.naturalWidth;
            aspectRatioRef.current = ratio;
            setAspectRatio(ratio);
        };
    }, [microSrc, contained]);

    let span: number | null = null;
    let cols = baseCols;

    if (!contained && m && aspectRatio !== null) {
        cols = baseCols > 1
            ? computeBlockCols(m, baseCols, 0, block.maxCols)
            : baseCols;

        const totalWidth = m.columnWidth * cols + m.colGap * (cols - 1);
        const imageHeight = totalWidth * aspectRatio;
        span = Math.ceil(imageHeight / MASONRY.rowHeight) + MASONRY.gap;
    }

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

    const cellClass = contained
        ? styles.gridChildCell
        : `${styles.imageCell} ${span ? styles.imageCellReady : styles.imageCellPending}`;

    const imgClass = contained
        ? `${styles.gridChildImg} ${thumbLoaded ? styles.gridChildImgLoaded : ""}`
        : `${styles.imageCellImg} ${thumbLoaded ? styles.imageCellImgLoaded : ""}`;

    const cellStyle = contained
        ? undefined
        : {
            gridRowEnd: span ? `span ${span}` : "span 1",
            ...(cols > 1 ? { gridColumn: `span ${cols}` } : {}),
        };

    return (
        <div
            className={cellClass}
            style={cellStyle}
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
                    className={imgClass}
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
