"use client";

import { Paint, paintSymbols, stockSizeLabels, Bit } from "@/lib/paints";
import styles from "./Paints.module.css";
import Image from "next/image";
import "./globals.css";

interface PaintCardProps {
    paint: Paint;
    inStock?: boolean;
    stockSizes?: [Bit, Bit, Bit, Bit];
}

export default function PaintCard({ paint, inStock, stockSizes }: PaintCardProps) {
    const permanenceSymbol = "✻".repeat(paint.perm);
    const opacitySymbol = paintSymbols.opacity[paint.opacity];
    const stainingSymbol = paintSymbols.staining[paint.staining];
    const paintCode = paint.code.toString().padStart(3, "0");

    const imgUrl = `https://x65535.b-cdn.net/paints/hb/${paint.code}.jpg`;

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
            <p className={styles.paint__codes}>
                W{paintCode} W
                {/* Special condition for the "White" paint W002*/}
                {/* If the paint code is 2, the code below should be "W201" instead of "W002" */}
                {paint.code == 2 ? "201" : paint.code + 200}{" "}
                {paint.size[2] != 0 && `WW${paintCode}`}
                {inStock && <span className={styles.stockDot} />}
            </p>
            {stockSizes && (
                <span className={styles.stockSizes}>
                    {stockSizeLabels
                        .filter((_, i) => stockSizes[i])
                        .join(" ")}
                </span>
            )}
            <p className={styles.paint__name}>
                {paint.en_name}
            </p>
            <p>{paint.fr_name}</p>
            <p className={styles.jp_name}>{paint.jp_name}</p>

            <div className={styles.paint__properties}>
                <span title="Permanence">{permanenceSymbol}</span>
                <span title="Opacity">{opacitySymbol}</span>
                <span title="Staining">{stainingSymbol}</span>
                {paint.granulation && <span title="Granulating">G</span>}

                <div className={styles.pigments}>
                    {/* Pigments:  */}
                    {paint.pigments.map((pig) => (
                        <span key={pig}>{pig}</span>
                    ))}
                </div>
                <div className={styles.series}>
                    Series{" "}
                    <span className={styles.seriesBox}>{paint.series}</span>
                </div>
            </div>
        </div>
    );
}
