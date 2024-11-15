import type { Metadata } from "next";
import "../globals.css";
import StatusBar from "@/components/StatusBar";
import styles from "../page.module.css";
import Window from "@/components/Window";
import FileLinks from "@/components/FileLinks";
import ButtonsBox from "@/components/ButtonsBox";

export const metadata: Metadata = {
    title: "hexcyan",
    description: "portfolio",
};

function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.desktop}>
            <div className={styles.desktop__sidebar}>
                <div className={styles.desktop__files}>
                    <FileLinks />
                </div>
                <div>
                    <ButtonsBox />
                </div>
            </div>
            <Window>{children}</Window>
        </div>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <StatusBar />
                {/* {children} */}
                <DefaultLayout>{children}</DefaultLayout>
            </body>
        </html>
    );
}
