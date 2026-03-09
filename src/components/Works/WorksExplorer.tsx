"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
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
    gallerySections?: WorksSection[];
}

type ViewMode = "sections" | "chronological";

export default function WorksExplorer({ metadata, unsortedImages, gallerySections = [] }: WorksExplorerProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    // All filter state is local; URL is updated silently for shareability
    const [viewMode, setViewModeLocal] = useState<ViewMode>(
        searchParams.get("view") === "chrono" ? "chronological" : "sections"
    );
    const [activeTags, setActiveTags] = useState<Set<string>>(() => {
        const param = searchParams.get("tags");
        if (!param) return new Set<string>();
        return new Set(param.split(",").filter(Boolean));
    });
    const [search, setSearchLocal] = useState(searchParams.get("q") ?? "");
    const [includeGallery, setIncludeGalleryLocal] = useState(
        searchParams.get("gallery") === "true"
    );
    const [collapsed, setCollapsedLocal] = useState(
        searchParams.get("collapsed") === "true"
    );
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Silently sync state to URL without triggering Next.js navigation
    function syncUrl(overrides: { view?: ViewMode; tags?: Set<string>; q?: string; gallery?: boolean; collapsed?: boolean }) {
        const view = overrides.view ?? viewMode;
        const tags = overrides.tags ?? activeTags;
        const q = overrides.q ?? search;
        const gallery = overrides.gallery ?? includeGallery;
        const coll = overrides.collapsed ?? collapsed;

        const params = new URLSearchParams();
        if (view === "chronological") params.set("view", "chrono");
        if (tags.size > 0) params.set("tags", Array.from(tags).join(","));
        if (q.trim()) params.set("q", q);
        if (gallery) params.set("gallery", "true");
        if (coll) params.set("collapsed", "true");

        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    }

    function setViewMode(mode: ViewMode) {
        setViewModeLocal(mode);
        syncUrl({ view: mode });
    }

    function toggleTag(tagId: string) {
        setActiveTags((prev) => {
            const next = new Set(prev);
            if (next.has(tagId)) next.delete(tagId);
            else next.add(tagId);
            syncUrl({ tags: next });
            return next;
        });
    }

    function clearTags() {
        setActiveTags(new Set());
        syncUrl({ tags: new Set() });
    }

    function setSearch(value: string) {
        setSearchLocal(value);
        clearTimeout(debounceRef.current);
        if (!value.trim()) {
            syncUrl({ q: "" });
        } else {
            debounceRef.current = setTimeout(() => {
                syncUrl({ q: value });
            }, 300);
        }
    }

    function toggleGallery() {
        const next = !includeGallery;
        setIncludeGalleryLocal(next);
        syncUrl({ gallery: next });
    }

    function toggleCollapsed() {
        const next = !collapsed;
        setCollapsedLocal(next);
        syncUrl({ collapsed: next });
    }

    // Filter blocks within a subsection
    const filterBlocks = useCallback(
        (blocks: WorksBlock[]): WorksBlock[] => {
            return blocks.filter((block) => {
                // Tag filter
                if (activeTags.size > 0) {
                    const hasAllTags = Array.from(activeTags).every((tag) =>
                        block.tags.includes(tag)
                    );
                    if (!hasAllTags) return false;
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
                    if (block.type === "grid") {
                        return (
                            block.tags.some((t) => t.toLowerCase().includes(q)) ||
                            block.children?.some(
                                (c) =>
                                    c.filename.toLowerCase().includes(q) ||
                                    c.caption?.toLowerCase().includes(q)
                            )
                        );
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

    // Combine works sections with gallery sections when toggled on
    const allSections = useMemo(() => {
        if (includeGallery && gallerySections.length > 0) {
            return [...metadata.sections, ...gallerySections];
        }
        return metadata.sections;
    }, [metadata.sections, gallerySections, includeGallery]);

    // Sorted sections
    const sortedSections = useMemo(
        () => [...allSections].sort((a, b) => a.order - b.order),
        [allSections]
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

    // When collapsed, merge all sections into one flat section
    const collapsedSection: WorksSection | null = useMemo(() => {
        if (!collapsed) return null;
        const allBlocks: WorksBlock[] = [];

        const sources = [...sortedSections];
        if (unsortedSection) sources.push(unsortedSection);

        for (const section of sources) {
            // 1. Flatten blocks out of their individual subsections
            for (const sub of section.subsections) {
                allBlocks.push(...sub.blocks);
            }
            // 2. Convert loose images to blocks and add them to the unified pool
            const looseImageBlocks: WorksBlock[] = section.images.map((img) => ({
                type: "image",
                filename: img.filename,
                folder: img.folder,
                path: img.path,
                caption: img.caption,
                tags: img.tags,
                date: img.date,
                url: img.url,
            }));
            allBlocks.push(...looseImageBlocks);


        }

        return {
            id: "__collapsed",
            title: "All",
            order: 0,
            images: [], // <-- Keep this empty so it doesn't render a second grid!
            subsections: allBlocks.length > 0 ? [
                {
                    id: "__collapsed_sub",
                    sectionId: "__collapsed",
                    sectionTitle: "All",
                    title: "",
                    blocks: allBlocks,
                }
            ] : [],
        };
    }, [collapsed, sortedSections, unsortedSection]);

    // === SECTIONS VIEW ===
    const filteredSections = useMemo(() => {
        const sections = collapsed && collapsedSection
            ? [collapsedSection]
            : unsortedSection
                ? [...sortedSections, unsortedSection]
                : sortedSections;

        return sections
            .map((section) => ({
                section,
                images: filterImages(section.images),
                subsections: filterSubsections(section.subsections),
            }))
            .filter(({ images, subsections }) => images.length > 0 || subsections.length > 0);
    }, [sortedSections, unsortedSection, collapsed, collapsedSection, filterImages, filterSubsections]);

    // === CHRONOLOGICAL VIEW ===
    const chronoSubsections = useMemo(() => {
        if (viewMode !== "chronological") return [];
        const allSubs: WorksSubsection[] = [];
        for (const section of allSections) {
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
    }, [viewMode, allSections, filterSubsections]);

    // Collect all visible image blocks for lightbox (including grid children)
    const allVisibleImageBlocks = useMemo(() => {
        const blocks: WorksBlock[] = [];
        function collectFromBlocks(blockList: WorksBlock[]) {
            for (const b of blockList) {
                if (b.type === "image") {
                    blocks.push(b);
                } else if (b.type === "grid" && b.children) {
                    for (const child of b.children) {
                        blocks.push({
                            type: "image",
                            filename: child.filename,
                            folder: child.folder,
                            path: child.path,
                            caption: child.caption,
                            tags: child.tags,
                            date: child.date,
                            url: child.url,
                        });
                    }
                }
            }
        }
        if (viewMode === "sections") {
            for (const { subsections, images } of filteredSections) {
                for (const sub of subsections) {
                    collectFromBlocks(sub.blocks);
                }
                // Loose images as blocks
                for (const img of images) {
                    blocks.push({
                        type: "image",
                        filename: img.filename,
                        folder: img.folder,
                        path: img.path,
                        caption: img.caption,
                        tags: img.tags,
                        date: img.date,
                        url: img.url,
                    });
                }
            }
        } else {
            for (const sub of chronoSubsections) {
                collectFromBlocks(sub.blocks);
            }
        }
        return blocks;
    }, [viewMode, filteredSections, chronoSubsections]);

    // Total visible count
    const visibleCount = allVisibleImageBlocks.length;

    // Total counts
    const totalImages =
        allSections.reduce((sum, s) => {
            const subImages = s.subsections.reduce(
                (acc, sub) => acc + sub.blocks.filter((b) => b.type === "image").length,
                0
            );
            return sum + s.images.length + subImages;
        }, 0) + unsortedImages.length;

    // Lightbox images — use path field when available
    const viewerImages = useMemo(
        () =>
            allVisibleImageBlocks.map((block) => {
                const path = getWorksImagePath(block as WorksImage);
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
                        {gallerySections.length > 0 && (
                            <button
                                className={`${styles.viewBtn} ${styles.galleryToggle} ${includeGallery ? styles.viewBtnActive : ""}`}
                                onClick={toggleGallery}
                            >
                                Include Gallery
                            </button>
                        )}
                        <button
                            className={`${styles.viewBtn} ${styles.galleryToggle} ${collapsed ? styles.viewBtnActive : ""}`}
                            onClick={toggleCollapsed}
                        >
                            Collapse
                        </button>
                        <button
                            className={`${styles.viewBtn} ${viewMode === "sections" ? styles.viewBtnActive : ""
                                }`}
                            onClick={() => setViewMode("sections")}
                        >
                            Sections
                        </button>
                        <button
                            className={`${styles.viewBtn} ${viewMode === "chronological" ? styles.viewBtnActive : ""
                                }`}
                        // onClick={() => setViewMode("chronological")}
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
                                className={`${styles.tagBtn} ${activeTags.has(tag.id) ? styles.tagBtnActive : ""
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
                                onClick={() => clearTags()}
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
                        {visibleCount} image
                        {visibleCount !== 1 ? "s" : ""}
                        {visibleCount !== totalImages &&
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
                    {includeGallery && (
                        <span>+ Gallery</span>
                    )}
                    {collapsed && (
                        <span>Collapsed</span>
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
