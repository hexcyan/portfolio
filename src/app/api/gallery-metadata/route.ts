import { NextRequest, NextResponse } from "next/server";
import {
    getAlbumMetadata,
    getGalleryGlobalMeta,
} from "@/lib/gallery-metadata";

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
