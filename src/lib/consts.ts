export const storageZone = "x65535";

export const links = [
    // "projects",
    "blog",
    "gallery",
    "tools",
];

export const socials = [
    {
        site: "github",
        link: "https://github.com/hexcyan",
    },
    {
        site: "youtube",
        link: "https://youtube.com/@hexcyan",
    },
    {
        site: "twitter",
        link: "https://x.com/hexcyan",
    },
];

// filelink arrays
export interface FileLink {
    title: string;
    type: string;
    route: string;
}

export const files: FileLink[] = [
    {
        title: "tools",
        type: "briefcase",
        route: "/tools",
    },
    {
        title: "gallery",
        type: "folder",
        route: "/gallery",
    },
    {
        title: "this site",
        type: "file",
        route: "/blog/0",
    },
    {
        title: "404",
        type: "file",
        route: "/somepagethatodoesntexist",
    },
];

export const projects: FileLink[] = [
    {
        title: "gallery (coming soon)",
        type: "folder",
        route: "/gallery",
    },
    {
        title: "this site",
        type: "file",
        route: "/blog/wireless-keyboard",
    },
];

export interface Paint {
    code: number;
    en_name: string;
    jp_name: string;
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
