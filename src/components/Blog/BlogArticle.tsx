"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import GalleryViewer from "@/components/Gallery/GalleryViewer";

interface BlogViewerContextValue {
    registerImage: (src: string) => number;
    openViewer: (index: number) => void;
}

const BlogViewerContext = createContext<BlogViewerContextValue | null>(null);

export function useBlogViewer() {
    return useContext(BlogViewerContext);
}

export default function BlogArticle({ children }: { children: ReactNode }) {
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const imagesRef = useRef<{ id: string; path: string }[]>([]);
    const registeredSet = useRef<Set<string>>(new Set());

    const registerImage = useCallback((src: string): number => {
        if (!registeredSet.current.has(src)) {
            registeredSet.current.add(src);
            imagesRef.current = [
                ...imagesRef.current,
                { id: src.split("/").pop() || src, path: src },
            ];
        }
        return imagesRef.current.findIndex((img) => img.path === src);
    }, []);

    const openViewer = useCallback((index: number) => {
        setViewerIndex(index);
    }, []);

    return (
        <BlogViewerContext.Provider value={{ registerImage, openViewer }}>
            {children}
            {viewerIndex !== null && (
                <GalleryViewer
                    images={imagesRef.current}
                    initialIndex={viewerIndex}
                    folderName="Blog"
                    onClose={() => setViewerIndex(null)}
                />
            )}
        </BlogViewerContext.Provider>
    );
}
