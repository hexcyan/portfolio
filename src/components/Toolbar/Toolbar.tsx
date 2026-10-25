"use client";

import type { ReactNode } from "react";
import styles from "./Toolbar.module.css";

interface ToolbarSearch {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

interface ToolbarProps {
    /** Icon + name, or a Back link + name */
    title?: ReactNode;
    search?: ToolbarSearch;
    /** <ToolbarButton>s: view modes and toggles */
    view?: ReactNode;
    /** Item count, right-aligned */
    count?: ReactNode;
    /** Tag pills; rendered as a second "Tags:" row */
    filters?: ReactNode;
    /** Extra rows (<ToolbarRow>) below the filters */
    children?: ReactNode;
}

/** The toolbar every tab uses. Slots left to right: title, search, view, count; filters on a second row. */
export default function Toolbar({ title, search, view, count, filters, children }: ToolbarProps) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.row}>
                {title && <span className={styles.title}>{title}</span>}
                {search && (
                    <>
                        <span className={styles.label}>Search:</span>
                        <div className={styles.search}>
                            <span className={styles.searchIcon}>&#x2315;</span>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder={search.placeholder}
                                value={search.value}
                                onChange={(e) => search.onChange(e.target.value)}
                            />
                            {search.value && (
                                <button
                                    className={styles.searchClear}
                                    onClick={() => search.onChange("")}
                                >
                                    &#x2715;
                                </button>
                            )}
                        </div>
                    </>
                )}
                {(view || count != null) && (
                    <div className={styles.end}>
                        {view && <div className={styles.view}>{view}</div>}
                        {count != null && <span className={styles.count}>{count}</span>}
                    </div>
                )}
            </div>
            {filters && (
                <div className={`${styles.row} ${styles.filters}`}>
                    <span className={styles.label}>Tags:</span>
                    {filters}
                </div>
            )}
            {children}
        </div>
    );
}

/** An extra toolbar row for read-only info (description, tags). */
export function ToolbarRow({ children }: { children: ReactNode }) {
    return <div className={`${styles.row} ${styles.info}`}>{children}</div>;
}

export function ToolbarInfo({ children }: { children: ReactNode }) {
    return <span className={styles.infoText}>{children}</span>;
}

export function ToolbarDivider() {
    return <span className={styles.divider} />;
}

export function ToolbarLabel({ children }: { children: ReactNode }) {
    return <span className={styles.label}>{children}</span>;
}

interface ToolbarButtonProps {
    active?: boolean;
    /** An on/off switch rather than a view mode: dashed border, spaced from the modes */
    toggle?: boolean;
    onClick?: () => void;
    title?: string;
    children: ReactNode;
}

export function ToolbarButton({ active, toggle, onClick, title, children }: ToolbarButtonProps) {
    return (
        <button
            className={`${styles.button} ${toggle ? styles.buttonToggle : ""} ${active ? styles.buttonActive : ""}`}
            onClick={onClick}
            title={title}
        >
            {children}
        </button>
    );
}

/** Bottom status strip of a fill tab: counts and filters on the left, mode on the right. */
export function ToolbarStatus({ left, right }: { left: ReactNode; right?: ReactNode }) {
    return (
        <div className={styles.status}>
            <div className={styles.statusLeft}>{left}</div>
            {right != null && <div className={styles.statusRight}>{right}</div>}
        </div>
    );
}
