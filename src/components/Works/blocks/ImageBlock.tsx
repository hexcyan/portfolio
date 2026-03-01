"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "../Works.module.css";
import { getCDNConfig } from "@/lib/cdn";
import type { WorksBlock, WorksTagDef } from "@/lib/works-metadata";

interface ImageBlockProps {
    block: WorksBlock;
    tagDefs: WorksTagDef[];
    onClick: () => void;
}

const ROW_HEIGHT = 4;
const GAP = 3;

export default function ImageBlock({ block, tagDefs, onClick }: ImageBlockProps) {
    const [span, setSpan] = useState<number | null>(null);
    const cellRef = useRef<HTMLDivElement>(null);
    const { pullZone } = getCDNConfig();

    const imagePath = block.folder
        ? `works/${block.folder}/${block.filename}`
        : `works/${block.filename}`;

    const imageUrl = `${pullZone}/${imagePath}`;

    const computeSpan = useCallback(() => {
        const grid = cellRef.current?.parentElement;
        if (!grid) return;
        const gridStyles = window.getComputedStyle(grid);
        const columnWidth =
            parseInt(
                gridStyles.getPropertyValue("grid-template-columns").split(" ")[0]
            ) || 260;
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = () => {
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            const imageHeight = columnWidth * aspectRatio;
            setSpan(Math.ceil(imageHeight / ROW_HEIGHT) + GAP);
        };
    }, [imageUrl]);

    useEffect(() => {
        computeSpan();
    }, [computeSpan]);

    function getTagColor(tagId: string): string | undefined {
        return tagDefs.find((t) => t.id === tagId)?.color;
    }

    function getTagLabel(tagId: string): string {
        return tagDefs.find((t) => t.id === tagId)?.label ?? tagId;
    }

    const isLink = !!block.url;
    const hasOverlay = block.caption || block.tags.length > 0 || block.date;

    function handleClick() {
        if (isLink) {
            window.open(block.url, "_blank", "noopener,noreferrer");
        } else {
            onClick();
        }
    }

    return (
        <div
            ref={cellRef}
            className={`${styles.imageCell} ${span ? styles.imageCellReady : styles.imageCellPending
                }`}
            style={{ gridRowEnd: span ? `span ${span}` : "span 1" }}
            onClick={handleClick}
        >
            <div className={styles.imageCellInner}>
                <img
                    src={imageUrl}
                    alt={block.caption || block.filename || ""}
                    className={styles.imageCellImg}
                    loading="lazy"
                />
                {isLink && <span className={styles.linkBadge}>&#x2197;</span>}
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
