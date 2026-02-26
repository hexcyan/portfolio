import PaletteBuilderPage from "@/components/PaletteBuilder/PaletteBuilderPage";
import { fetchPaints, fetchStock, fetchLayouts, fetchCuratedPalettes } from "@/lib/cdn-data";
import { getAllPaints } from "@/lib/palette-paints";

export const metadata = {
    title: "Palette Builder",
    description: "Build your custom watercolor palette — choose paints, pick a layout, and order",
};

export default async function PalettePage() {
    const [paintsResult, stockResult, layoutsResult, curatedResult] = await Promise.all([
        fetchPaints(),
        fetchStock(),
        fetchLayouts(),
        fetchCuratedPalettes(),
    ]);

    const allPaints = getAllPaints(paintsResult.data, stockResult.data);

    return (
        <PaletteBuilderPage
            allPaints={allPaints}
            layouts={layoutsResult.data}
            curatedPalettes={curatedResult.data}
        />
    );
}
