"use client";

import { PaletteLayout, CuratedPalette, paletteLayouts, curatedPalettes } from "@/lib/palettes";
import styles from "./PaletteBuilder.module.css";

interface PaletteToolbarProps {
    currentLayout: PaletteLayout;
    showBackground: boolean;
    customCols: number;
    customRows: number;
    onChangeLayout: (layoutId: string) => void;
    onLoadTemplate: (template: CuratedPalette) => void;
    onToggleBackground: () => void;
    onChangeCustomCols: (v: number) => void;
    onChangeCustomRows: (v: number) => void;
}

export default function PaletteToolbar({
    currentLayout,
    showBackground,
    customCols,
    customRows,
    onChangeLayout,
    onLoadTemplate,
    onToggleBackground,
    onChangeCustomCols,
    onChangeCustomRows,
}: PaletteToolbarProps) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarRow}>
                <label className={styles.toolbarLabel}>
                    Layout
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
                </label>
                <label className={styles.toolbarLabel}>
                    Template
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
                            Load a template...
                        </option>
                        {curatedPalettes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </label>
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
                </div>
            )}

            {currentLayout.backgroundImage && (
                <div className={styles.toolbarRow}>
                    <label className={styles.toolbarLabel}>
                        <input
                            type="checkbox"
                            checked={showBackground}
                            onChange={onToggleBackground}
                        />
                        Show background
                    </label>
                </div>
            )}
        </div>
    );
}
