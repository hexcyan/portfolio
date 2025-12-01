import Icon from "@/components/Icon";
import { projects, tools } from "@/lib/consts";
import styles from "./Tools.module.css";

export default function ToolsPage() {
    return (
        <div className="explorer narrow">
            <h1>Tools</h1>

            <div>
                {tools.map((file, index) => {
                    return (
                        <div
                            key={`${file.title}-${index}`}
                            className={styles.projectRow}
                        >
                            <Icon file={file} index={index} center={true} />
                            <div className={styles.hoverLabel}>
                                {file.descr?.split("\n").map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <h1>Projects</h1>
            <div>
                {projects.map((file, index) => {
                    return (
                        <div
                            key={`${file.title}-${index}`}
                            className={styles.projectRow}
                        >
                            <Icon file={file} index={index} />
                            <div className={styles.hoverLabel}>
                                {file.descr?.split("\n").map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
