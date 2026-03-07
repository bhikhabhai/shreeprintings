"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";

interface Employee {
    id: string;
    name: string;
    shift: string;
    hourlyRate: number;
    isActive: boolean;
    createdAt: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        shift: "Day",
        hourlyRate: "",
    });
    const [saving, setSaving] = useState(false);

    const fetchEmployees = useCallback(async () => {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const resetForm = () => {
        setFormData({ id: "", name: "", shift: "Day", hourlyRate: "" });
        setEditing(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setDialogOpen(true);
    };

    const handleOpenEdit = (emp: Employee) => {
        setEditing(emp);
        setFormData({
            id: emp.id,
            name: emp.name,
            shift: emp.shift,
            hourlyRate: emp.hourlyRate.toString(),
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await fetch(`/api/employees/${editing.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        shift: formData.shift,
                        hourlyRate: formData.hourlyRate,
                    }),
                });
            } else {
                await fetch("/api/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }
            await fetchEmployees();
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving employee:", error);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this employee?")) return;
        await fetch(`/api/employees/${id}`, { method: "DELETE" });
        await fetchEmployees();
    };

    const handleReactivate = async (id: string) => {
        await fetch(`/api/employees/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: true }),
        });
        await fetchEmployees();
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    const activeEmployees = employees.filter((e) => e.isActive);
    const inactiveEmployees = employees.filter((e) => !e.isActive);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Employees
                    </h1>
                    <p className="mt-1 text-slate-400">
                        Manage your workforce — {activeEmployees.length} active,{" "}
                        {inactiveEmployees.length} inactive
                    </p>
                </div>

                <Button
                    onClick={handleOpenAdd}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                {editing ? "Edit Employee" : "Add New Employee"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="emp-id" className="text-slate-300">
                                    Employee ID
                                </Label>
                                <Input
                                    id="emp-id"
                                    placeholder="E001"
                                    value={formData.id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, id: e.target.value })
                                    }
                                    disabled={!!editing}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emp-name" className="text-slate-300">
                                    Full Name
                                </Label>
                                <Input
                                    id="emp-name"
                                    placeholder="John Smith"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emp-shift" className="text-slate-300">
                                    Shift
                                </Label>
                                <Select
                                    value={formData.shift}
                                    onValueChange={(val: string | null) =>
                                        setFormData({ ...formData, shift: val || "Day" })
                                    }
                                >
                                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-slate-800">
                                        <SelectItem value="Day">Day</SelectItem>
                                        <SelectItem value="Night">Night</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emp-rate" className="text-slate-300">
                                    Hourly Rate (₹)
                                </Label>
                                <Input
                                    id="emp-rate"
                                    type="number"
                                    placeholder="150"
                                    value={formData.hourlyRate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, hourlyRate: e.target.value })
                                    }
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
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
                                    disabled={
                                        saving ||
                                        !formData.id ||
                                        !formData.name ||
                                        !formData.hourlyRate
                                    }
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                                >
                                    {saving ? "Saving..." : editing ? "Update" : "Add Employee"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Employees Table */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-violet-400" />
                        Active Employees
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeEmployees.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <UserPlus className="mx-auto mb-3 h-12 w-12 text-slate-600" />
                            <p className="text-lg font-medium">No employees added yet</p>
                            <p className="text-sm">
                                Click &quot;Add Employee&quot; to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-auto rounded-lg border border-white/5">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-slate-400">ID</TableHead>
                                        <TableHead className="text-slate-400">Name</TableHead>
                                        <TableHead className="text-slate-400">Shift</TableHead>
                                        <TableHead className="text-slate-400">
                                            Hourly Rate
                                        </TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-right text-slate-400">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeEmployees.map((emp) => (
                                        <TableRow
                                            key={emp.id}
                                            className="border-white/5 hover:bg-white/5"
                                        >
                                            <TableCell className="font-mono text-sm text-slate-300">
                                                {emp.id}
                                            </TableCell>
                                            <TableCell className="font-medium text-white">
                                                {emp.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        emp.shift === "Day"
                                                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                                            : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                                                    }
                                                >
                                                    {emp.shift}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-slate-300">
                                                ₹{emp.hourlyRate}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                >
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(emp)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(emp.id)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
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
                    )}
                </CardContent>
            </Card>

            {/* Inactive Employees */}
            {inactiveEmployees.length > 0 && (
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-400">
                            Inactive Employees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto rounded-lg border border-white/5">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-slate-400">ID</TableHead>
                                        <TableHead className="text-slate-400">Name</TableHead>
                                        <TableHead className="text-slate-400">Shift</TableHead>
                                        <TableHead className="text-right text-slate-400">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inactiveEmployees.map((emp) => (
                                        <TableRow
                                            key={emp.id}
                                            className="border-white/5 opacity-60 hover:bg-white/5"
                                        >
                                            <TableCell className="font-mono text-sm text-slate-400">
                                                {emp.id}
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {emp.name}
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {emp.shift}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReactivate(emp.id)}
                                                    className="text-sm text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
                                                >
                                                    Reactivate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
