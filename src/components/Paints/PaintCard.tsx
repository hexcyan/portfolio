"use client";

import { Paint } from "@/lib/consts";
import styles from "./Paints.module.css";
import Image from "next/image";
import { getCDNConfig } from "@/lib/cdn";
import "./globals.css";

interface PaintCardProps {
    paint: Paint;
}

export default function PaintCard({ paint }: PaintCardProps) {
    const permanenceSymbol = "✻".repeat(paint.perm);
    const opacitySymbol = ["○", "⦶", "◐", "⬤"][paint.opacity];
    const stainingSymbol = ["☐", "◩", "◼"][paint.staining];

    const paintCode = paint.code.toString().padStart(3, "0");
    const { pullZone } = getCDNConfig();
    if (!pullZone) return null;

    const imgUrl = `${pullZone}/paints/hb/${paint.code}.jpg?quality=45`;

    return (
        <div className={styles.paint__card}>
            <Image
                src={imgUrl}
                height={176}
                width={388}
                alt={paint.en_name}
                className={styles.paint__img}
                draggable={false}
            />
            <p>
                W{paintCode} W
                {/* Special condition for the "White" paint W002*/}
                {/* If the paint code is 2, the code below should be "W201" instead of "W002" */}
                {paint.code == 2 ? "201" : paint.code + 200}{" "}
                {paint.size[2] != 0 && `WW${paintCode}`}
            </p>
            <p className={styles.paint__name}>{paint.en_name}</p>
            <p>{paint.fr_name}</p>
            <p>{paint.jp_name}</p>

            <div className={styles.paint__properties}>
                <span title="Permanence">{permanenceSymbol}</span>
                <span title="Opacity">{opacitySymbol}</span>
                <span title="Staining">{stainingSymbol}</span>
                {paint.granulation && <span title="Granulating">G</span>}

                <div className={styles.series}>
                    {/* Pigments:  */}
                    <span>{paint.pigments}</span>
                </div>
                <div className={styles.series}>
                    Series{" "}
                    <span className={styles.seriesBox}>{paint.series}</span>
                </div>
            </div>
        </div>
    );
}
