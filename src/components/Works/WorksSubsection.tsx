"use client";

import { useRef } from "react";
import styles from "./Works.module.css";
import { MASONRY } from "./masonry.config";
import { MasonryProvider } from "./MasonryContext";
import ImageBlock from "./blocks/ImageBlock";
import TextBlock from "./blocks/TextBlock";
import YouTubeBlock from "./blocks/YouTubeBlock";
import TweetBlock from "./blocks/TweetBlock";
import GridBlock from "./blocks/GridBlock";
import type { WorksBlock, WorksSubsection, WorksTagDef } from "@/lib/works-metadata";

interface WorksSubsectionProps {
    subsection: WorksSubsection;
    sectionColumnMinWidth?: number;
    sectionMaxColumns?: number;
    sectionAlign?: "left" | "center" | "right";
    tagDefs: WorksTagDef[];
    onImageClick: (block: WorksBlock) => void;
}

const JUSTIFY_MAP = {
    left: "start",
    center: "center",
    right: "end",
} as const;

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
    const maxColumns = subsection.maxColumns ?? sectionMaxColumns;
    const align = subsection.align ?? sectionAlign;
    const maxWidth = maxColumns ? maxColumns * colMin : undefined;

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
                    ...(maxWidth ? { "--masonry-max-width": `${maxWidth}px` } : {}),
                    ...(align ? {
                        "--masonry-justify": JUSTIFY_MAP[align],
                        "--masonry-col-max": `${colMin}px`,
                        ...(maxWidth ? {
                            marginInlineStart: align === "right" ? "auto" : undefined,
                            marginInlineEnd: align === "left" ? "auto" : undefined,
                            ...(align === "center" ? { marginInline: "auto" } : {}),
                        } : {}),
                    } : {}),
                } as React.CSSProperties}
            >
                <MasonryProvider gridRef={gridRef}>
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
                            case "grid":
                                return (
                                    <GridBlock
                                        key={key}
                                        block={block}
                                        tagDefs={tagDefs}
                                        onImageClick={onImageClick}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </MasonryProvider>
            </div>
        </div>
    );
}
