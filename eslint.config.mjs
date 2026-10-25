import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        // Images are served from our own CDN with pre-generated thumbs, not next/image.
        rules: { "@next/next/no-img-element": "off" },
    },
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
