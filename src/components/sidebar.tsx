"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileBarChart,
    FileSpreadsheet,
    LogOut,
    X,
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Employees",
        href: "/employees",
        icon: Users,
    },
    {
        label: "Attendance",
        href: "/attendance",
        icon: CalendarCheck,
    },
    {
        label: "Reports",
        href: "/reports",
        icon: FileBarChart,
    },
    {
        label: "Import Data",
        href: "/import",
        icon: FileSpreadsheet,
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "DELETE" });
        window.location.href = "/login";
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo / Brand */}
                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                            <span className="text-lg font-bold text-white">S</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white">
                                Shree Printings
                            </h1>
                            <p className="text-[11px] font-medium text-slate-400">
                                Attendance Manager
                            </p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    <ul className="space-y-1.5">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => {
                                            // Close sidebar on mobile when navigating
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white shadow-lg shadow-violet-500/10 border border-violet-500/20"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 transition-colors ${isActive
                                                ? "text-violet-400"
                                                : "text-slate-500 group-hover:text-slate-300"
                                                }`}
                                        />
                                        {item.label}
                                        {isActive && (
                                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-8 left-0 right-0 px-6 space-y-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>

                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                        <p className="text-xs font-medium text-slate-400">Admin Panel</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            v1.0 — Attendance Mgmt
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
