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
export interface IIcon {
    title: string;
    type: string;
    route: string;
    descr?: string;
}

export const files: IIcon[] = [
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

export const projects: IIcon[] = [
        {
            title: "KeebSoc",
            type: "keebsoc",
            route: "https://keebsoc.com",
            descr: "The website rework for the Mechanical Keyboard Society of the University of New South Wales :)",
        },
    ];

export const tools: IIcon[] = [
        {
            title: "QR Code Generator",
            route: "/tools/qr_generator",
            type: "contrast",
            descr: "Simple, no-frills, no-ads QR Code generator with transparency and logos.",
        },
        {
            title: "Holbein Paints Explorer",
            route: "/tools/paints",
            type: "paints",
            // descr: "The Holbein Watercolor Paints catalogue is readily availiable in print and pdf form. However, these are not interactive and cannot be easily filtered or searched. Find the exact (Holbein) color you're looking for :D\nView the database here → (Currently not deployed lol)",
            descr: "The Holbein Watercolor Paints catalogue is readily availiable in print and pdf form. However, these catalogues are not interactive and cannot be easily filtered or searched. Find the exact (Holbein) color you're looking for :D\nView the database here",
        },
        {
            title: "Palette Builder",
            route: "/tools/palette",
            type: "Bitmap",
            descr: "Build your custom watercolor palette — featuring Holbein, Van Gogh, and handmade paints, pick a layout, and order → (Currently WIP)",
        },
    ];