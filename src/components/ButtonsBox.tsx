import Card from "./Card";
import path from "path";
import fs from "fs/promises";
import Image from "next/image";
import styles from "./ButtonsBox.module.css";
// Generate a box with buttons from /public/buttons
async function getButtonFiles() {
    const buttonsDir = path.join(process.cwd(), "public", "buttons");
    try {
        const files = await fs.readdir(buttonsDir);
        return files;
    } catch (error) {
        console.error("Error reading buttons directory:", error);
        return [];
    }
}

export default async function ButtonsBox() {
    const buttonFiles = await getButtonFiles();
    return (
        <>
            <Image
                src="/assets/lain-bear.png"
                alt="lain bear"
                width={100}
                height={100}
                className={styles.buttons__lain}
            />
            <Card>
                <h3 className={styles.buttons__title}>Buttons</h3>
                <div className={styles.buttons}>
                    {buttonFiles.map((file) => {
                        return (
                            <img
                                key={file}
                                src={`/buttons/${file}`}
                                alt={file}
                                width={88}
                                height={33}
                            />
                        );
                    })}
                </div>
            </Card>
        </>
    );
}
