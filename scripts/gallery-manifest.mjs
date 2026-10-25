/**
 * Precomputes gallery image sizes and blur placeholders at deploy (runs as `prebuild` and `predev`).
 *
 * For every image in each gallery album (covers included) and every link-album cover, writes
 *   src/generated/gallery-manifest.json → { "<cdn path>": { w, h, blur } }
 * w/h come from the 400px thumb's WebP header (a 64-byte range request), so ratios are exact;
 * blur is the 30px micro thumb inlined as a data URI. Album pages lay photos out from this file
 * on the server, so nothing waits for images or JS to learn its size.
 *
 * Gallery photos rarely change, so this runs once per build, not per revalidation. A photo added
 * after a deploy is missing here and falls back to sizing itself in the browser.
 * Without CDN credentials it writes an empty manifest and exits 0.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "generated", "gallery-manifest.json");
const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)$/i;
const CONCURRENCY = 8;

try { process.loadEnvFile(".env"); } catch { /* deploy envs come from the host */ }
const zone = process.env.CDN_STORAGE_ZONE, key = process.env.CDN_API_KEY, pull = process.env.NEXT_PUBLIC_CDN_URL;

function write(manifest) {
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(manifest));
}

if (!zone || !key || !pull) {
    console.warn("gallery-manifest: CDN env missing, writing an empty manifest (photos will size themselves in the browser)");
    write({});
    process.exit(0);
}

const storage = async (path) => {
    const res = await fetch(`https://la.storage.bunnycdn.com/${zone}/${path}`, { headers: { AccessKey: key, Accept: "application/json" } });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.json();
};

// same naming as thumbUrl() in src/lib/cdn.ts
const thumb = (path, size) => {
    const dir = path.slice(0, path.lastIndexOf("/")), base = path.slice(path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
    return `${pull}/${dir}/_thumbs/${base}.${size}.webp`;
};

// width/height from the first chunk of a WebP file (lossy VP8, lossless VP8L, extended VP8X)
function webpSize(b) {
    if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") throw new Error("not a WebP file");
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >>> 14) & 0x3fff) + 1 }; }
    if (chunk === "VP8X") return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
    throw new Error(`unknown WebP chunk ${chunk}`);
}

async function describe(path) {
    const [head, micro] = await Promise.all([
        fetch(thumb(path, "thumb"), { headers: { Range: "bytes=0-63" } }),
        fetch(thumb(path, "micro")),
    ]);
    if (!head.ok || !micro.ok) throw new Error(`thumbs missing (${head.status}/${micro.status})`);
    const size = webpSize(Buffer.from(await head.arrayBuffer()));
    const blur = `data:image/webp;base64,${Buffer.from(await micro.arrayBuffer()).toString("base64")}`;
    return { ...size, blur };
}

const paths = [];
for (const folder of await storage("gallery/")) {
    if (!folder.IsDirectory || folder.ObjectName.startsWith("_")) continue;
    for (const f of await storage(`gallery/${folder.ObjectName}/`)) {
        if (!f.IsDirectory && IMAGE_RE.test(f.ObjectName)) paths.push(`gallery/${folder.ObjectName}/${f.ObjectName}`);
    }
}
try {
    const meta = await storage("gallery/metadata.json");
    for (const la of meta.linkAlbums ?? []) if (la.coverPath) paths.push(la.coverPath);
} catch { /* no link albums */ }

const manifest = {}, failed = [];
const queue = [...paths];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
        const p = queue.shift();
        try { manifest[p] = await describe(p); } catch (e) { failed.push(`${p}: ${e.message}`); }
    }
}));

write(manifest);
console.log(`gallery-manifest: ${Object.keys(manifest).length}/${paths.length} images → ${OUT}`);
if (failed.length) console.warn(`gallery-manifest: skipped (will size in the browser):\n  ${failed.join("\n  ")}`);
