import { Suspense } from "react";
import { getAllPosts } from "@/lib/blog";
import BlogToolbar from "@/components/BlogToolbar";

export default function Blog() {
    const posts = getAllPosts();

    // Collect all unique tags across posts
    const allTags = Array.from(
        new Set(posts.flatMap((p) => p.tags || []))
    ).sort();

    return (
        <Suspense>
            <BlogToolbar posts={posts} allTags={allTags} />
        </Suspense>
    );
}
