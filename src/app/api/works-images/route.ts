import { NextRequest, NextResponse } from "next/server";
import { listFolder } from "@/lib/cdn";

export async function GET(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");
    const path = folder ? `works/${folder}` : "works";

    try {
        const { directories, images } = await listFolder(path);
        return NextResponse.json({ directories, images });
    } catch {
        return NextResponse.json(
            { directories: [], images: [] },
            { status: 500 }
        );
    }
}
