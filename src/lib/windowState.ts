"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the main window is maximised (covering the sidebar). Stored as a
 * `data-window-maximized` attribute on <html>, so the layout CSS can react to it
 * and any component can read or change it.
 */
const ATTR = "data-window-maximized";

export function setWindowMaximized(on: boolean) {
    if (on) document.documentElement.setAttribute(ATTR, "");
    else document.documentElement.removeAttribute(ATTR);
}

function subscribe(onChange: () => void) {
    const mo = new MutationObserver(onChange);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: [ATTR] });
    return () => mo.disconnect();
}

export function useWindowMaximized() {
    return useSyncExternalStore(
        subscribe,
        () => document.documentElement.hasAttribute(ATTR),
        () => false,
    );
}
