"use client";

import { useRef, useState, useEffect } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { computeBlockCols } from "./grid-utils";
import { useMasonryGrid } from "../MasonryContext";
import type { WorksBlock } from "@/lib/works-metadata";

interface TextBlockProps {
    block: WorksBlock;
}

export default function TextBlock({ block }: TextBlockProps) {
    const baseCols = block.cols ?? 1;
    const innerRef = useRef<HTMLDivElement>(null);
    const [span, setSpan] = useState<number | null>(block.span ?? null);
    const m = useMasonryGrid();

    const cols = m ? computeBlockCols(m, baseCols, MASONRY.textMinWidth, block.maxCols) : baseCols;

    // Re-measure scrollHeight when grid measurements change (column width affects text reflow)
    useEffect(() => {
        if (block.span || !m) return;
        // Wait one frame for the new column span to apply before measuring
        requestAnimationFrame(() => {
            const el = innerRef.current;
            if (!el) return;
            const contentHeight = el.scrollHeight;
            if (contentHeight > 0) {
                const extra = 32 + 8;
                setSpan(Math.ceil((contentHeight + extra) / m.rowHeight));
            }
        });
    }, [m, cols, block.span, block.content]);

    return (
        <div
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
