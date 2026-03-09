"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            setSent(true);
        } else {
            const data = await res.json();
            setError(data.error || "Something went wrong");
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
                    <h1 className="text-2xl font-bold tracking-tight text-white">Forgot Password?</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your email and we&apos;ll send a reset link
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Email Sent!</h2>
                                <p className="text-slate-400 text-sm mt-2">
                                    If <span className="text-white">{email}</span> is registered, you&apos;ll receive a reset link within a minute.
                                </p>
                                <p className="text-slate-500 text-xs mt-3">Check your spam folder if you don&apos;t see it.</p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 py-5"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
