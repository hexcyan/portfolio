"use client";

import { useEffect } from "react";
import { setWindowMaximized } from "@/lib/windowState";

/** Opens the window maximised while this page is shown (posts with `wide: true`). */
export default function OpenMaximized() {
    useEffect(() => {
        setWindowMaximized(true);
        return () => setWindowMaximized(false);
    }, []);
    return null;
}
