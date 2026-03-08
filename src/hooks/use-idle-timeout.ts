"use client";

import { useEffect, useRef } from "react";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useIdleTimeout(isDisabled: boolean = false) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isDisabled) return;

        const handleLogout = async () => {
            try {
                await fetch("/api/auth", { method: "DELETE" });
                window.location.href = "/login?expired=true";
            } catch (error) {
                console.error("Logout failed", error);
                window.location.href = "/login";
            }
        };

        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(handleLogout, TIMEOUT_MS);
        };

        // Events that indicate user activity
        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart"
        ];

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [isDisabled]);
}
