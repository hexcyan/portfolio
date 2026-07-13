import type { Metadata } from "next";
import "../globals.css";
import StatusBar from "@/components/StatusBar";
import ThemeScript from "@/components/ThemeScript";

export const metadata: Metadata = {
    title: "hexcyan",
    description: "portfolio",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeScript />
                <StatusBar />
                {children}
            </body>
        </html>
    );
}
