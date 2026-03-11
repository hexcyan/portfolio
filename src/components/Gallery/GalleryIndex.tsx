"use client";

import { useState, useMemo, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Gallery.module.css";
import FolderPreviewImage from "./FolderPreviewImage";
import LinkAlbumCard from "./LinkAlbumCard";
import { thumbUrl } from "@/lib/cdn";
import type { WorksTagDef } from "@/lib/works-metadata";
import type { LinkAlbum } from "@/lib/gallery-metadata";
import TagPill, { TagClear } from "@/components/TagPill/TagPill";

interface FolderWithPreview {
    name: string;
    route: string;
    previewPath: string | null;
    imageCount: number;
    description: string | null;
    tags: string[];
}

interface GalleryIndexProps {
    folders: FolderWithPreview[];
    linkAlbums: LinkAlbum[];
    globalTags: WorksTagDef[];
}

export default function GalleryIndex({ folders, linkAlbums, globalTags }: GalleryIndexProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [search, setSearchLocal] = useState(searchParams.get("q") ?? "");
    const [activeTags, setActiveTags] = useState<Set<string>>(() => {
        const param = searchParams.get("tags");
        if (!param) return new Set<string>();
        return new Set(param.split(",").filter(Boolean));
    });
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

    // Resolve tag ID to label
    function getTagLabel(tagId: string): string {
        return globalTags.find((t) => t.id === tagId)?.label ?? tagId;
    }

    function getTagColor(tagId: string): string | undefined {
        return globalTags.find((t) => t.id === tagId)?.color;
    }

    // Collect all unique tags across folders
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        folders.forEach((f) => f.tags.forEach((t) => tagSet.add(t)));
        linkAlbums.forEach((la) => la.tags.forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [folders, linkAlbums]);

    // Filter folders
    const filteredFolders = useMemo(() => {
        let result = folders;

        if (activeTags.size > 0) {
            result = result.filter((f) =>
                Array.from(activeTags).some((tag) => f.tags.includes(tag))
            );
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (f) =>
                    f.name.toLowerCase().includes(q) ||
                    f.description?.toLowerCase().includes(q) ||
                    f.tags.some((t) => t.toLowerCase().includes(q) || getTagLabel(t).toLowerCase().includes(q))
            );
        }

        return result;
    }, [folders, activeTags, search]);

    // Filter link albums
    const filteredLinkAlbums = useMemo(() => {
        let result = linkAlbums;

        if (activeTags.size > 0) {
            result = result.filter((la) =>
                Array.from(activeTags).some((tag) => la.tags.includes(tag))
            );
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (la) =>
                    la.name.toLowerCase().includes(q) ||
                    la.description?.toLowerCase().includes(q) ||
                    la.tags.some((t) => t.toLowerCase().includes(q) || getTagLabel(t).toLowerCase().includes(q))
            );
        }

        return result;
    }, [linkAlbums, activeTags, search]);

    const totalFiltered = filteredFolders.length + filteredLinkAlbums.length;
    const totalAll = folders.length + linkAlbums.length;

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
                        placeholder="filter albums..."
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
                <span className={styles.searchBarLabel} style={{ marginLeft: "auto", opacity: 0.4 }}>
                    {totalFiltered !== totalAll
                        ? `${totalFiltered}/${totalAll} albums`
                        : `${totalAll} album${totalAll !== 1 ? "s" : ""}`
                    }
                </span>
            </div>

            {/* Tag bar */}
            {allTags.length > 0 && (
                <div className={styles.tagBar}>
                    <span className={styles.tagBarLabel}>Tags:</span>
                    {allTags.map((tag) => (
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

            {/* Folder grid */}
            <div className={styles.folderGrid}>
                {filteredFolders.map((folder) => (
                    <Link
                        key={folder.name}
                        href={folder.route}
                        className={styles.folderCard}
                    >
                        <div className={styles.folderPreview}>
                            {folder.previewPath ? (
                                <FolderPreviewImage
                                    thumbSrc={thumbUrl(folder.previewPath, "thumb")}
                                    microSrc={thumbUrl(folder.previewPath, "micro")}
                                    alt={folder.name}
                                />
                            ) : (
                                <div className={styles.folderPreviewEmpty}>
                                    📂
                                </div>
                            )}
                            {folder.imageCount > 0 && (
                                <span className={styles.folderPreviewCount}>
                                    {folder.imageCount} image
                                    {folder.imageCount !== 1 ? "s" : ""}
                                </span>
                            )}
                            {(folder.description || folder.tags.length > 0) && (
                                <div className={styles.folderMeta}>
                                    {folder.description && (
                                        <span className={styles.folderDescription}>
                                            {folder.description}
                                        </span>
                                    )}
                                    {folder.tags.length > 0 && (
                                        <span className={styles.folderTags}>
                                            {folder.tags.map((tag) => (
                                                <TagPill
                                                    key={tag}
                                                    size="sm"
                                                    color={getTagColor(tag)}
                                                >
                                                    {getTagLabel(tag)}
                                                </TagPill>
                                            ))}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.folderInfo}>
                            <span className={styles.folderIcon}>📁</span>
                            <span className={styles.folderName}>
                                {folder.name}
                            </span>
                        </div>
                    </Link>
                ))}
                {filteredLinkAlbums.map((album) => (
                    <LinkAlbumCard key={album.id} album={album} />
                ))}
            </div>
        </>
    );
}
