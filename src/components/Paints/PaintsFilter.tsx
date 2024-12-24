"use client";
import { Paint, paintSymbols } from "@/lib/paints";
import styles from "./Paints.module.css";
import { Filters } from "./PaintsGallery";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"
const SERIES: SeriesType[] = ["A", "B", "C", "D", "E", "F"];

// interface PaintsFilterProps {
//     filters: FilterState;
//     setFilters: (filters: FilterState) => void;
// }

interface PaintsFilterProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export default function PaintsFilter({
    filters,
    setFilters,
}: PaintsFilterProps) {
    // Toggle series selection
    const toggleSeries = (s: SeriesType) => {
        setFilters((prev) => ({
            ...prev,
            selectedSeries: prev.selectedSeries.includes(s)
                ? prev.selectedSeries.filter((series) => series !== s)
                : [...prev.selectedSeries, s],
        }));
    };

    return (
        <div className={styles.paints__filter}>
            <p>Filter:</p>
            <p>Permanence: ≤ = ≥ ✻✻✻✻</p>
            <p>Opacity: ≤ = ≥ {paintSymbols.opacity}</p>
            <p>Staining: ≤ = ≥ {paintSymbols.staining}</p>
            {/* Replace with 3 state checkbox: yes, no, idc */}
            <p>Granulating</p> <input type="checkbox"></input>
            {/* Series Filter */}
            <div className={styles.paints__filter__group}>
                <p>Series</p>
                {SERIES.map((s) => (
                    <button
                        key={s}
                        className={`${styles.filter__series}
                            ${
                                filters.selectedSeries.includes(s)
                                    ? styles.filter__selected
                                    : ""
                            }`}
                        onClick={() => toggleSeries(s as SeriesType)}
                    >
                        {s}
                    </button>
                ))}
                {filters.selectedSeries.length > 0 && (
                    <button
                        className={styles.filter__series}
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                selectedSeries: [],
                            }))
                        }
                    >
                        Clear
                    </button>
                )}
            </div>
            {/* <p>Size: 5ml 15ml 60ml</p>
            {/* Dropdowns: Red, Yellow, Green, Blue, Violet, Brown, Black, Grey, White, Gold, Silver */}
            {/* <p>Color ▼</p> */}
            {/* <p>Sets ▼</p> */}
            {/* <input type="text" placeholder="Search.."></input> */}
            {/* suggest groups, update per keystroke union all matches */}
        </div>
    );
}
