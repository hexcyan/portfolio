import { IIcon } from "@/lib/consts";
import styles from "./FileLinks.module.css";
import Icon from "./Icon";

export default function FileLinks({ arr }: { arr: IIcon[] }) {
    return (
        <div className={styles.filelinks}>
            {arr.map((file, index) => {
                return (
                    <Icon
                        key={`${file.title}-${index}-icon`}
                        file={file}
                        index={index}
                    />
                );
            })}
        </div>
    );
}
