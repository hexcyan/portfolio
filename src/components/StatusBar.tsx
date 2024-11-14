"use client";
import { links, socials } from "./consts";
import Link from "next/link";
import Image from "next/image";

import styles from "./StatusBar.module.css";

export default function StatusBar() {
    return (
        <header className={styles.statusbar}>
            <Image src="/logo.svg" alt="logo" width={12} height={12} />
            <span className={styles.statusbar__title}>hexcyan</span>
            {links.map((link) => {
                return (
                    <Link key={link} href={`/${link}`}>
                        {link}
                    </Link>
                );
            })}

            <span className={styles.statusbar__right}>
                {socials.map((social) => {
                    return (
                        <a key={social.site} href={social.link}>
                            <Image
                                src={`/icons/${social.site}.svg`}
                                alt={social.site}
                                width={12}
                                height={12}
                            />
                        </a>
                    );
                })}
            </span>
        </header>
    );
}