import styles from "./Spinner.module.css";

interface SpinnerProps {
    size?: number;
    className?: string;
}

export default function Spinner({ size, className }: SpinnerProps) {
    return (
        <div
            className={`${styles.spinner} ${className ?? ""}`}
            style={size ? { width: size, height: size } : undefined}
        />
    );
}
