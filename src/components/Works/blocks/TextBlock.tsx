"use client";

import { useRef, useState, useEffect } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import type { WorksBlock } from "@/lib/works-metadata";

interface TextBlockProps {
    block: WorksBlock;
}

export default function TextBlock({ block }: TextBlockProps) {
    const cols = block.cols;
    const innerRef = useRef<HTMLDivElement>(null);
    const [span, setSpan] = useState<number | null>(block.span ?? null);

    // Measure intrinsic content height once via a hidden sizer,
    // avoiding the feedback loop that a ResizeObserver would cause.
    useEffect(() => {
        if (block.span) return;
        const el = innerRef.current;
        if (!el) return;
        // scrollHeight of the inner div isn't affected by grid-row-end
        const contentHeight = el.scrollHeight;
        if (contentHeight > 0) {
            // Account for .textBlock padding (16px * 2) and margin (4px * 2)
            const extra = 32 + 8;
            setSpan(Math.ceil((contentHeight + extra) / MASONRY.rowHeight));
        }
    }, [block.span, block.content]);

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
