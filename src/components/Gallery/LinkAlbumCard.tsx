"use client";

import type { LinkAlbum } from "@/lib/gallery-metadata";
import { thumbUrl } from "@/lib/cdn";
import FolderPreviewImage from "./FolderPreviewImage";
import styles from "./Gallery.module.css";

interface LinkAlbumCardProps {
    album: LinkAlbum;
}

export default function LinkAlbumCard({ album }: LinkAlbumCardProps) {
    const isExternal = (() => {
        try {
            const url = new URL(album.url, window.location.origin);
            return url.origin !== window.location.origin;
        } catch {
            return !album.url.startsWith("/");
        }
    })();

    return (
        <a
            href={album.url}
            className={styles.folderCard}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            <div className={styles.folderPreview}>
                {album.coverPath ? (
                    <FolderPreviewImage
                        thumbSrc={thumbUrl(album.coverPath, "thumb")}
                        microSrc={thumbUrl(album.coverPath, "micro")}
                        alt={album.name}
                    />
                ) : (
                    <div className={styles.folderPreviewEmpty}>🔗</div>
                )}
                <span className={styles.linkAlbumBadge}>&#x2197;</span>
                {(album.description || album.tags.length > 0) && (
                    <div className={styles.folderMeta}>
                        {album.description && (
                            <span className={styles.folderDescription}>
                                {album.description}
                            </span>
                        )}
                        {album.tags.length > 0 && (
                            <span className={styles.folderTags}>
                                {album.tags.map((tag) => (
                                    <span key={tag} className={styles.folderTag}>
                                        {tag}
                                    </span>
                                ))}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.folderInfo}>
                <span className={styles.folderIcon}>🔗</span>
                <span className={styles.folderName}>{album.name}</span>
            </div>
        </a>
    );
}
