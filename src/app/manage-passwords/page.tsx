"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { useRouter } from "next/navigation";

interface AppUser {
    id: string;
    username: string;
    role: "SUPER_ADMIN" | "VIEW_ADMIN" | "EMPLOYEE";
    employeeId?: string | null;
    employee?: { name: string } | null;
}

const roleBadge = (role: string) => {
    if (role === "SUPER_ADMIN") return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    if (role === "VIEW_ADMIN") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-teal-500/10 text-teal-400 border-teal-500/20";
};

const roleLabel = (role: string) => {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "VIEW_ADMIN") return "Admin";
    return "Employee";
};

export default function ManagePasswordsPage() {
    const session = useSession();
    const router = useRouter();

    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (session && session.role !== "SUPER_ADMIN") {
            router.replace("/");
        }
    }, [session, router]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (session?.role === "SUPER_ADMIN") fetchUsers();
    }, [session, fetchUsers]);

    const openDialog = (user: AppUser) => {
        setSelectedUser(user);
        setNewPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setErrorMsg("");
        setSuccessMsg("");
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        if (!newPassword) { setErrorMsg("Password cannot be empty."); return; }
        if (newPassword !== confirmPassword) { setErrorMsg("Passwords do not match."); return; }
        if (newPassword.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }

        setSaving(true);
        setErrorMsg("");
        const res = await fetch(`/api/users/${selectedUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        });

        if (res.ok) {
            setSuccessMsg(`Password updated for ${selectedUser.username}`);
            setTimeout(() => setDialogOpen(false), 1500);
        } else {
            const data = await res.json();
            setErrorMsg(data.error || "Failed to update password");
        }
        setSaving(false);
    };

    if (!session || session.role !== "SUPER_ADMIN") {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <KeyRound className="h-6 w-6 text-violet-400" />
                    Manage Passwords
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Reset passwords for any admin or employee user
                </p>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-violet-400" />
                            Change Password
                        </DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-4 pt-2">
                            {/* User info */}
                            <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 flex items-center gap-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-sm">
                                    {selectedUser.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{selectedUser.username}</p>
                                    <p className="text-slate-400 text-xs">{roleLabel(selectedUser.role)}</p>
                                </div>
                            </div>

                            {/* New password */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(""); }}
                                        className="border-white/10 bg-white/5 text-white pr-10 placeholder:text-slate-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Confirm Password</Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>

                            {/* Strength hint */}
                            {newPassword && (
                                <p className={`text-xs ${newPassword.length >= 6 ? "text-emerald-400" : "text-amber-400"}`}>
                                    {newPassword.length >= 6 ? "✓ Strong enough" : `${6 - newPassword.length} more characters needed`}
                                </p>
                            )}

                            {/* Error */}
                            {errorMsg && (
                                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                                    {errorMsg}
                                </p>
                            )}

                            {/* Success */}
                            {successMsg && (
                                <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {successMsg}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !newPassword || !confirmPassword}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                                >
                                    {saving ? "Saving..." : "Update Password"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Users Table */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white text-base">All Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Username</TableHead>
                                    <TableHead className="text-slate-400">Role</TableHead>
                                    <TableHead className="text-slate-400">Linked To</TableHead>
                                    <TableHead className="text-right text-slate-400">Password</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                                            <div className="flex justify-center">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : users.map((user) => (
                                    <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-white font-bold text-xs shrink-0">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-white font-medium">{user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border text-xs ${roleBadge(user.role)}`}>
                                                {roleLabel(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {user.employee
                                                ? `${user.employeeId} — ${user.employee.name}`
                                                : <span className="text-slate-600">—</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openDialog(user)}
                                                className="gap-2 text-slate-400 hover:text-white hover:bg-white/10 text-xs"
                                            >
                                                <KeyRound className="h-3.5 w-3.5" />
                                                Change
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
