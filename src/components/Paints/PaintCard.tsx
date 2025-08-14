"use client";

import { Paint, paintSymbols } from "@/lib/paints";
import styles from "./Paints.module.css";
import Image from "next/image";
import "./globals.css";

interface PaintCardProps {
    paint: Paint;
}

export default function PaintCard({ paint }: PaintCardProps) {
    const permanenceSymbol = "✻".repeat(paint.perm);
    const opacitySymbol = paintSymbols.opacity[paint.opacity];
    const stainingSymbol = paintSymbols.staining[paint.staining];
    const paintCode = paint.code.toString().padStart(3, "0");

    const imgUrl = `https://x65535.b-cdn.net/paints/hb/${paint.code}.jpg?quality=45`;

    return (
        <div>
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
                        Series{" "}
                        <span className={styles.seriesBox}>{paint.series}</span>
                    </div>
                </div>
            </div>
            <div className={styles.paint__card} style={{ borderTop: 0 }}>
                <div className={styles.paint__pigments}>
                    {paint.pigments.map((pigment) => (
                        <span key={pigment}>{pigment}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
