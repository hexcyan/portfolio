"use client";

import { useRef } from "react";
import styles from "./Works.module.css";
import { MASONRY } from "./masonry.config";
import ImageBlock from "./blocks/ImageBlock";
import TextBlock from "./blocks/TextBlock";
import YouTubeBlock from "./blocks/YouTubeBlock";
import TweetBlock from "./blocks/TweetBlock";
import type { WorksBlock, WorksSubsection, WorksTagDef } from "@/lib/works-metadata";

interface WorksSubsectionProps {
    subsection: WorksSubsection;
    sectionColumnMinWidth?: number;
    sectionMaxColumns?: number;
    sectionAlign?: "left" | "center" | "right";
    tagDefs: WorksTagDef[];
    onImageClick: (block: WorksBlock) => void;
}

const ALIGN_MAP = { left: "start", center: "center", right: "end" } as const;

export default function WorksSubsectionComponent({
    subsection,
    sectionColumnMinWidth,
    sectionMaxColumns,
    sectionAlign,
    tagDefs,
    onImageClick,
}: WorksSubsectionProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    const colMin = subsection.columnMinWidth ?? sectionColumnMinWidth ?? MASONRY.columnMinWidth;
    const colMinMobile = MASONRY.columnMinWidthMobile;
    const maxColumns = subsection.maxColumns ?? sectionMaxColumns ?? MASONRY.maxColumns;
    const align = subsection.align ?? sectionAlign;
    const maxWidth = maxColumns * colMin;

    return (
        <div className={styles.subsectionBlock}>
            <div className={styles.subsectionHeader}>
                <span className={styles.subsectionTitle}>{subsection.title}</span>
                {subsection.dateRange && (
                    <span className={styles.subsectionDateRange}>
                        {subsection.dateRange}
                    </span>
                )}
            </div>

            {subsection.description && (
                <p className={styles.subsectionDescription}>
                    {subsection.description}
                </p>
            )}

            <div
                className={styles.masonryGrid}
                ref={gridRef}
                style={{
                    "--masonry-col-min": `${colMin}px`,
                    "--masonry-col-min-mobile": `${colMinMobile}px`,
                    "--masonry-row-height": `${MASONRY.rowHeight}px`,
                    "--masonry-max-width": `${maxWidth}px`,
                    "--masonry-align": align ? ALIGN_MAP[align] : "start",
                } as React.CSSProperties}
            >
                {subsection.blocks.map((block, i) => {
                    const key = block.type === "image"
                        ? `img-${block.filename}-${i}`
                        : `${block.type}-${i}`;

                    switch (block.type) {
                        case "image":
                            return (
                                <ImageBlock
                                    key={key}
                                    block={block}
                                    tagDefs={tagDefs}
                                    onClick={() => onImageClick(block)}
                                />
                            );
                        case "text":
                            return <TextBlock key={key} block={block} />;
                        case "youtube":
                            return <YouTubeBlock key={key} block={block} />;
                        case "tweet":
                            return <TweetBlock key={key} block={block} />;
                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
}
