import { NextResponse } from "next/server";
import { getFolders } from "@/lib/cdn";

export async function GET() {
    try {
        const folders = await getFolders("gallery");
        const names = folders.map((f) => f.title);
        return NextResponse.json(names);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
