"use client";
import { links, socials } from "@/lib/consts";
import Link from "next/link";
import Image from "next/image";

import styles from "./StatusBar.module.css";

export default function StatusBar() {
    return (
        <header className={styles.statusbar}>
            <Link href="/" className={styles.statusbar__logo}>
                <Image src="/logo.svg" alt="logo" width={16} height={16} />
                <span>hexcyan</span>
            </Link>

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
