"use client";

import { PalettePaint } from "@/lib/palette-paints";
import { PaletteLayout, generateManifest, validateStock } from "@/lib/palettes";
import styles from "./PaletteBuilder.module.css";
import { useState } from "react";
import SwatchCardModal from "./SwatchCardModal";

interface PaletteActionsProps {
    layout: PaletteLayout;
    slots: (string | null)[];
    allPaints: PalettePaint[];
    cols: number;
    rows: number;
    onClearAll: () => void;
}

export default function PaletteActions({
    layout,
    slots,
    allPaints,
    cols,
    rows,
    onClearAll,
}: PaletteActionsProps) {
    const [copied, setCopied] = useState(false);
    const [swatchCardOpen, setSwatchCardOpen] = useState(false);
    const filledSlots = slots.filter((s) => s !== null);
    const { allInStock, outOfStock } = validateStock(slots, allPaints, layout);
    const isEmpty = filledSlots.length === 0;

    async function handleOrder() {
        const manifest = generateManifest(slots, allPaints);
        try {
            await navigator.clipboard.writeText(manifest);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            prompt("Copy this manifest:", manifest);
        }
        if (layout.etsyUrl) {
            window.open(layout.etsyUrl, "_blank");
        }
    }

    return (
        <div className={styles.actions}>
            {!isEmpty && !allInStock && (
                <div className={styles.actionsWarning}>
                    <strong>Out of stock:</strong>{" "}
                    {outOfStock.map((p) => p.name).join(", ")}
                </div>
            )}

            <div className={styles.actionsRow}>
                <button
                    className={styles.actionsPrimary}
                    disabled={isEmpty || !allInStock}
                    onClick={handleOrder}
                    title={
                        isEmpty
                            ? "Add paints to your palette first"
                            : !allInStock
                                ? "Remove out-of-stock paints to order"
                                : "Copy manifest and open Etsy listing"
                    }
                >
                    {copied ? "Copied!" : "Order"}
                </button>
                <button
                    className={styles.actionsSecondary}
                    onClick={() => setSwatchCardOpen(true)}
                >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                        <path d="M4 1h8v3H4V1zm-1 4a2 2 0 00-2 2v4h3v3h8v-3h3V7a2 2 0 00-2-2H3zm2 6V9h6v5H5v-3z"/>
                    </svg>
                    Swatch Card
                </button>
                <button
                    className={styles.actionsSecondary}
                    onClick={onClearAll}
                    disabled={isEmpty}
                >
                    Clear
                </button>
            </div>

            {!layout.etsyUrl && !isEmpty && (
                <p className={styles.actionsNote}>
                    Custom layout — contact me to order!
                </p>
            )}

            {swatchCardOpen && (
                <SwatchCardModal
                    layout={layout}
                    slots={slots}
                    allPaints={allPaints}
                    cols={cols}
                    rows={rows}
                    onClose={() => setSwatchCardOpen(false)}
                />
            )}
        </div>
    );
}
