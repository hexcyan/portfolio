import Link from "next/link";
import { IIcon } from "@/lib/consts";
import Image from "next/image";
import styles from "./FileLinks.module.css";

interface IconProps {
    file: IIcon;
    index: number;
    center?: boolean;
}

export default function Icon({ file, center }: IconProps) {
    return (
        <div className={`${styles.filelink} ${center && styles.center}`}>
            {/* render icon based on file type */}
            <Link
                href={file.route}
                target={
                    file.route?.startsWith("https://") ? "_blank" : undefined
                }
                rel={
                    file.route?.startsWith("https://")
                        ? "noopener noreferrer"
                        : undefined
                }
            >
                <Image
                    src={`/assets/${file.type}.png`}
                    alt={file.title}
                    width={48}
                    height={48}
                />
                <p className={styles.filelink__filename}>{file.title}</p>
            </Link>
        </div>
    );
}
