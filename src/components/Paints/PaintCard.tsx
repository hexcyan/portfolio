import { Paint } from "@/lib/consts";
import styles from "./Paints.module.css";
import Image from "next/image";
import "./globals.css";

interface PaintCardProps {
    paint: Paint;
}

export default function PaintCard({ paint }: PaintCardProps) {
    const permanenceSymbol = "✻".repeat(paint.perm);
    const opacitySymbol = ["○", "⦶", "◐", "⬤"][paint.opacity];
    const stainingSymbol = ["☐", "◩", "◼"][paint.staining];

    return (
        <div className={styles.paint__card}>
            <Image
                src="/temp-color.png"
                height={176}
                width={388}
                alt="temp color"
                className={styles.paint__img}
                draggable={false}
            />
            <p>
                W{paint.code.toString().padStart(3, "0")} W
                {(paint.code + 200).toString()}
            </p>
            <p className={styles.paint__name}>{paint.en_name}</p>
            <p>{paint.jp_name}</p>
            <div className={styles.paint__properties}>
                <span title="Permanence">{permanenceSymbol}</span>
                <span title="Opacity">{opacitySymbol}</span>
                <span title="Staining">{stainingSymbol}</span>
                {paint.granulation && <span title="Granulating">G</span>}
                <div className={styles.series}>
                    Series{" "}
                    <span className={styles.seriesBox}>{paint.series}</span>
                </div>
            </div>
        </div>
    );
}
