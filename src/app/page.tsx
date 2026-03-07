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
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { calculateWorkHours, deriveStatus, formatHours } from "@/lib/calculations";

interface Employee {
  id: string;
  name: string;
  shift: string;
  hourlyRate: number;
  isActive: boolean;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  inTime: string | null;
  outTime: string | null;
  manualExtraHours: number;
  employee: Employee;
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      fetch("/api/employees?active=true").then((r) => r.json()),
      fetch(`/api/attendance?date=${today}`).then((r) => r.json()),
    ]).then(([emps, records]) => {
      setEmployees(emps);
      setTodayRecords(records);
      setLoading(false);
    });
  }, []);

  const totalEmployees = employees.length;
  const presentToday = todayRecords.filter((r) => {
    const wh = calculateWorkHours(r.inTime, r.outTime);
    return deriveStatus(wh, r.inTime, r.outTime) !== "Absent";
  }).length;
  const absentToday = totalEmployees - presentToday;

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      gradient: "from-violet-500 to-indigo-600",
      shadow: "shadow-violet-500/25",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: UserCheck,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    {
      title: "Absent Today",
      value: absentToday,
      icon: UserX,
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/25",
    },
    {
      title: "Avg Work Hrs",
      value:
        todayRecords.length > 0
          ? (
            todayRecords.reduce(
              (sum, r) => sum + calculateWorkHours(r.inTime, r.outTime),
              0
            ) / todayRecords.length
          ).toFixed(1) + "h"
          : "—",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/25",
    },
  ];

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-400">{dateStr}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Attendance Table */}
      <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Today&apos;s Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="mx-auto mb-3 h-12 w-12 text-slate-600" />
              <p className="text-lg font-medium">No employees yet</p>
              <p className="text-sm">
                Go to the Employees page to add your first employee.
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
                    <TableHead className="text-slate-400">In Time</TableHead>
                    <TableHead className="text-slate-400">Out Time</TableHead>
                    <TableHead className="text-slate-400">Work Hrs</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const record = todayRecords.find(
                      (r) => r.employeeId === emp.id
                    );
                    const workHours = record
                      ? calculateWorkHours(record.inTime, record.outTime)
                      : 0;
                    const status = record
                      ? deriveStatus(workHours, record.inTime, record.outTime)
                      : "Absent";

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
                        <TableCell className="text-slate-300">
                          {emp.shift}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-300">
                          {record?.inTime || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-300">
                          {record?.outTime || "—"}
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
