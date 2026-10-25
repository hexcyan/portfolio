"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import styles from "./BlogCompare.module.css";
import worksStyles from "@/components/Works/Works.module.css";
import { getCDNConfig } from "@/lib/cdn";

interface CompareProps {
    /** CDN image path of the "before" screenshot, e.g. "blog/keebsoc/events-before.jpg". */
    before: string;
    /** CDN image path of the "after" screenshot. */
    after: string;
    beforeLabel?: string;
    afterLabel?: string;
    /** Optional caption under the comparison. */
    caption?: string;
    /** Pane height in px. A string because MDX attributes are plain strings. */
    height?: string;
}

type Side = "before" | "after";

/** Narrowest a pane may get before the comparison shows one pane at a time. */
const MIN_PANE = 480;
const GAP = 12;

/** CDN paths resolve against the pull zone; absolute paths and URLs pass through. */
function resolve(src: string) {
    if (src.startsWith("/") || /^https?:\/\//.test(src)) return src;
    return `${getCDNConfig().pullZone}/${src}`;
}

/** How far down a pane is, from 0 (top) to 1 (bottom). */
function ratioOf(el: HTMLElement) {
    const max = el.scrollHeight - el.clientHeight;
    return max > 0 ? el.scrollTop / max : 0;
}

function scrollToRatio(el: HTMLElement, ratio: number) {
    el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
}

/**
 * Two full-page screenshots side by side, each scrolling in its own pane.
 * Scrolling either pane moves the other to the same relative position (the
 * pages are rarely the same length). On narrow screens only one pane shows,
 * with a Before/After toggle that keeps your place.
 */
export function Compare({
    before,
    after,
    beforeLabel = "Before",
    afterLabel = "After",
    caption,
    height = "560",
}: CompareProps) {
    const panes = useRef<Record<Side, HTMLDivElement | null>>({ before: null, after: null });
    // A pane we just scrolled programmatically ignores its next scroll event,
    // so the two panes don't keep re-syncing each other.
    const ignore = useRef<Record<Side, boolean>>({ before: false, after: false });
    const lastRatio = useRef(0);
    const [shown, setShown] = useState<Side>("after");
    // Layout follows the room the comparison actually has: side by side only when
    // each pane gets at least MIN_PANE px, otherwise one full-width pane with a
    // Before/After toggle. The panes never grow past the shorter screenshot, so
    // neither ends in empty space; heights come from each image's proportions
    // because a hidden pane has no rendered height.
    const figure = useRef<HTMLElement>(null);
    const imgs = useRef<Record<Side, HTMLImageElement | null>>({ before: null, after: null });
    const [layout, setLayout] = useState<"split" | "single">("split");
    const [shortest, setShortest] = useState<number | null>(null);
    const measure = useCallback(() => {
        const fig = figure.current;
        if (!fig) return;
        const split = fig.clientWidth >= 2 * MIN_PANE + GAP;
        setLayout(split ? "split" : "single");
        const paneWidth = (split ? (fig.clientWidth - GAP) / 2 : fig.clientWidth) - 2;
        const hs = (["before", "after"] as const)
            .map((s) => imgs.current[s])
            .filter((i): i is HTMLImageElement => !!i && i.naturalWidth > 0)
            .map((i) => paneWidth * (i.naturalHeight / i.naturalWidth));
        setShortest(hs.length ? Math.floor(Math.min(...hs)) : null);
    }, []);
    useEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (figure.current) ro.observe(figure.current);
        return () => ro.disconnect();
    }, [measure]);

    const onScroll = useCallback((side: Side) => {
        if (ignore.current[side]) {
            ignore.current[side] = false;
            return;
        }
        const self = panes.current[side];
        const other = panes.current[side === "before" ? "after" : "before"];
        if (!self) return;
        lastRatio.current = ratioOf(self);
        // A pane hidden on narrow screens has no layout; it catches up on toggle.
        if (!other || other.clientHeight === 0) return;
        ignore.current[side === "before" ? "after" : "before"] = true;
        scrollToRatio(other, lastRatio.current);
    }, []);

    // Full-page screenshots are unreadable at half the 65ch text column, so the
    // comparison breaks out to the width of the box around the article (capped),
    // centred on the column. Nothing changes when there's no extra room.
    const [breakout, setBreakout] = useState<{ width: number; margin: number } | null>(null);
    useEffect(() => {
        const article = figure.current?.closest("article");
        const box = article?.parentElement;
        if (!article || !box) return;
        const measure = () => {
            const cs = getComputedStyle(article);
            const column = article.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            const target = Math.min(box.clientWidth - 48, 1500);
            setBreakout(target > column + 8 ? { width: target, margin: (column - target) / 2 } : null);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(box);
        return () => ro.disconnect();
    }, []);

    // After switching panes on a narrow screen, open the new one at the same place.
    useEffect(() => {
        const el = panes.current[shown];
        if (el) scrollToRatio(el, lastRatio.current);
    }, [shown]);

    const pane = (side: Side, src: string, label: string) => (
        <div className={`${styles.pane} ${styles[side]}`}>
            <div className={styles.paneHeader}>
                <span>{label}</span>
                <a className={styles.full} href={resolve(src)} target="_blank" rel="noopener noreferrer">
                    full size ↗
                </a>
            </div>
            <div
                ref={(el) => {
                    panes.current[side] = el;
                }}
                className={styles.scroller}
                onScroll={() => onScroll(side)}
                tabIndex={0}
                aria-label={`${label} screenshot, scrolls in sync with the other`}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={(el) => { imgs.current[side] = el; }} onLoad={measure} className={styles.image} src={resolve(src)} alt={`${label}: ${caption ?? "screenshot"}`} loading="lazy" />
            </div>
        </div>
    );

    return (
        <figure
            ref={figure}
            className={styles.compare}
            data-show={shown}
            data-layout={layout}
            style={{
                "--compare-height": `${Math.min(parseInt(height, 10) || 560, shortest ?? Infinity)}px`,
                ...(breakout && { width: breakout.width, marginLeft: breakout.margin, marginRight: breakout.margin }),
            } as CSSProperties}
        >
            <div className={styles.toggle} role="group" aria-label="Show">
                {(["before", "after"] as const).map((side) => (
                    <button
                        key={side}
                        type="button"
                        aria-pressed={shown === side}
                        onClick={() => setShown(side)}
                    >
                        {side === "before" ? beforeLabel : afterLabel}
                    </button>
                ))}
            </div>
            <div className={styles.panes}>
                {pane("before", before, beforeLabel)}
                {pane("after", after, afterLabel)}
            </div>
            {caption && <figcaption className={worksStyles.imageStandaloneCaption}>{caption}</figcaption>}
        </figure>
    );
}
