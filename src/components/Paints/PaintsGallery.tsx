"use client";

import PaintCard from "./PaintCard";
import { useState } from "react";
import { hbPaints, Paint } from "@/lib/paints";
import styles from "./Paints.module.css";
import PaintsFilter from "./PaintsFilter";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"

export interface Filters {
    selectedSeries: SeriesType[];
}

const initialFilters: Filters = {
    selectedSeries: [],
};

export default function PaintsGallery() {
    const [filters, setFilters] = useState<Filters>(initialFilters);

    const filterPaints = (paints: Paint[]) => {
        return paints.filter((paint) => {
            const matchesSeries =
                filters.selectedSeries.length === 0 ||
                filters.selectedSeries.includes(paint.series);
            return matchesSeries;
        });
    };
    return (
        <>
            <PaintsFilter filters={filters} setFilters={setFilters} />
            <div className={styles.paints__gallery}>
                {filterPaints(hbPaints).map((paint) => (
                    <PaintCard key={paint.code} paint={paint} />
                ))}
            </div>
        </>
    );
}
