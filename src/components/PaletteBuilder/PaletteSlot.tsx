"use client";

import { PalettePaint } from "@/lib/palette-paints";
import styles from "./PaletteBuilder.module.css";

interface PaletteSlotProps {
    index: number;
    paint: PalettePaint | null;
    blocked?: boolean;
    onDrop: (index: number, paintId: string) => void;
    onSwap: (fromIndex: number, toIndex: number) => void;
    onClear: (index: number) => void;
}

export default function PaletteSlot({
    index,
    paint,
    blocked,
    onDrop,
    onSwap,
    onClear,
}: PaletteSlotProps) {
    if (blocked) {
        return <div className={`${styles.slot} ${styles.slotBlocked}`} />;
    }

    function handleDragStart(e: React.DragEvent) {
        if (!paint) return;
        e.dataTransfer.setData("application/x-palette-slot", String(index));
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const paintId = e.dataTransfer.getData("application/x-palette-paint");
        if (paintId) {
            onDrop(index, paintId);
            return;
        }
        const fromSlot = e.dataTransfer.getData("application/x-palette-slot");
        if (fromSlot !== "") {
            onSwap(Number(fromSlot), index);
        }
    }

    const isLight = paint
        ? isLightColor(paint.colorHex)
        : false;

    return (
        <div
            className={`${styles.slot} ${paint ? styles.slotFilled : styles.slotEmpty}`}
            draggable={!!paint}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => paint && onClear(index)}
            title={paint ? `${paint.name} — click to remove` : "Drop a paint here"}
        >
            {paint && (
                <>
                    {paint.imageUrl ? (
                        <img src={paint.imageUrl} alt={paint.name} className={styles.slotImg} />
                    ) : (
                        <div
                            className={styles.slotColor}
                            style={{ backgroundColor: paint.colorHex }}
                        />
                    )}
                    <span
                        className={styles.slotName}
                        style={{ color: isLight ? "#333" : "#fff" }}
                    >
                        {paint.name}
                    </span>
                    <span
                        className={styles.slotLabel}
                        style={{ color: isLight ? "#333" : "#fff" }}
                    >
                        {paint.code ?? ""}
                    </span>
                </>
            )}
        </div>
    );
}

function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
