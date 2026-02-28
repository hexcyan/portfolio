"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { projects, tools } from "@/lib/consts";
import styles from "./Tools.module.css";

export default function ToolsPage() {
    const [query, setQuery] = useState("");

    const q = query.toLowerCase();
    const filteredTools = tools.filter(
        (f) =>
            f.title.toLowerCase().includes(q) ||
            (f.descr?.toLowerCase().includes(q) ?? false)
    );
    const filteredProjects = projects.filter(
        (f) =>
            f.title.toLowerCase().includes(q) ||
            (f.descr?.toLowerCase().includes(q) ?? false)
    );
    const totalCount = filteredTools.length + filteredProjects.length;

    return (
        <div className="explorer narrow">
            <div className={styles.toolbar}>
                <h1 className={styles.toolbarTitle}>Tools</h1>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <span className={styles.itemCount}>
                    {totalCount} object(s)
                </span>
            </div>

            {filteredTools.length > 0 && (
                <div>
                    {filteredTools.map((file, index) => (
                        <div
                            key={`${file.title}-${index}`}
                            className={styles.projectRow}
                        >
                            <Icon file={file} index={index} center={true} />
                            <div className={styles.description}>
                                {file.descr?.split("\n").map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredProjects.length > 0 && (
                <>
                    <h2 className={styles.sectionTitle}>Projects</h2>
                    <div>
                        {filteredProjects.map((file, index) => (
                            <div
                                key={`${file.title}-${index}`}
                                className={styles.projectRow}
                            >
                                <Icon file={file} index={index} />
                                <div className={styles.description}>
                                    {file.descr?.split("\n").map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {totalCount === 0 && (
                <p className={styles.noResults}>No results found.</p>
            )}
        </div>
    );
}
