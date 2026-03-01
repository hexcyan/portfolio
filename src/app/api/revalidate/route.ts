import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    const { folder, type } = (await request.json()) as {
        folder?: string;
        type?: string;
    };

    if (type === "works") {
        revalidatePath("/works");
        return NextResponse.json({ revalidated: true, type: "works" });
    }

    if (folder) {
        // Revalidate the specific album page
        revalidatePath(`/gallery/${folder}`);
    }

    // Revalidate the gallery index page
    revalidatePath("/gallery");

    return NextResponse.json({ revalidated: true, folder: folder ?? "all" });
}
