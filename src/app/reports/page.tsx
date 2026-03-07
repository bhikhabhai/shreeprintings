"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileBarChart, TrendingUp, IndianRupee } from "lucide-react";
import { formatHours } from "@/lib/calculations";

interface ReportEntry {
    employeeId: string;
    employeeName: string;
    shift: string;
    hourlyRate: number;
    totalDays: number;
    presentDays: number;
    halfDays: number;
    shortDays: number;
    absentDays: number;
    totalWorkHours: number;
    totalExtraHours: number;
    totalPayableHours: number;
    totalPay: number;
}

interface ReportData {
    month: number;
    year: number;
    totalDaysInMonth: number;
    report: ReportEntry[];
}

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function ReportsPage() {
    const now = new Date();
    const [month, setMonth] = useState((now.getMonth() + 1).toString());
    const [year, setYear] = useState(now.getFullYear().toString());
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/reports?month=${month}&year=${year}`
            );
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error("Error generating report:", error);
        }
        setLoading(false);
    };

    const totalPayroll = report
        ? report.report.reduce((sum, r) => sum + r.totalPay, 0)
        : 0;

    const totalWorkHrs = report
        ? report.report.reduce((sum, r) => sum + r.totalWorkHours, 0)
        : 0;

    const years = [];
    for (let y = 2024; y <= 2030; y++) {
        years.push(y.toString());
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Monthly Reports
                </h1>
                <p className="mt-1 text-slate-400">
                    Generate salary reports and attendance summaries
                </p>
            </div>

            {/* Controls */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardContent className="flex flex-wrap items-end gap-4 p-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400">Month</label>
                        <Select value={month} onValueChange={(v: string | null) => setMonth(v || month)}>
                            <SelectTrigger className="w-40 border-white/10 bg-white/5 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-slate-800">
                                {MONTHS.map((m, i) => (
                                    <SelectItem key={i} value={(i + 1).toString()}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400">Year</label>
                        <Select value={year} onValueChange={(v: string | null) => setYear(v || year)}>
                            <SelectTrigger className="w-28 border-white/10 bg-white/5 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-slate-800">
                                {years.map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={generateReport}
                        disabled={loading}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                    >
                        <FileBarChart className="mr-2 h-4 w-4" />
                        {loading ? "Generating..." : "Generate Report"}
                    </Button>
                </CardContent>
            </Card>

            {/* Report */}
            {report && (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-6 sm:grid-cols-3">
                        <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">
                                            Total Payroll
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-white">
                                            ₹{totalPayroll.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                                        <IndianRupee className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">
                                            Total Work Hours
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-white">
                                            {formatHours(totalWorkHrs)}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">
                                            Report Period
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-white">
                                            {MONTHS[report.month - 1]} {report.year}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {report.totalDaysInMonth} days
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                                        <FileBarChart className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Report Table */}
                    <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Salary Report — {MONTHS[report.month - 1]} {report.year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {report.report.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <FileBarChart className="mx-auto mb-3 h-12 w-12 text-slate-600" />
                                    <p className="text-lg font-medium">No data available</p>
                                    <p className="text-sm">
                                        No active employees found for this period.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-auto rounded-lg border border-white/5">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/5 hover:bg-transparent">
                                                <TableHead className="text-slate-400">
                                                    Emp ID
                                                </TableHead>
                                                <TableHead className="text-slate-400">Name</TableHead>
                                                <TableHead className="text-slate-400">Shift</TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Total Days
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Present
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Half Day
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Absent
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Work Hrs
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Extra Hrs
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Payable Hrs
                                                </TableHead>
                                                <TableHead className="text-center text-slate-400">
                                                    Rate (₹/hr)
                                                </TableHead>
                                                <TableHead className="text-right text-slate-400">
                                                    Total Pay
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {report.report.map((entry) => (
                                                <TableRow
                                                    key={entry.employeeId}
                                                    className="border-white/5 hover:bg-white/5"
                                                >
                                                    <TableCell className="font-mono text-sm text-slate-300">
                                                        {entry.employeeId}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-white">
                                                        {entry.employeeName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                entry.shift === "Day"
                                                                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                                                    : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                                                            }
                                                        >
                                                            {entry.shift}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-300">
                                                        {entry.totalDays}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-medium text-emerald-400">
                                                            {entry.presentDays}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-amber-400">
                                                            {entry.halfDays}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-rose-400">
                                                            {entry.absentDays}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono text-sm text-slate-300">
                                                        {entry.totalWorkHours.toFixed(1)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono text-sm text-violet-400">
                                                        {entry.totalExtraHours.toFixed(1)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono text-sm font-medium text-white">
                                                        {entry.totalPayableHours.toFixed(1)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono text-sm text-slate-300">
                                                        ₹{entry.hourlyRate}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-mono text-lg font-bold text-emerald-400">
                                                            ₹{entry.totalPay.toLocaleString("en-IN")}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Total Row */}
                                            <TableRow className="border-white/10 bg-white/5 hover:bg-white/10">
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-right text-lg font-bold text-white"
                                                >
                                                    TOTAL
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-bold text-white">
                                                    {totalWorkHrs.toFixed(1)}
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-bold text-violet-400">
                                                    {report.report
                                                        .reduce((s, r) => s + r.totalExtraHours, 0)
                                                        .toFixed(1)}
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-bold text-white">
                                                    {report.report
                                                        .reduce((s, r) => s + r.totalPayableHours, 0)
                                                        .toFixed(1)}
                                                </TableCell>
                                                <TableCell />
                                                <TableCell className="text-right">
                                                    <span className="font-mono text-xl font-bold text-emerald-400">
                                                        ₹{totalPayroll.toLocaleString("en-IN")}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
