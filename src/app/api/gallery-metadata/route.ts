import { NextRequest, NextResponse } from "next/server";
import {
    getAlbumMetadata,
    putAlbumMetadata,
    getGalleryGlobalMeta,
    putGalleryGlobalMeta,
} from "@/lib/gallery-metadata";
import type { AlbumMetadata, GalleryGlobalMeta } from "@/lib/gallery-metadata";

export async function GET(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");

    // No folder = return global gallery metadata
    if (!folder) {
        const global = await getGalleryGlobalMeta();
        return NextResponse.json(global);
    }

    const metadata = await getAlbumMetadata(folder);
    return NextResponse.json(
        metadata ?? { description: "", tags: [], images: {} }
    );
}

export async function PUT(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");

    // No folder = write global gallery metadata
    if (!folder) {
        const data = (await request.json()) as GalleryGlobalMeta;
        const ok = await putGalleryGlobalMeta(data);
        if (!ok) {
            return NextResponse.json(
                { error: "Failed to write global metadata" },
                { status: 500 }
            );
        }
        return NextResponse.json({ ok: true });
    }

    const data = (await request.json()) as AlbumMetadata;
    const ok = await putAlbumMetadata(folder, data);

    if (!ok) {
        return NextResponse.json(
            { error: "Failed to write metadata" },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
}
