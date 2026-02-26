import { Bit, Paint, hbPaints, myStock } from "./paints";

export interface PalettePaint {
    id: string;
    brand: "holbein" | "vangogh" | "handmade";
    code?: string;
    name: string;
    colorHex: string;
    imageUrl?: string;
    pigments?: string[];
    stockSizes: [Bit, Bit, Bit, Bit]; // [5ml, 15ml, 60ml, mini]
}

// Approximate hex colors for Holbein watercolors by paint code
const holbeinHexMap: Record<number, string> = {
    5: "#C8223A",   // Quinacridone Red
    6: "#D4264F",   // Pyrrole Rubin
    7: "#E03628",   // Pyrrole Red
    8: "#6B2033",   // Perylene Maroon
    9: "#B0203A",   // Permanent Alizarin Crimson
    10: "#A01830",  // Crimson Lake
    11: "#C0143C",  // Carmine
    12: "#D75B7A",  // Rose Madder
    13: "#F050A0",  // Opera
    14: "#E05040",  // Cadmium Red Light
    15: "#B82020",  // Cadmium Red Deep
    16: "#E04828",  // Cadmium Red Orange
    17: "#A01838",  // Cadmium Red Purple
    18: "#E83820",  // Vermilion
    19: "#E84830",  // Vermilion Hue
    22: "#E83018",  // Scarlet Lake
    25: "#F8A0C0",  // Brilliant Pink
    26: "#F4C8C0",  // Shell Pink
    27: "#E03040",  // Quinacridone Scarlet
    30: "#F0D070",  // Naples Yellow
    31: "#F8E888",  // Jaune Brilliant No.1
    32: "#F8E0A0",  // Jaune Brilliant No.2
    33: "#F8F020",  // Lemon Yellow
    34: "#D8B050",  // Yellow Ochre
    35: "#F8F040",  // Permanent Yellow Lemon
    36: "#F8E020",  // Permanent Yellow Light
    37: "#F8C800",  // Permanent Yellow Deep
    38: "#F0A010",  // Permanent Yellow Orange
    39: "#F0D010",  // Aureolin
    40: "#F8F030",  // Cadmium Yellow Lemon
    41: "#F8E828",  // Cadmium Yellow Pale
    42: "#F8D818",  // Cadmium Yellow Light
    43: "#F0B800",  // Cadmium Yellow Deep
    44: "#F0A800",  // Cadmium Yellow Orange
    46: "#C8D820",  // Greenish Yellow
    47: "#F08018",  // Brilliant Orange
    48: "#E8B020",  // Gamboge Nova
    49: "#E8A800",  // Isoindolinone Yellow Deep
    50: "#F0D030",  // Imidazolone Yellow
    51: "#F0E838",  // Imidazolone Lemon
    60: "#1A8050",  // Viridian
    61: "#38A060",  // Viridian Hue
    62: "#305828",  // Hooker's Green
    63: "#40A880",  // Cobalt Green
    64: "#28C870",  // Emerald Green Nova
    65: "#708848",  // Terre Verte
    66: "#30A040",  // Permanent Green No.1
    67: "#208038",  // Permanent Green No.2
    69: "#68B830",  // Cadmium Green Pale
    70: "#286028",  // Cadmium Green Deep
    71: "#588040",  // Compose Green
    74: "#585820",  // Olive Green
    75: "#487020",  // Sap Green
    77: "#70A838",  // Leaf Green
    78: "#88A840",  // Bamboo Green
    79: "#385040",  // Shadow Green
    90: "#2050A0",  // Cobalt Blue
    91: "#3060B0",  // Cobalt Blue Hue
    92: "#1878B0",  // Cerulean Blue
    93: "#3838C0",  // Ultramarine Light
    94: "#2828A8",  // Ultramarine Deep
    95: "#50A0D0",  // Verditer Blue
    96: "#2848A0",  // Compose Blue
    97: "#102848",  // Prussian Blue
    98: "#283858",  // Indigo
    99: "#18A0D0",  // Turquoise Blue
    101: "#0870A8", // Peacock Blue
    102: "#183880", // Marine Blue
    103: "#2040A8", // Royal Blue
    104: "#80B8D8", // Horizon Blue
    105: "#20A8D0", // Manganese Blue Nova
    106: "#28B0B0", // Cobalt Turquoise Light
    107: "#1060A0", // Phthalo Blue Yellow Shade
    108: "#0838A0", // Phthalo Blue Red Shade
    110: "#8050A0", // Cobalt Violet Light
    112: "#806088", // Mineral Violet
    113: "#684048", // Mars Violet
    115: "#8830A0", // Permanent Violet
    116: "#9878C0", // Lavendar
    117: "#B088D0", // Lilac
    119: "#C01880", // Quinacridone Magenta
    120: "#802070", // Quinacridone Violet
    170: "#F060A0", // Bright Rose (Luminous)
    175: "#C050F0", // Bright Violet (Luminous)
    129: "#6B4830", // Umber
    130: "#B85838", // Light Red
    131: "#887040", // Raw Umber
    132: "#C89848", // Raw Sienna
    133: "#503020", // Burnt Umber
    134: "#C05828", // Burnt Sienna
    135: "#983828", // Indian Red
    136: "#483020", // Sepia
    139: "#402818", // Vandyke Brown
    141: "#A07020", // Imidazolone Brown
    142: "#C89028", // Quinacridone Gold
    137: "#383028", // Peach Black
    138: "#181818", // Ivory Black
    140: "#101010", // Lamp Black
    151: "#C8C090", // Yellow Grey
    152: "#90A888", // Green Grey
    153: "#989898", // Grey of Grey
    155: "#808478", // Davy's Grey
    156: "#404858", // Payne's Grey
    157: "#383840", // Neutral Tint
    2: "#F0F0F0",   // Chinese White
    3: "#FFFFFF",    // Titanium White
    190: "#D4B848",  // Gold
    191: "#C0C0C0",  // Silver
};

