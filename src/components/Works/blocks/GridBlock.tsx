"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { computeBlockCols } from "./grid-utils";
import { thumbUrl } from "@/lib/cdn";
import type { WorksBlock, WorksGridChild } from "@/lib/works-metadata";

interface GridBlockProps {
    block: WorksBlock;
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
    return `works/${child.folder}/${child.filename}`;
}

export default function GridBlock({ block, onImageClick }: GridBlockProps) {
    const [layout, setLayout] = useState<LayoutState | null>(null);
    const [thumbsLoaded, setThumbsLoaded] = useState<boolean[]>([]);
    const cellRef = useRef<HTMLDivElement>(null);

    // Cache child micro dimensions so resizes don't re-fetch
    const dimsRef = useRef<{ w: number; h: number }[] | null>(null);
    const dimsLoadingRef = useRef(false);

    const children = block.children ?? [];

    /** Load micro thumbnails once, cache in ref */
    const loadDimensions = useCallback((): Promise<{ w: number; h: number }[]> => {
        if (dimsRef.current) return Promise.resolve(dimsRef.current);
        if (dimsLoadingRef.current) {
            // Already loading — poll until done
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
            return dims;
        });
    }, [children]);

    const computeLayout = useCallback(() => {
        const grid = cellRef.current?.parentElement;
        if (!grid || children.length === 0) return;

        // 1. Get the raw grid tracks
        const gridStyles = window.getComputedStyle(grid);
        const templateCols = gridStyles.getPropertyValue("grid-template-columns");

        if (!templateCols || templateCols === "none") return;

        const colWidths = templateCols.split(" ").filter(w => w !== "0px");
        const totalGridCols = colWidths.length;

        // 2. IMPORTANT: Re-calculate effectiveCols based on the NEW totalGridCols
        // If we don't do this, it stays stuck in the "span" of the previous mode
        const baseCols = block.cols ?? MASONRY.defaultGridCols;

        // Ensure effectiveCols never exceeds the current available grid columns
        const effectiveCols = Math.min(
            baseCols > 1 ? computeBlockCols(grid, baseCols, 0, block.maxCols) : baseCols,
            totalGridCols
        );

        // 3. Logic for Mode Switching (The "1x4" vs "2x2" toggle)
        let mode: GridMode = "2x2";

        // If the grid is medium-sized AND the block is wide, go 1x4
        // Otherwise (Small mobile OR Large desktop), go 2x2
        if (totalGridCols >= 3 && totalGridCols <= 5 && effectiveCols >= 3) {
            mode = "1x4";
        } else {
            mode = "2x2";
        }

        const columnWidth = parseFloat(colWidths[0]) || MASONRY.columnFallback;
        const colGap = parseFloat(gridStyles.getPropertyValue("column-gap")) || 0;
        const rowGap = parseFloat(gridStyles.getPropertyValue("row-gap")) || 0;

        const totalWidth = columnWidth * effectiveCols + colGap * (effectiveCols - 1);

        loadDimensions().then((dimensions) => {
            if (cellRef.current?.parentElement !== grid) return;

            let totalHeight: number;
            let rowTemplate: string;

            if (mode === "2x2") {
                const cellW = (totalWidth - colGap) / 2;
                const row1H = Math.max(
                    cellW * (dimensions[0].h / dimensions[0].w),
                    cellW * ((dimensions[1]?.h ?? dimensions[0].h) / (dimensions[1]?.w ?? dimensions[0].w)),
                );
                const row2H = Math.max(
                    cellW * ((dimensions[2]?.h ?? dimensions[0].h) / (dimensions[2]?.w ?? dimensions[0].w)),
                    cellW * ((dimensions[3]?.h ?? dimensions[0].h) / (dimensions[3]?.w ?? dimensions[0].w)),
                );
                rowTemplate = `${row1H}fr ${row2H}fr`;
                totalHeight = row1H + row2H + rowGap;
            } else {
                const cellW = (totalWidth - colGap * 3) / 4;
                const rowH = Math.max(...dimensions.map((d) => cellW * (d.h / d.w)));
                rowTemplate = "1fr";
                totalHeight = rowH;
            }

            const span = Math.ceil(totalHeight / MASONRY.rowHeight) + MASONRY.gap;

            // Set the layout state all at once
            setLayout({ span, cols: effectiveCols, mode, colGap, rowGap, rowTemplate });
        });
    }, [children, block.cols, block.maxCols, loadDimensions]);

    useEffect(() => {
        // 1. Initial compute
        computeLayout();

        // 2. Observe the PARENT grid (the source of truth for our dimensions)
        const grid = cellRef.current?.parentElement;
        if (!grid) return;

        const observer = new ResizeObserver(() => {
            // requestAnimationFrame ensures we aren't "layout thrashing" 
            // by reading styles while the browser is still painting.
            requestAnimationFrame(() => {
                computeLayout();
            });
        });

        observer.observe(grid);

        return () => observer.disconnect();
    }, [computeLayout]);

    // Invalidate cached dims when children change
    useEffect(() => {
        dimsRef.current = null;
        dimsLoadingRef.current = false;
    }, [children]);

    // Track which thumbs have loaded
    useEffect(() => {
        setThumbsLoaded(new Array(children.length).fill(false));
    }, [children.length]);

    function handleThumbLoad(index: number) {
        setThumbsLoaded((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
    }

    function handleChildClick(child: WorksGridChild) {
        onImageClick({
            type: "image",
            filename: child.filename,
            folder: child.folder,
            caption: child.caption,
            tags: child.tags,
            date: child.date,
            url: child.url,
        });
    }

    // Inner grid columns mirror parent tracks:
    // 2x2 → 2 cols at parent column width (with parent gap between)
    // 1x4 → 4 cols at parent column width (with parent gaps between)
    const innerColTemplate = layout
        ? layout.mode === "1x4" ? "repeat(4, 1fr)" : "1fr 1fr"
        : undefined;

    return (
        <div
            ref={cellRef}
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
                    const imagePath = childImagePath(child);
                    const microSrc = thumbUrl(imagePath, "micro");
                    const thumbSrc = thumbUrl(imagePath, "thumb");
                    const loaded = thumbsLoaded[i] ?? false;

                    return (
                        <div
                            key={`${child.filename}-${i}`}
                            className={styles.gridChildCell}
                            onClick={() => handleChildClick(child)}
                        >
                            {/* Blur-up micro placeholder */}
                            <img
                                src={microSrc}
                                alt=""
                                aria-hidden="true"
                                className={`${styles.blurPlaceholder} ${loaded ? styles.blurHidden : ""}`}
                            />
                            {/* Thumb image */}
                            <img
                                src={thumbSrc}
                                alt={child.caption || child.filename}
                                className={`${styles.gridChildImg} ${loaded ? styles.gridChildImgLoaded : ""}`}
                                loading="lazy"
                                ref={(el) => {
                                    if (el?.complete && el.naturalWidth > 0 && !loaded) handleThumbLoad(i);
                                }}
                                onLoad={() => { if (!loaded) handleThumbLoad(i); }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
