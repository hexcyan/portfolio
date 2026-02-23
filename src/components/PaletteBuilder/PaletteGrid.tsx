"use client";

import { PalettePaint } from "@/lib/palette-paints";
import { PaletteLayout } from "@/lib/palettes";
import PaletteSlot from "./PaletteSlot";
import styles from "./PaletteBuilder.module.css";

interface PaletteGridProps {
    layout: PaletteLayout;
    slots: (string | null)[];
    allPaints: PalettePaint[];
    showBackground: boolean;
    cols: number;
    rows: number;
    onDropPaint: (index: number, paintId: string) => void;
    onSwapSlots: (from: number, to: number) => void;
    onClearSlot: (index: number) => void;
}

export default function PaletteGrid({
    layout,
    slots,
    allPaints,
    showBackground,
    cols,
    rows,
    onDropPaint,
    onSwapSlots,
    onClearSlot,
}: PaletteGridProps) {
    const paintMap = new Map(allPaints.map((p) => [p.id, p]));
    const blocked = new Set(layout.blockedSlots ?? []);

    return (
        <div className={styles.gridWrapper}>
            {showBackground && layout.backgroundImage && (
                <img
                    src={layout.backgroundImage}
                    alt="Palette background"
                    className={styles.gridBg}
                />
            )}
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${cols}, ${layout.panWidth}px)`,
                    gridTemplateRows: `repeat(${rows}, ${layout.panHeight}px)`,
                    gap: `${layout.yGap}px ${layout.xGap}px`,
                }}
            >
                {slots.map((paintId, i) => (
                    <PaletteSlot
                        key={i}
                        index={i}
                        paint={paintId ? paintMap.get(paintId) ?? null : null}
                        blocked={blocked.has(i)}
                        onDrop={onDropPaint}
                        onSwap={onSwapSlots}
                        onClear={onClearSlot}
                    />
                ))}
            </div>
        </div>
    );
}
