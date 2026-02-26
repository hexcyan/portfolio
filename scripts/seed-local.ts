/**
 * Seed script: exports current static data from paints.ts and palettes.ts
 * into local JSON files in the data/ directory.
 *
 * Usage: npx tsx scripts/seed-local.ts
 */

import * as fs from "fs";
import * as path from "path";
import { hbPaints, myStock, paintFamily } from "../src/lib/paints";
import { paletteLayouts, curatedPalettes } from "../src/lib/palettes";

const dataDir = path.resolve(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

function writeJSON(filename: string, data: unknown) {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`  wrote ${filePath}`);
}

console.log("Seeding local JSON files...\n");

writeJSON("hb-paints.json", hbPaints);
writeJSON("my-stock.json", myStock);
writeJSON("paint-family.json", paintFamily);
writeJSON("palette-layouts.json", paletteLayouts);
writeJSON("curated-palettes.json", curatedPalettes);

console.log("\nDone! Edit files in data/ then run: npm run update-cdn");
