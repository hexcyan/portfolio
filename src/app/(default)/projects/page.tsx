"use client";
import ProjectGallery from "@/components/Projects/ProjectGallery";
import styles from "../blog/page.module.css";

export default function Projects() {
    return (
        <>
            <h1 className={styles.blogTitle}>Projects</h1>
            <ProjectGallery />
        </>
    );
}
