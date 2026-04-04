import styles from "./TagPill.module.css";

export type TagPillSize = "xs" | "sm" | "md" | "lg";

interface TagPillProps {
    children: React.ReactNode;
    size?: TagPillSize;
    color?: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export default function TagPill({
    children,
    size = "md",
    color,
    active,
    onClick,
    className,
    style,
}: TagPillProps) {
    const isButton = !!onClick;
    const Tag = isButton ? "button" : "span";

    // Set --tag-color as CSS var so color-mix in stylesheet handles all states
    const colorStyle: React.CSSProperties = color
        ? ({ "--tag-color": color } as React.CSSProperties)
        : {};

    const cls = [
        styles.tag,
        styles[size],
        isButton && styles.interactive,
        active && styles.active,
        color && styles.hasColor,
        color && !isButton && styles.displayColor,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Tag
            className={cls}
            onClick={onClick}
            style={{ ...colorStyle, ...style }}
        >
            {children}
        </Tag>
    );
}

/* ── Clear All button (companion, not a tag pill) ── */

interface TagClearProps {
    onClick: () => void;
    className?: string;
}

export function TagClear({ onClick, className }: TagClearProps) {
    return (
        <button
            className={`${styles.clear} ${className ?? ""}`}
            onClick={onClick}
        >
            clear all
        </button>
    );
}
