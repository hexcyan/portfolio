import type { Metadata } from "next";
import "./globals.css";
import StatusBar from "@/components/StatusBar";
import Window from "@/components/Window";
import FileLinks from "@/components/FileLinks";
import ButtonsBox from "@/components/ButtonsBox";

export const metadata: Metadata = {
    title: "hexcyan",
    description: "portfolio",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <StatusBar />
                <div className="desktop">
                    <div className="desktop__sidebar">
                        <div className="desktop__files">
                            <FileLinks />
                        </div>
                        <div>
                            <ButtonsBox />
                        </div>
                    </div>
                    <Window>{children}</Window>
                </div>
            </body>
        </html>
    );
}
