import type { Metadata } from "next";
import "../globals.css";
import StatusBar from "@/components/StatusBar";

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
        <html lang="en">
            <body>
                <StatusBar />
                {children}
            </body>
        </html>
    );
}
