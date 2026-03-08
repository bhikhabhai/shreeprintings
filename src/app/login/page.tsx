"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                setError("Invalid username or password");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            {/* Decorative background elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-2xl" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo & Brand */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/30">
                        <span className="text-2xl font-bold text-white">S</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Shree Multipack
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Attendance Management System
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                            <Lock className="h-6 w-6 text-violet-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Admin Login</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Sign in to access the admin panel
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm text-slate-300">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm text-slate-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !username || !password}
                            className="h-11 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </div>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Shree Multipack. All rights reserved.
                </p>
            </div>
        </div>
    );
}
