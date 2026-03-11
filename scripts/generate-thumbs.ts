/**
 * CLI tool: generates WebP thumbnails for BunnyCDN images.
 *
 * For each image in gallery/ and works/ folders, generates:
 *   _thumbs/{name}.thumb.webp  — 400px wide, quality 75
 *   _thumbs/{name}.micro.webp  — 30px wide, quality 50
 *
 * Usage:
 *   npm run generate-thumbs                          # process all gallery + works + blog
 *   npm run generate-thumbs -- --only gallery        # just gallery
 *   npm run generate-thumbs -- --only works          # just works
 *   npm run generate-thumbs -- --only blog           # just blog
 *   npm run generate-thumbs -- --folder gallery/cats # single folder
 *   npm run generate-thumbs -- --force               # regenerate even if thumbs exist
 *   npm run generate-thumbs -- --purge               # delete orphaned thumbs (no matching original)
 *   npm run generate-thumbs -- --purge --only blog   # purge only blog thumbs
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

import { THUMB_SIZES } from "@/lib/cdn";

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

async function deleteFile(filePath: string): Promise<boolean> {
    const url = `${BASE_URL}/${filePath}`;
    const res = await fetch(url, {
        method: "DELETE",
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

        // Step 1: Explicitly orient based on EXIF, then output a clean buffer.
        // We apply a specific rotation angle so sharp cannot reorder the operation.
        const meta = await sharp(originalBuffer).metadata();
        const orientation = meta.orientation || 1;

        let orientPipeline = sharp(originalBuffer);
        if (orientation === 2) orientPipeline = orientPipeline.flop();
        else if (orientation === 3) orientPipeline = orientPipeline.rotate(180);
        else if (orientation === 4) orientPipeline = orientPipeline.flip();
        else if (orientation === 5) orientPipeline = orientPipeline.rotate(90).flop();
        else if (orientation === 6) orientPipeline = orientPipeline.rotate(90);
        else if (orientation === 7) orientPipeline = orientPipeline.rotate(270).flop();
        else if (orientation === 8) orientPipeline = orientPipeline.rotate(270);

        const orientedBuffer = await orientPipeline.withMetadata({ orientation: 1 }).toBuffer();

        // Step 2: Resize the correctly-oriented image (no EXIF ambiguity)
        let allOk = true;
        const root = folder.split("/")[0];
        const baseSuffixes = [...new Set(THUMB_SIZES.map((s) => s.suffix.replace(/^[^_]+_/, "")))];
        const resolved = baseSuffixes.map((s) => {
            const override = THUMB_SIZES.find((e) => e.suffix === `${root}_${s}`);
            return { ...(override ?? THUMB_SIZES.find((e) => e.suffix === s)!), suffix: s };
        });
        for (const size of resolved) {
            const outName = `${base}.${size.suffix}.webp`;
            const outPath = `${folder}/_thumbs/${outName}`;

            try {
                const resized = await sharp(orientedBuffer)
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

async function purgeFolder(folder: string): Promise<{ purged: number; kept: number }> {
    const stats = { purged: 0, kept: 0 };

    // Get original image base names
    let originals: Set<string>;
    try {
        const images = await getImages(folder);
        originals = new Set(images.map(baseName));
    } catch {
        console.error(`  ERROR listing ${folder}`);
        return stats;
    }

    // List _thumbs/ contents
    let thumbItems: BunnyStorageObject[];
    try {
        thumbItems = await listDir(`${folder}/_thumbs`);
    } catch {
        // No _thumbs folder — nothing to purge
        return stats;
    }

    const thumbFiles = thumbItems
        .filter((item) => !item.IsDirectory)
        .map((item) => item.ObjectName);

    for (const thumbFile of thumbFiles) {
        // Extract original base name: "foo.thumb.webp" or "foo.micro.webp" → "foo"
        const thumbBase = thumbFile.replace(/\.(thumb|micro)\.webp$/, "");
        if (originals.has(thumbBase)) {
            stats.kept++;
        } else {
            const thumbPath = `${folder}/_thumbs/${thumbFile}`;
            const ok = await deleteFile(thumbPath);
            if (ok) {
                console.log(`    🗑 ${thumbFile}`);
                stats.purged++;
            } else {
                console.error(`    FAIL delete ${thumbPath}`);
            }
        }
    }

    if (stats.purged > 0 || thumbFiles.length > 0) {
        console.log(`  📂 ${folder} — ${stats.purged} purged, ${stats.kept} kept`);
    }

    return stats;
}

// ── CLI ──

async function resolveFolders(args: string[]): Promise<string[]> {
    const folderIdx = args.indexOf("--folder");
    const onlyIdx = args.indexOf("--only");

    if (folderIdx !== -1 && args[folderIdx + 1]) {
        return [args[folderIdx + 1].replace(/\/$/, "")];
    }

    if (onlyIdx !== -1 && args[onlyIdx + 1]) {
        const root = args[onlyIdx + 1];
        if (root !== "gallery" && root !== "works" && root !== "blog") {
            console.error(`--only must be "gallery", "works", or "blog"`);
            process.exit(1);
        }
        console.log(`Scanning ${root}/...\n`);
        if (root === "blog") return ["blog"];
        return getSubfolders(root);
    }

    // Process all
    console.log("Scanning gallery/, works/, and blog/...\n");
    const [galleryFolders, worksFolders] = await Promise.all([
        getSubfolders("gallery"),
        getSubfolders("works"),
    ]);
    return [...galleryFolders, ...worksFolders, "blog"];
}

async function main() {
    const args = process.argv.slice(2);
    const force = args.includes("--force");
    const purge = args.includes("--purge");

    const folders = await resolveFolders(args);

    if (folders.length === 0) {
        console.log("No folders found.");
        return;
    }

    if (purge) {
        console.log(`Purging orphaned thumbnails in ${folders.length} folder(s):\n`);

        let totalPurged = 0;
        let totalKept = 0;

        for (const folder of folders) {
            const stats = await purgeFolder(folder);
            totalPurged += stats.purged;
            totalKept += stats.kept;
        }

        console.log(`\nDone: ${totalPurged} purged, ${totalKept} kept`);
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