export function buildHolbeinPaints(
    paints?: Paint[],
    stock?: Record<number, [Bit, Bit, Bit, Bit]>,
): PalettePaint[] {
    const paintList = paints ?? hbPaints;
    const stockMap = stock ?? myStock;
    return paintList.map((p) => {
        const code = p.code.toString().padStart(3, "0");
        return {
            id: `hb-${p.code}`,
            brand: "holbein" as const,
            code: `W${code}`,
            name: p.en_name,
            colorHex: holbeinHexMap[p.code] ?? "#CCCCCC",
            imageUrl: `https://x65535.b-cdn.net/paints/hb/${p.code}.jpg?quality=45`,
            pigments: p.pigments,
            stockSizes: stockMap[p.code] ?? [0, 0, 0, 0],
        };
    });
}

export const vanGoghPaints: PalettePaint[] = [
    // { id: "vg-1", brand: "vangogh", code: "VG-001", name: "Yellow Ochre", colorHex: "#D8B050", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-2", brand: "vangogh", code: "VG-002", name: "Raw Sienna", colorHex: "#C89848", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-3", brand: "vangogh", code: "VG-003", name: "Burnt Sienna", colorHex: "#C05828", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-4", brand: "vangogh", code: "VG-004", name: "Burnt Umber", colorHex: "#503020", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-5", brand: "vangogh", code: "VG-005", name: "Cadmium Yellow Light", colorHex: "#F8D818", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-6", brand: "vangogh", code: "VG-006", name: "Cadmium Red Light", colorHex: "#E05040", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-7", brand: "vangogh", code: "VG-007", name: "Alizarin Crimson", colorHex: "#B0203A", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-8", brand: "vangogh", code: "VG-008", name: "Ultramarine Deep", colorHex: "#2828A8", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-9", brand: "vangogh", code: "VG-009", name: "Cerulean Blue", colorHex: "#1878B0", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-10", brand: "vangogh", code: "VG-010", name: "Prussian Blue", colorHex: "#102848", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-11", brand: "vangogh", code: "VG-011", name: "Viridian", colorHex: "#1A8050", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-12", brand: "vangogh", code: "VG-012", name: "Sap Green", colorHex: "#487020", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-13", brand: "vangogh", code: "VG-013", name: "Payne's Grey", colorHex: "#404858", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-14", brand: "vangogh", code: "VG-014", name: "Ivory Black", colorHex: "#181818", stockSizes: [1, 1, 1, 1] },
    // { id: "vg-15", brand: "vangogh", code: "VG-015", name: "Chinese White", colorHex: "#F0F0F0", stockSizes: [1, 1, 1, 1] },
];

export const handmadePaints: PalettePaint[] = [
    // { id: "hm-lavender", brand: "handmade", code: "HM-001", name: "Lavender", colorHex: "#9878C0", stockSizes: [0, 0, 0, 0] },
    // { id: "hm-moss", brand: "handmade", code: "HM-002", name: "Moss Green", colorHex: "#6B8040", stockSizes: [0, 0, 0, 0] },
    // { id: "hm-coral", brand: "handmade", code: "HM-003", name: "Coral Pink", colorHex: "#F08080", stockSizes: [0, 0, 0, 0] },
];

export function getAllPaints(
    paints?: Paint[],
    stock?: Record<number, [Bit, Bit, Bit, Bit]>,
): PalettePaint[] {
    return [...buildHolbeinPaints(paints, stock), ...vanGoghPaints, ...handmadePaints];
}

/** Check if a paint has any of the required sizes in stock */
export function isInStockForLayout(paint: PalettePaint, validSizeIndices: number[]): boolean {
    return validSizeIndices.some((i) => paint.stockSizes[i] === 1);
}
