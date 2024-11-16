import { getPostBySlug } from "@/lib/blog";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import styles from "../../../blog.module.css";
import { notFound } from "next/navigation";

const options: MDXRemoteProps["options"] = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
    },
};

export default async function Blog({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    // const post = getPostBySlug(slug);

    try {
        const post = getPostBySlug(slug);
        return (
            <article className={styles.prose}>
                <h1>{post.fm.title}</h1>
                <MDXRemote source={post.content} options={options} />
            </article>
        );
    } catch {
        notFound();
    }
}
