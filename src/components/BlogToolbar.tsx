"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/Card";
import type { BlogFrontMatter } from "@/lib/blog";
import styles from "./BlogToolbar.module.css";

type SortField = "title" | "description" | "tags" | "date";
type SortDir = "asc" | "desc";
type ViewMode = "detail" | "grid";

// ── Tag Colors ──
const TAG_COLORS: Record<string, { border: string; color: string; bg: string }> = {
    meta: { border: "#ff79c6", color: "#ff79c6", bg: "rgba(255, 37, 160, 0.2)" },
    keyboards: { border: "#50fa7b", color: "#50fa7b", bg: "rgba(80, 250, 123, 0.12)" },
};

const DEFAULT_TAG_COLOR = { border: "rgba(0, 255, 255, 0.3)", color: "rgba(255, 255, 255, 0.7)", bg: "transparent" };

function getTagColor(tag: string) {
    return TAG_COLORS[tag.toLowerCase()] || DEFAULT_TAG_COLOR;
}

interface BlogToolbarProps {
    posts: BlogFrontMatter[];
    allTags: string[];
}

export default function BlogToolbar({ posts, allTags }: BlogToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State from URL
    const activeTags = useMemo(() => {
        const t = searchParams.get("tags");
        return t ? t.split(",").filter(Boolean) : [];
    }, [searchParams]);

    // Local state
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [view, setView] = useState<ViewMode>("detail");

    // Update URL tags
    const setTags = useCallback(
        (tags: string[]) => {
            const params = new URLSearchParams(searchParams.toString());
            if (tags.length > 0) {
                params.set("tags", tags.join(","));
            } else {
                params.delete("tags");
            }
            router.push(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    const toggleTag = useCallback(
        (tag: string) => {
            if (activeTags.includes(tag)) {
                setTags(activeTags.filter((t) => t !== tag));
            } else {
                setTags([...activeTags, tag]);
            }
        },
        [activeTags, setTags]
    );

    const handleSort = useCallback(
        (field: SortField) => {
            if (sortField === field) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
                setSortField(field);
                setSortDir(field === "date" ? "desc" : "asc");
            }
        },
        [sortField]
    );

    // Filter + sort
    const filtered = useMemo(() => {
        let result = [...posts];

        // Tag filter
        if (activeTags.length > 0) {
            result = result.filter((p) =>
                activeTags.every((tag) => p.tags?.includes(tag))
            );
        }

        // Text search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    (p.description?.toLowerCase().includes(q) ?? false)
            );
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case "title":
                    cmp = a.title.localeCompare(b.title);
                    break;
                case "description":
                    cmp = (a.description || "").localeCompare(
                        b.description || ""
                    );
                    break;
                case "tags":
                    cmp = (a.tags?.join(",") || "").localeCompare(
                        b.tags?.join(",") || ""
                    );
                    break;
                case "date":
                    cmp =
                        new Date(a.date).getTime() -
                        new Date(b.date).getTime();
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return result;
    }, [posts, activeTags, search, sortField, sortDir]);

    const sortIndicator = (field: SortField) => {
        if (sortField !== field) return null;
        return (
            <span className={styles.sortArrow}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <div className={styles.explorerShell}>
            {/* ── Toolbar ── */}
            <div className={styles.toolbar}>
                <span className={styles.toolbarLabel}>Search:</span>
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>⌕</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="filter posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className={styles.searchClear}
                            onClick={() => setSearch("")}
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className={styles.viewToggle}>
                    <button
                        className={`${styles.viewBtn} ${view === "detail" ? styles.viewBtnActive : ""}`}
                        onClick={() => setView("detail")}
                        title="Detail view"
                    >
                        ☰
                    </button>
                    <button
                        className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
                        onClick={() => setView("grid")}
                        title="Grid view"
                    >
                        ⊞
                    </button>
                </div>
            </div>

            {/* ── Tag Filter Bar ── */}
            {allTags.length > 0 && (
                <div className={styles.tagBar}>
                    <span className={styles.tagBarLabel}>Tags:</span>
                    {allTags.map((tag) => {
                        const tc = getTagColor(tag);
                        return (
                            <button
                                key={tag}
                                className={`${styles.tagBtn} ${activeTags.includes(tag) ? styles.tagBtnActive : ""}`}
                                style={{
                                    borderColor: tc.border,
                                    color: tc.color,
                                    backgroundColor: tc.bg,
                                }}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </button>
                        );
                    })}
                    {activeTags.length > 0 && (
                        <button
                            className={styles.tagClearAll}
                            onClick={() => setTags([])}
                        >
                            clear all
                        </button>
                    )}
                </div>
            )}

            {/* ── Detail View ── */}
            {view === "detail" && (
                <div className={styles.detailWrap}>
                    <div className={styles.columnHeaders}>
                        <div
                            className={`${styles.columnHeader} ${sortField === "title" ? styles.columnHeaderActive : ""}`}
                            onClick={() => handleSort("title")}
                        >
                            Name {sortIndicator("title")}
                        </div>
                        <div
                            className={`${styles.columnHeader} ${sortField === "description" ? styles.columnHeaderActive : ""}`}
                            onClick={() => handleSort("description")}
                        >
                            Description {sortIndicator("description")}
                        </div>
                        <div
                            className={`${styles.columnHeader} ${sortField === "tags" ? styles.columnHeaderActive : ""}`}
                            onClick={() => handleSort("tags")}
                        >
                            Tags {sortIndicator("tags")}
                        </div>
                        <div
                            className={`${styles.columnHeader} ${sortField === "date" ? styles.columnHeaderActive : ""}`}
                            onClick={() => handleSort("date")}
                        >
                            Date {sortIndicator("date")}
                        </div>
                    </div>
                    {filtered.length > 0 ? (
                        <div className={styles.detailList}>
                            {filtered.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className={styles.detailRow}
                                >
                                    <div
                                        className={`${styles.detailCell} ${styles.cellName}`}
                                    >
                                        <Image src="/assets/file.png" alt="" width={16} height={16} className={styles.fileIcon} />
                                        {post.title}
                                    </div>
                                    <div
                                        className={`${styles.detailCell} ${styles.cellDesc}`}
                                    >
                                        {post.description || "—"}
                                    </div>
                                    <div
                                        className={`${styles.detailCell} ${styles.cellTags}`}
                                    >
                                        {post.tags?.map((tag) => {
                                            const tc = getTagColor(tag);
                                            return (
                                                <span
                                                    key={tag}
                                                    className={styles.miniTag}
                                                    style={{
                                                        borderColor: tc.border,
                                                        color: tc.color,
                                                        backgroundColor: tc.bg,
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div
                                        className={`${styles.detailCell} ${styles.cellDate}`}
                                    >
                                        {formatDate(post.date)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            No files match the current filter.
                        </div>
                    )}
                </div>
            )}

            {/* ── Card Grid View ── */}
            {view === "grid" && (
                <div className={styles.gridWrap}>
                    {filtered.length > 0 ? (
                        <div className={styles.cardGrid}>
                            {filtered.map((post) => (
                                <Link
                                    href={`/blog/${post.slug}`}
                                    key={post.slug}
                                    className={styles.cardLink}
                                >
                                    <Card>
                                        <article className={styles.cardPost}>
                                            <h2 className={styles.cardTitle}>
                                                {post.title}
                                            </h2>
                                            <time
                                                dateTime={post.date}
                                                className={styles.cardDate}
                                            >
                                                {new Date(
                                                    post.date
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </time>
                                            {post.description && (
                                                <p
                                                    className={
                                                        styles.cardDescription
                                                    }
                                                >
                                                    {post.description}
                                                </p>
                                            )}
                                            {post.tags &&
                                                post.tags.length > 0 && (
                                                    <div
                                                        className={
                                                            styles.cardTagList
                                                        }
                                                    >
                                                        {post.tags.map(
                                                            (tag) => {
                                                                const tc = getTagColor(tag);
                                                                return (
                                                                    <span
                                                                        key={tag}
                                                                        className={styles.cardTag}
                                                                        style={{
                                                                            borderColor: tc.border,
                                                                            color: tc.color,
                                                                            backgroundColor: tc.bg,
                                                                        }}
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                        </article>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            No files match the current filter.
                        </div>
                    )}
                </div>
            )}

            {/* ── Status Bar ── */}
            <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                    <span>
                        {filtered.length} item{filtered.length !== 1 && "s"}
                        {filtered.length !== posts.length &&
                            ` (${posts.length} total)`}
                    </span>
                    {activeTags.length > 0 && (
                        <span>
                            Filtered by: {activeTags.join(", ")}
                        </span>
                    )}
                </div>
                <div className={styles.statusRight}>
                    {view === "detail" ? "Detail View" : "Grid View"}
                </div>
            </div>
        </div>
    );
}
