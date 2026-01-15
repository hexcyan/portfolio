import { useState } from "react";
import styles from "./Paints.module.css";
import { PaintsFilterProps } from "./PaintsFilter";
type RangeFilterType =
    | "selectedPermanence"
    | "selectedOpacity"
    | "selectedStaining";
const RangeOperator = ["lte", "eq", "gte"];
type RangeOperatorType = (typeof RangeOperator)[number];

interface PaintsRangeProps extends PaintsFilterProps {
    label: string;
    symbols: string[];
}

export default function PaintRange({
    filters,
    setFilters,
    label,
    symbols,
}: PaintsRangeProps) {
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

    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const filterType = `selected${label}` as RangeFilterType;
    const startVal = label === "Permanence" ? 1 : 0;

    return (
        <div className={styles.paints__filter__group}>
            <p>{label}</p>
            <div>
                {RangeOperator.map((op) => (
                    <button
                        key={op}
                        onClick={() => setRangeOperator(filterType, op)}
                        className={`${styles.op__btn} ${
                            filters[filterType].operator === op
                                ? styles.op__btn__active
                                : ""
                        }`}
                    >
                        {op === "lte" ? "≤" : op === "eq" ? "=" : "≥"}
                    </button>
                ))}
            </div>
            <div>
                {symbols.map((symbol, index) => {
                    const selectedValue = filters[filterType].value;
                    const actualValue = startVal + index;
                    const effectiveValue =
                        hoverValue !== null ? hoverValue : selectedValue;

                    const isActive =
                        effectiveValue !== null &&
                        actualValue <= effectiveValue;

                    return (
                        <button
                            key={`${label}-${actualValue}`}
                            className={`${styles.star} ${
                                isActive ? styles.star__active : ""
                            }`}
                            onClick={() =>
                                updateRangeFilter(
                                    filterType,
                                    selectedValue === actualValue
                                        ? null
                                        : actualValue
                                )
                            }
                            onMouseEnter={() => setHoverValue(actualValue)}
                            onMouseLeave={() => setHoverValue(null)}
                        >
                            {symbol}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
