import { getPostBySlug } from "@/lib/blog";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import styles from "../../../blog.module.css";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ComponentProps } from "react";

const CustomImage = (props: ComponentProps<"img">) => {
    const { src, alt } = props;
    if (!src) return null;
    return (
        <div className={styles.imgContainer}>
            <Image
                src={src}
                alt={alt || ""}
                width={500}
                height={360}
                className="w-full h-auto"
                style={{ objectFit: "contain" }}
            />
        </div>
    );
};

const components = {
    img: CustomImage,
};

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
                <MDXRemote
                    source={post.content}
                    options={options}
                    components={components}
                />
            </article>
        );
    } catch {
        notFound();
    }
}
