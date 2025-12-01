import Link from "next/link";
import { IIcon } from "@/lib/consts";
import Image from "next/image";
import styles from "./FileLinks.module.css";
import Icon from "./Icon";

export default function FileLinks({ arr }: { arr: IIcon[] }) {
    return (
        <div className={styles.filelinks}>
            {arr.map((file, index) => {
                return <Icon file={file} index={index} />;
            })}
        </div>
    );
}
