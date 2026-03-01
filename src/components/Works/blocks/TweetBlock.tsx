"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "../Works.module.css";
import { MASONRY } from "../masonry.config";
import { computeBlockCols } from "./grid-utils";
import type { WorksBlock } from "@/lib/works-metadata";

interface TweetBlockProps {
    block: WorksBlock;
}

declare global {
    interface Window {
        twttr?: {
            widgets: {
                load: (el?: HTMLElement) => void;
            };
        };
    }
}

export default function TweetBlock({ block }: TweetBlockProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const baseCols = block.cols ?? MASONRY.defaultEmbedCols;
    const [span, setSpan] = useState<number | null>(block.span ?? null);
    const [cols, setCols] = useState(baseCols);

    const computeCols = useCallback(() => {
        const grid = containerRef.current?.closest(`.${styles.masonryGrid}`) as HTMLElement | null;
        if (!grid) return;

        const needed = computeBlockCols(grid, baseCols, MASONRY.tweetMinWidth, block.maxCols);
        setCols(needed);
    }, [baseCols, block.maxCols]);

    const measureSpan = useCallback(() => {
        if (block.span) return;
        const el = containerRef.current;
        if (!el) return;
        const contentHeight = el.scrollHeight;
        if (contentHeight > 0) {
            setSpan(Math.ceil(contentHeight / MASONRY.rowHeight) + MASONRY.gap);
        }
    }, [block.span]);

    useEffect(() => {
        computeCols();
        window.addEventListener("resize", computeCols);
        return () => window.removeEventListener("resize", computeCols);
    }, [computeCols]);

    useEffect(() => {
        if (!document.getElementById("twitter-wjs")) {
            const script = document.createElement("script");
            script.id = "twitter-wjs";
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            document.head.appendChild(script);
        } else if (window.twttr) {
            window.twttr.widgets.load(containerRef.current ?? undefined);
        }

        const interval = setInterval(() => {
            if (window.twttr && containerRef.current) {
                window.twttr.widgets.load(containerRef.current);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [block.tweetId]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => measureSpan());
        observer.observe(el);

        // Also measure after tweet widget likely renders
        const timers = [500, 1000, 2000, 4000].map((ms) =>
            setTimeout(measureSpan, ms)
        );

        return () => {
            observer.disconnect();
            timers.forEach(clearTimeout);
        };
    }, [measureSpan]);

    return (
        <div
            className={styles.embedBlock}
            style={{
                gridRowEnd: span ? `span ${span}` : "span 1",
                gridColumn: `span ${cols}`,
            }}
        >
            <div className={styles.tweetEmbed} ref={containerRef}>
                <blockquote className="twitter-tweet" data-theme="dark">
                    <a href={`https://twitter.com/i/status/${block.tweetId}`}>
                        Loading tweet...
                    </a>
                </blockquote>
            </div>
            {block.caption && (
                <div className={styles.embedCaption}>{block.caption}</div>
            )}
        </div>
    );
}
