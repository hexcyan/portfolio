import styles from "./Paints.module.css";
import { paintSymbols } from "@/lib/paints";

export default function PaintsFilter() {
    return (
        <div className={styles.paints__filter}>
            <p>Filter:</p>
            <p>Permanence: ≤ = ≥ ✻✻✻✻</p>
            <p>Opacity: ≤ = ≥ {paintSymbols.opacity}</p>
            <p>Staining: ≤ = ≥ {paintSymbols.staining}</p>
            {/* Replace with 3 state checkbox: yes, no, idc */}
            <p>Granulating</p> <input type="checkbox"></input>
            <p>Series A B C D</p>
            <p>Size: 5ml 15ml 60ml</p>
            {/* Dropdowns */}
            <p>Color ▼</p>
            <p>Sets ▼</p>
            <input type="text" placeholder="Search.."></input>
        </div>
    );
}
