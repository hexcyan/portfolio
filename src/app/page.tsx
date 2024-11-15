import styles from "./page.module.css";
import Window from "@/components/Window";
import FileLinks from "@/components/FileLinks";
import ButtonsBox from "@/components/ButtonsBox";

export default function Home({
    children,
}: Readonly<{ children: React.ReactNode }>) {
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
