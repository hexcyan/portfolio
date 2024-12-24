export interface Paint {
    code: number;
    large: boolean;
    en_name: string;
    jp_name: string;
    fr_name: string;
    series: "A" | "B" | "C" | "D" | "E" | "F";
    perm: 1 | 2 | 3 | 4;
    opacity: 0 | 1 | 2 | 3;
    staining: 0 | 1 | 2;
    granulation: boolean;
    pigments: string[];
}


// Need to double check these values
// Half of the properties are wrong coz Claude can't read apparently lol
import HolbeinPaints from "./hbcolors.json";
export const hbPaints: Paint[] = HolbeinPaints.map((paint) => paint as Paint);

export const paintFilters = [
    "Permanence",
    "Opacity",
    "Staining",
    "Granulating",
    "Series",
    "Family",
    "Sets",
    "Size"
]

export const paintSymbols = {
    opacity: ["◯", "⦶", "◐", "⬤"],
    staining: ["☐", "◩", "◼"]
}

export const paintFamily = {
    red: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 25, 26, 27],
    yellow: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49, 50, 51],
    green: [60, 61, 62, 63, 64, 65, 66, 67, 69, 70, 71, 74, 75, 77, 78, 79],
    blue: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105, 106, 107, 108],
    violet: [110, 112, 113, 115, 116, 117, 119, 120, 170, 175],
    brown_black: [129, 130, 131, 132, 133, 134, 135, 136, 139, 141, 142, 137, 138, 140],
    grey_white: [151, 152, 153, 155, 156, 157, 2, 3],
    gold_silver: [190, 191],
};

