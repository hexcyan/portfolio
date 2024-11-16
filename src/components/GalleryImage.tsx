"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./GalleryImage.module.css";

interface GalleryImageProps {
    imageId: string;
    alt: string;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    modalWidth?: number;
    modalHeight?: number;
}

export default function GalleryImage({
    imageId,
    alt,
    thumbnailWidth = 300,
    thumbnailHeight = 200,
    modalWidth = 1200,
    modalHeight = 800,
}: GalleryImageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pullZone = "https://x65535.b-cdn.net";

    const thumbnailUrl = `${pullZone}/${imageId}?width=${thumbnailWidth}&quality=85`;
    const fullSizeUrl = `${pullZone}/${imageId}?width=${modalWidth}&quality=90`;

    function handleOpenModal() {
        setIsModalOpen(true);
        document.body.style.overflow = "hidden";
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        document.body.style.overflow = "unset";
    }

    function stopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
        <>
            {/* Thumbnail */}
            <div className={styles.thumbnailWrapper} onClick={handleOpenModal}>
                <Image
                    src={thumbnailUrl}
                    alt={alt}
                    width={thumbnailWidth}
                    height={thumbnailHeight}
                    className={styles.thumbnail}
                    loading="lazy"
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div
                        className={styles.modalContent}
                        onClick={stopPropagation}
                    >
                        <button
                            className={styles.closeButton}
                            onClick={handleCloseModal}
                            aria-label="Close modal"
                        >
                            <svg
                                className={styles.closeIcon}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <Image
                            src={fullSizeUrl}
                            alt={alt}
                            width={modalWidth}
                            height={modalHeight}
                            className={styles.modalImage}
                            priority={true}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
