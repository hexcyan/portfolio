import { Paint } from "@/lib/paints";
import { Filters } from "./PaintsGallery";
import styles from "./Paints.module.css";

type SeriesType = Paint["series"]; // This extracts "A" | "B" | "C" | "D" | "E" | "F"
const SERIES: SeriesType[] = ["A", "B", "C", "D", "E", "F"];

interface PaintsFilterProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export default function PaintsFilter({
    filters,
    setFilters,
}: PaintsFilterProps) {
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

    // Toggle series selection
    const toggleSeries = (s: SeriesType) => {
        setFilters((prev) => ({
            ...prev,
            selectedSeries: prev.selectedSeries.includes(s)
                ? prev.selectedSeries.filter((series) => series !== s)
                : [...prev.selectedSeries, s],
        }));
    };

    // Toggle size selection
    const toggleSize = () => {
        setFilters((prev) => ({
            ...prev,
            selectedSize: !prev.selectedSize,
        }));
    };

    return (
        <div className={styles.paints__filter}>
            <p>Filter:</p>
            {/* <p>Permanence: ≤ = ≥ ✻✻✻✻</p>
            <p>Opacity: ≤ = ≥ {paintSymbols.opacity}</p>
            <p>Staining: ≤ = ≥ {paintSymbols.staining}</p> */}

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
                <button
                    className={`${styles.filter__btn}
                            ${
                                filters.selectedSize
                                    ? styles.filter__selected
                                    : ""
                            }`}
                    onClick={() => toggleSize()}
                >
                    60ml
                </button>
            </div>
            {/* Dropdowns: Red, Yellow, Green, Blue, Violet, Brown, Black, Grey, White, Gold, Silver */}
            {/* <p>Color ▼</p> */}
            {/* <p>Sets ▼</p> */}
            {/* <input type="text" placeholder="Search.."></input> */}
            {/* suggest groups, update per keystroke union all matches */}
        </div>
    );
}
