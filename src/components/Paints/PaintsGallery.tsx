"use client";

import { useState } from "react";

import PaintCard from "./PaintCard";
import { hbPaints, Paint, myStock } from "@/lib/paints";
import styles from "./Paints.module.css";
import PaintsFilter from "./PaintsFilter";
import { paintFamily } from "@/lib/paints";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"

export interface RangeFilter {
    operator: "lte" | "eq" | "gte"; // less than or equal, equal, greater than or equal
    value: number | null;
}

export interface Filters {
    inStock: boolean | null;
    stockSize: number | null; // index into stockSizeLabels (0-3), or null for "any size"
    granulation: boolean | null;
    selectedSeries: SeriesType[];
    selectedPermanence: RangeFilter;
    selectedOpacity: RangeFilter;
    selectedStaining: RangeFilter;
    selectedColors: string[];
    selectedSets: (0 | 1)[];
    searchTerm: string;
}

const stockSet = new Set(Object.keys(myStock).map(Number));

const initialFilters: Filters = {
    inStock: null,
    stockSize: null,
    granulation: null,
    selectedSeries: [],
    selectedPermanence: { operator: "eq", value: null },
    selectedOpacity: { operator: "eq", value: null },
    selectedStaining: { operator: "eq", value: null },
    selectedColors: [],
    selectedSets: [0, 0, 0, 0, 0, 0, 0, 0],
    searchTerm: "",
};

export default function PaintsGallery() {
    const [filters, setFilters] = useState<Filters>(initialFilters);

    const matchesRangeFilter = (
        paintValue: number,
        filter: RangeFilter
    ): boolean => {
        if (filter.value === null) return true;

        switch (filter.operator) {
            case "lte":
                return paintValue <= filter.value;
            case "eq":
                return paintValue === filter.value;
            case "gte":
                return paintValue >= filter.value;
            default:
                return true;
        }
    };

    const filterPaints = (paints: Paint[]) => {
        return paints.filter((paint) => {
            // In Stock filter (with optional size narrowing)
            let matchesStock = true;
            if (filters.inStock !== null) {
                const owned = stockSet.has(paint.code);
                if (filters.inStock === false) {
                    matchesStock = !owned;
                } else {
                    // inStock === true
                    if (!owned) {
                        matchesStock = false;
                    } else if (filters.stockSize !== null) {
                        matchesStock = myStock[paint.code][filters.stockSize] === 1;
                    }
                }
            }

            // Series filter
            const matchesSeries =
                filters.selectedSeries.length === 0 ||
                filters.selectedSeries.includes(paint.series);

            // Granulation filter
            const matchesGranulation =
                filters.granulation === null ||
                filters.granulation === paint.granulation;

            // Range filters
            const matchesPermanence = matchesRangeFilter(
                paint.perm,
                filters.selectedPermanence
            );
            const matchesOpacity = matchesRangeFilter(
                paint.opacity,
                filters.selectedOpacity
            );
            const matchesStaining = matchesRangeFilter(
                paint.staining,
                filters.selectedStaining
            );

            // Color category filter using paintFamily
            const matchesColor =
                filters.selectedColors.length === 0 ||
                filters.selectedColors.some((category) => {
                    const familyCodes =
                        paintFamily[category as keyof typeof paintFamily];
                    return familyCodes.includes(paint.code);
                });

            // color set filter
            const matchesSet =
                filters.selectedSets.every((val) => val === 0) ||
                filters.selectedSets.some(
                    (val, idx) => val === 1 && paint.sets[idx] === 1
                );

            // Search filter (searches in paint code, English, French, Japanese names and pigments)
            const searchLower = filters.searchTerm.toLowerCase();
            const paintCode = paint.code.toString().padStart(3, "0");

            const matchesSearch =
                filters.searchTerm === "" ||
                `w${paintCode} w${
                    paint.code === 2 ? "201" : paint.code + 200
                } ${paint.size[2] !== 0 && `ww${paintCode}`}`.includes(
                    searchLower
                ) ||
                paint.en_name.toLowerCase().includes(searchLower) ||
                paint.fr_name.toLowerCase().includes(searchLower) ||
                paint.jp_name.toLowerCase().includes(searchLower) ||
                paint.pigments.some((pigment) =>
                    pigment.toLowerCase().includes(searchLower)
                ) ||
                paint.code.toString().includes(filters.searchTerm);

            return (
                matchesStock &&
                matchesSeries &&
                matchesGranulation &&
                matchesPermanence &&
                matchesOpacity &&
                matchesStaining &&
                matchesColor &&
                matchesSet &&
                matchesSearch
            );
        });
    };

    return (
        <>
            <PaintsFilter filters={filters} setFilters={setFilters} />

            <div className={styles.paints__gallery}>
                {filterPaints(hbPaints).map((paint) => (
                    <PaintCard key={paint.code} paint={paint} inStock={stockSet.has(paint.code)} stockSizes={filters.inStock === true ? myStock[paint.code] : undefined} />
                ))}
            </div>
        </>
    );
}
