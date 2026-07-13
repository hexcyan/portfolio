"use client";

import {
    Children,
    isValidElement,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import styles from "./BlogCarousel.module.css";
import worksStyles from "@/components/Works/Works.module.css";
import galleryStyles from "@/components/Gallery/Gallery.module.css";
import { thumbUrl } from "@/lib/cdn";
import { useBlogViewer } from "./BlogArticle";

interface CarouselImageProps {
    /** CDN image path, e.g. "blog/this-site_preview.png". */
    src: string;
    /** Alt text; also used as the fallback caption. */
    alt?: string;
    /** Optional caption for this image. Overrides the Carousel-level fallback. */
    caption?: string;
    /** Optional link the caption points to. */
    captionHref?: string;
}

/**
 * Declares one image in a <Carousel>. Renders nothing on its own — the parent
 * <Carousel> reads its props — so MDX can list images with plain string
 * attributes (no `{}` expressions, which next-mdx-remote doesn't parse).
 */
export function CarouselImage(_props: CarouselImageProps) {
    return null;
}

interface CarouselProps {
    /** A list of <CarouselImage> children, left to right. */
    children: ReactNode;
    /** Fallback caption for any image that doesn't set its own `caption`. */
    caption?: string;
    /** Fallback caption link for any image that doesn't set its own `captionHref`. */
    captionHref?: string;
}

/** Renders caption text as an external link when `href` is set, plain text otherwise. */
function captionInner(text: string, href: string | undefined): ReactNode {
    return href ? (
        <a
            className={worksStyles.imageStandaloneCaptionLink}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
        >
            {text}
        </a>
    ) : (
        text
    );
}

/**
 * A horizontal, swipeable strip of blog images. Uses native scroll-snap
 * (touch/trackpad friendly) with prev/next buttons for the mouse, and a single
 * caption slot below it that tracks the centred image. Clicking any image opens
 * the shared blog GalleryViewer via the BlogArticle context.
 */
/**
 * Collect images from the Carousel's children. Supports two authoring styles:
 *   - Explicit `<CarouselImage src alt caption captionHref />`.
 *   - Plain markdown `![alt](src)`, which MDX renders as an `img` (wrapped in a
 *     paragraph); for these, alt doubles as the caption.
 * Recurses through wrapper elements (e.g. the `<p>`/`<div>` MDX puts images in).
 */
function collectImages(children: ReactNode): CarouselImageProps[] {
    const out: CarouselImageProps[] = [];
    Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;
        const props = (child as ReactElement<Record<string, unknown>>).props;
        if (child.type === CarouselImage && typeof props.src === "string") {
            // Explicit declaration: keep caption/href as authored (alt stays alt).
            out.push(props as unknown as CarouselImageProps);
        } else if (typeof props.src === "string") {
            // A markdown/plain image — alt becomes the caption.
            const alt = typeof props.alt === "string" ? props.alt : undefined;
            out.push({ src: props.src, alt, caption: alt });
        } else if (props.children) {
            out.push(...collectImages(props.children as ReactNode));
        }
    });
    return out;
}

