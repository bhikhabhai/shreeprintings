import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { decodeSession } from "@/lib/session";
import { calculateWorkHours, deriveStatus } from "@/lib/calculations";

export async function GET(request: NextRequest) {
    const token = request.cookies.get("auth_token");
    const session = token ? decodeSession(token.value) : null;

    if (!session || session.role !== "EMPLOYEE" || !session.employeeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year) {
        return NextResponse.json({ error: "month and year are required" }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const rawRecords = await prisma.attendanceRecord.findMany({
        where: {
            employeeId: session.employeeId,
            date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
    });

    const records = rawRecords.map((r) => {
        const workHours = calculateWorkHours(r.inTime, r.outTime);
        const status = deriveStatus(workHours, r.inTime, r.outTime);
        return {
            date: r.date.toISOString(),
            inTime: r.inTime,
            outTime: r.outTime,
            workHours,
            status,
        };
    });

    return NextResponse.json({ records });
}
