import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { decodeSession } from "@/lib/session";

function requireAdmin(request: NextRequest) {
    const token = request.cookies.get("auth_token");
    if (!token) return null;
    const session = decodeSession(token.value);
    if (!session || session.role !== "SUPER_ADMIN") return null;
    return session;
}

// GET /api/users — list all users (SUPER_ADMIN only)
export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            username: true,
            role: true,
            email: true,
            employeeId: true,
            createdAt: true,
            employee: { select: { name: true } },
        },
    });

    return NextResponse.json(users);
}

// POST /api/users — create user (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { username, password, role, employeeId, email } = await request.json();

        if (!username || !password || !role) {
            return NextResponse.json({ error: "username, password, role required" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                role,
                email: email || null,
                employeeId: employeeId || null,
            },
        });

        return NextResponse.json(
            { id: user.id, username: user.username, role: user.role, employeeId: user.employeeId },
            { status: 201 }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
