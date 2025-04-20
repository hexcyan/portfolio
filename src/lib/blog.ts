// /src/lib/blog.ts

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

export interface BlogFrontMatter {
    title: string;
    date: string;
    description?: string;
    slug: string;
    tags?: string[];
    splash?: string[];
}

const BLOG_PATH = join(process.cwd(), "content", "blog");

const slugToFileMap: Record<string, string> = {};

function preprocessBlogPosts() {
    const files = readdirSync(BLOG_PATH).filter((file) =>
        file.endsWith(".mdx")
    );

    files.forEach((file) => {
        const filePath = join(BLOG_PATH, file);
        const fileContents = readFileSync(filePath, "utf8");
        const { data } = matter(fileContents);

        if (data.slug) {
            slugToFileMap[data.slug] = filePath;
        } else {
            console.warn(
                `File ${file} does not have a slug in its front matter.`
            );
        }
    });
}

preprocessBlogPosts();

export function getPostBySlug(slug: string) {
    const filePath = slugToFileMap[slug];
    if (!filePath) {
        throw new Error(`Post with slug "${slug}" not found`);
    }

    try {
        const fileContents = readFileSync(filePath, "utf8");
        const { data: fontMatter, content } = matter(fileContents);

        return {
            fm: fontMatter,
            content,
        };
    } catch (error) {
        throw new Error(`Error reading post with slug "${slug}: ${error}"`);
    }
}

export function getAllPosts(): BlogFrontMatter[] {
    const posts = Object.values(slugToFileMap).map((filePath) => {
        const fileContent = readFileSync(filePath, "utf8");
        const { data } = matter(fileContent);

        return {
            title: data.title,
            date: data.date,
            description: data.description || "",
            slug: data.slug,
            tags: data.tags || [],
        };
    });

    return posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}
