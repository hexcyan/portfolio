"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
    const [layout, setLayout] = useState<LayoutState | null>(null);
    const m = useMasonryGrid();

    // Cache child micro dimensions so resizes don't re-fetch
    const dimsRef = useRef<{ w: number; h: number }[] | null>(null);
    const dimsLoadingRef = useRef(false);
    const [dimsLoaded, setDimsLoaded] = useState(false);

    const children = block.children ?? [];

    /** Load micro thumbnails once, cache in ref */
    const loadDimensions = useCallback((): Promise<{ w: number; h: number }[]> => {
        if (dimsRef.current) return Promise.resolve(dimsRef.current);
        if (dimsLoadingRef.current) {
            return new Promise((resolve) => {
                const check = () => {
                    if (dimsRef.current) resolve(dimsRef.current);
                    else setTimeout(check, 16);
                };
                check();
            });
        }
        dimsLoadingRef.current = true;
        return Promise.all(
            children.map((child) =>
                new Promise<{ w: number; h: number }>((resolve) => {
                    const img = new window.Image();
                    img.src = thumbUrl(childImagePath(child), "micro");
                    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
                    img.onerror = () => resolve({ w: 1, h: 1 });
                })
            )
        ).then((dims) => {
            dimsRef.current = dims;
            dimsLoadingRef.current = false;
            setDimsLoaded(true);
            return dims;
        });
    }, [children]);

    // Kick off dimension loading on mount
    useEffect(() => {
        loadDimensions();
    }, [loadDimensions]);

    // Compute layout from context measurements + cached dims (pure math, no DOM reads)
    useEffect(() => {
        if (!m || !dimsRef.current || children.length === 0) return;
        const dimensions = dimsRef.current;

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
        setLayout({ span, cols: effectiveCols, mode, colGap: m.colGap, rowGap: m.rowGap, rowTemplate });
    }, [m, dimsLoaded, children, block.cols, block.maxCols]);

    // Invalidate cached dims when children change
    useEffect(() => {
        dimsRef.current = null;
        dimsLoadingRef.current = false;
        setDimsLoaded(false);
    }, [children]);

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
