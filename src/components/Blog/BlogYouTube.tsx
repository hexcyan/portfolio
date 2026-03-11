"use client";

import YouTubeBlock from "@/components/Works/blocks/YouTubeBlock";
import type { WorksBlock } from "@/lib/works-metadata";

interface BlogYouTubeProps {
    id: string;
    caption?: string;
}

export default function BlogYouTube({ id, caption }: BlogYouTubeProps) {
    const block: WorksBlock = {
        type: "youtube",
        videoId: id,
        caption,
        tags: [],
    };

    return <YouTubeBlock block={block} />;
}
