"use client";
import { ReactNode } from "react";
import TitleBar from "./TitleBar";
import styles from "./Window.module.css";
interface WindowProps {
    children: ReactNode;
}

export default function Window({ children }: WindowProps) {
    return (
        <div className={styles.sideWindow}>
            <TitleBar />

            <article className={styles.contentBox}>
                <div className={styles.prose}>{children}</div>
            </article>

            <footer className={styles.titlebar}>
                <p>made with 🤍</p>
            </footer>
        </div>
    );
}
