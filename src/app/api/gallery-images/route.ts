import { NextRequest, NextResponse } from "next/server";
import { getImagesFromFolder } from "@/lib/cdn";

export async function GET(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");
    if (!folder) {
        return NextResponse.json(
            { error: "Missing folder parameter" },
            { status: 400 }
        );
    }

    try {
        const images = await getImagesFromFolder(`gallery/${folder}`);
        return NextResponse.json(images);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
