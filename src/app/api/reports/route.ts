import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
    calculateWorkHours,
    deriveStatus,
    calculatePayableHours,
    calculateTotalPay,
} from "@/lib/calculations";

// GET /api/reports?month=3&year=2026 — monthly salary report
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year) {
        return NextResponse.json(
            { error: "month and year query params are required" },
            { status: 400 }
        );
    }

    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month
    const totalDaysInMonth = endDate.getDate();

    // Get all active employees
    const employees = await prisma.employee.findMany({
        where: { isActive: true },
        orderBy: { id: "asc" },
    });

    // Get all attendance records for this month
    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    // Build report for each employee
    const report = employees.map((emp) => {
        const empRecords = attendanceRecords.filter(
            (r) => r.employeeId === emp.id
        );

        let presentDays = 0;
        let halfDays = 0;
        let shortDays = 0;
        let absentDays = 0;
        let totalWorkHours = 0;
        let totalExtraHours = 0;

        // Process each record
        empRecords.forEach((record) => {
            const workHours = calculateWorkHours(record.inTime, record.outTime);
            const status = deriveStatus(workHours, record.inTime, record.outTime);

            switch (status) {
                case "Present":
                    presentDays++;
                    break;
                case "Half Day":
                    halfDays++;
                    break;
                case "Short Day":
                    shortDays++;
                    break;
                case "Absent":
                    absentDays++;
                    break;
            }

            totalWorkHours += workHours;
            totalExtraHours += record.manualExtraHours;
        });

        // Days without records = absent
        const recordedDays = empRecords.length;
        const unrecordedDays = totalDaysInMonth - recordedDays;
        absentDays += unrecordedDays;

        const totalPayableHours = calculatePayableHours(
            totalWorkHours,
            totalExtraHours
        );
        const totalPay = calculateTotalPay(totalPayableHours, emp.hourlyRate);

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            shift: emp.shift,
            hourlyRate: emp.hourlyRate,
            totalDays: totalDaysInMonth,
            presentDays,
            halfDays,
            shortDays,
            absentDays,
            totalWorkHours: Math.round(totalWorkHours * 100) / 100,
            totalExtraHours: Math.round(totalExtraHours * 100) / 100,
            totalPayableHours,
            totalPay,
        };
    });

    return NextResponse.json({
        month,
        year,
        totalDaysInMonth,
        report,
    });
}
