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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { useRouter } from "next/navigation";

interface AppUser {
    id: string;
    username: string;
    role: "SUPER_ADMIN" | "VIEW_ADMIN" | "EMPLOYEE";
    employeeId?: string | null;
    employee?: { name: string } | null;
    createdAt: string;
}

interface Employee {
    id: string;
    name: string;
}

const roleBadge = (role: string) => {
    if (role === "SUPER_ADMIN") return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    if (role === "VIEW_ADMIN") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-teal-500/10 text-teal-400 border-teal-500/20";
};

const roleLabel = (role: string) => {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "VIEW_ADMIN") return "View Admin";
    return "Employee";
};

export default function UsersPage() {
    const session = useSession();
    const router = useRouter();

    const [users, setUsers] = useState<AppUser[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AppUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "VIEW_ADMIN" as "SUPER_ADMIN" | "VIEW_ADMIN" | "EMPLOYEE",
        employeeId: "",
    });

    // Redirect non-SUPER_ADMIN users
    useEffect(() => {
        if (session && session.role !== "SUPER_ADMIN") {
            router.replace("/");
        }
    }, [session, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [usersRes, empsRes] = await Promise.all([
            fetch("/api/users").then((r) => r.json()),
            fetch("/api/employees?active=true").then((r) => r.json()),
        ]);
        setUsers(usersRes);
        setEmployees(empsRes);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (session?.role === "SUPER_ADMIN") fetchData();
    }, [session, fetchData]);

    const resetForm = () => {
        setFormData({ username: "", password: "", role: "VIEW_ADMIN", employeeId: "" });
        setEditing(null);
    };

    const handleEdit = (user: AppUser) => {
        setEditing(user);
        setFormData({ username: user.username, password: "", role: user.role, employeeId: user.employeeId || "" });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const body = {
            username: formData.username,
            password: formData.password || undefined,
            role: formData.role,
            employeeId: formData.role === "EMPLOYEE" ? formData.employeeId || null : null,
        };

        if (editing) {
            await fetch(`/api/users/${editing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        } else {
            await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        }

        await fetchData();
        setDialogOpen(false);
        resetForm();
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user?")) return;
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        await fetchData();
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-violet-400" />
                        User Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Manage system access and roles</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setDialogOpen(true); }}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editing ? "Edit User" : "Add New User"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Username</Label>
                            <Input
                                placeholder="john.doe"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={!!editing}
                                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">
                                Password {editing && <span className="text-slate-500">(leave blank to keep current)</span>}
                            </Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v: string | null) => setFormData({ ...formData, role: (v || "VIEW_ADMIN") as typeof formData.role })}
                            >
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-slate-800">
                                    <SelectItem value="SUPER_ADMIN">Super Admin — Full Access</SelectItem>
                                    <SelectItem value="VIEW_ADMIN">View Admin — Read Only</SelectItem>
                                    <SelectItem value="EMPLOYEE">Employee — Own Attendance Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.role === "EMPLOYEE" && (
                            <div className="space-y-2">
                                <Label className="text-slate-300">Link to Employee</Label>
                                <Select
                                    value={formData.employeeId}
                                    onValueChange={(v: string | null) => setFormData({ ...formData, employeeId: v || "" })}
                                >
                                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                        <SelectValue placeholder="Select employee..." />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-slate-800">
                                        {employees
                                            .filter((emp) => {
                                                // Only show employees not already linked to another user
                                                const alreadyLinked = users.find((u) => u.employeeId === emp.id && u.id !== editing?.id);
                                                return !alreadyLinked;
                                            })
                                            .map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.id} — {emp.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-500">Employee will only see their own attendance</p>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !formData.username || (!editing && !formData.password)}
                                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                            >
                                {saving ? "Saving..." : editing ? "Update" : "Add User"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Users Table */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white text-base">System Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Username</TableHead>
                                    <TableHead className="text-slate-400">Role</TableHead>
                                    <TableHead className="text-slate-400">Linked Employee</TableHead>
                                    <TableHead className="text-slate-400">Created</TableHead>
                                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : users.map((user) => (
                                    <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="text-white font-medium">{user.username}</TableCell>
                                        <TableCell>
                                            <Badge className={`border text-xs ${roleBadge(user.role)}`}>
                                                {roleLabel(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {user.employee ? `${user.employeeId} — ${user.employee.name}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString("en-IN")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(user)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(user.id)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
