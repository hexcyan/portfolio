import styles from "./page.module.css";
import Link from "next/link";
import Card from "@/components/Card";
import { getAllPosts } from "@/lib/blog";
// Return all posts
export default function Blog() {
    const posts = getAllPosts();
    return (
        <>
            <h1 className={styles.blogTitle}>Blog Posts</h1>
            <div className={styles.blogGrid}>
                {posts.map((post) => (
                    <Link
                        href={`/blog/${post.slug}`}
                        key={post.slug}
                        className={styles.postLink}
                    >
                        <Card>
                            <article className={styles.postCard}>
                                <h2 className={styles.postTitle}>
                                    {post.title}
                                </h2>
                                <time
                                    dateTime={post.date}
                                    className={styles.postDate}
                                >
                                    {new Date(post.date).toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </time>
                                {post.description && (
                                    <p className={styles.postDescription}>
                                        {post.description}
                                    </p>
                                )}
                                {post.tags && post.tags.length > 0 && (
                                    <div className={styles.tagList}>
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={styles.tag}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        </Card>
                    </Link>
                ))}
            </div>
        </>
    );
}
