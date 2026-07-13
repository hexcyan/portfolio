import { getPostBySlug, getAllPosts } from "@/lib/blog";

export function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}
import Link from "next/link";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import styles from "../../../blog.module.css";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/Blog/BlogArticle";
import BlogImage from "@/components/Blog/BlogImage";
import BlogYouTube from "@/components/Blog/BlogYouTube";
import BlogTweet from "@/components/Blog/BlogTweet";
import { Carousel, CarouselImage } from "@/components/Blog/BlogCarousel";
import TagPill from "@/components/TagPill/TagPill";
import { Children, isValidElement, type ReactNode } from "react";

/** MDX wraps images in <p>, but our blocks render <div>. Swap to <div> when needed. */
function MdxParagraph({ children, ...props }: { children?: ReactNode }) {
    const hasBlock = Children.toArray(children).some(
        (child) => isValidElement(child) && typeof child.type !== "string"
    );
    return hasBlock
        ? <div className={styles.mdxBlock} {...props}>{children}</div>
        : <p {...props}>{children}</p>;
}

/** External links open in a new tab; internal route links use client-side
 *  navigation; in-page anchors (#…) stay as plain anchors. */
function BlogLink({ href = "", children, ...props }: { href?: string; children?: ReactNode }) {
    if (/^https?:\/\//.test(href)) {
        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    }
    if (href.startsWith("/")) {
        return <Link href={href} {...props}>{children}</Link>;
    }
    return <a href={href} {...props}>{children}</a>;
}

const components = {
    img: BlogImage,
    a: BlogLink,
    YouTube: BlogYouTube,
    Tweet: BlogTweet,
    Carousel,
    CarouselImage,
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
                        <Link href="/blog">← Blog</Link>
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
