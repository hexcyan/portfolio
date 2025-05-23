import Link from "next/link";
import { FileLink } from "@/lib/consts";
import Image from "next/image";
import styles from "./FileLinks.module.css";

export default function FileLinks({ arr }: { arr: FileLink[] }) {
    return (
        <div className={styles.filelinks}>
            {arr.map((file, index) => {
                return (
                    <div
                        key={`${file.title}-${index}`}
                        className={styles.filelink}
                    >
                        {/* render icon based on file type */}
                        <Link href={file.route}>
                            <Image
                                src={`/assets/${file.type}.png`}
                                alt={file.title}
                                width={48}
                                height={48}
                            />
                            <p className={styles.filelink__filename}>
                                {file.title}
                            </p>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
