"use client";

import { createContext, useContext, useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { MASONRY } from "./masonry.config";

export interface MasonryMeasurements {
    columnWidth: number;
    colGap: number;
    rowGap: number;
    totalGridCols: number;
}

const MasonryContext = createContext<MasonryMeasurements | null>(null);

interface MasonryProviderProps {
    gridRef: React.RefObject<HTMLElement | null>;
    children: ReactNode;
}

export function MasonryProvider({ gridRef, children }: MasonryProviderProps) {
    const [measurements, setMeasurements] = useState<MasonryMeasurements | null>(null);
    const prevRef = useRef<MasonryMeasurements | null>(null);

    const measure = useCallback(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const gridStyles = window.getComputedStyle(grid);
        const colWidths = gridStyles
            .getPropertyValue("grid-template-columns")
            .split(" ")
            .filter((w) => w !== "0px");
        const columnWidth = parseFloat(colWidths[0]) || MASONRY.columnFallback;
        const colGap = parseFloat(gridStyles.getPropertyValue("column-gap")) || 0;
        const rowGap = parseFloat(gridStyles.getPropertyValue("row-gap")) || 0;
        const totalGridCols = colWidths.length;

        const prev = prevRef.current;
        if (
            prev &&
            prev.columnWidth === columnWidth &&
            prev.colGap === colGap &&
            prev.rowGap === rowGap &&
            prev.totalGridCols === totalGridCols
        ) {
            return; // skip re-render if nothing changed
        }

        const next = { columnWidth, colGap, rowGap, totalGridCols };
        prevRef.current = next;
        setMeasurements(next);
    }, [gridRef]);

    useEffect(() => {
        measure();

        const grid = gridRef.current;
        if (!grid) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(measure);
        });
        observer.observe(grid);

        return () => observer.disconnect();
    }, [gridRef, measure]);

    return (
        <MasonryContext.Provider value={measurements}>
            {children}
        </MasonryContext.Provider>
    );
}

export function useMasonryGrid(): MasonryMeasurements | null {
    return useContext(MasonryContext);
}
