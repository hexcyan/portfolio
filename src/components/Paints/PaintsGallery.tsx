"use client";

import { useState, useMemo } from "react";

import PaintCard from "./PaintCard";
import { Paint } from "@/lib/paints";
import type { Bit } from "@/lib/paints";
import styles from "./Paints.module.css";
import PaintsFilter from "./PaintsFilter";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"

export interface RangeFilter {
    operator: "lte" | "eq" | "gte"; // less than or equal, equal, greater than or equal
    value: number | null;
}

export type TriState = null | true | false;

export interface Filters {
    inStock: boolean | null;
    soldSizeFilter: TriState[]; // [5ml, 15ml, 60ml] — filters on paint.size
    stockSizeFilter: TriState[]; // [5ml, 15ml, 60ml, Mini] — filters on myStock
    granulation: boolean | null;
    selectedSeries: SeriesType[];
    selectedPermanence: RangeFilter;
    selectedOpacity: RangeFilter;
    selectedStaining: RangeFilter;
    selectedColors: string[];
    selectedSets: (0 | 1)[];
    searchTerm: string;
}

interface PaintsGalleryProps {
    paints: Paint[];
    stock: Record<number, [Bit, Bit, Bit, Bit]>;
    paintFamily: Record<string, number[]>;
}

const initialFilters: Filters = {
    inStock: null,
    soldSizeFilter: [null, null, null],
    stockSizeFilter: [null, null, null, null],
    granulation: null,
    selectedSeries: [],
    selectedPermanence: { operator: "eq", value: null },
    selectedOpacity: { operator: "eq", value: null },
    selectedStaining: { operator: "eq", value: null },
    selectedColors: [],
    selectedSets: [0, 0, 0, 0, 0, 0, 0, 0],
    searchTerm: "",
};

export default function PaintsGallery({ paints: hbPaints, stock: myStock, paintFamily }: PaintsGalleryProps) {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const stockSet = useMemo(() => new Set(Object.keys(myStock).map(Number)), [myStock]);

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
            // Sold-size filters (paint.size: [5ml, 15ml, 60ml]) — always active
            let matchesSoldSize = true;
            for (let i = 0; i < filters.soldSizeFilter.length; i++) {
                const f = filters.soldSizeFilter[i];
                if (f === null) continue;
                const hasSoldSize = paint.size[i] === 1;
                if (f === true && !hasSoldSize) { matchesSoldSize = false; break; }
                if (f === false && hasSoldSize) { matchesSoldSize = false; break; }
            }

            // In Stock filter (with owned-size include/exclude)
            let matchesStock = true;
            if (filters.inStock !== null) {
                const owned = stockSet.has(paint.code);
                if (filters.inStock === false) {
                    matchesStock = !owned;
                } else {
                    // inStock === true
                    if (!owned) {
                        matchesStock = false;
                    } else {
                        // Stock-size filters (myStock: [5ml, 15ml, 60ml, Mini])
                        const stock = myStock[paint.code];
                        for (let i = 0; i < filters.stockSizeFilter.length; i++) {
                            const f = filters.stockSizeFilter[i];
                            if (f === null) continue;
                            const hasSize = stock[i] === 1;
                            if (f === true && !hasSize) { matchesStock = false; break; }
                            if (f === false && hasSize) { matchesStock = false; break; }
                        }
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
                `w${paintCode} w${paint.code === 2 ? "201" : paint.code + 200
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
                matchesSoldSize &&
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
