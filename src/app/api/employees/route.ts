import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/employees — list all employees
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active");

    const employees = await prisma.employee.findMany({
        where: activeOnly === "true" ? { isActive: true } : undefined,
        orderBy: { id: "asc" },
    });

    return NextResponse.json(employees);
}

// POST /api/employees — create a new employee
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, shift, hourlyRate } = body;

        if (!id || !name || !shift || hourlyRate === undefined) {
            return NextResponse.json(
                { error: "All fields are required: id, name, shift, hourlyRate" },
                { status: 400 }
            );
        }

        const existing = await prisma.employee.findUnique({ where: { id } });
        if (existing) {
            return NextResponse.json(
                { error: `Employee with ID "${id}" already exists` },
                { status: 409 }
            );
        }

        const employee = await prisma.employee.create({
            data: {
                id,
                name,
                shift,
                hourlyRate: parseFloat(hourlyRate),
            },
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error("Error creating employee:", error);
        return NextResponse.json(
            { error: "Failed to create employee" },
            { status: 500 }
        );
    }
}
