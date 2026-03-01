"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import styles from "../Works.module.css";
import type { WorksBlock } from "@/lib/works-metadata";

const ROW_HEIGHT = 4;
const GAP = 3;

interface TextBlockProps {
    block: WorksBlock;
}

export default function TextBlock({ block }: TextBlockProps) {
    const cols = block.cols;
    const cellRef = useRef<HTMLDivElement>(null);
    const [span, setSpan] = useState<number | null>(block.span ?? null);

    const measureSpan = useCallback(() => {
        if (block.span) return;
        const el = cellRef.current;
        if (!el) return;
        const contentHeight = el.scrollHeight;
        if (contentHeight > 0) {
            setSpan(Math.ceil(contentHeight / ROW_HEIGHT) + GAP);
        }
    }, [block.span]);

    useEffect(() => {
        measureSpan();

        const observer = new ResizeObserver(() => measureSpan());
        if (cellRef.current) observer.observe(cellRef.current);
        return () => observer.disconnect();
    }, [measureSpan]);

    return (
        <div
            ref={cellRef}
            className={styles.textBlock}
            style={{
                gridRowEnd: span ? `span ${span}` : "span 1",
                gridColumn: cols ? `span ${cols}` : "1 / -1",
            }}
        >
            {block.content}
        </div>
    );
}
