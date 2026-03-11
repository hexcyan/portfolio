"use client";

import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { computeBlockCols } from "./grid-utils";
import { useMasonryGrid } from "../MasonryContext";
import type { WorksBlock } from "@/lib/works-metadata";

const ASPECT_RATIO = 9 / 16;

interface YouTubeBlockProps {
    block: WorksBlock;
}

export default function YouTubeBlock({ block }: YouTubeBlockProps) {
    const baseCols = block.cols ?? MASONRY.defaultEmbedCols;
    const m = useMasonryGrid();

    // Standalone mode when no masonry context
    if (!m) {
        return (
            <div className={styles.embedStandalone}>
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

    let span: number | null = block.span ?? null;
    let cols = baseCols;

    cols = computeBlockCols(m, baseCols, 0, block.maxCols);

    if (!block.span) {
        const totalWidth = m.columnWidth * cols + m.colGap * (cols - 1);
        const embedHeight = totalWidth * ASPECT_RATIO;
        const captionHeight = block.caption ? 24 : 0;
        span = Math.ceil((embedHeight + captionHeight) / m.rowHeight) + m.gap;
    }

    return (
        <div
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
