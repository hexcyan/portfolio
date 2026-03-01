"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../Works.module.css";
import type { WorksBlock } from "@/lib/works-metadata";

const ROW_HEIGHT = 4;
const GAP = 3;
const DEFAULT_COLS = 2;
const ASPECT_RATIO = 9 / 16;

interface YouTubeBlockProps {
    block: WorksBlock;
}

export default function YouTubeBlock({ block }: YouTubeBlockProps) {
    const cols = block.cols ?? DEFAULT_COLS;
    const cellRef = useRef<HTMLDivElement>(null);
    const [span, setSpan] = useState<number | null>(block.span ?? null);

    const computeSpan = useCallback(() => {
        if (block.span) return;
        const grid = cellRef.current?.parentElement;
        if (!grid) return;
        const gridStyles = window.getComputedStyle(grid);
        const colWidths = gridStyles.getPropertyValue("grid-template-columns").split(" ");
        const columnWidth = parseInt(colWidths[0]) || 260;
        const totalWidth = columnWidth * cols + 12 * (cols - 1);
        const embedHeight = totalWidth * ASPECT_RATIO;
        const captionHeight = block.caption ? 24 : 0;
        setSpan(Math.ceil((embedHeight + captionHeight + 8) / ROW_HEIGHT) + GAP);
    }, [block.span, block.caption, cols]);

    useEffect(() => {
        computeSpan();
        window.addEventListener("resize", computeSpan);
        return () => window.removeEventListener("resize", computeSpan);
    }, [computeSpan]);

    return (
        <div
            ref={cellRef}
            className={styles.embedBlock}
            style={{
                gridRowEnd: span ? `span ${span}` : "span 1",
                gridColumn: `span ${cols}`,
                opacity: span ? 1 : 0,
            }}
        >
            <div className={styles.youtubeEmbed}>
                <iframe
                    src={`https://www.youtube.com/embed/${block.videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={block.caption || "YouTube video"}
                />
            </div>
            {block.caption && (
                <div className={styles.embedCaption}>{block.caption}</div>
            )}
        </div>
    );
}
