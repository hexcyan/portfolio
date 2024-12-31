"use client";

import PaintCard from "./PaintCard";
import { useState } from "react";
import { hbPaints, Paint } from "@/lib/paints";
import styles from "./Paints.module.css";
import PaintsFilter from "./PaintsFilter";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"

export interface Filters {
    granulation: boolean | null;
    selectedSeries: SeriesType[];
    selectedSize: boolean;
}

const initialFilters: Filters = {
    granulation: null,
    selectedSeries: [],
    selectedSize: false,
};

export default function PaintsGallery() {
    const [filters, setFilters] = useState<Filters>(initialFilters);

    const filterPaints = (paints: Paint[]) => {
        return paints.filter((paint) => {
            const matchesSeries =
                filters.selectedSeries.length === 0 ||
                filters.selectedSeries.includes(paint.series);
            const matchesGranulation =
                filters.granulation === null ||
                filters.granulation === paint.granulation;
            const matchesSize = filters.selectedSize === false || paint.large;
            return matchesSeries && matchesGranulation && matchesSize;
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
