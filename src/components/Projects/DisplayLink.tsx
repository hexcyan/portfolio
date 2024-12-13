import { useRef, useState } from "react";
import styles from "./Projects.module.css";
import { ProjectLink } from "@/lib/consts";
import Image from "next/image";

export default function DisplayLink({ title, href, desc, img }: ProjectLink) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [shine, setShine] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation based on mouse position relative to card center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Max rotation angle in degrees
        const maxRotation = 20;

        // Calculate rotation angles
        const rotationY = ((x - centerX) / centerX) * maxRotation;
        const rotationX = ((centerY - y) / centerY) * maxRotation;

        // Calculate shine position (normalized coordinates)
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;

        setRotation({ x: rotationX, y: rotationY });
        setShine({ x: shineX, y: shineY });
    };

    return (
        <div
            ref={cardRef}
            className={styles.Card}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setRotation({ x: 0, y: 0 });
                setShine({ x: 50, y: 50 });
            }}
            style={{
                transform: isHovered
                    ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                    : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                transition:
                    "transform 0.3s ease-out, box-shadow 0.35s ease-out",
            }}
        >
            <div
                className={styles.Card__shine}
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0) 60%)`,
                }}
            />
            <div className={styles.project}>
                <a
                    target="_blank"
                    key={`${title}-0`}
                    href={href[0]}
                    rel="noopener noreferrer"
                >
                    <div>
                        <Image
                            src={img}
                            alt={title}
                            width={142}
                            height={142}
                            className={styles.project__img}
                        />
                        <div className={styles.project__desc}>
                            <h3>{title}</h3>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
}
