"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { type IIcon } from "@/lib/consts";
import styles from "./Tools.module.css";

function DescriptionBox({ file }: { file: IIcon }) {
    return (
        <div className={styles.description}>
            {file.descr?.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
            ))}
            {file.links && file.links.length > 0 && (
                <div className={styles.descrLinks}>
                    {file.links.map(([name, url]) => (
                        <a
                            key={url}
                            href={url}
                            className={styles.descrLink}
                            {...(url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                            {name}
                            <span className={styles.descrLinkArrow}>&#x2197;</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ToolsClient({
    tools,
    projects,
}: {
    tools: IIcon[];
    projects: IIcon[];
}) {
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
                            <DescriptionBox file={file} />
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
                                <DescriptionBox file={file} />
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
