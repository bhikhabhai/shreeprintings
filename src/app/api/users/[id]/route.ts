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

// PUT /api/users/[id] — update user
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { username, password, role, employeeId, email } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (email !== undefined) updateData.email = email || null;
    if (employeeId !== undefined) updateData.employeeId = employeeId || null;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ id: user.id, username: user.username, role: user.role });
}

// DELETE /api/users/[id] — delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
