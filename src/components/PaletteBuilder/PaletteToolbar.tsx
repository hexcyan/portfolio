"use client";

import { PaletteLayout, CuratedPalette, PanSizeId, PanSize, panSizes } from "@/lib/palettes";
import styles from "./PaletteBuilder.module.css";

interface PaletteToolbarProps {
    currentLayout: PaletteLayout;
    layouts: PaletteLayout[];
    curatedPalettes: CuratedPalette[];
    showBackground: boolean;
    showLabels: boolean;
    compact: boolean;
    customCols: number;
    customRows: number;
    onChangeLayout: (layoutId: string) => void;
    onLoadTemplate: (template: CuratedPalette) => void;
    onToggleBackground: () => void;
    onToggleLabels: () => void;
    onToggleCompact: () => void;
    onChangeCustomCols: (v: number) => void;
    onChangeCustomRows: (v: number) => void;
    customPanSize?: PanSizeId;
    onChangeCustomPanSize?: (v: PanSizeId) => void;
    canUndo?: boolean;
    onUndo?: () => void;
}

export default function PaletteToolbar({
    currentLayout,
    layouts: paletteLayouts,
    curatedPalettes,
    showBackground,
    showLabels,
    compact,
    customCols,
    customRows,
    onChangeLayout,
    onLoadTemplate,
    onToggleBackground,
    onToggleLabels,
    onToggleCompact,
    onChangeCustomCols,
    onChangeCustomRows,
    customPanSize,
    onChangeCustomPanSize,
    canUndo,
    onUndo,
}: PaletteToolbarProps) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarRow}>
                <select
                    className={styles.toolbarSelect}
                    value={currentLayout.id}
                    onChange={(e) => onChangeLayout(e.target.value)}
                >
                    {paletteLayouts.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>
                <select
                    className={styles.toolbarSelect}
                    defaultValue=""
                    onChange={(e) => {
                        const t = curatedPalettes.find((c) => c.id === e.target.value);
                        if (t) onLoadTemplate(t);
                        e.target.value = "";
                    }}
                >
                    <option value="" disabled>
                        Template...
                    </option>
                    {curatedPalettes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <div className={styles.toolbarToggles}>
                    <button
                        className={`${styles.toolbarPill} ${showLabels ? styles.toolbarPillActive : ""}`}
                        onClick={onToggleLabels}
                        title="Toggle slot labels"
                    >
                        Labels
                    </button>
                    {currentLayout.backgroundImage && (
                        <button
                            className={`${styles.toolbarPill} ${showBackground ? styles.toolbarPillActive : ""}`}
                            onClick={onToggleBackground}
                            title="Toggle background image"
                        >
                            BG
                        </button>
                    )}
                    <button
                        className={`${styles.toolbarPill} ${compact ? styles.toolbarPillActive : ""}`}
                        onClick={onToggleCompact}
                        title="Remove background, padding and gaps"
                    >
                        Compact
                    </button>
                </div>
            </div>

            {currentLayout.id === "custom" && (
                <div className={styles.toolbarRow}>
                    <label className={styles.toolbarLabel}>
                        Cols
                        <input
                            type="number"
                            className={styles.toolbarInput}
                            min={1}
                            max={12}
                            value={customCols}
                            onChange={(e) => onChangeCustomCols(Number(e.target.value))}
                        />
                    </label>
                    <label className={styles.toolbarLabel}>
                        Rows
                        <input
                            type="number"
                            className={styles.toolbarInput}
                            min={1}
                            max={12}
                            value={customRows}
                            onChange={(e) => onChangeCustomRows(Number(e.target.value))}
                        />
                    </label>
                    <select
                        className={styles.toolbarSelect}
                        value={customPanSize ?? "half"}
                        onChange={(e) => onChangeCustomPanSize?.(e.target.value as PanSizeId)}
                    >
                        {(Object.values(panSizes) as PanSize[]).map((ps) => (
                            <option key={ps.id} value={ps.id}>
                                {ps.label}
                            </option>
                        ))}
                    </select>
                    {canUndo && (
                        <button
                            className={styles.toolbarPill}
                            onClick={onUndo}
                            title="Undo last dimension change"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                            Undo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
