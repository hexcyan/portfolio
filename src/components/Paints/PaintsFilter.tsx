import styles from "./Paints.module.css";

export default function PaintsFilter() {
    return (
        <div className={styles.paints__filter}>
            <p>Filter:</p>
            <p>Permanence</p>
            <p>Opacity</p>
            <p>Staining</p>
            <p>Granulating</p>
            <p>Pigments</p>
            <p>Series</p>
            <p>Color Family</p>
            <p>Sets</p>
            <p>Size</p>
            <p>Search</p>
        </div>
    );
}
