import FileLinks from "@/components/FileLinks";
import { FileLink } from "@/lib/consts";

export default function ToolsPage() {
    const tools: FileLink[] = [
        {
            title: "QR Code Generator",
            route: "/tools/qr_generator",
            type: "contrast",
        },
        {
            title: "Holbein Paints Explorer",
            route: "/paints",
            type: "paints",
        },
    ];

    return (
        <div className="explorer">
            <h1>Tools</h1>

            <div>
                <FileLinks arr={tools} />
            </div>
        </div>
    );
}
