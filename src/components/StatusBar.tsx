"use client";
import { useEffect, useState } from "react";
import { links, socials } from "@/lib/consts";
import Link from "next/link";
import Image from "next/image";

import styles from "./StatusBar.module.css";

const THEMES = [
    "cyan",
    "xp",
    "dark",
    "parchment"
] as const;
type Theme = (typeof THEMES)[number];

const THEME_ACCENT: Record<Theme, string> = {
    cyan: "#00ffff",
    xp: "#5aadf5",
    dark: "#00ffff",
    parchment: "#958672",
};

const THEME_LABEL: Record<Theme, string> = {
    cyan: "Cyan",
    xp: "XP Luna",
    dark: "Dark",
    parchment: "Parchment",
};

export default function StatusBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>("cyan");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        const initial = saved && THEMES.includes(saved) ? saved : "cyan";
        if (initial !== "cyan") {
            setTheme(initial);
            document.documentElement.setAttribute("data-theme", initial);
        }
    }, []);

    function cycleTheme() {
        const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
        setTheme(next);
        if (next === "cyan") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", next);
        }
        localStorage.setItem("theme", next);
    }

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className={styles.statusbar}>
            <Link href="/" className={styles.statusbar__logo}>
                <Image src="/logo.svg" alt="logo" width={16} height={16} />
                <span>hexcyan</span>
            </Link>

            <button
                className={styles.dropdown__button}
                onClick={toggleDropdown}
                aria-label="Toggle navigation menu"
            >
                ☰ Menu
            </button>

            <div
                className={`${styles.statusbar__links} ${isOpen ? styles.open : ""
                    }`}
            >
                {links.map((link) => {
                    return (
                        <Link
                            key={link}
                            href={`/${link}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link}
                        </Link>
                    );
                })}
            </div>

            <span className={styles.socials}>
                {socials.map((social) => {
                    return (
                        <a
                            target="_blank"
                            key={social.site}
                            href={social.link}
                            rel="noopener noreferrer"
                        >
                            <Image
                                src={`/icons/${social.site}.svg`}
                                alt={social.site}
                                width={16}
                                height={16}
                            />
                        </a>
                    );
                })}
                <button
                    onClick={cycleTheme}
                    className={styles.themeButton}
                    title={`Theme: ${THEME_LABEL[theme]} — click to cycle`}
                    style={{ "--theme-accent": THEME_ACCENT[theme] } as React.CSSProperties}
                />
            </span>
        </header>
    );
}
