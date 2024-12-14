import PaintCard from "./PaintCard";
import { hbPaints } from "@/lib/paints";
import styles from "./Paints.module.css";
import PaintsFilter from "./PaintsFilter";

export default function PaintsGallery() {
    return (
        <>
            <PaintsFilter />
            <div className={styles.paints__gallery}>
                {hbPaints.map((paint) => (
                    <PaintCard key={paint.code} paint={paint} />
                ))}
            </div>
        </>
    );
}
