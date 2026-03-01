"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Works.module.css";
import { MASONRY } from "./masonry.config";
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


export default function WorksSectionComponent({
    section,
    filteredImages,
    filteredSubsections,
    tagDefs,
    onImageClick,
    onBlockClick,
}: WorksSectionProps) {
    const [spans, setSpans] = useState<Record<string, number>>({});
    const [loadedThumbs, setLoadedThumbs] = useState<Set<string>>(new Set());
    const gridRef = useRef<HTMLDivElement>(null);
    const { pullZone } = getCDNConfig();

    const imageKey = (img: WorksImage) => getWorksImagePath(img);

    const computeSpan = useCallback(
        (key: string, naturalWidth: number, naturalHeight: number) => {
            if (!gridRef.current) return;
            const gridStyles = window.getComputedStyle(gridRef.current);
            const columnWidth =
                parseInt(
                    gridStyles
                        .getPropertyValue("grid-template-columns")
                        .split(" ")[0]
                ) || MASONRY.columnFallback;
            const aspectRatio = naturalHeight / naturalWidth;
            const imageHeight = columnWidth * aspectRatio;
            const span = Math.ceil(imageHeight / MASONRY.rowHeight) + MASONRY.gap;
            setSpans((prev) => ({ ...prev, [key]: span }));
        },
        []
    );

    // Use micro images for span computation
    useEffect(() => {
        filteredImages.forEach((image) => {
            const key = imageKey(image);
            const img = new window.Image();
            img.src = thumbUrl(key, "micro");
            img.onload = () => {
                computeSpan(key, img.naturalWidth, img.naturalHeight);
            };
        });
    }, [filteredImages, computeSpan]);

    function getTagColor(tagId: string): string | undefined {
        return tagDefs.find((t) => t.id === tagId)?.color;
    }

    function getTagLabel(tagId: string): string {
        return tagDefs.find((t) => t.id === tagId)?.label ?? tagId;
    }

    const hasSubsections = filteredSubsections.length > 0;
    const hasLooseImages = filteredImages.length > 0;

    return (
        <div className={styles.sectionBlock}>
            <StickyHeader
                className={styles.sectionHeader}
                stuckClass={styles.sectionHeaderStuck}
            >
                <span className={styles.sectionTitle}>{section.title}</span>
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
                        tagDefs={tagDefs}
                        onImageClick={onBlockClick}
                    />
                ))}

            {/* Render loose/unassigned images (not in any subsection) */}
            {hasLooseImages && (
                <>
                    {hasSubsections && (
                        <div className={styles.subsectionHeader}>
                            <span className={styles.subsectionTitle}>Other</span>
                        </div>
                    )}
                    <div
                        className={styles.masonryGrid}
                        ref={gridRef}
                        style={{
                            "--masonry-col-min": `${section.columnMinWidth ?? MASONRY.columnMinWidth}px`,
                        } as React.CSSProperties}
                    >
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
                                    className={`${styles.imageCell} ${
                                        spans[key]
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
                    </div>
                </>
            )}
        </div>
    );
}
