"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PalettePaint } from "@/lib/palette-paints";
import { PaletteLayout, panSizes } from "@/lib/palettes";
import styles from "./PaletteBuilder.module.css";

interface SwatchCardModalProps {
    layout: PaletteLayout;
    slots: (string | null)[];
    allPaints: PalettePaint[];
    cols: number;
    rows: number;
    onClose: () => void;
}

const MM_TO_PX = 300 / 25.4; // ~11.81 canvas px per mm at 300 DPI
const GAP_PX = 2;
const PAD_PX = 2;

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2];

function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function SwatchCardModal({
    layout,
    slots,
    allPaints,
    cols,
    rows,
    onClose,
}: SwatchCardModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [showLabels, setShowLabels] = useState(true);
    const [lockAspect, setLockAspect] = useState(true);
    const [printRotate, setPrintRotate] = useState(false);
    const [zoom, setZoom] = useState<number | "fit">("fit");
    const [fitScale, setFitScale] = useState(1);
    const [cornerRadius, setCornerRadius] = useState(0);
    const [borderColor, setBorderColor] = useState("#dddddd");
    const [nameColor, setNameColor] = useState("#222222");
    const [codeColor, setCodeColor] = useState("#666666");
    const [textSize, setTextSize] = useState(100);  // percentage, 100 = default
    const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom" | "outside-top" | "outside-bottom">("center");
    const paintMap = useRef(new Map(allPaints.map((p) => [p.id, p]))).current;
    const blockedSet = useRef(new Set(layout.blockedSlots ?? [])).current;

    const pan = panSizes[layout.panSize];

    // Real physical dimensions in mm
    const realWidthMm = cols * pan.mmWidth + (cols - 1) * (GAP_PX / MM_TO_PX) + 2 * (PAD_PX / MM_TO_PX);
    const realHeightMm = rows * pan.mmHeight + (rows - 1) * (GAP_PX / MM_TO_PX) + 2 * (PAD_PX / MM_TO_PX);
    const aspectRatio = realWidthMm / realHeightMm;

    const [widthMm, setWidthMm] = useState(Math.round(realWidthMm));
    const [heightMm, setHeightMm] = useState(Math.round(realHeightMm));

    function handleWidthChange(v: number) {
        const w = Math.max(10, v);
        setWidthMm(w);
        if (lockAspect) {
            setHeightMm(Math.max(10, Math.round(w / aspectRatio)));
        }
    }

    function handleHeightChange(v: number) {
        const h = Math.max(10, v);
        setHeightMm(h);
        if (lockAspect) {
            setWidthMm(Math.max(10, Math.round(h * aspectRatio)));
        }
    }

    // Full-resolution canvas dimensions (for print/download)
    const canvasW = Math.round(widthMm * MM_TO_PX);
    const canvasH = Math.round(heightMm * MM_TO_PX);

    // Outside text mode: reserve space for labels below/above each cell
    const isOutside = textPosition === "outside-top" || textPosition === "outside-bottom";

    // Pan pixel size within the full-res canvas
    const availW = canvasW - PAD_PX * 2 - (cols - 1) * GAP_PX;
    const availH = canvasH - PAD_PX * 2 - (rows - 1) * GAP_PX;
    // When outside, estimate label height as fraction of row height, then subtract
    const rawRowH = Math.max(1, Math.floor(availH / rows));
    const labelH = (isOutside && showLabels)
        ? Math.max(16, Math.round(rawRowH * 0.28 * (textSize / 100)))
        : 0;
    const panW = Math.max(1, Math.floor(availW / cols));
    const panH = Math.max(1, rawRowH - labelH);

    // Compute fit scale when container or canvas size changes
    const updateFitScale = useCallback(() => {
        const wrap = wrapRef.current;
        if (!wrap || canvasW === 0 || canvasH === 0) return;
        const rect = wrap.getBoundingClientRect();
        const scale = Math.min(rect.width / canvasW, rect.height / canvasH, 1);
        setFitScale(scale);
    }, [canvasW, canvasH]);

    useEffect(() => {
        updateFitScale();
        window.addEventListener("resize", updateFitScale);
        return () => window.removeEventListener("resize", updateFitScale);
    }, [updateFitScale]);

    const effectiveZoom = zoom === "fit" ? fitScale : zoom;
    const displayW = Math.round(canvasW * effectiveZoom);
    const displayH = Math.round(canvasH * effectiveZoom);

    // Zoom controls
    function zoomIn() {
        const current = zoom === "fit" ? fitScale : zoom;
        const next = ZOOM_STEPS.find((s) => s > current + 0.01);
        if (next) setZoom(next);
    }

    function zoomOut() {
        const current = zoom === "fit" ? fitScale : zoom;
        const next = [...ZOOM_STEPS].reverse().find((s) => s < current - 0.01);
        if (next) setZoom(next);
    }

    function zoomLabel(): string {
        if (zoom === "fit") return "Fit";
        return `${Math.round(zoom * 100)}%`;
    }

    // ─── Canvas drawing ──────────────────────────────────────
    const drawCard = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvasW;
        canvas.height = canvasH;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);

        const gridW = cols * panW + (cols - 1) * GAP_PX;
        const gridH = rows * (panH + labelH) + (rows - 1) * GAP_PX;
        const offsetX = Math.round((canvasW - gridW) / 2);
        const offsetY = Math.round((canvasH - gridH) / 2);

        // Corner radius scaled to canvas pixels (user value is in % of smaller pan dim)
        const r = cornerRadius > 0 ? Math.round(Math.min(panW, panH) * (cornerRadius / 100)) : 0;

        const rowStride = panH + labelH + GAP_PX;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const idx = row * cols + col;
                const x = offsetX + col * (panW + GAP_PX);
                // When outside-top, label comes first then cell; otherwise cell first
                const rowY = offsetY + row * rowStride;
                const y = textPosition === "outside-top" ? rowY + labelH : rowY;

                // Per-corner radii: [topLeft, topRight, bottomRight, bottomLeft]
                // Outside text occupies the outer edge, so suppress rounding on that side
                const isTopEdge = row === 0 && textPosition !== "outside-top";
                const isBottomEdge = row === rows - 1 && textPosition !== "outside-bottom";
                const tl = (isTopEdge && col === 0) ? r : 0;
                const tr = (isTopEdge && col === cols - 1) ? r : 0;
                const br = (isBottomEdge && col === cols - 1) ? r : 0;
                const bl = (isBottomEdge && col === 0) ? r : 0;

                if (blockedSet.has(idx)) {
                    ctx.fillStyle = "#e8e8e8";
                    if (r > 0 && (tl || tr || br || bl)) {
                        ctx.beginPath();
                        ctx.roundRect(x, y, panW, panH, [tl, tr, br, bl]);
                        ctx.fill();
                    } else {
                        ctx.fillRect(x, y, panW, panH);
                    }
                    continue;
                }

                const paintId = slots[idx];
                const paint = paintId ? paintMap.get(paintId) : null;

                if (paint) {
                    // White background — users swatch their own paints on the printed card
                    ctx.fillStyle = "#ffffff";
                    if (r > 0 && (tl || tr || br || bl)) {
                        ctx.beginPath();
                        ctx.roundRect(x, y, panW, panH, [tl, tr, br, bl]);
                        ctx.fill();
                    } else {
                        ctx.fillRect(x, y, panW, panH);
                    }

                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 1;
                    if (r > 0 && (tl || tr || br || bl)) {
                        ctx.beginPath();
                        ctx.roundRect(x, y, panW, panH, [tl, tr, br, bl]);
                        ctx.stroke();
                    } else {
                        ctx.strokeRect(x, y, panW, panH);
                    }

                    if (showLabels) {
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";

                        const scale = textSize / 100;
                        const refH = isOutside ? labelH : panH;
                        const nameFontSize = Math.max(8, Math.round(
                            (isOutside ? labelH * 0.36 : panH * 0.14) * scale
                        ));
                        ctx.font = `600 ${nameFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
                        ctx.fillStyle = nameColor;

                        // Only add text shadow when inside the cell
                        if (!isOutside) {
                            ctx.shadowColor = "rgba(255,255,255,0.6)";
                            ctx.shadowBlur = 3;
                        }

                        const centerX = x + panW / 2;
                        const maxTextW = panW - 12;
                        const lineHeight = nameFontSize * 1.2;

                        // Word-wrap the paint name
                        const words = paint.name.split(/\s+/);
                        const nameLines: string[] = [];
                        let currentLine = words[0];
                        for (let w = 1; w < words.length; w++) {
                            const test = currentLine + " " + words[w];
                            if (ctx.measureText(test).width <= maxTextW) {
                                currentLine = test;
                            } else {
                                nameLines.push(currentLine);
                                currentLine = words[w];
                            }
                        }
                        nameLines.push(currentLine);

                        // Total block height: name lines + optional code line
                        const codeFontSize = paint.code ? Math.max(6, Math.round(
                            (isOutside ? labelH * 0.28 : panH * 0.11) * scale
                        )) : 0;
                        const codeLineHeight = codeFontSize * 1.2;
                        const totalH = nameLines.length * lineHeight
                            + (paint.code ? codeLineHeight * 0.8 : 0);

                        let startY: number;
                        if (isOutside) {
                            // Draw text in the label area outside the cell
                            const labelTop = textPosition === "outside-top"
                                ? y - labelH   // label area is above cell
                                : y + panH;    // label area is below cell
                            // Center text block vertically within labelH
                            startY = labelTop + labelH / 2 - totalH / 2 + lineHeight / 2;
                        } else {
                            // Inside cell positioning
                            const pad = Math.round(panH * 0.08);
                            if (textPosition === "top") {
                                startY = y + pad + lineHeight / 2;
                            } else if (textPosition === "bottom") {
                                startY = y + panH - pad - totalH + lineHeight / 2;
                            } else {
                                startY = y + panH / 2 - totalH / 2 + lineHeight / 2;
                            }
                        }

                        for (let li = 0; li < nameLines.length; li++) {
                            ctx.fillText(nameLines[li], centerX, startY + li * lineHeight);
                        }

                        if (paint.code) {
                            ctx.font = `500 ${codeFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
                            ctx.fillStyle = codeColor;
                            ctx.fillText(
                                paint.code,
                                centerX,
                                startY + nameLines.length * lineHeight + codeLineHeight * 0.1,
                            );
                        }

                        ctx.shadowBlur = 0;
                    }
                } else {
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 2;
                    if (r > 0 && (tl || tr || br || bl)) {
                        ctx.beginPath();
                        ctx.roundRect(x, y, panW, panH, [tl, tr, br, bl]);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.roundRect(x + 1, y + 1, panW - 2, panH - 2, [
                            Math.max(0, tl - 1), Math.max(0, tr - 1),
                            Math.max(0, br - 1), Math.max(0, bl - 1),
                        ]);
                        ctx.stroke();
                    } else {
                        ctx.fillRect(x, y, panW, panH);
                        ctx.strokeRect(x + 1, y + 1, panW - 2, panH - 2);
                    }
                    ctx.setLineDash([]);
                }
            }
        }
    }, [canvasW, canvasH, cols, rows, slots, showLabels, cornerRadius, borderColor, nameColor, codeColor, textSize, textPosition, panW, panH, labelH, isOutside, blockedSet, paintMap]);

    useEffect(() => {
        drawCard();
    }, [drawCard]);

    // ─── Download / Print ────────────────────────────────────
    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${layout.name.replace(/[^a-zA-Z0-9-_]/g, "_")}_swatch_card.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    }

    function handlePrint() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let dataUrl: string;
        let printW = widthMm;
        let printH = heightMm;

        if (printRotate) {
            const rotated = document.createElement("canvas");
            rotated.width = canvas.height;
            rotated.height = canvas.width;
            const rCtx = rotated.getContext("2d");
            if (!rCtx) return;
            rCtx.translate(rotated.width, 0);
            rCtx.rotate(Math.PI / 2);
            rCtx.drawImage(canvas, 0, 0);
            dataUrl = rotated.toDataURL("image/png");
            printW = heightMm;
            printH = widthMm;
        } else {
            dataUrl = canvas.toDataURL("image/png");
        }

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.left = "-9999px";
        iframe.style.top = "-9999px";
        iframe.style.width = "0";
        iframe.style.height = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Swatch Card</title>
            <style>
                body { margin: 0; display: flex; align-items: flex-start; }
                img { width: ${printW}mm; height: ${printH}mm; }
                @media print { body { margin: 20px; } }
            </style></head>
            <body><img src="${dataUrl}" /></body>
            </html>
        `);
        doc.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                setTimeout(() => document.body.removeChild(iframe), 1000);
            }, 250);
        };
    }

    // Close on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className={styles.swatchCardOverlay} onClick={onClose}>
            <div
                className={styles.swatchCardModal}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header: title + close ── */}
                <div className={styles.scHeader}>
                    <span className={styles.scTitle}>Swatch Card</span>
                    <span className={styles.scSubtitle}>
                        {widthMm} &times; {heightMm} mm
                    </span>
                    <button
                        className={styles.scClose}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* ── Edit bar ── */}
                <div className={styles.scEditBar}>
                    <button
                        className={`${styles.scPill} ${showLabels ? styles.scPillActive : ""}`}
                        onClick={() => setShowLabels(!showLabels)}
                        title="Toggle paint labels"
                    >
                        Labels
                    </button>

                    <div className={styles.scDivider} />

                    <label className={styles.scColorField} title="Border color">
                        <span className={styles.scDimKey}>Line</span>
                        <input
                            type="color"
                            className={styles.scColorInput}
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                        />
                    </label>
                    <label className={styles.scColorField} title="Name text color">
                        <span className={styles.scDimKey}>Name</span>
                        <input
                            type="color"
                            className={styles.scColorInput}
                            value={nameColor}
                            onChange={(e) => setNameColor(e.target.value)}
                        />
                    </label>
                    <label className={styles.scColorField} title="Code text color">
                        <span className={styles.scDimKey}>Code</span>
                        <input
                            type="color"
                            className={styles.scColorInput}
                            value={codeColor}
                            onChange={(e) => setCodeColor(e.target.value)}
                        />
                    </label>

                    <div className={styles.scDivider} />

                    <label className={styles.scRadiusField}>
                        <span className={styles.scDimKey}>Size</span>
                        <input
                            type="range"
                            className={styles.scRadiusSlider}
                            min={50}
                            max={200}
                            value={textSize}
                            onChange={(e) => setTextSize(Number(e.target.value))}
                        />
                        <span className={styles.scRadiusValue}>{textSize}%</span>
                    </label>

                    <div className={styles.scPositionGroup}>
                        {(["outside-top", "top", "center", "bottom", "outside-bottom"] as const).map((pos) => (
                            <button
                                key={pos}
                                className={`${styles.scPositionBtn} ${textPosition === pos ? styles.scPositionBtnActive : ""}`}
                                onClick={() => setTextPosition(pos)}
                                title={
                                    pos === "outside-top" ? "Text above cell"
                                    : pos === "outside-bottom" ? "Text below cell"
                                    : `Align text ${pos}`
                                }
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                    {pos === "outside-top" && (
                                        <>
                                            {/* text lines above */}
                                            <rect x="3" y="0.5" width="8" height="1.5" rx="0.5" />
                                            <rect x="4.5" y="3" width="5" height="1" rx="0.5" opacity="0.5" />
                                            {/* box below */}
                                            <rect x="2" y="5.5" width="10" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                        </>
                                    )}
                                    {pos === "top" && (
                                        <>
                                            <rect x="2" y="0.5" width="10" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                            <rect x="4" y="3" width="6" height="1.5" rx="0.5" />
                                            <rect x="5" y="5.5" width="4" height="1" rx="0.5" opacity="0.5" />
                                        </>
                                    )}
                                    {pos === "center" && (
                                        <>
                                            <rect x="2" y="0.5" width="10" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                            <rect x="4" y="5" width="6" height="1.5" rx="0.5" />
                                            <rect x="5" y="7.5" width="4" height="1" rx="0.5" opacity="0.5" />
                                        </>
                                    )}
                                    {pos === "bottom" && (
                                        <>
                                            <rect x="2" y="0.5" width="10" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                            <rect x="4" y="9" width="6" height="1.5" rx="0.5" />
                                            <rect x="5" y="11" width="4" height="1" rx="0.5" opacity="0.5" />
                                        </>
                                    )}
                                    {pos === "outside-bottom" && (
                                        <>
                                            {/* box above */}
                                            <rect x="2" y="0.5" width="10" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                            {/* text lines below */}
                                            <rect x="3" y="10" width="8" height="1.5" rx="0.5" />
                                            <rect x="4.5" y="12.5" width="5" height="1" rx="0.5" opacity="0.5" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        ))}
                    </div>

                    <div className={styles.scDivider} />

                    <label className={styles.scRadiusField}>
                        <span className={styles.scDimKey}>Radius</span>
                        <input
                            type="range"
                            className={styles.scRadiusSlider}
                            min={0}
                            max={50}
                            value={cornerRadius}
                            onChange={(e) => setCornerRadius(Number(e.target.value))}
                        />
                        <span className={styles.scRadiusValue}>{cornerRadius}%</span>
                    </label>

                    <div className={styles.scDivider} />

                    <div className={styles.scDimRow}>
                        <label className={styles.scDimField}>
                            <span className={styles.scDimKey}>W</span>
                            <input
                                type="number"
                                className={styles.swatchCardDimInput}
                                value={widthMm}
                                min={10}
                                max={1000}
                                onChange={(e) => handleWidthChange(Number(e.target.value))}
                            />
                        </label>
                        <button
                            className={`${styles.scLinkIcon} ${lockAspect ? styles.scLinkIconActive : ""}`}
                            onClick={() => setLockAspect(!lockAspect)}
                            title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                        >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                {lockAspect ? (
                                    <path d="M8 1a4 4 0 00-4 4v3h8V5a4 4 0 00-4-4zM3 8v6a2 2 0 002 2h6a2 2 0 002-2V8H3z" />
                                ) : (
                                    <path d="M12 5V4a4 4 0 00-8 0v3h1V4a3 3 0 016 0v1h1zM3 8v6a2 2 0 002 2h6a2 2 0 002-2V8H3z" />
                                )}
                            </svg>
                        </button>
                        <label className={styles.scDimField}>
                            <span className={styles.scDimKey}>H</span>
                            <input
                                type="number"
                                className={styles.swatchCardDimInput}
                                value={heightMm}
                                min={10}
                                max={1000}
                                onChange={(e) => handleHeightChange(Number(e.target.value))}
                            />
                        </label>
                        <span className={styles.scDimUnit}>mm</span>
                    </div>
                </div>

                {/* ── Canvas preview ── */}
                <div ref={wrapRef} className={styles.swatchCardCanvasWrap}>
                    <canvas
                        ref={canvasRef}
                        className={styles.swatchCardCanvas}
                        style={{ width: `${displayW}px`, height: `${displayH}px` }}
                    />
                </div>

                {/* ── Export bar ── */}
                <div className={styles.scExportBar}>
                    <div className={styles.swatchCardZoom}>
                        <button
                            className={styles.swatchCardZoomBtn}
                            onClick={zoomOut}
                            title="Zoom out"
                        >
                            −
                        </button>
                        <button
                            className={styles.swatchCardZoomLabel}
                            onClick={() => setZoom(zoom === "fit" ? 1 : "fit")}
                            title="Toggle fit / 100%"
                        >
                            {zoomLabel()}
                        </button>
                        <button
                            className={styles.swatchCardZoomBtn}
                            onClick={zoomIn}
                            title="Zoom in"
                        >
                            +
                        </button>
                    </div>

                    <div style={{ flex: 1 }} />

                    <div className={styles.scGroup}>
                        <button
                            className={`${styles.scPill} ${printRotate ? styles.scPillActive : ""}`}
                            onClick={() => setPrintRotate(!printRotate)}
                            title="Rotate 90° for print"
                        >
                            Rotate
                        </button>
                        <button
                            className={styles.scExportBtn}
                            onClick={handlePrint}
                        >
                            Print
                        </button>
                        <button
                            className={`${styles.scExportBtn} ${styles.scExportBtnPrimary}`}
                            onClick={handleDownload}
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
