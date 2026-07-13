import type { Metadata } from "next";
import "../globals.css";
import StatusBar from "@/components/StatusBar";
import ThemeScript from "@/components/ThemeScript";

export const metadata: Metadata = {
    title: "hexcyan — works",
    description: "portfolio works",
};

export default function WorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeScript />
                <StatusBar />
                <main>{children}</main>
            </body>
        </html>
    );
}
