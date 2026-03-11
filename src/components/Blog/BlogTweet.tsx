"use client";

import TweetBlock from "@/components/Works/blocks/TweetBlock";
import type { WorksBlock } from "@/lib/works-metadata";

interface BlogTweetProps {
    id: string;
    caption?: string;
}

export default function BlogTweet({ id, caption }: BlogTweetProps) {
    const block: WorksBlock = {
        type: "tweet",
        tweetId: id,
        caption,
        tags: [],
    };

    return <TweetBlock block={block} />;
}
