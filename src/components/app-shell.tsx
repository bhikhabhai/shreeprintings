"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="ml-64 flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
