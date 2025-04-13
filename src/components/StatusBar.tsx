"use client";
import { useState } from "react";
import { links, socials } from "@/lib/consts";
import Link from "next/link";
import Image from "next/image";

import styles from "./StatusBar.module.css";

export default function StatusBar() {
    const [isOpen, setIsOpen] = useState(false);

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
                className={`${styles.statusbar__links} ${
                    isOpen ? styles.open : ""
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

            <span className={styles.statusbar__right}>
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
            </span>
        </header>
    );
}
