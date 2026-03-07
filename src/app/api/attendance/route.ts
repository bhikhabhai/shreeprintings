import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/attendance — fetch attendance records
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");

    const where: Record<string, unknown> = {};

    if (date) {
        where.date = new Date(date);
    }

    if (employeeId) {
        where.employeeId = employeeId;
    }

    const records = await prisma.attendanceRecord.findMany({
        where,
        include: { employee: true },
        orderBy: [{ employee: { id: "asc" } }],
    });

    return NextResponse.json(records);
}

// POST /api/attendance — bulk upsert attendance for a given date
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, records } = body;

        if (!date || !records || !Array.isArray(records)) {
            return NextResponse.json(
                { error: "date and records array are required" },
                { status: 400 }
            );
        }

        const dateObj = new Date(date);

        const results = await Promise.all(
            records.map(
                async (record: {
                    employeeId: string;
                    inTime: string | null;
                    outTime: string | null;
                    manualExtraHours: number;
                }) => {
                    return prisma.attendanceRecord.upsert({
                        where: {
                            employeeId_date: {
                                employeeId: record.employeeId,
                                date: dateObj,
                            },
                        },
                        update: {
                            inTime: record.inTime || null,
                            outTime: record.outTime || null,
                            manualExtraHours: record.manualExtraHours || 0,
                        },
                        create: {
                            employeeId: record.employeeId,
                            date: dateObj,
                            inTime: record.inTime || null,
                            outTime: record.outTime || null,
                            manualExtraHours: record.manualExtraHours || 0,
                        },
                    });
                }
            )
        );

        return NextResponse.json(results, { status: 201 });
    } catch (error) {
        console.error("Error saving attendance:", error);
        return NextResponse.json(
            { error: "Failed to save attendance" },
            { status: 500 }
        );
    }
}
