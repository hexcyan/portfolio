"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Works.module.css";
import { MASONRY } from "./masonry.config";
import { MasonryProvider, useMasonryGrid } from "./MasonryContext";
import StickyHeader from "@/components/Gallery/StickyHeader";
import WorksSubsectionComponent from "./WorksSubsection";
import { getCDNConfig, thumbUrl } from "@/lib/cdn";
import type {
    WorksImage,
    WorksBlock,
    WorksSection as WorksSectionType,
    WorksSubsection,
    WorksTagDef,
} from "@/lib/works-metadata";
import { getWorksImagePath } from "@/lib/works-metadata";

interface WorksSectionProps {
    section: WorksSectionType;
    filteredImages: WorksImage[];
    filteredSubsections: WorksSubsection[];
    tagDefs: WorksTagDef[];
    onImageClick: (image: WorksImage) => void;
    onBlockClick: (block: WorksBlock) => void;
}

/* ── Loose image grid (lives inside MasonryProvider) ─────────────── */

interface LooseImageGridProps {
    filteredImages: WorksImage[];
    tagDefs: WorksTagDef[];
    onImageClick: (image: WorksImage) => void;
}

function LooseImageGrid({ filteredImages, tagDefs, onImageClick }: LooseImageGridProps) {
    const [spans, setSpans] = useState<Record<string, number>>({});
    const [loadedThumbs, setLoadedThumbs] = useState<Set<string>>(new Set());
    const m = useMasonryGrid();

    const imageKey = (img: WorksImage) => getWorksImagePath(img);

    // Cache aspect ratios so resizes compute synchronously
    const ratiosRef = useRef<Record<string, number>>({});

    const recomputeAllSpans = useCallback(() => {
        if (!m) return;
        const next: Record<string, number> = {};
        for (const [key, ratio] of Object.entries(ratiosRef.current)) {
            const imageHeight = m.columnWidth * ratio * MASONRY.rowHeight;
            next[key] = Math.ceil(imageHeight / MASONRY.rowHeight) + MASONRY.gap;
        }
        setSpans(next);
    }, [m]);

    // Load micro images to get aspect ratios, then compute spans
    useEffect(() => {
        filteredImages.forEach((image) => {
            const key = imageKey(image);
            if (ratiosRef.current[key] !== undefined) return;
            const img = new window.Image();
            img.src = thumbUrl(key, "micro");
            img.onload = () => {
                ratiosRef.current[key] = img.naturalHeight / img.naturalWidth;
                recomputeAllSpans();
            };
        });
        // Recompute for already-cached ratios (handles image list changes)
        recomputeAllSpans();
    }, [filteredImages, recomputeAllSpans]);

    // Recompute when measurements change
    useEffect(() => {
        recomputeAllSpans();
    }, [m, recomputeAllSpans]);

    function getTagColor(tagId: string): string | undefined {
        return tagDefs.find((t) => t.id === tagId)?.color;
    }

    function getTagLabel(tagId: string): string {
        return tagDefs.find((t) => t.id === tagId)?.label ?? tagId;
    }

    return (
        <>
            {filteredImages.map((image) => {
                const key = imageKey(image);
                const hasOverlay =
                    image.caption || image.tags.length > 0 || image.date;
                const isLink = !!image.url;
                const microSrc = thumbUrl(key, "micro");
                const thumbSrc = thumbUrl(key, "thumb");
                const isThumbLoaded = loadedThumbs.has(key);

                function handleLinkClick(e: React.MouseEvent) {
                    e.stopPropagation();
                    window.open(image.url, "_blank", "noopener,noreferrer");
                }

                return (
                    <div
                        key={key}
                        className={`${styles.imageCell} ${spans[key]
                            ? styles.imageCellReady
                            : styles.imageCellPending
                            }`}
                        style={{
                            gridRowEnd: spans[key]
                                ? `span ${spans[key]}`
                                : "span 1",
                        }}
                        onClick={() => onImageClick(image)}
                    >
                        <div className={styles.imageCellInner}>
                            {/* Blur-up micro placeholder */}
                            <img
                                src={microSrc}
                                alt=""
                                aria-hidden="true"
                                className={`${styles.blurPlaceholder} ${isThumbLoaded ? styles.blurHidden : ""}`}
                            />
                            {/* Thumb image */}
                            <img
                                src={thumbSrc}
                                alt={image.caption || key}
                                className={`${styles.imageCellImg} ${isThumbLoaded ? styles.imageCellImgLoaded : ""}`}
                                loading="lazy"
                                ref={(el) => {
                                    if (el?.complete && el.naturalWidth > 0 && !loadedThumbs.has(key))
                                        setLoadedThumbs((prev) => new Set(prev).add(key));
                                }}
                                onLoad={() =>
                                    setLoadedThumbs((prev) => {
                                        if (prev.has(key)) return prev;
                                        return new Set(prev).add(key);
                                    })
                                }
                            />
                            {isLink && (
                                <span className={styles.linkBadge} onClick={handleLinkClick}>&#x2197;</span>
                            )}
                            {hasOverlay && (
                                <div className={styles.imageOverlay}>
                                    {image.caption && (
                                        <span className={styles.overlayCaption}>
                                            {image.caption}
                                        </span>
                                    )}
                                    {image.date && (
                                        <span className={styles.overlayDate}>
                                            {image.date}
                                        </span>
                                    )}
                                    {image.tags.length > 0 && (
                                        <span className={styles.overlayTags}>
                                            {image.tags.map((tagId) => (
                                                <span
                                                    key={tagId}
                                                    className={styles.overlayTag}
                                                    style={
                                                        getTagColor(tagId)
                                                            ? {
                                                                borderColor: getTagColor(tagId),
                                                                color: getTagColor(tagId),
                                                            }
                                                            : undefined
                                                    }
                                                >
                                                    {getTagLabel(tagId)}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

/* ── Main section component ──────────────────────────────────────── */

export default function WorksSectionComponent({
    section,
    filteredImages,
    filteredSubsections,
    tagDefs,
    onImageClick,
    onBlockClick,
}: WorksSectionProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    const hasSubsections = filteredSubsections.length > 0;
    const hasSubsectionsWithTitles = filteredSubsections.some(sub => !!sub.title);
    const hasLooseImages = filteredImages.length > 0;

    return (
        <div className={styles.sectionBlock}>
            <StickyHeader
                className={styles.sectionHeader}
                stuckClass={styles.sectionHeaderStuck}
            >
                <span className={styles.sectionTitle}>{section.title}</span>
                {section.source === "gallery" && (
                    <span className={styles.sourceBadge}>Gallery</span>
                )}
                {section.dateRange && (
                    <span className={styles.sectionDateRange}>
                        {section.dateRange}
                    </span>
                )}
            </StickyHeader>

            {section.description && (
                <p className={styles.sectionDescription}>
                    {section.description}
                </p>
            )}

            {/* Render subsections */}
            {hasSubsections &&
                filteredSubsections.map((sub) => (
                    <WorksSubsectionComponent
                        key={sub.id}
                        subsection={sub}
                        sectionColumnMinWidth={section.columnMinWidth}
                        sectionMaxColumns={section.maxColumns}
                        sectionAlign={section.align}
                        tagDefs={tagDefs}
                        onImageClick={onBlockClick}
                    />
                ))}

            {/* Render loose/unassigned images (not in any subsection) */}
            {hasLooseImages && (
                <>
                    {hasSubsectionsWithTitles && (
                        <div className={styles.subsectionHeader}>
                            <span className={styles.subsectionTitle}>Other</span>
                        </div>
                    )}
                    <div
                        className={styles.masonryGrid}
                        ref={gridRef}
                        style={{
                            "--masonry-col-min": `${section.columnMinWidth ?? MASONRY.columnMinWidth}px`,
                            "--masonry-col-min-mobile": `${section.columnMinWidth ?? MASONRY.columnMinWidthMobile}px`,
                        } as React.CSSProperties}
                    >
                        <MasonryProvider gridRef={gridRef}>
                            <LooseImageGrid
                                filteredImages={filteredImages}
                                tagDefs={tagDefs}
                                onImageClick={onImageClick}
                            />
                        </MasonryProvider>
                    </div>
                </>
            )}
        </div>
    );
}