export function Carousel({ children, caption, captionHref }: CarouselProps) {
    const images = collectImages(children);

    const viewer = useBlogViewer();
    const trackRef = useRef<HTMLDivElement>(null);
    const slideRefs = useRef<(HTMLElement | null)[]>([]);
    const animRef = useRef(0);
    // True while `animateScroll` is tweening scrollLeft. The scroll listener
    // ignores these self-generated events so it doesn't fight the click-driven
    // `current` (which would flicker the caption back to the source slide).
    const animatingRef = useRef(false);
    // Index of the slide centred in the strip; drives the buttons and caption.
    const [current, setCurrent] = useState(0);

    const count = images.length;

    // Resolve each image's caption/href. Caption and link are inherited as a
    // pair: an image that customises either takes over the whole pair.
    const resolved = images.map((img) => {
        const hasOwn = img.caption != null || img.captionHref != null;
        return {
            src: img.src,
            alt: img.alt,
            caption: hasOwn ? img.caption : caption,
            captionHref: hasOwn ? img.captionHref : captionHref,
        };
    });

    // Register every image with the article viewer up front so the filmstrip
    // order matches the strip and clicks open at the right index.
    useEffect(() => {
        if (!viewer) return;
        images.forEach((img) => viewer.registerImage(img.src));
    }, [viewer, images]);

    // Animate the strip's scrollLeft ourselves. Native `behavior: "smooth"` gets
    // cancelled by `scroll-snap-type: mandatory`, so we suspend snapping, tween
    // with rAF, then restore snapping — which re-locks onto the landing slide.
    const animateScroll = useCallback((track: HTMLDivElement, to: number) => {
        cancelAnimationFrame(animRef.current);
        const from = track.scrollLeft;
        const delta = to - from;
        if (Math.abs(delta) < 1) return;

        const duration = 450;
        const start = performance.now();
        const ease = (t: number) =>
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        track.style.scrollSnapType = "none";
        animatingRef.current = true;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            track.scrollLeft = from + delta * ease(t);
            if (t < 1) {
                animRef.current = requestAnimationFrame(tick);
            } else {
                track.style.scrollSnapType = "";
                animatingRef.current = false;
            }
        };
        animRef.current = requestAnimationFrame(tick);
    }, []);

    // Centre a slide by index. Indices wrap, so next past the end loops to the
    // start and prev before the start loops to the end.
    const goTo = useCallback(
        (index: number) => {
            const track = trackRef.current;
            const wrapped = ((index % count) + count) % count;
            const slide = slideRefs.current[wrapped];
            if (!track || !slide) return;
            const target =
                slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
            const max = track.scrollWidth - track.clientWidth;
            animateScroll(track, Math.max(0, Math.min(target, max)));
            setCurrent(wrapped);
        },
        [count, animateScroll],
    );

    useEffect(() => () => cancelAnimationFrame(animRef.current), []);

    // Keep `current` in sync when the reader swipes/scrolls the strip by hand.
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        let frame = 0;
        const onScroll = () => {
            // Ignore scroll events we generate ourselves in `animateScroll`;
            // the click that started the tween already set `current`.
            if (animatingRef.current) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const mid = track.scrollLeft + track.clientWidth / 2;
                let nearest = 0;
                let best = Infinity;
                slideRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const centre = el.offsetLeft + el.offsetWidth / 2;
                    const dist = Math.abs(centre - mid);
                    if (dist < best) {
                        best = dist;
                        nearest = i;
                    }
                });
                setCurrent(nearest);
            });
        };
        track.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            track.removeEventListener("scroll", onScroll);
        };
    }, []);

    const openLightbox = useCallback(
        (src: string) => {
            if (!viewer) return;
            const index = viewer.registerImage(src);
            viewer.openViewer(index);
        },
        [viewer],
    );

    if (count === 0) return null;

    // Caption shown under the strip, tracking whichever image is centred. Unlike
    // the lightbox it does not fall back to alt — it's an intentional caption.
    const currentCaption = resolved[current]?.caption;
    const currentHref = resolved[current]?.captionHref;

    return (
        <figure className={styles.carousel}>
            <div className={styles.viewport}>
                <div className={styles.track} ref={trackRef}>
                    {images.map((img, i) => (
                        <button
                            key={img.src + i}
                            ref={(el) => {
                                slideRefs.current[i] = el;
                            }}
                            type="button"
                            className={styles.slide}
                            onClick={() => openLightbox(img.src)}
                            aria-label={
                                img.alt ||
                                resolved[i].caption ||
                                `View image ${i + 1}`
                            }
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                className={styles.image}
                                src={thumbUrl(img.src, "thumb")}
                                alt={img.alt || ""}
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            className={`${galleryStyles.previewNav} ${galleryStyles.previewNavLeft} ${styles.nav}`}
                            onClick={() => goTo(current - 1)}
                            aria-label="Previous image"
                        >
                            ◁
                        </button>
                        <button
                            type="button"
                            className={`${galleryStyles.previewNav} ${galleryStyles.previewNavRight} ${styles.nav}`}
                            onClick={() => goTo(current + 1)}
                            aria-label="Next image"
                        >
                            ▷
                        </button>
                    </>
                )}
            </div>

            {currentCaption && (
                <figcaption
                    className={worksStyles.imageStandaloneCaption}
                    aria-live="polite"
                >
                    {captionInner(currentCaption, currentHref)}
                </figcaption>
            )}
        </figure>
    );
}
