"use client";

import { PalettePaint } from "@/lib/palette-paints";
import { PaletteLayout, panSizes } from "@/lib/palettes";
import PaletteSlot from "./PaletteSlot";
import styles from "./PaletteBuilder.module.css";

interface PaletteGridProps {
    layout: PaletteLayout;
    slots: (string | null)[];
    allPaints: PalettePaint[];
    showBackground: boolean;
    showLabels?: boolean;
    compact?: boolean;
    cols: number;
    rows: number;
    selectedSlot?: number | null;
    selectedPaint?: string | null;
    onSelectSlot?: (index: number) => void;
    onDropPaint: (index: number, paintId: string) => void;
    onSwapSlots: (from: number, to: number) => void;
    onClearSlot: (index: number) => void;
}

export default function PaletteGrid({
    layout,
    slots,
    allPaints,
    showBackground,
    showLabels = true,
    compact = false,
    cols,
    rows,
    selectedSlot,
    selectedPaint,
    onSelectSlot,
    onDropPaint,
    onSwapSlots,
    onClearSlot,
}: PaletteGridProps) {
    const paintMap = new Map(allPaints.map((p) => [p.id, p]));
    const blocked = new Set(layout.blockedSlots ?? []);
    const pan = panSizes[layout.panSize];

    // CSS-shorthand padding from layout (1–4 values like CSS margin/padding)
    const padArr = layout.padding ?? [0];
    const [pt, pr = pt, pb = pt, pl = pr] = padArr;

    const hasBg = !compact && showBackground && !!layout.backgroundImage;

    return (
        <div className={`${styles.gridWrapper} ${compact ? styles.gridWrapperCompact : ""}`}>
            {hasBg && (
                <img
                    src={layout.backgroundImage}
                    alt="Palette background"
                    className={styles.gridBg}
                    style={layout.imgWidth ? { width: layout.imgWidth } : undefined}
                />
            )}
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${cols}, ${pan.pxWidth}px)`,
                    gridTemplateRows: `repeat(${rows}, ${pan.pxHeight}px)`,
                    gap: compact ? "0px" : `${layout.yGap}px ${layout.xGap}px`,
                    padding: compact ? "6px" : layout.padding ? `${pt}px ${pr}px ${pb}px ${pl}px` : `18px`,
                }}
            >
                {slots.map((paintId, i) => {
                    const isSelected = selectedSlot === i;
                    // Show target highlight when: paint is selected (all slots are targets),
                    // or a slot is selected (other slots are swap targets)
                    const isTarget = onSelectSlot && !isSelected && (
                        selectedPaint != null ||
                        (selectedSlot != null && selectedSlot !== i)
                    );
                    return (
                        <PaletteSlot
                            key={i}
                            index={i}
                            paint={paintId ? paintMap.get(paintId) ?? null : null}
                            blocked={blocked.has(i)}
                            showLabels={showLabels}
                            selected={isSelected}
                            targetHighlight={!!isTarget}
                            onSelect={onSelectSlot}
                            onDrop={onDropPaint}
                            onSwap={onSwapSlots}
                            onClear={onClearSlot}
                        />
                    );
                })}
            </div>
        </div>
    );
}
