export const metadata = {
    title: "Holbein WC Viewer",
    description: "search and filter holbein watercolor paints",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
