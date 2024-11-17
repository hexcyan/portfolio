import remarkGfm from "remark-gfm";
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include markdown and MDX files
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    // Optionally, add any other Next.js config below
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.b-cdn.net", // This will allow all BunnyCDN subdomains
                pathname: "/**",
            },
        ],
        domains: ["x65535.b-cdn.net"],
    },
};

const withMDX = createMDX({
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
    },
});

export default withMDX(nextConfig);
