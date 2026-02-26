/**
 * CLI tool: uploads local JSON files from data/ to BunnyCDN storage.
 *
 * Usage:
 *   npx tsx scripts/update-cdn.ts           # upload all
 *   npx tsx scripts/update-cdn.ts --only paints stock
 */

import * as fs from "fs";
import * as path from "path";

const STORAGE_ZONE = process.env.CDN_STORAGE_ZONE;
const API_KEY = process.env.CDN_WRITE_KEY;

if (!STORAGE_ZONE || !API_KEY) {
    console.error("Missing CDN_STORAGE_ZONE or CDN_WRITE_KEY in .env");
    process.exit(1);
}

const COLLECTIONS: Record<string, string> = {
    paints: "hb-paints.json",
    stock: "my-stock.json",
    family: "paint-family.json",
    layouts: "palette-layouts.json",
    curated: "curated-palettes.json",
};

const dataDir = path.resolve(__dirname, "..", "data");

async function uploadFile(filename: string): Promise<boolean> {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`  SKIP ${filename} — file not found`);
        return false;
    }

    const content = fs.readFileSync(filePath);
    const url = `https://la.storage.bunnycdn.com/${STORAGE_ZONE}/paints/data/${filename}`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            AccessKey: API_KEY!,
            "Content-Type": "application/json",
        },
        body: content,
    });

    if (res.ok) {
        console.log(`  OK  ${filename}`);
        return true;
    } else {
        console.error(`  FAIL ${filename} — ${res.status} ${res.statusText}`);
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const onlyIdx = args.indexOf("--only");

    let toUpload: string[];
    if (onlyIdx !== -1) {
        const keys = args.slice(onlyIdx + 1);
        const invalid = keys.filter((k) => !COLLECTIONS[k]);
        if (invalid.length) {
            console.error(`Unknown collection(s): ${invalid.join(", ")}`);
            console.error(`Valid: ${Object.keys(COLLECTIONS).join(", ")}`);
            process.exit(1);
        }
        toUpload = keys.map((k) => COLLECTIONS[k]);
    } else {
        toUpload = Object.values(COLLECTIONS);
    }

    console.log(`Uploading ${toUpload.length} file(s) to BunnyCDN...\n`);

    let ok = 0;
    let fail = 0;
    for (const file of toUpload) {
        const success = await uploadFile(file);
        if (success) ok++;
        else fail++;
    }

    console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
    if (fail > 0) process.exit(1);
}

main();
