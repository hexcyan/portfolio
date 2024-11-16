import remarkGfm from "remark-gfm";
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include markdown and MDX files
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    // Optionally, add any other Next.js config below
};

const withMDX = createMDX({
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
    },
});

export default withMDX(nextConfig);
