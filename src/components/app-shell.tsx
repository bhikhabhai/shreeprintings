"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Menu } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex h-16 items-center justify-between border-b border-white/10 bg-slate-950 px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
                            <span className="text-sm font-bold text-white">S</span>
                        </div>
                        <span className="font-bold tracking-tight text-white">Shree Printings</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
