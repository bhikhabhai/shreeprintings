"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) setError("Invalid or missing reset link.");
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) { setError("Passwords do not match."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

        setLoading(true);
        setError("");

        const res = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });

        const data = await res.json();

        if (res.ok) {
            setUsername(data.username);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } else {
            setError(data.error || "Failed to reset password");
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/25">
                        <span className="text-2xl font-bold text-white">S</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Set New Password</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Shree Multipack — Attendance Management
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Password Updated!</h2>
                                <p className="text-slate-400 text-sm mt-2">
                                    Your password for <span className="text-white font-medium">{username}</span> has been changed. Redirecting to login...
                                </p>
                            </div>
                        </div>
                    ) : error && !token ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                                <XCircle className="h-7 w-7 text-rose-400" />
                            </div>
                            <p className="text-slate-400 text-sm">{error}</p>
                            <Button
                                onClick={() => router.push("/forgot-password")}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                            >
                                Request New Link
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-300">New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        required
                                        className="pr-10 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {password && (
                                    <p className={`text-xs ${password.length >= 6 ? "text-emerald-400" : "text-amber-400"}`}>
                                        {password.length >= 6 ? "✓ Strong enough" : `${6 - password.length} more characters needed`}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Confirm Password</Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirm}
                                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                                    required
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500"
                                />
                                {confirm && password !== confirm && (
                                    <p className="text-xs text-rose-400">Passwords do not match</p>
                                )}
                            </div>

                            {error && (
                                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || !password || !confirm}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 py-5"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
