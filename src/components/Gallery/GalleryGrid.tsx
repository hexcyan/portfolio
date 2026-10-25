"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./Gallery.module.css";
import GalleryViewer from "./GalleryViewer";
import ImageBlock from "@/components/Works/blocks/ImageBlock";
import { ALBUM_COLUMNS, layoutAlbum, placementVars } from "@/lib/album-layout";
import { thumbUrl } from "@/lib/cdn";
import type { AlbumMetadata } from "@/lib/gallery-metadata";
import type { WorksBlock, WorksTagDef } from "@/lib/works-metadata";
import Link from "next/link";
import TagPill, { TagClear } from "@/components/TagPill/TagPill";
import Toolbar, { ToolbarRow, ToolbarInfo, ToolbarDivider, ToolbarLabel } from "@/components/Toolbar/Toolbar";
import win from "@/styles/window.module.css";

interface GalleryGridProps {
    images: {
        id: string;
        path: string;
        lastModified: string;
        /** from the deploy-time manifest; missing for photos added since */
        w?: number;
        h?: number;
        blur?: string;
    }[];
    folderName: string;
    metadata?: AlbumMetadata | null;
    globalTags?: WorksTagDef[];
}

// stand-in shape (4:5 portrait) for a photo whose size isn't known yet
const FALLBACK_RATIO = 0.8;

export default function GalleryGrid({ images, folderName, metadata, globalTags = [] }: GalleryGridProps) {
    const pathname = usePathname();

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    // Filters start empty so the server can render the whole album; a shared ?tags=&q= link applies after mount
    const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());
    const [search, setSearchLocal] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tags = params.get("tags");
        if (tags) setActiveTags(new Set(tags.split(",").filter(Boolean)));
        const q = params.get("q");
        if (q) setSearchLocal(q);
    }, []);

    // width/height per photo: from the manifest, or measured from the micro thumb for photos added since
    const [measured, setMeasured] = useState<Record<string, number>>({});
    useEffect(() => {
        for (const img of images) {
            if (img.w && img.h) continue;
            const probe = new window.Image();
            probe.onload = () => setMeasured((m) => ({ ...m, [img.id]: probe.naturalWidth / probe.naturalHeight }));
            probe.src = thumbUrl(img.path, "micro");
        }
    }, [images]);

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

    // placement for every column count; CSS container queries pick the one that fits
    const placements = useMemo(() => {
        const ratios = filteredImages.map((img) => (img.w && img.h ? img.w / img.h : measured[img.id] ?? FALLBACK_RATIO));
        return ALBUM_COLUMNS.map((n) => layoutAlbum(ratios, n));
    }, [filteredImages, measured]);

    return (
        <>
            <Toolbar
                title={
                    <>
                        <Link href="/gallery">← Back</Link>
                        <span>📁</span>
                        <span>{folderName}</span>
                    </>
                }
                search={{ value: search, onChange: setSearch, placeholder: "filter images..." }}
                count={
                    isFiltering
                        ? `${filteredImages.length}/${images.length} images`
                        : `${images.length} image${images.length !== 1 ? "s" : ""}`
                }
                filters={
                    allImageTags.length > 0 && (
                        <>
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
                        </>
                    )
                }
            >
                {metadata && (metadata.description || metadata.tags?.length > 0) && (
                    <ToolbarRow>
                        {metadata.description && (
                            <ToolbarInfo>{metadata.description}</ToolbarInfo>
                        )}
                        {metadata.tags?.length > 0 && (
                            <>
                                <ToolbarDivider />
                                <ToolbarLabel>tags:</ToolbarLabel>
                                {metadata.tags.map((tag) => (
                                    <TagPill key={tag} color={getTagColor(tag)}>
                                        {getTagLabel(tag)}
                                    </TagPill>
                                ))}
                            </>
                        )}
                    </ToolbarRow>
                )}
            </Toolbar>

            <div className={win.body}>
                <div className={styles.album}>
                    <div className={styles.albumGrid}>
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
                                <div
                                    key={image.id}
                                    className={styles.albumCell}
                                    style={placementVars(placements, i) as React.CSSProperties}
                                >
                                    <ImageBlock
                                        block={block}
                                        tagDefs={globalTags}
                                        onClick={() => openViewer(i)}
                                        contained
                                        blurSrc={image.blur}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
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
