"use client";
import Image from "next/image";
import styles from "./Window.module.css";

export default function TitleBar() {
    return (
        <div className={styles.titlebar}>
            <Image
                src="/assets/daniel_happy.png"
                alt="daniel_happy"
                className={styles.titleThing}
                width={24}
                height={24}
                draggable={false}
            />
            <p className={styles.titleThing}>lets go gamers</p>
            <div className={`${styles.titlebar__buttons} ${styles.titleThing}`}>
                <Image
                    draggable={false}
                    className={styles.titlebar__button}
                    src="/assets/min.png"
                    alt="min"
                    width={18}
                    height={18}
                />
                <Image
                    draggable={false}
                    className={styles.titlebar__button}
                    src="/assets/max.png"
                    alt="max"
                    width={18}
                    height={18}
                />
                <Image
                    draggable={false}
                    className={styles.titlebar__button}
                    src="/assets/close.png"
                    alt="close"
                    width={18}
                    height={18}
                />
            </div>
        </div>
    );
}
