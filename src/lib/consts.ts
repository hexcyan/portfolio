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
        type: "alert",
        route: "/somepagethatodoesntexist",
    },
    {
        title: "KeebSoc",
        type: "keebsoc",
        route: "https://keebsoc.com",
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
