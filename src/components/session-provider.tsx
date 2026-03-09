"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "SUPER_ADMIN" | "VIEW_ADMIN" | "EMPLOYEE";

interface Session {
    userId: string;
    username: string;
    role: Role;
    employeeId?: string | null;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        fetch("/api/auth")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) setSession(data);
            });
    }, []);

    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}
