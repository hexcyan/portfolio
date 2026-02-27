"use client";

import { useEffect, useRef } from "react";

interface StickyHeaderProps {
    className: string;
    stuckClass: string;
    children: React.ReactNode;
}

export default function StickyHeader({
    className,
    stuckClass,
    children,
}: StickyHeaderProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        const header = headerRef.current;
        if (!sentinel || !header) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When sentinel is not visible, header is stuck
                header.classList.toggle(stuckClass, !entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [stuckClass]);

    return (
        <>
            <div ref={sentinelRef} aria-hidden="true" style={{ height: 0 }} />
            <div ref={headerRef} className={className}>
                {children}
            </div>
        </>
    );
}
