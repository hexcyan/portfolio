"use client";

import { useEffect, type ComponentProps } from "react";
import ImageBlock from "@/components/Works/blocks/ImageBlock";
import { useBlogViewer } from "./BlogArticle";
import type { WorksBlock } from "@/lib/works-metadata";

interface BlogImageJSXProps {
    src: string;
    caption?: string;
}

type BlogImageProps = ComponentProps<"img"> | BlogImageJSXProps;

function isJSXProps(props: BlogImageProps): props is BlogImageJSXProps {
    return "caption" in props;
}

export default function BlogImage(props: BlogImageProps) {
    const viewer = useBlogViewer();

    const imgSrc = isJSXProps(props)
        ? props.src
        : typeof props.src === "string" ? props.src : undefined;

    const caption = isJSXProps(props)
        ? props.caption
        : typeof props.alt === "string" ? props.alt : undefined;

    // Register this image with the viewer context
    useEffect(() => {
        if (imgSrc && viewer) {
            viewer.registerImage(imgSrc);
        }
    }, [imgSrc, viewer]);

    if (!imgSrc) return null;

    const block: WorksBlock = {
        type: "image",
        path: imgSrc,
        caption: caption || undefined,
        tags: [],
    };

    function handleClick() {
        if (!viewer || !imgSrc) return;
        const index = viewer.registerImage(imgSrc);
        viewer.openViewer(index);
    }

    return (
        <ImageBlock
            block={block}
            onClick={handleClick}
            standalone
        />
    );
}
