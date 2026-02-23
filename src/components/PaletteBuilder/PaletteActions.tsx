"use client";

import { PalettePaint } from "@/lib/palette-paints";
import { PaletteLayout, generateManifest, validateStock } from "@/lib/palettes";
import styles from "./PaletteBuilder.module.css";
import { useState } from "react";

interface PaletteActionsProps {
    layout: PaletteLayout;
    slots: (string | null)[];
    allPaints: PalettePaint[];
    onClearAll: () => void;
}

export default function PaletteActions({
    layout,
    slots,
    allPaints,
    onClearAll,
}: PaletteActionsProps) {
    const [copied, setCopied] = useState(false);
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

            <div className={styles.actionsButtons}>
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
                    {copied ? "Copied!" : "Copy Manifest & Order"}
                </button>

                {!layout.etsyUrl && !isEmpty && (
                    <p className={styles.actionsNote}>
                        Custom layouts don&apos;t have a direct Etsy listing — contact me to order!
                    </p>
                )}

                <button
                    className={styles.actionsSecondary}
                    onClick={onClearAll}
                    disabled={isEmpty}
                >
                    Clear Palette
                </button>
            </div>
        </div>
    );
}
