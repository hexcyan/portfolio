import FileLinks from "@/components/FileLinks";
import styles from "./tools.module.css";
import { FileLink } from "@/lib/consts";

export default function ToolsPage() {
    const tools: FileLink[] = [
        {
            title: "QR Code Generator",
            route: "/tools/qr_generator",
            type: "contrast",
        },
    ];

    return (
        <div className={styles.toolsContainer}>
            <h1>Tools</h1>

            <div className={styles.toolsGrid}>
                <FileLinks arr={tools} />
            </div>
        </div>
    );
}
