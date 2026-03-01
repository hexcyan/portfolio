import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCDNConfig } from "@/lib/cdn";

async function purgeCDNUrl(url: string) {
    const accountKey = process.env.BUNNY_ACCOUNT_KEY;
    if (!accountKey) return;
    await fetch(
        `https://api.bunny.net/purge?url=${encodeURIComponent(url)}`,
        { method: "POST", headers: { AccessKey: accountKey } }
    ).catch(() => {});
}

export async function POST(request: NextRequest) {
    const { folder, type } = (await request.json()) as {
        folder?: string;
        type?: string;
    };

    if (type === "works") {
        revalidatePath("/works");

        // Purge metadata.json files from BunnyCDN edge cache
        const { pullZone } = getCDNConfig();
        if (pullZone) {
            await purgeCDNUrl(`${pullZone}/works/metadata.json`);
            if (folder) {
                await purgeCDNUrl(`${pullZone}/works/${folder}/metadata.json`);
            }
        }

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
