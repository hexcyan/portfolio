import Link from "next/link";
import styles from "./Window.module.css";

interface MyButtonProps {
    text: string;
    path: string;
}

export default function MyButton({ text, path }: MyButtonProps) {
    return (
        <Link href={path}>
            <div className={styles.myButton}>{text}</div>
        </Link>
    );
}
