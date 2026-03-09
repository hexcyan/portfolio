import { getSiteTools } from "@/lib/site-metadata";
import ToolsClient from "./ToolsClient";

// ISR: serve static, revalidate in background every hour
export const revalidate = 3600;

export default async function ToolsPage() {
    const { tools, projects } = await getSiteTools();

    return <ToolsClient tools={tools} projects={projects} />;
}
