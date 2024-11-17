import FileLinks from "@/components/FileLinks";
import { projects } from "@/lib/consts";
export default function Projects() {
    return <FileLinks arr={projects} />;
}
