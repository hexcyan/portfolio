"use client";

import { useState } from "react";
import PopupWindow from "@/components/PopupWindow";
import styles from "@/components/myButton.module.css";

export default function WorksConstructionPopup() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
        >
            <PopupWindow>
                <h3>Under Construction</h3>
                <p>This page is still under construction.</p>
                <div
                    className={styles.myButton}
                    onClick={() => setDismissed(true)}
                    style={{ cursor: "pointer" }}
                >
                    I Understand
                </div>
            </PopupWindow>
        </div>
    );
}
