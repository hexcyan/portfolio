import { ReactNode } from "react";
import styles from "./Card.module.css";

export default function Card({ children }: { children: ReactNode }) {
    return <div className={styles.Card}>{children}</div>;
}
