"use client";

import { useState, useRef, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import styles from "./Gallery.module.css";
import GalleryViewer from "./GalleryViewer";
import { MasonryProvider } from "@/components/Works/MasonryContext";
import ImageBlock from "@/components/Works/blocks/ImageBlock";
import type { AlbumMetadata } from "@/lib/gallery-metadata";
import type { WorksBlock, WorksTagDef } from "@/lib/works-metadata";
import TagPill, { TagClear } from "@/components/TagPill/TagPill";

interface GalleryGridProps {
    images: {
        id: string;
        path: string;
        lastModified: string;
    }[];
    folderName: string;
    metadata?: AlbumMetadata | null;
    globalTags?: WorksTagDef[];
}

const GALLERY_ROW_HEIGHT = 4; // matches grid-auto-rows in Gallery.module.css
const GALLERY_GAP = 3; // rows of gap between items

export default function GalleryGrid({ images, folderName, metadata, globalTags = [] }: GalleryGridProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [activeTags, setActiveTags] = useState<Set<string>>(() => {
        const param = searchParams.get("tags");
        if (!param) return new Set<string>();
        return new Set(param.split(",").filter(Boolean));
    });
    const [search, setSearchLocal] = useState(searchParams.get("q") ?? "");
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const gridRef = useRef<HTMLDivElement>(null);

    function syncUrl(overrides: { tags?: Set<string>; q?: string }) {
        const tags = overrides.tags ?? activeTags;
        const q = overrides.q ?? search;

        const params = new URLSearchParams();
        if (tags.size > 0) params.set("tags", Array.from(tags).join(","));
        if (q.trim()) params.set("q", q);

        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
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

    // Resolve tag ID to label/color
    function getTagLabel(tagId: string): string {
        return globalTags.find((t) => t.id === tagId)?.label ?? tagId;
    }

    function getTagColor(tagId: string): string | undefined {
        return globalTags.find((t) => t.id === tagId)?.color;
    }

    // Collect all unique image-level tags
    const allImageTags = useMemo(() => {
        if (!metadata?.images) return [];
        const tagSet = new Set<string>();
        Object.values(metadata.images).forEach((img) => {
            img.tags?.forEach((t) => tagSet.add(t));
        });
        return Array.from(tagSet).sort();
    }, [metadata]);

    // Filter images by active tags and search
    const filteredImages = useMemo(() => {
        let result = images;

        if (activeTags.size > 0) {
            result = result.filter((img) => {
                const imgMeta = metadata?.images?.[img.id];
                if (!imgMeta?.tags) return false;
                return imgMeta.tags.some((t) => activeTags.has(t));
            });
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((img) => {
                const imgMeta = metadata?.images?.[img.id];
                return (
                    img.id.toLowerCase().includes(q) ||
                    imgMeta?.caption?.toLowerCase().includes(q) ||
                    imgMeta?.tags?.some((t) =>
                        t.toLowerCase().includes(q) || getTagLabel(t).toLowerCase().includes(q)
                    )
                );
            });
        }

        return result;
    }, [images, activeTags, search, metadata]);

    function toggleTag(tag: string) {
        setActiveTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else next.add(tag);
            syncUrl({ tags: next });
            return next;
        });
    }

    function clearTags() {
        setActiveTags(new Set());
        syncUrl({ tags: new Set() });
    }

    function openViewer(index: number) {
        const image = filteredImages[index];
        const fullIndex = images.indexOf(image);
        setViewerIndex(fullIndex);
        setViewerOpen(true);
    }

    const isFiltering = activeTags.size > 0 || search.trim().length > 0;

    return (
        <>
            {/* Search bar */}
            <div className={styles.searchBar}>
                <span className={styles.searchBarLabel}>Search:</span>
                <div className={styles.searchBarWrap}>
                    <span className={styles.searchBarIcon}>&#x2315;</span>
                    <input
                        type="text"
                        className={styles.searchBarInput}
                        placeholder="filter images..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className={styles.searchBarClear}
                            onClick={() => setSearch("")}
                        >
                            &#x2715;
                        </button>
                    )}
                </div>
                {isFiltering && (
                    <span className={styles.searchBarLabel} style={{ marginLeft: "auto", opacity: 0.4 }}>
                        {filteredImages.length}/{images.length} images
                    </span>
                )}
            </div>

            {/* Tag bar */}
            {allImageTags.length > 0 && (
                <div className={styles.tagBar}>
                    <span className={styles.tagBarLabel}>Tags:</span>
                    {allImageTags.map((tag) => (
                        <TagPill
                            key={tag}
                            color={getTagColor(tag)}
                            active={activeTags.has(tag)}
                            onClick={() => toggleTag(tag)}
                        >
                            {getTagLabel(tag)}
                        </TagPill>
                    ))}
                    {activeTags.size > 0 && (
                        <TagClear onClick={clearTags} />
                    )}
                </div>
            )}

            <div className={styles.galleryGrid} ref={gridRef}>
                <MasonryProvider gridRef={gridRef} rowHeight={GALLERY_ROW_HEIGHT} gap={GALLERY_GAP}>
                    {filteredImages.map((image, i) => {
                        const imgMeta = metadata?.images?.[image.id];
                        const block: WorksBlock = {
                            type: "image",
                            path: image.path,
                            filename: image.id,
                            caption: imgMeta?.caption,
                            tags: imgMeta?.tags ?? [],
                        };
                        return (
                            <ImageBlock
                                key={image.id}
                                block={block}
                                tagDefs={globalTags}
                                onClick={() => openViewer(i)}
                            />
                        );
                    })}
                </MasonryProvider>
            </div>

            {viewerOpen && (
                <GalleryViewer
                    images={images}
                    initialIndex={viewerIndex}
                    folderName={folderName}
                    metadata={metadata}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
}
