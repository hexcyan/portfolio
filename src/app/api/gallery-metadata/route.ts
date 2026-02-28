import { NextRequest, NextResponse } from "next/server";
import { getAlbumMetadata, putAlbumMetadata } from "@/lib/gallery-metadata";
import type { AlbumMetadata } from "@/lib/gallery-metadata";

export async function GET(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");
    if (!folder) {
        return NextResponse.json(
            { error: "Missing folder parameter" },
            { status: 400 }
        );
    }

    const metadata = await getAlbumMetadata(folder);
    return NextResponse.json(
        metadata ?? { description: "", tags: [], images: {} }
    );
}

export async function PUT(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");
    if (!folder) {
        return NextResponse.json(
            { error: "Missing folder parameter" },
            { status: 400 }
        );
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
