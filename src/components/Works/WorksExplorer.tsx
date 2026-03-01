"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./Works.module.css";
import WorksSectionComponent from "./WorksSection";
import WorksSubsectionComponent from "./WorksSubsection";
import GalleryViewer from "@/components/Gallery/GalleryViewer";
import type {
    WorksMetadata,
    WorksImage,
    WorksBlock,
    WorksSection,
    WorksSubsection,
} from "@/lib/works-metadata";
import { getWorksImagePath } from "@/lib/works-metadata";

interface WorksExplorerProps {
    metadata: WorksMetadata;
    unsortedImages: WorksImage[];
}

type ViewMode = "sections" | "chronological";

export default function WorksExplorer({ metadata, unsortedImages }: WorksExplorerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    // View mode from URL
    const viewMode: ViewMode = searchParams.get("view") === "chrono" ? "chronological" : "sections";

    function setViewMode(mode: ViewMode) {
        const params = new URLSearchParams(searchParams.toString());
        if (mode === "chronological") {
            params.set("view", "chrono");
        } else {
            params.delete("view");
        }
        const qs = params.toString();
        router.replace(qs ? `?${qs}` : "/works", { scroll: false });
    }

    // Read active tags from URL
    const activeTags = useMemo(() => {
        const param = searchParams.get("tags");
        if (!param) return new Set<string>();
        return new Set(param.split(",").filter(Boolean));
    }, [searchParams]);

    function setActiveTags(tags: Set<string>) {
        const params = new URLSearchParams(searchParams.toString());
        if (tags.size === 0) {
            params.delete("tags");
        } else {
            params.set("tags", Array.from(tags).join(","));
        }
        const qs = params.toString();
        router.replace(qs ? `?${qs}` : "/works", { scroll: false });
    }

    function toggleTag(tagId: string) {
        const next = new Set(activeTags);
        if (next.has(tagId)) next.delete(tagId);
        else next.add(tagId);
        setActiveTags(next);
    }

    // Filter blocks within a subsection
    const filterBlocks = useCallback(
        (blocks: WorksBlock[]): WorksBlock[] => {
            return blocks.filter((block) => {
                // Tag filter: only applies to image blocks
                if (activeTags.size > 0) {
                    if (block.type === "image") {
                        const hasAllTags = Array.from(activeTags).every((tag) =>
                            block.tags.includes(tag)
                        );
                        if (!hasAllTags) return false;
                    }
                    // Non-image blocks pass tag filter (they have no tags)
                }

                // Search filter
                if (search.trim()) {
                    const q = search.toLowerCase();
                    if (block.type === "image") {
                        return (
                            block.caption?.toLowerCase().includes(q) ||
                            block.tags.some((t) => t.toLowerCase().includes(q)) ||
                            (block.filename || "").toLowerCase().includes(q)
                        );
                    }
                    if (block.type === "text") {
                        return block.content?.toLowerCase().includes(q);
                    }
                    if (block.type === "youtube" || block.type === "tweet") {
                        return block.caption?.toLowerCase().includes(q);
                    }
                }

                return true;
            });
        },
        [activeTags, search]
    );

    // Filter images (for loose/unassigned images)
    const filterImages = useCallback(
        (images: WorksImage[]): WorksImage[] => {
            let filtered = images;

            if (activeTags.size > 0) {
                filtered = filtered.filter((img) =>
                    Array.from(activeTags).every((tag) => img.tags.includes(tag))
                );
            }

            if (search.trim()) {
                const q = search.toLowerCase();
                filtered = filtered.filter(
                    (img) =>
                        img.caption?.toLowerCase().includes(q) ||
                        img.tags.some((t) => t.toLowerCase().includes(q)) ||
                        (img.filename || img.path || "").toLowerCase().includes(q)
                );
            }

            return filtered;
        },
        [activeTags, search]
    );

    // Filter subsections (keep those with remaining blocks after filtering)
    const filterSubsections = useCallback(
        (subsections: WorksSubsection[]): WorksSubsection[] => {
            return subsections
                .map((sub) => ({
                    ...sub,
                    blocks: filterBlocks(sub.blocks),
                }))
                .filter((sub) => sub.blocks.length > 0);
        },
        [filterBlocks]
    );

    // Sorted sections
    const sortedSections = useMemo(
        () => [...metadata.sections].sort((a, b) => a.order - b.order),
        [metadata.sections]
    );

    // Unsorted section
    const unsortedSection: WorksSection | null = useMemo(() => {
        if (unsortedImages.length === 0) return null;
        return {
            id: "__unsorted",
            title: "Unsorted",
            description: "Images not yet assigned to a section.",
            order: Infinity,
            images: unsortedImages,
            subsections: [],
        };
    }, [unsortedImages]);

    // === SECTIONS VIEW ===
    const filteredSections = useMemo(() => {
        const allSections = unsortedSection
            ? [...sortedSections, unsortedSection]
            : sortedSections;

        return allSections
            .map((section) => ({
                section,
                images: filterImages(section.images),
                subsections: filterSubsections(section.subsections),
            }))
            .filter(({ images, subsections }) => images.length > 0 || subsections.length > 0);
    }, [sortedSections, unsortedSection, filterImages, filterSubsections]);

    // === CHRONOLOGICAL VIEW ===
    const chronoSubsections = useMemo(() => {
        if (viewMode !== "chronological") return [];
        const allSubs: WorksSubsection[] = [];
        for (const section of metadata.sections) {
            allSubs.push(...section.subsections);
        }
        // Sort by date descending
        return filterSubsections(
            allSubs.sort((a, b) => {
                const da = a.date || "";
                const db = b.date || "";
                return db.localeCompare(da);
            })
        );
    }, [viewMode, metadata.sections, filterSubsections]);

    // Collect all visible image blocks for lightbox
    const allVisibleImageBlocks = useMemo(() => {
        const blocks: WorksBlock[] = [];
        if (viewMode === "sections") {
            for (const { subsections, images } of filteredSections) {
                for (const sub of subsections) {
                    blocks.push(...sub.blocks.filter((b) => b.type === "image"));
                }
                // Loose images as blocks
                for (const img of images) {
                    blocks.push({
                        type: "image",
                        filename: img.filename,
                        folder: img.folder,
                        caption: img.caption,
                        tags: img.tags,
                        date: img.date,
                        url: img.url,
                    });
                }
            }
        } else {
            for (const sub of chronoSubsections) {
                blocks.push(...sub.blocks.filter((b) => b.type === "image"));
            }
        }
        return blocks;
    }, [viewMode, filteredSections, chronoSubsections]);

    // Also collect loose images for counting
    const allVisibleLooseImages = useMemo(() => {
        if (viewMode !== "sections") return [];
        return filteredSections.flatMap(({ images }) => images);
    }, [viewMode, filteredSections]);

    // Total visible count
    const visibleCount = allVisibleImageBlocks.length;

    // Total counts
    const totalImages =
        metadata.sections.reduce((sum, s) => {
            const subImages = s.subsections.reduce(
                (acc, sub) => acc + sub.blocks.filter((b) => b.type === "image").length,
                0
            );
            return sum + s.images.length + subImages;
        }, 0) + unsortedImages.length;

    // Lightbox images
    const viewerImages = useMemo(
        () =>
            allVisibleImageBlocks.map((block) => {
                const path = block.folder
                    ? `works/${block.folder}/${block.filename}`
                    : `works/${block.filename}`;
                return {
                    id: block.filename || "",
                    path,
                };
            }),
        [allVisibleImageBlocks]
    );

    const viewerMetadata = useMemo(() => {
        const images: Record<string, { caption: string; tags: string[] }> = {};
        allVisibleImageBlocks.forEach((block) => {
            const id = block.filename || "";
            images[id] = {
                caption: block.caption || "",
                tags: block.tags.map(
                    (tagId) =>
                        metadata.tags.find((t) => t.id === tagId)?.label ?? tagId
                ),
            };
        });
        return { description: "", tags: [] as string[], images };
    }, [allVisibleImageBlocks, metadata.tags]);

    function handleImageClick(image: WorksImage) {
        const idx = allVisibleImageBlocks.findIndex(
            (b) => b.filename === image.filename && b.folder === image.folder
        );
        if (idx >= 0) {
            setViewerIndex(idx);
            setViewerOpen(true);
        }
    }

    function handleBlockClick(block: WorksBlock) {
        if (block.type !== "image") return;
        const idx = allVisibleImageBlocks.findIndex(
            (b) => b.filename === block.filename && b.folder === block.folder
        );
        if (idx >= 0) {
            setViewerIndex(idx);
            setViewerOpen(true);
        }
    }

    return (
        <div className={styles.worksPage}>
            {/* Sticky chrome: toolbar + tag bar */}
            <div className={styles.chrome}>
                <div className={styles.toolbar}>
                    <span className={styles.toolbarLabel}>Search:</span>
                    <div className={styles.searchWrap}>
                        <span className={styles.searchIcon}>&#x2315;</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="filter works..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className={styles.searchClear}
                                onClick={() => setSearch("")}
                            >
                                &#x2715;
                            </button>
                        )}
                    </div>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewBtn} ${
                                viewMode === "sections" ? styles.viewBtnActive : ""
                            }`}
                            onClick={() => setViewMode("sections")}
                        >
                            Sections
                        </button>
                        <button
                            className={`${styles.viewBtn} ${
                                viewMode === "chronological" ? styles.viewBtnActive : ""
                            }`}
                            onClick={() => setViewMode("chronological")}
                        >
                            Timeline
                        </button>
                    </div>
                </div>

                {metadata.tags.length > 0 && (
                    <div className={styles.tagBar}>
                        <span className={styles.tagBarLabel}>Tags:</span>
                        {metadata.tags.map((tag) => (
                            <button
                                key={tag.id}
                                className={`${styles.tagBtn} ${
                                    activeTags.has(tag.id) ? styles.tagBtnActive : ""
                                }`}
                                onClick={() => toggleTag(tag.id)}
                                style={
                                    activeTags.has(tag.id) && tag.color
                                        ? {
                                              borderColor: tag.color,
                                              background: `${tag.color}33`,
                                          }
                                        : tag.color
                                          ? { borderColor: `${tag.color}66` }
                                          : undefined
                                }
                            >
                                {tag.label}
                            </button>
                        ))}
                        {activeTags.size > 0 && (
                            <button
                                className={styles.tagClearAll}
                                onClick={() => setActiveTags(new Set())}
                            >
                                clear all
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Scrollable content area */}
            <div className={styles.worksScrollArea}>
                {viewMode === "sections" ? (
                    filteredSections.length > 0 ? (
                        <div className={styles.sectionsContainer}>
                            {filteredSections.map(({ section, images, subsections }) => (
                                <WorksSectionComponent
                                    key={section.id}
                                    section={section}
                                    filteredImages={images}
                                    filteredSubsections={subsections}
                                    tagDefs={metadata.tags}
                                    onImageClick={handleImageClick}
                                    onBlockClick={handleBlockClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            No works match the current filters.
                        </div>
                    )
                ) : (
                    chronoSubsections.length > 0 ? (
                        <div className={styles.sectionsContainer}>
                            {chronoSubsections.map((sub) => (
                                <div key={`${sub.sectionId}-${sub.id}`} className={styles.sectionBlock}>
                                    <span className={styles.chronoLabel}>
                                        {sub.sectionTitle}
                                    </span>
                                    <WorksSubsectionComponent
                                        subsection={sub}
                                        tagDefs={metadata.tags}
                                        onImageClick={handleBlockClick}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            No works match the current filters.
                        </div>
                    )
                )}
            </div>

            {/* Status bar — outside scroll area, pinned to bottom */}
            <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                    <span>
                        {allVisibleImageBlocks.length} image
                        {allVisibleImageBlocks.length !== 1 ? "s" : ""}
                        {allVisibleImageBlocks.length !== totalImages &&
                            ` (${totalImages} total)`}
                    </span>
                    {activeTags.size > 0 && (
                        <span>
                            Filtered by:{" "}
                            {Array.from(activeTags)
                                .map(
                                    (id) =>
                                        metadata.tags.find((t) => t.id === id)
                                            ?.label ?? id
                                )
                                .join(", ")}
                        </span>
                    )}
                </div>
                <div className={styles.statusRight}>
                    {viewMode === "sections"
                        ? `${filteredSections.length} section${filteredSections.length !== 1 ? "s" : ""}`
                        : `${chronoSubsections.length} project${chronoSubsections.length !== 1 ? "s" : ""}`}
                </div>
            </div>

            {/* Lightbox */}
            {viewerOpen && viewerImages.length > 0 && (
                <GalleryViewer
                    images={viewerImages}
                    initialIndex={viewerIndex}
                    folderName="works"
                    metadata={viewerMetadata}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </div>
    );
}
