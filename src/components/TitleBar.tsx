"use client";
import Image from "next/image";
import styles from "./Window.module.css";

function MinSvg() {
    return (
        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="22" height="21" fill="var(--titlebar-btn-bg)" stroke="currentColor" />
            <line x1="6" y1="16.5" x2="17" y2="16.5" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function MaxSvg() {
    return (
        <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="23" height="21" fill="var(--titlebar-btn-bg)" stroke="currentColor" />
            <rect x="7.5" y="6.5" width="9" height="9" stroke="currentColor" />
            <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function CloseSvg() {
    return (
        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="22" height="21" fill="var(--titlebar-close-bg, var(--box-bg))" stroke="currentColor" />
            <path d="M7 6L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.0001 6L7.00012 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

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
                <span className={styles.titlebar__btn}><MinSvg /></span>
                <span className={styles.titlebar__btn}><MaxSvg /></span>
                <span className={`${styles.titlebar__btn} ${styles.titlebar__btn_close}`}><CloseSvg /></span>
            </div>
        </div>
    );
}
