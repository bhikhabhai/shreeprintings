"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { useSession } from "@/components/session-provider";

interface AttendanceRow {
    date: string;
    inTime: string | null;
    outTime: string | null;
    workHours: number;
    status: string;
}

export default function MyAttendancePage() {
    const session = useSession();
    const [records, setRecords] = useState<AttendanceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    useEffect(() => {
        if (!session?.employeeId) return;

        const [year, m] = month.split("-");
        setLoading(true);

        fetch(`/api/my-attendance?employeeId=${session.employeeId}&month=${m}&year=${year}`)
            .then((r) => r.json())
            .then((data) => {
                setRecords(data.records || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [session, month]);

    const statusColor = (status: string) => {
        if (status === "Present") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (status === "Half Day") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (status === "Short Day") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    };

    const presentDays = records.filter((r) => r.status === "Present").length;
    const totalHours = records.reduce((acc, r) => acc + r.workHours, 0);

    if (!session) {
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
                    <h1 className="text-2xl font-bold tracking-tight text-white">My Attendance</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Employee ID: <span className="text-violet-400 font-medium">{session.employeeId}</span>
                    </p>
                </div>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-violet-400" />
                            Days Present
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-white">{presentDays}</p>
                    </CardContent>
                </Card>
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-teal-400" />
                            Total Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</p>
                    </CardContent>
                </Card>
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm col-span-2 sm:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            Avg Hours / Day
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-white">
                            {presentDays > 0 ? (totalHours / presentDays).toFixed(1) : "0"}h
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400 font-medium">Date</TableHead>
                                    <TableHead className="text-slate-400 font-medium">In Time</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Out Time</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Work Hours</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                                            <div className="flex justify-center">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : records.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                                            No records found for this month
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.map((r) => (
                                        <TableRow key={r.date} className="border-white/5 hover:bg-white/5">
                                            <TableCell className="text-white font-medium">
                                                {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" })}
                                            </TableCell>
                                            <TableCell className="text-slate-300">{r.inTime || "—"}</TableCell>
                                            <TableCell className="text-slate-300">{r.outTime || "—"}</TableCell>
                                            <TableCell className="text-slate-300">{r.workHours > 0 ? `${r.workHours}h` : "—"}</TableCell>
                                            <TableCell>
                                                <Badge className={`border text-xs ${statusColor(r.status)}`}>
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
