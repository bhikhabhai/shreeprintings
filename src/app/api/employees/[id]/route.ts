import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/employees/[id] — get single employee
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
        where: { id },
        include: { attendance: true },
    });

    if (!employee) {
        return NextResponse.json(
            { error: "Employee not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(employee);
}

// PUT /api/employees/[id] — update employee
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, shift, hourlyRate, monthlySalary, isActive } = body;

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(shift !== undefined && { shift }),
                ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
                ...(monthlySalary !== undefined && {
                    monthlySalary: monthlySalary === null || monthlySalary === "" ? null : parseFloat(monthlySalary),
                }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Error updating employee:", error);
        return NextResponse.json(
            { error: "Failed to update employee" },
            { status: 500 }
        );
    }
}

// DELETE /api/employees/[id] — soft-delete OR permanently delete employee
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const permanent = request.nextUrl.searchParams.get("permanent") === "true";

        if (permanent) {
            // Hard delete: remove attendance records first, then employee
            await prisma.attendanceRecord.deleteMany({ where: { employeeId: id } });
            await prisma.employee.delete({ where: { id } });
            return NextResponse.json({ success: true, deleted: id });
        }

        // Soft delete: mark as inactive
        const employee = await prisma.employee.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Error deleting employee:", error);
        return NextResponse.json(
            { error: "Failed to delete employee" },
            { status: 500 }
        );
    }
}
