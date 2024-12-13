export const storageZone = "x65535";

export const links = ["projects", "blog", "gallery"];

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
        title: "gallery (new!)",
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

export interface ProjectLink {
    title: string;
    href: string[];
    desc: string;
    img: string;
}

export const projects: ProjectLink[] = [
    {
        title: "CandyColour",
        href: [
            "https://www.etsy.com/au/shop/CandyColourShop",
            "https:/instagram.com/candycolour.shop",
        ],
        desc: "A short description here",
        img: "/projects/candy.jpg",
    },
    {
        title: "Placeholder",
        href: ["#"],
        desc: "A short description here",
        img: "/logo.svg",
    },
];
