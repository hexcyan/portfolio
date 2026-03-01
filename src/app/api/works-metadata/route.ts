import { NextRequest, NextResponse } from "next/server";
import {
    getWorksGlobalMeta,
    putWorksGlobalMeta,
    getWorksFolderMeta,
    putWorksFolderMeta,
} from "@/lib/works-metadata";
import type { WorksGlobalMeta, WorksFolderMeta } from "@/lib/works-metadata";

export async function GET(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");

    if (folder) {
        const meta = await getWorksFolderMeta(folder);
        return NextResponse.json(
            meta ?? { images: {} }
        );
    }

    const global = await getWorksGlobalMeta();
    return NextResponse.json(global ?? { tags: [] });
}

export async function PUT(request: NextRequest) {
    const folder = request.nextUrl.searchParams.get("folder");

    if (folder) {
        const data = (await request.json()) as WorksFolderMeta;
        const ok = await putWorksFolderMeta(folder, data);
        if (!ok) {
            return NextResponse.json(
                { error: "Failed to write folder metadata" },
                { status: 500 }
            );
        }
        return NextResponse.json({ ok: true });
    }

    const data = (await request.json()) as WorksGlobalMeta;
    const ok = await putWorksGlobalMeta(data);
    if (!ok) {
        return NextResponse.json(
            { error: "Failed to write global metadata" },
            { status: 500 }
        );
    }
    return NextResponse.json({ ok: true });
}
