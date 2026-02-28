"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import styles from "./Gallery.module.css";
import Spinner from "@/components/Spinner";
import { getCDNConfig } from "@/lib/cdn";
import type { AlbumMetadata } from "@/lib/gallery-metadata";

interface GalleryViewerProps {
    images: { id: string; path: string }[];
    initialIndex: number;
    folderName: string;
    metadata?: AlbumMetadata | null;
    onClose: () => void;
}

export default function GalleryViewer({
    images,
    initialIndex,
    folderName,
    metadata,
    onClose,
}: GalleryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imageLoaded, setImageLoaded] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const { pullZone } = getCDNConfig();

    const current = images[currentIndex];
    const previewUrl = `${pullZone}/${current.path}?width=1400&quality=90`;
    const total = images.length;

    const imgMeta = metadata?.images?.[current.id];
    const caption = imgMeta?.caption;
    const imageTags = imgMeta?.tags;

    const goTo = useCallback(
        (index: number) => {
            if (index < 0 || index >= total) return;
            setImageLoaded(false);
            setCurrentIndex(index);
        },
        [total]
    );

    const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
    const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

    // Keyboard navigation
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, goPrev, goNext]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    // Auto-scroll filmstrip to keep active thumb visible
    useEffect(() => {
        if (!trackRef.current) return;
        const thumb = trackRef.current.children[currentIndex] as HTMLElement;
        if (!thumb) return;
        const track = trackRef.current;
        const thumbLeft = thumb.offsetLeft;
        const thumbWidth = thumb.offsetWidth;
        const trackScroll = track.scrollLeft;
        const trackWidth = track.clientWidth;

        if (thumbLeft < trackScroll) {
            track.scrollLeft = thumbLeft - 8;
        } else if (thumbLeft + thumbWidth > trackScroll + trackWidth) {
            track.scrollLeft = thumbLeft + thumbWidth - trackWidth + 8;
        }
    }, [currentIndex]);

    function scrollFilmstrip(direction: number) {
        if (!trackRef.current) return;
        trackRef.current.scrollLeft += direction * 200;
    }

    function thumbUrl(path: string) {
        return `${pullZone}/${path}?width=120&quality=40`;
    }

    return (
        <div className={styles.viewerOverlay}>
            {/* Title Bar */}
            <div className={styles.viewerTitleBar}>
                <span className={styles.viewerTitleText}>
                    <span>📁</span>
                    <span>{folderName} — {current.id}</span>
                </span>
                <button
                    className={styles.viewerTitleClose}
                    onClick={onClose}
                    aria-label="Close viewer"
                >
                    ✕
                </button>
            </div>

            {/* Main Preview */}
            <div className={styles.viewerPreview}>
                {!imageLoaded && (
                    <div className={styles.spinnerCenter}>
                        <Spinner size={28} />
                    </div>
                )}

                {currentIndex > 0 && (
                    <button
                        className={`${styles.previewNav} ${styles.previewNavLeft}`}
                        onClick={goPrev}
                        aria-label="Previous image"
                    >
                        ◁
                    </button>
                )}

                <Image
                    key={current.path}
                    src={previewUrl}
                    alt={caption || current.id}
                    width={1400}
                    height={1000}
                    className={`${styles.previewImage} ${!imageLoaded ? styles.previewLoading : ""}`}
                    priority
                    onLoad={() => setImageLoaded(true)}
                />

                {currentIndex < total - 1 && (
                    <button
                        className={`${styles.previewNav} ${styles.previewNavRight}`}
                        onClick={goNext}
                        aria-label="Next image"
                    >
                        ▷
                    </button>
                )}
            </div>

            {/* Caption + Tags Info Bar */}
            {(caption || (imageTags && imageTags.length > 0)) && (
                <div className={styles.viewerInfoBar}>
                    {caption && (
                        <span className={styles.viewerInfoCaption}>{caption}</span>
                    )}
                    {imageTags && imageTags.length > 0 && (
                        <>
                            {caption && <span className={styles.viewerInfoDivider} />}
                            {imageTags.map((tag) => (
                                <span key={tag} className={styles.viewerInfoTag}>
                                    {tag}
                                </span>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Filmstrip */}
            <div className={styles.filmstrip}>
                <button
                    className={styles.filmstripArrow}
                    onClick={() => scrollFilmstrip(-1)}
                    aria-label="Scroll thumbnails left"
                >
                    ◁
                </button>

                <div className={styles.filmstripTrack} ref={trackRef}>
                    {images.map((img, i) => (
                        <img
                            key={img.id}
                            src={thumbUrl(img.path)}
                            alt={img.id}
                            className={`${styles.filmstripThumb} ${i === currentIndex ? styles.filmstripThumbActive : ""}`}
                            onClick={() => goTo(i)}
                        />
                    ))}
                </div>

                <button
                    className={styles.filmstripArrow}
                    onClick={() => scrollFilmstrip(1)}
                    aria-label="Scroll thumbnails right"
                >
                    ▷
                </button>
            </div>

            {/* Toolbar */}
            <div className={styles.viewerToolbar}>
                <div className={styles.toolbarGroup}>
                    <button className={styles.toolbarBtn} onClick={goPrev} disabled={currentIndex === 0}>
                        ◀ Prev
                    </button>
                    <button className={styles.toolbarBtn} onClick={goNext} disabled={currentIndex === total - 1}>
                        Next ▶
                    </button>
                </div>
                <span className={styles.toolbarCounter}>
                    {currentIndex + 1} of {total}
                </span>
            </div>
        </div>
    );
}
