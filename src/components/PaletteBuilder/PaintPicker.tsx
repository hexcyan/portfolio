"use client";

import { useState, useMemo } from "react";
import { PalettePaint, isInStockForLayout } from "@/lib/palette-paints";
import { PaletteLayout } from "@/lib/palettes";
import styles from "./PaletteBuilder.module.css";

type BrandFilter = "all" | "holbein" | "vangogh" | "handmade";

const STOCK_SIZE_LABELS = ["5ml", "15ml", "60ml", "Mini"];

interface PaintPickerProps {
    allPaints: PalettePaint[];
    layout: PaletteLayout;
    onAddPaint: (paintId: string) => void;
    selectedPaintId?: string | null;
    onSelectPaint?: (paintId: string) => void;
}

export default function PaintPicker({ allPaints, layout, onAddPaint, selectedPaintId, onSelectPaint }: PaintPickerProps) {
    const [brand, setBrand] = useState<BrandFilter>("all");
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState(true);

    const validSizeLabels = layout.validStockSizes
        .map((i) => STOCK_SIZE_LABELS[i])
        .join("/");

    const filtered = useMemo(() => {
        return allPaints.filter((p) => {
            if (brand !== "all" && p.brand !== brand) return false;
            if (stockFilter && !isInStockForLayout(p, layout.validStockSizes)) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    p.name.toLowerCase().includes(q) ||
                    (p.code?.toLowerCase().includes(q) ?? false) ||
                    (p.pigments?.some((pig) => pig.toLowerCase().includes(q)) ?? false)
                );
            }
            return true;
        });
    }, [allPaints, brand, search, stockFilter, layout.validStockSizes]);

    const brandTabs: { key: BrandFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "holbein", label: "Holbein" },
        { key: "vangogh", label: "Van Gogh" },
        { key: "handmade", label: "Handmade" },
    ];

    function handleDragStart(e: React.DragEvent, paintId: string) {
        e.dataTransfer.setData("application/x-palette-paint", paintId);
        e.dataTransfer.effectAllowed = "copy";
    }

    return (
        <div className={styles.picker}>
            <div className={styles.pickerSticky}>
                <div className={styles.pickerHeader}>
                    <h2 className={styles.pickerTitle}>Palette Builder</h2>
                    <input
                        type="text"
                        className={styles.pickerSearch}
                        placeholder="Search by name, code, or pigment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.pickerTabs}>
                {brandTabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`${styles.pickerTab} ${brand === tab.key ? styles.pickerTabActive : ""}`}
                        onClick={() => setBrand(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
                <button
                    className={`${styles.pickerTab} ${styles.stockToggle} ${stockFilter ? styles.stockToggleActive : ""}`}
                    onClick={() => setStockFilter((v) => !v)}
                    title={
                        stockFilter
                            ? `Showing only paints in stock (${validSizeLabels}). Click to show all.`
                            : "Showing all paints. Click to filter by stock."
                    }
                >
                    {stockFilter ? `In Stock (${validSizeLabels})` : "All Stock"}
                </button>
                </div>
            </div>
            <div className={styles.pickerGrid}>
                {filtered.map((paint) => {
                    const inStock = isInStockForLayout(paint, layout.validStockSizes);
                    return (
                        <div
                            key={paint.id}
                            className={`${styles.pickerSwatch} ${selectedPaintId === paint.id ? styles.pickerSwatchSelected : ""}`}
                            draggable={!onSelectPaint}
                            onDragStart={onSelectPaint ? undefined : (e) => handleDragStart(e, paint.id)}
                            onClick={() => onSelectPaint ? onSelectPaint(paint.id) : onAddPaint(paint.id)}
                            title={`${paint.name}${paint.code ? ` (${paint.code})` : ""}${!inStock ? " — Out of stock for this palette" : ""}`}
                        >
                            <div
                                className={styles.swatchColor}
                                style={!paint.imageUrl ? { backgroundColor: paint.colorHex } : undefined}
                            >
                                {paint.imageUrl && (
                                    <img src={paint.imageUrl} alt={paint.name} className={styles.swatchImg} />
                                )}
                                {!inStock && (
                                    <span className={styles.swatchOos}>
                                        <img src="/icons/xmark-solid-full.svg" alt="Out of stock" className={styles.swatchOosIcon} />
                                    </span>
                                )}
                            </div>
                            <span className={styles.swatchName}>{paint.name}</span>
                            {paint.code && (
                                <span className={styles.swatchCode}>{paint.code}</span>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <p className={styles.pickerEmpty}>No paints match your search.</p>
                )}
            </div>
        </div>
    );
}
