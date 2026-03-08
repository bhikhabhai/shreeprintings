"use client";

import { useState, useRef } from "react";
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
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Users,
    CalendarCheck,
} from "lucide-react";

interface ImportResult {
    employeesCreated: number;
    employeesUpdated: number;
    attendanceRecords: number;
    sheetName: string;
    errors: string[];
}

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setResult(null);
            setError("");
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        setError("");
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
            } else {
                setError(data.error || "Import failed");
            }
        } catch (err) {
            setError("Failed to upload file: " + String(err));
        }

        setImporting(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.name.endsWith(".xlsx")) {
            setFile(dropped);
            setResult(null);
            setError("");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Import Data
                </h1>
                <p className="mt-1 text-slate-400">
                    Upload an Excel file (.xlsx) to import employee and attendance data
                </p>
            </div>

            {/* Upload Zone */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                        Upload Excel File
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 px-6 py-16 transition-colors hover:border-violet-500/30 hover:bg-white/10"
                    >
                        <Upload className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="mb-2 text-lg font-medium text-white">
                            {file ? file.name : "Drag & drop your .xlsx file here"}
                        </p>
                        {file ? (
                            <p className="text-sm text-slate-400">
                                {(file.size / 1024).toFixed(1)} KB — Ready to import
                            </p>
                        ) : (
                            <p className="text-sm text-slate-400">
                                or click below to browse
                            </p>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div className="mt-6 flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full sm:w-auto border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Browse Files
                            </Button>

                            <Button
                                onClick={handleImport}
                                disabled={!file || importing}
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {importing ? "Importing..." : "Import Data"}
                            </Button>
                        </div>
                    </div>

                    {/* Format Hint */}
                    <div className="mt-6 rounded-lg border border-white/5 bg-white/5 p-4">
                        <p className="text-sm font-medium text-slate-300">
                            Expected Excel format:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-slate-400">
                            <li>
                                • Sheet name must include month and year (e.g.,{" "}
                                <code className="text-violet-400">Jan2026</code>,{" "}
                                <code className="text-violet-400">Feb2026</code>)
                            </li>
                            <li>
                                • Row 1: Headers — Emp ID, Emp Name, Shift, Hourly Rate, then
                                date headers
                            </li>
                            <li>
                                • Row 2: Sub-headers — In Time, Out Time, Work Hours, Overtime,
                                Status (per date)
                            </li>
                            <li>• Row 3+: Employee data</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Card className="border-rose-500/20 bg-rose-500/10">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertCircle className="h-5 w-5 text-rose-400" />
                        <p className="text-rose-300">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Import Results */}
            {result && (
                <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            Import Successful
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Stats */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {result.employeesCreated + result.employeesUpdated}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Employees ({result.employeesCreated} new,{" "}
                                            {result.employeesUpdated} updated)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                        <CalendarCheck className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {result.attendanceRecords}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Attendance Records Imported
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                                        <FileSpreadsheet className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white">
                                            {result.sheetName}
                                        </p>
                                        <p className="text-xs text-slate-400">Sheet Processed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Errors if any */}
                        {result.errors.length > 0 && (
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="mb-2 font-medium text-amber-400">
                                    ⚠ {result.errors.length} warning(s):
                                </p>
                                <div className="max-h-40 overflow-auto">
                                    <Table>
                                        <TableBody>
                                            {result.errors.map((err, i) => (
                                                <TableRow
                                                    key={i}
                                                    className="border-amber-500/10 hover:bg-amber-500/5"
                                                >
                                                    <TableCell className="py-1 text-sm text-amber-300">
                                                        {err}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
