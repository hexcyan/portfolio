import Icon from "@/components/Icon";
import { IIcon, projects } from "@/lib/consts";
import styles from "./Tools.module.css";

export default function ToolsPage() {
    const tools: IIcon[] = [
        {
            title: "QR Code Generator",
            route: "/tools/qr_generator",
            type: "contrast",
            descr: "Simple, no-frills, no-ads QR Code generator with transparency and logos",
        },
        {
            title: "Holbein Paints Explorer",
            route: "/paints",
            type: "paints",
            descr: "View the collection of Holbein Paints Watercolor",
        },
    ];

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
                            <Icon file={file} index={index} />
                            <div className={styles.hoverLabel}>
                                {file.descr}
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
                                {file.descr}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
