import type { Metadata } from "next";
import "../globals.css";
import StatusBar from "@/components/StatusBar";

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
        <html lang="en">
            <body>
                <StatusBar />
                <main>{children}</main>
            </body>
        </html>
    );
}
