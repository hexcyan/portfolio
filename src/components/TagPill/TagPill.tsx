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

    // Compute inline color overrides
    let colorStyle: React.CSSProperties = {};
    if (color) {
        if (isButton && !active) {
            // Interactive, inactive: dimmed border hint
            colorStyle = { borderColor: `${color}66` };
        } else if (isButton && active) {
            // Interactive, active: full accent
            colorStyle = { borderColor: color, background: `${color}33` };
        } else {
            // Display-only: show the color
            colorStyle = { borderColor: color, color };
        }
    }

    const cls = [
        styles.tag,
        styles[size],
        isButton && styles.interactive,
        active && styles.active,
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
