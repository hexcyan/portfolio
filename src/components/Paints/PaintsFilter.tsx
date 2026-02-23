import { Paint, paintSymbols, stockSizeLabels } from "@/lib/paints";
import { Filters } from "./PaintsGallery";
import styles from "./Paints.module.css";
import { useState } from "react";
import PaintRange from "./PaintRange";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"
const SERIES: SeriesType[] = ["A", "B", "C", "D", "E", "F"];

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

const setNames = [
    "12 colors",
    "Pastel Set 12 colors",
    "18 colors",
    "24 colors",
    "Botanical Art 24 colors",
    "30 colors",
    "48 colors",
    "60 colors",
];

export interface PaintsFilterProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export default function PaintsFilter({
    filters,
    setFilters,
}: PaintsFilterProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    const [showSetDropdown, setShowSetDropdown] = useState(false);

    // Toggle series selection
    const toggleSeries = (s: SeriesType) => {
        setFilters((prev) => ({
            ...prev,
            selectedSeries: prev.selectedSeries.includes(s)
                ? prev.selectedSeries.filter((series) => series !== s)
                : [...prev.selectedSeries, s],
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

    // Toggle set family
    const toggleSet = (setIndex: number) => {
        setFilters((prev) => ({
            ...prev,
            selectedSets: prev.selectedSets.map((val, idx) =>
                idx === setIndex ? ((val === 0 ? 1 : 0) as 0 | 1) : val
            ),
        }));

        console.log(filters);
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
        });
        setSearchTerm("");

        console.log(filters);
    };

    const hasActiveFilters =
        filters.inStock !== null ||
        filters.granulation !== null ||
        filters.selectedSeries.length > 0 ||
        filters.selectedPermanence.value !== null ||
        filters.selectedOpacity.value !== null ||
        filters.selectedStaining.value !== null ||
        filters.selectedColors.length > 0 ||
        filters.searchTerm !== "";

    return (
        <div className={styles.paints__filter}>
            <p>Filter:</p>

            {/* In Stock Filter */}
            <div className={styles.paints__filter__group}>
                <button
                    className={`${styles.filter__btn} ${
                        filters.inStock === false && styles.filter__strike
                    } ${
                        filters.inStock === true && styles.filter__selected
                    }`}
                    onClick={() =>
                        setFilters((prev) => ({
                            ...prev,
                            inStock:
                                prev.inStock === null
                                    ? true
                                    : prev.inStock === true
                                    ? false
                                    : null,
                            stockSize:
                                prev.inStock === true ? null : prev.stockSize,
                        }))
                    }
                >
                    <span className={styles.stockDot} />
                    In Stock{" "}
                    {filters.inStock === true
                        ? "✅"
                        : filters.inStock === false
                        ? "❌"
                        : ""}
                </button>
                {filters.inStock === true &&
                    stockSizeLabels.map((label, idx) => (
                        <button
                            key={label}
                            className={`${styles.filter__btn} ${
                                filters.stockSize === idx
                                    ? styles.filter__selected
                                    : ""
                            }`}
                            onClick={() =>
                                setFilters((prev) => ({
                                    ...prev,
                                    stockSize:
                                        prev.stockSize === idx ? null : idx,
                                }))
                            }
                        >
                            {label}
                        </button>
                    ))}
            </div>

            {/* Search */}
            <div className={styles.paints__filter__group}>
                <input
                    type="text"
                    placeholder="Search paints..."
                    value={searchTerm}
                    className={`${styles.filter__btn} ${styles.search__bar}`}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Color Categories Filter */}
            <div className={styles.paints__filter__group}>
                <button
                    className={`${styles.dropdown__btn} ${styles.filter__btn}`}
                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                >
                    Color {showColorDropdown ? "▼" : "▶"}
                    {filters.selectedColors.length > 0 &&
                        ` (${filters.selectedColors.length})`}
                </button>

                {showColorDropdown && (
                    <div className={styles.dropdown__menu}>
                        {colorCategories.map((category) => (
                            <button
                                key={category.key}
                                className={`${styles.filter__btn} ${
                                    filters.selectedColors.includes(
                                        category.key
                                    )
                                        ? styles.filter__selected
                                        : ""
                                }`}
                                onClick={() =>
                                    toggleColorCategory(category.key)
                                }
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                )}
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
            <div className={styles.paints__filter__group}>
                <button
                    className={`${styles.filter__btn} ${
                        filters.granulation === false && styles.filter__strike
                    } ${
                        filters.granulation === true && styles.filter__selected
                    }`}
                    onClick={toggleGranulation}
                >
                    Granulating{" "}
                    {filters.granulation === true
                        ? "✅"
                        : filters.granulation === false
                        ? "❌"
                        : "☁️"}
                </button>
            </div>

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

            {/* Set filter */}
            <div className={styles.paints__filter__group}>
                <button
                    className={`${styles.dropdown__btn} ${styles.filter__btn}`}
                    onClick={() => setShowSetDropdown(!showSetDropdown)}
                >
                    Sets {showSetDropdown ? "▼" : "▶"}
                    {filters.selectedSets.filter((val) => val === 1).length >
                        0 &&
                        ` (${
                            filters.selectedSets.filter((val) => val === 1)
                                .length
                        })`}
                </button>

                {showSetDropdown && (
                    <div className={styles.dropdown__menu}>
                        {setNames.map((setName, index) => (
                            <button
                                key={setName}
                                className={`${styles.filter__btn} ${
                                    filters.selectedSets[index]
                                        ? styles.filter__selected
                                        : ""
                                }`}
                                onClick={() => toggleSet(index)}
                            >
                                {setName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div>
                {hasActiveFilters && (
                    <button
                        className={`${styles.filter__btn} ${styles.clear__btn}`}
                        onClick={clearAllFilters}
                    >
                        Clear All
                    </button>
                )}
            </div>
        </div>
    );
}
