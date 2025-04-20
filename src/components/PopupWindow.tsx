import { ReactNode } from "react";
import TitleBar from "./TitleBar";
import styles from "./Window.module.css";
import Image from "next/image";
interface WindowProps {
    children: ReactNode;
}

export default function PopupWindow({ children }: WindowProps) {
    return (
        <div className={styles.popupWindow}>
            <TitleBar />

            <article
                className={styles.contentBox}
                style={{
                    paddingBottom: 48,
                }}
            >
                <Image
                    src="/assets/alert.png"
                    alt="Alert"
                    width={48}
                    height={48}
                    style={{
                        marginTop: 24,
                    }}
                />
                <div>{children}</div>
            </article>
        </div>
    );
}
