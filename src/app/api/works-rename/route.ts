import { NextRequest, NextResponse } from "next/server";
import { getCDNConfig } from "@/lib/cdn";
import { getWorksFolderMeta, putWorksFolderMeta } from "@/lib/works-metadata";

export async function POST(request: NextRequest) {
    const { folder, oldName, newName } = (await request.json()) as {
        folder: string;
        oldName: string;
        newName: string;
    };

    if (!folder || !oldName || !newName || oldName === newName) {
        return NextResponse.json(
            { error: "Invalid parameters" },
            { status: 400 }
        );
    }

    const { storageZone } = getCDNConfig();
    const writeKey = process.env.CDN_WRITE_KEY || process.env.CDN_API_KEY || "";

    if (!storageZone || !writeKey) {
        return NextResponse.json(
            { error: "CDN credentials not configured" },
            { status: 500 }
        );
    }

    const basePath = `https://la.storage.bunnycdn.com/${storageZone}/works/${folder}`;

    try {
        // 1. GET old file
        const getRes = await fetch(`${basePath}/${oldName}`, {
            headers: { AccessKey: writeKey },
        });
        if (!getRes.ok) {
            return NextResponse.json(
                { error: "Old file not found" },
                { status: 404 }
            );
        }
        const fileData = await getRes.arrayBuffer();

        // 2. PUT new name
        const putRes = await fetch(`${basePath}/${newName}`, {
            method: "PUT",
            headers: {
                AccessKey: writeKey,
                "Content-Type": "application/octet-stream",
            },
            body: fileData,
        });
        if (!putRes.ok) {
            return NextResponse.json(
                { error: "Failed to upload renamed file" },
                { status: 500 }
            );
        }

        // 3. DELETE old file
        await fetch(`${basePath}/${oldName}`, {
            method: "DELETE",
            headers: { AccessKey: writeKey },
        });

        // 4. Update metadata.json — rename key in images dict + update subsection blocks
        const meta = await getWorksFolderMeta(folder);
        if (meta) {
            // Rename in images dict
            if (meta.images[oldName]) {
                meta.images[newName] = meta.images[oldName];
                delete meta.images[oldName];
            }

            // Rename in subsection blocks
            if (meta.subsections) {
                for (const sub of meta.subsections) {
                    for (const block of sub.blocks) {
                        if (block.type === "image" && block.filename === oldName) {
                            block.filename = newName;
                        }
                    }
                }
            }

            await putWorksFolderMeta(folder, meta);
        }

        return NextResponse.json({ ok: true, oldName, newName });
    } catch (err) {
        return NextResponse.json(
            { error: "Rename failed", detail: String(err) },
            { status: 500 }
        );
    }
}
