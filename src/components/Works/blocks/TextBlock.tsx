"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import type { WorksBlock } from "@/lib/works-metadata";

const TEXT_MIN_WIDTH = 280;

interface TextBlockProps {
    block: WorksBlock;
}

export default function TextBlock({ block }: TextBlockProps) {
    const baseCols = block.cols ?? 1;
    const cellRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [span, setSpan] = useState<number | null>(block.span ?? null);
    const [cols, setCols] = useState(baseCols);

    const computeLayout = useCallback(() => {
        const grid = cellRef.current?.parentElement;
        if (!grid) return;
        const gridStyles = window.getComputedStyle(grid);
        const colWidths = gridStyles.getPropertyValue("grid-template-columns").split(" ");
        const columnWidth = parseInt(colWidths[0]) || MASONRY.columnFallback;
        const colGap = parseInt(gridStyles.getPropertyValue("column-gap")) || 0;
        const totalGridCols = colWidths.length;

        // Expand columns if needed to meet minimum width
        let needed = baseCols;
        while (needed < totalGridCols && columnWidth * needed + colGap * (needed - 1) < TEXT_MIN_WIDTH) {
            needed++;
        }
        setCols(needed);

        // Measure span after layout settles
        requestAnimationFrame(() => {
            if (block.span) return;
            const el = innerRef.current;
            if (!el) return;
            const contentHeight = el.scrollHeight;
            if (contentHeight > 0) {
                const extra = 32 + 8;
                setSpan(Math.ceil((contentHeight + extra) / MASONRY.rowHeight));
            }
        });
    }, [block.span, block.content, baseCols]);

    useEffect(() => {
        computeLayout();
        window.addEventListener("resize", computeLayout);
        return () => window.removeEventListener("resize", computeLayout);
    }, [computeLayout]);

    return (
        <div
            ref={cellRef}
            className={styles.textBlock}
            style={{
                gridRowEnd: span ? `span ${span}` : "span 1",
                gridColumn: cols ? `span ${cols}` : "1 / -1",
                overflow: "hidden",
            }}
        >
            <div ref={innerRef}>
                {block.content}
            </div>
        </div>
    );
}
