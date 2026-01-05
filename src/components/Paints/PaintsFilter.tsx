import { Paint, paintSymbols } from "@/lib/paints";
import { Filters } from "./PaintsGallery";
import styles from "./Paints.module.css";
import { useState } from "react";
import PaintRange from "./PaintRange";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"
const SERIES: SeriesType[] = ["A", "B", "C", "D", "E", "F"];
type RangeFilterType =
    | "selectedPermanence"
    | "selectedOpacity"
    | "selectedStaining";
const RangeOperator = ["lte", "eq", "gte"];
type RangeOperatorType = (typeof RangeOperator)[number];

const colorCategories = [
    { key: "red", label: "Red" },
    { key: "yellow", label: "Yellow" },
    { key: "green", label: "Green" },
    { key: "blue", label: "Blue" },
    { key: "violet", label: "Violet" },
    { key: "brown_black", label: "Brown & Black" },
    { key: "grey_white", label: "Grey & White" },
    { key: "gold_silver", label: "Gold & Silver" },
] as const;

export interface PaintsFilterProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export default function PaintsFilter({
    filters,
    setFilters,
}: PaintsFilterProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    // Toggle size selection
    // const toggleSize = () => {
    //     setFilters((prev) => ({
    //         ...prev,
    //         selectedSize: !prev.selectedSize,
    //     }));
    // };

    // Toggle series selection
    const toggleSeries = (s: SeriesType) => {
        setFilters((prev) => ({
            ...prev,
            selectedSeries: prev.selectedSeries.includes(s)
                ? prev.selectedSeries.filter((series) => series !== s)
                : [...prev.selectedSeries, s],
        }));
    };

    // Toggle perm/opacity/staining
    const updateRangeFilter = (
        filterType: RangeFilterType,
        value: number | null
    ) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: {
                ...prev[filterType],
                value: value,
            },
        }));
    };

    const setRangeOperator = (
        filterType: RangeFilterType,
        operator: RangeOperatorType
    ) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: {
                ...prev[filterType],
                operator: operator,
            },
        }));
    };

    // Toggle granulation
    const toggleGranulation = () => {
        console.log(filters.granulation);

        setFilters((prev) => ({
            ...prev,
            granulation:
                prev.granulation === null
                    ? true
                    : prev.granulation === true
                    ? false
                    : null,
        }));
    };

    // Toggle color family
    const toggleColorCategory = (category: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedColors: prev.selectedColors.includes(category)
                ? prev.selectedColors.filter((c) => c !== category)
                : [...prev.selectedColors, category],
        }));
    };

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setFilters((prev) => ({
            ...prev,
            searchTerm: value,
        }));
    };

    // Clear ALL filters
    const clearAllFilters = () => {
        setFilters({
            granulation: null,
            selectedSeries: [],
            selectedPermanence: { operator: "eq", value: null },
            selectedOpacity: { operator: "eq", value: null },
            selectedStaining: { operator: "eq", value: null },
            selectedColors: [],
            searchTerm: "",
        });
        setSearchTerm("");
    };

    const hasActiveFilters =
        filters.granulation !== null ||
        filters.selectedSeries.length > 0 ||
        filters.selectedPermanence !== null ||
        filters.selectedOpacity !== null ||
        filters.selectedStaining !== null ||
        filters.selectedColors.length > 0 ||
        filters.searchTerm !== "";

    return (
        <div className={styles.paints__filter}>
            <p>Filter:</p>

            {/* Search */}
            <div className={styles.paints__filter__group}>
                <input
                    type="text"
                    placeholder="Search paints..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Permanence Filter */}
            <PaintRange
                filters={filters}
                setFilters={setFilters}
                label="Permanence"
                symbols={Array(4).fill("✻")}
            />
            {/* Opacity Filter */}
            <PaintRange
                filters={filters}
                setFilters={setFilters}
                label="Opacity"
                symbols={paintSymbols.opacity}
            />
            {/* Staining Filter */}
            <PaintRange
                filters={filters}
                setFilters={setFilters}
                label="Staining"
                symbols={paintSymbols.staining}
            />

            {/* Granulation filter with 3 states: True | False | null */}
            <button
                className={`${styles.filter__btn} ${
                    filters.granulation === false && styles.filter__strike
                } ${filters.granulation === true && styles.filter__selected}`}
                onClick={toggleGranulation}
            >
                Granulating{" "}
                {filters.granulation === true
                    ? "✅"
                    : filters.granulation === false
                    ? "❌"
                    : "☁️"}
            </button>

            {/* Series Filter */}
            <div className={styles.paints__filter__group}>
                <p>Series</p>
                {SERIES.map((s) => (
                    <button
                        key={s}
                        className={`${styles.filter__btn}
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

            {/* Size filter (All colors have 5 / 15ml sizes, no need to filter those) */}
            <div className={styles.paints__filter__group}>
                {/* <p>Size</p> */}
                {/* <button
                    className={`${styles.filter__btn}
                            ${
                                filters.selectedSize
                                    ? styles.filter__selected
                                    : ""
                            }`}
                    onClick={() => toggleSize()}
                >
                    60ml
                </button> */}
            </div>
            {/* Dropdowns: Red, Yellow, Green, Blue, Violet, Brown, Black, Grey, White, Gold, Silver */}
            {/* <p>Color ▼</p> */}
            {/* <p>Sets ▼</p> */}
            {/* <input type="text" placeholder="Search.."></input> */}
            {/* suggest groups, update per keystroke union all matches */}
        </div>
    );
}
