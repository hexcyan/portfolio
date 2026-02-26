"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getAllPaints } from "@/lib/palette-paints";
import {
    PaletteState,
    CuratedPalette,
    PanSizeId,
    paletteLayouts,
    panSizes,
    getLayout,
    getDefaultState,
    savePaletteState,
    loadPaletteState,
} from "@/lib/palettes";
import PaintPicker from "./PaintPicker";
import PaletteGrid from "./PaletteGrid";
import PaletteToolbar from "./PaletteToolbar";
import PaletteActions from "./PaletteActions";
import styles from "./PaletteBuilder.module.css";

export default function PaletteBuilderPage() {
    const allPaints = useMemo(() => getAllPaints(), []);

    const [state, setState] = useState<PaletteState>(() => {
        if (typeof window === "undefined") return getDefaultState();
        return loadPaletteState() ?? getDefaultState();
    });

    // Persist on every change
    useEffect(() => {
        savePaletteState(state);
    }, [state]);

    const baseLayout = getLayout(state.layoutId) ?? paletteLayouts[0];
    const layout = state.layoutId === "custom" && state.customPanSize
        ? { ...baseLayout, panSize: state.customPanSize }
        : baseLayout;
    const cols = state.layoutId === "custom" ? (state.customCols ?? layout.cols) : layout.cols;
    const rows = state.layoutId === "custom" ? (state.customRows ?? layout.rows) : layout.rows;

    // ─── Palette actions ────────────────────────────────────
    const dropPaint = useCallback((index: number, paintId: string) => {
        setState((s) => {
            const slots = [...s.slots];
            slots[index] = paintId;
            return { ...s, slots };
        });
    }, []);

    const swapSlots = useCallback((from: number, to: number) => {
        setState((s) => {
            const slots = [...s.slots];
            [slots[from], slots[to]] = [slots[to], slots[from]];
            return { ...s, slots };
        });
    }, []);

    const clearSlot = useCallback((index: number) => {
        setState((s) => {
            const slots = [...s.slots];
            slots[index] = null;
            return { ...s, slots };
        });
    }, []);

    const addToNextEmpty = useCallback((paintId: string) => {
        setState((s) => {
            const blocked = new Set(
                paletteLayouts.find((l) => l.id === s.layoutId)?.blockedSlots ?? []
            );
            const idx = s.slots.findIndex((slot, i) => slot === null && !blocked.has(i));
            if (idx === -1) return s;
            const slots = [...s.slots];
            slots[idx] = paintId;
            return { ...s, slots };
        });
    }, []);

    const clearAll = useCallback(() => {
        setState((s) => ({ ...s, slots: s.slots.map(() => null) }));
    }, []);

    // ─── Undo history (dimension changes only) ────────────────
    type SlotSnapshot = { slots: (string | null)[]; customCols: number; customRows: number };
    const undoStack = useRef<SlotSnapshot[]>([]);
    const [canUndo, setCanUndo] = useState(false);

    function pushUndo(s: PaletteState) {
        undoStack.current.push({
            slots: [...s.slots],
            customCols: s.customCols ?? 4,
            customRows: s.customRows ?? 4,
        });
        if (undoStack.current.length > 20) undoStack.current.shift();
        setCanUndo(true);
    }

    const undo = useCallback(() => {
        const snap = undoStack.current.pop();
        if (!snap) return;
        setCanUndo(undoStack.current.length > 0);
        setState((s) => ({
            ...s,
            customCols: snap.customCols,
            customRows: snap.customRows,
            slots: snap.slots,
        }));
    }, []);

    // ─── Layout changes ─────────────────────────────────────
    function changeLayout(layoutId: string) {
        const newLayout = getLayout(layoutId);
        if (!newLayout) return;
        const newCols = layoutId === "custom" ? (state.customCols ?? newLayout.cols) : newLayout.cols;
        const newRows = layoutId === "custom" ? (state.customRows ?? newLayout.rows) : newLayout.rows;
        const count = newCols * newRows;
        setState((s) => ({
            ...s,
            layoutId,
            slots: Array(count).fill(null),
            showBackground: !!newLayout.backgroundImage,
        }));
        // Clear undo when switching layouts
        undoStack.current = [];
        setCanUndo(false);
    }

    function loadTemplate(template: CuratedPalette) {
        const tLayout = getLayout(template.layoutId);
        if (!tLayout) return;
        setState((s) => ({
            ...s,
            layoutId: template.layoutId,
            slots: [...template.paints],
            showBackground: !!tLayout.backgroundImage,
        }));
    }

    function changeCustomPanSize(panSize: PanSizeId) {
        setState((s) => ({ ...s, customPanSize: panSize }));
    }

    function changeCustomDimension(key: "customCols" | "customRows", value: number) {
        const v = Math.max(1, Math.min(12, value));
        setState((s) => {
            const oldCols = s.customCols ?? 4;
            const oldRows = s.customRows ?? 4;
            const newCols = key === "customCols" ? v : oldCols;
            const newRows = key === "customRows" ? v : oldRows;
            if (newCols === oldCols && newRows === oldRows) return s;

            // Snapshot before reshape
            pushUndo(s);

            // Reshape: preserve paints that fit within the new grid bounds
            const newSlots: (string | null)[] = Array(newCols * newRows).fill(null);
            const minCols = Math.min(oldCols, newCols);
            const minRows = Math.min(oldRows, newRows);
            for (let r = 0; r < minRows; r++) {
                for (let c = 0; c < minCols; c++) {
                    newSlots[r * newCols + c] = s.slots[r * oldCols + c];
                }
            }

            return {
                ...s,
                [key]: v,
                slots: newSlots,
            };
        });
    }

    // ─── Labels toggle ────────────────────────────────────────
    const [showLabels, setShowLabels] = useState(true);
    const toggleLabels = useCallback(() => setShowLabels((v) => !v), []);

    // ─── Compact toggle ────────────────────────────────────────
    const [compact, setCompact] = useState(false);
    const toggleCompact = useCallback(() => setCompact((v) => !v), []);

    // ─── Mobile drawer ────────────────────────────────────────
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    // ─── Clamp position to viewport ─────────────────────────
    const widgetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function clampPosition() {
            const el = widgetRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const maxX = window.innerWidth - Math.min(rect.width, 100);
            const maxY = window.innerHeight - 40; // keep title bar visible
            setState((s) => {
                const cx = Math.max(0, Math.min(s.position.x, maxX));
                const cy = Math.max(0, Math.min(s.position.y, maxY));
                if (cx === s.position.x && cy === s.position.y) return s;
                return { ...s, position: { x: cx, y: cy } };
            });
        }
        clampPosition();
        window.addEventListener("resize", clampPosition);
        return () => window.removeEventListener("resize", clampPosition);
    }, []);

    // ─── Draggable widget ───────────────────────────────────
    const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
    const handlersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);

    function onTitleMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: state.position.x,
            origY: state.position.y,
        };

        const onMove = (ev: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag) return;
            const x = drag.origX + (ev.clientX - drag.startX);
            const y = drag.origY + (ev.clientY - drag.startY);
            setState((s) => ({ ...s, position: { x, y } }));
        };

        const onUp = () => {
            dragRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            handlersRef.current = null;
        };

        handlersRef.current = { move: onMove, up: onUp };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }

    // Clean up drag listeners on unmount
    useEffect(() => {
        return () => {
            if (handlersRef.current) {
                document.removeEventListener("mousemove", handlersRef.current.move);
                document.removeEventListener("mouseup", handlersRef.current.up);
            }
        };
    }, []);

    return (
        <div className={styles.page}>
            {/* ── Desktop: full-page paint picker ── */}
            <div className={styles.desktopPicker}>
                <PaintPicker allPaints={allPaints} layout={layout} onAddPaint={addToNextEmpty} />
            </div>

            {/* ── Desktop: floating palette widget ── */}
            <div
                ref={widgetRef}
                className={`${styles.widget} ${state.minimized ? styles.widgetMinimized : ""}`}
                style={{
                    left: state.position.x,
                    top: state.position.y,
                }}
            >
                <div
                    className={styles.widgetTitleBar}
                    onMouseDown={onTitleMouseDown}
                >
                    <span className={styles.widgetTitle}>
                        Palette Preview
                    </span>
                    <div className={styles.widgetControls}>
                        <button
                            className={styles.widgetBtn}
                            onClick={() => setState((s) => ({ ...s, minimized: !s.minimized }))}
                            title={state.minimized ? "Expand" : "Minimize"}
                        >
                            {state.minimized ? "+" : "−"}
                        </button>
                    </div>
                </div>

                {!state.minimized && (
                    <div className={styles.widgetBody}>
                        <PaletteToolbar
                            currentLayout={layout}
                            showBackground={state.showBackground}
                            showLabels={showLabels}
                            compact={compact}
                            customCols={state.customCols ?? 4}
                            customRows={state.customRows ?? 4}
                            onChangeLayout={changeLayout}
                            onLoadTemplate={loadTemplate}
                            onToggleBackground={() => setState((s) => ({ ...s, showBackground: !s.showBackground }))}
                            onToggleLabels={toggleLabels}
                            onToggleCompact={toggleCompact}
                            onChangeCustomCols={(v) => changeCustomDimension("customCols", v)}
                            onChangeCustomRows={(v) => changeCustomDimension("customRows", v)}
                            customPanSize={state.customPanSize}
                            onChangeCustomPanSize={changeCustomPanSize}
                            canUndo={canUndo}
                            onUndo={undo}
                        />
                        <PaletteGrid
                            layout={layout}
                            slots={state.slots}
                            allPaints={allPaints}
                            showBackground={state.showBackground}
                            showLabels={showLabels}
                            compact={compact}
                            cols={cols}
                            rows={rows}
                            onDropPaint={dropPaint}
                            onSwapSlots={swapSlots}
                            onClearSlot={clearSlot}
                        />
                        <PaletteActions
                            layout={layout}
                            slots={state.slots}
                            allPaints={allPaints}
                            cols={cols}
                            rows={rows}
                            onClearAll={clearAll}
                        />
                    </div>
                )}
            </div>

            {/* ── Mobile: inline palette (main view) ── */}
            <div className={styles.mobilePalette}>
                <h1 className={styles.mobilePaletteTitle}>{layout.name} Palette</h1>
                <PaletteToolbar
                    currentLayout={layout}
                    showBackground={state.showBackground}
                    showLabels={showLabels}
                    compact={compact}
                    customCols={state.customCols ?? 4}
                    customRows={state.customRows ?? 4}
                    onChangeLayout={changeLayout}
                    onLoadTemplate={loadTemplate}
                    onToggleBackground={() => setState((s) => ({ ...s, showBackground: !s.showBackground }))}
                    onToggleLabels={toggleLabels}
                    onToggleCompact={toggleCompact}
                    onChangeCustomCols={(v) => changeCustomDimension("customCols", v)}
                    onChangeCustomRows={(v) => changeCustomDimension("customRows", v)}
                    canUndo={canUndo}
                    onUndo={undo}
                />
                <PaletteGrid
                    layout={layout}
                    slots={state.slots}
                    allPaints={allPaints}
                    showBackground={state.showBackground}
                    showLabels={showLabels}
                    compact={compact}
                    cols={cols}
                    rows={rows}
                    onDropPaint={dropPaint}
                    onSwapSlots={swapSlots}
                    onClearSlot={clearSlot}
                />
                <PaletteActions
                    layout={layout}
                    slots={state.slots}
                    allPaints={allPaints}
                    cols={cols}
                    rows={rows}
                    onClearAll={clearAll}
                />
            </div>

            {/* ── Mobile: drawer overlay ── */}
            <div
                className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayOpen : ""}`}
                onClick={closeDrawer}
            />

            {/* ── Mobile: paint picker drawer ── */}
            <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}>
                <div className={styles.drawerInner}>
                    <PaintPicker allPaints={allPaints} layout={layout} onAddPaint={addToNextEmpty} />
                </div>
            </div>

            {/* ── Mobile: drawer tab handle ── */}
            <button
                className={`${styles.drawerTab} ${drawerOpen ? styles.drawerTabOpen : ""}`}
                onClick={toggleDrawer}
                aria-label={drawerOpen ? "Close paint picker" : "Open paint picker"}
            >
                <span className={styles.drawerTabLabel}>🎨 Paints</span>
            </button>
        </div>
    );
}
