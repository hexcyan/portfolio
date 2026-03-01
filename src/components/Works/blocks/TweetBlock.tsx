"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "../Works.module.css";
import type { WorksBlock } from "@/lib/works-metadata";

const ROW_HEIGHT = 4;
const GAP = 3;
const DEFAULT_COLS = 2;

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
    const cols = block.cols ?? DEFAULT_COLS;
    const [span, setSpan] = useState<number | null>(block.span ?? null);

    const measureSpan = useCallback(() => {
        if (block.span) return;
        const el = containerRef.current;
        if (!el) return;
        const contentHeight = el.scrollHeight;
        if (contentHeight > 0) {
            setSpan(Math.ceil(contentHeight / ROW_HEIGHT) + GAP);
        }
    }, [block.span]);

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
