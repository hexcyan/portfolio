export const storageZone = "x65535";

export const links = [
    // "projects",
    "blog",
    "gallery",
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
        title: "gallery (new!)",
        type: "folder",
        route: "/gallery",
    },
    {
        title: "this site",
        type: "file",
        route: "/blog/0",
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
