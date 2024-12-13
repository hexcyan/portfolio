import DisplayLink from "./DisplayLink";
import { projects } from "@/lib/consts";
import styles from "./Projects.module.css";

export default function ProjectGallery() {
    return (
        <div className={styles.ProjectGallery}>
            {projects.map((project) => (
                <DisplayLink
                    key={project.title}
                    title={project.title}
                    href={project.href}
                    desc={project.desc}
                    img={project.img}
                />
            ))}
        </div>
    );
}
