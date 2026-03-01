/**
 * CLI tool: generates WebP thumbnails for BunnyCDN images.
 *
 * For each image in gallery/ and works/ folders, generates:
 *   _thumbs/{name}.thumb.webp  — 400px wide, quality 75
 *   _thumbs/{name}.micro.webp  — 30px wide, quality 50
 *
 * Usage:
 *   npm run generate-thumbs                          # process all gallery + works
 *   npm run generate-thumbs -- --only gallery        # just gallery
 *   npm run generate-thumbs -- --only works          # just works
 *   npm run generate-thumbs -- --folder gallery/cats # single folder
 *   npm run generate-thumbs -- --force               # regenerate even if thumbs exist
 */

import sharp from "sharp";

const STORAGE_ZONE = process.env.CDN_STORAGE_ZONE;
const API_KEY = process.env.CDN_WRITE_KEY || process.env.CDN_API_KEY;
const BASE_URL = `https://la.storage.bunnycdn.com/${STORAGE_ZONE}`;

if (!STORAGE_ZONE || !API_KEY) {
    console.error("Missing CDN_STORAGE_ZONE or CDN_WRITE_KEY/CDN_API_KEY in .env");
    process.exit(1);
}

interface BunnyStorageObject {
    ObjectName: string;
    Path: string;
    IsDirectory: boolean;
    Length: number;
}

const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)$/i;

const SIZES = [
    { suffix: "thumb", width: 400, quality: 75 },
    { suffix: "micro", width: 30, quality: 50 },
] as const;

// ── BunnyCDN helpers ──

async function listDir(folderPath: string): Promise<BunnyStorageObject[]> {
    const url = `${BASE_URL}/${folderPath}/`;
    const res = await fetch(url, {
        headers: { AccessKey: API_KEY!, Accept: "application/json" },
    });
    if (!res.ok) {
        throw new Error(`List ${folderPath}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as BunnyStorageObject[];
}

async function downloadFile(filePath: string): Promise<Buffer> {
    const url = `${BASE_URL}/${filePath}`;
    const res = await fetch(url, {
        headers: { AccessKey: API_KEY! },
    });
    if (!res.ok) {
        throw new Error(`Download ${filePath}: ${res.status} ${res.statusText}`);
    }
    return Buffer.from(await res.arrayBuffer());
}

async function uploadFile(filePath: string, data: Buffer): Promise<boolean> {
    const url = `${BASE_URL}/${filePath}`;
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            AccessKey: API_KEY!,
            "Content-Type": "application/octet-stream",
        },
        body: new Uint8Array(data),
    });
    return res.ok;
}

async function fileExists(filePath: string): Promise<boolean> {
    const url = `${BASE_URL}/${filePath}`;
    const res = await fetch(url, {
        method: "HEAD",
        headers: { AccessKey: API_KEY! },
    });
    return res.ok;
}

// ── Core logic ──

async function getSubfolders(root: string): Promise<string[]> {
    const items = await listDir(root);
    return items
        .filter((item) => item.IsDirectory)
        .map((item) => `${root}/${item.ObjectName}`)
        // Skip _thumbs folders
        .filter((path) => !path.endsWith("/_thumbs/") && !path.endsWith("/_thumbs"));
}

async function getImages(folder: string): Promise<string[]> {
    const items = await listDir(folder);
    return items
        .filter((item) => !item.IsDirectory && IMAGE_RE.test(item.ObjectName))
        .map((item) => item.ObjectName);
}

function baseName(filename: string): string {
    return filename.replace(/\.[^.]+$/, "");
}

async function processFolder(folder: string, force: boolean): Promise<{ processed: number; skipped: number; failed: number }> {
    const stats = { processed: 0, skipped: 0, failed: 0 };

    let images: string[];
    try {
        images = await getImages(folder);
    } catch (err) {
        console.error(`  ERROR listing ${folder}:`, err);
        return stats;
    }

    if (images.length === 0) return stats;

    console.log(`  📂 ${folder} — ${images.length} image(s)`);

    for (const filename of images) {
        const base = baseName(filename);

        // Check if thumbnails already exist (skip if both exist and not forcing)
        if (!force) {
            const thumbPath = `${folder}/_thumbs/${base}.thumb.webp`;
            const microPath = `${folder}/_thumbs/${base}.micro.webp`;

            try {
                const [thumbExists, microExists] = await Promise.all([
                    fileExists(thumbPath),
                    fileExists(microPath),
                ]);
                if (thumbExists && microExists) {
                    stats.skipped++;
                    continue;
                }
            } catch {
                // If check fails, proceed to generate
            }
        }

        // Download original
        let originalBuffer: Buffer;
        try {
            originalBuffer = await downloadFile(`${folder}/${filename}`);
        } catch (err) {
            console.error(`    FAIL download ${filename}:`, err);
            stats.failed++;
            continue;
        }

        // Generate and upload each size
        let allOk = true;
        for (const size of SIZES) {
            const outName = `${base}.${size.suffix}.webp`;
            const outPath = `${folder}/_thumbs/${outName}`;

            try {
                const resized = await sharp(originalBuffer)
                    .rotate() // auto-apply EXIF orientation
                    .resize({ width: size.width, withoutEnlargement: true })
                    .webp({ quality: size.quality })
                    .toBuffer();

                const ok = await uploadFile(outPath, resized);
                if (!ok) {
                    console.error(`    FAIL upload ${outPath}`);
                    allOk = false;
                }
            } catch (err) {
                console.error(`    FAIL resize ${filename} → ${size.suffix}:`, err);
                allOk = false;
            }
        }

        if (allOk) {
            console.log(`    ✓ ${filename}`);
            stats.processed++;
        } else {
            stats.failed++;
        }
    }

    return stats;
}

// ── CLI ──

async function main() {
    const args = process.argv.slice(2);
    const force = args.includes("--force");

    let folders: string[] = [];

    const folderIdx = args.indexOf("--folder");
    const onlyIdx = args.indexOf("--only");

    if (folderIdx !== -1 && args[folderIdx + 1]) {
        // Single folder mode
        const target = args[folderIdx + 1].replace(/\/$/, "");
        folders = [target];
    } else if (onlyIdx !== -1 && args[onlyIdx + 1]) {
        // Filter to specific root
        const root = args[onlyIdx + 1];
        if (root !== "gallery" && root !== "works") {
            console.error(`--only must be "gallery" or "works"`);
            process.exit(1);
        }
        console.log(`Scanning ${root}/...\n`);
        folders = await getSubfolders(root);
    } else {
        // Process all
        console.log("Scanning gallery/ and works/...\n");
        const [galleryFolders, worksFolders] = await Promise.all([
            getSubfolders("gallery"),
            getSubfolders("works"),
        ]);
        folders = [...galleryFolders, ...worksFolders];
    }

    if (folders.length === 0) {
        console.log("No folders found.");
        return;
    }

    console.log(`Found ${folders.length} folder(s) to process${force ? " (force mode)" : ""}:\n`);

    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const folder of folders) {
        const stats = await processFolder(folder, force);
        totalProcessed += stats.processed;
        totalSkipped += stats.skipped;
        totalFailed += stats.failed;
    }

    console.log(`\nDone: ${totalProcessed} generated, ${totalSkipped} skipped, ${totalFailed} failed`);
    if (totalFailed > 0) process.exit(1);
}

main();
