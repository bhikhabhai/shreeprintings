"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CalendarCheck, Save, ChevronLeft, ChevronRight } from "lucide-react";
import {
    calculateWorkHours,
    deriveStatus,
    formatHours,
} from "@/lib/calculations";

interface Employee {
    id: string;
    name: string;
    shift: string;
    hourlyRate: number;
    isActive: boolean;
}

interface AttendanceEntry {
    employeeId: string;
    inTime: string;
    outTime: string;
}

interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string;
    inTime: string | null;
    outTime: string | null;
    manualExtraHours: number;
}

export default function AttendancePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [empsRes, attendanceRes] = await Promise.all([
                fetch("/api/employees?active=true").then((res) => res.json()),
                fetch(`/api/attendance?date=${selectedDate}`).then((res) => res.json()),
            ]);

            setEmployees(empsRes);

            // Build entries from existing records or empty
            const newEntries: Record<string, AttendanceEntry> = {};
            empsRes.forEach((emp: Employee) => {
                const record = attendanceRes.find(
                    (r: AttendanceRecord) => r.employeeId === emp.id
                );
                newEntries[emp.id] = {
                    employeeId: emp.id,
                    inTime: record?.inTime || "",
                    outTime: record?.outTime || "",
                };
            });

            setEntries(newEntries);
            setLoading(false);
        };

        fetchData();
    }, [selectedDate]);

    const updateEntry = (
        empId: string,
        field: keyof AttendanceEntry,
        value: string
    ) => {
        setEntries((prev) => ({
            ...prev,
            [empId]: { ...prev[empId], [field]: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSavedMessage("");

        const records = Object.values(entries).map((entry) => {
            const wh = calculateWorkHours(entry.inTime || null, entry.outTime || null);
            const extra = Math.max(0, Math.round((wh - 12) * 100) / 100);
            return {
                employeeId: entry.employeeId,
                inTime: entry.inTime || null,
                outTime: entry.outTime || null,
                manualExtraHours: extra,
            };
        });

        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: selectedDate, records }),
            });

            if (res.ok) {
                setSavedMessage("✓ Attendance saved successfully!");
                setTimeout(() => setSavedMessage(""), 3000);
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
            setSavedMessage("✗ Error saving attendance");
        }
        setSaving(false);
    };

    const navigateDate = (direction: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + direction);
        setSelectedDate(d.toISOString().split("T")[0]);
    };

    const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Daily Attendance
                    </h1>
                    <p className="mt-1 text-slate-400">
                        Record In/Out times for all employees
                    </p>
                </div>
            </div>

            {/* Date Selector */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardContent className="flex items-center gap-4 p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateDate(-1)}
                        className="text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-1 items-center gap-4">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-44 border-white/10 bg-white/5 text-white [color-scheme:dark]"
                        />
                        <span className="text-sm font-medium text-slate-300">
                            {formattedDate}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateDate(1)}
                        className="text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {savedMessage && (
                            <span
                                className={`text-sm font-medium ${savedMessage.startsWith("✓")
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                    }`}
                            >
                                {savedMessage}
                            </span>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Saving..." : "Save All"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Entry Table */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <CalendarCheck className="h-5 w-5 text-violet-400" />
                        Attendance Entry
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {employees.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <CalendarCheck className="mx-auto mb-3 h-12 w-12 text-slate-600" />
                            <p className="text-lg font-medium">No active employees</p>
                            <p className="text-sm">
                                Add employees first on the Employees page.
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
                                        <TableHead className="w-36 text-slate-400">
                                            In Time
                                        </TableHead>
                                        <TableHead className="w-36 text-slate-400">
                                            Out Time
                                        </TableHead>
                                        <TableHead className="w-28 text-slate-400">
                                            Extra Hrs
                                        </TableHead>
                                        <TableHead className="text-slate-400">Work Hrs</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((emp) => {
                                        const entry = entries[emp.id];
                                        if (!entry) return null;
                                        const workHours = calculateWorkHours(
                                            entry.inTime || null,
                                            entry.outTime || null
                                        );
                                        const extraHours = Math.max(0, Math.round((workHours - 12) * 100) / 100);
                                        const status = deriveStatus(
                                            workHours,
                                            entry.inTime || null,
                                            entry.outTime || null
                                        );

                                        const statusColors: Record<string, string> = {
                                            Present:
                                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                            "Half Day":
                                                "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                            "Short Day":
                                                "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                            Absent:
                                                "bg-rose-500/10 text-rose-400 border-rose-500/20",
                                        };

                                        return (
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
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={entry.inTime}
                                                        onChange={(e) =>
                                                            updateEntry(emp.id, "inTime", e.target.value)
                                                        }
                                                        className="h-9 border-white/10 bg-white/5 text-white [color-scheme:dark]"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={entry.outTime}
                                                        onChange={(e) =>
                                                            updateEntry(emp.id, "outTime", e.target.value)
                                                        }
                                                        className="h-9 border-white/10 bg-white/5 text-white [color-scheme:dark]"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-center">
                                                    <span className={extraHours > 0 ? "text-violet-400 font-medium" : "text-slate-500"}>
                                                        {extraHours > 0 ? `+${extraHours}h` : "0"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-slate-300">
                                                    {formatHours(workHours)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={statusColors[status]}
                                                    >
                                                        {status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
