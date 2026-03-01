import { Suspense } from "react";
import {
    getWorksGlobalMeta,
    getWorksFolderMeta,
} from "@/lib/works-metadata";
import type {
    WorksImage,
    WorksBlock,
    WorksSubsection,
    WorksSection,
    WorksMetadata,
} from "@/lib/works-metadata";
import { listFolder } from "@/lib/cdn";
import WorksExplorer from "@/components/Works/WorksExplorer";
import WorksConstructionPopup from "@/components/Works/WorksConstructionPopup";
import Spinner from "@/components/Spinner";

export const revalidate = 3600;

async function buildWorksData(): Promise<WorksMetadata & { unsortedImages: WorksImage[] }> {
    const [globalMeta, rootContents] = await Promise.all([
        getWorksGlobalMeta(),
        listFolder("works").catch(() => ({ directories: [], images: [] })),
    ]);

    const tags = globalMeta?.tags ?? [];
    const sections: WorksSection[] = [];

    const folderResults = await Promise.all(
        rootContents.directories.map(async (folder) => {
            const [folderMeta, folderContents] = await Promise.all([
                getWorksFolderMeta(folder),
                listFolder(`works/${folder}`).catch(() => ({
                    directories: [],
                    images: [],
                })),
            ]);

            const meta = folderMeta ?? { images: {} };
            const folderTags = meta.tags ?? [];

            // Build image list from CDN folder
            const images: WorksImage[] = [];
            for (const cdnImg of folderContents.images) {
                const imgMeta = meta.images[cdnImg.id];
                images.push({
                    filename: cdnImg.id,
                    folder,
                    caption: imgMeta?.caption,
                    tags: [...new Set([...folderTags, ...(imgMeta?.tags ?? [])])],
                    date: imgMeta?.date,
                    url: imgMeta?.url,
                });
            }

            // Images in metadata but not on CDN
            for (const [id, imgMeta] of Object.entries(meta.images)) {
                if (folderContents.images.some((ci) => ci.id === id)) continue;
                images.push({
                    filename: id,
                    folder,
                    caption: imgMeta.caption,
                    tags: [...new Set([...folderTags, ...(imgMeta.tags ?? [])])],
                    date: imgMeta.date,
                    url: imgMeta.url,
                });
            }

            // Resolve subsections: merge image metadata into blocks
            const assignedFilenames = new Set<string>();
            const subsections: WorksSubsection[] = (meta.subsections ?? []).map((sub) => {
                const subTags = sub.tags ?? [];
                const blocks: WorksBlock[] = sub.blocks.map((block) => {
                    const layout = { span: block.span, cols: block.cols };
                    if (block.type === "image" && block.filename) {
                        assignedFilenames.add(block.filename);
                        const imgMeta = meta.images[block.filename];
                        return {
                            type: "image" as const,
                            filename: block.filename,
                            folder,
                            caption: imgMeta?.caption,
                            tags: [...new Set([...folderTags, ...subTags, ...(imgMeta?.tags ?? [])])],
                            date: imgMeta?.date,
                            url: imgMeta?.url,
                            ...layout,
                        };
                    }
                    const inheritedTags = [...new Set([...folderTags, ...subTags, ...(block.tags ?? [])])];
                    if (block.type === "text") {
                        return {
                            type: "text" as const,
                            content: block.content,
                            tags: inheritedTags,
                            ...layout,
                        };
                    }
                    if (block.type === "youtube") {
                        return {
                            type: "youtube" as const,
                            videoId: block.videoId,
                            caption: block.caption,
                            tags: inheritedTags,
                            ...layout,
                        };
                    }
                    // tweet
                    return {
                        type: "tweet" as const,
                        tweetId: block.tweetId,
                        caption: block.caption,
                        tags: inheritedTags,
                        ...layout,
                    };
                });

                return {
                    id: sub.id,
                    title: sub.title,
                    description: sub.description,
                    dateRange: sub.dateRange,
                    date: sub.date,
                    columnMinWidth: sub.columnMinWidth,
                    sectionId: folder,
                    sectionTitle: meta.title || folder,
                    blocks,
                };
            });

            // Unassigned images = images not referenced in any subsection block
            const unassignedImages = images.filter(
                (img) => img.filename && !assignedFilenames.has(img.filename)
            );

            return {
                id: folder,
                title: meta.title || folder,
                description: meta.description,
                dateRange: meta.dateRange,
                columnMinWidth: meta.columnMinWidth,
                order: meta.order ?? 0,
                images: unassignedImages,
                subsections,
            } satisfies WorksSection;
        })
    );

    sections.push(...folderResults);

    // Loose images in works/ root
    const looseImages: WorksImage[] = rootContents.images
        .filter(
            (img) =>
                img.id.replace(/\.[^.]+$/, "").toLowerCase() !== "metadata"
        )
        .map((img) => ({
            filename: img.id,
            tags: [] as string[],
        }));

    return { tags, sections, unsortedImages: looseImages };
}

export default async function WorksPage() {
    const data = await buildWorksData();
    const { unsortedImages, ...metadata } = data;

    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "50vh",
                        gap: 8,
                        fontFamily: '"RedHatMono", monospace',
                        fontSize: "0.78em",
                        color: "rgba(255,255,255,0.5)",
                    }}
                >
                    <Spinner size={22} />
                    <span>Loading works...</span>
                </div>
            }
        >
            <WorksConstructionPopup />
            <WorksExplorer metadata={metadata} unsortedImages={unsortedImages} />
        </Suspense>
    );
}
