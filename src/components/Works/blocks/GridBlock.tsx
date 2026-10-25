"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { computeBlockCols } from "./grid-utils";
import { useMasonryGrid } from "../MasonryContext";
import { thumbUrl } from "@/lib/cdn";
import ImageBlock from "./ImageBlock";
import type { WorksBlock, WorksGridChild, WorksTagDef } from "@/lib/works-metadata";

interface GridBlockProps {
    block: WorksBlock;
    tagDefs: WorksTagDef[];
    onImageClick: (block: WorksBlock) => void;
}

type GridMode = "2x2" | "1x4";

interface LayoutState {
    span: number;
    cols: number;
    mode: GridMode;
    colGap: number;
    rowGap: number;
    rowTemplate: string;
}

function childImagePath(child: WorksGridChild): string {
    if (child.path) return child.path;
    return `works/${child.folder}/${child.filename}`;
}

function childToBlock(child: WorksGridChild): WorksBlock {
    return {
        type: "image",
        filename: child.filename,
        folder: child.folder,
        path: child.path,
        caption: child.caption,
        tags: child.tags,
        date: child.date,
        url: child.url,
    };
}

export default function GridBlock({ block, tagDefs, onImageClick }: GridBlockProps) {
    const m = useMasonryGrid();

    const children = useMemo(() => block.children ?? [], [block.children]);

    // Child micro dimensions, tagged with the children they were measured for so a stale set is
    // never used. Only a change of children re-fetches; resizes reuse them.
    const [loaded, setLoaded] = useState<{ children: WorksGridChild[]; dims: { w: number; h: number }[] } | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all(
            children.map((child) =>
                new Promise<{ w: number; h: number }>((resolve) => {
                    const img = new window.Image();
                    img.src = thumbUrl(childImagePath(child), "micro");
                    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
                    img.onerror = () => resolve({ w: 1, h: 1 });
                })
            )
        ).then((dims) => {
            if (!cancelled) setLoaded({ children, dims });
        });
        return () => {
            cancelled = true;
        };
    }, [children]);

    const dimensions = loaded?.children === children ? loaded.dims : null;

    // Layout from context measurements + dims (pure math, no DOM reads)
    const layout = useMemo((): LayoutState | null => {
        if (!m || !dimensions || children.length === 0) return null;

        const baseCols = block.cols ?? MASONRY.defaultGridCols;
        const effectiveCols = Math.min(
            baseCols > 1 ? computeBlockCols(m, baseCols, 0, block.maxCols) : baseCols,
            m.totalGridCols
        );

        const totalWidth = m.columnWidth * effectiveCols + m.colGap * (effectiveCols - 1);

        let mode: GridMode = "2x2";
        if (m.totalGridCols >= 3 && m.totalGridCols <= 5 && effectiveCols >= 3 && totalWidth >= 1000) {
            mode = "1x4";
        }


        let totalHeight: number;
        let rowTemplate: string;

        if (mode === "2x2") {
            const cellW = (totalWidth - m.colGap) / 2;
            const row1H = Math.max(
                cellW * (dimensions[0].h / dimensions[0].w),
                cellW * ((dimensions[1]?.h ?? dimensions[0].h) / (dimensions[1]?.w ?? dimensions[0].w)),
            );
            const row2H = Math.max(
                cellW * ((dimensions[2]?.h ?? dimensions[0].h) / (dimensions[2]?.w ?? dimensions[0].w)),
                cellW * ((dimensions[3]?.h ?? dimensions[0].h) / (dimensions[3]?.w ?? dimensions[0].w)),
            );
            rowTemplate = `${row1H}fr ${row2H}fr`;
            totalHeight = row1H + row2H + m.rowGap;
        } else {
            const cellW = (totalWidth - m.colGap * 3) / 4;
            const rowH = Math.max(...dimensions.map((d) => cellW * (d.h / d.w)));
            rowTemplate = "1fr";
            totalHeight = rowH;
        }

        const span = Math.ceil(totalHeight / m.rowHeight) + m.gap;
        return { span, cols: effectiveCols, mode, colGap: m.colGap, rowGap: m.rowGap, rowTemplate };
    }, [m, dimensions, children.length, block.cols, block.maxCols]);

    const innerColTemplate = layout
        ? layout.mode === "1x4" ? "repeat(4, 1fr)" : "1fr 1fr"
        : undefined;

    return (
        <div
            className={`${styles.gridBlock} ${layout ? styles.gridBlockReady : styles.gridBlockPending}`}
            style={{
                gridRowEnd: layout ? `span ${layout.span}` : "span 1",
                ...(layout && layout.cols > 1 ? { gridColumn: `span ${layout.cols}` } : {}),
            }}
        >
            <div
                className={styles.gridBlockInner}
                style={{
                    gridTemplateColumns: innerColTemplate,
                    gridTemplateRows: layout?.rowTemplate,
                    columnGap: layout?.colGap ?? 0,
                    rowGap: layout?.rowGap ?? 0,
                }}
            >
                {children.map((child, i) => {
                    const childBlock = childToBlock(child);
                    return (
                        <ImageBlock
                            key={`${child.filename}-${i}`}
                            block={childBlock}
                            tagDefs={tagDefs}
                            onClick={() => onImageClick(childBlock)}
                            contained
                        />
                    );
                })}
            </div>
        </div>
    );
}
