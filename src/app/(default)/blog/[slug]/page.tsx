import { getPostBySlug, getAllPosts } from "@/lib/blog";

export function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import styles from "../../../blog.module.css";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/Blog/BlogArticle";
import BlogImage from "@/components/Blog/BlogImage";
import BlogYouTube from "@/components/Blog/BlogYouTube";
import BlogTweet from "@/components/Blog/BlogTweet";
import TagPill from "@/components/TagPill/TagPill";
import { Children, isValidElement, type ReactNode } from "react";

/** MDX wraps images in <p>, but our blocks render <div>. Swap to <div> when needed. */
function MdxParagraph({ children, ...props }: { children?: ReactNode }) {
    const hasBlock = Children.toArray(children).some(
        (child) => isValidElement(child) && typeof child.type !== "string"
    );
    return hasBlock
        ? <div {...props}>{children}</div>
        : <p {...props}>{children}</p>;
}

const components = {
    img: BlogImage,
    YouTube: BlogYouTube,
    Tweet: BlogTweet,
    p: MdxParagraph,
};

const options: MDXRemoteProps["options"] = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
    },
};

export default async function Blog({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        const post = getPostBySlug(slug);

        return (
            <BlogArticle>
                <nav className={styles.breadcrumbs}>
                    <div className={styles.breadcrumbPath}>
                        <a href="/blog">← Blog</a>
                        <span className={styles.separator}>&gt;</span>
                        <span className={styles.current}>{post.fm.title}</span>
                    </div>
                    {post.fm.tags?.length > 0 && (
                        <div className={styles.breadcrumbTags}>
                            {post.fm.tags.map((tag: string) => (
                                <TagPill key={tag} size="sm">{tag}</TagPill>
                            ))}
                        </div>
                    )}
                </nav>

                {post.fm.splash && (
                    <div className={styles.splash}>
                        <img src={post.fm.splash} alt={post.fm.title} />
                    </div>
                )}

                <article className={styles.prose}>
                    <h1>{post.fm.title}</h1>
                    <MDXRemote
                        source={post.content}
                        options={options}
                        components={components}
                    />
                </article>
            </BlogArticle>
        );
    } catch {
        notFound();
    }
}
